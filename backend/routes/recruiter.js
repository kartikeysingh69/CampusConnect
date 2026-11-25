// routes/recruiter.js — Dedicated Recruiter Corporate Portal APIs
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');

const requireRecruiterOrAdmin = (req, res, next) => {
  if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Recruiter or Admin role required' });
  }
  next();
};

// ---- GET /api/recruiter/my-drives — Drives for recruiter's company ----
router.get('/my-drives', verifyToken, requireRecruiterOrAdmin, async (req, res) => {
  try {
    const company = req.user.company_name;
    let sql = 'SELECT * FROM jobs';
    const params = [];

    if (req.user.role === 'recruiter' && company) {
      sql += ' WHERE LOWER(company) LIKE ?';
      params.push(`%${company.toLowerCase().trim()}%`);
    }

    sql += ' ORDER BY id DESC';

    const [drives] = await db.query(sql, params);
    res.json({ drives, count: drives.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recruiter drives', error: err.message });
  }
});

// ---- GET /api/recruiter/applications — All applicants for recruiter's company ----
router.get('/applications', verifyToken, requireRecruiterOrAdmin, async (req, res) => {
  try {
    const company = req.user.company_name;
    let sql = `
      SELECT 
        a.id,
        a.student_id,
        a.job_id,
        a.status,
        a.applied_at,
        a.offer_letter_url,
        a.offered_ctc,
        a.joining_date,
        u.name as student_name,
        u.email as student_email,
        u.cgpa as student_cgpa,
        u.branch as student_branch,
        u.resume_url as student_resume,
        u.skills as student_skills,
        u.college_id as student_college,
        u.phone as student_phone,
        j.title as job_title,
        j.company,
        j.location,
        j.ctc,
        j.stream,
        j.job_type,
        ev.technical_score,
        ev.communication_score,
        ev.problem_solving_score,
        ev.recommendation,
        ev.feedback_notes
      FROM applications a
      JOIN users u ON a.student_id = u.id
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN candidate_evaluations ev ON a.id = ev.application_id AND ev.recruiter_id = ?
    `;
    const params = [req.user.id];

    if (req.user.role === 'recruiter' && company) {
      sql += ' WHERE LOWER(j.company) LIKE ?';
      params.push(`%${company.toLowerCase().trim()}%`);
    }

    sql += ' ORDER BY a.id DESC';

    const [applications] = await db.query(sql, params);
    res.json({ applications, count: applications.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recruiter applicants', error: err.message });
  }
});

// ---- POST /api/recruiter/post-drive — Recruiter directly post drive ----
router.post('/post-drive', verifyToken, requireRecruiterOrAdmin, async (req, res) => {
  const { title, description, location, ctc, deadline, eligibility, stream = 'Computer Science', job_type = 'Full Time' } = req.body;
  const company = req.user.company_name || req.body.company || 'Enterprise Partner';

  if (!title) {
    return res.status(400).json({ message: 'Drive Title is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO jobs 
       (title, company, description, location, ctc, deadline, eligibility, stream, job_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        title,
        company,
        description || null,
        location || null,
        ctc || null,
        deadline || null,
        eligibility || null,
        stream,
        job_type
      ]
    );

    // Broadcast notification to all students
    try {
      const [students] = await db.query("SELECT id FROM users WHERE role = 'student'");
      for (const st of students) {
        await sendNotification({
          userId: st.id,
          title: `New Corporate Drive: ${title} at ${company}`,
          message: `${company} has opened a new campus hiring drive for ${title} (${ctc || 'Attractive Package'}). Review eligibility and apply!`,
          type: 'drive',
          link: `/jobs/${result.insertId}`
        });
      }
    } catch (e) {
      console.warn('Student notification error:', e.message);
    }

    res.status(201).json({
      message: '✅ Campus recruitment drive posted successfully!',
      jobId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error posting drive', error: err.message });
  }
});

// ---- GET /api/recruiter/stats — Recruiter Dashboard KPI summary ----
router.get('/stats', verifyToken, requireRecruiterOrAdmin, async (req, res) => {
  try {
    const company = req.user.company_name || '';
    const compParam = `%${company.toLowerCase().trim()}%`;

    const [drivesCount] = await db.query(
      'SELECT COUNT(*) as cnt FROM jobs WHERE LOWER(company) LIKE ?',
      [compParam]
    );

    const [applicantsCount] = await db.query(
      `SELECT COUNT(a.id) as cnt 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE LOWER(j.company) LIKE ?`,
      [compParam]
    );

    const [evalCount] = await db.query(
      `SELECT COUNT(e.id) as cnt 
       FROM candidate_evaluations e 
       JOIN applications a ON e.application_id = a.id 
       JOIN jobs j ON a.job_id = j.id 
       WHERE LOWER(j.company) LIKE ?`,
      [compParam]
    );

    const [hiresCount] = await db.query(
      `SELECT COUNT(a.id) as cnt 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE LOWER(j.company) LIKE ? AND a.status = 'selected'`,
      [compParam]
    );

    res.json({
      company: company || 'Corporate Partner',
      totalDrives: drivesCount[0]?.cnt || 0,
      totalApplicants: applicantsCount[0]?.cnt || 0,
      evaluatedCandidates: evalCount[0]?.cnt || 0,
      selectedHires: hiresCount[0]?.cnt || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recruiter stats', error: err.message });
  }
});

module.exports = router;
