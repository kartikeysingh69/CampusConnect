// routes/assistant.js — AI Placement Copilot ("CampusBot") Engine
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

// Intent recognition keywords
const INTENTS = {
  DRIVES: ['job', 'jobs', 'drive', 'drives', 'company', 'companies', 'opening', 'openings', 'hiring', 'vacancy'],
  INTERVIEWS: ['interview', 'interviews', 'round', 'rounds', 'schedule', 'timing', 'meet', 'hall ticket', 'kab hai'],
  APPLICATIONS: ['application', 'status', 'applied', 'shortlist', 'selection', 'offer', 'selected'],
  RESUME: ['resume', 'cv', 'ats', 'score', 'improve', 'format', 'tips'],
  STATS: ['highest', 'package', 'ctc', 'average', 'median', 'placement rate', 'stats', 'ranking'],
  SALARY: ['salary', 'lpa', 'stipend', 'money', 'highest package']
};

router.post('/chat', verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message || String(message).trim() === '') {
    return res.status(400).json({ reply: 'Please provide a question or query!' });
  }

  const q = message.toLowerCase().trim();

  try {
    // 1. Check for Interview / Schedule queries
    if (INTENTS.INTERVIEWS.some((w) => q.includes(w))) {
      const [interviews] = await db.query(
        `SELECT i.*, j.title, j.company 
         FROM interviews i
         JOIN applications a ON i.application_id = a.id
         JOIN jobs j ON a.job_id = j.id
         WHERE a.student_id = ?
         ORDER BY i.scheduled_date ASC`,
        [req.user.id]
      );

      if (interviews.length === 0) {
        return res.json({
          reply: `Aapka abhi koi scheduled interview round pending nahi hai. Jaise hi recruiter round schedule karega, aapko notification bell aur calendar invite email mil jayega! 📅`,
          type: 'info'
        });
      }

      const next = interviews[0];
      const dateStr = new Date(next.scheduled_date).toLocaleString('en-IN');
      return res.json({
        reply: `Aapka agla interview round **"${next.round_name}"** (${next.title} at ${next.company}) **${dateStr}** ko scheduled hai.\n\n📍 **Mode/Venue:** ${next.mode} (${next.location_or_link})\n⏱️ **Duration:** ${next.duration_minutes} Minutes.\n\nMake sure to join 5 minutes early with your portfolio ready! 🎯`,
        type: 'interview',
        data: interviews
      });
    }

    // 2. Check for My Applications Status queries
    if (INTENTS.APPLICATIONS.some((w) => q.includes(w))) {
      const [apps] = await db.query(
        `SELECT a.status, a.offered_ctc, j.title, j.company 
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         WHERE a.student_id = ?`,
        [req.user.id]
      );

      if (apps.length === 0) {
        return res.json({
          reply: `Aapne abhi tak kisi bhi placement drive me apply nahi kiya hai. **Jobs** tab me ja kar active drives browse karein aur apni branch ke according apply karein!`,
          type: 'link',
          link: '/jobs'
        });
      }

      const selected = apps.filter((a) => a.status === 'selected');
      const shortlisted = apps.filter((a) => a.status === 'shortlisted');

      let replyMsg = `Aapne total **${apps.length} applications** submit kiye hain:\n`;
      if (selected.length > 0) {
        replyMsg += `🎉 **${selected.length} Final Selection Offer(s)** mila hai (${selected.map((s) => s.company).join(', ')})!\n`;
      }
      if (shortlisted.length > 0) {
        replyMsg += `⚡ **${shortlisted.length} Application(s)** technical rounds ke liye shortlisted hain.\n`;
      }
      replyMsg += `Detailed 3-stage progress dekhne ke liye **My Applications** tab open karein.`;

      return res.json({ reply: replyMsg, type: 'applications', data: apps });
    }

    // 3. Check for Open Job Drives queries
    if (INTENTS.DRIVES.some((w) => q.includes(w))) {
      const [jobs] = await db.query(
        "SELECT id, title, company, ctc, stream, location FROM jobs WHERE status = 'open' ORDER BY id DESC LIMIT 5"
      );

      let reply = `Abhi campus portal par **${jobs.length}+ active recruitment drives** open hain:\n\n`;
      jobs.forEach((j, i) => {
        reply += `${i + 1}. **${j.company}** — ${j.title} (${j.ctc} | ${j.stream})\n`;
      });
      reply += `\nSabhi drives browse karne aur AI Match score check karne ke liye **Explore Jobs** par click karein!`;

      return res.json({ reply, type: 'jobs', data: jobs });
    }

    // 4. Check for Placement Stats / Salary queries
    if (INTENTS.STATS.some((w) => q.includes(w)) || INTENTS.SALARY.some((w) => q.includes(w))) {
      return res.json({
        reply: `📊 **CampusConnect Institutional Placement Highlights (2025-2026):**\n\n- 🏆 **Highest Domestic CTC:** 32.00 LPA (Netflix Big Data Engineer)\n- 📈 **Average Campus Package:** 14.85 LPA\n- 🎯 **Median CTC (NIRF Standard):** 12.00 LPA\n- 🏛️ **Accreditation Rating:** NAAC Grade 'A++' • NIRF Rank #34\n\nAdmins can download the full accredited PDF audit report from the **Admin Dashboard**!`,
        type: 'stats'
      });
    }

    // 5. Check for Resume & ATS tips
    if (INTENTS.RESUME.some((w) => q.includes(w))) {
      return res.json({
        reply: `🤖 **AI Resume & ATS Optimization Pro-Tips:**\n\n1. **Keyword Density:** Job description se core skills (e.g. React, SQL, Docker, CAD) ko exact match me apne profile me add karein.\n2. **Formatting:** Standard Single-Column PDF format use karein without complex multi-column tables.\n3. **Portfolio:** GitHub repo link aur live projects add karne se shortlisting rate +35% improve hota hai.\n\nAap hamare **AI ATS Checker** tool me apna resume score live check kar sakte hain!`,
        type: 'ats',
        link: '/ats-checker'
      });
    }

    // Default intelligent conversational fallback
    return res.json({
      reply: `Namaste **${req.user.name}**! Main hoon **CampusBot**, aapka AI Placement Copilot. 🎓\n\nAap mujhse pooch sakte hain:\n- "Mere branch ke liye open jobs kaunsi hain?"\n- "Mera agla interview kab hai?"\n- "Mera application status kya hai?"\n- "Highest package aur placement stats kya hain?"\n- "Resume ATS score kaise improve karein?"`,
      type: 'general'
    });
  } catch (err) {
    res.status(500).json({ reply: 'Assistant error: ' + err.message });
  }
});

module.exports = router;
