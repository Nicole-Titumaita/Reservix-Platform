const { historial } = require('../models');

async function listMine(userId) {
  return historial.findByUserId(userId);
}

module.exports = {
  listMine
};
