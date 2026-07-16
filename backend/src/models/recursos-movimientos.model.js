const { pool } = require('../config/db');

function buildRoleFilterClause(rolNombre) {
  if (!rolNombre) return { clause: '', params: [] };
  return { clause: ' AND hr.rol_nombre = ? ', params: [rolNombre] };
}

function buildActionFilterClause(accion) {
  if (!accion) return { clause: '', params: [] };
  return { clause: ' AND hr.accion = ? ', params: [accion] };
}

async function findAll({ rolNombre = null, accion = null } = {}) {
  const roleFilter = buildRoleFilterClause(rolNombre);
  const actionFilter = buildActionFilterClause(accion);
  const [rows] = await pool.query(
    `SELECT hr.id, hr.recurso_id, hr.usuario_id, hr.rol_id, hr.rol_nombre, hr.estado_anterior_id, hr.estado_nuevo_id,
            hr.accion, hr.observacion, hr.fecha_accion,
            r.codigo AS recurso_codigo,
            r.nombre AS recurso_nombre,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_recursos hr
     INNER JOIN recursos r ON r.id = hr.recurso_id
     INNER JOIN usuarios u ON u.id = hr.usuario_id
     LEFT JOIN estados ea ON ea.id = hr.estado_anterior_id
     INNER JOIN estados en ON en.id = hr.estado_nuevo_id
     WHERE 1=1 ${roleFilter.clause} ${actionFilter.clause}
     ORDER BY hr.id DESC`
    ,
    [...roleFilter.params, ...actionFilter.params]
  );
  return rows;
}

async function findPaginated({ limit, offset, rolNombre = null, accion = null }) {
  const roleFilter = buildRoleFilterClause(rolNombre);
  const actionFilter = buildActionFilterClause(accion);
  const [rows] = await pool.query(
    `SELECT hr.id, hr.recurso_id, hr.usuario_id, hr.rol_id, hr.rol_nombre, hr.estado_anterior_id, hr.estado_nuevo_id,
            hr.accion, hr.observacion, hr.fecha_accion,
            r.codigo AS recurso_codigo,
            r.nombre AS recurso_nombre,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_recursos hr
     INNER JOIN recursos r ON r.id = hr.recurso_id
     INNER JOIN usuarios u ON u.id = hr.usuario_id
     LEFT JOIN estados ea ON ea.id = hr.estado_anterior_id
     INNER JOIN estados en ON en.id = hr.estado_nuevo_id
     WHERE 1=1 ${roleFilter.clause} ${actionFilter.clause}
     ORDER BY hr.id DESC
     LIMIT ? OFFSET ?`,
    [...roleFilter.params, ...actionFilter.params, limit, offset]
  );
  const [[count]] = await pool.query(
    `SELECT COUNT(*) AS total FROM historial_recursos hr WHERE 1=1 ${roleFilter.clause} ${actionFilter.clause}`,
    [...roleFilter.params, ...actionFilter.params]
  );
  return { rows, total: count.total };
}

async function findByRecursoId(recursoId, rolNombre = null, accion = null) {
  const roleFilter = buildRoleFilterClause(rolNombre);
  const actionFilter = buildActionFilterClause(accion);
  const [rows] = await pool.query(
    `SELECT hr.id, hr.recurso_id, hr.usuario_id, hr.rol_id, hr.rol_nombre, hr.estado_anterior_id, hr.estado_nuevo_id,
            hr.accion, hr.observacion, hr.fecha_accion,
            r.codigo AS recurso_codigo,
            r.nombre AS recurso_nombre,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_recursos hr
     INNER JOIN recursos r ON r.id = hr.recurso_id
     INNER JOIN usuarios u ON u.id = hr.usuario_id
     LEFT JOIN estados ea ON ea.id = hr.estado_anterior_id
     INNER JOIN estados en ON en.id = hr.estado_nuevo_id
     WHERE hr.recurso_id = ? ${roleFilter.clause} ${actionFilter.clause}
     ORDER BY hr.id DESC`,
    [recursoId, ...roleFilter.params, ...actionFilter.params]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT hr.id, hr.recurso_id, hr.usuario_id, hr.rol_id, hr.rol_nombre, hr.estado_anterior_id, hr.estado_nuevo_id,
            hr.accion, hr.observacion, hr.fecha_accion,
            r.codigo AS recurso_codigo,
            r.nombre AS recurso_nombre,
            u.nombre AS usuario_nombre,
            u.apellido AS usuario_apellido,
            ea.nombre AS estado_anterior_nombre,
            en.nombre AS estado_nuevo_nombre
     FROM historial_recursos hr
     INNER JOIN recursos r ON r.id = hr.recurso_id
     INNER JOIN usuarios u ON u.id = hr.usuario_id
     LEFT JOIN estados ea ON ea.id = hr.estado_anterior_id
     INNER JOIN estados en ON en.id = hr.estado_nuevo_id
     WHERE hr.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(connection, data) {
  const [result] = await connection.query(
    `INSERT INTO historial_recursos
      (recurso_id, usuario_id, rol_id, rol_nombre, estado_anterior_id, estado_nuevo_id, accion, observacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.recurso_id,
      data.usuario_id,
      data.rol_id,
      data.rol_nombre,
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
  findPaginated,
  findByRecursoId,
  findById,
  create
};
