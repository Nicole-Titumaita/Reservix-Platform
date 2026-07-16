const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, categoria, nombre, descripcion, activo, creado_en FROM estados ORDER BY categoria ASC, id ASC'
  );
  return rows;
}

async function findByCategory(category) {
  const [rows] = await pool.query(
    'SELECT id, categoria, nombre, descripcion, activo, creado_en FROM estados WHERE categoria = ? AND activo = 1 ORDER BY id ASC',
    [category]
  );
  return rows;
}

async function findByName(category, name) {
  const [rows] = await pool.query(
    'SELECT id, categoria, nombre, descripcion, activo, creado_en FROM estados WHERE categoria = ? AND nombre = ? LIMIT 1',
    [category, name]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, categoria, nombre, descripcion, activo, creado_en FROM estados WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findByCategoryAndName(category, name) {
  const [rows] = await pool.query(
    'SELECT id, categoria, nombre, descripcion, activo, creado_en FROM estados WHERE categoria = ? AND nombre = ? LIMIT 1',
    [category, name]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    'INSERT INTO estados (categoria, nombre, descripcion, activo) VALUES (?, ?, ?, ?)',
    [data.categoria, data.nombre, data.descripcion || null, data.activo === undefined ? 1 : data.activo]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    'UPDATE estados SET categoria = ?, nombre = ?, descripcion = ?, activo = ? WHERE id = ?',
    [data.categoria, data.nombre, data.descripcion || null, data.activo === undefined ? 1 : data.activo, id]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM estados WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findByCategory,
  findByName,
  findById,
  findByCategoryAndName,
  create,
  update,
  remove
};
