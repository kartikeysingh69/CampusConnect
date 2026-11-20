// routes/applications.js — Job applications ke liye APIs
// Endpoints: POST /api/applications, GET /api/applications/my, PATCH /api/applications/:id/status

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ---- POST Apply for a job (Student) ----
// URL: POST http://localhost:5000/api/applications
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can apply for jobs' });
  }

  const { job_id } = req.body;
  const student_id = req.user.id;

  try {
    // Check karo ki already apply kiya hai ya nahi
    const [existing] = await db.query(
      'SELECT id FROM applications WHERE student_id = ? AND job_id = ?',
      [student_id, job_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const [result] = await db.query(
      'INSERT INTO applications (student_id, job_id, status) VALUES (?, ?, "applied")',
      [student_id, job_id]
    );
    res.status(201).json({ message: '✅ Application submitted!', applicationId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error applying', error: err.message });
  }
});

// ---- GET my applications (Logged-in student ke liye) ----
// URL: GET http://localhost:5000/api/applications/my
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.id, a.status, a.applied_at, 
              j.title, j.company, j.location, j.ctc 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.student_id = ? 
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
});

// ---- GET all applications (Admin ke liye) ----
// URL: GET http://localhost:5000/api/applications
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  try {
    const [applications] = await db.query(
      `SELECT a.id, a.status, a.applied_at,
              u.name as student_name, u.email as student_email,
              j.title as job_title, j.company
       FROM applications a
       JOIN users u ON a.student_id = u.id
       JOIN jobs j ON a.job_id = j.id
       ORDER BY a.applied_at DESC`
    );
    res.json({ applications, count: applications.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
});

// ---- PATCH Update application status (Admin shortlist/reject) ----
// URL: PATCH http://localhost:5000/api/applications/1/status
router.patch('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }

  const { status } = req.body; // 'applied', 'shortlisted', 'rejected', 'selected'
  const validStatuses = ['applied', 'shortlisted', 'rejected', 'selected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Use: ${validStatuses.join(', ')}` });
  }

  try {
    await db.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `✅ Status updated to "${status}"` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

module.exports = router;
