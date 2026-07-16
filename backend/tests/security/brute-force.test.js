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
  createAndSend: jest.fn()
}));

const { loginAttempts } = require('../../src/models');
const authService = require('../../src/services/auth.service');

describe('Brute force protection', () => {
  test('blocks after 5 attempts', async () => {
    loginAttempts.countRecentFailures.mockResolvedValue(5);
    await expect(
      authService.login({ email: 'demo@demo.local', password: 'abc12345' }, { endpoint: 'login', ip: '127.0.0.1' })
    ).rejects.toThrow(/Demasiados intentos/i);
  });
});
