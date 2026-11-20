// routes/applications.js — Job applications ke liye APIs
// Endpoints: POST /api/applications, GET /api/applications/my, PATCH /api/applications/:id/status

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');

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

    // Send confirmation notification
    const [jobs] = await db.query('SELECT title, company FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length > 0) {
      await sendNotification({
        userId: student_id,
        title: '📋 Application Received',
        message: `Your application for ${jobs[0].title} at ${jobs[0].company} has been submitted successfully.`,
        type: 'status_update',
        link: '/my-applications'
      });
    }

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
      `SELECT a.id, a.job_id, a.status, a.applied_at, 
              a.offer_letter_url, a.offered_ctc, a.joining_date,
              j.title, j.company, j.location, j.ctc, j.stream, j.job_type, j.deadline, j.status as job_status,
              u.resume_url as student_resume
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       JOIN users u ON a.student_id = u.id
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
      `SELECT a.id, a.job_id, a.status, a.applied_at,
              a.offer_letter_url, a.offered_ctc, a.joining_date,
              u.name as student_name, u.email as student_email, u.phone as student_phone,
              u.resume_url as student_resume, u.branch as student_branch, u.cgpa as student_cgpa,
              u.skills as student_skills, u.graduation_year as student_grad_year, u.college_id as student_college,
              j.title as job_title, j.company, j.location as job_location, j.ctc as job_ctc, j.stream as job_stream
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

// ---- PATCH Bulk update application status (Admin) ----
router.patch('/bulk-status', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }

  const { ids, status } = req.body;
  const validStatuses = ['applied', 'shortlisted', 'rejected', 'selected'];
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Please provide application ids to update' });
  }
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Use: ${validStatuses.join(', ')}` });
  }

  try {
    await db.query('UPDATE applications SET status = ? WHERE id IN (?)', [status, ids]);

    // Send notifications to affected candidates
    const [apps] = await db.query(
      `SELECT a.student_id, j.title, j.company 
       FROM applications a JOIN jobs j ON a.job_id = j.id 
       WHERE a.id IN (?)`,
      [ids]
    );

    for (const app of apps) {
      const title =
        status === 'selected'
          ? `🏆 Selection Offer: ${app.company}`
          : status === 'shortlisted'
          ? `🎉 Shortlisted: ${app.company}`
          : `Application Status: ${app.company}`;
      const msg =
        status === 'selected'
          ? `Congratulations! You have been selected for ${app.title} at ${app.company}!`
          : status === 'shortlisted'
          ? `Great news! You have been shortlisted for ${app.title} at ${app.company}. Prepare for upcoming rounds.`
          : `Your application status for ${app.title} at ${app.company} has been updated to "${status}".`;

      await sendNotification({
        userId: app.student_id,
        title,
        message: msg,
        type: 'status_update',
        link: '/my-applications'
      });
    }

    res.json({ message: `✅ ${ids.length} application(s) marked as "${status}"` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating bulk status', error: err.message });
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

    // Send auto notification
    const [apps] = await db.query(
      `SELECT a.student_id, j.title, j.company 
       FROM applications a JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (apps.length > 0) {
      const app = apps[0];
      const title =
        status === 'selected'
          ? `🏆 Selected by ${app.company}!`
          : status === 'shortlisted'
          ? `🎉 Shortlisted for ${app.company}!`
          : `Application Status: ${app.company}`;
      const msg =
        status === 'selected'
          ? `Congratulations! You have been officially selected for ${app.title} at ${app.company}!`
          : status === 'shortlisted'
          ? `You have been shortlisted for ${app.title} at ${app.company}. Check interview schedule soon.`
          : `Your application status for ${app.title} at ${app.company} has been marked as "${status}".`;

      await sendNotification({
        userId: app.student_id,
        title,
        message: msg,
        type: 'status_update',
        link: '/my-applications'
      });
    }

    res.json({ message: `✅ Status updated to "${status}"` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

// ---- POST Issue / Release Offer Letter (Admin only) ----
// URL: POST http://localhost:5000/api/applications/:id/offer
router.post('/:id/offer', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can issue offer letters' });
  }

  const { offered_ctc, joining_date, offer_letter_url } = req.body;

  try {
    const [apps] = await db.query(
      `SELECT a.student_id, j.title, j.company 
       FROM applications a JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await db.query(
      `UPDATE applications SET 
        status = 'selected',
        offered_ctc = COALESCE(?, offered_ctc),
        joining_date = COALESCE(?, joining_date),
        offer_letter_url = COALESCE(?, offer_letter_url)
       WHERE id = ?`,
      [offered_ctc, joining_date, offer_letter_url, req.params.id]
    );

    const app = apps[0];
    await sendNotification({
      userId: app.student_id,
      title: `📜 Official Offer Released: ${app.company}`,
      message: `Your official offer letter for ${app.title} (${offered_ctc || 'As per norms'}) has been issued! You can download it directly from My Applications.`,
      type: 'status_update',
      link: '/my-applications'
    });

    res.json({ message: '✅ Official Offer Letter released and student notified!' });
  } catch (err) {
    res.status(500).json({ message: 'Error issuing offer letter', error: err.message });
  }
});

// ---- DELETE withdraw application (Student only) ----
// URL: DELETE http://localhost:5000/api/applications/:id
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can withdraw applications' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, status FROM applications WHERE id = ? AND student_id = ?',
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    if (rows[0].status === 'selected') {
      return res.status(400).json({ message: 'Cannot withdraw after being selected! Please contact your campus placement cell.' });
    }

    await db.query('DELETE FROM applications WHERE id = ? AND student_id = ?', [req.params.id, req.user.id]);
    res.json({ message: '✅ Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error withdrawing application', error: err.message });
  }
});

module.exports = router;
