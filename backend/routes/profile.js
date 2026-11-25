// routes/profile.js — Student Profile Management
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// Multer Storage Configuration (Local, 100% Free)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-user-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .doc, and .docx files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: fileFilter
});

// ---- GET my profile ----
router.get('/', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, role, cgpa, branch, resume_url, 
              phone, github, linkedin, skills, bio, graduation_year, college_id, profile_pic, student_meta, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ---- PUT update profile ----
router.put('/', verifyToken, async (req, res) => {
  const {
    name,
    cgpa,
    branch,
    phone,
    github,
    linkedin,
    skills,
    bio,
    graduation_year,
    college_id,
    profile_pic,
    student_meta,
    resume_url
  } = req.body;

  try {
    const serializedMeta = student_meta ? (typeof student_meta === 'string' ? student_meta : JSON.stringify(student_meta)) : null;
    const safeCgpa = cgpa === '' || cgpa === undefined ? null : cgpa;
    const safeGradYear = graduation_year === '' || graduation_year === undefined ? null : graduation_year;
    await db.query(
      `UPDATE users SET 
        name = COALESCE(?, name), 
        cgpa = COALESCE(?, cgpa), 
        branch = COALESCE(?, branch),
        phone = COALESCE(?, phone),
        github = COALESCE(?, github),
        linkedin = COALESCE(?, linkedin),
        skills = COALESCE(?, skills),
        bio = COALESCE(?, bio),
        graduation_year = COALESCE(?, graduation_year),
        college_id = COALESCE(?, college_id),
        profile_pic = COALESCE(?, profile_pic),
        student_meta = COALESCE(?, student_meta),
        resume_url = COALESCE(?, resume_url)
       WHERE id = ?`,
      [
        name || null,
        safeCgpa,
        branch ?? null,
        phone ?? null,
        github ?? null,
        linkedin ?? null,
        skills ?? null,
        bio ?? null,
        safeGradYear,
        college_id ?? null,
        profile_pic ?? null,
        serializedMeta,
        resume_url ?? null,
        req.user.id
      ]
    );
    res.json({ message: '✅ Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ---- POST upload resume (Local File Storage - 100% Free) ----
router.post('/upload-resume', verifyToken, (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Error uploading file' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a resume file to upload (.pdf, .doc, .docx)' });
    }

    try {
      const resumeUrl = `/uploads/resumes/${req.file.filename}`;
      await db.query('UPDATE users SET resume_url = ? WHERE id = ?', [resumeUrl, req.user.id]);
      res.json({
        message: '✅ Resume uploaded successfully!',
        resume_url: resumeUrl,
        filename: req.file.originalname
      });
    } catch (dbErr) {
      res.status(500).json({ message: 'Database error saving resume URL', error: dbErr.message });
    }
  });
});

// ---- PUT update resume URL ----
router.put('/resume-url', verifyToken, async (req, res) => {
  const { resume_url } = req.body;
  try {
    await db.query('UPDATE users SET resume_url = ? WHERE id = ?', [resume_url, req.user.id]);
    res.json({ message: '✅ Resume URL updated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ---- DELETE remove resume ----
router.delete('/resume', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT resume_url FROM users WHERE id = ?', [req.user.id]);
    if (users.length > 0 && users[0].resume_url) {
      const oldUrl = users[0].resume_url;
      if (oldUrl.startsWith('/uploads/resumes/')) {
        const filePath = path.join(__dirname, '..', oldUrl);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
    }
    await db.query('UPDATE users SET resume_url = NULL WHERE id = ?', [req.user.id]);
    res.json({ message: '✅ Resume removed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
