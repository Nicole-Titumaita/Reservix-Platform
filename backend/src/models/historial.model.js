const { pool } = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT h.id, h.reserva_id, h.usuario_id, h.estado_anterior_id, h.estado_nuevo_id,
            h.accion, h.observacion, h.fecha_accion,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            r.motivo AS reserva_motivo,
            r.fecha_inicio,
            r.fecha_fin,
            e.nombre AS espacio_nombre,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_reservas h
     INNER JOIN usuarios u ON u.id = h.usuario_id
     INNER JOIN reservas r ON r.id = h.reserva_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     LEFT JOIN estados ea ON ea.id = h.estado_anterior_id
     INNER JOIN estados en ON en.id = h.estado_nuevo_id
     ORDER BY h.id DESC`
  );
  return rows;
}

async function findByReservaId(reservaId) {
  const [rows] = await pool.query(
    `SELECT h.id, h.reserva_id, h.usuario_id, h.estado_anterior_id, h.estado_nuevo_id,
            h.accion, h.observacion, h.fecha_accion,
            r.motivo AS reserva_motivo,
            r.fecha_inicio,
            r.fecha_fin,
            e.nombre AS espacio_nombre,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_reservas h
     INNER JOIN reservas r ON r.id = h.reserva_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     LEFT JOIN estados ea ON ea.id = h.estado_anterior_id
     INNER JOIN estados en ON en.id = h.estado_nuevo_id
     WHERE h.reserva_id = ?
     ORDER BY h.id DESC`,
    [reservaId]
  );
  return rows;
}

async function findByUserId(usuarioId) {
  const [rows] = await pool.query(
    `SELECT h.id, h.reserva_id, h.usuario_id, h.estado_anterior_id, h.estado_nuevo_id,
            h.accion, h.observacion, h.fecha_accion,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            r.motivo AS reserva_motivo,
            r.fecha_inicio,
            r.fecha_fin,
            e.nombre AS espacio_nombre,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_reservas h
     INNER JOIN usuarios u ON u.id = h.usuario_id
     INNER JOIN reservas r ON r.id = h.reserva_id
     INNER JOIN espacios e ON e.id = r.espacio_id
     LEFT JOIN estados ea ON ea.id = h.estado_anterior_id
     INNER JOIN estados en ON en.id = h.estado_nuevo_id
     WHERE r.usuario_id = ?
     ORDER BY h.id DESC`,
    [usuarioId]
  );
  return rows;
}

async function create(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO historial_reservas
      (reserva_id, usuario_id, estado_anterior_id, estado_nuevo_id, accion, observacion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.reserva_id,
      data.usuario_id,
      data.estado_anterior_id || null,
      data.estado_nuevo_id,
      data.accion,
      data.observacion || null
    ]
  );
  return result.insertId;
}

module.exports = {
  findAll,
  findByReservaId,
  findByUserId,
  create
};
