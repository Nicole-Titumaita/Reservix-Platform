const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.cedula, u.cedula_provincia, u.email, u.telefono, u.codigo_institucional,
            u.creado_en, u.actualizado_en,
            r.id AS rol_id, r.nombre AS rol_nombre,
            e.id AS estado_id, e.nombre AS estado_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     INNER JOIN estados e ON e.id = u.estado_id
     ORDER BY u.id DESC`
  );
  return rows;
}

async function findPaginated({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.cedula, u.cedula_provincia, u.email, u.telefono, u.codigo_institucional,
            u.creado_en, u.actualizado_en,
            r.id AS rol_id, r.nombre AS rol_nombre,
            e.id AS estado_id, e.nombre AS estado_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     INNER JOIN estados e ON e.id = u.estado_id
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  return { rows, total: count.total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT u.id, u.rol_id, u.estado_id, u.nombre, u.apellido, u.cedula, u.cedula_provincia, u.email, u.telefono, u.codigo_institucional,
            u.creado_en, u.actualizado_en,
            r.nombre AS rol_nombre, e.nombre AS estado_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     INNER JOIN estados e ON e.id = u.estado_id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.id, u.rol_id, u.estado_id, u.nombre, u.apellido, u.cedula, u.cedula_provincia, u.email, u.password_hash, u.telefono, u.codigo_institucional,
            r.nombre AS rol_nombre,
            e.nombre AS estado_nombre
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     INNER JOIN estados e ON e.id = u.estado_id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function findByCedula(cedula) {
  const [rows] = await pool.query('SELECT id, cedula FROM usuarios WHERE cedula = ?', [cedula]);
  return rows[0] || null;
}

async function findByCodigoInstitucional(codigo) {
  const [rows] = await pool.query('SELECT id, codigo_institucional FROM usuarios WHERE codigo_institucional = ?', [codigo]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO usuarios
      (rol_id, estado_id, nombre, apellido, cedula, cedula_provincia, email, password_hash, telefono, codigo_institucional)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.rol_id,
      data.estado_id,
      data.nombre,
      data.apellido,
      data.cedula,
      data.cedula_provincia,
      data.email,
      data.password_hash,
      data.telefono || null,
      data.codigo_institucional || null
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE usuarios
     SET rol_id = ?, estado_id = ?, nombre = ?, apellido = ?, cedula = ?, cedula_provincia = ?, email = ?, telefono = ?, codigo_institucional = ?
     WHERE id = ?`,
    [
      data.rol_id,
      data.estado_id,
      data.nombre,
      data.apellido,
      data.cedula,
      data.cedula_provincia,
      data.email,
      data.telefono || null,
      data.codigo_institucional || null,
      id
    ]
  );
  return findById(id);
}

async function updatePassword(id, passwordHash) {
  await pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findPaginated,
  findById,
  findByEmail,
  findByCedula,
  findByCodigoInstitucional,
  create,
  update,
  updatePassword,
  remove
};
