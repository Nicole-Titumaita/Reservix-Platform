jest.mock('../../src/models', () => ({
  recursos: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findById: jest.fn(),
    findByCodigo: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  },
  espacios: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findById: jest.fn(),
    findByCodigo: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  },
  estados: { findById: jest.fn() }
}));

jest.mock('../../src/utils/audit', () => ({ recordAudit: jest.fn() }));

const { recursos, espacios, estados } = require('../../src/models');
const recursosService = require('../../src/services/recursos.service');
const espaciosService = require('../../src/services/espacios.service');

describe('resources and spaces services', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a space and rejects duplicate code', async () => {
    estados.findById.mockResolvedValue({ id: 1 });
    espacios.findByCodigo.mockResolvedValue(null);
    espacios.create.mockResolvedValue({ id: 1, codigo: 'LAB-01', nombre: 'Lab' });

    const created = await espaciosService.create({ estado_id: 1, codigo: 'LAB-01', nombre: 'Lab', tipo: 'LAB' });
    expect(created.codigo).toBe('LAB-01');
    espacios.findByCodigo.mockResolvedValue({ id: 2 });
    await expect(espaciosService.create({ estado_id: 1, codigo: 'LAB-01', nombre: 'Lab', tipo: 'LAB' })).rejects.toThrow(/codigo/i);
  });

  it('creates a resource and validates space existence', async () => {
    estados.findById.mockResolvedValue({ id: 1 });
    espacios.findById.mockResolvedValue({ id: 2 });
    recursos.findByCodigo.mockResolvedValue(null);
    recursos.create.mockResolvedValue({ id: 3, codigo: 'REC-01', nombre: 'Proyector' });

    const created = await recursosService.create({ estado_id: 1, espacio_id: 2, codigo: 'REC-01', nombre: 'Proyector', tipo: 'EQUIPO' });
    expect(created.codigo).toBe('REC-01');
  });
});
