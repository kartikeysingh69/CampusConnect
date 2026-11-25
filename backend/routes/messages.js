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
    try {
      await sendNotification({
        userId: receiver_id,
        title: `💬 New Message from ${req.user.name}`,
        message: message.slice(0, 100) + (message.length > 100 ? '...' : ''),
        type: 'message',
        link: '/messages'
      });
    } catch (notifErr) {
      // Non-blocking notification fail
    }

    const newMsg = {
      id: result.insertId,
      sender_id: req.user.id,
      receiver_id: Number(receiver_id),
      message: message.trim(),
      is_read: false,
      created_at: new Date()
    };

    res.status(201).json({
      message: '✅ Message delivered successfully',
      ...newMsg,
      data: newMsg
    });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
});

// ---- GET /api/messages/thread/:otherUserId — Chat history with specific user ----
router.get('/thread/:otherUserId', verifyToken, async (req, res) => {
  const otherId = req.params.otherUserId;

  if (!otherId || otherId === 'undefined' || isNaN(Number(otherId))) {
    return res.json([]);
  }

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

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat thread', error: err.message });
  }
});

// ---- GET /api/messages/conversations — Get all active conversations ----
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    // 1. Fetch previous conversation partners with last message and unread count
    const [existing] = await db.query(
      `SELECT DISTINCT
         u.id,
         u.name,
         u.email,
         u.role,
         u.company_name,
         (SELECT COUNT(*) FROM direct_messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = FALSE) as unread_count,
         (SELECT message FROM direct_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message
       FROM users u
       WHERE u.id IN (
         SELECT DISTINCT receiver_id FROM direct_messages WHERE sender_id = ?
         UNION
         SELECT DISTINCT sender_id FROM direct_messages WHERE receiver_id = ?
       )`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    // 2. Fetch other potential contacts (TPO Admins, Recruiters, and peers) so new chats can start
    const [otherContacts] = await db.query(
      `SELECT id, name, email, role, company_name, 0 as unread_count, NULL as last_message 
       FROM users 
       WHERE id != ? 
       ORDER BY role = 'admin' DESC, role = 'recruiter' DESC, name ASC 
       LIMIT 25`,
      [req.user.id]
    );

    const existingIds = new Set(existing.map((u) => u.id));
    const combined = [...existing];
    for (const c of otherContacts) {
      if (!existingIds.has(c.id)) {
        combined.push(c);
      }
    }

    res.json(combined);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching conversations', error: err.message });
  }
});

module.exports = router;