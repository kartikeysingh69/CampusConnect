// routes/auth.js — Registration aur Login APIs
// Endpoints: POST /api/auth/register, POST /api/auth/login

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ---- REGISTER (New Student ya Admin Account Banana) ----
// URL: POST http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'student', employee_id } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Admin registration requires a valid Employee ID (placement cell staff only)
  if (role === 'admin' && (!employee_id || String(employee_id).trim() === '')) {
    return res.status(400).json({ message: 'Employee ID is required for admin registration' });
  }

  try {
    // Check karo ki email already registered hai ya nahi
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Password encrypt karo (plain text kabhi save mat karo!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Database me save karo
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, employee_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, role === 'admin' ? employee_id.trim() : null]
    );

    res.status(201).json({
      message: '✅ Registration successful!',
      userId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ---- LOGIN ----
// URL: POST http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    // Email se user dhundo
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Password verify karo (jo save tha encrypted woh aur jo user ne diya)
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // JWT Token generate karo (24 ghante ke liye valid)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
