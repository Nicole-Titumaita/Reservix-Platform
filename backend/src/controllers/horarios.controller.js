const horariosService = require('../services/horarios.service');

async function list(req, res, next) {
  try {
    const data = await horariosService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await horariosService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Horario no encontrado' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await horariosService.create(req.body);
    res.status(201).json({ success: true, message: 'Horario creado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await horariosService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Horario actualizado correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await horariosService.remove(req.params.id);
    res.json({ success: true, message: 'Horario eliminado correctamente' });
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
