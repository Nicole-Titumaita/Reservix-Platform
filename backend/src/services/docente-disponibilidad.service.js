const reservasService = require('./reservas.service');

async function checkDisponibilidad(query) {
  return reservasService.checkDisponibilidad(query);
}

module.exports = {
  checkDisponibilidad
};
