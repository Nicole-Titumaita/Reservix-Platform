const { historial, reservas } = require('../models');

async function list() {
  return historial.findAll();
}

async function listByReservaId(reservaId) {
  const reserva = await reservas.findById(reservaId);
  if (!reserva) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  return historial.findByReservaId(reservaId);
}

async function listMine(userId) {
  return historial.findByUserId(userId);
}

async function listByReservaIdForUser(reservaId, user) {
  const reserva = await reservas.findById(reservaId);
  if (!reserva) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  if (user?.rol !== 'ADMINISTRADOR' && reserva.usuario_id !== user?.id) {
    const error = new Error('No tienes permiso para consultar este historial');
    error.status = 403;
    throw error;
  }

  return historial.findByReservaId(reservaId);
}

module.exports = {
  list,
  listByReservaId,
  listMine,
  listByReservaIdForUser
};
