const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const { passwordResets, usuarios, auditoria } = require('../models');

function isDemoEmail(email) {
  return String(email || '').toLowerCase().endsWith('@demo.local');
}

function buildResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildResetUrl(token) {
  return `${env.frontendUrl.replace(/\/$/, '')}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

function createTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });
}

function buildResetEmailTemplate(usuario, resetUrl) {
  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'usuario';
  const expiresMinutes = env.passwordResetExpiresInMinutes;

  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden">
              <tr>
                <td style="background:#0f2a43;padding:24px 28px;color:#ffffff">
                  <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#91c8ff">Sistema Academico</div>
                  <div style="font-size:22px;font-weight:700;margin-top:8px">Recuperacion de contrasena</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px">
                  <p style="font-size:16px;margin:0 0 12px">Hola ${nombre},</p>
                  <p style="font-size:14px;line-height:1.7;color:#526176;margin:0 0 20px">
                    Recibimos una solicitud para restablecer tu contrasena. Si fuiste tu, usa el siguiente boton para crear una nueva contrasena de forma segura.
                  </p>
                  <div style="text-align:center;margin:28px 0">
                    <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:12px;font-weight:700">Restablecer contrasena</a>
                  </div>
                  <div style="background:#edf6ff;border:1px solid #bfdcff;border-radius:14px;padding:16px 18px;font-size:13px;color:#334155;line-height:1.7">
                    <div><strong>Vigencia:</strong> ${expiresMinutes} minutos</div>
                    <div style="margin-top:6px">Si no solicitaste este cambio, puedes ignorar este correo con tranquilidad.</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 28px;color:#64748b;font-size:12px;line-height:1.5">
                  Este correo fue generado automaticamente por el Sistema Academico. No respondas a este mensaje.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

async function sendResetEmail(usuario, token) {
  const resetUrl = buildResetUrl(token);

  if (isDemoEmail(usuario.email) && env.nodeEnv !== 'production') {
    console.log(`[RECUPERACION DEMO] Enlace para ${usuario.email}: ${resetUrl}`);
    return { delivered: false, channel: 'console', resetUrl };
  }

  const transporter = createTransporter();
  if (!transporter) {
    if (env.nodeEnv !== 'production') {
      console.log(`[RECUPERACION DEV SIN SMTP] Enlace para ${usuario.email}: ${resetUrl}`);
      return { delivered: false, channel: 'console', resetUrl };
    }

    const error = new Error('Servicio de correo no configurado');
    error.status = 503;
    throw error;
  }

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: usuario.email,
      subject: 'Recuperacion de contrasena del Sistema Academico',
      text: `Abre este enlace para restablecer tu contrasena: ${resetUrl}. Expira en ${env.passwordResetExpiresInMinutes} minutos.`,
      html: buildResetEmailTemplate(usuario, resetUrl)
    });
  } catch (error) {
    console.error('No fue posible enviar el correo de recuperacion:', {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command
    });
    const sendError = new Error('No fue posible enviar el enlace de recuperacion. Intenta nuevamente en unos minutos.');
    sendError.status = 503;
    throw sendError;
  }

  return { delivered: true, channel: 'email', resetUrl };
}

async function requestPasswordReset(email, meta = {}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const usuario = await usuarios.findByEmail(normalizedEmail);

  if (!usuario) {
    return { success: true, genericMessage: true };
  }

  await passwordResets.invalidateByUserId(usuario.id);

  const token = buildResetToken();
  const tokenHash = hashToken(token);

  await passwordResets.create({
    usuario_id: usuario.id,
    token_hash: tokenHash,
    expires_minutes: env.passwordResetExpiresInMinutes,
    ip: meta.ip,
    user_agent: meta.user_agent
  });

  let delivery;
  try {
    delivery = await sendResetEmail(usuario, token);
  } catch (error) {
    await passwordResets.invalidateByUserId(usuario.id);
    throw error;
  }

  await auditoria.create({
    usuario_id: usuario.id,
    accion: 'PASSWORD_RESET_SOLICITADO',
    entidad: 'usuarios',
    entidad_id: usuario.id,
    detalle: { email: usuario.email, canal: delivery.channel },
    ip: meta.ip,
    user_agent: meta.user_agent
  });

  return { success: true, genericMessage: true, resetUrl: delivery.resetUrl, delivery_channel: delivery.channel };
}

async function validateResetToken(token) {
  const tokenHash = hashToken(String(token || ''));
  const record = await passwordResets.findActiveByTokenHash(tokenHash);

  if (!record) {
    await auditoria.create({
      usuario_id: null,
      accion: 'PASSWORD_RESET_TOKEN_INVALIDO',
      entidad: 'password_resets',
      entidad_id: null,
      detalle: { token_present: Boolean(token) },
      ip: null,
      user_agent: null
    });
    return { valid: false };
  }

  return { valid: true, user_id: record.usuario_id };
}

async function resetPassword({ token, password, confirm_password }, meta = {}) {
  const tokenHash = hashToken(String(token || ''));
  const record = await passwordResets.findActiveByTokenHash(tokenHash);

  if (!record) {
    await auditoria.create({
      usuario_id: null,
      accion: 'PASSWORD_RESET_TOKEN_EXPIRADO',
      entidad: 'password_resets',
      entidad_id: null,
      detalle: { token_present: Boolean(token) },
      ip: meta.ip,
      user_agent: meta.user_agent
    });
    const error = new Error('El enlace no es valido o ha expirado');
    error.status = 400;
    throw error;
  }

  if (!password || String(password).length < 8) {
    const error = new Error('La contrasena debe tener al menos 8 caracteres');
    error.status = 400;
    throw error;
  }

  if (String(password) !== String(confirm_password || '')) {
    const error = new Error('Las contrasenas no coinciden');
    error.status = 400;
    throw error;
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if (!passwordPattern.test(String(password))) {
    const error = new Error('La contrasena no cumple con los requisitos de seguridad');
    error.status = 400;
    throw error;
  }

  const usuario = await usuarios.findById(record.usuario_id);
  if (!usuario) {
    const error = new Error('El enlace no es valido o ha expirado');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  await usuarios.updatePassword(usuario.id, passwordHash);
  await passwordResets.markUsed(record.id);
  await passwordResets.invalidateByUserId(usuario.id);

  await auditoria.create({
    usuario_id: usuario.id,
    accion: 'PASSWORD_RESET_EJECUTADO',
    entidad: 'usuarios',
    entidad_id: usuario.id,
    detalle: { email: usuario.email },
    ip: meta.ip,
    user_agent: meta.user_agent
  });

  return { success: true };
}

module.exports = {
  requestPasswordReset,
  validateResetToken,
  resetPassword
};
