const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    if (!token || token.length < 20) {
      return res.status(401).json({
        success: false,
        message: 'Token invalido o expirado'
      });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload?.id || !payload?.rol) {
      return res.status(401).json({
        success: false,
        message: 'Token invalido o expirado'
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalido o expirado'
    });
  }
}

module.exports = authMiddleware;
