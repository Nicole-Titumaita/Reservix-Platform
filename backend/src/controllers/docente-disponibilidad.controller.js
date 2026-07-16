const docenteDisponibilidadService = require('../services/docente-disponibilidad.service');

async function check(req, res, next) {
  try {
    const data = await docenteDisponibilidadService.checkDisponibilidad(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  check
};
