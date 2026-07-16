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
const { loginAttempts } = require('../../src/models');

describe('1000 request load test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginAttempts.countRecentFailures.mockResolvedValue(0);
  });

  test('login endpoint survives 1000 mixed malicious requests', async () => {
    const requests = Array.from({ length: 1000 }, (_, index) =>
      request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', `10.0.0.${index + 1}`)
        .send({
          email: index % 2 === 0 ? "' OR '1'='1" : 'demo@demo.local',
          password: index % 2 === 0 ? 'abc' : "' OR '1'='1"
        })
    );

    const responses = await Promise.all(requests);
    const statusCounts = responses.reduce((acc, response) => {
      acc[response.status] = (acc[response.status] || 0) + 1;
      return acc;
    }, {});

    expect(responses).toHaveLength(1000);
    expect(statusCounts[400] || 0).toBeGreaterThan(0);
    expect(statusCounts[401] || 0).toBeGreaterThan(0);
    expect(statusCounts[429] || 0).toBeGreaterThan(0);
    expect(statusCounts[500] || 0).toBe(0);
  }, 120000);
});
