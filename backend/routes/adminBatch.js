// routes/adminBatch.js — Bulk Student CSV/Batch Importer for Placement Cell (Phase 13)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// Middleware: Admin check
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only placement admins can perform batch operations' });
  }
  next();
};

// ---- POST /api/admin/import-students — Import batch of students ----
router.post('/import-students', verifyToken, requireAdmin, async (req, res) => {
  const { students } = req.body;

  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of student records to import' });
  }

  let importedCount = 0;
  let skippedCount = 0;
  const skippedEmails = [];

  try {
    // Default hashed password for imported students: student@2026
    const defaultPassword = await bcrypt.hash('student@2026', 10);

    for (const st of students) {
      const name = st.name || st.Name;
      const email = (st.email || st.Email || '').trim().toLowerCase();
      const branch = st.branch || st.Branch || 'Computer Science';
      const cgpa = parseFloat(st.cgpa || st.CGPA || '7.5');
      const college_id = st.college_id || st.RollNo || st['Roll Number'] || null;
      const graduation_year = parseInt(st.graduation_year || st.Year || '2026', 10);

      if (!name || !email) {
        skippedCount++;
        continue;
      }

      // Check duplicate
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        skippedCount++;
        skippedEmails.push(email);
        continue;
      }

      // Insert new verified student
      await db.query(
        `INSERT INTO users 
         (name, email, password, role, branch, cgpa, college_id, graduation_year) 
         VALUES (?, ?, ?, 'student', ?, ?, ?, ?)`,
        [name, email, defaultPassword, branch, isNaN(cgpa) ? 7.5 : cgpa, college_id, isNaN(graduation_year) ? 2026 : graduation_year]
      );
      importedCount++;
    }

    res.status(201).json({
      message: `✅ Batch import completed! Successfully registered ${importedCount} student(s).`,
      importedCount,
      skippedCount,
      skippedEmails,
      defaultPassword: 'student@2026'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error importing batch', error: err.message });
  }
});

module.exports = router;
