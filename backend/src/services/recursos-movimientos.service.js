const { pool } = require('../config/db');
const { recursosMovimientos, recursos, estados } = require('../models');
const { validateRecursoMovimientoPayload } = require('../validators');
const { buildPaginatedResult } = require('../utils/pagination');
const { recordAudit } = require('../utils/audit');

async function list(filters = null) {
  const pagination = filters?.pagination || null;
  const rolNombre = filters?.rolNombre || null;
  const accion = filters?.accion || null;
  if (!pagination) return recursosMovimientos.findAll({ rolNombre, accion });
  const { rows, total } = await recursosMovimientos.findPaginated({ ...pagination, rolNombre, accion });
  return buildPaginatedResult(rows, total, pagination);
}

async function listByRecursoId(recursoId, rolNombre = null, accion = null) {
  const recurso = await recursos.findById(recursoId);
  if (!recurso) {
    const error = new Error('Recurso no encontrado');
    error.status = 404;
    throw error;
  }

  return recursosMovimientos.findByRecursoId(recursoId, rolNombre, accion);
}

async function create(data, meta = {}) {
  validateRecursoMovimientoPayload(data);

  if (!meta.actor_id) {
    const error = new Error('Token no proporcionado');
    error.status = 401;
    throw error;
  }
  if (!meta.actor_role_id || !meta.actor_role_name) {
    const error = new Error('No fue posible identificar el rol del usuario');
    error.status = 401;
    throw error;
  }

  const recurso = await recursos.findById(data.recurso_id);
  if (!recurso) {
    const error = new Error('Recurso no encontrado');
    error.status = 404;
    throw error;
  }

  const estadoNuevo = await estados.findById(data.estado_nuevo_id);
  if (!estadoNuevo || estadoNuevo.categoria !== 'RECURSO') {
    const error = new Error('Estado de recurso no valido');
    error.status = 400;
    throw error;
  }

  const estadoAnteriorId = data.estado_anterior_id || recurso.estado_id;
  if (data.estado_anterior_id && String(data.estado_anterior_id) !== String(recurso.estado_id)) {
    const error = new Error('El estado anterior no coincide con el estado actual del recurso');
    error.status = 409;
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const movementId = await recursosMovimientos.create(connection, {
      recurso_id: data.recurso_id,
      usuario_id: meta.actor_id,
      rol_id: meta.actor_role_id,
      rol_nombre: meta.actor_role_name,
      estado_anterior_id: estadoAnteriorId,
      estado_nuevo_id: data.estado_nuevo_id,
      accion: data.accion,
      observacion: data.observacion
    });

    await connection.query('UPDATE recursos SET estado_id = ? WHERE id = ?', [
      data.estado_nuevo_id,
      data.recurso_id
    ]);

    await connection.commit();

    await recordAudit({
      usuario_id: meta.actor_id,
      accion: 'RECURSO_MOVIMIENTO_REGISTRADO',
      entidad: 'historial_recursos',
      entidad_id: movementId,
      detalle: {
        recurso_id: data.recurso_id,
        accion: data.accion,
        estado_nuevo_id: data.estado_nuevo_id
      },
      ip: meta.ip,
      user_agent: meta.user_agent
    });

    return recursosMovimientos.findById(movementId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  list,
  listByRecursoId,
  create
};
