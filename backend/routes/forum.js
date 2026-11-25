// routes/forum.js — Placement Drive Q&A Forum & TPO Bulletin Board APIs
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');

// ====================================================
// 1. TPO BULLETIN BOARD & ANNOUNCEMENTS
// ====================================================

// ---- GET /api/forum/announcements — List all official notices ----
router.get('/announcements', async (req, res) => {
  try {
    const [announcements] = await db.query(
      'SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC'
    );
    res.json({ announcements, count: announcements.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements', error: err.message });
  }
});

// ---- POST /api/forum/announcements — Create notice (Admin only) ----
router.post('/announcements', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only placement admins can publish notices' });
  }

  const { title, message, category = 'General', is_pinned = false } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO announcements (title, message, category, is_pinned, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, message, category, Boolean(is_pinned), req.user.id]
    );

    // Broadcast in-app notification to all students
    try {
      const [students] = await db.query("SELECT id FROM users WHERE role = 'student'");
      for (const st of students) {
        await sendNotification({
          userId: st.id,
          title: `📢 TPO Notice: ${title}`,
          message: message.slice(0, 140) + (message.length > 140 ? '...' : ''),
          type: 'announcement',
          link: '/forum'
        });
      }
    } catch (e) {
      console.warn('Announcement notification broadcast error:', e.message);
    }

    res.status(201).json({
      message: '✅ Official notice posted and broadcast to students!',
      announcementId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating announcement', error: err.message });
  }
});

// ---- DELETE /api/forum/announcements/:id — Delete notice (Admin only) ----
router.delete('/announcements/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete announcements' });
  }

  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: '✅ Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting announcement', error: err.message });
  }
});

// ====================================================
// 2. DRIVE-SPECIFIC Q&A AND DISCUSSION THREADS
// ====================================================

// ---- GET /api/forum/discussions/:job_id — Thread messages for a drive ----
router.get('/discussions/:job_id', async (req, res) => {
  try {
    const [discussions] = await db.query(
      `SELECT * FROM discussions 
       WHERE job_id = ? 
       ORDER BY created_at ASC`,
      [req.params.job_id]
    );
    res.json({ discussions, count: discussions.length });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching discussions', error: err.message });
  }
});

// ---- POST /api/forum/discussions/:job_id — Post comment/query ----
router.post('/discussions/:job_id', verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message || String(message).trim() === '') {
    return res.status(400).json({ message: 'Message content cannot be empty' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO discussions (job_id, user_id, user_name, user_role, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.job_id, req.user.id, req.user.name, req.user.role, message.trim()]
    );

    res.status(201).json({
      message: '✅ Comment posted successfully',
      discussion: {
        id: result.insertId,
        job_id: Number(req.params.job_id),
        user_id: req.user.id,
        user_name: req.user.name,
        user_role: req.user.role,
        message: message.trim(),
        created_at: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error posting discussion comment', error: err.message });
  }
});

module.exports = router;
