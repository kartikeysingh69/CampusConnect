-- ============================================================
-- CampusConnect Database Setup Script
-- MySQL me yeh run karo: source D:/mini project/backend/config/init.sql
-- ============================================================

-- Database create karo
CREATE DATABASE IF NOT EXISTS campusconnect;
USE campusconnect;

-- ---- USERS Table (Students + Admins) ----
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,       -- bcrypt encrypted
  role ENUM('student', 'admin') DEFAULT 'student',
  cgpa DECIMAL(3,2) DEFAULT NULL,       -- e.g. 8.75
  branch VARCHAR(50) DEFAULT NULL,      -- e.g. CSE, IT
  resume_url VARCHAR(255) DEFAULT NULL, -- AWS S3 URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---- JOBS Table ----
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,          -- e.g. "Software Engineer"
  company VARCHAR(100) NOT NULL,        -- e.g. "Google"
  description TEXT,
  location VARCHAR(100),               -- e.g. "Bangalore"
  ctc VARCHAR(50),                     -- e.g. "24 LPA"
  eligibility VARCHAR(255),            -- e.g. "CGPA >= 7.5"
  deadline DATE,
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---- APPLICATIONS Table ----
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'rejected', 'selected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (student_id, job_id) -- ek student ek job ke liye ek baar
);

-- ============================================================
-- Sample Data (Testing ke liye)
-- ============================================================

-- Admin account (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Placement Admin', 'admin@campus.edu', '$2a$10$rOvHHHHHHHHHHHHHHHHHHuNj.example.placeholder', 'admin');

-- Sample Jobs
INSERT IGNORE INTO jobs (title, company, description, location, ctc, eligibility, deadline) VALUES
('Software Engineer', 'Google', 'Build scalable products at Google. Work on Search, Maps, YouTube.', 'Bangalore', '24 LPA', 'CGPA >= 7.5, CSE/IT only', '2026-12-31'),
('DevOps Engineer', 'Amazon Web Services', 'Build and maintain cloud infrastructure. CI/CD, Kubernetes, Terraform.', 'Hyderabad', '18 LPA', 'CGPA >= 7.0, All branches', '2026-12-25'),
('Cloud Engineer', 'Microsoft Azure', 'Azure cloud solutions design and implementation.', 'Noida', '20 LPA', 'CGPA >= 7.0', '2026-12-20'),
('Full Stack Developer', 'Infosys', 'React + Node.js based enterprise app development.', 'Pune', '12 LPA', 'CGPA >= 6.5, All branches', '2026-12-15');

SELECT '✅ CampusConnect database setup complete!' AS message;
SELECT '📋 Tables created: users, jobs, applications' AS info;
