# 🎓 CampusConnect — Enterprise Campus Placement & Recruitment Management System
**Final Year Capstone Project & Software Requirements Specification (SRS)**

---

## 1. Executive Summary
CampusConnect is an enterprise-grade, end-to-end web portal engineered to streamline and automate campus recruitment drives for higher educational institutions. It unifies three core stakeholders into an automated, transparent, and auditable recruitment ecosystem:
1. **Students / Candidates:** Job discovery, AI-driven skill match analysis, live progress trackers, automated interview calendar invites, and ATS optimization.
2. **Corporate Recruiters & HR Partners:** Dedicated hiring dashboard, drive posting, multi-round candidate scorecard evaluations, and formal offer letters.
3. **Training & Placement Cell (TPO / Admins):** Institutional placement intelligence, bulk status management, student eligibility audits, and NAAC (Criterion V) & NIRF accreditation compliance reports.

---

## 2. System Architecture & Tech Stack

### 2.1 Technology Stack
- **Frontend Presentation Layer:** React 19 + Vite, React Router DOM v7, React Hot Toast, React Icons, Three.js (dynamic interactive mesh canvas).
- **Backend Application Layer:** Node.js, Express.js (RESTful API architecture, JWT authentication middleware, Multer multipart storage).
- **Data Persistence Layer:** MySQL 8.4 Community Server (InnoDB Storage Engine, Connection Pooling, Foreign Key constraints with Cascading Deletes).
- **Notification & Communication Engine:** Real-time polling notification center, Nodemailer automated email dispatch, and RFC 5545 `.ics` Google Calendar invite generator.
- **Containerization & Deployment:** Docker, Docker Compose, Multi-stage production Nginx container.

---

## 3. Database Schema Overview

```
users (Students, Admins, Recruiters)
  ├── applications (Job Applications)
  │     ├── interviews (Multi-round Assessment Schedules)
  │     └── candidate_evaluations (Recruiter Scorecards & Ratings)
  └── discussions (Drive Q&A Forum)

jobs (Campus Recruitment Drives)
  ├── applications
  └── discussions

notifications (Real-time in-app user alerts)
announcements (TPO Official Circulars & Bulletin Board)
```

---

## 4. Key Functional Modules

### 4.1 Module 1: Student Career Center
- **Résumé Management:** Secure upload and storage for `.pdf`, `.doc`, `.docx` files.
- **Job Discovery with AI Skill Match:** Pre-computes compatibility score (0-100%) against required keywords, branch affinity, and CGPA.
- **Visual Progress Stepper:** Live 3-stage visual progress tracker (`Applied` -> `Shortlisted` -> `Selected` / `Rejected`).
- **Student Self-Service Withdraw:** Instant withdrawal before selection.

### 4.2 Module 2: Corporate Recruiter Portal
- **Company Multi-Tenancy:** Separate role-based access for verified corporate hiring partners.
- **Direct Drive Creation:** Recruiters post requirements, CTC, eligibility, and deadlines.
- **Candidate Evaluation Scorecard:** 1 to 5 star rating across Technical, Communication, and Problem Solving, with official hiring recommendation (`Hire`, `Hold`, `Reject`).

### 4.3 Module 3: Interview Scheduling & Calendar Sync
- Multi-round support: Technical Round, Coding Assessment, HR Interview, Group Discussion.
- Automated generation of `.ics` calendar files dispatched to student email for one-click sync to Google Calendar / Outlook.

### 4.4 Module 4: Placement Cell & NAAC/NIRF Accreditation Intelligence
- Institutional KPI Metrics: Enrolled cohort, placed graduates, placement percentage, highest CTC, average CTC, median CTC.
- Academic discipline breakdown compliant with NAAC Indicator 5.2.1.
- Print-ready PDF report generation with institutional letterhead and cryptographic verification seals.

### 4.5 Module 5: AI Resume ATS Score Checker & Mock Viva Prep
- Scans candidate profile against target job description.
- Highlights missing high-impact industry keywords.
- Curated technical question bank with model answers and evaluation criteria across all engineering disciplines.

### 4.6 Module 6: TPO Bulletin Board & Campus Forum
- Pinned urgent circulars, drive briefings, and workshop announcements.
- Drive-specific discussion threads for candidate queries.
