const { reservas } = require('../models');
const { buildPaginatedResult } = require('../utils/pagination');

async function listMine(userId, pagination = null) {
  if (!pagination) {
    return reservas.findByUserId(userId);
  }

  const { rows, total } = await reservas.findByUserIdPaginated(userId, pagination);
  return buildPaginatedResult(rows, total, pagination);
}

module.exports = {
  listMine
};
