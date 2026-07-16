jest.mock('../../src/models', () => ({
  usuarios: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByCedula: jest.fn(),
    findByCodigoInstitucional: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  },
  roles: {
    findById: jest.fn(),
    findByName: jest.fn()
  },
  estados: {
    findByName: jest.fn(),
    findById: jest.fn()
  },
  recordAudit: jest.fn()
}));

jest.mock('../../src/utils/audit', () => ({ recordAudit: jest.fn() }));

const { usuarios, roles, estados } = require('../../src/models');
const { recordAudit } = require('../../src/utils/audit');
const service = require('../../src/services/usuarios.service');

describe('usuarios.service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns paginated users when pagination is requested', async () => {
    usuarios.findPaginated.mockResolvedValue({ rows: [{ id: 1 }], total: 1 });

    const result = await service.list({ page: 1, limit: 10 });

    expect(usuarios.findPaginated).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.pagination.total).toBe(1);
  });

  it('returns user by id', async () => {
    usuarios.findById.mockResolvedValue({ id: 7, email: 'a@demo.local' });

    await expect(service.getById(7)).resolves.toEqual({ id: 7, email: 'a@demo.local' });
  });

  it('creates a user and normalizes email/code', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findByName.mockResolvedValue({ id: 1 });
    usuarios.findByEmail.mockResolvedValue(null);
    usuarios.findByCedula.mockResolvedValue(null);
    usuarios.findByCodigoInstitucional.mockResolvedValue(null);
    usuarios.create.mockImplementation(async (data) => ({ id: 10, ...data }));

    const created = await service.create({
      rol_id: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      email: 'JUAN@DEMO.LOCAL',
      password: 'Seguro123*',
      codigo_institucional: 'est-2026-000001'
    });

    expect(created.email).toBe('juan@demo.local');
    expect(created.codigo_institucional).toBe('EST-2026-000001');
  });

  it('generates a temporary password when none is provided', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findByName.mockResolvedValue({ id: 1 });
    usuarios.findByEmail.mockResolvedValue(null);
    usuarios.findByCedula.mockResolvedValue(null);
    usuarios.findByCodigoInstitucional.mockResolvedValue(null);
    usuarios.create.mockImplementation(async (data) => ({ id: 11, ...data }));

    const created = await service.create({
      rol_id: 3,
      nombre: 'Maria',
      apellido: 'Gomez',
      cedula: '1710034065',
      email: 'maria@demo.local'
    });

    expect(created.password_hash).toBeDefined();
    expect(created.password_hash).not.toContain('Seguro123*');
  });

  it('rejects duplicate email on create', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findByName.mockResolvedValue({ id: 1 });
    usuarios.findByEmail.mockResolvedValue({ id: 2 });
    usuarios.findByCedula.mockResolvedValue(null);
    usuarios.findByCodigoInstitucional.mockResolvedValue(null);

    await expect(service.create({
      rol_id: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      email: 'juan@demo.local',
      password: 'Seguro123*',
      codigo_institucional: 'EST-2026-000001'
    })).rejects.toThrow(/correo/i);
  });

  it('rejects duplicate institutional code on create', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findByName.mockResolvedValue({ id: 1 });
    usuarios.findByEmail.mockResolvedValue(null);
    usuarios.findByCedula.mockResolvedValue(null);
    usuarios.findByCodigoInstitucional.mockResolvedValue({ id: 9 });

    await expect(service.create({
      rol_id: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      email: 'juan@demo.local',
      password: 'Seguro123*',
      codigo_institucional: 'EST-2026-000001'
    })).rejects.toThrow(/codigo institucional/i);
  });

  it('rejects duplicate email on update when owned by another user', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findById.mockResolvedValue({ id: 1 });
    usuarios.findById.mockResolvedValue({ id: 1, codigo_institucional: 'EST-2026-000001' });
    usuarios.findByEmail.mockResolvedValue({ id: 2 });
    usuarios.findByCedula.mockResolvedValue(null);

    await expect(service.update(1, {
      rol_id: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      email: 'otro@demo.local',
      codigo_institucional: 'EST-2026-000001'
    })).rejects.toThrow(/correo ya existe/i);
  });

  it('allows update when current email belongs to same user', async () => {
    roles.findById.mockResolvedValue({ id: 3, nombre: 'ESTUDIANTE' });
    estados.findById.mockResolvedValue({ id: 1 });
    usuarios.findById.mockResolvedValue({ id: 1, codigo_institucional: 'EST-2026-000001' });
    usuarios.findByEmail.mockResolvedValue({ id: 1 });
    usuarios.findByCedula.mockResolvedValue({ id: 1 });
    usuarios.findByCodigoInstitucional.mockResolvedValue({ id: 1 });
    usuarios.update.mockResolvedValue({ id: 1, email: 'juan@demo.local', rol_id: 3, estado_id: 1 });

    await expect(service.update(1, {
      rol_id: 3,
      nombre: 'Juan',
      apellido: 'Perez',
      cedula: '1710034065',
      email: 'juan@demo.local',
      codigo_institucional: 'EST-2026-000001',
      estado_id: 1
    })).resolves.toMatchObject({ id: 1 });
  });

  it('removes user and audits the action', async () => {
    usuarios.findById.mockResolvedValue({ id: 5, email: 'remove@demo.local' });
    usuarios.remove.mockResolvedValue(true);

    const removed = await service.remove(5, { actor_id: 1, ip: '127.0.0.1', user_agent: 'jest' });

    expect(removed).toBe(true);
    expect(recordAudit).toHaveBeenCalled();
  });
});
