const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { usuarios, roles, estados } = require('../models');
const { validateUsuarioPayload } = require('../validators');
const { buildPaginatedResult } = require('../utils/pagination');
const { recordAudit } = require('../utils/audit');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeInstitutionalCode(value) {
  return String(value || '').trim().toUpperCase();
}

function generateInstitutionalCode(roleName) {
  const prefixMap = {
    ADMINISTRADOR: 'ADM',
    DOCENTE: 'DOC',
    ESTUDIANTE: 'EST'
  };
  const prefix = prefixMap[String(roleName || '').toUpperCase()] || 'USR';
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${randomPart}`;
}

function mapDuplicateError(error) {
  const key = String(error?.message || '');
  if (key.includes('uq_usuarios_email')) {
    return 'El correo electronico ya esta registrado.';
  }
  if (key.includes('uq_usuarios_codigo')) {
    return 'El codigo institucional ya esta registrado.';
  }
  if (key.includes('uq_usuarios_cedula')) {
    return 'La cedula ya esta registrada.';
  }
  if (String(error?.code || '') === 'ER_DUP_ENTRY') {
    if (key.includes('email')) return 'El correo electronico ya esta registrado.';
    if (key.includes('codigo_institucional')) return 'El codigo institucional ya esta registrado.';
    if (key.includes('cedula')) return 'La cedula ya esta registrada.';
  }
  return null;
}

async function list(pagination = null) {
  if (!pagination) return usuarios.findAll();
  const { rows, total } = await usuarios.findPaginated(pagination);
  return buildPaginatedResult(rows, total, pagination);
}

async function getById(id) {
  return usuarios.findById(id);
}

function generateTemporaryPassword() {
  return `Temp-${crypto.randomBytes(9).toString('base64url')}9*`;
}

async function create(data, meta = {}) {
  validateUsuarioPayload(data);
  data.email = normalizeEmail(data.email);

  const rol = await roles.findById(data.rol_id);
  if (!rol) {
    const error = new Error('Rol no valido');
    error.status = 400;
    throw error;
  }

  const temporaryPasswordGenerated = !data.password;
  const passwordHash = await bcrypt.hash(data.password || generateTemporaryPassword(), 10);

  const estado = data.estado_id ? await estados.findById(data.estado_id) : await estados.findByName('USUARIO', 'ACTIVO');
  if (!estado) {
    const error = new Error('Estado de usuario no valido');
    error.status = 400;
    throw error;
  }

  const codigoInstitucional = data.codigo_institucional
    ? normalizeInstitutionalCode(data.codigo_institucional)
    : generateInstitutionalCode(rol.nombre);

  const existing = await usuarios.findByEmail(data.email);
  if (existing) {
    const error = new Error('El correo ya existe');
    error.status = 409;
    throw error;
  }

  if (await usuarios.findByCedula(data.cedula)) {
    const error = new Error('La cedula ya existe');
    error.status = 409;
    throw error;
  }

  if (codigoInstitucional && await usuarios.findByCodigoInstitucional(codigoInstitucional)) {
    const error = new Error('El codigo institucional ya existe');
    error.status = 409;
    throw error;
  }

  let created;
  try {
    created = await usuarios.create({
      ...data,
      codigo_institucional: codigoInstitucional,
      estado_id: estado.id,
      password_hash: passwordHash
    });
  } catch (error) {
    const duplicateMessage = mapDuplicateError(error);
    if (duplicateMessage) {
      const duplicateError = new Error(duplicateMessage);
      duplicateError.status = 409;
      throw duplicateError;
    }
    throw error;
  }

  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'USUARIO_CREADO',
    entidad: 'usuarios',
    entidad_id: created.id,
    detalle: {
      email: created.email,
      rol_id: created.rol_id,
      temporary_password_generated: temporaryPasswordGenerated
    },
    ip: meta.ip,
    user_agent: meta.user_agent
  });

  return created;
}

async function update(id, data, meta = {}) {
  validateUsuarioPayload(data);
  data.email = normalizeEmail(data.email);

  const current = await usuarios.findById(id);
  if (!current) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  const rol = await roles.findById(data.rol_id);
  if (!rol) {
    const error = new Error('Rol no valido');
    error.status = 400;
    throw error;
  }

  const estado = await estados.findById(data.estado_id);
  if (!estado) {
    const error = new Error('Estado de usuario no valido');
    error.status = 400;
    throw error;
  }

  const existing = await usuarios.findByEmail(data.email);
  if (existing && String(existing.id) !== String(id)) {
    const error = new Error('El correo ya existe');
    error.status = 409;
    throw error;
  }

  const cedulaExisting = await usuarios.findByCedula(data.cedula);
  if (cedulaExisting && String(cedulaExisting.id) !== String(id)) {
    const error = new Error('La cedula ya existe');
    error.status = 409;
    throw error;
  }

  const codigoInstitucional = data.codigo_institucional
    ? normalizeInstitutionalCode(data.codigo_institucional)
    : current.codigo_institucional;

  if (codigoInstitucional) {
    const codigoExisting = await usuarios.findByCodigoInstitucional(codigoInstitucional);
    if (codigoExisting && String(codigoExisting.id) !== String(id)) {
      const error = new Error('El codigo institucional ya existe');
      error.status = 409;
      throw error;
    }
  }

  let updated;
  try {
    updated = await usuarios.update(id, {
      ...data,
      codigo_institucional: codigoInstitucional
    });
  } catch (error) {
    const duplicateMessage = mapDuplicateError(error);
    if (duplicateMessage) {
      const duplicateError = new Error(duplicateMessage);
      duplicateError.status = 409;
      throw duplicateError;
    }
    throw error;
  }

  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'USUARIO_ACTUALIZADO',
    entidad: 'usuarios',
    entidad_id: id,
    detalle: {
      email: updated.email,
      rol_id: updated.rol_id,
      estado_id: updated.estado_id
    },
    ip: meta.ip,
    user_agent: meta.user_agent
  });

  return updated;
}

async function remove(id, meta = {}) {
  const current = await usuarios.findById(id);
  if (!current) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  const removed = await usuarios.remove(id);

  await recordAudit({
    usuario_id: meta.actor_id,
    accion: 'USUARIO_ELIMINADO',
    entidad: 'usuarios',
    entidad_id: id,
    detalle: { email: current.email },
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
