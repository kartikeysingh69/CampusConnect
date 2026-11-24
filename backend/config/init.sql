-- ============================================================
-- CampusConnect Enterprise Database Schema & Seed Data
-- Auto-executed by MySQL Docker container on first launch
-- ============================================================

CREATE DATABASE IF NOT EXISTS campusconnect;
USE campusconnect;

-- 1. USERS Table
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'recruiter') DEFAULT 'student',
  cgpa DECIMAL(3,2) DEFAULT NULL,
  branch VARCHAR(50) DEFAULT NULL,
  resume_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  phone VARCHAR(20) DEFAULT NULL,
  github VARCHAR(255) DEFAULT NULL,
  linkedin VARCHAR(255) DEFAULT NULL,
  skills TEXT,
  bio TEXT,
  graduation_year INT DEFAULT NULL,
  college_id VARCHAR(50) DEFAULT NULL,
  profile_pic VARCHAR(500) DEFAULT NULL,
  student_meta TEXT,
  employee_id VARCHAR(100) DEFAULT NULL,
  company_name VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. JOBS Table (Campus Recruitment Drives)
CREATE TABLE IF NOT EXISTS jobs (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(100) DEFAULT NULL,
  ctc VARCHAR(50) DEFAULT NULL,
  eligibility VARCHAR(255) DEFAULT NULL,
  deadline DATE DEFAULT NULL,
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stream VARCHAR(50) DEFAULT 'Computer Science',
  job_type VARCHAR(50) DEFAULT 'Full Time',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. APPLICATIONS Table
CREATE TABLE IF NOT EXISTS applications (
  id INT NOT NULL AUTO_INCREMENT,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'rejected', 'selected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  offer_letter_url VARCHAR(255) DEFAULT NULL,
  offered_ctc VARCHAR(50) DEFAULT NULL,
  joining_date DATE DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_application (student_id, job_id),
  KEY job_id (job_id),
  CONSTRAINT applications_ibfk_1 FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT applications_ibfk_2 FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. INTERVIEWS Table
CREATE TABLE IF NOT EXISTS interviews (
  id INT NOT NULL AUTO_INCREMENT,
  application_id INT NOT NULL,
  round_name VARCHAR(100) NOT NULL,
  round_type ENUM('Online Assessment', 'Technical Interview', 'HR Interview', 'Managerial Round', 'Group Discussion') DEFAULT 'Technical Interview',
  scheduled_date DATETIME NOT NULL,
  duration_minutes INT DEFAULT 45,
  mode ENUM('Online', 'In-Person / Campus') DEFAULT 'Online',
  location_or_link VARCHAR(500) NOT NULL,
  notes TEXT,
  status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY application_id (application_id),
  CONSTRAINT interviews_ibfk_1 FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. CANDIDATE EVALUATIONS Table
CREATE TABLE IF NOT EXISTS candidate_evaluations (
  id INT NOT NULL AUTO_INCREMENT,
  application_id INT NOT NULL,
  recruiter_id INT NOT NULL,
  technical_score INT DEFAULT 4,
  communication_score INT DEFAULT 4,
  problem_solving_score INT DEFAULT 4,
  recommendation ENUM('hire', 'hold', 'reject') DEFAULT 'hire',
  feedback_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY application_id (application_id),
  KEY recruiter_id (recruiter_id),
  CONSTRAINT candidate_evaluations_ibfk_1 FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
  CONSTRAINT candidate_evaluations_ibfk_2 FOREIGN KEY (recruiter_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. ASSESSMENT SUBMISSIONS Table
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id INT NOT NULL AUTO_INCREMENT,
  student_id INT NOT NULL,
  job_id INT DEFAULT NULL,
  problem_title VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL,
  code_submitted TEXT NOT NULL,
  test_cases_passed INT DEFAULT 0,
  total_test_cases INT DEFAULT 0,
  score_percent INT DEFAULT 0,
  execution_time_ms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY student_id (student_id),
  KEY job_id (job_id),
  CONSTRAINT assessment_submissions_ibfk_1 FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT assessment_submissions_ibfk_2 FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. DIRECT MESSAGES Table
CREATE TABLE IF NOT EXISTS direct_messages (
  id INT NOT NULL AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  application_id INT DEFAULT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY sender_id (sender_id),
  KEY receiver_id (receiver_id),
  CONSTRAINT direct_messages_ibfk_1 FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT direct_messages_ibfk_2 FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. DISCUSSIONS Table (Campus Q&A Forum)
CREATE TABLE IF NOT EXISTS discussions (
  id INT NOT NULL AUTO_INCREMENT,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY job_id (job_id),
  KEY user_id (user_id),
  CONSTRAINT discussions_ibfk_1 FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT discussions_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('status_update', 'new_job', 'interview_scheduled', 'general') DEFAULT 'general',
  link VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. ANNOUNCEMENTS Table (TPO Circulars)
CREATE TABLE IF NOT EXISTS announcements (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  is_pinned TINYINT(1) DEFAULT 0,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Default Demo Seed Accounts (Password: password123 -> $2b$10$3euPcmQFCiblsZeEu5s7p.9ovVnO7b/c2d2wM7qR3w2gZk8dJ1Gvy)
INSERT IGNORE INTO users (id, name, email, password, role, cgpa, branch)
VALUES
  (1, 'Admin Officer', 'admin@campusconnect.edu', '$2b$10$3euPcmQFCiblsZeEu5s7p.9ovVnO7b/c2d2wM7qR3w2gZk8dJ1Gvy', 'admin', 9.50, 'Administration'),
  (2, 'Rohit Sharma', 'rohit@campusconnect.edu', '$2b$10$3euPcmQFCiblsZeEu5s7p.9ovVnO7b/c2d2wM7qR3w2gZk8dJ1Gvy', 'student', 8.75, 'Computer Science'),
  (3, 'Amazon University Recruiter', 'hr@amazon.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9ovVnO7b/c2d2wM7qR3w2gZk8dJ1Gvy', 'recruiter', NULL, NULL);

-- Default Demo Jobs
INSERT IGNORE INTO jobs (id, title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
VALUES
  (1, 'Software Development Engineer - I', 'Amazon', 'Join AWS Core Cloud Infrastructure team.', 'Bangalore / Hyderabad', '28.5 LPA', 'CGPA >= 7.5, CS/IT', 'Computer Science', 'Full Time', '2026-12-31', 'open'),
  (2, 'Graduate Engineering Trainee', 'Tata Motors', 'Vehicle Dynamics, powertrain calibration & CAD/CAM design.', 'Pune / Jamshedpur', '10.2 LPA', 'CGPA >= 6.8, Mechanical', 'Mechanical', 'Full Time', '2026-12-31', 'open'),
  (3, 'Embedded Systems Engineer', 'Texas Instruments', 'Analog & Digital Signal Processing systems.', 'Bangalore', '22.0 LPA', 'CGPA >= 7.0, Electronics', 'Electronics', 'Full Time', '2026-12-31', 'open'),
  (4, 'Structural Project Engineer', 'L&T Construction', 'Mega infrastructure project execution and scheduling.', 'Mumbai / Delhi', '9.5 LPA', 'CGPA >= 6.5, Civil', 'Civil', 'Full Time', '2026-12-31', 'open');
