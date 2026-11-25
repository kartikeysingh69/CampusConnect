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
  type ENUM('status_update', 'new_job', 'interview_scheduled', 'application', 'drive', 'announcement', 'message', 'general') DEFAULT 'general',
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

-- Default Demo Accounts (Password for @campusconnect.edu & hr@amazon.com: password123)
-- password for all seed users: password123
-- hash: $2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm
INSERT IGNORE INTO users (name, email, password, role, cgpa, branch, company_name, skills)
VALUES
  ('Admin Officer', 'admin@campusconnect.edu', '$2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm', 'admin', 9.50, 'Administration', NULL, NULL),
  ('Placement Admin', 'admin@campus.edu', '$2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm', 'admin', 9.50, 'Administration', NULL, NULL),
  ('Kunal Sharma', 'kunal.sharma@campus.edu', '$2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm', 'student', 8.90, 'Computer Science', NULL, 'React, Node.js, Docker, Kubernetes, AWS, Terraform, MySQL'),
  ('Rohit Sharma', 'rohit@campusconnect.edu', '$2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm', 'student', 8.75, 'Computer Science', NULL, 'Java, Spring Boot, React, SQL'),
  ('Amazon University Recruiter', 'hr@amazon.com', '$2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm', 'recruiter', NULL, NULL, 'Amazon', NULL),
  ('Google Talent Acquisition', 'recruiter@google.com', '$2b$10$3SvAqmmPOkFnG4uQ7j4S.ugqRRz39X06IK1HI/4yN96VnwEbNpAkm', 'recruiter', NULL, NULL, 'Google', NULL);

-- TPO Official Announcements (Idempotent Seed)
INSERT INTO announcements (title, message, category, is_pinned)
SELECT 'Mandatory Pre-Placement Orientation Session', 'All final year students must attend the auditorium briefing on resume standards and dress code tomorrow at 10:00 AM.', 'Urgent', 1
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Mandatory Pre-Placement Orientation Session');
INSERT INTO announcements (title, message, category, is_pinned)
SELECT 'NVIDIA & Google On-Campus Hackathon', 'Top 50 scorers in technical assessments will be fast-tracked for direct interview rounds. Check the drives tab for details.', 'Drive Update', 1
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'NVIDIA & Google On-Campus Hackathon');
INSERT INTO announcements (title, message, category, is_pinned)
SELECT 'Free Soft Skills & Mock Interview Bootcamp', 'Training & Placement cell is organizing a 3-day corporate grooming workshop with industry HR leaders this weekend.', 'Workshop', 0
WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE title = 'Free Soft Skills & Mock Interview Bootcamp');

-- Comprehensive Multi-Stream Campus Placement Drives (Idempotent Seed)
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Software Development Engineer - I', 'Amazon', 'Join AWS Core Cloud Infrastructure team.', 'Bangalore / Hyderabad', '28.5 LPA', 'CGPA >= 7.5, CS/IT', 'Computer Science', 'Full Time', '2026-12-31', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Software Development Engineer - I' AND company = 'Amazon');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Graduate Engineering Trainee', 'Tata Motors', 'Vehicle Dynamics, powertrain calibration & CAD/CAM design.', 'Pune / Jamshedpur', '10.2 LPA', 'CGPA >= 6.8, Mechanical', 'Mechanical', 'Full Time', '2026-12-31', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Graduate Engineering Trainee' AND company = 'Tata Motors');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Embedded Systems Engineer', 'Texas Instruments', 'Analog & Digital Signal Processing systems.', 'Bangalore', '22.0 LPA', 'CGPA >= 7.0, Electronics & Comm', 'Electronics & Comm', 'Full Time', '2026-12-31', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Embedded Systems Engineer' AND company = 'Texas Instruments');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Structural Project Engineer', 'L&T Construction', 'Mega infrastructure project execution and scheduling.', 'Mumbai / Delhi', '9.5 LPA', 'CGPA >= 6.5, Civil', 'Civil', 'Full Time', '2026-12-31', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Structural Project Engineer' AND company = 'L&T Construction');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Frontend Engineer', 'Meta', 'Build responsive, accessible user interfaces using React, TypeScript, and modern web architectures.', 'Bangalore / Remote', '28 LPA', 'CGPA >= 7.5, JavaScript & React', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Frontend Engineer' AND company = 'Meta');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Cloud Solutions Architect', 'Oracle Cloud', 'Design and deploy resilient, scalable enterprise architectures on Oracle Cloud Infrastructure.', 'Bangalore', '22 LPA', 'CGPA >= 7.0, Networking & Cloud basics', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Cloud Solutions Architect' AND company = 'Oracle Cloud');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Backend Distributed Systems Engineer', 'Uber', 'Design high-throughput microservices handling millions of ride and delivery requests daily.', 'Hyderabad', '26 LPA', 'CGPA >= 8.0, Go/Node.js/Java', 'Computer Science', 'Full Time', '2026-12-25', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Backend Distributed Systems Engineer' AND company = 'Uber');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Cyber Security Analyst', 'Cisco', 'Implement vulnerability assessment, zero-trust network segmentation, and penetration testing.', 'Bangalore', '16 LPA', 'CGPA >= 6.8, Networking & Linux', 'Computer Science', 'Full Time', '2026-12-22', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Cyber Security Analyst' AND company = 'Cisco');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Big Data & Pipeline Engineer', 'Netflix', 'Build real-time streaming data pipelines using Apache Kafka, Apache Spark, and Snowflake.', 'Mumbai', '32 LPA', 'CGPA >= 8.0, Python & SQL', 'Computer Science', 'Full Time', '2026-12-29', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Big Data & Pipeline Engineer' AND company = 'Netflix');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Machine Learning Engineer', 'NVIDIA', 'Optimize deep neural network inference on GPU clusters using CUDA, TensorRT, and PyTorch.', 'Pune', '30 LPA', 'CGPA >= 8.0, Python/PyTorch/C++', 'Computer Science', 'Full Time', '2026-12-26', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Machine Learning Engineer' AND company = 'NVIDIA');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Site Reliability Engineer (SRE)', 'Atlassian', 'Ensure 99.99% uptime for Jira and Confluence using Kubernetes, Prometheus, and SLOs.', 'Remote', '24 LPA', 'CGPA >= 7.0, DevOps & Linux', 'Computer Science', 'Full Time', '2026-12-24', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Site Reliability Engineer (SRE)' AND company = 'Atlassian');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Mobile App Engineer', 'Swiggy', 'Develop fast, resilient cross-platform delivery experiences with React Native and native iOS/Android modules.', 'Bangalore', '18 LPA', 'CGPA >= 6.5, React Native/Flutter', 'Computer Science', 'Full Time', '2026-12-20', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Mobile App Engineer' AND company = 'Swiggy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'GenAI Solutions Engineer', 'Adobe', 'Integrate generative AI capabilities and LLM workflows into Adobe Creative Cloud web tools.', 'Noida', '25 LPA', 'CGPA >= 7.5, Python & REST APIs', 'Computer Science', 'Full Time', '2026-12-23', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'GenAI Solutions Engineer' AND company = 'Adobe');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'DevOps & Infrastructure Automation Engineer', 'IBM', 'Automate multi-cluster hybrid cloud deployments with Terraform, Ansible, and Helm.', 'Gurgaon', '17 LPA', 'CGPA >= 7.0, Docker & Git', 'Computer Science', 'Full Time', '2026-12-18', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'DevOps & Infrastructure Automation Engineer' AND company = 'IBM');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Systems Software Engineer', 'Qualcomm', 'Develop device drivers and low-level firmware for next-generation 5G Snapdragon mobile chipsets.', 'Hyderabad', '21 LPA', 'CGPA >= 7.5, C/C++ & OS concepts', 'Computer Science', 'Full Time', '2026-12-27', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Systems Software Engineer' AND company = 'Qualcomm');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Product Data Analyst', 'Zomato', 'Analyze order retention metrics, user acquisition funnels, and restaurant performance dashboards.', 'Gurgaon', '15 LPA', 'CGPA >= 6.5, SQL & Excel/Python', 'Computer Science', 'Full Time', '2026-12-19', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Product Data Analyst' AND company = 'Zomato');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Frontend Developer', 'Swiggy', 'Frontend Developer position at Swiggy. Key skills and expectations: React, Redux, CSS3. Suitable for candidates passionate about Computer Science sector growth.', 'Bangalore', '14 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Frontend Developer' AND company = 'Swiggy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Backend Software Engineer', 'Razorpay', 'Backend Software Engineer position at Razorpay. Key skills and expectations: Node.js, MongoDB, Microservices. Suitable for candidates passionate about Computer Science sector growth.', 'Bangalore', '20 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Backend Software Engineer' AND company = 'Razorpay');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Cloud DevOps Engineer', 'Paytm', 'Cloud DevOps Engineer position at Paytm. Key skills and expectations: AWS, Docker, Kubernetes, CI/CD. Suitable for candidates passionate about Computer Science sector growth.', 'Noida', '16 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Cloud DevOps Engineer' AND company = 'Paytm');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Full Stack Java Engineer', 'TCS Digital', 'Full Stack Java Engineer position at TCS Digital. Key skills and expectations: Spring Boot, Angular, MySQL. Suitable for candidates passionate about Computer Science sector growth.', 'Pune', '9 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Full Stack Java Engineer' AND company = 'TCS Digital');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Data Scientist', 'Fractal Analytics', 'Data Scientist position at Fractal Analytics. Key skills and expectations: Python, ML, NLP, Pandas. Suitable for candidates passionate about Computer Science sector growth.', 'Mumbai', '15 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Data Scientist' AND company = 'Fractal Analytics');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Quality Assurance & SDET', 'PhonePe', 'Quality Assurance & SDET position at PhonePe. Key skills and expectations: Selenium, Postman, Jest. Suitable for candidates passionate about Computer Science sector growth.', 'Bangalore', '13 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Quality Assurance & SDET' AND company = 'PhonePe');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Android App Developer', 'Urban Company', 'Android App Developer position at Urban Company. Key skills and expectations: Kotlin, Android Studio, Jetpack. Suitable for candidates passionate about Computer Science sector growth.', 'Gurgaon', '16 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Android App Developer' AND company = 'Urban Company');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'iOS Application Engineer', 'Zomato', 'iOS Application Engineer position at Zomato. Key skills and expectations: Swift, UIKit, SwiftUI. Suitable for candidates passionate about Computer Science sector growth.', 'Gurgaon', '18 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'iOS Application Engineer' AND company = 'Zomato');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Cybersecurity Analyst', 'Wipro Cybersecurity', 'Cybersecurity Analyst position at Wipro Cybersecurity. Key skills and expectations: SIEM, OWASP, Penetration Testing. Suitable for candidates passionate about Computer Science sector growth.', 'Hyderabad', '10 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Cybersecurity Analyst' AND company = 'Wipro Cybersecurity');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'AI Research Assistant', 'Reliance Jio AI', 'AI Research Assistant position at Reliance Jio AI. Key skills and expectations: PyTorch, Transformers, LLMs. Suitable for candidates passionate about Computer Science sector growth.', 'Navi Mumbai', '14 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'AI Research Assistant' AND company = 'Reliance Jio AI');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Blockchain Developer', 'Polygon Labs', 'Blockchain Developer position at Polygon Labs. Key skills and expectations: Solidity, Web3.js, Smart Contracts. Suitable for candidates passionate about Computer Science sector growth.', 'Remote', '22 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Blockchain Developer' AND company = 'Polygon Labs');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Database Administrator', 'Oracle India', 'Database Administrator position at Oracle India. Key skills and expectations: MySQL, PostgreSQL, Query Tuning. Suitable for candidates passionate about Computer Science sector growth.', 'Hyderabad', '14 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Database Administrator' AND company = 'Oracle India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Game Developer (Unity)', 'Dream11', 'Game Developer (Unity) position at Dream11. Key skills and expectations: C#, Unity 3D, Physics Engines. Suitable for candidates passionate about Computer Science sector growth.', 'Mumbai', '18 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Game Developer (Unity)' AND company = 'Dream11');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Infrastructure Engineer', 'HCL Technologies', 'Infrastructure Engineer position at HCL Technologies. Key skills and expectations: Linux Systems, Bash, DNS, Bash. Suitable for candidates passionate about Computer Science sector growth.', 'Chennai', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Infrastructure Engineer' AND company = 'HCL Technologies');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Embedded Software Engineer', 'Bosch India', 'Embedded Software Engineer position at Bosch India. Key skills and expectations: C/C++, RTOS, Microcontrollers. Suitable for candidates passionate about Computer Science sector growth.', 'Bangalore', '11 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Computer Science or allied disciplines.', 'Computer Science', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Embedded Software Engineer' AND company = 'Bosch India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Design Engineer - CAD/CAM', 'Tata Motors', 'Design Engineer - CAD/CAM position at Tata Motors. Key skills and expectations: CATIA, SolidWorks, AutoCAD. Suitable for candidates passionate about Mechanical sector growth.', 'Pune', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Design Engineer - CAD/CAM' AND company = 'Tata Motors');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Production & Planning Engineer', 'Mahindra & Mahindra', 'Production & Planning Engineer position at Mahindra & Mahindra. Key skills and expectations: Lean Manufacturing, Six Sigma, GD&T. Suitable for candidates passionate about Mechanical sector growth.', 'Nashik', '7.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Production & Planning Engineer' AND company = 'Mahindra & Mahindra');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Automotive Safety Systems Engineer', 'Maruti Suzuki', 'Automotive Safety Systems Engineer position at Maruti Suzuki. Key skills and expectations: Crash Analysis, FEA, HyperMesh. Suitable for candidates passionate about Mechanical sector growth.', 'Gurgaon', '9.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Automotive Safety Systems Engineer' AND company = 'Maruti Suzuki');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'HVAC Design Consultant', 'Voltas Limited', 'HVAC Design Consultant position at Voltas Limited. Key skills and expectations: HVAC Load Calculation, Revit, MEP. Suitable for candidates passionate about Mechanical sector growth.', 'Ahmedabad', '6.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'HVAC Design Consultant' AND company = 'Voltas Limited');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Quality Control Specialist', 'Larsen & Toubro Heavy', 'Quality Control Specialist position at Larsen & Toubro Heavy. Key skills and expectations: NDT Level II, ISO 9001, CMM. Suitable for candidates passionate about Mechanical sector growth.', 'Vadodara', '7.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Quality Control Specialist' AND company = 'Larsen & Toubro Heavy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Thermal Systems Engineer', 'Thermax Global', 'Thermal Systems Engineer position at Thermax Global. Key skills and expectations: Boiler Design, Heat Transfer, CFD. Suitable for candidates passionate about Mechanical sector growth.', 'Pune', '8.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Thermal Systems Engineer' AND company = 'Thermax Global');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Robotics & Automation Trainee', 'Fanuc India', 'Robotics & Automation Trainee position at Fanuc India. Key skills and expectations: PLC Programming, Robotic Arms. Suitable for candidates passionate about Mechanical sector growth.', 'Bangalore', '9.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Robotics & Automation Trainee' AND company = 'Fanuc India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Aerodynamics Simulation Engineer', 'DRDO Aeronautics', 'Aerodynamics Simulation Engineer position at DRDO Aeronautics. Key skills and expectations: ANSYS Fluent, OpenFOAM, Aerodynamics. Suitable for candidates passionate about Mechanical sector growth.', 'Hyderabad', '10.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Aerodynamics Simulation Engineer' AND company = 'DRDO Aeronautics');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Maintenance Lead Engineer', 'Jindal Steel & Power', 'Maintenance Lead Engineer position at Jindal Steel & Power. Key skills and expectations: Preventive Maintenance, Hydraulics. Suitable for candidates passionate about Mechanical sector growth.', 'Raigarh', '7.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Maintenance Lead Engineer' AND company = 'Jindal Steel & Power');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Piping Design Engineer', 'Technip Energies', 'Piping Design Engineer position at Technip Energies. Key skills and expectations: SP3D, Caesar II, Plant Piping. Suitable for candidates passionate about Mechanical sector growth.', 'Chennai', '8.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Piping Design Engineer' AND company = 'Technip Energies');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Power Plant Operations Engineer', 'NTPC Limited', 'Power Plant Operations Engineer position at NTPC Limited. Key skills and expectations: Turbine Systems, SCADA Control. Suitable for candidates passionate about Mechanical sector growth.', 'Korba', '12 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Power Plant Operations Engineer' AND company = 'NTPC Limited');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Tooling & Die Design Engineer', 'Godrej & Boyce', 'Tooling & Die Design Engineer position at Godrej & Boyce. Key skills and expectations: Press Tool Design, Injection Moulding. Suitable for candidates passionate about Mechanical sector growth.', 'Mumbai', '6.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Tooling & Die Design Engineer' AND company = 'Godrej & Boyce');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Supply Chain Operations Trainee', 'Brembo Brakes India', 'Supply Chain Operations Trainee position at Brembo Brakes India. Key skills and expectations: Vendor Management, BOM Analysis. Suitable for candidates passionate about Mechanical sector growth.', 'Pune', '6.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Supply Chain Operations Trainee' AND company = 'Brembo Brakes India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Materials & Metallurgy Analyst', 'Bharat Forge', 'Materials & Metallurgy Analyst position at Bharat Forge. Key skills and expectations: Heat Treatment, Metallography. Suitable for candidates passionate about Mechanical sector growth.', 'Pune', '7.6 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Materials & Metallurgy Analyst' AND company = 'Bharat Forge');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Heavy Machinery Field Engineer', 'Caterpillar India', 'Heavy Machinery Field Engineer position at Caterpillar India. Key skills and expectations: Excavator Systems, Diagnostics. Suitable for candidates passionate about Mechanical sector growth.', 'Chennai', '9.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Mechanical or allied disciplines.', 'Mechanical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Heavy Machinery Field Engineer' AND company = 'Caterpillar India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Power Systems Engineer', 'ABB India', 'Power Systems Engineer position at ABB India. Key skills and expectations: Substation Automation, Protection Relays. Suitable for candidates passionate about Electrical sector growth.', 'Bangalore', '9.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Power Systems Engineer' AND company = 'ABB India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Renewable Energy Design Trainee', 'Tata Power Solar', 'Renewable Energy Design Trainee position at Tata Power Solar. Key skills and expectations: PVsyst, Solar Array Layouts, Inverters. Suitable for candidates passionate about Electrical sector growth.', 'Bangalore', '7.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Renewable Energy Design Trainee' AND company = 'Tata Power Solar');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Transformer Design Engineer', 'Siemens Energy', 'Transformer Design Engineer position at Siemens Energy. Key skills and expectations: Transformer Testing, Maxwell, High Voltage. Suitable for candidates passionate about Electrical sector growth.', 'Gurgaon', '8.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Transformer Design Engineer' AND company = 'Siemens Energy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'EV Powertrain Engineer', 'Ola Electric', 'EV Powertrain Engineer position at Ola Electric. Key skills and expectations: BMS, Motor Controllers, Lithium Cells. Suitable for candidates passionate about Electrical sector growth.', 'Bangalore', '13 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'EV Powertrain Engineer' AND company = 'Ola Electric');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Electrical Maintenance Engineer', 'Adani Transmission', 'Electrical Maintenance Engineer position at Adani Transmission. Key skills and expectations: Grid Switchyards, HT/LT Panels. Suitable for candidates passionate about Electrical sector growth.', 'Ahmedabad', '8.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Electrical Maintenance Engineer' AND company = 'Adani Transmission');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Electrical CAD Drafter', 'Schneider Electric', 'Electrical CAD Drafter position at Schneider Electric. Key skills and expectations: AutoCAD Electrical, SLD Diagramming. Suitable for candidates passionate about Electrical sector growth.', 'Chennai', '6.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Electrical CAD Drafter' AND company = 'Schneider Electric');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'PLC & SCADA Programmer', 'Rockwell Automation', 'PLC & SCADA Programmer position at Rockwell Automation. Key skills and expectations: Allen-Bradley, FactoryTalk, Industrial IoT. Suitable for candidates passionate about Electrical sector growth.', 'Noida', '9.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'PLC & SCADA Programmer' AND company = 'Rockwell Automation');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Battery Management Architect', 'Ather Energy', 'Battery Management Architect position at Ather Energy. Key skills and expectations: Thermal runaway prevention, CAN bus. Suitable for candidates passionate about Electrical sector growth.', 'Bangalore', '14 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Battery Management Architect' AND company = 'Ather Energy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Control Panel Quality Auditor', 'Havells India', 'Control Panel Quality Auditor position at Havells India. Key skills and expectations: Short Circuit Testing, IS Standards. Suitable for candidates passionate about Electrical sector growth.', 'Alwar', '6.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Control Panel Quality Auditor' AND company = 'Havells India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Smart Grid Systems Engineer', 'L&T Electrical & Automation', 'Smart Grid Systems Engineer position at L&T Electrical & Automation. Key skills and expectations: AMI, Smart Meters, Communication Protocols. Suitable for candidates passionate about Electrical sector growth.', 'Navi Mumbai', '8.4 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Smart Grid Systems Engineer' AND company = 'L&T Electrical & Automation');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Locomotive Electrical Trainee', 'Alstom India', 'Locomotive Electrical Trainee position at Alstom India. Key skills and expectations: Traction Motors, Pantograph Systems. Suitable for candidates passionate about Electrical sector growth.', 'Madhepura', '8.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Locomotive Electrical Trainee' AND company = 'Alstom India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Wind Turbine Field Electrical Lead', 'Suzlon Energy', 'Wind Turbine Field Electrical Lead position at Suzlon Energy. Key skills and expectations: Generators, Pitch Control, Power Factor. Suitable for candidates passionate about Electrical sector growth.', 'Coimbatore', '7.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electrical or allied disciplines.', 'Electrical', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Wind Turbine Field Electrical Lead' AND company = 'Suzlon Energy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'VLSI Design & Verification Engineer', 'Intel India', 'VLSI Design & Verification Engineer position at Intel India. Key skills and expectations: SystemVerilog, UVM, FPGA prototyping. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Bangalore', '21 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'VLSI Design & Verification Engineer' AND company = 'Intel India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'RF & Microwave Engineer', 'Qualcomm India', 'RF & Microwave Engineer position at Qualcomm India. Key skills and expectations: 5G NR, Spectrum Analyzers, Antenna Design. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Hyderabad', '19 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'RF & Microwave Engineer' AND company = 'Qualcomm India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Telecom Network Specialist', 'Bharti Airtel', 'Telecom Network Specialist position at Bharti Airtel. Key skills and expectations: 4G/5G Core, IP Routing, Microwave Links. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Gurgaon', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Telecom Network Specialist' AND company = 'Bharti Airtel');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'IoT Hardware Systems Engineer', 'Honeywell India', 'IoT Hardware Systems Engineer position at Honeywell India. Key skills and expectations: ESP32, Zigbee, BLE, Sensor Interfaces. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Bangalore', '11 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'IoT Hardware Systems Engineer' AND company = 'Honeywell India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'PCB Layout & Hardware Designer', 'Texas Instruments', 'PCB Layout & Hardware Designer position at Texas Instruments. Key skills and expectations: Altium Designer, Signal Integrity, EMI/EMC. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Bangalore', '17 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'PCB Layout & Hardware Designer' AND company = 'Texas Instruments');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'DSP Audio Algorithm Engineer', 'Harman Connected Services', 'DSP Audio Algorithm Engineer position at Harman Connected Services. Key skills and expectations: Digital Signal Processing, MATLAB, Filters. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Pune', '12 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'DSP Audio Algorithm Engineer' AND company = 'Harman Connected Services');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Optical Fiber Networks Planner', 'Sterlite Technologies (STL)', 'Optical Fiber Networks Planner position at Sterlite Technologies (STL). Key skills and expectations: DWDM, OTDR Testing, FTTH Topology. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Pune', '7.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Optical Fiber Networks Planner' AND company = 'Sterlite Technologies (STL)');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Semiconductor Validation Engineer', 'AMD India', 'Semiconductor Validation Engineer position at AMD India. Key skills and expectations: Silicon Post-Silicon Validation, Python Automation. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Bangalore', '18 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Semiconductor Validation Engineer' AND company = 'AMD India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Radar Systems Firmware Engineer', 'Bharat Electronics (BEL)', 'Radar Systems Firmware Engineer position at Bharat Electronics (BEL). Key skills and expectations: C/C++, Doppler Radar, Microchip PIC. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Ghaziabad', '10 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Radar Systems Firmware Engineer' AND company = 'Bharat Electronics (BEL)');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT '5G Protocol Stack Developer', 'Samsung R&D', '5G Protocol Stack Developer position at Samsung R&D. Key skills and expectations: LTE/NR Layer 2/Layer 3, Wireshark. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Noida', '16 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = '5G Protocol Stack Developer' AND company = 'Samsung R&D');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Drone Avionics Engineer', 'IdeaForge', 'Drone Avionics Engineer position at IdeaForge. Key skills and expectations: Flight Controllers, Telemetry, Gyroscopes. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Navi Mumbai', '9.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Drone Avionics Engineer' AND company = 'IdeaForge');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Automotive Sensor Integration Specialist', 'Continental Automotive', 'Automotive Sensor Integration Specialist position at Continental Automotive. Key skills and expectations: RADAR, LiDAR, Automotive Ethernet. Suitable for candidates passionate about Electronics & Comm sector growth.', 'Bangalore', '10.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Electronics & Comm or allied disciplines.', 'Electronics & Comm', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Automotive Sensor Integration Specialist' AND company = 'Continental Automotive');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Site Structural Engineer', 'Larsen & Toubro Construction', 'Site Structural Engineer position at Larsen & Toubro Construction. Key skills and expectations: STAAD.Pro, RCC Design, Bar Bending Schedule. Suitable for candidates passionate about Civil sector growth.', 'Mumbai', '7.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Site Structural Engineer' AND company = 'Larsen & Toubro Construction');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'BIM Modeler & Coordinator', 'Shapoorji Pallonji', 'BIM Modeler & Coordinator position at Shapoorji Pallonji. Key skills and expectations: Autodesk Revit, Navisworks, Clash Detection. Suitable for candidates passionate about Civil sector growth.', 'Hyderabad', '6.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'BIM Modeler & Coordinator' AND company = 'Shapoorji Pallonji');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Geotechnical & Soil Analyst', 'Afcons Infrastructure', 'Geotechnical & Soil Analyst position at Afcons Infrastructure. Key skills and expectations: Soil mechanics, Foundation Piling, Standard Penetration. Suitable for candidates passionate about Civil sector growth.', 'Delhi NCR', '7.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Geotechnical & Soil Analyst' AND company = 'Afcons Infrastructure');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Highway & Transportation Planner', 'Dilip Buildcon', 'Highway & Transportation Planner position at Dilip Buildcon. Key skills and expectations: MX Road, Pavement Design, IRC codes. Suitable for candidates passionate about Civil sector growth.', 'Bhopal', '6.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Highway & Transportation Planner' AND company = 'Dilip Buildcon');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Quantity Surveyor & Estimation Lead', 'Sobha Developers', 'Quantity Surveyor & Estimation Lead position at Sobha Developers. Key skills and expectations: Quantity Estimation, MS Excel, Rate Analysis. Suitable for candidates passionate about Civil sector growth.', 'Bangalore', '6.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Quantity Surveyor & Estimation Lead' AND company = 'Sobha Developers');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Water Resource & Sewage Project Engineer', 'VA Tech Wabag', 'Water Resource & Sewage Project Engineer position at VA Tech Wabag. Key skills and expectations: STP/ETP Design, Pipe Flow, WaterCAD. Suitable for candidates passionate about Civil sector growth.', 'Chennai', '7.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Water Resource & Sewage Project Engineer' AND company = 'VA Tech Wabag');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Urban Planning Project Associate', 'JLL India', 'Urban Planning Project Associate position at JLL India. Key skills and expectations: GIS Mapping, Master Planning, Zoning regulations. Suitable for candidates passionate about Civil sector growth.', 'Gurgaon', '8.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Urban Planning Project Associate' AND company = 'JLL India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Metro Rail Tunneling Engineer', 'Tata Projects', 'Metro Rail Tunneling Engineer position at Tata Projects. Key skills and expectations: Tunnel Boring Machine (TBM), Underground Excavation. Suitable for candidates passionate about Civil sector growth.', 'Pune', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Metro Rail Tunneling Engineer' AND company = 'Tata Projects');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Safety & Environmental Site Officer', 'Gammon India', 'Safety & Environmental Site Officer position at Gammon India. Key skills and expectations: OSHA / NEBOSH Certification, Hazard identification. Suitable for candidates passionate about Civil sector growth.', 'Kolkata', '5.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Safety & Environmental Site Officer' AND company = 'Gammon India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Smart City Infrastructure Analyst', 'PwC Infrastructure', 'Smart City Infrastructure Analyst position at PwC Infrastructure. Key skills and expectations: Civil Assets Lifecycle, Public-Private Partnerships. Suitable for candidates passionate about Civil sector growth.', 'Noida', '9.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Civil or allied disciplines.', 'Civil', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Smart City Infrastructure Analyst' AND company = 'PwC Infrastructure');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Business Analyst - Technology', 'Deloitte India', 'Business Analyst - Technology position at Deloitte India. Key skills and expectations: BRD, User Stories, Jira, Agile Scrum. Suitable for candidates passionate about Business & Management sector growth.', 'Hyderabad', '11.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Business Analyst - Technology' AND company = 'Deloitte India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Management Consultant Trainee', 'KPMG India', 'Management Consultant Trainee position at KPMG India. Key skills and expectations: Market Research, Financial Modeling, Pitch Decks. Suitable for candidates passionate about Business & Management sector growth.', 'Gurgaon', '12 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Management Consultant Trainee' AND company = 'KPMG India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Operations Management Associate', 'Amazon Fulfillment', 'Operations Management Associate position at Amazon Fulfillment. Key skills and expectations: Warehousing Metrics, Kaizen, Six Sigma. Suitable for candidates passionate about Business & Management sector growth.', 'Bangalore', '13 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Operations Management Associate' AND company = 'Amazon Fulfillment');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Product Operations Specialist', 'Flipkart', 'Product Operations Specialist position at Flipkart. Key skills and expectations: KPI Tracking, A/B Test Monitoring, SQL. Suitable for candidates passionate about Business & Management sector growth.', 'Bangalore', '10 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Product Operations Specialist' AND company = 'Flipkart');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Strategic Partnerships Associate', 'MakeMyTrip', 'Strategic Partnerships Associate position at MakeMyTrip. Key skills and expectations: Vendor Negotiation, Contract Structuring. Suitable for candidates passionate about Business & Management sector growth.', 'Gurgaon', '9.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Strategic Partnerships Associate' AND company = 'MakeMyTrip');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Supply Chain Optimization Analyst', 'Unilever India', 'Supply Chain Optimization Analyst position at Unilever India. Key skills and expectations: Inventory Turnover, Demand Forecasting, ERP. Suitable for candidates passionate about Business & Management sector growth.', 'Mumbai', '12.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Supply Chain Optimization Analyst' AND company = 'Unilever India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Business Development Executive', 'Byjus Enterprise', 'Business Development Executive position at Byjus Enterprise. Key skills and expectations: Corporate B2B Sales, CRM pipelines. Suitable for candidates passionate about Business & Management sector growth.', 'Bangalore', '7.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Business Development Executive' AND company = 'Byjus Enterprise');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Digital Transformation Specialist', 'Accenture Strategy', 'Digital Transformation Specialist position at Accenture Strategy. Key skills and expectations: Process Mining, Cloud Adoption Roadmaps. Suitable for candidates passionate about Business & Management sector growth.', 'Mumbai', '13.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Digital Transformation Specialist' AND company = 'Accenture Strategy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Customer Experience Program Manager', 'Uber India', 'Customer Experience Program Manager position at Uber India. Key skills and expectations: NPS Tracking, Voice of Customer, Escalation Management. Suitable for candidates passionate about Business & Management sector growth.', 'Hyderabad', '14 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Customer Experience Program Manager' AND company = 'Uber India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'E-commerce Category Specialist', 'Meesho', 'E-commerce Category Specialist position at Meesho. Key skills and expectations: Catalog Quality, GMV Growth, Pricing Analytics. Suitable for candidates passionate about Business & Management sector growth.', 'Bangalore', '10.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'E-commerce Category Specialist' AND company = 'Meesho');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Corporate Risk Assessment Analyst', 'EY India (Ernst & Young)', 'Corporate Risk Assessment Analyst position at EY India (Ernst & Young). Key skills and expectations: SOX Compliance, Internal Audit, Enterprise Risk. Suitable for candidates passionate about Business & Management sector growth.', 'Kolkata', '11 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Corporate Risk Assessment Analyst' AND company = 'EY India (Ernst & Young)');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Key Account Manager', 'Dunzo For Business', 'Key Account Manager position at Dunzo For Business. Key skills and expectations: Client Retention, Upselling, SLA Monitoring. Suitable for candidates passionate about Business & Management sector growth.', 'Bangalore', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Business & Management or allied disciplines.', 'Business & Management', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Key Account Manager' AND company = 'Dunzo For Business');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Investment Banking Analyst', 'Goldman Sachs India', 'Investment Banking Analyst position at Goldman Sachs India. Key skills and expectations: DCF Valuation, LBO Models, Pitch Presentations. Suitable for candidates passionate about Finance & Banking sector growth.', 'Bangalore', '23 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Investment Banking Analyst' AND company = 'Goldman Sachs India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Credit Risk Analyst', 'HDFC Bank', 'Credit Risk Analyst position at HDFC Bank. Key skills and expectations: Credit Appraisal, Balance Sheet Analysis, CIBIL. Suitable for candidates passionate about Finance & Banking sector growth.', 'Mumbai', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Credit Risk Analyst' AND company = 'HDFC Bank');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Financial Planning & Analysis (FP&A)', 'American Express', 'Financial Planning & Analysis (FP&A) position at American Express. Key skills and expectations: Variance Analysis, P&L Forecasting, Hyperion. Suitable for candidates passionate about Finance & Banking sector growth.', 'Gurgaon', '12.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Financial Planning & Analysis (FP&A)' AND company = 'American Express');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Wealth Management Advisor Trainee', 'ICICI Securities', 'Wealth Management Advisor Trainee position at ICICI Securities. Key skills and expectations: Mutual Funds, Portfolio Allocation, NISM V-A. Suitable for candidates passionate about Finance & Banking sector growth.', 'Delhi NCR', '7.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Wealth Management Advisor Trainee' AND company = 'ICICI Securities');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Equity Research Associate', 'Morgan Stanley', 'Equity Research Associate position at Morgan Stanley. Key skills and expectations: Sector Trends, Earnings Call Summaries, Bloomberg. Suitable for candidates passionate about Finance & Banking sector growth.', 'Mumbai', '19 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Equity Research Associate' AND company = 'Morgan Stanley');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Treasury & Forex Desk Associate', 'Axis Bank', 'Treasury & Forex Desk Associate position at Axis Bank. Key skills and expectations: Currency Swaps, Interest Rate Derivatives. Suitable for candidates passionate about Finance & Banking sector growth.', 'Mumbai', '9.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Treasury & Forex Desk Associate' AND company = 'Axis Bank');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Corporate Banking Relationship Officer', 'Kotak Mahindra Bank', 'Corporate Banking Relationship Officer position at Kotak Mahindra Bank. Key skills and expectations: Working Capital Loans, Letter of Credit, Bank Guarantees. Suitable for candidates passionate about Finance & Banking sector growth.', 'Chennai', '8.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Corporate Banking Relationship Officer' AND company = 'Kotak Mahindra Bank');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Quantitative Trading Analyst', 'Tower Research Capital', 'Quantitative Trading Analyst position at Tower Research Capital. Key skills and expectations: Statistical Arbitrage, Python, C++, Time Series. Suitable for candidates passionate about Finance & Banking sector growth.', 'Gurgaon', '32 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Quantitative Trading Analyst' AND company = 'Tower Research Capital');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Fraud Risk & AML Analyst', 'Standard Chartered', 'Fraud Risk & AML Analyst position at Standard Chartered. Key skills and expectations: Transaction Monitoring, Anti-Money Laundering, KYC. Suitable for candidates passionate about Finance & Banking sector growth.', 'Bangalore', '9.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Fraud Risk & AML Analyst' AND company = 'Standard Chartered');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Fintech Product Accountant', 'Groww', 'Fintech Product Accountant position at Groww. Key skills and expectations: Reconciliation Automation, Tally Prime, Tax Reporting. Suitable for candidates passionate about Finance & Banking sector growth.', 'Bangalore', '11 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Fintech Product Accountant' AND company = 'Groww');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Tax & Compliance Associate', 'Grant Thornton', 'Tax & Compliance Associate position at Grant Thornton. Key skills and expectations: GST Audit, Transfer Pricing, Income Tax Act. Suitable for candidates passionate about Finance & Banking sector growth.', 'Hyderabad', '7.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Tax & Compliance Associate' AND company = 'Grant Thornton');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Private Equity Fund Operations', 'Blackstone India', 'Private Equity Fund Operations position at Blackstone India. Key skills and expectations: Capital Call Notices, Fund Accounting, LP Reporting. Suitable for candidates passionate about Finance & Banking sector growth.', 'Mumbai', '21 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Finance & Banking or allied disciplines.', 'Finance & Banking', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Private Equity Fund Operations' AND company = 'Blackstone India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Customer Support Executive (Voice)', 'Concentrix India', 'Customer Support Executive (Voice) position at Concentrix India. Key skills and expectations: Fluent English, Problem Resolution, Active Listening. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Gurgaon', '4.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Customer Support Executive (Voice)' AND company = 'Concentrix India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Technical Support Engineer (Level 1)', 'Dell Technologies', 'Technical Support Engineer (Level 1) position at Dell Technologies. Key skills and expectations: Windows Troubleshooting, Hardware Diagnostics. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Bangalore', '5.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Technical Support Engineer (Level 1)' AND company = 'Dell Technologies');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Customer Success Specialist', 'Freshworks', 'Customer Success Specialist position at Freshworks. Key skills and expectations: SaaS Onboarding, Ticketing, Retention, Zendesk. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Chennai', '8.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Customer Success Specialist' AND company = 'Freshworks');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'International Inbound Support Associate', 'Teleperformance', 'International Inbound Support Associate position at Teleperformance. Key skills and expectations: US/UK Accent, Shift Readiness, Call Etiquette. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Jaipur', '5.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'International Inbound Support Associate' AND company = 'Teleperformance');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Customer Escalation Manager', 'Amazon Customer Service', 'Customer Escalation Manager position at Amazon Customer Service. Key skills and expectations: Conflict Resolution, Email Escalations, Root Cause. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Hyderabad', '6.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Customer Escalation Manager' AND company = 'Amazon Customer Service');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Banking Process Associate (Call / Chat)', 'WNS Global Services', 'Banking Process Associate (Call / Chat) position at WNS Global Services. Key skills and expectations: Customer verification, Account assistance. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Pune', '4.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Banking Process Associate (Call / Chat)' AND company = 'WNS Global Services');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Health Insurance Claims Representative', 'Genpact', 'Health Insurance Claims Representative position at Genpact. Key skills and expectations: US Healthcare Billing, HIPAA guidelines. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Noida', '5.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Health Insurance Claims Representative' AND company = 'Genpact');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'E-commerce Helpdesk Representative', 'Flipkart Customer Ops', 'E-commerce Helpdesk Representative position at Flipkart Customer Ops. Key skills and expectations: Order refunds, Logistics tracking, CRM systems. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Bangalore', '4.6 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'E-commerce Helpdesk Representative' AND company = 'Flipkart Customer Ops');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'IT Service Desk Technician', 'Cognizant Service Desk', 'IT Service Desk Technician position at Cognizant Service Desk. Key skills and expectations: Active Directory, Password Resets, ServiceNow. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Kolkata', '5.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'IT Service Desk Technician' AND company = 'Cognizant Service Desk');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Multilingual Support Specialist (Hindi/Eng)', 'Foundever', 'Multilingual Support Specialist (Hindi/Eng) position at Foundever. Key skills and expectations: Communication fluency, Typing speed 40+ WPM. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Hyderabad', '4.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Multilingual Support Specialist (Hindi/Eng)' AND company = 'Foundever');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Airline Reservations & Ticketing Agent', 'Wipro BPO Aviation', 'Airline Reservations & Ticketing Agent position at Wipro BPO Aviation. Key skills and expectations: Amadeus, Sabre GDS, Flight Rebooking. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Gurgaon', '5.4 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Airline Reservations & Ticketing Agent' AND company = 'Wipro BPO Aviation');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Quality & Call Auditing Executive', 'TaskUs India', 'Quality & Call Auditing Executive position at TaskUs India. Key skills and expectations: Fatal error analysis, Quality Scorecard, Coaching. Suitable for candidates passionate about Customer Support & BPO sector growth.', 'Indore', '5.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Customer Support & BPO or allied disciplines.', 'Customer Support & BPO', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Quality & Call Auditing Executive' AND company = 'TaskUs India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Digital Marketing Strategist', 'Ogilvy India', 'Digital Marketing Strategist position at Ogilvy India. Key skills and expectations: SEO, Google Ads, Meta Ad Manager, Copywriting. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Mumbai', '8.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Digital Marketing Strategist' AND company = 'Ogilvy India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Corporate Sales Associate (SaaS)', 'Zoho Corporation', 'Corporate Sales Associate (SaaS) position at Zoho Corporation. Key skills and expectations: Cold Outreach, Product Demos, Deal Closing. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Chennai', '9.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Corporate Sales Associate (SaaS)' AND company = 'Zoho Corporation');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Content & Brand Marketing Lead', 'Nykaa', 'Content & Brand Marketing Lead position at Nykaa. Key skills and expectations: Influencer campaigns, Social Media Analytics. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Mumbai', '7.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Content & Brand Marketing Lead' AND company = 'Nykaa');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Field Sales Officer', 'Asian Paints', 'Field Sales Officer position at Asian Paints. Key skills and expectations: Dealer Network Management, Secondary Sales. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Lucknow', '6.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Field Sales Officer' AND company = 'Asian Paints');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Performance Marketer', 'Boat Lifestyle', 'Performance Marketer position at Boat Lifestyle. Key skills and expectations: ROAS optimization, Attribution modeling, GA4. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Delhi NCR', '9.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Performance Marketer' AND company = 'Boat Lifestyle');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Territory Sales Manager Trainee', 'Nestle India', 'Territory Sales Manager Trainee position at Nestle India. Key skills and expectations: FMCG Distribution, Retail Visibility, Target tracking. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Chandigarh', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Territory Sales Manager Trainee' AND company = 'Nestle India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Public Relations & Communications Coordinator', 'Edelman India', 'Public Relations & Communications Coordinator position at Edelman India. Key skills and expectations: Press releases, Media pitching, Event planning. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Gurgaon', '7.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Public Relations & Communications Coordinator' AND company = 'Edelman India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Growth Marketing Associate', 'Cred', 'Growth Marketing Associate position at Cred. Key skills and expectations: Gamification campaigns, User activation, Viral loops. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Bangalore', '13 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Growth Marketing Associate' AND company = 'Cred');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Industrial Equipment B2B Sales Engineer', 'Kirloskar Brothers', 'Industrial Equipment B2B Sales Engineer position at Kirloskar Brothers. Key skills and expectations: Pumps & Valves quoting, Technical presentations. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Pune', '7.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Industrial Equipment B2B Sales Engineer' AND company = 'Kirloskar Brothers');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Real Estate Sales Consultant', 'Godrej Properties', 'Real Estate Sales Consultant position at Godrej Properties. Key skills and expectations: Site visits, High net-worth client handling. Suitable for candidates passionate about Marketing & Sales sector growth.', 'Noida', '8.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Marketing & Sales or allied disciplines.', 'Marketing & Sales', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Real Estate Sales Consultant' AND company = 'Godrej Properties');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Talent Acquisition Specialist', 'Infosys HR', 'Talent Acquisition Specialist position at Infosys HR. Key skills and expectations: LinkedIn Recruiter, Naukri Portal, Tech Screening. Suitable for candidates passionate about Human Resources sector growth.', 'Bangalore', '6.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Talent Acquisition Specialist' AND company = 'Infosys HR');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'HR Generalist Trainee', 'Tata Consultancy Services', 'HR Generalist Trainee position at Tata Consultancy Services. Key skills and expectations: Employee Onboarding, Leave policies, Statutory rules. Suitable for candidates passionate about Human Resources sector growth.', 'Mumbai', '6.0 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'HR Generalist Trainee' AND company = 'Tata Consultancy Services');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Compensation & Benefits Associate', 'Mercer India', 'Compensation & Benefits Associate position at Mercer India. Key skills and expectations: Salary Benchmarking, ESOP structure, Tax perks. Suitable for candidates passionate about Human Resources sector growth.', 'Gurgaon', '8.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Compensation & Benefits Associate' AND company = 'Mercer India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Campus Recruitment Lead', 'Capgemini India', 'Campus Recruitment Lead position at Capgemini India. Key skills and expectations: College placement coordination, Hackathons. Suitable for candidates passionate about Human Resources sector growth.', 'Pune', '7.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Campus Recruitment Lead' AND company = 'Capgemini India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Employee Relations & Engagement Specialist', 'Mindtree / LTIMindtree', 'Employee Relations & Engagement Specialist position at Mindtree / LTIMindtree. Key skills and expectations: Grievance redressal, Townhalls, Wellness drives. Suitable for candidates passionate about Human Resources sector growth.', 'Bhubaneswar', '6.8 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Employee Relations & Engagement Specialist' AND company = 'Mindtree / LTIMindtree');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'HR Operations & Payroll Executive', 'ADP India', 'HR Operations & Payroll Executive position at ADP India. Key skills and expectations: PF, ESI, Gratuity, SAP SuccessFactors. Suitable for candidates passionate about Human Resources sector growth.', 'Hyderabad', '6.2 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'HR Operations & Payroll Executive' AND company = 'ADP India');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Learning & Development Coordinator', 'Wipro L&D Academy', 'Learning & Development Coordinator position at Wipro L&D Academy. Key skills and expectations: Training needs analysis, LMS admin, Certifications. Suitable for candidates passionate about Human Resources sector growth.', 'Chennai', '6.5 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Learning & Development Coordinator' AND company = 'Wipro L&D Academy');
INSERT INTO jobs (title, company, description, location, ctc, eligibility, stream, job_type, deadline, status)
SELECT 'Diversity & Inclusion Specialist', 'Google People Operations', 'Diversity & Inclusion Specialist position at Google People Operations. Key skills and expectations: D&I policy formulation, Cultural outreach, ERG groups. Suitable for candidates passionate about Human Resources sector growth.', 'Bangalore', '16 LPA', 'Minimum 60% / CGPA >= 6.0 in graduation. Degree in Human Resources or allied disciplines.', 'Human Resources', 'Full Time', '2026-12-28', 'open'
WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Diversity & Inclusion Specialist' AND company = 'Google People Operations');
