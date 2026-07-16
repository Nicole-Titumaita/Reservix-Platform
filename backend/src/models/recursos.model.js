const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT r.id, r.espacio_id, r.estado_id, r.codigo, r.nombre, r.tipo, r.marca, r.modelo, r.serial,
            r.descripcion, r.creado_en, r.actualizado_en,
            e.nombre AS espacio_nombre,
            s.nombre AS estado_nombre
     FROM recursos r
     LEFT JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN estados s ON s.id = r.estado_id
     ORDER BY r.id DESC`
  );
  return rows;
}

async function findPaginated({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT r.id, r.espacio_id, r.estado_id, r.codigo, r.nombre, r.tipo, r.marca, r.modelo, r.serial,
            r.descripcion, r.creado_en, r.actualizado_en,
            e.nombre AS espacio_nombre,
            s.nombre AS estado_nombre
     FROM recursos r
     LEFT JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN estados s ON s.id = r.estado_id
     ORDER BY r.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM recursos');
  return { rows, total: count.total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.id, r.espacio_id, r.estado_id, r.codigo, r.nombre, r.tipo, r.marca, r.modelo, r.serial,
            r.descripcion, r.creado_en, r.actualizado_en,
            e.nombre AS espacio_nombre,
            s.nombre AS estado_nombre
     FROM recursos r
     LEFT JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN estados s ON s.id = r.estado_id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByCodigo(codigo) {
  const [rows] = await pool.query(
    'SELECT id, espacio_id, estado_id, codigo, nombre, tipo, marca, modelo, serial, descripcion FROM recursos WHERE codigo = ?',
    [codigo]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO recursos
      (espacio_id, estado_id, codigo, nombre, tipo, marca, modelo, serial, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.espacio_id || null,
      data.estado_id,
      data.codigo,
      data.nombre,
      data.tipo,
      data.marca || null,
      data.modelo || null,
      data.serial || null,
      data.descripcion || null
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE recursos
     SET espacio_id = ?, estado_id = ?, codigo = ?, nombre = ?, tipo = ?, marca = ?, modelo = ?, serial = ?, descripcion = ?
     WHERE id = ?`,
    [
      data.espacio_id || null,
      data.estado_id,
      data.codigo,
      data.nombre,
      data.tipo,
      data.marca || null,
      data.modelo || null,
      data.serial || null,
      data.descripcion || null,
      id
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM recursos WHERE id = ?', [id]);
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
