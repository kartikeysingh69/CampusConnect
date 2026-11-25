// config/db.js — MySQL Database Connection
// Yeh file Node.js ko MySQL se connect karti hai

const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Connection pool banao (ek pool = ek group of connections, faster hota hai)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'campusconnect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

/**
 * Waits for MySQL to become reachable on startup (helpful after OS reboot / Docker boot).
 */
async function waitForConnection(maxRetries = 15, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ MySQL Database connected successfully!');
      conn.release();
      return true;
    } catch (err) {
      if (attempt === maxRetries) {
        console.error('❌ MySQL Connection Failed after retries:', err.message);
        console.log('💡 Tip: Check DB_HOST, DB_PORT, DB_PASSWORD in .env or ensure MySQL container is running');
        return false;
      }
      console.warn(`⏳ Waiting for MySQL (${attempt}/${maxRetries}): ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

pool.waitForConnection = waitForConnection;

module.exports = pool;
