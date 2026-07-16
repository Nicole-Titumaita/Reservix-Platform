const { recursos, espacios, estados } = require('../models');
const { validateRecursoPayload } = require('../validators');
const { buildPaginatedResult } = require('../utils/pagination');
const { recordAudit } = require('../utils/audit');

async function list(pagination = null) {
  if (!pagination) return recursos.findAll();
  const { rows, total } = await recursos.findPaginated(pagination);
  return buildPaginatedResult(rows, total, pagination);
}

async function getById(id) {
  return recursos.findById(id);
}

async function create(data, meta = {}) {
  validateRecursoPayload(data);

  const estado = await estados.findById(data.estado_id);
  if (!estado) {
    const error = new Error('Estado de recurso no valido');
    error.status = 400;
    throw error;
  }

  if (data.espacio_id) {
    const espacio = await espacios.findById(data.espacio_id);
    if (!espacio) {
      const error = new Error('Espacio no valido');
      error.status = 400;
      throw error;
    }
  }

  const duplicate = await recursos.findByCodigo(data.codigo);
  if (duplicate) {
    const error = new Error('Ya existe un recurso con ese codigo');
    error.status = 409;
    throw error;
  }

  const created = await recursos.create(data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'RECURSO_CREADO',
    entidad: 'recursos',
    entidad_id: created.id,
    detalle: { codigo: created.codigo, nombre: created.nombre, tipo: created.tipo },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return created;
}

async function update(id, data, meta = {}) {
  validateRecursoPayload(data);

  const current = await recursos.findById(id);
  if (!current) {
    const error = new Error('Recurso no encontrado');
    error.status = 404;
    throw error;
  }

  const estado = await estados.findById(data.estado_id);
  if (!estado) {
    const error = new Error('Estado de recurso no valido');
    error.status = 400;
    throw error;
  }

  if (data.espacio_id) {
    const espacio = await espacios.findById(data.espacio_id);
    if (!espacio) {
      const error = new Error('Espacio no valido');
      error.status = 400;
      throw error;
    }
  }

  const duplicate = await recursos.findByCodigo(data.codigo);
  if (duplicate && String(duplicate.id) !== String(id)) {
    const error = new Error('Ya existe otro recurso con ese codigo');
    error.status = 409;
    throw error;
  }

  const updated = await recursos.update(id, data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'RECURSO_ACTUALIZADO',
    entidad: 'recursos',
    entidad_id: id,
    detalle: { codigo: updated.codigo, nombre: updated.nombre, estado_id: updated.estado_id },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return updated;
}

async function remove(id, meta = {}) {
  const current = await recursos.findById(id);
  if (!current) {
    const error = new Error('Recurso no encontrado');
    error.status = 404;
    throw error;
  }

  const removed = await recursos.remove(id);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'RECURSO_ELIMINADO',
    entidad: 'recursos',
    entidad_id: id,
    detalle: { codigo: current.codigo, nombre: current.nombre },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return removed;
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
