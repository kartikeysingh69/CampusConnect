// routes/messages.js — Real-Time 1-on-1 Candidate-Recruiter Direct Messaging
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const { sendNotification } = require('./notifications');

// ---- POST /api/messages — Send a direct message ----
router.post('/', verifyToken, async (req, res) => {
  const { receiver_id, application_id, message } = req.body;

  if (!receiver_id || !message || String(message).trim() === '') {
    return res.status(400).json({ message: 'Receiver ID and message content are required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO direct_messages (sender_id, receiver_id, application_id, message) 
       VALUES (?, ?, ?, ?)`,
      [req.user.id, receiver_id, application_id || null, message.trim()]
    );

    // Send in-app notification to receiver
    await sendNotification(
      receiver_id,
      `💬 New Message from ${req.user.name}`,
      message.slice(0, 100) + (message.length > 100 ? '...' : ''),
      'message',
      '/messages'
    );

    res.status(201).json({
      message: '✅ Message delivered successfully',
      messageId: result.insertId,
      data: {
        id: result.insertId,
        sender_id: req.user.id,
        receiver_id: Number(receiver_id),
        message: message.trim(),
        created_at: new Date()
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
});

// ---- GET /api/messages/thread/:otherUserId — Chat history with specific user ----
router.get('/thread/:otherUserId', verifyToken, async (req, res) => {
  const otherId = req.params.otherUserId;

  try {
    const [messages] = await db.query(
      `SELECT m.*, 
              s.name as sender_name, s.role as sender_role, s.company_name as sender_company,
              r.name as receiver_name, r.role as receiver_role
       FROM direct_messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [req.user.id, otherId, otherId, req.user.id]
    );

    // Mark unread messages from other user as read
    await db.query(
      'UPDATE direct_messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [otherId, req.user.id]
    );

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat thread', error: err.message });
  }
});

// ---- GET /api/messages/conversations — Get all active conversations ----
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT
         u.id as user_id,
         u.name as user_name,
         u.email as user_email,
         u.role as user_role,
         u.company_name
       FROM users u
       WHERE u.id IN (
         SELECT DISTINCT receiver_id FROM direct_messages WHERE sender_id = ?
         UNION
         SELECT DISTINCT sender_id FROM direct_messages WHERE receiver_id = ?
       )`,
      [req.user.id, req.user.id]
    );

    // If list is empty, return default institutional contacts (Admins & Recruiters)
    let contacts = rows;
    if (contacts.length === 0) {
      const [defaults] = await db.query(
        "SELECT id as user_id, name as user_name, email as user_email, role as user_role, company_name FROM users WHERE role IN ('admin', 'recruiter') LIMIT 5"
      );
      contacts = defaults;
    }

    res.json({ conversations: contacts });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching conversations', error: err.message });
  }
});

module.exports = router;
