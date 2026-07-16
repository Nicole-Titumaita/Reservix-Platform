const docenteHistorialService = require('../services/docente-historial.service');

async function list(req, res, next) {
  try {
    const data = await docenteHistorialService.listMine(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list
};
