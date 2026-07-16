const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const { twoFactorCodes, usuarios } = require('../models');

const OTP_EXPIRES_MINUTES = 5;
const PURPOSE_LOGIN = 'LOGIN';
const PURPOSE_ADMIN = 'ADMIN_LOGIN';

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function isDemoEmail(email) {
  return String(email || '').toLowerCase().endsWith('@demo.local');
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

async function verifySmtpConnection() {
  const transporter = createTransporter();
  if (!transporter) {
    if (env.nodeEnv === 'production') {
      throw new Error('SMTP no configurado en produccion');
    }
    console.warn('SMTP no configurado. En desarrollo se usara consola para mostrar OTP.');
    return false;
  }

  await transporter.verify();
  console.log(`SMTP verificado correctamente: ${env.smtp.host}:${env.smtp.port} (${env.smtp.secure ? 'SSL' : 'STARTTLS'})`);
  return true;
}

function buildOtpEmailTemplate(usuario, otp) {
  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'usuario';
  return `
    <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#172033">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:28px 12px">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dbe4f0;border-radius:18px;overflow:hidden">
              <tr>
                <td style="background:#0f2a43;padding:24px 28px;color:#ffffff">
                  <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#91c8ff">Sistema Academico</div>
                  <div style="font-size:22px;font-weight:700;margin-top:8px">Reservas de Espacios y Recursos</div>
                </td>
              </tr>
              <tr>
                <td style="padding:30px 28px">
                  <p style="font-size:16px;margin:0 0 12px">Hola ${nombre},</p>
                  <p style="font-size:14px;line-height:1.6;color:#526176;margin:0 0 20px">
                    Usa el siguiente codigo para completar tu inicio de sesion. Este codigo es personal y no debes compartirlo.
                  </p>
                  <div style="background:#edf6ff;border:1px solid #bfdcff;border-radius:16px;text-align:center;padding:22px;margin:22px 0">
                    <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#2563eb;font-weight:700">Codigo OTP</div>
                    <div style="font-size:34px;letter-spacing:8px;font-weight:800;color:#0f2a43;margin-top:8px">${otp}</div>
                  </div>
                  <p style="font-size:14px;line-height:1.6;color:#526176;margin:0">
                    El codigo expira en <strong>${OTP_EXPIRES_MINUTES} minutos</strong>. Si no solicitaste este acceso, ignora este mensaje.
                  </p>
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

async function sendOtpEmail(usuario, otp) {
  if (isDemoEmail(usuario.email)) {
    if (env.nodeEnv !== 'production') {
      console.log(`[2FA DEMO] OTP para ${usuario.email}: ${otp}`);
    }
    return { delivered: false, channel: 'console' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    if (env.nodeEnv !== 'production') {
      console.log(`[2FA DEV SIN SMTP] OTP para ${usuario.email}: ${otp}`);
      return { delivered: false, channel: 'console' };
    }

    const error = new Error('Servicio de correo no configurado');
    error.status = 503;
    throw error;
  }

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to: usuario.email,
      subject: 'Codigo de verificacion del Sistema Academico',
      text: `Tu codigo de verificacion es ${otp}. Expira en ${OTP_EXPIRES_MINUTES} minutos.`,
      html: buildOtpEmailTemplate(usuario, otp)
    });
  } catch (error) {
    console.error('No fue posible enviar el codigo OTP por correo:', {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command
    });
    const sendError = new Error('No fue posible enviar el codigo de verificacion. Intenta nuevamente en unos minutos.');
    sendError.status = 503;
    throw sendError;
  }

  return { delivered: true, channel: 'email' };
}

async function createAndSend(usuario) {
  const purpose = usuario.rol_nombre === 'ADMINISTRADOR' ? PURPOSE_ADMIN : PURPOSE_LOGIN;
  await twoFactorCodes.invalidateActive(usuario.id, purpose);
  const otp = generateOtp();
  const codeHash = await bcrypt.hash(otp, 10);

  await twoFactorCodes.create({
    usuario_id: usuario.id,
    purpose,
    code_hash: codeHash,
    expires_minutes: OTP_EXPIRES_MINUTES
  });

  const delivery = await sendOtpEmail(usuario, otp);

  return {
    requires_2fa: true,
    two_factor_token: Buffer.from(`${usuario.id}:${Date.now()}`).toString('base64url'),
    user_id: usuario.id,
    expires_in_minutes: OTP_EXPIRES_MINUTES,
    delivery_channel: delivery.channel
  };
}

async function verifyCode({ user_id, code }) {
  if (!user_id || !/^\d{6}$/.test(String(code || ''))) {
    const error = new Error('Codigo de verificacion invalido');
    error.status = 400;
    throw error;
  }

  const usuario = await usuarios.findById(user_id);
  const purpose = usuario?.rol_nombre === 'ADMINISTRADOR' ? PURPOSE_ADMIN : PURPOSE_LOGIN;
  const record = await twoFactorCodes.findLatestActive(user_id, purpose);
  if (!record) {
    const error = new Error('Codigo expirado o no disponible');
    error.status = 400;
    throw error;
  }

  const ok = await bcrypt.compare(String(code), record.code_hash);
  if (!ok) {
    const error = new Error('Codigo de verificacion invalido');
    error.status = 401;
    throw error;
  }

  await twoFactorCodes.markUsed(record.id);
  return usuarios.findById(user_id);
}

async function resendCode({ user_id }) {
  if (!user_id) {
    const error = new Error('Usuario requerido para reenviar codigo');
    error.status = 400;
    throw error;
  }

  const usuario = await usuarios.findById(user_id);
  if (!usuario || usuario.estado_nombre !== 'ACTIVO') {
    const error = new Error('Acceso no autorizado');
    error.status = 403;
    throw error;
  }

  return createAndSend(usuario);
}

module.exports = {
  createAndSend,
  verifyCode,
  resendCode,
  verifySmtpConnection
};
