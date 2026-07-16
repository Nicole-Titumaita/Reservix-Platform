jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => '$2a$10$mockhash'),
  compare: jest.fn(async () => true)
}));

jest.mock('../../src/models', () => ({
  usuarios: {
    findByEmail: jest.fn(),
    findByCedula: jest.fn(),
    findByCodigoInstitucional: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn()
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
  createAndSend: jest.fn(async () => ({
    requires_2fa: true,
    user_id: 1,
    delivery_channel: 'console'
  })),
  verifyCode: jest.fn(async () => ({
    id: 1,
    email: 'admin@demo.local',
    rol_id: 1,
    rol_nombre: 'ADMINISTRADOR',
    estado_id: 1,
    nombre: 'Admin',
    apellido: 'Demo'
  })),
  resendCode: jest.fn()
}));

const { usuarios, estados, roles, loginAttempts, institutionalCodes } = require('../../src/models');
const authService = require('../../src/services/auth.service');

describe('Auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registers a user only if institutional code was validated', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findByName.mockResolvedValue({ id: 1 });
    usuarios.findByEmail.mockResolvedValue(null);
    usuarios.findByCedula.mockResolvedValue(null);
    usuarios.findByCodigoInstitucional.mockResolvedValue(null);
    institutionalCodes.findLatestActiveByEmailAndRole.mockResolvedValue({
      id: 9,
      code_hash: '$2a$10$mockhash',
      code_display: 'EST-2026-000001',
      attempts: 0
    });
    usuarios.create.mockImplementation(async (data) => ({ id: 10, ...data }));

    const result = await authService.register({
      rol_id: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      cedula_provincia: 'Pichincha',
      email: 'JUAN@DEMO.LOCAL',
      password: 'Seguro123*',
      confirm_password: 'Seguro123*',
      telefono: '',
      codigo_institucional: 'EST-2026-000001'
    });

    expect(result.email).toBe('juan@demo.local');
    expect(institutionalCodes.markUsed).toHaveBeenCalledWith(9);
  });

  test('blocks login after repeated failures', async () => {
    loginAttempts.countRecentFailures.mockResolvedValue(5);

    await expect(authService.login({ email: 'demo@demo.local', password: 'abc12345' }, { endpoint: 'login', ip: '127.0.0.1' }))
      .rejects
      .toThrow(/Demasiados intentos/i);
  });

  test('rejects admin login for non-admin role', async () => {
    loginAttempts.countRecentFailures.mockResolvedValue(0);
    usuarios.findByEmail.mockResolvedValue({
      id: 1,
      password_hash: '$2a$10$mockhash',
      rol_nombre: 'ESTUDIANTE',
      estado_nombre: 'ACTIVO'
    });

    await expect(authService.adminLogin({ email: 'est@demo.local', password: 'Seguro123*' }, { endpoint: 'admin-login', ip: '127.0.0.1' }))
      .rejects
      .toThrow(/Acceso no autorizado/i);
  });
});
