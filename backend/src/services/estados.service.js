const { estados } = require('../models');
const { validateEstadoPayload } = require('../validators');
const { recordAudit } = require('../utils/audit');

async function list() {
  return estados.findAll();
}

async function listByCategory(category) {
  return estados.findByCategory(category);
}

async function getById(id) {
  return estados.findById(id);
}

async function create(data, meta = {}) {
  validateEstadoPayload(data);

  const duplicate = await estados.findByCategoryAndName(data.categoria, data.nombre);
  if (duplicate) {
    const error = new Error('Ya existe ese estado en la categoria indicada');
    error.status = 409;
    throw error;
  }

  const created = await estados.create(data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ESTADO_CREADO',
    entidad: 'estados',
    entidad_id: created.id,
    detalle: { categoria: created.categoria, nombre: created.nombre },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return created;
}

async function update(id, data, meta = {}) {
  validateEstadoPayload(data);

  const current = await estados.findById(id);
  if (!current) {
    const error = new Error('Estado no encontrado');
    error.status = 404;
    throw error;
  }

  const duplicate = await estados.findByCategoryAndName(data.categoria, data.nombre);
  if (duplicate && String(duplicate.id) !== String(id)) {
    const error = new Error('Ya existe otro estado con ese nombre');
    error.status = 409;
    throw error;
  }

  const updated = await estados.update(id, data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ESTADO_ACTUALIZADO',
    entidad: 'estados',
    entidad_id: id,
    detalle: {
      categoria_anterior: current.categoria,
      nombre_anterior: current.nombre,
      categoria_nueva: updated.categoria,
      nombre_nuevo: updated.nombre,
      activo: updated.activo
    },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return updated;
}

async function remove(id, meta = {}) {
  const current = await estados.findById(id);
  if (!current) {
    const error = new Error('Estado no encontrado');
    error.status = 404;
    throw error;
  }

  const removed = await estados.remove(id);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ESTADO_ELIMINADO',
    entidad: 'estados',
    entidad_id: id,
    detalle: { categoria: current.categoria, nombre: current.nombre },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return removed;
}

module.exports = {
  list,
  listByCategory,
  getById,
  create,
  update,
  remove
};
