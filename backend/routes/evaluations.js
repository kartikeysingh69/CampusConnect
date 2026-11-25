// routes/evaluations.js — Recruiter Candidate Evaluation & Rating APIs
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');

// Middleware to check recruiter or admin
const requireRecruiterOrAdmin = (req, res, next) => {
  if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Recruiter or Admin role required' });
  }
  next();
};

// ---- POST /api/evaluations — Submit or update candidate scorecard ----
router.post('/', verifyToken, requireRecruiterOrAdmin, async (req, res) => {
  const {
    application_id,
    technical_score = 4,
    communication_score = 4,
    problem_solving_score = 4,
    recommendation = 'hire',
    feedback_notes = ''
  } = req.body;

  if (!application_id) {
    return res.status(400).json({ message: 'Application ID is required' });
  }

  try {
    // Check if evaluation already exists
    const [existing] = await db.query(
      'SELECT id FROM candidate_evaluations WHERE application_id = ? AND recruiter_id = ?',
      [application_id, req.user.id]
    );

    let evalId;
    if (existing.length > 0) {
      await db.query(
        `UPDATE candidate_evaluations 
         SET technical_score = ?, communication_score = ?, problem_solving_score = ?, recommendation = ?, feedback_notes = ?
         WHERE id = ?`,
        [technical_score, communication_score, problem_solving_score, recommendation, feedback_notes, existing[0].id]
      );
      evalId = existing[0].id;
    } else {
      const [insertRes] = await db.query(
        `INSERT INTO candidate_evaluations 
         (application_id, recruiter_id, technical_score, communication_score, problem_solving_score, recommendation, feedback_notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [application_id, req.user.id, technical_score, communication_score, problem_solving_score, recommendation, feedback_notes]
      );
      evalId = insertRes.insertId;
    }

    // Get applicant & drive info for notification
    const [appRows] = await db.query(
      `SELECT a.student_id, j.title, j.company 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = ?`,
      [application_id]
    );

    if (appRows.length > 0) {
      const app = appRows[0];
      const recLabel = recommendation === 'hire' ? 'Positive (Recommended for Selection)' : recommendation === 'hold' ? 'On Reserve / Under Review' : 'Interview Feedback Logged';
      await sendNotification({
        userId: app.student_id,
        title: 'Recruiter Assessment Feedback Received',
        message: `Recruiter feedback has been recorded for your application to ${app.title} at ${app.company}. Assessment Status: ${recLabel}.`,
        type: 'application',
        link: '/my-applications'
      });
    }

    res.json({
      message: '✅ Candidate scorecard saved successfully!',
      evaluation_id: evalId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error saving evaluation', error: err.message });
  }
});

// ---- GET /api/evaluations/:application_id — Get candidate evaluation ----
router.get('/:application_id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.name as recruiter_name, u.company_name 
       FROM candidate_evaluations e 
       JOIN users u ON e.recruiter_id = u.id 
       WHERE e.application_id = ?`,
      [req.params.application_id]
    );

    res.json({
      evaluations: rows,
      evaluation: rows[0] || null
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching evaluation', error: err.message });
  }
});

module.exports = router;
