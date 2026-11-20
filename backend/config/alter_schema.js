const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campusconnect'
  });

  const [jobCols] = await pool.query('DESCRIBE jobs');
  const existingJobCols = jobCols.map(c => c.Field);

  if (!existingJobCols.includes('stream')) {
    await pool.query("ALTER TABLE jobs ADD COLUMN stream VARCHAR(50) DEFAULT 'Computer Science'");
  }
  if (!existingJobCols.includes('job_type')) {
    await pool.query("ALTER TABLE jobs ADD COLUMN job_type VARCHAR(50) DEFAULT 'Full Time'");
  }

  const [userCols] = await pool.query('DESCRIBE users');
  const existingUserCols = userCols.map(c => c.Field);

  const userAdditions = [
    ['phone', "VARCHAR(20) DEFAULT NULL"],
    ['github', "VARCHAR(255) DEFAULT NULL"],
    ['linkedin', "VARCHAR(255) DEFAULT NULL"],
    ['skills', "TEXT DEFAULT NULL"],
    ['bio', "TEXT DEFAULT NULL"],
    ['graduation_year', "INT DEFAULT NULL"],
    ['college_id', "VARCHAR(50) DEFAULT NULL"],
    ['profile_pic', "VARCHAR(500) DEFAULT NULL"],
    ['employee_id', "VARCHAR(100) DEFAULT NULL"]
  ];

  for (const [col, def] of userAdditions) {
    if (!existingUserCols.includes(col)) {
      await pool.query(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
    }
  }

  console.log('✅ Columns verified and added!');
  process.exit(0);
}

alterTables().catch(err => {
  console.error(err);
  process.exit(1);
});
