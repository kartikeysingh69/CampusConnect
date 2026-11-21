// backend/config/migrate_phases_9_to_13.js — Database Migrations for Phase 9 to 13
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect'
  });

  console.log('🔄 Running database migrations for Phases 9 to 13...');

  try {
    // 1. Direct 1-on-1 Messages table (Phase 11)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        application_id INT DEFAULT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Created direct_messages table');

    // 2. Online Assessment Results table (Phase 10)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        job_id INT DEFAULT NULL,
        problem_title VARCHAR(255) NOT NULL,
        language VARCHAR(50) NOT NULL,
        code_submitted TEXT NOT NULL,
        test_cases_passed INT DEFAULT 0,
        total_test_cases INT DEFAULT 0,
        score_percent INT DEFAULT 0,
        execution_time_ms INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Created assessment_submissions table');

    console.log('🎉 Migrations for Phases 9 to 13 completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
