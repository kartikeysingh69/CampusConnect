// src/pages/recruiter/RecruiterDashboard.jsx — Dedicated Corporate Recruiter & HR Portal
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getRecruiterDrives,
  getRecruiterApplications,
  getRecruiterStats,
  postRecruiterDrive,
  submitEvaluation,
  scheduleInterview,
  issueOfferLetter
} from '../../services/api';
import CompanyLogo from '../../components/CompanyLogo';
import toast from 'react-hot-toast';
import {
  FaBuilding,
  FaBriefcase,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaSearch,
  FaPlus,
  FaFilePdf,
  FaExternalLinkAlt,
  FaAward,
  FaCalendarPlus,
  FaComments,
  FaSlidersH
} from 'react-icons/fa';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' or 'drives'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [evaluatingApp, setEvaluatingApp] = useState(null);
  const [interviewApp, setInterviewApp] = useState(null);
  const [offerApp, setOfferApp] = useState(null);

  // Forms
  const [postForm, setPostForm] = useState({
    title: '',
    stream: 'Computer Science',
    job_type: 'Full Time',
    ctc: '',
    location: '',
    deadline: '',
    eligibility: '',
    description: ''
  });

  const [evalForm, setEvalForm] = useState({
    technical_score: 4,
    communication_score: 4,
    problem_solving_score: 4,
    recommendation: 'hire',
    feedback_notes: ''
  });

  const [interviewForm, setInterviewForm] = useState({
    round_name: 'Technical Round 1',
    round_type: 'Technical Interview',
    scheduled_date: '',
    duration_minutes: 45,
    mode: 'Online Video Call',
    location_or_link: 'https://meet.google.com/campus-eval',
    notes: ''
  });

  const [offerForm, setOfferForm] = useState({
    offered_ctc: '',
    joining_date: '',
    offer_letter_url: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, drivesRes, appsRes] = await Promise.all([
        getRecruiterStats(),
        getRecruiterDrives(),
        getRecruiterApplications()
      ]);
      setStats(statsRes.data);
      setDrives(drivesRes.data.drives || []);
      setApplications(appsRes.data.applications || []);
    } catch (err) {
      toast.error('Failed to load recruiter portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companyName = user?.company_name || 'Enterprise Recruiter';

  // Filtered applicants
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        app.student_name.toLowerCase().includes(q) ||
        app.job_title.toLowerCase().includes(q) ||
        (app.student_skills && app.student_skills.toLowerCase().includes(q)) ||
        (app.student_branch && app.student_branch.toLowerCase().includes(q));

      const matchStatus = filterStatus === 'all' || app.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [applications, searchTerm, filterStatus]);

  // Handle Post Drive
  const handlePostDrive = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await postRecruiterDrive(postForm);
      toast.success('🎉 Recruitment drive created & broadcast to students!');
      setShowPostModal(false);
      setPostForm({
        title: '',
        stream: 'Computer Science',
        job_type: 'Full Time',
        ctc: '',
        location: '',
        deadline: '',
        eligibility: '',
        description: ''
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post drive');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Evaluation Submit
  const handleOpenEvaluation = (app) => {
    setEvaluatingApp(app);
    setEvalForm({
      technical_score: app.technical_score || 4,
      communication_score: app.communication_score || 4,
      problem_solving_score: app.problem_solving_score || 4,
      recommendation: app.recommendation || 'hire',
      feedback_notes: app.feedback_notes || ''
    });
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitEvaluation({
        application_id: evaluatingApp.id,
        ...evalForm
      });
      toast.success('Candidate scorecard & evaluation saved!');
      setEvaluatingApp(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Schedule Interview
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await scheduleInterview({
        application_id: interviewApp.id,
        ...interviewForm
      });
      toast.success('Interview scheduled & Google Calendar invite sent to candidate!');
      setInterviewApp(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Offer Release
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await issueOfferLetter(offerApp.id, offerForm);
      toast.success('🎉 Formal Offer Letter issued & celebratory email sent!');
      setOfferApp(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to release offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading recruiter corporate dashboard...</div>;

  return (
    <div className="page" style={{ maxWidth: '1350px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
          border: '1.5px solid #fed7aa',
          borderRadius: '16px',
          padding: '1.8rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.2rem',
          boxShadow: '0 4px 16px rgba(234, 88, 12, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <CompanyLogo company={companyName} size={58} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', fontWeight: 900 }}>
                {companyName} Talent Acquisition Portal
              </h1>
              <span style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                Verified Hiring Partner
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '0.92rem' }}>
              Logged in as <strong>{user?.name}</strong> • Evaluate university talent, schedule rounds, and extend offers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.7rem 1.4rem',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
          }}
        >
          <FaPlus /> Post New Hiring Drive
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Our Active Drives</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaBriefcase />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginTop: '0.4rem' }}>{stats?.totalDrives || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Drives on CampusConnect</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Total Applicants</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaUsers />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginTop: '0.4rem' }}>{stats?.totalApplicants || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700, marginTop: '0.2rem' }}>Candidates Applied</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Scorecards Logged</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaStar />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', marginTop: '0.4rem' }}>{stats?.evaluatedCandidates || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700, marginTop: '0.2rem' }}>Evaluated with Feedback</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 2px 8px rgba(22,163,74,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#166534' }}>Selected & Placed</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaAward />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#16a34a', marginTop: '0.4rem' }}>{stats?.selectedHires || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '0.2rem' }}>Offers Extended 🎉</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('applicants')}
          style={{
            background: activeTab === 'applicants' ? '#ea580c' : '#ffffff',
            color: activeTab === 'applicants' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '0.55rem 1.3rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'applicants' ? '0 2px 6px rgba(234, 88, 12, 0.25)' : 'none'
          }}
        >
          Candidate Pipeline ({applications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('drives')}
          style={{
            background: activeTab === 'drives' ? '#ea580c' : '#ffffff',
            color: activeTab === 'drives' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '0.55rem 1.3rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'drives' ? '0 2px 6px rgba(234, 88, 12, 0.25)' : 'none'
          }}
        >
          Our Posted Drives ({drives.length})
        </button>
      </div>

      {/* TAB 1: APPLICANTS PIPELINE */}
      {activeTab === 'applicants' && (
        <div>
          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search candidate, skill, branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.8rem 0.5rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  style={{
                    background: filterStatus === st ? '#ffffff' : 'transparent',
                    color: filterStatus === st ? '#ea580c' : '#64748b',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>#</th>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Candidate</th>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Applied Drive</th>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Branch & CGPA</th>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Evaluation Score</th>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Decision Status</th>
                  <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                      No applications found for your company drives matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{app.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.student_email}</div>
                        {app.student_resume && (
                          <a
                            href={app.student_resume.startsWith('http') ? app.student_resume : `http://localhost:5000${app.student_resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}
                          >
                            <FaFilePdf /> View CV
                          </a>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.job_title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 600 }}>{app.stream || 'Computer Science'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{app.student_branch || '—'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>CGPA: {app.student_cgpa || '—'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {app.recommendation ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f5f3ff', color: '#7c3aed', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                            <FaStar style={{ color: '#f59e0b' }} />
                            Avg: {Math.round(((app.technical_score + app.communication_score + app.problem_solving_score) / 3) * 10) / 10}/5 ({app.recommendation.toUpperCase()})
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Pending Evaluation</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            background:
                              app.status === 'selected'
                                ? '#dcfce7'
                                : app.status === 'shortlisted'
                                ? '#fffbeb'
                                : app.status === 'rejected'
                                ? '#fee2e2'
                                : '#eff6ff',
                            color:
                              app.status === 'selected'
                                ? '#15803d'
                                : app.status === 'shortlisted'
                                ? '#b45309'
                                : app.status === 'rejected'
                                ? '#b91c1c'
                                : '#1d4ed8',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            textTransform: 'uppercase'
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEvaluation(app)}
                            style={{
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              color: '#ea580c',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <FaStar /> Scorecard
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInterviewApp(app);
                              setInterviewForm({
                                ...interviewForm,
                                round_name: `Technical Evaluation (${app.job_title})`
                              });
                            }}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#2563eb',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <FaCalendarPlus /> Interview
                          </button>
                          {app.status !== 'selected' && (
                            <button
                              type="button"
                              onClick={() => {
                                setOfferApp(app);
                                setOfferForm({
                                  offered_ctc: app.ctc || '18 LPA',
                                  joining_date: '',
                                  offer_letter_url: ''
                                });
                              }}
                              style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#16a34a',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <FaAward /> Offer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OUR POSTED DRIVES */}
      {activeTab === 'drives' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {drives.map((d) => (
            <div
              key={d.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.3rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>{d.title}</h3>
                  <span style={{ background: d.status === 'open' ? '#dcfce7' : '#fee2e2', color: d.status === 'open' ? '#166534' : '#991b1b', fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                    {d.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {d.stream} • {d.job_type}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  <strong>Package:</strong> {d.ctc || 'Negotiable'} | <strong>Location:</strong> {d.location || 'Multiple'}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.8rem 0', lineClamp: 2 }}>
                  {d.description ? d.description.slice(0, 110) + '...' : 'No description'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Deadline: {d.deadline ? new Date(d.deadline).toLocaleDateString() : 'Rolling'}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563eb' }}>
                  {applications.filter((a) => a.job_id === d.id).length} Applicants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. CANDIDATE EVALUATION SCORECARD MODAL              */}
      {/* ==================================================== */}
      {evaluatingApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setEvaluatingApp(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaStar style={{ color: '#f59e0b' }} /> Recruiter Candidate Scorecard
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Evaluating <strong>{evaluatingApp.student_name}</strong> for {evaluatingApp.job_title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingApp(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation}>
              {/* Technical Score Slider */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  <span>Technical Competence & Coding</span>
                  <span style={{ color: '#ea580c' }}>{evalForm.technical_score} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={evalForm.technical_score}
                  onChange={(e) => setEvalForm({ ...evalForm, technical_score: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
              </div>

              {/* Communication Score Slider */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  <span>Communication & Articulation</span>
                  <span style={{ color: '#2563eb' }}>{evalForm.communication_score} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={evalForm.communication_score}
                  onChange={(e) => setEvalForm({ ...evalForm, communication_score: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>

              {/* Problem Solving Slider */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  <span>Problem Solving & Analytical Fit</span>
                  <span style={{ color: '#16a34a' }}>{evalForm.problem_solving_score} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={evalForm.problem_solving_score}
                  onChange={(e) => setEvalForm({ ...evalForm, problem_solving_score: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#16a34a' }}
                />
              </div>

              {/* Overall Recommendation */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Overall Hiring Recommendation
                </label>
                <select
                  value={evalForm.recommendation}
                  onChange={(e) => setEvalForm({ ...evalForm, recommendation: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="hire">Hire — Strongly Recommended for Final Offer</option>
                  <option value="hold">Hold — Good Candidate, Keep on Reserve List</option>
                  <option value="reject">Reject — Skill Gap / Not Recommended for Role</option>
                </select>
              </div>

              {/* Feedback Notes */}
              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Interview Notes & Detailed Feedback
                </label>
                <textarea
                  rows="3"
                  value={evalForm.feedback_notes}
                  onChange={(e) => setEvalForm({ ...evalForm, feedback_notes: e.target.value })}
                  placeholder="e.g. Strong foundational concepts in databases and data structures. Good culture fit."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setEvaluatingApp(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.55rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Saving...' : 'Save Candidate Scorecard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. POST DRIVE MODAL                                  */}
      {/* ==================================================== */}
      {showPostModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowPostModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              padding: '1.8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                  Post Campus Hiring Drive for {companyName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Will be immediately published and broadcast to students
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handlePostDrive}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Job Role / Title *
                </label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Associate Software Engineer"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Eligible Stream
                  </label>
                  <select
                    value={postForm.stream}
                    onChange={(e) => setPostForm({ ...postForm, stream: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Civil">Civil</option>
                    <option value="Business & Management">Business & Management</option>
                    <option value="Finance & Banking">Finance & Banking</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Job Type
                  </label>
                  <select
                    value={postForm.job_type}
                    onChange={(e) => setPostForm({ ...postForm, job_type: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Intern + Full Time">Intern + Full Time</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Package (CTC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.ctc}
                    onChange={(e) => setPostForm({ ...postForm, ctc: e.target.value })}
                    placeholder="e.g. 18 LPA"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={postForm.deadline}
                    onChange={(e) => setPostForm({ ...postForm, deadline: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Location / Work Mode
                </label>
                <input
                  type="text"
                  value={postForm.location}
                  onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                  placeholder="e.g. Bangalore / Hybrid"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Eligibility Criteria & Skills
                </label>
                <input
                  type="text"
                  value={postForm.eligibility}
                  onChange={(e) => setPostForm({ ...postForm, eligibility: e.target.value })}
                  placeholder="e.g. CGPA >= 7.0, React, Node.js, SQL"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Role Description
                </label>
                <textarea
                  rows="3"
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="Brief summary of duties and candidate profile..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.55rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.6rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Publishing...' : 'Publish Campus Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. SCHEDULE INTERVIEW MODAL                          */}
      {/* ==================================================== */}
      {interviewApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setInterviewApp(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                  Schedule Interview Round
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Candidate: <strong>{interviewApp.student_name}</strong> ({interviewApp.student_email})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInterviewApp(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Round Title *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.round_name}
                  onChange={(e) => setInterviewForm({ ...interviewForm, round_name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewForm.scheduled_date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_date: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={interviewForm.duration_minutes}
                    onChange={(e) => setInterviewForm({ ...interviewForm, duration_minutes: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Meeting Link / Venue *
                </label>
                <input
                  type="text"
                  required
                  value={interviewForm.location_or_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, location_or_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Instructions for Candidate
                </label>
                <textarea
                  rows="2"
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  placeholder="Please join with a working webcam, audio, and your GitHub profile ready."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setInterviewApp(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.55rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '0.55rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  {submitting ? 'Scheduling...' : 'Schedule & Send Calendar Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. RELEASE OFFER MODAL                               */}
      {/* ==================================================== */}
      {offerApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setOfferApp(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '1.8rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaAward /> Release Formal Offer Letter
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  For <strong>{offerApp.student_name}</strong> ({offerApp.job_title})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOfferApp(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Final Offered CTC / Package *
                </label>
                <input
                  type="text"
                  required
                  value={offerForm.offered_ctc}
                  onChange={(e) => setOfferForm({ ...offerForm, offered_ctc: e.target.value })}
                  placeholder="e.g. 24 LPA"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Expected Joining Date *
                </label>
                <input
                  type="date"
                  required
                  value={offerForm.joining_date}
                  onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '1.4rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Formal Offer Letter Cloud URL or PDF Link
                </label>
                <input
                  type="url"
                  value={offerForm.offer_letter_url}
                  onChange={(e) => setOfferForm({ ...offerForm, offer_letter_url: e.target.value })}
                  placeholder="https://drive.google.com/... or cloud link"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => setOfferApp(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.55rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '0.55rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
                >
                  {submitting ? 'Releasing...' : 'Confirm & Extend Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
