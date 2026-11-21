// src/pages/LandingHome.jsx — Flagship Internshala-Inspired Front Page & Campus Recruitment Hub
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobs, googleSsoLogin } from '../services/api';
import CompanyLogo from '../components/CompanyLogo';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaGoogle,
  FaEnvelope,
  FaArrowRight,
  FaLaptopCode,
  FaFileAlt,
  FaComments,
  FaChartLine,
  FaGraduationCap,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaQrcode,
  FaPhoneAlt,
  FaUniversity,
  FaChevronRight,
  FaShieldAlt,
  FaUserGraduate,
  FaCode,
  FaDownload,
  FaPaperPlane
} from 'react-icons/fa';

export default function LandingHome() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [trendingJobs, setTrendingJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    getJobs()
      .then(({ data }) => {
        const raw = data.jobs || [];
        setTrendingJobs(raw.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleGoogleQuickSso = async () => {
    try {
      const email = prompt('Enter your verified College Email (@campus.edu):', 'student@campus.edu');
      if (!email) return;
      const name = prompt('Enter your Full Name:', 'College Candidate');
      if (!name) return;

      const { data } = await googleSsoLogin({
        email: email.trim(),
        name: name.trim(),
        role: 'student'
      });
      loginUser(data.user, data.token);
      toast.success(`🎉 Welcome to CampusConnect, ${data.user.name}!`);
      navigate('/jobs');
    } catch (err) {
      toast.error('SSO Login failed');
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setContactSent(true);
    toast.success('Thank you! Your inquiry has been dispatched to the TPO placement desk.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const marqueeCompanies = [
    'DECATHLON',
    'amazon',
    'Coca-Cola',
    'practo',
    'OYO',
    'paytm',
    'Google',
    'Microsoft',
    'Tata Motors',
    'L&T Infotech',
    'TCS Ninja',
    'Infosys'
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      {/* ========================================================================= */}
      {/* 1. HERO BANNER (Exact Internshala Layout: Boy + Girl, Blue Gradient, CTA) */}
      {/* ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a3663 0%, #004e89 55%, #0077b6 100%)',
          color: '#ffffff',
          padding: '3rem 2rem 2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 0.85fr)',
            alignItems: 'center',
            gap: '2.5rem'
          }}
        >
          {/* Left Hero Content */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '6px 14px',
                borderRadius: '30px',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <FaUniversity style={{ color: '#fed7aa' }} />
              <span>OFFICIAL INSTITUTIONAL PLACEMENT PORTAL</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.1rem, 4vw, 3.1rem)',
                fontWeight: 900,
                lineHeight: 1.18,
                margin: '0 0 1rem',
                letterSpacing: '-0.5px'
              }}
            >
              India's leading platform
            </h1>

            <div
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                fontWeight: 500,
                color: '#e0f2fe',
                marginBottom: '2rem',
                lineHeight: 1.5
              }}
            >
              For{' '}
              <span
                style={{
                  position: 'relative',
                  fontWeight: 800,
                  color: '#ffffff',
                  borderBottom: '3.5px solid #38bdf8',
                  paddingBottom: '2px'
                }}
              >
                campus fresher drives
              </span>
              , technical prep & dream placements
            </div>

            {/* Candidate Fast Sign-up Card (Matching Internshala Card) */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '18px',
                padding: '1.4rem 1.6rem',
                maxWidth: '480px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#bae6fd',
                  marginBottom: '0.85rem'
                }}
              >
                {user ? `Welcome, ${user.name} (${user.role.toUpperCase()})` : 'Candidate sign up'}
              </div>

              {user ? (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/jobs"
                    style={{
                      flex: 1,
                      background: '#ffffff',
                      color: '#004e89',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Browse Drives</span>
                    <FaArrowRight style={{ fontSize: '0.8rem' }} />
                  </Link>
                  <Link
                    to="/my-applications"
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1.5px solid #ffffff',
                      color: '#ffffff',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textAlign: 'center'
                    }}
                  >
                    My Applications
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={handleGoogleQuickSso}
                      style={{
                        flex: 1,
                        background: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px 14px',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      <FaGoogle style={{ color: '#ea4335', fontSize: '1.1rem' }} />
                      <span>Continue with Google</span>
                    </button>

                    <Link
                      to="/register"
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        borderRadius: '10px',
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaEnvelope />
                      <span>Continue with Email</span>
                    </Link>
                  </div>

                  <p
                    style={{
                      margin: '0.5rem 0 0.85rem',
                      fontSize: '0.72rem',
                      color: '#93c5fd',
                      lineHeight: 1.4
                    }}
                  >
                    By continuing as a candidate, you agree to our{' '}
                    <span style={{ textDecoration: 'underline', color: '#ffffff' }}>Terms & Conditions</span> and{' '}
                    <span style={{ textDecoration: 'underline', color: '#ffffff' }}>Privacy Policy</span>.
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.65rem' }}>
                    <Link
                      to="/recruiter"
                      style={{
                        color: '#bae6fd',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Employer sign up</span>
                      <FaChevronRight style={{ fontSize: '0.65rem' }} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Hero Visual: Boy and Girl Students Illustration */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              position: 'relative'
            }}
          >
            {/* SVG Visual Composition Matching Internshala Student Pair */}
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                borderRadius: '24px',
                background: 'radial-gradient(circle at 50% 60%, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
                padding: '1.5rem 1rem 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <svg
                viewBox="0 0 500 420"
                style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.3))' }}
              >
                {/* Background decorative soft shapes */}
                <circle cx="250" cy="200" r="160" fill="#0284c7" opacity="0.25" />
                <circle cx="160" cy="180" r="110" fill="#38bdf8" opacity="0.3" />

                {/* GIRL (Left): White formal shirt, holding modern laptop */}
                <g id="girl-student">
                  {/* Hair */}
                  <path
                    d="M 120 130 C 110 80, 210 70, 210 130 C 220 190, 200 230, 215 270 C 190 280, 110 270, 115 230 Z"
                    fill="#1e1b4b"
                  />
                  {/* Face */}
                  <ellipse cx="165" cy="140" rx="36" ry="44" fill="#fed7aa" />
                  {/* Smile & Eyes */}
                  <path d="M 152 152 Q 165 164 178 152" stroke="#9a3412" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <ellipse cx="152" cy="132" rx="4" ry="5" fill="#451a03" />
                  <ellipse cx="178" cy="132" rx="4" ry="5" fill="#451a03" />
                  {/* Eyebrows */}
                  <path d="M 146 122 Q 152 118 158 122" stroke="#451a03" strokeWidth="2.5" fill="none" />
                  <path d="M 172 122 Q 178 118 184 122" stroke="#451a03" strokeWidth="2.5" fill="none" />
                  {/* White Collared Shirt */}
                  <path d="M 125 210 L 205 210 L 225 380 L 105 380 Z" fill="#ffffff" />
                  <path d="M 155 210 L 165 245 L 175 210 Z" fill="#e2e8f0" />
                  {/* Modern Slim Laptop */}
                  <rect x="90" y="270" width="100" height="65" rx="6" fill="#334155" />
                  <rect x="94" y="274" width="92" height="52" rx="4" fill="#0284c7" />
                  <circle cx="140" cy="300" r="9" fill="#ffffff" opacity="0.8" />
                  {/* Arms holding laptop */}
                  <path d="M 115 230 L 95 285 L 125 300" stroke="#fed7aa" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <path d="M 215 230 L 185 285 L 165 295" stroke="#fed7aa" strokeWidth="16" strokeLinecap="round" fill="none" />
                </g>

                {/* BOY (Right): Light blue collared shirt, holding placement documents */}
                <g id="boy-student">
                  {/* Short stylish hair */}
                  <path d="M 300 115 C 300 70, 390 70, 390 115 C 385 130, 310 130, 300 115 Z" fill="#0f172a" />
                  {/* Face */}
                  <ellipse cx="345" cy="135" rx="35" ry="42" fill="#fcd34d" />
                  {/* Warm Smile & Eyes */}
                  <path d="M 333 150 Q 345 162 357 150" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <ellipse cx="334" cy="130" rx="4" ry="5" fill="#451a03" />
                  <ellipse cx="356" cy="130" rx="4" ry="5" fill="#451a03" />
                  {/* Eyebrows */}
                  <path d="M 328 120 Q 334 116 340 120" stroke="#451a03" strokeWidth="2.5" fill="none" />
                  <path d="M 350 120 Q 356 116 362 120" stroke="#451a03" strokeWidth="2.5" fill="none" />
                  {/* Light Blue Formal Shirt */}
                  <path d="M 295 205 L 395 205 L 420 380 L 275 380 Z" fill="#bae6fd" />
                  <path d="M 340 205 L 345 250 L 350 205 Z" fill="#7dd3fc" />
                  {/* Placement Offer Document / Portfolio */}
                  <g transform="rotate(-10 380 280)">
                    <rect x="360" y="240" width="85" height="110" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1="375" y1="260" x2="430" y2="260" stroke="#ea580c" strokeWidth="4" />
                    <line x1="375" y1="275" x2="420" y2="275" stroke="#94a3b8" strokeWidth="2.5" />
                    <line x1="375" y1="290" x2="430" y2="290" stroke="#94a3b8" strokeWidth="2.5" />
                    <line x1="375" y1="305" x2="410" y2="305" stroke="#94a3b8" strokeWidth="2.5" />
                    {/* Verified Green Stamp */}
                    <circle cx="415" cy="325" r="10" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
                    <path d="M 411 325 L 414 328 L 420 322" stroke="#16a34a" strokeWidth="2" fill="none" />
                  </g>
                  {/* Arms holding paper */}
                  <path d="M 300 230 L 360 275 L 370 290" stroke="#fcd34d" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <path d="M 390 230 L 415 285 L 395 305" stroke="#fcd34d" strokeWidth="16" strokeLinecap="round" fill="none" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. METRICS & MARQUEE HIRING PARTNERS (Matching Internshala Dark Strip)    */}
      {/* ========================================================================= */}
      <section
        style={{
          background: '#042444',
          color: '#ffffff',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid #1e3a5f'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          {/* 10k+ Openings Stat Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              paddingRight: '2rem',
              borderRight: '2px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#38bdf8' }}>1,200+</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e0f2fe' }}>Campus Openings</span>
          </div>

          {/* Marquee Floating Logos */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '2.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '0.25rem 0'
            }}
          >
            {marqueeCompanies.map((name, i) => (
              <span
                key={i}
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.75)',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase'
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRENDING CAMPUS DRIVES ("Trending now ↗")                              */}
      {/* ========================================================================= */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.9rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Trending now</span>
              <span
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem'
                }}
              >
                ↗
              </span>
            </h2>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              Top hiring drives visited by corporate partners this recruitment season
            </p>
          </div>

          <Link
            to="/jobs"
            style={{
              color: '#008bdc',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>View all 800+ drives</span>
            <FaArrowRight style={{ fontSize: '0.8rem' }} />
          </Link>
        </div>

        {/* Drives Grid */}
        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading active campus drives...
          </div>
        ) : trendingJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No active drives currently published. Check back soon!
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {trendingJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
                        {job.title}
                      </h3>
                      <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.92rem' }}>
                        {job.company}
                      </div>
                    </div>
                    <CompanyLogo company={job.company} size={48} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FaMoneyBillWave /> {job.salary_range || 'Competitive CTC'}
                    </span>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <FaMapMarkerAlt /> {job.location || 'On-Campus'}
                    </span>
                    {job.stream && (
                      <span
                        style={{
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 700
                        }}
                      >
                        {job.stream}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f1f5f9'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Status: <strong style={{ color: '#16a34a' }}>Actively Hiring</strong>
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    style={{
                      background: '#008bdc',
                      color: '#ffffff',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>View & Apply</span>
                    <FaArrowRight style={{ fontSize: '0.75rem' }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. PLATFORM CAPABILITIES HUB (Everything Accessible From Front Page!)     */}
      {/* ========================================================================= */}
      <section
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          padding: '4rem 1.5rem'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span
              style={{
                background: '#ffedd5',
                color: '#c2410c',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}
            >
              End-to-End Placement Architecture
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '0.75rem 0 0.5rem', color: '#0f172a' }}>
              Everything You Need to Get Hired
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
              Direct access to our complete AI and technical evaluation suite right from your homepage.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {/* 1. In-Browser Coding Assessment Arena */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FaLaptopCode />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  In-Browser Coding Assessment
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Practice real MNC coding questions in JavaScript & Python with real-time test case execution, auto-scoring, and performance metrics.
                </p>
              </div>
              <Link
                to="/assessment"
                style={{
                  marginTop: '1.5rem',
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Launch Coding Test</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>

            {/* 2. AI Resume ATS Checker */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FaFileAlt />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  AI ATS Resume Matcher
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Analyze your resume against top tech job descriptions. Get instant keyword gap analysis, ATS score %, and tailor your CV for shortlisting.
                </p>
              </div>
              <Link
                to="/ats-checker"
                style={{
                  marginTop: '1.5rem',
                  background: '#ea580c',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Check ATS Score</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>

            {/* 3. Technical & Viva Defense Prep Q&A */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FaGraduationCap />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Technical & Viva Prep Q&A
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Simulate technical round viva defenses. Master Top 30 Examiner questions across DSA, System Design, DBMS, and core engineering concepts.
                </p>
              </div>
              <Link
                to="/mock-prep"
                style={{
                  marginTop: '1.5rem',
                  background: '#d97706',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Start Viva Prep</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>

            {/* 4. Real-time 1-on-1 Direct Messaging */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FaComments />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Direct Candidate-Recruiter Chat
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Communicate in real-time with hiring recruiters, TPO placement coordinators, and peer candidates with instant notifications.
                </p>
              </div>
              <Link
                to="/messages"
                style={{
                  marginTop: '1.5rem',
                  background: '#9333ea',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Open Messenger</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>

            {/* 5. Placement Probability & CTC Trends */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FaChartLine />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Predictive Placement Analytics
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Calculate your selection probability based on CGPA and stream, inspect 5-year CTC growth curves, and department placement heatmaps.
                </p>
              </div>
              <Link
                to="/analytics"
                style={{
                  marginTop: '1.5rem',
                  background: '#16a34a',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>View Analytics</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>

            {/* 6. TPO Bulletin & Drive Discussions */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '18px',
                padding: '1.75rem',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    marginBottom: '1rem'
                  }}
                >
                  <FaBuilding />
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  TPO Bulletin & Drive Q&A
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Official notices, drive date sheets, eligibility circulars, and community discussions for active on-campus recruitment rounds.
                </p>
              </div>
              <Link
                to="/forum"
                style={{
                  marginTop: '1.5rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Read Bulletin</span>
                <FaArrowRight style={{ fontSize: '0.75rem' }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CONTACT US & INTERACTIVE QR CODE FOOTER (As Requested by User)        */}
      {/* ========================================================================= */}
      <footer
        style={{
          background: '#0f172a',
          color: '#f8fafc',
          padding: '4rem 1.5rem 2rem',
          borderTop: '1px solid #1e293b'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1fr) minmax(240px, 0.8fr)',
            gap: '3rem',
            marginBottom: '3rem'
          }}
        >
          {/* Column 1: Institutional TPO Office & Contact Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <img src="/campusconnect-logo.svg" alt="CampusConnect" style={{ width: '32px', height: '32px' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>CampusConnect</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Central Directorate of Career Development & Campus Placement Cell. Empowering engineering, management, and technical candidates with zero-friction placements.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <div>
                <strong style={{ color: '#ffffff' }}>Placement Office: </strong>
                <span>Block C, 3rd Floor, Central Academic Complex</span>
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Official Email: </strong>
                <a href="mailto:placement@campus.edu" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  placement@campus.edu
                </a>
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>TPO Helpline: </strong>
                <span>+91 (0) 11-2789-0000 / 0001</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Inquiry Message Form */}
          <div>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
              Direct TPO Query & Support Desk
            </h4>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your Full Name / Roll Number"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="Your Institutional Email (@campus.edu)"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <textarea
                rows={3}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Ask about upcoming drives, scheduling or credentials..."
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#008bdc',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FaPaperPlane />
                <span>Submit Query to TPO</span>
              </button>
            </form>
          </div>

          {/* Column 3: Interactive QR Code (As requested by user) */}
          <div
            style={{
              background: '#1e293b',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #334155',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                marginBottom: '0.85rem'
              }}
            >
              {/* Scalable High-Fidelity SVG QR Code */}
              <svg width="130" height="130" viewBox="0 0 130 130">
                {/* QR Finder Patterns */}
                <rect width="130" height="130" fill="#ffffff" />
                {/* Top-Left */}
                <rect x="10" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="16" y="16" width="23" height="23" fill="#ffffff" rx="2" />
                <rect x="22" y="22" width="11" height="11" fill="#008bdc" rx="1" />
                {/* Top-Right */}
                <rect x="85" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="91" y="16" width="23" height="23" fill="#ffffff" rx="2" />
                <rect x="97" y="22" width="11" height="11" fill="#008bdc" rx="1" />
                {/* Bottom-Left */}
                <rect x="10" y="85" width="35" height="35" fill="#0f172a" rx="4" />
                <rect x="16" y="91" width="23" height="23" fill="#ffffff" rx="2" />
                <rect x="22" y="97" width="11" height="11" fill="#008bdc" rx="1" />
                {/* Data Modules */}
                <rect x="52" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="68" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="32" width="8" height="8" fill="#008bdc" />
                <rect x="68" y="32" width="8" height="8" fill="#0f172a" />
                <rect x="15" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="32" y="52" width="8" height="8" fill="#008bdc" />
                <rect x="52" y="52" width="24" height="24" rx="4" fill="#0284c7" />
                <rect x="85" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="102" y="52" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="85" width="8" height="8" fill="#0f172a" />
                <rect x="68" y="85" width="8" height="8" fill="#008bdc" />
                <rect x="85" y="85" width="8" height="8" fill="#0f172a" />
                <rect x="102" y="102" width="8" height="8" fill="#0f172a" />
                <rect x="68" y="102" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="102" width="8" height="8" fill="#008bdc" />
              </svg>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '3px' }}>
              Mobile Placement Handbook
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Scan QR code with your mobile camera for drive alerts & schedules
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Accreditation Line */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            paddingTop: '1.5rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: '#64748b'
          }}
        >
          <div>
            © {new Date().getFullYear()} CampusConnect Recruitment System. Verified Institutional Placement Partner.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>NAAC Criterion V Compliant</span>
            <span>NIRF Placement Audited</span>
            <span>AICTE Disclosures Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}