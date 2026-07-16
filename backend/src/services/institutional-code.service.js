const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const { institutionalCodes, roles, auditoria } = require('../models');

const PURPOSE_REGISTRO = 'REGISTRO';
const CODE_EXPIRES_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildPrefix(roleName) {
  const map = {
    ADMINISTRADOR: 'ADM',
    DOCENTE: 'DOC',
    ESTUDIANTE: 'EST'
  };
  return map[String(roleName || '').toUpperCase()] || null;
}

function createTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass }
  });
}

function buildTemplate(email, codeDisplay) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:24px;color:#172033">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #dbe4f0;overflow:hidden">
        <div style="background:#0f2a43;color:#fff;padding:22px 26px">
          <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#91c8ff">Sistema Academico</div>
          <div style="font-size:22px;font-weight:700;margin-top:8px">Codigo institucional</div>
        </div>
        <div style="padding:28px 26px">
          <p style="margin:0 0 12px;font-size:15px">Hola,</p>
          <p style="margin:0 0 18px;color:#526176;line-height:1.6;font-size:14px">
            Usa el siguiente codigo para completar tu registro con el correo ${email}.
          </p>
          <div style="background:#edf6ff;border:1px solid #bfdcff;border-radius:14px;padding:18px;text-align:center">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#2563eb;font-weight:700">Codigo institucional</div>
            <div style="font-size:30px;font-weight:800;letter-spacing:4px;color:#0f2a43;margin-top:8px">${codeDisplay}</div>
          </div>
          <p style="margin:18px 0 0;color:#526176;font-size:13px;line-height:1.6">
            Expira en ${CODE_EXPIRES_MINUTES} minutos. No compartas este codigo.
          </p>
        </div>
      </div>
    </div>
  `;
}

async function nextSequence(conn, roleId, roleName) {
  const prefix = buildPrefix(roleName);
  if (!prefix) {
    const error = new Error('Rol no valido para generar codigo institucional');
    error.status = 400;
    throw error;
  }

  const year = new Date().getFullYear();
  const sequenceKey = `${prefix}:${year}`;

  const [rows] = await conn.query(
    'SELECT id, next_sequence FROM institutional_code_sequences WHERE sequence_key = ? FOR UPDATE',
    [sequenceKey]
  );

  let sequence = 1;
  if (rows.length > 0) {
    sequence = rows[0].next_sequence;
    await conn.query(
      'UPDATE institutional_code_sequences SET next_sequence = next_sequence + 1 WHERE id = ?',
      [rows[0].id]
    );
  } else {
    await conn.query(
      'INSERT INTO institutional_code_sequences (sequence_key, rol_id, rol_nombre, prefix, year, next_sequence) VALUES (?, ?, ?, ?, ?, 2)',
      [sequenceKey, roleId, roleName, prefix, year]
    );
  }

  return { prefix, year, sequence };
}

async function sendCodeEmail(email, codeDisplay) {
  const transporter = createTransporter();
  if (!transporter) {
    if (env.nodeEnv !== 'production') {
      console.log(`[CODIGO INSTITUCIONAL DEV] Para ${email}: ${codeDisplay}`);
      return { delivered: false, channel: 'console' };
    }
    const error = new Error('Servicio de correo no configurado');
    error.status = 503;
    throw error;
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to: email,
    subject: 'Codigo institucional del Sistema Academico',
    text: `Tu codigo institucional es ${codeDisplay}. Expira en ${CODE_EXPIRES_MINUTES} minutos.`,
    html: buildTemplate(email, codeDisplay)
  });

  return { delivered: true, channel: 'email' };
}

async function requestInstitutionalCode({ email, rol_id }) {
  const normalizedEmail = normalizeEmail(email);
  const rol = await roles.findById(rol_id);
  if (!rol) {
    const error = new Error('Rol no valido');
    error.status = 400;
    throw error;
  }

  const prefix = buildPrefix(rol.nombre);
  if (!prefix) {
    const error = new Error('Rol no valido para generar codigo institucional');
    error.status = 400;
    throw error;
  }

  const conn = await require('../config/db').pool.getConnection();
  try {
    await conn.beginTransaction();
    await institutionalCodes.invalidateActiveByEmailAndRole(normalizedEmail, rol.id, PURPOSE_REGISTRO);
    const { sequence, year } = await nextSequence(conn, rol.id, rol.nombre);
    const codeDisplay = `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
    const codeHash = await bcrypt.hash(codeDisplay, 10);

    const [result] = await conn.query(
      `INSERT INTO institutional_codes
        (email, rol_id, rol_nombre, code_hash, code_display, expires_at, attempts, purpose)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, ?)`,
      [normalizedEmail, rol.id, rol.nombre, codeHash, codeDisplay, CODE_EXPIRES_MINUTES, PURPOSE_REGISTRO]
    );

    await conn.commit();

    const delivery = await sendCodeEmail(normalizedEmail, codeDisplay);
    await auditoria.create({
      usuario_id: null,
      accion: 'CODIGO_INSTITUCIONAL_GENERADO',
      entidad: 'institutional_codes',
      entidad_id: result.insertId,
      detalle: { email: normalizedEmail, rol: rol.nombre, code_display: codeDisplay, channel: delivery.channel },
      ip: null,
      user_agent: null
    });

    return {
      success: true,
      message: 'Codigo enviado al correo',
      data: {
        email: normalizedEmail,
        role: rol.nombre,
        expires_in_minutes: CODE_EXPIRES_MINUTES,
        delivery_channel: delivery.channel
      }
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function verifyInstitutionalCode({ email, rol_id, code }) {
  const normalizedEmail = normalizeEmail(email);
  const rol = await roles.findById(rol_id);
  if (!rol) {
    const error = new Error('Rol no valido');
    error.status = 400;
    throw error;
  }

  const record = await institutionalCodes.findLatestActiveByEmailAndRole(normalizedEmail, rol.id, PURPOSE_REGISTRO);
  if (!record) {
    await auditoria.create({
      usuario_id: null,
      accion: 'CODIGO_INSTITUCIONAL_INVALIDO',
      entidad: 'institutional_codes',
      entidad_id: null,
      detalle: { email: normalizedEmail, rol: rol.nombre, reason: 'NO_DISPONIBLE' },
      ip: null,
      user_agent: null
    });
    const error = new Error('Codigo expirado o no disponible');
    error.status = 400;
    throw error;
  }

  if (record.attempts >= MAX_CODE_ATTEMPTS) {
    await auditoria.create({
      usuario_id: null,
      accion: 'CODIGO_INSTITUCIONAL_BLOQUEADO',
      entidad: 'institutional_codes',
      entidad_id: record.id,
      detalle: { email: normalizedEmail, rol: rol.nombre },
      ip: null,
      user_agent: null
    });
    const error = new Error('Codigo expirado o no disponible');
    error.status = 429;
    throw error;
  }

  const ok = await bcrypt.compare(String(code || ''), record.code_hash);
  if (!ok) {
    await institutionalCodes.incrementAttempts(record.id);
    await auditoria.create({
      usuario_id: null,
      accion: 'CODIGO_INSTITUCIONAL_FALLIDO',
      entidad: 'institutional_codes',
      entidad_id: record.id,
      detalle: { email: normalizedEmail, rol: rol.nombre },
      ip: null,
      user_agent: null
    });
    const error = new Error('Codigo invalido');
    error.status = 400;
    throw error;
  }

  await institutionalCodes.markUsed(record.id);
  await auditoria.create({
    usuario_id: null,
    accion: 'CODIGO_INSTITUCIONAL_VERIFICADO',
    entidad: 'institutional_codes',
    entidad_id: record.id,
    detalle: { email: normalizedEmail, rol: rol.nombre, code_display: record.code_display },
    ip: null,
    user_agent: null
  });

  return {
    success: true,
    message: 'Codigo verificado correctamente',
    data: {
      email: normalizedEmail,
      rol_id: rol.id,
      rol_nombre: rol.nombre,
      code_display: record.code_display
    }
  };
}

module.exports = {
  requestInstitutionalCode,
  verifyInstitutionalCode
};
