jest.mock('../../src/services/auth.service', () => ({
  register: jest.fn(async () => ({ id: 1, email: 'demo@demo.local' })),
  login: jest.fn(async () => ({ requires_2fa: true, user_id: 1, delivery_channel: 'console' })),
  adminLogin: jest.fn(async () => ({ requires_2fa: true, user_id: 1, delivery_channel: 'console' })),
  verifyTwoFactor: jest.fn(async () => ({ token: 'jwt', usuario: { id: 1 } })),
  resendTwoFactor: jest.fn(async () => ({ requires_2fa: true, user_id: 1 })),
  forgotPassword: jest.fn(),
  validateResetPasswordToken: jest.fn(async () => ({ valid: true })),
  resetPassword: jest.fn(),
  requestInstitutionalCode: jest.fn(async () => ({ success: true })),
  verifyInstitutionalCode: jest.fn(async () => ({ success: true }))
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

describe('Auth routes', () => {
  test('health endpoint works', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('register endpoint is wired', async () => {
    const response = await request(app).post('/api/auth/register').send({
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      email: 'juan@demo.local',
      password: 'Seguro123*',
      confirm_password: 'Seguro123*',
      codigo_institucional: 'EST-2026-000001',
      rol_id: 3
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('forgot password route is wired', async () => {
    const response = await request(app).post('/api/auth/forgot-password').send({ email: 'demo@demo.local' });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('request institutional code route is wired', async () => {
    const response = await request(app).post('/api/auth/request-institutional-code').send({ email: 'demo@demo.local', rol_id: 3 });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
