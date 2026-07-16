const { normalizeText, assertSafeText } = require('../utils/security');
const { validateCedulaEcuador } = require('../utils/cedula-ecuador');

function requireFields(payload, fields) {
  const missing = fields.filter(
    (field) => payload[field] === undefined || payload[field] === null || payload[field] === ''
  );
  if (missing.length > 0) {
    const error = new Error(`Faltan campos obligatorios: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

function cleanString(value, maxLength = 255) {
  if (value === undefined || value === null) return value;
  return normalizeText(value, maxLength);
}

function sanitizePayload(payload, fields = []) {
  for (const field of fields) {
    if (payload[field] !== undefined && payload[field] !== null) {
      payload[field] = cleanString(payload[field]);
    }
  }
  return payload;
}

function validateEmail(email) {
  const normalized = cleanString(email, 150).toLowerCase();
  const valid = /^[a-z0-9._%+-]+@([a-z0-9-]+\.)+[a-z]{2,}$/.test(normalized)
    || /^[a-z0-9._%+-]+@demo\.local$/.test(normalized);
  if (!valid) {
    const error = new Error('Ingresa un correo valido. Se permiten dominios reales como gmail.com, hotmail.com, yahoo.com o el dominio de prueba demo.local');
    error.status = 400;
    throw error;
  }
  return normalized;
}

function validateName(value, fieldName) {
  const normalized = cleanString(value, 80);
  assertSafeText(normalized, fieldName);
  if (!/^[\p{L}\s'-]{2,80}$/u.test(normalized)) {
    const error = new Error(`${fieldName} debe tener entre 2 y 80 caracteres validos`);
    error.status = 400;
    throw error;
  }
  return normalized;
}

function validateInstitutionalCode(value) {
  const normalized = cleanString(value, 30).toUpperCase();
  assertSafeText(normalized, 'Codigo institucional');
  if (!/^[A-Z0-9_-]{6,30}$/.test(normalized)) {
    const error = new Error('El codigo institucional debe tener entre 6 y 30 caracteres y solo usar letras, numeros, guion medio o guion bajo');
    error.status = 400;
    throw error;
  }
  return normalized;
}

function validateCedulaPayload(value) {
  const normalized = cleanString(value, 10);
  const result = validateCedulaEcuador(normalized);
  if (!result.valid) {
    const error = new Error('La cedula ingresada no es valida');
    error.status = 400;
    throw error;
  }
  return {
    cedula: normalized,
    cedula_provincia: result.provincia
  };
}

function validatePassword(password) {
  const rules = [
    { ok: typeof password === 'string' && password.length >= 8, message: 'minimo 8 caracteres' },
    { ok: /[A-Z]/.test(password || ''), message: 'una letra mayuscula' },
    { ok: /[a-z]/.test(password || ''), message: 'una letra minuscula' },
    { ok: /[0-9]/.test(password || ''), message: 'un numero' },
    { ok: /[^A-Za-z0-9]/.test(password || ''), message: 'un caracter especial' }
  ];
  const missing = rules.filter((rule) => !rule.ok).map((rule) => rule.message);

  if (missing.length > 0) {
    const error = new Error(`La contrasena debe incluir ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

function validateRolePayload(payload) {
  sanitizePayload(payload, ['nombre', 'descripcion']);
  requireFields(payload, ['nombre']);
}

function validateAuthRegisterPayload(payload) {
  sanitizePayload(payload, ['nombre', 'apellido', 'cedula', 'email', 'telefono', 'codigo_institucional']);
  requireFields(payload, ['nombre', 'apellido', 'cedula', 'codigo_institucional', 'email', 'password', 'confirm_password']);
  payload.nombre = validateName(payload.nombre, 'Nombres');
  payload.apellido = validateName(payload.apellido, 'Apellidos');
  const cedulaData = validateCedulaPayload(payload.cedula);
  payload.cedula = cedulaData.cedula;
  payload.cedula_provincia = cedulaData.cedula_provincia;
  payload.codigo_institucional = validateInstitutionalCode(payload.codigo_institucional);
  payload.email = validateEmail(payload.email);
  validatePassword(payload.password);
  if (payload.password !== payload.confirm_password) {
    const error = new Error('Las contrasenas no coinciden');
    error.status = 400;
    throw error;
  }
}

function validateAuthLoginPayload(payload) {
  sanitizePayload(payload, ['email']);
  requireFields(payload, ['email', 'password']);
  payload.email = validateEmail(payload.email);
}

function validateAdminLoginPayload(payload) {
  sanitizePayload(payload, ['email']);
  requireFields(payload, ['email', 'password']);
  payload.email = validateEmail(payload.email);
}

function validateUsuarioPayload(payload) {
  sanitizePayload(payload, ['nombre', 'apellido', 'cedula', 'email', 'telefono', 'codigo_institucional']);
  requireFields(payload, ['rol_id', 'nombre', 'apellido', 'cedula', 'email']);
  payload.nombre = validateName(payload.nombre, 'Nombres');
  payload.apellido = validateName(payload.apellido, 'Apellidos');
  const cedulaData = validateCedulaPayload(payload.cedula);
  payload.cedula = cedulaData.cedula;
  payload.cedula_provincia = cedulaData.cedula_provincia;
  if (payload.codigo_institucional) {
    payload.codigo_institucional = validateInstitutionalCode(payload.codigo_institucional);
  }
  payload.email = validateEmail(payload.email);
  if (payload.password) validatePassword(payload.password);
}

function validateEspacioPayload(payload) {
  sanitizePayload(payload, ['codigo', 'nombre', 'tipo', 'ubicacion', 'descripcion']);
  requireFields(payload, ['codigo', 'nombre', 'tipo', 'estado_id']);
}

function validateRecursoPayload(payload) {
  sanitizePayload(payload, ['codigo', 'nombre', 'tipo', 'marca', 'modelo', 'serial', 'descripcion']);
  requireFields(payload, ['codigo', 'nombre', 'tipo', 'estado_id']);
}

function validateHorarioPayload(payload) {
  sanitizePayload(payload, ['nombre', 'dia_semana', 'hora_inicio', 'hora_fin']);
  requireFields(payload, ['nombre', 'dia_semana', 'hora_inicio', 'hora_fin']);
}

function validateEstadoPayload(payload) {
  sanitizePayload(payload, ['categoria', 'nombre', 'descripcion']);
  requireFields(payload, ['categoria', 'nombre']);
}

function validateReservaPayload(payload) {
  sanitizePayload(payload, ['fecha_reserva', 'fecha_inicio', 'fecha_fin', 'motivo', 'observaciones']);
  requireFields(payload, [
    'usuario_id',
    'espacio_id',
    'horario_id',
    'estado_id',
    'fecha_reserva',
    'fecha_inicio',
    'fecha_fin',
    'motivo'
  ]);

  if (new Date(payload.fecha_inicio) >= new Date(payload.fecha_fin)) {
    const error = new Error('La fecha de inicio debe ser menor que la fecha de fin');
    error.status = 400;
    throw error;
  }
}

module.exports = {
  requireFields,
  cleanString,
  sanitizePayload,
  validateRolePayload,
  validateAuthRegisterPayload,
  validateAuthLoginPayload,
  validateAdminLoginPayload,
  validateUsuarioPayload,
  validateEspacioPayload,
  validateRecursoPayload,
  validateHorarioPayload,
  validateEstadoPayload,
  validateReservaPayload
};
