const reservasService = require('../services/reservas.service');
const { parsePagination } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    const data = await reservasService.list(parsePagination(req.query));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function listMine(req, res, next) {
  try {
    const data = await reservasService.listByUserId(req.user.id, parsePagination(req.query));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function disponibilidad(req, res, next) {
  try {
    const data = await reservasService.checkDisponibilidad(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await reservasService.getByIdForUser(req.params.id, req.user);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const actorUserId = req.user?.id;
    const data = req.user?.rol === 'ADMINISTRADOR'
      ? await reservasService.create(req.body, actorUserId)
      : await reservasService.createForUser(req.body, req.user);
    res.status(201).json({ success: true, message: 'Reserva creada correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const actorUserId = req.user?.id;
    const data = req.user?.rol === 'ADMINISTRADOR'
      ? await reservasService.update(req.params.id, req.body, actorUserId)
      : await reservasService.updateForUser(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'Reserva actualizada correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const actorUserId = req.user?.id;
    await reservasService.remove(req.params.id, actorUserId);
    res.json({ success: true, message: 'Reserva eliminada correctamente' });
  } catch (error) {
    next(error);
  }
}

async function aprobar(req, res, next) {
  try {
    const data = await reservasService.changeState(req.params.id, 'APROBADA', req.user?.id, req.body?.observacion);
    res.json({ success: true, message: 'Reserva aprobada correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function rechazar(req, res, next) {
  try {
    const data = await reservasService.changeState(req.params.id, 'RECHAZADA', req.user?.id, req.body?.observacion);
    res.json({ success: true, message: 'Reserva rechazada correctamente', data });
  } catch (error) {
    next(error);
  }
}

async function cancelar(req, res, next) {
  try {
    const data = req.user?.rol === 'ADMINISTRADOR'
      ? await reservasService.changeState(req.params.id, 'CANCELADA', req.user?.id, req.body?.observacion)
      : await reservasService.cancelForUser(req.params.id, req.user, req.body?.observacion);
    res.json({ success: true, message: 'Reserva cancelada correctamente', data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  listMine,
  disponibilidad,
  getById,
  create,
  update,
  remove,
  aprobar,
  rechazar,
  cancelar
};
