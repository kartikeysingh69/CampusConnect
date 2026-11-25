# 📐 CampusConnect — System Architecture & Workflow Diagrams

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client_Layer ["Client Layer (Browser)"]
        UI_Student["Student Portal (Vite + React)"]
        UI_Admin["TPO Admin Dashboard"]
        UI_Recruiter["Corporate Recruiter Portal"]
    end

    subgraph Gateway ["Reverse Proxy & Web Server"]
        Nginx["Nginx / Vite Dev Server (Port 5173 / 80)"]
    end

    subgraph Backend_Layer ["Application Layer (Node.js & Express - Port 5000)"]
        Auth_Middleware["JWT Auth & Role Guard Middleware"]
        Router_Auth["Auth Router (/api/auth)"]
        Router_Jobs["Jobs Router (/api/jobs)"]
        Router_Apps["Applications Router (/api/applications)"]
        Router_Profile["Profile & Uploads (/api/profile)"]
        Router_Interviews["Interviews Router (/api/interviews)"]
        Router_Eval["Evaluations Router (/api/evaluations)"]
        Router_Recruiter["Recruiter Router (/api/recruiter)"]
        Router_Forum["Forum Router (/api/forum)"]
        Router_Assessment["Coding Assessment (/api/assessment)"]
        Router_Messages["Direct Chat (/api/messages)"]
        Router_Assistant["CampusBot AI (/api/assistant)"]
        Router_Stats["Stats & NIRF Router (/api/stats)"]
        Email_Service["Nodemailer & .ics Calendar Engine"]
    end

    subgraph Storage_Layer ["Data Persistence Layer"]
        DB[(MySQL 8.4 Database - Port 3306)]
        FileStore["Local File Storage (/backend/uploads/resumes)"]
    end

    UI_Student --> Nginx
    UI_Admin --> Nginx
    UI_Recruiter --> Nginx
    Nginx --> Auth_Middleware
    Auth_Middleware --> Router_Auth
    Auth_Middleware --> Router_Jobs
    Auth_Middleware --> Router_Apps
    Auth_Middleware --> Router_Profile
    Auth_Middleware --> Router_Interviews
    Auth_Middleware --> Router_Eval
    Auth_Middleware --> Router_Recruiter
    Auth_Middleware --> Router_Forum
    Auth_Middleware --> Router_Assessment
    Auth_Middleware --> Router_Messages
    Auth_Middleware --> Router_Assistant
    Auth_Middleware --> Router_Stats
    Router_Interviews --> Email_Service
    Router_Apps --> Email_Service
    Router_Jobs --> DB
    Router_Apps --> DB
    Router_Profile --> DB
    Router_Eval --> DB
    Router_Recruiter --> DB
    Router_Forum --> DB
    Router_Assessment --> DB
    Router_Messages --> DB
    Router_Stats --> DB
    Router_Profile --> FileStore
```

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "submits"
    USERS ||--o{ CANDIDATE_EVALUATIONS : "evaluates (as recruiter)"
    USERS ||--o{ DISCUSSIONS : "posts"
    USERS ||--o{ ASSESSMENT_SUBMISSIONS : "submits"
    USERS ||--o{ DIRECT_MESSAGES : "sends / receives"
    JOBS ||--o{ APPLICATIONS : "receives"
    JOBS ||--o{ DISCUSSIONS : "has"
    APPLICATIONS ||--o{ INTERVIEWS : "schedules"
    APPLICATIONS ||--o{ CANDIDATE_EVALUATIONS : "scored_in"
    USERS ||--o{ NOTIFICATIONS : "receives"

    USERS {
        int id PK
        string name
        string email UK
        string password
        enum role "student, admin, recruiter"
        string company_name
        decimal cgpa
        string branch
        string resume_url
        text skills
        timestamp created_at
    }

    JOBS {
        int id PK
        string title
        string company
        text description
        string location
        string ctc
        string eligibility
        string stream
        string job_type
        enum status "open, closed"
        date deadline
    }

    APPLICATIONS {
        int id PK
        int student_id FK
        int job_id FK
        enum status "applied, shortlisted, selected, rejected"
        string offer_letter_url
        string offered_ctc
        date joining_date
        timestamp applied_at
    }

    INTERVIEWS {
        int id PK
        int application_id FK
        string round_name
        string round_type
        datetime scheduled_date
        int duration_minutes
        string mode
        string location_or_link
        text notes
        string status
    }

    CANDIDATE_EVALUATIONS {
        int id PK
        int application_id FK
        int recruiter_id FK
        int technical_score
        int communication_score
        int problem_solving_score
        enum recommendation "hire, hold, reject"
        text feedback_notes
    }

    DISCUSSIONS {
        int id PK
        int job_id FK
        int user_id FK
        string user_name
        string user_role
        text message
        timestamp created_at
    }

    ANNOUNCEMENTS {
        int id PK
        string title
        text message
        string category
        boolean is_pinned
        timestamp created_at
    }

    ASSESSMENT_SUBMISSIONS {
        int id PK
        int student_id FK
        int job_id FK
        string problem_title
        string language
        int score_percent
        timestamp created_at
    }

    DIRECT_MESSAGES {
        int id PK
        int sender_id FK
        int receiver_id FK
        text message
        boolean is_read
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        enum type
        boolean is_read
        timestamp created_at
    }
```

---

## 3. End-to-End Application & Interview Flow

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    actor R as Recruiter
    actor A as TPO Admin
    participant API as CampusConnect API
    participant DB as MySQL Database
    participant Mail as Email Service

    R->>API: POST /api/recruiter/post-drive (Role, Package, Eligibility)
    API->>DB: INSERT into jobs
    API->>S: Real-Time Notification: "New Drive Posted"
    
    S->>API: GET /api/jobs (AI Match Score calculated)
    S->>API: POST /api/applications (Apply with Résumé)
    API->>DB: INSERT into applications
    
    R->>API: GET /api/recruiter/applications (Review Pipeline)
    R->>API: POST /api/evaluations (Submit Scorecard: Tech 5/5, Recommendation: Hire)
    API->>DB: INSERT into candidate_evaluations
    
    R->>API: POST /api/interviews (Schedule Technical Round)
    API->>DB: INSERT into interviews & UPDATE application to 'shortlisted'
    API->>Mail: Send Email with Google Calendar (.ics) Invite
    Mail-->>S: Email & Calendar Event Delivered
    API->>S: In-App Notification: "Interview Scheduled"
    
    R->>API: POST /api/applications/:id/offer (Release CTC & Offer Letter)
    API->>DB: UPDATE application to 'selected'
    API->>Mail: Send Formal Offer Letter Email
    API->>S: Celebratory Offer Banner in Student Portal
    
    A->>API: GET /api/stats (Generate NAAC Criterion V / NIRF Audit PDF)
    API-->>A: Institutional Placement Accreditation Report
```
