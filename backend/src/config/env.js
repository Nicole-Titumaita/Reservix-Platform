require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 24 || jwtSecret === 'dev_secret') {
  throw new Error('JWT_SECRET debe existir en .env y tener al menos 24 caracteres seguros');
}

if (!process.env.DB_NAME) {
  throw new Error('DB_NAME debe estar configurado en .env');
}

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  passwordResetExpiresInMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4201',
  corsOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:4201')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@demo.local'
  }
};
