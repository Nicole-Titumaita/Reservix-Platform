function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user && (req.user.rol || req.user.rol_id);
    if (!req.user || !allowedRoles.map(String).includes(String(userRole))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta accion'
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
