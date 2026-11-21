// backend/config/migrate_phases_4_to_7.js — Database Migrations for Phase 4 to 7
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect'
  });

  console.log('🔄 Running database migrations for Phases 4 to 7...');

  try {
    // 1. Update users table role and add company_name
    await pool.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('student', 'admin', 'recruiter') DEFAULT 'student'
    `);
    console.log('✓ Updated users.role to include recruiter');

    const [userCols] = await pool.query('DESCRIBE users');
    const existingUserCols = userCols.map(c => c.Field);
    if (!existingUserCols.includes('company_name')) {
      await pool.query('ALTER TABLE users ADD COLUMN company_name VARCHAR(100) DEFAULT NULL');
      console.log('✓ Added users.company_name');
    }

    // 2. Candidate evaluations table for Recruiters
    await pool.query(`
      CREATE TABLE IF NOT EXISTS candidate_evaluations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        recruiter_id INT NOT NULL,
        technical_score INT DEFAULT 4,
        communication_score INT DEFAULT 4,
        problem_solving_score INT DEFAULT 4,
        recommendation ENUM('hire', 'hold', 'reject') DEFAULT 'hire',
        feedback_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Verified candidate_evaluations table');

    // 3. Discussions table for Drive FAQs & Student-Recruiter Q&A
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_role VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Verified discussions table');

    // 4. Announcements table for TPO notices & Circulars
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        is_pinned BOOLEAN DEFAULT FALSE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Verified announcements table');

    // Seed sample recruiter if not exists
    const bcrypt = require('bcryptjs');
    const [existingRecruiters] = await pool.query('SELECT id FROM users WHERE email = ?', ['recruiter@google.com']);
    if (existingRecruiters.length === 0) {
      const hashedPass = await bcrypt.hash('recruiter123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role, company_name) VALUES (?, ?, ?, ?, ?)',
        ['Google Talent Acquisition', 'recruiter@google.com', hashedPass, 'recruiter', 'Google']
      );
      console.log('✓ Seeded sample recruiter (recruiter@google.com / recruiter123)');
    }

    // Seed sample announcements if empty
    const [existingAnnouncements] = await pool.query('SELECT COUNT(*) as cnt FROM announcements');
    if (existingAnnouncements[0].cnt === 0) {
      await pool.query(`
        INSERT INTO announcements (title, message, category, is_pinned) VALUES
        ('Mandatory Pre-Placement Orientation Session', 'All final year students must attend the auditorium briefing on resume standards and dress code tomorrow at 10:00 AM.', 'Urgent', TRUE),
        ('NVIDIA & Google On-Campus Hackathon', 'Top 50 scorers in technical assessments will be fast-tracked for direct interview rounds. Check the drives tab for details.', 'Drive Update', TRUE),
        ('Free Soft Skills & Mock Interview Bootcamp', 'Training & Placement cell is organizing a 3-day corporate grooming workshop with industry HR leaders this weekend.', 'Workshop', FALSE)
      `);
      console.log('✓ Seeded official announcements');
    }

    console.log('🎉 All migrations for Phases 4 to 7 completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
