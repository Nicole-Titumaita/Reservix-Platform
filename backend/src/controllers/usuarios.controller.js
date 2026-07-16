const usuariosService = require('../services/usuarios.service');
const { parsePagination } = require('../utils/pagination');
const { buildRequestMeta } = require('../utils/audit');

async function list(req, res, next) {
  try {
    const data = await usuariosService.list(parsePagination(req.query));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await usuariosService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await usuariosService.create(req.body, buildRequestMeta(req));
    res.status(201).json({ success: true, message: 'Usuario creado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await usuariosService.update(req.params.id, req.body, buildRequestMeta(req));
    res.json({ success: true, message: 'Usuario actualizado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await usuariosService.remove(req.params.id, buildRequestMeta(req));
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
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
