// routes/auth.js — Registration aur Login APIs
// Endpoints: POST /api/auth/register, POST /api/auth/login

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ---- REGISTER (New Student, Admin ya Recruiter Account Banana) ----
// URL: POST http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'student', employee_id, company_name } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Admin registration requires a valid Employee ID (placement cell staff only)
  if (role === 'admin' && (!employee_id || String(employee_id).trim() === '')) {
    return res.status(400).json({ message: 'Employee ID is required for admin registration' });
  }

  // Recruiter registration requires Company Name
  if (role === 'recruiter' && (!company_name || String(company_name).trim() === '')) {
    return res.status(400).json({ message: 'Company Name is required for Recruiter registration' });
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
      'INSERT INTO users (name, email, password, role, employee_id, company_name) VALUES (?, ?, ?, ?, ?, ?)',
      [
        name,
        email,
        hashedPassword,
        role,
        role === 'admin' ? employee_id.trim() : null,
        role === 'recruiter' ? company_name.trim() : null
      ]
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
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        company_name: user.company_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_name: user.company_name
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ---- GOOGLE SSO (Phase 13: Simulated Institutional Single Sign-On) ----
// URL: POST http://localhost:5000/api/auth/google-sso
router.post('/google-sso', async (req, res) => {
  const { email, name, role = 'student' } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Email and name are required' });
  }

  try {
    let [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      const dummyPassword = await bcrypt.hash(`SSO_GOOGLE_${Date.now()}`, 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, dummyPassword, role]
      );
      user = {
        id: result.insertId,
        name,
        email,
        role,
        company_name: null
      };
    } else {
      user = users[0];
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        company_name: user.company_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: '✅ Google SSO sign-in successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_name: user.company_name
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'SSO server error', error: err.message });
  }
});

module.exports = router;
