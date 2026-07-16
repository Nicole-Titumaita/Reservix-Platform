const { pool } = require('../config/db');

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO password_resets (usuario_id, token_hash, expires_at, ip, user_agent)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?, ?)`,
    [
      data.usuario_id,
      data.token_hash,
      data.expires_minutes || 15,
      data.ip || null,
      data.user_agent || null
    ]
  );
  return result.insertId;
}

async function findLatestActive(usuarioId) {
  const [rows] = await pool.query(
    `SELECT id, usuario_id, token_hash, expires_at, used_at
     FROM password_resets
     WHERE usuario_id = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [usuarioId]
  );
  return rows[0] || null;
}

async function findActiveByTokenHash(tokenHash) {
  const [rows] = await pool.query(
    `SELECT id, usuario_id, token_hash, expires_at, used_at, created_at, ip, user_agent
     FROM password_resets
     WHERE token_hash = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function invalidateByUserId(usuarioId) {
  await pool.query(
    `UPDATE password_resets
     SET used_at = NOW()
     WHERE usuario_id = ? AND used_at IS NULL`,
    [usuarioId]
  );
}

async function markUsed(id) {
  await pool.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [id]);
}

module.exports = {
  create,
  findLatestActive,
  findActiveByTokenHash,
  invalidateByUserId,
  markUsed
};
