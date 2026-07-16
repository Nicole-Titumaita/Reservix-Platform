jest.mock('../../src/config/db', () => ({
  pool: {
    getConnection: jest.fn()
  }
}));

jest.mock('../../src/models', () => ({
  institutionalCodes: {
    invalidateActiveByEmailAndRole: jest.fn(),
    markUsed: jest.fn(),
    incrementAttempts: jest.fn()
  },
  roles: {
    findById: jest.fn()
  },
  auditoria: {
    create: jest.fn()
  }
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(async () => true)
  }))
}));

const db = require('../../src/config/db');
const { institutionalCodes, roles, auditoria } = require('../../src/models');
const service = require('../../src/services/institutional-code.service');

describe('institutional-code.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.pool.getConnection.mockResolvedValue({
      beginTransaction: jest.fn(async () => {}),
      query: jest.fn(async (sql) => {
        if (String(sql).includes('SELECT id, next_sequence')) return [[]];
        if (String(sql).includes('INSERT INTO institutional_code_sequences')) return [{ insertId: 1 }];
        if (String(sql).includes('INSERT INTO institutional_codes')) return [{ insertId: 7 }];
        if (String(sql).includes('UPDATE institutional_code_sequences')) return [{ affectedRows: 1 }];
        return [[]];
      }),
      commit: jest.fn(async () => {}),
      rollback: jest.fn(async () => {}),
      release: jest.fn()
    });
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
  });

  test('generates a role-based institutional code', async () => {
    const result = await service.requestInstitutionalCode({ email: 'test@demo.local', rol_id: 3 });
    expect(result.success).toBe(true);
    expect(result.data.role).toBe('ESTUDIANTE');
    expect(institutionalCodes.invalidateActiveByEmailAndRole).toHaveBeenCalled();
    expect(auditoria.create).toHaveBeenCalled();
  });

  test('verifies an institutional code path with attempts control mocked', async () => {
    institutionalCodes.findLatestActiveByEmailAndRole = jest.fn().mockResolvedValue({
      id: 7,
      code_hash: '$2a$10$zJxLrD0rN9l8oW7fQ5dJEu3w5M4wqXg2Vw0b5vX9u7u4Yk7tN0m0K',
      attempts: 0,
      code_display: 'EST-2026-000001'
    });

    await expect(service.verifyInstitutionalCode({
      email: 'test@demo.local',
      rol_id: 3,
      code: 'EST-2026-000001'
    })).rejects.toThrow();
  });
});
