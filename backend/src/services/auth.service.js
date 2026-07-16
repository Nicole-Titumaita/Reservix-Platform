const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { usuarios, estados, roles, loginAttempts, auditoria, institutionalCodes } = require('../models');
const twoFactorService = require('./two-factor.service');
const {
  validateAuthRegisterPayload,
  validateAuthLoginPayload,
  validateAdminLoginPayload
} = require('../validators');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MINUTES = 15;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeInstitutionalCode(code) {
  return String(code || '').trim().toUpperCase();
}

async function register(payload) {
  validateAuthRegisterPayload(payload);
  const normalizedEmail = normalizeEmail(payload.email);
  const normalizedCode = normalizeInstitutionalCode(payload.codigo_institucional);

  if (await usuarios.findByEmail(normalizedEmail)) {
    const error = new Error('El correo ya esta registrado');
    error.status = 409;
    throw error;
  }

  if (await usuarios.findByCedula(payload.cedula)) {
    const error = new Error('La cedula ya esta registrada');
    error.status = 409;
    throw error;
  }

  if (await usuarios.findByCodigoInstitucional(normalizedCode)) {
    const error = new Error('El codigo institucional ya esta registrado');
    error.status = 409;
    throw error;
  }

  const activo = await estados.findByName('USUARIO', 'ACTIVO');
  const rol = payload.rol_id
    ? await roles.findById(payload.rol_id)
    : await roles.findByName('ESTUDIANTE');

  if (!rol) {
    const error = new Error('Rol no valido para el registro');
    error.status = 400;
    throw error;
  }

  if (rol.nombre === 'ADMINISTRADOR') {
    const error = new Error('No se permite registrar cuentas de administrador desde el acceso publico');
    error.status = 403;
    throw error;
  }

  if (!['ESTUDIANTE', 'DOCENTE'].includes(rol.nombre)) {
    const error = new Error('Solo se permiten registros para estudiante o docente');
    error.status = 403;
    throw error;
  }

  const codeRecord = await institutionalCodes.findLatestActiveByEmailAndRole(normalizedEmail, rol.id, 'REGISTRO');
  if (!codeRecord) {
    const error = new Error('Codigo institucional no valido o expirado');
    error.status = 400;
    throw error;
  }

  const codeOk = await bcrypt.compare(normalizedCode, codeRecord.code_hash);
  if (!codeOk) {
    await institutionalCodes.incrementAttempts(codeRecord.id);
    const error = new Error('Codigo institucional no valido o expirado');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const nuevoUsuario = await usuarios.create({
    rol_id: rol.id,
    estado_id: activo ? activo.id : payload.estado_id,
    nombre: payload.nombre,
    apellido: payload.apellido,
    cedula: payload.cedula,
    cedula_provincia: payload.cedula_provincia,
    email: normalizedEmail,
    password_hash: passwordHash,
    telefono: payload.telefono,
    codigo_institucional: normalizedCode
  });

  await institutionalCodes.markUsed(codeRecord.id);

  return nuevoUsuario;
}

async function verifyTwoFactor(payload, meta = {}) {
  try {
    const usuario = await twoFactorService.verifyCode(payload || {});
    await auditoria.create({
      usuario_id: usuario.id,
      accion: 'LOGIN_2FA_VERIFICADO',
      entidad: 'usuarios',
      entidad_id: usuario.id,
      detalle: { email: usuario.email, rol: usuario.rol_nombre },
      ip: meta.ip,
      user_agent: meta.user_agent
    });
    return buildSession(usuario);
  } catch (error) {
    await recordLoginAttempt({
      usuario_id: payload?.user_id || null,
      email: '',
      success: false,
      failure_reason: error.status === 400 ? '2FA_EXPIRADO_O_INVALIDO' : '2FA_INVALIDO'
    }, { ...meta, endpoint: 'verify-2fa' });
    throw error;
  }
}

async function resendTwoFactor(payload) {
  return twoFactorService.resendCode(payload || {});
}

async function login(payload, meta = {}) {
  validateAuthLoginPayload(payload);
  return authenticateWithRoleRestriction(payload, {
    allowRoles: ['ESTUDIANTE', 'DOCENTE'],
    forbiddenMessage: 'Acceso no autorizado'
  }, meta);
}

async function adminLogin(payload, meta = {}) {
  validateAdminLoginPayload(payload);
  return authenticateWithRoleRestriction(payload, {
    allowRoles: ['ADMINISTRADOR'],
    forbiddenMessage: 'Acceso no autorizado'
  }, meta);
}

async function authenticateWithRoleRestriction({ email, password }, { allowRoles, forbiddenMessage }, meta = {}) {
  const normalizedEmail = normalizeEmail(email);
  await ensureLoginNotTemporarilyBlocked(email, meta);

  const usuario = await usuarios.findByEmail(normalizedEmail);
  if (!usuario) {
    await recordLoginAttempt({ email: normalizedEmail, success: false, failure_reason: 'USUARIO_NO_ENCONTRADO' }, meta);
    const error = new Error('Credenciales invalidas');
    error.status = 401;
    throw error;
  }

  const passwordOk = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordOk) {
    await recordLoginAttempt({ usuario_id: usuario.id, email: normalizedEmail, success: false, failure_reason: 'PASSWORD_INVALIDO' }, meta);
    const error = new Error('Credenciales invalidas');
    error.status = 401;
    throw error;
  }

  if (!allowRoles.includes(usuario.rol_nombre)) {
    await recordLoginAttempt({ usuario_id: usuario.id, email: normalizedEmail, success: false, failure_reason: 'ROL_NO_AUTORIZADO' }, meta);
    const error = new Error(forbiddenMessage);
    error.status = 403;
    throw error;
  }

  if (usuario.estado_nombre && usuario.estado_nombre !== 'ACTIVO') {
    await recordLoginAttempt({ usuario_id: usuario.id, email: normalizedEmail, success: false, failure_reason: 'USUARIO_INACTIVO' }, meta);
    const error = new Error('Acceso no autorizado');
    error.status = 403;
    throw error;
  }

  await recordLoginAttempt({ usuario_id: usuario.id, email: normalizedEmail, success: true }, meta);
  return twoFactorService.createAndSend(usuario);
}

async function ensureLoginNotTemporarilyBlocked(email, meta = {}) {
  const normalizedEmail = normalizeEmail(email);
  const failures = await loginAttempts.countRecentFailures({
    email: normalizedEmail,
    ip: meta.ip,
    endpoint: meta.endpoint,
    minutes: LOCK_WINDOW_MINUTES
  });

  if (failures < MAX_FAILED_ATTEMPTS) return;

  await recordLoginAttempt({
    email: normalizedEmail,
    success: false,
    failure_reason: 'BLOQUEO_TEMPORAL'
  }, meta);

  const error = new Error('Demasiados intentos. Intenta nuevamente en unos minutos.');
  error.status = 429;
  throw error;
}

async function recordLoginAttempt(data, meta) {
  try {
    await loginAttempts.create({
      ...data,
      endpoint: meta.endpoint,
      ip: meta.ip,
      user_agent: meta.user_agent
    });
  } catch (error) {
    console.error('No fue posible registrar intento de login:', { message: error.message });
  }
}

function buildSession(usuario) {
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol: usuario.rol_nombre
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.rol_nombre,
      estado_id: usuario.estado_id
    }
  };
}

module.exports = {
  register,
  login,
  adminLogin,
  verifyTwoFactor,
  resendTwoFactor
};
