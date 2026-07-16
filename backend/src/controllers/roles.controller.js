const rolesService = require('../services/roles.service');
const { buildRequestMeta } = require('../utils/audit');

async function list(req, res, next) {
  try {
    const data = await rolesService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await rolesService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await rolesService.create(req.body, buildRequestMeta(req));
    res.status(201).json({ success: true, message: 'Rol creado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await rolesService.update(req.params.id, req.body, buildRequestMeta(req));
    res.json({ success: true, message: 'Rol actualizado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await rolesService.remove(req.params.id, buildRequestMeta(req));
    res.json({ success: true, message: 'Rol eliminado correctamente' });
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
