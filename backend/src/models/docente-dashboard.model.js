const { pool } = require('../config/db');

async function getSummary(usuarioId) {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total_reservas,
       SUM(CASE WHEN s.nombre = 'PENDIENTE' THEN 1 ELSE 0 END) AS pendientes,
       SUM(CASE WHEN s.nombre = 'APROBADA' THEN 1 ELSE 0 END) AS aprobadas,
       SUM(CASE WHEN s.nombre = 'RECHAZADA' THEN 1 ELSE 0 END) AS rechazadas,
       SUM(CASE WHEN s.nombre = 'CANCELADA' THEN 1 ELSE 0 END) AS canceladas,
       SUM(CASE WHEN s.nombre IN ('PENDIENTE', 'APROBADA') AND r.fecha_inicio >= NOW() THEN 1 ELSE 0 END) AS proximas
     FROM reservas r
     INNER JOIN estados s ON s.id = r.estado_id
     WHERE r.usuario_id = ?`,
    [usuarioId]
  );
  return rows[0] || {
    total_reservas: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    canceladas: 0,
    proximas: 0
  };
}

async function getUpcomingReservations(usuarioId, limit = 5) {
  const [rows] = await pool.query(
    `SELECT r.id, r.usuario_id, r.espacio_id, r.horario_id, r.estado_id, r.fecha_reserva,
            r.fecha_inicio, r.fecha_fin, r.motivo, r.observaciones,
            e.nombre AS espacio_nombre,
            h.nombre AS horario_nombre,
            s.nombre AS estado_nombre
     FROM reservas r
     INNER JOIN espacios e ON e.id = r.espacio_id
     INNER JOIN horarios h ON h.id = r.horario_id
     INNER JOIN estados s ON s.id = r.estado_id
     WHERE r.usuario_id = ?
       AND s.nombre IN ('PENDIENTE', 'APROBADA')
       AND r.fecha_inicio >= NOW()
     ORDER BY r.fecha_inicio ASC, r.id ASC
     LIMIT ?`,
    [usuarioId, limit]
  );
  return rows;
}

async function getRecentActivity(usuarioId, limit = 5) {
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
     WHERE r.usuario_id = ?
     ORDER BY h.fecha_accion DESC, h.id DESC
     LIMIT ?`,
    [usuarioId, limit]
  );
  return rows;
}

module.exports = {
  getSummary,
  getUpcomingReservations,
  getRecentActivity
};
