const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, r.espacio_id, r.horario_id, r.estado_id, r.fecha_reserva,
            r.fecha_inicio, r.fecha_fin, r.motivo, r.observaciones, r.creado_en, r.actualizado_en,
            u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
            e.nombre AS espacio_nombre,
            h.nombre AS horario_nombre,
            s.nombre AS estado_nombre
     FROM reservas r
     INNER JOIN usuarios u ON u.id = r.usuario_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN horarios h ON h.id = r.horario_id
     INNER JOIN estados s ON s.id = r.estado_id
     ORDER BY r.id DESC`
  );
  return rows;
}

async function findPaginated({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, r.espacio_id, r.horario_id, r.estado_id, r.fecha_reserva,
            r.fecha_inicio, r.fecha_fin, r.motivo, r.observaciones, r.creado_en, r.actualizado_en,
            u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
            e.nombre AS espacio_nombre,
            h.nombre AS horario_nombre,
            s.nombre AS estado_nombre
     FROM reservas r
     INNER JOIN usuarios u ON u.id = r.usuario_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN horarios h ON h.id = r.horario_id
     INNER JOIN estados s ON s.id = r.estado_id
     ORDER BY r.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM reservas');
  return { rows, total: count.total };
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, r.espacio_id, r.horario_id, r.estado_id, r.fecha_reserva,
            r.fecha_inicio, r.fecha_fin, r.motivo, r.observaciones, r.creado_en, r.actualizado_en,
            u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
            e.nombre AS espacio_nombre,
            h.nombre AS horario_nombre,
            s.nombre AS estado_nombre
     FROM reservas r
     INNER JOIN usuarios u ON u.id = r.usuario_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN horarios h ON h.id = r.horario_id
     INNER JOIN estados s ON s.id = r.estado_id
     WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByUserId(usuarioId) {
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, r.espacio_id, r.horario_id, r.estado_id, r.fecha_reserva,
            r.fecha_inicio, r.fecha_fin, r.motivo, r.observaciones, r.creado_en, r.actualizado_en,
            u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
            e.nombre AS espacio_nombre,
            h.nombre AS horario_nombre,
            s.nombre AS estado_nombre
     FROM reservas r
     INNER JOIN usuarios u ON u.id = r.usuario_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN horarios h ON h.id = r.horario_id
     INNER JOIN estados s ON s.id = r.estado_id
     WHERE r.usuario_id = ?
     ORDER BY r.id DESC`,
    [usuarioId]
  );
  return rows;
}

async function findByUserIdPaginated(usuarioId, { limit, offset }) {
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, r.espacio_id, r.horario_id, r.estado_id, r.fecha_reserva,
            r.fecha_inicio, r.fecha_fin, r.motivo, r.observaciones, r.creado_en, r.actualizado_en,
            u.nombre AS usuario_nombre, u.apellido AS usuario_apellido,
            e.nombre AS espacio_nombre,
            h.nombre AS horario_nombre,
            s.nombre AS estado_nombre
     FROM reservas r
     INNER JOIN usuarios u ON u.id = r.usuario_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN horarios h ON h.id = r.horario_id
     INNER JOIN estados s ON s.id = r.estado_id
     WHERE r.usuario_id = ?
     ORDER BY r.id DESC
     LIMIT ? OFFSET ?`,
    [usuarioId, limit, offset]
  );
  const [[count]] = await pool.query('SELECT COUNT(*) AS total FROM reservas WHERE usuario_id = ?', [usuarioId]);
  return { rows, total: count.total };
}

async function findConflictingReservation(espacioId, fechaInicio, fechaFin, excludeId = null) {
  let sql = `
    SELECT id, espacio_id, fecha_inicio, fecha_fin, estado_id
    FROM reservas
    WHERE espacio_id = ?
      AND estado_id IN (
        SELECT id FROM estados WHERE categoria = 'RESERVA' AND nombre IN ('PENDIENTE', 'APROBADA')
      )
      AND (
        (fecha_inicio < ? AND fecha_fin > ?)
        OR (fecha_inicio >= ? AND fecha_inicio < ?)
      )`;

  const params = [espacioId, fechaFin, fechaInicio, fechaInicio, fechaFin];

  if (excludeId) {
    sql += ' AND id <> ?';
    params.push(excludeId);
  }

  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function create(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO reservas
      (usuario_id, espacio_id, horario_id, estado_id, fecha_reserva, fecha_inicio, fecha_fin, motivo, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.usuario_id,
      data.espacio_id,
      data.horario_id,
      data.estado_id,
      data.fecha_reserva,
      data.fecha_inicio,
      data.fecha_fin,
      data.motivo,
      data.observaciones || null
    ]
  );
  return result.insertId;
}

async function update(connection, id, data) {
  await connection.query(
    `UPDATE reservas
     SET usuario_id = ?, espacio_id = ?, horario_id = ?, estado_id = ?, fecha_reserva = ?, fecha_inicio = ?, fecha_fin = ?, motivo = ?, observaciones = ?
     WHERE id = ?`,
    [
      data.usuario_id,
      data.espacio_id,
      data.horario_id,
      data.estado_id,
      data.fecha_reserva,
      data.fecha_inicio,
      data.fecha_fin,
      data.motivo,
      data.observaciones || null,
      id
    ]
  );
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM reservas WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findPaginated,
  findById,
  findByUserId,
  findByUserIdPaginated,
  findConflictingReservation,
  create,
  update,
  remove
};
