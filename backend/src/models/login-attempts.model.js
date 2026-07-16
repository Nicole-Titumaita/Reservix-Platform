const { pool } = require('../config/db');

async function create(data) {
  const normalizedEmail = String(data.email || '').trim().toLowerCase();
  const [result] = await pool.query(
      `INSERT INTO login_attempts
      (usuario_id, email, endpoint, ip, user_agent, success, failure_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.usuario_id || null,
      normalizedEmail,
      data.endpoint || 'login',
      data.ip || null,
      data.user_agent || null,
      data.success ? 1 : 0,
      data.failure_reason || null
    ]
  );
  return result.insertId;
}

async function countRecentFailures({ email, ip, endpoint, minutes }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM login_attempts
     WHERE success = 0
       AND endpoint = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)
       AND (email = ? OR ip = ?)`,
    [endpoint || 'login', minutes, normalizedEmail, ip || '']
  );
  return rows[0]?.total || 0;
}

module.exports = {
  create,
  countRecentFailures
};
