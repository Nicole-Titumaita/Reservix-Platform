const { pool } = require('../config/db');

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO auditoria
      (usuario_id, accion, entidad, entidad_id, detalle, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.usuario_id || null,
      data.accion,
      data.entidad,
      data.entidad_id ? String(data.entidad_id) : null,
      data.detalle ? JSON.stringify(data.detalle) : null,
      data.ip || null,
      data.user_agent || null
    ]
  );
  return result.insertId;
}

async function findPaginated({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT a.id, a.usuario_id, a.accion, a.entidad, a.entidad_id, a.detalle, a.ip, a.user_agent, a.created_at,
            u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.email AS usuario_email
     FROM auditoria a
     LEFT JOIN usuarios u ON u.id = a.usuario_id
     ORDER BY a.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM auditoria');
  return { rows, total: count.total };
}

module.exports = {
  create,
  findPaginated
};
