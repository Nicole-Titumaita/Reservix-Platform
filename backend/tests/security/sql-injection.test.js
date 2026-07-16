jest.mock('../../src/models', () => ({
  usuarios: {
    findByEmail: jest.fn(),
    findByCedula: jest.fn(),
    findByCodigoInstitucional: jest.fn(),
    create: jest.fn(),
    findById: jest.fn()
  },
  estados: {
    findByName: jest.fn(),
    findById: jest.fn()
  },
  roles: {
    findById: jest.fn(),
    findByName: jest.fn()
  },
  loginAttempts: {
    countRecentFailures: jest.fn(),
    create: jest.fn()
  },
  auditoria: {
    create: jest.fn()
  },
  institutionalCodes: {
    findLatestActiveByEmailAndRole: jest.fn(),
    incrementAttempts: jest.fn(),
    markUsed: jest.fn()
  }
}));

jest.mock('../../src/services/two-factor.service', () => ({
  createAndSend: jest.fn(async () => ({ requires_2fa: true, user_id: 1, delivery_channel: 'console' })),
  verifyCode: jest.fn(),
  resendCode: jest.fn()
}));

jest.mock('../../src/services/password-reset.service', () => ({
  requestPasswordReset: jest.fn(async () => ({ success: true })),
  validateResetToken: jest.fn(async () => ({ valid: true })),
  resetPassword: jest.fn(async () => ({ success: true }))
}));

jest.mock('../../src/services/institutional-code.service', () => ({
  requestInstitutionalCode: jest.fn(async () => ({ success: true, message: 'Codigo enviado al correo', data: {} })),
  verifyInstitutionalCode: jest.fn(async () => ({ success: true, message: 'Codigo verificado correctamente', data: {} }))
}));

const request = require('supertest');
const app = require('../../src/app');
const { usuarios, estados, roles, loginAttempts, institutionalCodes } = require('../../src/models');

const SQL_PAYLOADS = [
  "' OR '1'='1",
  "admin@demo.local' --",
  "\" OR \"1\"=\"1",
  "test@test.com'; DROP TABLE usuarios; --"
];

function withUniqueIp(index) {
  return { 'X-Forwarded-For': `127.0.0.${index + 1}` };
}

describe('SQL Injection security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    roles.findByName.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findByName.mockResolvedValue({ id: 1 });
    usuarios.findByEmail.mockResolvedValue(null);
    usuarios.findByCedula.mockResolvedValue(null);
    usuarios.findByCodigoInstitucional.mockResolvedValue(null);
    loginAttempts.countRecentFailures.mockResolvedValue(0);
    institutionalCodes.findLatestActiveByEmailAndRole.mockResolvedValue(null);
  });

  test.each(SQL_PAYLOADS.map((payload, index) => [payload, index]))(
    'rejects payload in login email: %s',
    async (payload, index) => {
      const response = await request(app)
        .post('/api/auth/login')
        .set(withUniqueIp(index))
        .send({ email: payload, password: 'Seguro123*' });

      expect(response.status).toBe(400);
      expect(loginAttempts.create).not.toHaveBeenCalled();
    }
  );

  test.each(SQL_PAYLOADS.map((payload, index) => [payload, index]))(
    'rejects payload in login password: %s',
    async (payload, index) => {
      const response = await request(app)
        .post('/api/auth/login')
        .set(withUniqueIp(index + 10))
        .send({ email: 'demo@demo.local', password: payload });

      expect([400, 401]).toContain(response.status);
      expect(loginAttempts.create).toHaveBeenCalled();
    }
  );

  test.each(SQL_PAYLOADS.map((payload, index) => [payload, index]))(
    'rejects payload in admin login email: %s',
    async (payload, index) => {
      const response = await request(app)
        .post('/api/auth/admin-login')
        .set(withUniqueIp(index + 20))
        .send({ email: payload, password: 'Seguro123*' });

      expect(response.status).toBe(400);
    }
  );

  test.each(SQL_PAYLOADS.map((payload, index) => [payload, index]))(
    'rejects payload in register email: %s',
    async (payload, index) => {
      const response = await request(app)
        .post('/api/auth/register')
        .set(withUniqueIp(index + 30))
        .send({
          nombre: 'Juan',
          apellido: 'Perez',
          cedula: '1710034065',
          email: payload,
          password: 'Seguro123*',
          confirm_password: 'Seguro123*',
          codigo_institucional: 'EST-2026-000001',
          rol_id: 3
        });

      expect(response.status).toBe(400);
      expect(usuarios.findByEmail).not.toHaveBeenCalled();
    }
  );

  test.each(SQL_PAYLOADS.map((payload, index) => [payload, index]))(
    'rejects payload in register names: %s',
    async (payload, index) => {
      const response = await request(app)
        .post('/api/auth/register')
        .set(withUniqueIp(index + 40))
        .send({
          nombre: payload,
          apellido: 'Perez',
          cedula: '1710034065',
          email: 'demo@demo.local',
          password: 'Seguro123*',
          confirm_password: 'Seguro123*',
          codigo_institucional: 'EST-2026-000001',
          rol_id: 3
        });

      expect(response.status).toBe(400);
      expect(usuarios.findByEmail).not.toHaveBeenCalled();
    }
  );

  test('does not call register persistence when malicious payload is sent', async () => {
    await request(app)
      .post('/api/auth/register')
      .set(withUniqueIp(99))
      .send({
        nombre: "' OR '1'='1",
        apellido: 'Perez',
        cedula: '1710034065',
        email: 'demo@demo.local',
        password: 'Seguro123*',
        confirm_password: 'Seguro123*',
        codigo_institucional: 'EST-2026-000001',
        rol_id: 3
      });

    expect(usuarios.create).not.toHaveBeenCalled();
  });
});
