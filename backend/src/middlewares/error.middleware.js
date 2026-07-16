function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction || status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 && isProduction
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
