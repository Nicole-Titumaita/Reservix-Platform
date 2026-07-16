const { pool } = require('../config/db');

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO institutional_codes
      (email, rol_id, rol_nombre, code_hash, code_display, expires_at, attempts, purpose, created_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, ?, NOW())`,
    [
      data.email,
      data.rol_id,
      data.rol_nombre,
      data.code_hash,
      data.code_display,
      data.expires_minutes || 10,
      data.purpose || 'REGISTRO'
    ]
  );
  return result.insertId;
}

async function findLatestActiveByEmail(email, purpose = 'REGISTRO') {
  const [rows] = await pool.query(
    `SELECT id, email, rol_id, rol_nombre, code_hash, code_display, expires_at, used_at, attempts, purpose
     FROM institutional_codes
     WHERE email = ?
       AND purpose = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [email, purpose]
  );
  return rows[0] || null;
}

async function findLatestActiveByEmailAndRole(email, rolId, purpose = 'REGISTRO') {
  const [rows] = await pool.query(
    `SELECT id, email, rol_id, rol_nombre, code_hash, code_display, expires_at, used_at, attempts, purpose
     FROM institutional_codes
     WHERE email = ?
       AND rol_id = ?
       AND purpose = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [email, rolId, purpose]
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.query('UPDATE institutional_codes SET used_at = NOW() WHERE id = ?', [id]);
}

async function invalidateActiveByEmail(email, purpose = 'REGISTRO') {
  await pool.query(
    `UPDATE institutional_codes
     SET used_at = NOW()
     WHERE email = ? AND purpose = ? AND used_at IS NULL`,
    [email, purpose]
  );
}

async function invalidateActiveByEmailAndRole(email, rolId, purpose = 'REGISTRO') {
  await pool.query(
    `UPDATE institutional_codes
     SET used_at = NOW()
     WHERE email = ? AND rol_id = ? AND purpose = ? AND used_at IS NULL`,
    [email, rolId, purpose]
  );
}

async function incrementAttempts(id) {
  await pool.query('UPDATE institutional_codes SET attempts = attempts + 1 WHERE id = ?', [id]);
}

module.exports = {
  create,
  findLatestActiveByEmail,
  findLatestActiveByEmailAndRole,
  markUsed,
  invalidateActiveByEmail,
  invalidateActiveByEmailAndRole,
  incrementAttempts
};
