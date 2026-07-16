const recursosMovimientosService = require('../services/recursos-movimientos.service');
const { parsePagination } = require('../utils/pagination');
const { buildRequestMeta } = require('../utils/audit');

async function list(req, res, next) {
  try {
    const data = await recursosMovimientosService.list({
      pagination: parsePagination(req.query),
      rolNombre: req.query.rol_nombre || null,
      accion: req.query.accion || null
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listByRecursoId(req, res, next) {
  try {
    const data = await recursosMovimientosService.listByRecursoId(
      req.params.recursoId,
      req.query.rol_nombre || null,
      req.query.accion || null
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await recursosMovimientosService.create(req.body, buildRequestMeta(req));
    res.status(201).json({ success: true, message: 'Movimiento de recurso registrado correctamente', data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  listByRecursoId,
  create
};
