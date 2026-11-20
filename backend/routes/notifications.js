// routes/notifications.js — In-App Notifications for Placement Portal
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// Utility function to create a notification programmatically from any route
async function sendNotification({ userId, title, message, type = 'general', link = null }) {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [userId, title, message, type, link]
    );
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

// ---- GET my notifications ----
// URL: GET http://localhost:5000/api/notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT id, title, message, type, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    const [[{ unreadCount }]] = await db.query(
      'SELECT COUNT(*) as unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

// ---- PATCH Mark single notification as read ----
// URL: PATCH http://localhost:5000/api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating notification', error: err.message });
  }
});

// ---- PATCH Mark ALL notifications as read ----
// URL: PATCH http://localhost:5000/api/notifications/read-all
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: err.message });
  }
});

module.exports = {
  router,
  sendNotification
};