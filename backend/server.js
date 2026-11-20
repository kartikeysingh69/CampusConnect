// server.js — CampusConnect Backend (Entry Point)
// Yeh file poore backend server ko start karti hai

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// .env file se secrets load karo (jaise DB password, JWT key)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directories exist (for local resume storage)
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir, { recursive: true });

// ---- Middleware (Har request se pehle yeh run hota hai) ----
app.use(cors());                     // Frontend (React) ko API access deta hai
app.use(express.json());             // JSON body parse karne ke liye
app.use(express.urlencoded({ extended: true })); // Form data ke liye

// Static folder for uploaded files (100% Free Local Storage)
app.use('/uploads', express.static(uploadsDir));

// ---- Routes (API Endpoints) ----
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const profileRoutes = require('./routes/profile');
const statsRoutes = require('./routes/stats');

app.use('/api/auth', authRoutes);             // /api/auth/register, /api/auth/login
app.use('/api/jobs', jobRoutes);              // /api/jobs (list, create, detail)
app.use('/api/applications', applicationRoutes); // /api/applications (apply, status)
app.use('/api/profile', profileRoutes);       // /api/profile (get, update)
app.use('/api/stats', statsRoutes);           // /api/stats (admin dashboard)

// ---- Health Check Route (Test karne ke liye) ----
app.get('/', (req, res) => {
  res.json({
    message: '🎓 CampusConnect API is running!',
    version: '1.0.0',
    status: 'OK'
  });
});

// ---- Server Start ----
app.listen(PORT, () => {
  console.log(`✅ CampusConnect Server running at http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
