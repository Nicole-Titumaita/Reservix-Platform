const estadosService = require('../services/estados.service');
const { buildRequestMeta } = require('../utils/audit');

async function list(req, res, next) {
  try {
    const category = req.query.categoria;
    const data = category ? await estadosService.listByCategory(category) : await estadosService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await estadosService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Estado no encontrado' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await estadosService.create(req.body, buildRequestMeta(req));
    res.status(201).json({ success: true, message: 'Estado creado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await estadosService.update(req.params.id, req.body, buildRequestMeta(req));
    res.json({ success: true, message: 'Estado actualizado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await estadosService.remove(req.params.id, buildRequestMeta(req));
    res.json({ success: true, message: 'Estado eliminado correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
