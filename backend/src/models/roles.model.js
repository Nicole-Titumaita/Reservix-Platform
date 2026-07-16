const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT id, nombre, descripcion, creado_en FROM roles ORDER BY id DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, nombre, descripcion, creado_en FROM roles WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByName(nombre) {
  const [rows] = await pool.query('SELECT id, nombre, descripcion, creado_en FROM roles WHERE nombre = ?', [nombre]);
  return rows[0] || null;
}

async function create({ nombre, descripcion }) {
  const [result] = await pool.query('INSERT INTO roles (nombre, descripcion) VALUES (?, ?)', [
    nombre,
    descripcion || null
  ]);
  return findById(result.insertId);
}

async function update(id, { nombre, descripcion }) {
  await pool.query('UPDATE roles SET nombre = ?, descripcion = ? WHERE id = ?', [
    nombre,
    descripcion || null,
    id
  ]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM roles WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove
};
