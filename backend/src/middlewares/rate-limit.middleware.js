const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Intenta nuevamente en unos minutos.'
  }
});

const apiBurstLimiter = rateLimit({
  windowMs: 5 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes en muy poco tiempo. Espera unos segundos e intenta nuevamente.'
  }
});

const authBurstLimiter = rateLimit({
  windowMs: 5 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos seguidos. Espera unos segundos antes de volver a intentar.'
  }
});

const passwordRecoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Si el correo pertenece a una cuenta registrada, recibirás un enlace para restablecer tu contraseña.'
  }
});

module.exports = {
  loginLimiter,
  apiBurstLimiter,
  authBurstLimiter,
  passwordRecoveryLimiter
};
