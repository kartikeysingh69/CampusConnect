// src/pages/JobDetail.jsx — Full-width 2-column job detail with company info, map & recommendations
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJobById, applyForJob, getMyApplications, getJobs, getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { calculateSkillMatch } from '../utils/skillMatcher';
import CompanyLogo from '../components/CompanyLogo';
import toast from 'react-hot-toast';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendar,
  FaPaperPlane,
  FaCheckCircle,
  FaBuilding,
  FaGlobe,
  FaUsers,
  FaIndustry,
  FaUserTie,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaArrowRight,
  FaLightbulb,
  FaGraduationCap,
  FaChartLine,
  FaStar,
  FaShieldAlt,
  FaHandshake,
  FaClipboardList,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';

// ──────────────────────────────────────────────────────
// Company Knowledge Base (static data for rich details)
// ──────────────────────────────────────────────────────
const COMPANY_DB = {
  'Google': { ceo: 'Sundar Pichai', founded: 2000, hq: 'Mountain View, CA, USA', employees: '182,000+', industry: 'Technology / Internet Services', website: 'google.com', about: 'Google LLC is a global technology leader specializing in internet-related products including search engine, cloud computing, AI, and advertising technologies. A subsidiary of Alphabet Inc.', culture: 'Innovation-driven, 20% time for personal projects, world-class campuses, generous perks.' },
  'Amazon Web Services': { ceo: 'Andy Jassy (Amazon)', founded: 2006, hq: 'Seattle, WA, USA', employees: '1,500,000+ (Amazon)', industry: 'Cloud Computing / Technology', website: 'aws.amazon.com', about: 'AWS is the world\'s most comprehensive and broadly adopted cloud platform, offering 200+ services from data centers globally.', culture: 'Customer obsession, ownership culture, bias for action, 14 Leadership Principles.' },
  'Microsoft Azure': { ceo: 'Satya Nadella (Microsoft)', founded: 1975, hq: 'Redmond, WA, USA', employees: '221,000+', industry: 'Technology / Cloud / Software', website: 'microsoft.com', about: 'Microsoft Corporation develops and supports software, services, devices, and solutions. Azure is its cloud computing platform.', culture: 'Growth mindset, inclusivity, hybrid-first work culture.' },
  'Infosys': { ceo: 'Salil Parekh', founded: 1981, hq: 'Bangalore, India', employees: '340,000+', industry: 'IT Services / Consulting', website: 'infosys.com', about: 'Infosys Ltd is a global leader in digital services, consulting, and next-gen technology solutions with presence in 56+ countries.', culture: 'Learning-centric, Infosys Springboard upskilling, strong campus hiring.' },
  'Meta': { ceo: 'Mark Zuckerberg', founded: 2004, hq: 'Menlo Park, CA, USA', employees: '67,000+', industry: 'Social Media / Technology', website: 'meta.com', about: 'Meta Platforms builds technologies for social connection — Facebook, Instagram, WhatsApp, and Metaverse (Reality Labs).', culture: 'Move fast, be bold, open culture, flat hierarchy, hackathons.' },
  'Oracle Cloud': { ceo: 'Safra Catz', founded: 1977, hq: 'Austin, TX, USA', employees: '164,000+', industry: 'Enterprise Software / Cloud', website: 'oracle.com', about: 'Oracle provides integrated cloud applications and platform services including Oracle Cloud Infrastructure (OCI), databases, and enterprise solutions.', culture: 'Engineering excellence, data-driven, learning investments.' },
  'Uber': { ceo: 'Dara Khosrowshahi', founded: 2009, hq: 'San Francisco, CA, USA', employees: '32,000+', industry: 'Transportation / Technology', website: 'uber.com', about: 'Uber Technologies operates ride-hailing, food delivery (Uber Eats), and freight logistics services in 70+ countries.', culture: 'Do the right thing, build with heart, great minds don\'t think alike.' },
  'Cisco': { ceo: 'Chuck Robbins', founded: 1984, hq: 'San Jose, CA, USA', employees: '83,000+', industry: 'Networking / Cybersecurity', website: 'cisco.com', about: 'Cisco designs and sells networking hardware, software, telecoms equipment, and cybersecurity solutions worldwide.', culture: 'Inclusive future, hybrid work pioneer, conscious culture.' },
  'Netflix': { ceo: 'Ted Sarandos & Greg Peters', founded: 1997, hq: 'Los Gatos, CA, USA', employees: '13,000+', industry: 'Entertainment / Streaming', website: 'netflix.com', about: 'Netflix is the world\'s leading streaming entertainment platform with 230M+ subscribers across 190+ countries.', culture: 'Freedom and responsibility, context not control, top-of-market compensation.' },
  'NVIDIA': { ceo: 'Jensen Huang', founded: 1993, hq: 'Santa Clara, CA, USA', employees: '29,600+', industry: 'Semiconductors / AI Computing', website: 'nvidia.com', about: 'NVIDIA designs GPUs, SoCs, and AI computing platforms. Pioneer in accelerated computing, powering gaming, data centers, and autonomous machines.', culture: 'Intellectual honesty, speed and agility, one team mindset.' },
  'Atlassian': { ceo: 'Mike Cannon-Brookes & Scott Farquhar', founded: 2002, hq: 'Sydney, Australia', employees: '11,000+', industry: 'Software / Collaboration Tools', website: 'atlassian.com', about: 'Atlassian builds Jira, Confluence, Trello, and Bitbucket — tools that help teams collaborate and ship software faster.', culture: 'Open company, no BS. Play as a team. Build with heart and balance.' },
  'Swiggy': { ceo: 'Sriharsha Majety', founded: 2014, hq: 'Bangalore, India', employees: '6,000+ (tech)', industry: 'Food Delivery / Quick Commerce', website: 'swiggy.com', about: 'Swiggy is India\'s largest on-demand delivery platform offering food, grocery (Instamart), and package delivery (Genie).', culture: 'Consumer-first, hustle culture, flat org, internal hackathons.' },
  'Adobe': { ceo: 'Shantanu Narayen', founded: 1982, hq: 'San Jose, CA, USA', employees: '29,000+', industry: 'Software / Creative & Digital Media', website: 'adobe.com', about: 'Adobe Inc. creates industry-leading software for creative professionals — Photoshop, Illustrator, Premiere Pro, and Adobe Experience Cloud.', culture: 'Create the future, be genuine, exceptional results, involved community.' },
  'IBM': { ceo: 'Arvind Krishna', founded: 1911, hq: 'Armonk, NY, USA', employees: '280,000+', industry: 'Technology / Consulting / AI', website: 'ibm.com', about: 'IBM is a multinational technology corporation providing hybrid cloud and AI solutions, consulting, and enterprise infrastructure.', culture: 'Innovation legacy, trust and personal responsibility, growth mindset.' },
  'Qualcomm': { ceo: 'Cristiano Amon', founded: 1985, hq: 'San Diego, CA, USA', employees: '51,000+', industry: 'Semiconductors / Wireless Technology', website: 'qualcomm.com', about: 'Qualcomm develops 5G, Snapdragon mobile processors, and wireless technologies that power billions of devices globally.', culture: 'Invention-driven, patent culture, high-performance engineering teams.' },
  'Zomato': { ceo: 'Deepinder Goyal', founded: 2008, hq: 'Gurgaon, India', employees: '5,500+ (tech)', industry: 'Food Delivery / Technology', website: 'zomato.com', about: 'Zomato is India\'s leading food delivery and restaurant discovery platform operating in 1,000+ cities.', culture: 'Customer obsession, no hierarchy, move fast, data-driven decisions.' },
  'Tata Motors': { ceo: 'Girish Wagh', founded: 1945, hq: 'Mumbai, India', employees: '80,000+', industry: 'Automotive / Manufacturing', website: 'tatamotors.com', about: 'Tata Motors is India\'s largest automobile company manufacturing passenger vehicles, trucks, and electric vehicles under Tata, Jaguar, and Land Rover brands.', culture: 'Ethics-first, Tata values, pioneering EV transition in India.' },
  'Razorpay': { ceo: 'Harshil Mathur', founded: 2014, hq: 'Bangalore, India', employees: '3,000+', industry: 'Fintech / Payment Gateway', website: 'razorpay.com', about: 'Razorpay is India\'s leading full-stack financial solutions company powering payments, banking, lending & payroll for businesses.', culture: 'Ownership, transparency, no-politics zone, engineering-first.' },
  'Paytm': { ceo: 'Vijay Shekhar Sharma', founded: 2010, hq: 'Noida, India', employees: '9,000+', industry: 'Fintech / Digital Payments', website: 'paytm.com', about: 'Paytm is India\'s leading digital payments and financial services company offering mobile payments, banking, insurance, and wealth management.', culture: 'Hustle, scale-up mindset, digital-first India mission.' },
  'TCS Digital': { ceo: 'K Krithivasan (TCS)', founded: 1968, hq: 'Mumbai, India', employees: '614,000+', industry: 'IT Services / Consulting', website: 'tcs.com', about: 'Tata Consultancy Services is a global IT services, consulting and business solutions company. TCS Digital is its premium engineering unit.', culture: 'Values-led, learning & growth, global diverse workforce, community impact.' },
  'PhonePe': { ceo: 'Sameer Nigam', founded: 2015, hq: 'Bangalore, India', employees: '5,000+', industry: 'Fintech / UPI Payments', website: 'phonepe.com', about: 'PhonePe is India\'s #1 UPI platform with 500M+ registered users, offering payments, investments, insurance & lending services.', culture: 'Customer-first, bias for action, build to scale, accountability.' },
  'Deloitte India': { ceo: 'Romal Shetty', founded: 1845, hq: 'London, UK (Global)', employees: '457,000+ (Global)', industry: 'Consulting / Audit / Advisory', website: 'deloitte.com', about: 'Deloitte is one of the Big Four professional services firms providing audit, tax, consulting, enterprise risk, and financial advisory.', culture: 'Purpose-driven, inclusive talent experience, hybrid work, continuous learning.' },
  'Goldman Sachs India': { ceo: 'David Solomon (Global)', founded: 1869, hq: 'New York, USA', employees: '49,000+ (Global)', industry: 'Investment Banking / Finance', website: 'goldmansachs.com', about: 'Goldman Sachs is a leading global financial institution providing investment banking, securities, asset management and consumer banking.', culture: 'Client service, excellence, integrity, teamwork, meritocracy.' },
  'HDFC Bank': { ceo: 'Sashidhar Jagdishan', founded: 1994, hq: 'Mumbai, India', employees: '177,000+', industry: 'Banking / Financial Services', website: 'hdfcbank.com', about: 'HDFC Bank is India\'s largest private sector bank by market cap offering banking, insurance, and investment products across 7,800+ branches.', culture: 'Service excellence, compliance-first, digital innovation, talent development.' },
  'Bosch India': { ceo: 'Guruprasad Mudlapur', founded: 1951, hq: 'Bangalore, India', employees: '30,000+ (India)', industry: 'Automotive / IoT / Engineering', website: 'bosch.in', about: 'Bosch India is a leading technology and engineering company offering mobility solutions, industrial technology, consumer goods and energy solutions.', culture: 'Invented for life, engineering precision, sustainability commitment.' },
  'ABB India': { ceo: 'Sanjeev Sharma', founded: 1988, hq: 'Bangalore, India', employees: '10,000+ (India)', industry: 'Electrification / Automation', website: 'abb.com/in', about: 'ABB India provides electrification, robotics, automation and motion solutions for industrial and infrastructure applications.', culture: 'Courage, care, curiosity, collaboration — pioneering technology.' },
  'Intel India': { ceo: 'Pat Gelsinger (Global)', founded: 1968, hq: 'Santa Clara, CA, USA', employees: '124,000+ (Global)', industry: 'Semiconductors / Computing', website: 'intel.com', about: 'Intel Corporation designs and manufactures processors, chipsets, and computing solutions powering PCs, data centers, IoT and AI.', culture: 'Fearless innovation, inclusion, results-oriented, one Intel.' },
  'Larsen & Toubro Construction': { ceo: 'S N Subrahmanyan (L&T)', founded: 1938, hq: 'Mumbai, India', employees: '60,000+', industry: 'Construction / Infrastructure', website: 'lntecc.com', about: 'L&T Construction is India\'s largest EPC contractor building airports, metros, bridges, power plants & smart cities.', culture: 'Pride in nation-building, safety-first, engineering excellence.' },
  'Flipkart': { ceo: 'Kalyan Krishnamurthy', founded: 2007, hq: 'Bangalore, India', employees: '40,000+', industry: 'E-commerce / Technology', website: 'flipkart.com', about: 'Flipkart is India\'s leading e-commerce marketplace (Walmart Group) offering 150M+ products across fashion, electronics, groceries and more.', culture: 'Audacity, customer-first, bias for action, integrity always.' },
  'Amazon Fulfillment': { ceo: 'Andy Jassy', founded: 1994, hq: 'Seattle, WA, USA', employees: '1,500,000+', industry: 'E-commerce / Logistics', website: 'amazon.com', about: 'Amazon is the world\'s largest e-commerce and cloud computing company, operating across retail, AWS, devices, streaming and logistics.', culture: 'Customer obsession, ownership, earn trust, dive deep, deliver results.' },
  'Ola Electric': { ceo: 'Bhavish Aggarwal', founded: 2017, hq: 'Bangalore, India', employees: '4,000+', industry: 'Electric Vehicles / Mobility', website: 'olaelectric.com', about: 'Ola Electric is building India\'s EV revolution with electric scooters, batteries, and cell manufacturing at FutureFactory — the world\'s largest 2W factory.', culture: 'Mission-driven EV adoption, high-speed execution, bold bets.' },
};

// Get company info: exact match → prefix match → fallback generic
function getCompanyInfo(companyName) {
  if (COMPANY_DB[companyName]) return COMPANY_DB[companyName];
  const key = Object.keys(COMPANY_DB).find(k =>
    companyName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(companyName.toLowerCase())
  );
  if (key) return COMPANY_DB[key];
  return {
    ceo: 'Information not available',
    founded: '—',
    hq: 'India',
    employees: '—',
    industry: 'Various',
    website: companyName.toLowerCase().replace(/\s+/g, '') + '.com',
    about: `${companyName} is a reputed organization actively hiring fresh campus talent across India.`,
    culture: 'Professional work environment focused on employee growth and innovation.'
  };
}

// Google Maps Embed URL from location text
function getMapEmbedUrl(location) {
  if (!location) return null;
  const query = encodeURIComponent(location + ', India');
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setHasApplied(false);

    // Fetch job + all jobs in parallel
    Promise.all([
      getJobById(id),
      getJobs()
    ])
      .then(([jobRes, jobsRes]) => {
        setJob(jobRes.data);
        setAllJobs(jobsRes.data.jobs || []);
      })
      .catch(() => toast.error('Failed to load job details'))
      .finally(() => setLoading(false));

    // Check applied status & fetch student profile for AI skill match
    if (user && user.role === 'student') {
      getMyApplications()
        .then(({ data }) => {
          const applied = data.applications?.some(
            (app) => app.job_id === Number(id)
          );
          if (applied) setHasApplied(true);
        })
        .catch(() => {});

      getProfile()
        .then(({ data }) => setStudentProfile(data))
        .catch(() => {});
    }
  }, [id, user]);

  // Compute AI Skill Match Analysis
  const skillMatch = useMemo(() => {
    if (!job) return null;
    return calculateSkillMatch(job, studentProfile || user);
  }, [job, studentProfile, user]);

  // Recommended jobs: same stream first, then other streams, excluding current
  const { sameStreamJobs, otherJobs } = useMemo(() => {
    if (!job || allJobs.length === 0) return { sameStreamJobs: [], otherJobs: [] };
    const others = allJobs.filter((j) => j.id !== job.id);
    const same = others
      .filter((j) => j.stream && job.stream && j.stream.toLowerCase() === job.stream.toLowerCase())
      .slice(0, 4);
    const other = others
      .filter((j) => !j.stream || !job.stream || j.stream.toLowerCase() !== job.stream.toLowerCase())
      .slice(0, 4);
    return { sameStreamJobs: same, otherJobs: other };
  }, [job, allJobs]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for this job!');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply for jobs!');
      return;
    }
    setApplying(true);
    try {
      // Check if student has uploaded a resume in their profile
      try {
        const { data: studentProfile } = await getProfile();
        if (!studentProfile?.resume_url) {
          const proceed = window.confirm(
            '⚠️ Notice: You have not uploaded a Résumé to your profile!\n\nCompanies typically reject applicants without a résumé. Do you want to continue applying anyway, or cancel and upload your résumé in Profile first?'
          );
          if (!proceed) {
            setApplying(false);
            navigate('/profile');
            return;
          }
        }
      } catch (profileErr) {
        console.warn('Profile check error:', profileErr);
      }

      await applyForJob(Number(id));
      toast.success('Application submitted successfully! 🎉');
      setHasApplied(true);
      setTimeout(() => navigate('/my-applications'), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="page"><p className="empty">Job not found.</p></div>;

  const company = getCompanyInfo(job.company);
  const mapUrl = getMapEmbedUrl(job.location);
  const daysLeft = job.deadline
    ? Math.max(0, Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="page">
      {/* ======== 2-COLUMN LAYOUT ======== */}
      <div className="detail-layout">

        {/* ─────── LEFT COLUMN: JOB DETAILS ─────── */}
        <div className="detail-left">

          {/* Main Job Card */}
          <div className="detail-card detail-main-card">
            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
              <Link to="/jobs">← All Drives</Link>
              <span>/</span>
              <span>{job.stream || 'General'}</span>
              <span>/</span>
              <span>{job.title}</span>
            </div>

            {/* Header */}
            <div className="detail-header">
              <div className="detail-company-badge">
                <CompanyLogo company={job.company} size={28} />
                <span>{job.company}</span>
              </div>
              <h1 className="detail-title">
                <FaBriefcase className="detail-title-icon" />
                {job.title}
              </h1>
            </div>

            {/* Quick Meta Tags */}
            <div className="detail-meta-tags">
              <span className="detail-tag location">
                <FaMapMarkerAlt /> {job.location || 'Pan India'}
              </span>
              <span className="detail-tag ctc">
                <FaMoneyBillWave /> {job.ctc}
              </span>
              <span className="detail-tag stream">
                <FaTag /> {job.stream || 'General'}
              </span>
              <span className="detail-tag type">
                <FaBriefcase /> {job.job_type || 'Full Time'}
              </span>
              <span className={`detail-tag status-${job.status}`}>
                {job.status === 'open' ? '🟢 Open' : '🔴 Closed'}
              </span>
              {daysLeft !== null && job.status === 'open' && (
                <span className="detail-tag deadline-tag">
                  <FaClock /> {daysLeft === 0 ? 'Last day!' : `${daysLeft} days left`}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="detail-divider" />

            {/* Job Description */}
            <div className="detail-section">
              <h3><FaClipboardList className="section-icon" /> Job Description</h3>
              <p>{job.description || 'Detailed job description will be shared during the placement briefing session.'}</p>
            </div>

            {/* Eligibility */}
            <div className="detail-section">
              <h3><FaGraduationCap className="section-icon" /> Eligibility Criteria</h3>
              <p>{job.eligibility || 'Open for final year students of relevant disciplines.'}</p>
            </div>

            {/* AI Skill Fit & Recommendation Box */}
            {skillMatch && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                  border: '1.5px solid #fed7aa',
                  borderRadius: '14px',
                  padding: '1.3rem',
                  marginBottom: '1.8rem',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🎯</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                      AI Candidate Skill Match & Fit Analysis
                    </h3>
                  </div>
                  <span
                    style={{
                      background: skillMatch.bg,
                      color: skillMatch.color,
                      border: `1.5px solid ${skillMatch.border}`,
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 800
                    }}
                  >
                    {skillMatch.score}% Match • {skillMatch.ratingLabel}
                  </span>
                </div>

                {/* Match Meter Bar */}
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: `${skillMatch.score}%`,
                      height: '100%',
                      background:
                        skillMatch.score >= 80
                          ? 'linear-gradient(90deg, #10b981, #16a34a)'
                          : skillMatch.score >= 60
                          ? 'linear-gradient(90deg, #3b82f6, #0284c7)'
                          : 'linear-gradient(90deg, #f59e0b, #ea580c)',
                      borderRadius: '4px',
                      transition: 'width 0.8s ease'
                    }}
                  />
                </div>

                <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 1rem 0' }}>
                  {skillMatch.advice}
                </p>

                {/* Skills Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {/* Matched Skills */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaCheckCircle style={{ color: '#16a34a' }} /> Matched Skills ({skillMatch.matchedSkills.length})
                    </div>
                    {skillMatch.matchedSkills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {skillMatch.matchedSkills.map((sk) => (
                          <span
                            key={sk}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #86efac',
                              color: '#15803d',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                        No direct overlap detected with registered skills.
                      </div>
                    )}
                  </div>

                  {/* Skills to Learn / Brush Up */}
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.9rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaLightbulb style={{ color: '#d97706' }} /> Recommended to Prepare ({skillMatch.missingSkills.length})
                    </div>
                    {skillMatch.missingSkills.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {skillMatch.missingSkills.map((sk) => (
                          <span
                            key={sk}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #fcd34d',
                              color: '#b45309',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            + {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                        All primary technical prerequisites satisfied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Key Highlights */}
            <div className="detail-section">
              <h3><FaLightbulb className="section-icon" /> Key Highlights</h3>
              <div className="detail-highlights">
                <div className="highlight-item">
                  <FaMoneyBillWave className="hi-icon" />
                  <div>
                    <strong>Package (CTC)</strong>
                    <span>{job.ctc}</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <FaMapMarkerAlt className="hi-icon" />
                  <div>
                    <strong>Work Location</strong>
                    <span>{job.location || 'To be announced'}</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <FaCalendarAlt className="hi-icon" />
                  <div>
                    <strong>Apply Before</strong>
                    <span>{job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Rolling basis'}</span>
                  </div>
                </div>
                <div className="highlight-item">
                  <FaShieldAlt className="hi-icon" />
                  <div>
                    <strong>Job Status</strong>
                    <span>{job.status === 'open' ? 'Actively Hiring' : 'Registration Closed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="detail-apply-section">
              {job.status === 'open' ? (
                hasApplied ? (
                  <button className="btn-apply btn-applied" disabled>
                    <FaCheckCircle /> Already Applied — Application Submitted
                  </button>
                ) : (
                  <button onClick={handleApply} className="btn-apply" disabled={applying}>
                    <FaPaperPlane /> {applying ? 'Submitting Application...' : 'Apply Now for This Drive'}
                  </button>
                )
              ) : (
                <button className="btn-apply btn-closed" disabled>
                  Registration Closed
                </button>
              )}
              <button onClick={() => navigate('/jobs')} className="btn-secondary" style={{ marginTop: '0.8rem' }}>
                ← Back to All Placement Drives
              </button>
            </div>
          </div>

          {/* Google Maps Location */}
          {mapUrl && (
            <div className="detail-card detail-map-card">
              <h3><FaMapMarkerAlt className="section-icon" /> Job Location — {job.location}</h3>
              <div className="detail-map-wrapper">
                <iframe
                  title="Job Location Map"
                  src={mapUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>

        {/* ─────── RIGHT COLUMN: SIDEBAR ─────── */}
        <div className="detail-right">

          {/* Company Profile Card */}
          <div className="detail-card detail-company-card">
            <div className="company-card-header">
              <CompanyLogo company={job.company} size={60} />
              <div>
                <h3>{job.company}</h3>
                <span className="company-industry">{company.industry}</span>
              </div>
            </div>

            <p className="company-about">{company.about}</p>

            <div className="company-info-grid">
              <div className="company-info-item">
                <FaUserTie className="ci-icon" />
                <div>
                  <small>CEO / Head</small>
                  <strong>{company.ceo}</strong>
                </div>
              </div>
              <div className="company-info-item">
                <FaCalendarAlt className="ci-icon" />
                <div>
                  <small>Founded</small>
                  <strong>{company.founded}</strong>
                </div>
              </div>
              <div className="company-info-item">
                <FaUsers className="ci-icon" />
                <div>
                  <small>Employees</small>
                  <strong>{company.employees}</strong>
                </div>
              </div>
              <div className="company-info-item">
                <FaMapMarkerAlt className="ci-icon" />
                <div>
                  <small>Headquarters</small>
                  <strong>{company.hq}</strong>
                </div>
              </div>
              <div className="company-info-item">
                <FaGlobe className="ci-icon" />
                <div>
                  <small>Website</small>
                  <strong>{company.website}</strong>
                </div>
              </div>
              <div className="company-info-item">
                <FaIndustry className="ci-icon" />
                <div>
                  <small>Industry</small>
                  <strong>{company.industry}</strong>
                </div>
              </div>
            </div>

            {/* Company Culture */}
            <div className="company-culture">
              <h4><FaHandshake className="section-icon" /> Work Culture</h4>
              <p>{company.culture}</p>
            </div>
          </div>

          {/* Recommended: Same Stream */}
          {sameStreamJobs.length > 0 && (
            <div className="detail-card detail-reco-card">
              <h3>
                <FaStar className="section-icon reco-icon" />
                Similar {job.stream} Roles
              </h3>
              <div className="reco-list">
                {sameStreamJobs.map((rj) => (
                  <Link key={rj.id} to={`/jobs/${rj.id}`} className="reco-item">
                    <CompanyLogo company={rj.company} size={42} />
                    <div className="reco-info">
                      <strong>{rj.title}</strong>
                      <span className="reco-company">{rj.company}</span>
                      <div className="reco-meta">
                        <span><FaMapMarkerAlt /> {rj.location || 'India'}</span>
                        <span className="reco-ctc"><FaMoneyBillWave /> {rj.ctc}</span>
                      </div>
                    </div>
                    <FaArrowRight className="reco-arrow" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommended: Other Streams */}
          {otherJobs.length > 0 && (
            <div className="detail-card detail-reco-card">
              <h3>
                <FaChartLine className="section-icon reco-icon" />
                Explore Other Drives
              </h3>
              <div className="reco-list">
                {otherJobs.map((rj) => (
                  <Link key={rj.id} to={`/jobs/${rj.id}`} className="reco-item">
                    <CompanyLogo company={rj.company} size={42} />
                    <div className="reco-info">
                      <strong>{rj.title}</strong>
                      <span className="reco-company">{rj.company}</span>
                      <div className="reco-meta">
                        <span><FaTag /> {rj.stream || 'General'}</span>
                        <span className="reco-ctc"><FaMoneyBillWave /> {rj.ctc}</span>
                      </div>
                    </div>
                    <FaArrowRight className="reco-arrow" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Contact / Placement Cell */}
          <div className="detail-card detail-contact-card">
            <h3><FaEnvelope className="section-icon" /> Placement Cell Contact</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '0.8rem' }}>
              For queries about this drive, contact the Training & Placement Office:
            </p>
            <div className="contact-item">
              <FaEnvelope /> placement@campus.edu
            </div>
            <div className="contact-item">
              <FaPhone /> +91-XXXXX-XXXXX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
