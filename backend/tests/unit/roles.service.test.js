jest.mock('../../src/models', () => ({
  roles: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  }
}));

jest.mock('../../src/utils/audit', () => ({ recordAudit: jest.fn() }));

const { roles } = require('../../src/models');
const service = require('../../src/services/roles.service');

describe('roles.service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a role when it does not exist', async () => {
    roles.findByName.mockResolvedValue(null);
    roles.create.mockResolvedValue({ id: 5, nombre: 'COORDINADOR' });
    const created = await service.create({ nombre: 'COORDINADOR' });
    expect(created.nombre).toBe('COORDINADOR');
  });

  it('rejects duplicate role names', async () => {
    roles.findByName.mockResolvedValue({ id: 1, nombre: 'ADMINISTRADOR' });
    await expect(service.create({ nombre: 'ADMINISTRADOR' })).rejects.toThrow(/ya existe/i);
  });
});
