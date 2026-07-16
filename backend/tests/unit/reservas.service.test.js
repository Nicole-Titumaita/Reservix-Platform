jest.mock('../../src/config/db', () => ({
  pool: {
    getConnection: jest.fn()
  }
}));

jest.mock('../../src/models', () => ({
  reservas: {
    findAll: jest.fn(),
    findPaginated: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdPaginated: jest.fn(),
    findById: jest.fn(),
    findConflictingReservation: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  },
  usuarios: { findById: jest.fn() },
  espacios: { findById: jest.fn() },
  horarios: { findById: jest.fn() },
  estados: { findById: jest.fn(), findByCategoryAndName: jest.fn() },
  historial: { create: jest.fn() }
}));

jest.mock('../../src/utils/audit', () => ({ recordAudit: jest.fn() }));

const db = require('../../src/config/db');
const { reservas, usuarios, espacios, horarios, estados, historial } = require('../../src/models');
const service = require('../../src/services/reservas.service');

describe('reservas.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.pool.getConnection.mockResolvedValue({
      beginTransaction: jest.fn(async () => {}),
      commit: jest.fn(async () => {}),
      rollback: jest.fn(async () => {}),
      release: jest.fn()
    });
  });

  it('returns paginated reservations', async () => {
    reservas.findPaginated.mockResolvedValue({ rows: [{ id: 1 }], total: 1 });

    const result = await service.list({ page: 1, limit: 10 });

    expect(reservas.findPaginated).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result.pagination.total).toBe(1);
  });

  it('returns reservations of a user with pagination', async () => {
    reservas.findByUserIdPaginated.mockResolvedValue({ rows: [{ id: 1 }], total: 1 });

    const result = await service.listByUserId(7, { page: 2, limit: 5 });

    expect(reservas.findByUserIdPaginated).toHaveBeenCalledWith(7, { page: 2, limit: 5 });
    expect(result.pagination.page).toBe(2);
  });

  it('rejects invalid date ranges', async () => {
    await expect(service.checkDisponibilidad({
      espacio_id: 1,
      fecha_inicio: '2026-01-02T10:00:00Z',
      fecha_fin: '2026-01-01T10:00:00Z'
    })).rejects.toThrow(/fecha de inicio/i);
  });

  it('rejects checkDisponibilidad when the space does not exist', async () => {
    espacios.findById.mockResolvedValue(null);

    await expect(service.checkDisponibilidad({
      espacio_id: 1,
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z'
    })).rejects.toThrow(/Espacio no encontrado/i);
  });

  it('creates a reservation and records history', async () => {
    usuarios.findById.mockResolvedValue({ id: 1 });
    espacios.findById.mockResolvedValue({ id: 2 });
    horarios.findById.mockResolvedValue({ id: 3 });
    estados.findById.mockResolvedValue({ id: 4 });
    reservas.findConflictingReservation.mockResolvedValue(null);
    reservas.create.mockResolvedValue(99);
    reservas.findById.mockResolvedValue({ id: 99 });

    const created = await service.create({
      usuario_id: 1,
      espacio_id: 2,
      horario_id: 3,
      estado_id: 4,
      fecha_reserva: '2026-01-01',
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z',
      motivo: 'Clase'
    }, 1);

    expect(created.id).toBe(99);
    expect(historial.create).toHaveBeenCalled();
  });

  it('rejects creation when related entities are missing', async () => {
    usuarios.findById.mockResolvedValue(null);
    espacios.findById.mockResolvedValue({ id: 2 });
    horarios.findById.mockResolvedValue({ id: 3 });
    estados.findById.mockResolvedValue({ id: 4 });

    await expect(service.create({
      usuario_id: 1,
      espacio_id: 2,
      horario_id: 3,
      estado_id: 4,
      fecha_reserva: '2026-01-01',
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z',
      motivo: 'Clase'
    }, 1)).rejects.toThrow(/Datos de reserva no validos/i);
  });

  it('rejects conflicting reservations', async () => {
    usuarios.findById.mockResolvedValue({ id: 1 });
    espacios.findById.mockResolvedValue({ id: 2 });
    horarios.findById.mockResolvedValue({ id: 3 });
    estados.findById.mockResolvedValue({ id: 4 });
    reservas.findConflictingReservation.mockResolvedValue({ id: 50 });

    await expect(service.create({
      usuario_id: 1,
      espacio_id: 2,
      horario_id: 3,
      estado_id: 4,
      fecha_reserva: '2026-01-01',
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z',
      motivo: 'Clase'
    }, 1)).rejects.toThrow(/cruza/i);
  });

  it('returns null when reservation is not visible to the user', async () => {
    reservas.findById.mockResolvedValue(null);
    await expect(service.getByIdForUser(12, { id: 2, rol: 'ESTUDIANTE' })).resolves.toBeNull();
  });

  it('allows admin to read any reservation', async () => {
    reservas.findById.mockResolvedValue({ id: 12, usuario_id: 99 });
    await expect(service.getByIdForUser(12, { id: 1, rol: 'ADMINISTRADOR' })).resolves.toEqual({ id: 12, usuario_id: 99 });
  });

  it('rejects reservation access for another user', async () => {
    reservas.findById.mockResolvedValue({ id: 12, usuario_id: 99 });
    await expect(service.getByIdForUser(12, { id: 2, rol: 'ESTUDIANTE' })).rejects.toThrow(/permiso/i);
  });

  it('rejects update when reservation does not exist', async () => {
    reservas.findById.mockResolvedValue(null);

    await expect(service.update(9, {
      usuario_id: 1,
      espacio_id: 2,
      horario_id: 3,
      estado_id: 4,
      fecha_reserva: '2026-01-01',
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z',
      motivo: 'Clase'
    }, 1)).rejects.toThrow(/no encontrada/i);
  });

  it('rejects user update when current reservation is not pending', async () => {
    reservas.findById.mockResolvedValue({
      id: 1,
      usuario_id: 1,
      estado_nombre: 'APROBADA'
    });

    await expect(service.updateForUser(1, {
      usuario_id: 1,
      espacio_id: 2,
      horario_id: 3,
      estado_id: 4,
      fecha_reserva: '2026-01-01',
      fecha_inicio: '2026-01-01T10:00:00Z',
      fecha_fin: '2026-01-01T11:00:00Z',
      motivo: 'Clase'
    }, { id: 1, rol: 'ESTUDIANTE' })).rejects.toThrow(/pendientes/i);
  });

  it('cancels a pending reservation for a user', async () => {
    estados.findByCategoryAndName.mockResolvedValue({ id: 5 });
    reservas.update.mockResolvedValue(true);
    reservas.findById
      .mockResolvedValueOnce({
        id: 1,
        usuario_id: 1,
        estado_nombre: 'PENDIENTE',
        estado_id: 4
      })
      .mockResolvedValueOnce({
        id: 1,
        usuario_id: 1,
        estado_nombre: 'PENDIENTE',
        estado_id: 4
      })
      .mockResolvedValueOnce({
        id: 1,
        usuario_id: 1,
        estado_nombre: 'CANCELADA',
        estado_id: 5
      });

    const result = await service.cancelForUser(1, { id: 1, rol: 'ESTUDIANTE' }, 'No la necesito');

    expect(result.estado_nombre).toBe('CANCELADA');
    expect(estados.findByCategoryAndName).toHaveBeenCalledWith('RESERVA', 'CANCELADA');
  });

  it('rejects cancelation for non-pending reservations', async () => {
    reservas.findById.mockResolvedValue({
      id: 1,
      usuario_id: 1,
      estado_nombre: 'APROBADA',
      estado_id: 4
    });

    await expect(service.cancelForUser(1, { id: 1, rol: 'ESTUDIANTE' }, 'No la necesito')).rejects.toThrow(/pendientes/i);
  });

  it('rejects invalid reservation states', async () => {
    reservas.findById.mockResolvedValue({ id: 1, usuario_id: 1, estado_id: 4 });
    estados.findByCategoryAndName.mockResolvedValue(null);

    await expect(service.changeState(1, 'OTRO_ESTADO', 1, 'prueba')).rejects.toThrow(/invalido/i);
  });

  it('rejects state change when reservation does not exist', async () => {
    reservas.findById.mockResolvedValue(null);

    await expect(service.changeState(1, 'APROBADA', 1, 'prueba')).rejects.toThrow(/no encontrada/i);
  });
});
