const { pool } = require('../config/db');

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO two_factor_codes (usuario_id, purpose, code_hash, expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
    [data.usuario_id, data.purpose || 'LOGIN', data.code_hash, data.expires_minutes || 5]
  );
  return result.insertId;
}

async function findLatestActive(usuarioId, purpose = 'LOGIN') {
  const [rows] = await pool.query(
    `SELECT id, usuario_id, purpose, code_hash, expires_at, used_at
     FROM two_factor_codes
     WHERE usuario_id = ?
       AND purpose = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [usuarioId, purpose]
  );
  return rows[0] || null;
}

async function markUsed(id) {
  await pool.query('UPDATE two_factor_codes SET used_at = NOW() WHERE id = ?', [id]);
}

async function invalidateActive(usuarioId, purpose = 'LOGIN') {
  await pool.query(
    `UPDATE two_factor_codes
     SET used_at = NOW()
     WHERE usuario_id = ? AND purpose = ? AND used_at IS NULL`,
    [usuarioId, purpose]
  );
}

module.exports = {
  create,
  findLatestActive,
  markUsed,
  invalidateActive
};
