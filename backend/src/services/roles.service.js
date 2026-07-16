const { roles } = require('../models');
const { validateRolePayload } = require('../validators');
const { recordAudit } = require('../utils/audit');

async function list() {
  return roles.findAll();
}

async function getById(id) {
  return roles.findById(id);
}

async function create(data, meta = {}) {
  validateRolePayload(data);

  const existing = await roles.findByName(data.nombre);
  if (existing) {
    const error = new Error('Ya existe un rol con ese nombre');
    error.status = 409;
    throw error;
  }

  const created = await roles.create(data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ROL_CREADO',
    entidad: 'roles',
    entidad_id: created.id,
    detalle: { nombre: created.nombre },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return created;
}

async function update(id, data, meta = {}) {
  validateRolePayload(data);

  const existing = await roles.findById(id);
  if (!existing) {
    const error = new Error('Rol no encontrado');
    error.status = 404;
    throw error;
  }

  const duplicate = await roles.findByName(data.nombre);
  if (duplicate && String(duplicate.id) !== String(id)) {
    const error = new Error('Ya existe otro rol con ese nombre');
    error.status = 409;
    throw error;
  }

  const updated = await roles.update(id, data);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ROL_ACTUALIZADO',
    entidad: 'roles',
    entidad_id: id,
    detalle: { nombre_anterior: existing.nombre, nombre_nuevo: updated.nombre },
    ip: meta.ip,
    user_agent: meta.user_agent
  });
  return updated;
}

async function remove(id, meta = {}) {
  const existing = await roles.findById(id);
  if (!existing) {
    const error = new Error('Rol no encontrado');
    error.status = 404;
    throw error;
  }

  const removed = await roles.remove(id);
  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'ROL_ELIMINADO',
    entidad: 'roles',
    entidad_id: id,
    detalle: { nombre: existing.nombre },
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
