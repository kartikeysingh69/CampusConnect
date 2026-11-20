// routes/stats.js — Admin Placement Statistics
// Endpoint: GET /api/stats

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ---- GET placement stats (Admin only) ----
router.get('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }

  try {
    const [[{ totalStudents }]] = await db.query(
      "SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'"
    );
    const [[{ totalJobs }]] = await db.query('SELECT COUNT(*) as totalJobs FROM jobs');
    const [[{ openJobs }]] = await db.query(
      "SELECT COUNT(*) as openJobs FROM jobs WHERE status = 'open'"
    );
    const [[{ totalApplications }]] = await db.query(
      'SELECT COUNT(*) as totalApplications FROM applications'
    );
    const [[{ selected }]] = await db.query(
      "SELECT COUNT(*) as selected FROM applications WHERE status = 'selected'"
    );
    const [[{ shortlisted }]] = await db.query(
      "SELECT COUNT(*) as shortlisted FROM applications WHERE status = 'shortlisted'"
    );
    const [[{ rejected }]] = await db.query(
      "SELECT COUNT(*) as rejected FROM applications WHERE status = 'rejected'"
    );

    // Company-wise application count & selection
    const [companyStats] = await db.query(
      `SELECT j.company, 
              COUNT(DISTINCT j.id) as drivesCount,
              COUNT(a.id) as applications,
              SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
              SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) as selected
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       GROUP BY j.company
       ORDER BY applications DESC, drivesCount DESC`
    );

    // Stream-wise distribution
    const [streamStats] = await db.query(
      `SELECT j.stream,
              COUNT(DISTINCT j.id) as drivesCount,
              COUNT(a.id) as applications,
              SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) as selected
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       GROUP BY j.stream
       ORDER BY drivesCount DESC`
    );

    res.json({
      totalStudents,
      totalJobs,
      openJobs,
      totalApplications,
      selected,
      shortlisted,
      rejected,
      companyStats,
      streamStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

module.exports = router;
