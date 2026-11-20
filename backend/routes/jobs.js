// routes/jobs.js — Job listing and management APIs
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// ---- GET all jobs with optional stream filter ----
// URL: GET http://localhost:5000/api/jobs?stream=Mechanical&all=true
router.get('/', async (req, res) => {
  try {
    const { stream, all } = req.query;
    let sql = 'SELECT * FROM jobs';
    const conditions = [];
    const params = [];

    if (all !== 'true') {
      conditions.push('status = "open"');
    }

    if (stream && stream !== 'All') {
      conditions.push('stream = ?');
      params.push(stream);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY id DESC';

    const [jobs] = await db.query(sql, params);
    res.json({ jobs, count: jobs.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching jobs', error: err.message });
  }
});

// ---- GET single job by ID ----
router.get('/:id', async (req, res) => {
  try {
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(jobs[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching job', error: err.message });
  }
});

// ---- POST create new job (Admin only) ----
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can post jobs' });
  }

  const { title, company, description, location, ctc, deadline, eligibility, stream } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO jobs (title, company, description, location, ctc, deadline, eligibility, status, stream, job_type) VALUES (?, ?, ?, ?, ?, ?, ?, "open", ?, "Full Time")',
      [title, company, description, location, ctc, deadline, eligibility, stream || 'Computer Science']
    );
    res.status(201).json({ message: '✅ Job created!', jobId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating job', error: err.message });
  }
});

// ---- PATCH close a job (Admin only) ----
router.patch('/:id/close', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can close jobs' });
  }
  try {
    await db.query('UPDATE jobs SET status = "closed" WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Job closed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error closing job', error: err.message });
  }
});

module.exports = router;
