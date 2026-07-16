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
  createAndSend: jest.fn(),
  verifyCode: jest.fn(),
  resendCode: jest.fn()
}));

jest.mock('../../src/services/password-reset.service', () => ({
  requestPasswordReset: jest.fn(),
  validateResetToken: jest.fn(),
  resetPassword: jest.fn()
}));

jest.mock('../../src/services/institutional-code.service', () => ({
  requestInstitutionalCode: jest.fn(),
  verifyInstitutionalCode: jest.fn()
}));

const request = require('supertest');
const app = require('../../src/app');

describe('Load test', () => {
  test('handles 1000 login requests without crashing', async () => {
    const requests = Array.from({ length: 1000 }, () =>
      request(app).post('/api/auth/login').send({
        email: "' OR '1'='1",
        password: 'invalid'
      })
    );

    const responses = await Promise.all(requests);
    const statusCounts = responses.reduce((acc, response) => {
      acc[response.status] = (acc[response.status] || 0) + 1;
      return acc;
    }, {});

    expect(responses).toHaveLength(1000);
    expect(statusCounts[400] || 0).toBeGreaterThan(0);
    expect(statusCounts[429] || 0).toBeGreaterThan(0);
    expect(statusCounts[500] || 0).toBe(0);
  }, 120000);
});
