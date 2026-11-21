// routes/interviews.js — Multi-Round Interview Scheduling & Management
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');
const { sendInterviewInviteEmail } = require('../utils/emailService');

// ---- POST Schedule an interview round (Admin ya Recruiter) ----
// URL: POST http://localhost:5000/api/interviews
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Only admins and recruiters can schedule interviews' });
  }

  const {
    application_id,
    round_name,
    round_type,
    scheduled_date,
    duration_minutes,
    mode,
    location_or_link,
    notes
  } = req.body;

  if (!application_id || !round_name || !scheduled_date || !location_or_link) {
    return res.status(400).json({ message: 'Please provide application ID, round name, scheduled date, and location/link' });
  }

  try {
    // Fetch student & job details for the application
    const [apps] = await db.query(
      `SELECT a.student_id, u.email as student_email, u.name as student_name, j.title, j.company 
       FROM applications a
       JOIN users u ON a.student_id = u.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ?`,
      [application_id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { student_id, student_email, student_name, title, company } = apps[0];

    // Insert interview record
    const [result] = await db.query(
      `INSERT INTO interviews 
        (application_id, round_name, round_type, scheduled_date, duration_minutes, mode, location_or_link, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [
        application_id,
        round_name,
        round_type || 'Technical Interview',
        scheduled_date,
        duration_minutes || 45,
        mode || 'Online',
        location_or_link,
        notes || null
      ]
    );

    // Auto-update application status to 'shortlisted' if it was 'applied'
    await db.query(
      "UPDATE applications SET status = 'shortlisted' WHERE id = ? AND status = 'applied'",
      [application_id]
    );

    // Send automatic in-app notification to student
    const dateFormatted = new Date(scheduled_date).toLocaleString();
    await sendNotification(
      student_id,
      `📅 Interview Scheduled: ${company}`,
      `You have been scheduled for "${round_name}" (${round_type || 'Technical'}) on ${dateFormatted}. Mode: ${mode || 'Online'}. Check calendar invite in your email!`,
      'interview_scheduled',
      '/my-applications'
    );

    // Send automated email invite with .ics Google/Outlook Calendar attachment
    sendInterviewInviteEmail(
      { name: student_name, email: student_email },
      { title, company },
      { round_name, round_type, scheduled_date, duration_minutes, mode, location_or_link, notes }
    ).catch((e) => console.warn('Email dispatch background error:', e.message));

    res.status(201).json({
      message: '✅ Interview scheduled successfully, calendar invite & email sent to candidate!',
      interviewId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error scheduling interview', error: err.message });
  }
});

// ---- GET all interviews for logged-in student ----
// URL: GET http://localhost:5000/api/interviews/my
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [interviews] = await db.query(
      `SELECT i.*, j.title as job_title, j.company, a.status as application_status
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       WHERE a.student_id = ?
       ORDER BY i.scheduled_date ASC`,
      [req.user.id]
    );
    res.json({ interviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interviews', error: err.message });
  }
});

// ---- GET interviews for a specific application (Admin or Student owner) ----
// URL: GET http://localhost:5000/api/interviews/application/:applicationId
router.get('/application/:applicationId', verifyToken, async (req, res) => {
  try {
    const [interviews] = await db.query(
      'SELECT * FROM interviews WHERE application_id = ? ORDER BY scheduled_date ASC',
      [req.params.applicationId]
    );
    res.json({ interviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interview rounds', error: err.message });
  }
});

// ---- PATCH Update interview status (Admin) ----
// URL: PATCH http://localhost:5000/api/interviews/:id/status
router.patch('/:id/status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update interview status' });
  }

  const { status } = req.body; // 'Scheduled', 'Completed', 'Cancelled'
  try {
    await db.query('UPDATE interviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Interview marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

module.exports = router;