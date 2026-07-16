const { horarios } = require('../models');
const { validateHorarioPayload } = require('../validators');

async function list() {
  return horarios.findAll();
}

async function getById(id) {
  return horarios.findById(id);
}

async function create(data) {
  validateHorarioPayload(data);
  return horarios.create(data);
}

async function update(id, data) {
  validateHorarioPayload(data);

  const current = await horarios.findById(id);
  if (!current) {
    const error = new Error('Horario no encontrado');
    error.status = 404;
    throw error;
  }

  return horarios.update(id, data);
}

async function remove(id) {
  const current = await horarios.findById(id);
  if (!current) {
    const error = new Error('Horario no encontrado');
    error.status = 404;
    throw error;
  }

  return horarios.remove(id);
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
