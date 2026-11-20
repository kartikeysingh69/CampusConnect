// routes/profile.js — Student Profile Management
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

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
    student_meta
  } = req.body;

  try {
    const serializedMeta = student_meta ? (typeof student_meta === 'string' ? student_meta : JSON.stringify(student_meta)) : null;
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
        student_meta = COALESCE(?, student_meta)
       WHERE id = ?`,
      [
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
        serializedMeta,
        req.user.id
      ]
    );
    res.json({ message: '✅ Profile updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
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

module.exports = router;
