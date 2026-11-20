// config/db.js — MySQL Database Connection
// Yeh file Node.js ko MySQL se connect karti hai

const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection pool banao (ek pool = ek group of connections, faster hota hai)
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // localhost
  user: process.env.DB_USER,         // root
  password: process.env.DB_PASSWORD, // aapka mysql password
  database: process.env.DB_NAME,     // campusconnect
  waitForConnections: true,
  connectionLimit: 10,               // max 10 connections at a time
  queueLimit: 0
});

// Test connection (server start hone par check karo)
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL Database connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
    console.log('💡 Tip: Check your DB_PASSWORD in .env file');
  });

module.exports = pool;
