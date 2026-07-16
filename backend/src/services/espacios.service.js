const { espacios, estados } = require('../models');
const { validateEspacioPayload } = require('../validators');
const { buildPaginatedResult } = require('../utils/pagination');
const { recordAudit } = require('../utils/audit');

async function list(pagination = null) {
  if (!pagination) return espacios.findAll();
  const { rows, total } = await espacios.findPaginated(pagination);
  return buildPaginatedResult(rows, total, pagination);
}

async function getById(id) {
  return espacios.findById(id);
}

async function create(data, meta = {}) {
  validateEspacioPayload(data);

  const estado = await estados.findById(data.estado_id);
  if (!estado) {
    const error = new Error('Estado de espacio no valido');
    error.status = 400;
    throw error;
  }

  const duplicate = await espacios.findByCodigo(data.codigo);
  if (duplicate) {
    const error = new Error('Ya existe un espacio con ese codigo');
    error.status = 409;
    throw error;
  }

  const created = await espacios.create(data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ESPACIO_CREADO',
    entidad: 'espacios',
    entidad_id: created.id,
    detalle: { codigo: created.codigo, nombre: created.nombre },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return created;
}

async function update(id, data, meta = {}) {
  validateEspacioPayload(data);

  const current = await espacios.findById(id);
  if (!current) {
    const error = new Error('Espacio no encontrado');
    error.status = 404;
    throw error;
  }

  const estado = await estados.findById(data.estado_id);
  if (!estado) {
    const error = new Error('Estado de espacio no valido');
    error.status = 400;
    throw error;
  }

  const duplicate = await espacios.findByCodigo(data.codigo);
  if (duplicate && String(duplicate.id) !== String(id)) {
    const error = new Error('Ya existe otro espacio con ese codigo');
    error.status = 409;
    throw error;
  }

  const updated = await espacios.update(id, data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ESPACIO_ACTUALIZADO',
    entidad: 'espacios',
    entidad_id: id,
    detalle: { codigo: updated.codigo, nombre: updated.nombre, estado_id: updated.estado_id },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return updated;
}

async function remove(id, meta = {}) {
  const current = await espacios.findById(id);
  if (!current) {
    const error = new Error('Espacio no encontrado');
    error.status = 404;
    throw error;
  }

  const removed = await espacios.remove(id);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ESPACIO_ELIMINADO',
    entidad: 'espacios',
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
