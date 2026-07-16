const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT e.id, e.estado_id, e.codigo, e.nombre, e.tipo, e.ubicacion, e.capacidad, e.descripcion,
            e.creado_en, e.actualizado_en,
            s.nombre AS estado_nombre
     FROM espacios e
     INNER JOIN estados s ON s.id = e.estado_id
     ORDER BY e.id DESC`
  );
  return rows;
}

async function findPaginated({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT e.id, e.estado_id, e.codigo, e.nombre, e.tipo, e.ubicacion, e.capacidad, e.descripcion,
            e.creado_en, e.actualizado_en,
            s.nombre AS estado_nombre
     FROM espacios e
     INNER JOIN estados s ON s.id = e.estado_id
     ORDER BY e.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM espacios');
  return { rows, total: count.total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT e.id, e.estado_id, e.codigo, e.nombre, e.tipo, e.ubicacion, e.capacidad, e.descripcion,
            e.creado_en, e.actualizado_en,
            s.nombre AS estado_nombre
     FROM espacios e
     INNER JOIN estados s ON s.id = e.estado_id
     WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByCodigo(codigo) {
  const [rows] = await pool.query(
    'SELECT id, estado_id, codigo, nombre, tipo, ubicacion, capacidad, descripcion FROM espacios WHERE codigo = ?',
    [codigo]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO espacios (estado_id, codigo, nombre, tipo, ubicacion, capacidad, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.estado_id,
      data.codigo,
      data.nombre,
      data.tipo,
      data.ubicacion || null,
      data.capacidad || 0,
      data.descripcion || null
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE espacios
     SET estado_id = ?, codigo = ?, nombre = ?, tipo = ?, ubicacion = ?, capacidad = ?, descripcion = ?
     WHERE id = ?`,
    [
      data.estado_id,
      data.codigo,
      data.nombre,
      data.tipo,
      data.ubicacion || null,
      data.capacidad || 0,
      data.descripcion || null,
      id
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM espacios WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findPaginated,
  findById,
  findByCodigo,
  create,
  update,
  remove
};
