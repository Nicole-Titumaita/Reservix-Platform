const historialService = require('../services/historial.service');

async function list(req, res, next) {
  try {
    const data = await historialService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listByReservaId(req, res, next) {
  try {
    const data = await historialService.listByReservaIdForUser(req.params.reservaId, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listMine(req, res, next) {
  try {
    const data = await historialService.listMine(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  listByReservaId,
  listMine
};
