# 🎓 CampusConnect — Top 30 Viva Defense & Examination Questions
**Comprehensive Technical Preparation Guide for External Examiners**

---

### Category 1: Architecture & System Design

#### Q1: Why did you choose a monolithic REST architecture over microservices for this project?
**Answer:** For a college campus recruitment portal, a modular monolith using Express.js and MySQL offers the optimal balance of development velocity, ACID transactional integrity, and low operational complexity. Microservices would introduce distributed transaction overhead (e.g. 2-phase commits), network latency, and service mesh management without demonstrable benefits for a single-institution traffic profile.

#### Q2: How does the system handle concurrent applications when multiple students apply at the exact same second?
**Answer:** The database enforces a `UNIQUE KEY unique_application (student_id, job_id)` constraint in the `applications` table. Even under high concurrency, MySQL's InnoDB row-level locking ensures that duplicate applications are atomically rejected with an `ER_DUP_ENTRY` error without race conditions.

#### Q3: How does your AI Skill Match algorithm calculate match scores?
**Answer:** The algorithm evaluates three primary vectors:
1. **Keyword Overlap (70%):** Extracts technical skills from job descriptions, eligibility, and title using regex word-boundary parsing, and computes the Jaccard similarity against the candidate's verified profile skills.
2. **Academic Stream Alignment (20%):** Validates whether the student's branch matches the target stream or if the drive is open to all branches.
3. **CGPA Threshold (10%):** Evaluates academic standing against the cutoff.

---

### Category 2: Security & Authentication

#### Q4: How is password security implemented?
**Answer:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with a cost factor (salt rounds) of 10. Bcrypt employs an adaptive key derivation function based on the Blowfish cipher, making it computationally resilient against rainbow table and brute-force attacks.

#### Q5: Explain the authentication lifecycle with JWT. Where is it stored and how is it verified?
**Answer:** Upon successful credential verification, the backend issues a JSON Web Token signed with HMAC-SHA256 (`HS256`) and a secret key, valid for 24 hours. The client stores the token in `localStorage` and an Axios request interceptor attaches it to every HTTP request in the `Authorization: Bearer <token>` header. The `verifyToken` middleware validates the signature before route execution.

#### Q6: How do you prevent unauthorized role escalation (e.g., student accessing admin routes)?
**Answer:** Role authorization is enforced on the server, not just the client UI. Middleware checks `req.user.role === 'admin'` or `req.user.role === 'recruiter'`. Even if a malicious user alters client state, the backend rejects unauthorized requests with `403 Forbidden`.

---

### Category 3: Database & Performance

#### Q7: Why use MySQL instead of MongoDB for this application?
**Answer:** Placement data is inherently relational: Users have Applications, Jobs have Applications, Applications have Interviews and Evaluator Scorecards. MySQL enforces referential integrity through foreign keys with `ON DELETE CASCADE`. In MongoDB, maintaining bidirectional references across collections requires manual application-level joins (`$lookup`) or leads to data inconsistency.

#### Q8: What is connection pooling in MySQL2 and why is it important?
**Answer:** Instead of creating a new TCP connection and performing a 3-way handshake on every incoming HTTP request, the backend initializes a connection pool (`connectionLimit: 10`). Connections are reused and released back to the pool, reducing latency and preventing socket exhaustion.

#### Q9: How are file uploads handled, and why not store PDFs directly inside MySQL BLOB columns?
**Answer:** Storing binary files (resumes) in database BLOB columns leads to table fragmentation, slow indexing, and massive database backups. CampusConnect uses `multer` to store files on the local filesystem (with unique timestamps) and stores only the URI path string (`VARCHAR(255)`) in MySQL.

---

### Category 4: Features & Industry Standards

#### Q10: How does the Google Calendar integration work without requiring OAuth access to the student's account?
**Answer:** Rather than demanding invasive Google Calendar OAuth write permissions, CampusConnect generates standard RFC 5545 `.ics` (iCalendar) MIME attachments. Email clients (Gmail, Apple Mail, Outlook) automatically detect `.ics` payloads and render a 1-click **"Add to Calendar"** button for the student.

#### Q11: How is the NAAC & NIRF Accreditation Report prepared?
**Answer:** The system aggregates live placement statistics directly from the database: Total eligible cohort, total placed candidates, domestic highest package, average package, and median package (NIRF GPH parameter). It also compiles the discipline-wise conversion matrix compliant with NAAC Key Indicator 5.2.1 and renders a print-ready document formatted with institutional letterhead.

#### Q12: What happens if an external examiner asks you to show the Docker deployment?
**Answer:** The project contains a `docker-compose.yml` file configuring three isolated containers: `db` (MySQL 8.4), `backend` (Node 20 Alpine), and `frontend` (Nginx Alpine). Executing `docker compose up -d` starts the entire production stack in under 60 seconds.
