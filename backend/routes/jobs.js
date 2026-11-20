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

  const { title, company, description, location, ctc, deadline, eligibility, stream, job_type } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO jobs (title, company, description, location, ctc, deadline, eligibility, status, stream, job_type) VALUES (?, ?, ?, ?, ?, ?, ?, "open", ?, ?)',
      [
        title,
        company,
        description,
        location,
        ctc,
        deadline,
        eligibility,
        stream || 'Computer Science',
        job_type || 'Full Time'
      ]
    );
    res.status(201).json({ message: '✅ Job created!', jobId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error creating job', error: err.message });
  }
});

// ---- PUT update/edit a job (Admin only) ----
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can edit jobs' });
  }

  const { title, company, description, location, ctc, deadline, eligibility, stream, job_type, status } = req.body;

  try {
    await db.query(
      `UPDATE jobs SET 
        title = COALESCE(?, title),
        company = COALESCE(?, company),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        ctc = COALESCE(?, ctc),
        deadline = COALESCE(?, deadline),
        eligibility = COALESCE(?, eligibility),
        stream = COALESCE(?, stream),
        job_type = COALESCE(?, job_type),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [title, company, description, location, ctc, deadline, eligibility, stream, job_type, status, req.params.id]
    );
    res.json({ message: '✅ Job updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating job', error: err.message });
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

// ---- PATCH toggle status (Admin only) ----
router.patch('/:id/toggle-status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can toggle job status' });
  }
  try {
    const [rows] = await db.query('SELECT status FROM jobs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Job not found' });
    const nextStatus = rows[0].status === 'open' ? 'closed' : 'open';
    await db.query('UPDATE jobs SET status = ? WHERE id = ?', [nextStatus, req.params.id]);
    res.json({ message: `✅ Job marked as ${nextStatus}`, status: nextStatus });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling job status', error: err.message });
  }
});

// ---- DELETE a job and its applications (Admin only) ----
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete jobs' });
  }
  try {
    await db.query('DELETE FROM applications WHERE job_id = ?', [req.params.id]);
    await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Job and associated applications removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting job', error: err.message });
  }
});

module.exports = router;
