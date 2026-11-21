// src/pages/AtsChecker.jsx — AI-Powered Resume ATS Score Checker & Keyword Optimizer
import { useState, useEffect, useMemo } from 'react';
import { getJobs, getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KNOWN_SKILLS, extractSkillsFromText, parseStudentSkills } from '../utils/skillMatcher';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaFilePdf,
  FaLightbulb,
  FaSearch,
  FaCopy,
  FaExternalLinkAlt,
  FaSlidersH,
  FaArrowRight
} from 'react-icons/fa';

export default function AtsChecker() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customJd, setCustomJd] = useState('');
  const [useCustomJd, setUseCustomJd] = useState(false);

  useEffect(() => {
    Promise.all([getJobs(), getProfile()])
      .then(([jobsRes, profRes]) => {
        const rawJobs = jobsRes.data.jobs || [];
        setJobs(rawJobs);
        if (rawJobs.length > 0) setSelectedJobId(rawJobs[0].id);
        setProfile(profRes.data);
      })
      .catch(() => toast.error('Failed to load profile or jobs'))
      .finally(() => setLoading(false));
  }, []);

  const activeJob = useMemo(() => {
    return jobs.find((j) => String(j.id) === String(selectedJobId)) || null;
  }, [jobs, selectedJobId]);

  // Compute ATS Score & Breakdown
  const atsAnalysis = useMemo(() => {
    const jdText = useCustomJd
      ? customJd
      : activeJob
      ? `${activeJob.title} ${activeJob.description || ''} ${activeJob.eligibility || ''} ${activeJob.stream || ''}`
      : '';

    if (!jdText.trim()) return null;

    // Target skills required by the job
    const jobSkills = extractSkillsFromText(jdText);
    if (jobSkills.length === 0) {
      jobSkills.push('Problem Solving', 'Data Structures', 'Communication', 'Git', 'Agile');
    }

    // Student profile skills & content
    const studentSkills = parseStudentSkills(profile?.skills || '');
    const studentBioSkills = extractSkillsFromText(profile?.bio || '');
    const allStudentSkills = Array.from(new Set([...studentSkills, ...studentBioSkills]));

    const matched = [];
    const missing = [];

    jobSkills.forEach((skill) => {
      const sLower = skill.toLowerCase();
      const hasMatch = allStudentSkills.some(
        (st) => st.toLowerCase() === sLower || st.toLowerCase().includes(sLower) || sLower.includes(st.toLowerCase())
      );
      if (hasMatch) matched.push(skill);
      else missing.push(skill);
    });

    // Formatting Checks
    const checks = [
      {
        title: 'Résumé Document Uploaded',
        passed: Boolean(profile?.resume_url),
        weight: 20,
        tip: 'Recruiters and ATS parsers require an uploaded PDF/DOC resume.'
      },
      {
        title: 'Technical Skills Section Populated',
        passed: studentSkills.length >= 3,
        weight: 25,
        tip: 'List at least 4-6 specific technical tools, languages, and frameworks.'
      },
      {
        title: 'Academic CGPA Specified',
        passed: Boolean(profile?.cgpa && parseFloat(profile.cgpa) >= 6.0),
        weight: 15,
        tip: 'Most corporate ATS filters automatically discard profiles with missing CGPA.'
      },
      {
        title: 'Contact Details & Phone Number',
        passed: Boolean(profile?.phone && profile.phone.length >= 10),
        weight: 10,
        tip: 'Valid phone and email are essential for automated interview invites.'
      },
      {
        title: 'LinkedIn / GitHub Portfolio Link',
        passed: Boolean(profile?.github || profile?.linkedin),
        weight: 15,
        tip: 'Links to GitHub repos or LinkedIn profiles boost shortlisting by 35%.'
      },
      {
        title: 'Professional Bio & Career Objective',
        passed: Boolean(profile?.bio && profile.bio.length >= 30),
        weight: 15,
        tip: 'A strong 2-sentence summary with target keywords improves match relevance.'
      }
    ];

    let formatScore = 0;
    checks.forEach((c) => {
      if (c.passed) formatScore += c.weight;
    });

    // Keyword match percentage
    const keywordRatio = jobSkills.length > 0 ? (matched.length / jobSkills.length) : 0.5;
    const keywordScore = Math.round(keywordRatio * 100);

    // Blended Total Score: 50% keyword match + 50% resume formatting/completeness
    const totalScore = Math.min(99, Math.max(20, Math.round(keywordScore * 0.55 + formatScore * 0.45)));

    return {
      totalScore,
      keywordScore,
      formatScore,
      matched,
      missing,
      checks,
      jobSkills
    };
  }, [profile, activeJob, customJd, useCustomJd]);

  if (loading) return <div className="loading">Analyzing profile and ATS metrics...</div>;

  return (
    <div className="page" style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
          <span style={{ fontSize: '1.9rem' }}>🤖</span> AI Resume ATS Checker & Keyword Optimizer
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.35rem 0 0 0' }}>
          Scan your profile and résumé against real campus recruiters to pass Applicant Tracking System (ATS) screening algorithms
        </p>
      </div>

      {/* Target Drive Selector */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.3rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
            Select Target Placement Drive to Evaluate:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setUseCustomJd(false)}
              style={{
                background: !useCustomJd ? '#ea580c' : '#f1f5f9',
                color: !useCustomJd ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '0.35rem 0.8rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Active Drives
            </button>
            <button
              type="button"
              onClick={() => setUseCustomJd(true)}
              style={{
                background: useCustomJd ? '#ea580c' : '#f1f5f9',
                color: useCustomJd ? '#ffffff' : '#64748b',
                border: 'none',
                padding: '0.35rem 0.8rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Paste Custom JD
            </button>
          </div>
        </div>

        {!useCustomJd ? (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.92rem',
              fontWeight: 600
            }}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title} ({j.stream} • {j.ctc})
              </option>
            ))}
          </select>
        ) : (
          <textarea
            rows="3"
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            placeholder="Paste job description, eligibility and technical requirements here..."
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem'
            }}
          />
        )}
      </div>

      {/* Main Analysis Display */}
      {atsAnalysis && (
        <div>
          {/* Top Level Metric Scorecard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            {/* Total ATS Score */}
            <div
              style={{
                background:
                  atsAnalysis.totalScore >= 80
                    ? '#f0fdf4'
                    : atsAnalysis.totalScore >= 60
                    ? '#eff6ff'
                    : '#fffbeb',
                border: `1.5px solid ${
                  atsAnalysis.totalScore >= 80
                    ? '#86efac'
                    : atsAnalysis.totalScore >= 60
                    ? '#bfdbfe'
                    : '#fde68a'
                }`,
                borderRadius: '16px',
                padding: '1.6rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                Overall ATS Compatibility Score
              </div>
              <div
                style={{
                  fontSize: '3.4rem',
                  fontWeight: 900,
                  marginTop: '0.4rem',
                  color:
                    atsAnalysis.totalScore >= 80
                      ? '#16a34a'
                      : atsAnalysis.totalScore >= 60
                      ? '#2563eb'
                      : '#d97706'
                }}
              >
                {atsAnalysis.totalScore}
                <span style={{ fontSize: '1.8rem' }}>/100</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {atsAnalysis.totalScore >= 80
                  ? '🟢 Excellent: High Shortlist Probability'
                  : atsAnalysis.totalScore >= 60
                  ? '🔵 Good: Moderate Match, Needs Fine-Tuning'
                  : '🟠 High Risk: May Be Discarded by Automated Filters'}
              </div>
            </div>

            {/* Keyword Match Meter */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.6rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                Technical Keyword Coverage
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginTop: '0.4rem' }}>
                {atsAnalysis.keywordScore}%
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                {atsAnalysis.matched.length} of {atsAnalysis.jobSkills.length} required keywords detected
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.8rem' }}>
                <div style={{ width: `${atsAnalysis.keywordScore}%`, height: '100%', background: '#ea580c', borderRadius: '4px' }} />
              </div>
            </div>

            {/* Formatting & Profile Completeness */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.6rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                Structure & Parseability
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginTop: '0.4rem' }}>
                {atsAnalysis.formatScore}%
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
                {atsAnalysis.checks.filter((c) => c.passed).length} of {atsAnalysis.checks.length} essential ATS sections verified
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.8rem' }}>
                <div style={{ width: `${atsAnalysis.formatScore}%`, height: '100%', background: '#16a34a', borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          {/* 2-Column Details: Keywords vs Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.6rem' }}>
            {/* Column 1: Keywords Breakdown */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.6rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaSearch style={{ color: '#ea580c' }} /> High-Impact Keywords Analysis
              </h3>

              {/* Matched Keywords */}
              <div style={{ marginBottom: '1.4rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaCheckCircle style={{ color: '#16a34a' }} /> Found in Your Profile ({atsAnalysis.matched.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {atsAnalysis.matched.length > 0 ? (
                    atsAnalysis.matched.map((sk) => (
                      <span key={sk} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                        ✓ {sk}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>None detected</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords (Add to resume) */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FaTimesCircle style={{ color: '#dc2626' }} /> Missing from Profile ({atsAnalysis.missing.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {atsAnalysis.missing.length > 0 ? (
                    atsAnalysis.missing.map((sk) => (
                      <span key={sk} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.25rem 0.65rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                        + {sk}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>All target keywords present!</span>
                  )}
                </div>
                <div style={{ marginTop: '1rem', background: '#fff7ed', border: '1px solid #fed7aa', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#c2410c' }}>
                  <FaLightbulb style={{ marginRight: '0.35rem' }} />
                  <strong>ATS Pro-Tip:</strong> Adding these missing keywords to your Profile Skills or Résumé text can increase your ATS screening pass rate by up to <strong>+40%</strong>.
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to="/profile" style={{ fontWeight: 800, textDecoration: 'underline' }}>
                      Update Profile Skills Now →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Structural Parseability Checklist */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.6rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaSlidersH style={{ color: '#2563eb' }} /> ATS Parseability Checklist
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {atsAnalysis.checks.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: c.passed ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${c.passed ? '#bbf7d0' : '#fde68a'}`,
                      borderRadius: '10px',
                      padding: '0.9rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', marginTop: '0.1rem', color: c.passed ? '#16a34a' : '#d97706' }}>
                      {c.passed ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {c.tip}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: c.passed ? '#166534' : '#92400e' }}>
                      {c.passed ? `+${c.weight}%` : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
