// src/pages/MockInterview.jsx — AI-Powered Technical Interview & Viva Practice Simulator
import { useState } from 'react';
import {
  FaGraduationCap,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaLightbulb,
  FaStar,
  FaCode,
  FaCogs,
  FaDatabase,
  FaCloud,
  FaBolt,
  FaBriefcase
} from 'react-icons/fa';

const INTERVIEW_BANKS = {
  'Computer Science': [
    {
      id: 1,
      q: 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?',
      difficulty: 'Intermediate',
      concepts: ['ACID vs BASE', 'Relational Schema', 'Horizontal Scaling', 'MongoDB vs MySQL'],
      answer: 'SQL databases (like MySQL, PostgreSQL) are relational, structured, and strictly adhere to ACID transactions, making them ideal for complex financial, e-commerce, and tabular systems. NoSQL databases (like MongoDB, Redis, Cassandra) are document or key-value stores with flexible schemas and horizontal scalability, ideal for unstructured data, high-throughput caching, or real-time event streaming.',
      examinerNotes: 'Assess if the candidate understands scaling limits, transaction isolation, and real production use cases.'
    },
    {
      id: 2,
      q: 'How does the Event Loop in JavaScript/Node.js handle asynchronous non-blocking I/O?',
      difficulty: 'Advanced',
      concepts: ['Call Stack', 'Callback Queue', 'Microtasks', 'libuv Thread Pool'],
      answer: 'JavaScript is single-threaded. The V8 engine pushes synchronous code to the Call Stack. Asynchronous tasks (timers, fetch, I/O) are offloaded to Web APIs or the libuv thread pool. When completed, their callbacks enter the Microtask Queue (Promises) or Macrotask Queue (setTimeout). The Event Loop continually monitors the Call Stack and pulls callbacks once the stack is empty.',
      examinerNotes: 'Look for differentiation between Microtask and Macrotask queues and understanding of libuv.'
    },
    {
      id: 3,
      q: 'What are the SOLID principles in Object-Oriented Software Design?',
      difficulty: 'Intermediate',
      concepts: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion'],
      answer: 'SOLID stands for: 1) Single Responsibility (a class should have one reason to change), 2) Open/Closed (open for extension, closed for modification), 3) Liskov Substitution (derived classes must substitute base classes without error), 4) Interface Segregation (clients should not depend on unused interfaces), 5) Dependency Inversion (high-level modules should depend on abstractions, not concretions).',
      examinerNotes: 'Candidate should give at least one concrete architectural example like Dependency Injection.'
    },
    {
      id: 4,
      q: 'Explain JWT (JSON Web Tokens) structure and how authentication works in modern web APIs.',
      difficulty: 'Easy',
      concepts: ['Header', 'Payload', 'Signature', 'Bearer Token', 'Stateless Auth'],
      answer: 'A JWT consists of 3 dot-separated Base64 parts: Header (algorithm & token type), Payload (claims/user data), and Signature (HMAC/RSA verified with secret key). On successful login, the server issues a signed JWT. The client includes it in the Authorization: Bearer <token> header for subsequent requests, enabling stateless authentication without server session storage.',
      examinerNotes: 'Check if candidate understands why JWTs cannot be easily revoked before expiration and importance of HTTPS.'
    },
    {
      id: 5,
      q: 'What is the time complexity of quicksort and mergesort? Which one is preferred in memory-constrained systems?',
      difficulty: 'Intermediate',
      concepts: ['Big O Notation', 'Divide & Conquer', 'Auxiliary Memory O(n) vs O(log n)'],
      answer: 'Mergesort is guaranteed O(n log n) in all cases but requires O(n) auxiliary memory. Quicksort has an average O(n log n) and worst-case O(n^2), but operates in-place with O(log n) stack memory. For memory-constrained systems, in-place quicksort is preferred due to cache locality and zero extra array allocation.',
      examinerNotes: 'Verify understanding of pivot selection strategies and worst-case quadratic mitigation.'
    }
  ],
  'Cloud & DevOps': [
    {
      id: 6,
      q: 'What is the fundamental difference between Virtual Machines and Docker Containers?',
      difficulty: 'Easy',
      concepts: ['Hypervisor vs Container Engine', 'Shared Kernel', 'Startup Latency', 'Isolation'],
      answer: 'VMs run a full Guest OS on top of a hypervisor (Type 1 or 2), duplicating OS kernels and consuming gigabytes of memory. Docker containers share the host Linux kernel and isolate applications using Linux namespaces and cgroups, making them lightweight (megabytes) and starting in milliseconds.',
      examinerNotes: 'Look for mentions of kernel sharing, cgroups (resource limits), and namespaces (isolation).'
    },
    {
      id: 7,
      q: 'What is CI/CD and describe a standard deployment pipeline from Git commit to Kubernetes production.',
      difficulty: 'Intermediate',
      concepts: ['Continuous Integration', 'Automated Testing', 'Docker Build', 'Helm / ArgoCD GitOps'],
      answer: 'CI automatically validates code changes via linting, unit tests, and security scans upon commit. CD automatically packages the artifact (Docker image pushed to container registry) and deploys it to staging/production clusters using tools like GitHub Actions, Jenkins, or ArgoCD with zero-downtime rolling updates.',
      examinerNotes: 'Candidate should articulate canary or blue-green deployment strategies.'
    }
  ],
  'Mechanical Engineering': [
    {
      id: 8,
      q: 'Explain the four strokes of an internal combustion engine and their thermodynamic cycle.',
      difficulty: 'Easy',
      concepts: ['Suction', 'Compression', 'Power', 'Exhaust', 'Otto Cycle'],
      answer: 'The 4 strokes are: 1) Suction (air-fuel mixture drawn into cylinder), 2) Compression (adiabatic compression of mixture), 3) Power/Expansion (combustion and heat addition driving piston down), 4) Exhaust (burnt gases expelled). Petrol engines follow the Otto cycle (constant volume heat addition), while Diesel engines follow the Diesel cycle (constant pressure heat addition).',
      examinerNotes: 'Look for knowledge of P-V and T-S diagram representations.'
    },
    {
      id: 9,
      q: 'What is the significance of the Stress-Strain diagram for ductile materials like structural steel?',
      difficulty: 'Intermediate',
      concepts: ['Proportional Limit', 'Yield Point', 'Ultimate Tensile Strength', 'Necking', 'Fracture'],
      answer: 'The stress-strain curve shows mechanical behavior under tensile load: Hooke\'s law region up to proportional limit, elastic limit, upper and lower yield points, strain hardening up to Ultimate Tensile Strength (UTS), necking formation, and final cup-and-cone ductile fracture point.',
      examinerNotes: 'Check understanding of Modulus of Elasticity and proof stress (0.2% offset yield).'
    }
  ],
  'Electrical & Electronics': [
    {
      id: 10,
      q: 'Explain the operational principle of a Transformer and why it does not work on direct current (DC).',
      difficulty: 'Easy',
      concepts: ['Faraday\'s Law of Electromagnetic Induction', 'Mutual Induction', 'Core Saturation'],
      answer: 'A transformer operates on Faraday\'s Law of Mutual Induction between primary and secondary windings linked by a magnetic core. It requires an alternating (AC) flux (dPhi/dt != 0) to induce EMF. In DC, the magnetic field is constant (dPhi/dt = 0), so no secondary EMF is induced, and the low DC winding resistance causes excessive current and winding burnout.',
      examinerNotes: 'Check if candidate mentions core saturation and lack of back-EMF in DC.'
    }
  ]
};

export default function MockInterview() {
  const [selectedStream, setSelectedStream] = useState('Computer Science');
  const [expandedId, setExpandedId] = useState(1);
  const [confidenceRatings, setConfidenceRatings] = useState({});

  const streamList = Object.keys(INTERVIEW_BANKS);
  const questions = INTERVIEW_BANKS[selectedStream] || [];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRate = (qId, stars) => {
    setConfidenceRatings({
      ...confidenceRatings,
      [qId]: stars
    });
  };

  return (
    <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
          <FaGraduationCap style={{ color: '#ea580c' }} /> AI Technical Interview & Viva Defense Simulator
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.35rem 0 0 0' }}>
          Practice verified high-frequency corporate campus recruitment questions, examiner talking points, and self-readiness ratings
        </p>
      </div>

      {/* Stream Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {streamList.map((str) => (
          <button
            key={str}
            type="button"
            onClick={() => {
              setSelectedStream(str);
              setExpandedId(null);
            }}
            style={{
              background: selectedStream === str ? '#ea580c' : '#ffffff',
              color: selectedStream === str ? '#ffffff' : '#475569',
              border: `1.5px solid ${selectedStream === str ? '#ea580c' : '#cbd5e1'}`,
              padding: '0.55rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: selectedStream === str ? '0 3px 8px rgba(234, 88, 12, 0.25)' : 'none'
            }}
          >
            {str} ({INTERVIEW_BANKS[str].length})
          </button>
        ))}
      </div>

      {/* Questions Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {questions.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          const rating = confidenceRatings[item.id] || 0;

          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: `1.5px solid ${isExpanded ? '#fed7aa' : '#e2e8f0'}`,
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: isExpanded ? '0 6px 20px rgba(234, 88, 12, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Question Header Bar */}
              <div
                onClick={() => toggleExpand(item.id)}
                style={{
                  padding: '1.2rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: isExpanded ? '#fff7ed' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1 }}>
                  <span
                    style={{
                      background: '#ea580c',
                      color: '#ffffff',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                      {item.q}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          background:
                            item.difficulty === 'Easy'
                              ? '#dcfce7'
                              : item.difficulty === 'Intermediate'
                              ? '#e0f2fe'
                              : '#fee2e2',
                          color:
                            item.difficulty === 'Easy'
                              ? '#166534'
                              : item.difficulty === 'Intermediate'
                              ? '#0369a1'
                              : '#991b1b',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '10px'
                        }}
                      >
                        {item.difficulty}
                      </span>
                      {item.concepts.map((c) => (
                        <span key={c} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                  {rating > 0 && (
                    <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <FaStar /> {rating}/5
                    </span>
                  )}
                  <span style={{ color: '#ea580c', fontSize: '1rem' }}>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>
              </div>

              {/* Expandable Model Answer & Notes */}
              {isExpanded && (
                <div style={{ padding: '1.4rem 1.6rem', borderTop: '1px solid #fed7aa', background: '#ffffff' }}>
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaCheckCircle /> Model Technical Answer & Architecture Summary
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.7, background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      {item.answer}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaLightbulb /> What the Interviewer / External Examiner is Looking For
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748b', fontStyle: 'italic', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.8rem 1rem', borderRadius: '8px' }}>
                      {item.examinerNotes}
                    </div>
                  </div>

                  {/* Confidence Self-Rating */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', paddingTop: '0.6rem', borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      Rate your confidence on this topic:
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate(item.id, star)}
                          style={{
                            background: rating >= star ? '#fef3c7' : '#f8fafc',
                            color: rating >= star ? '#f59e0b' : '#cbd5e1',
                            border: `1px solid ${rating >= star ? '#fcd34d' : '#e2e8f0'}`,
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.88rem'
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
