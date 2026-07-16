const { pool } = require('../config/db');
const { reservas, usuarios, espacios, horarios, estados, historial } = require('../models');
const { validateReservaPayload } = require('../validators');
const { buildPaginatedResult } = require('../utils/pagination');
const { recordAudit } = require('../utils/audit');

async function list(pagination = null) {
  if (!pagination) return reservas.findAll();
  const { rows, total } = await reservas.findPaginated(pagination);
  return buildPaginatedResult(rows, total, pagination);
}

async function listByUserId(userId, pagination = null) {
  if (!pagination) return reservas.findByUserId(userId);
  const { rows, total } = await reservas.findByUserIdPaginated(userId, pagination);
  return buildPaginatedResult(rows, total, pagination);
}

async function checkDisponibilidad({ espacio_id, fecha_inicio, fecha_fin }) {
  if (!espacio_id || !fecha_inicio || !fecha_fin) {
    const error = new Error('Faltan campos obligatorios: espacio_id, fecha_inicio, fecha_fin');
    error.status = 400;
    throw error;
  }

  if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
    const error = new Error('La fecha de inicio debe ser menor que la fecha de fin');
    error.status = 400;
    throw error;
  }

  const espacio = await espacios.findById(espacio_id);
  if (!espacio) {
    const error = new Error('Espacio no encontrado');
    error.status = 404;
    throw error;
  }

  const conflicto = await reservas.findConflictingReservation(espacio_id, fecha_inicio, fecha_fin);

  return {
    disponible: !conflicto,
    espacio,
    conflicto: conflicto || null,
    mensaje: conflicto
      ? 'El espacio no esta disponible en ese rango de tiempo'
      : 'El espacio esta disponible en ese rango de tiempo'
  };
}

async function getById(id) {
  return reservas.findById(id);
}

async function getByIdForUser(id, user) {
  const reserva = await reservas.findById(id);
  if (!reserva) return null;
  if (user?.rol === 'ADMINISTRADOR' || reserva.usuario_id === user?.id) {
    return reserva;
  }

  const error = new Error('No tienes permiso para consultar esta reserva');
  error.status = 403;
  throw error;
}

async function create(data, actorUserId) {
  validateReservaPayload(data);

  const [usuario, espacio, horario, estado] = await Promise.all([
    usuarios.findById(data.usuario_id),
    espacios.findById(data.espacio_id),
    horarios.findById(data.horario_id),
    estados.findById(data.estado_id)
  ]);

  if (!usuario || !espacio || !horario || !estado) {
    const error = new Error('Datos de reserva no validos');
    error.status = 400;
    throw error;
  }

  const conflicto = await reservas.findConflictingReservation(
    data.espacio_id,
    data.fecha_inicio,
    data.fecha_fin
  );

  if (conflicto) {
    const error = new Error('Ya existe una reserva que se cruza en ese horario');
    error.status = 409;
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const reservaId = await reservas.create(connection, data);
    await historial.create(connection, {
      reserva_id: reservaId,
      usuario_id: actorUserId || data.usuario_id,
      estado_anterior_id: null,
      estado_nuevo_id: data.estado_id,
      accion: 'CREACION',
      observacion: data.observaciones || 'Reserva creada'
    });
    await connection.commit();
    const created = await reservas.findById(reservaId);
    await recordAudit({
      usuario_id: actorUserId || data.usuario_id,
      accion: 'RESERVA_CREADA',
      entidad: 'reservas',
      entidad_id: reservaId,
      detalle: {
        usuario_id: data.usuario_id,
        espacio_id: data.espacio_id,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin
      }
    });
    return created;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createForUser(data, user) {
  return create({ ...data, usuario_id: user.id }, user.id);
}

async function update(id, data, actorUserId) {
  validateReservaPayload(data);

  const current = await reservas.findById(id);
  if (!current) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  const conflicto = await reservas.findConflictingReservation(
    data.espacio_id,
    data.fecha_inicio,
    data.fecha_fin,
    id
  );

  if (conflicto) {
    const error = new Error('Ya existe una reserva que se cruza en ese horario');
    error.status = 409;
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await reservas.update(connection, id, data);
    await historial.create(connection, {
      reserva_id: id,
      usuario_id: actorUserId || data.usuario_id,
      estado_anterior_id: current.estado_id,
      estado_nuevo_id: data.estado_id,
      accion: 'ACTUALIZACION',
      observacion: data.observaciones || 'Reserva actualizada'
    });
    await connection.commit();
    const updated = await reservas.findById(id);
    await recordAudit({
      usuario_id: actorUserId || data.usuario_id,
      accion: 'RESERVA_ACTUALIZADA',
      entidad: 'reservas',
      entidad_id: id,
      detalle: {
        estado_anterior_id: current.estado_id,
        estado_nuevo_id: data.estado_id,
        espacio_id: data.espacio_id
      }
    });
    return updated;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateForUser(id, data, user) {
  const current = await getByIdForUser(id, user);
  if (current.estado_nombre !== 'PENDIENTE') {
    const error = new Error('Solo puedes editar reservas pendientes');
    error.status = 400;
    throw error;
  }
  return update(id, { ...data, usuario_id: current.usuario_id }, user.id);
}

async function remove(id, actorUserId) {
  const current = await reservas.findById(id);
  if (!current) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await historial.create(connection, {
      reserva_id: id,
      usuario_id: actorUserId || current.usuario_id,
      estado_anterior_id: current.estado_id,
      estado_nuevo_id: current.estado_id,
      accion: 'ELIMINACION',
      observacion: 'Reserva eliminada'
    });
    await reservas.remove(id);
    await connection.commit();
    await recordAudit({
      usuario_id: actorUserId || current.usuario_id,
      accion: 'RESERVA_ELIMINADA',
      entidad: 'reservas',
      entidad_id: id,
      detalle: { estado_id: current.estado_id, espacio_id: current.espacio_id }
    });
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function changeState(id, estadoNombre, actorUserId, observacion) {
  const current = await reservas.findById(id);
  if (!current) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  const nuevoEstado = await estados.findByCategoryAndName('RESERVA', estadoNombre);
  if (!nuevoEstado) {
    const error = new Error('Estado de reserva invalido');
    error.status = 400;
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await reservas.update(connection, id, {
      ...current,
      estado_id: nuevoEstado.id
    });
    await historial.create(connection, {
      reserva_id: id,
      usuario_id: actorUserId || current.usuario_id,
      estado_anterior_id: current.estado_id,
      estado_nuevo_id: nuevoEstado.id,
      accion: estadoNombre,
      observacion: observacion || `Reserva ${estadoNombre.toLowerCase()}`
    });
    await connection.commit();
    const updated = await reservas.findById(id);
    await recordAudit({
      usuario_id: actorUserId || current.usuario_id,
      accion: `RESERVA_${estadoNombre}`,
      entidad: 'reservas',
      entidad_id: id,
      detalle: {
        estado_anterior_id: current.estado_id,
        estado_nuevo_id: nuevoEstado.id,
        observacion: observacion || null
      }
    });
    return updated;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cancelForUser(id, user, observacion) {
  const current = await getByIdForUser(id, user);
  if (current.estado_nombre !== 'PENDIENTE') {
    const error = new Error('Solo puedes cancelar reservas pendientes');
    error.status = 400;
    throw error;
  }

  return changeState(id, 'CANCELADA', user.id, observacion);
}

module.exports = {
  list,
  listByUserId,
  checkDisponibilidad,
  getById,
  getByIdForUser,
  create,
  createForUser,
  update,
  updateForUser,
  remove,
  changeState,
  cancelForUser
};
