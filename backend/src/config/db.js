const mysql = require('mysql2/promise');

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const databaseName = process.env.DB_NAME || 'sistema_reservas_academico';

const adminPool = mysql.createPool(baseConfig);
const pool = mysql.createPool({
  ...baseConfig,
  database: databaseName
});

async function ensureDatabase() {
  const connection = await adminPool.getConnection();
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    connection.release();
  }
}

async function testConnection() {
  await ensureDatabase();
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  ensureDatabase,
  testConnection
};
