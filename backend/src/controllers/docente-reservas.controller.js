const docenteReservasService = require('../services/docente-reservas.service');
const { parsePagination } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    const data = await docenteReservasService.listMine(req.user.id, parsePagination(req.query));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list
};
