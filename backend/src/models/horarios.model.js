const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, nombre, dia_semana, hora_inicio, hora_fin, activo, creado_en FROM horarios ORDER BY id DESC'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, nombre, dia_semana, hora_inicio, hora_fin, activo, creado_en FROM horarios WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO horarios (nombre, dia_semana, hora_inicio, hora_fin, activo)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.nombre,
      data.dia_semana,
      data.hora_inicio,
      data.hora_fin,
      data.activo === undefined ? 1 : data.activo
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE horarios
     SET nombre = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ?, activo = ?
     WHERE id = ?`,
    [
      data.nombre,
      data.dia_semana,
      data.hora_inicio,
      data.hora_fin,
      data.activo === undefined ? 1 : data.activo,
      id
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM horarios WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
