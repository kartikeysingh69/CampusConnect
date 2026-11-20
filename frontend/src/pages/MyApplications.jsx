// src/pages/MyApplications.jsx — Real-time Application Tracking, Visual Timeline, Interviews & Offer Letters
import { useState, useEffect, useMemo } from 'react';
import { getMyApplications, withdrawApplication, getMyInterviews } from '../services/api';
import CompanyLogo from '../components/CompanyLogo';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FaClipboardList,
  FaFilePdf,
  FaExternalLinkAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
  FaSearch,
  FaThLarge,
  FaList,
  FaMoneyBillWave,
  FaTrashAlt,
  FaInfoCircle,
  FaArrowRight,
  FaCalendarCheck,
  FaAward,
  FaVideo,
  FaDownload
} from 'react-icons/fa';

const statusConfig = {
  applied: {
    label: 'Applied / In Review',
    step: 1,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    desc: 'Application submitted successfully and waiting for recruiter screening.'
  },
  shortlisted: {
    label: 'Shortlisted for Next Round',
    step: 2,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    desc: 'Congratulations! Your profile has been shortlisted for technical rounds / interviews.'
  },
  selected: {
    label: 'Selected & Offer Extended',
    step: 3,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    desc: 'You have been selected! Formal offer instructions will be shared by the placement cell.'
  },
  rejected: {
    label: 'Not Selected',
    step: -1,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    desc: 'Application not moving forward for this opening. Keep applying to other drives!'
  }
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'table'
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = () => {
    setLoading(true);
    Promise.all([
      getMyApplications(),
      getMyInterviews()
    ])
      .then(([appsRes, ivRes]) => {
        setApplications(appsRes.data.applications || []);
        setInterviews(ivRes.data.interviews || []);
      })
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getResumeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.title.toLowerCase().includes(q) ||
        app.company.toLowerCase().includes(q) ||
        (app.location && app.location.toLowerCase().includes(q));

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && (app.status === 'applied' || app.status === 'shortlisted')) ||
        app.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((a) => a.status === 'applied' || a.status === 'shortlisted').length;
    const selected = applications.filter((a) => a.status === 'selected').length;
    const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
    return { total, active, selected, shortlisted };
  }, [applications]);

  // Withdraw Handler
  const handleWithdraw = async (app) => {
    const confirmed = window.confirm(
      `Are you sure you want to withdraw your application for "${app.title}" at ${app.company}?\n\nIf the drive is still open, you can re-apply later.`
    );
    if (!confirmed) return;

    setWithdrawingId(app.id);
    try {
      await withdrawApplication(app.id);
      toast.success('Application withdrawn successfully');
      setApplications((prev) => prev.filter((item) => item.id !== app.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) return <div className="loading">Loading your applications...</div>;

  return (
    <div className="page" style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
            <FaClipboardList style={{ color: '#ea580c' }} /> My Placement Applications
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
            Real-time status tracker, stage updates, and management for campus recruitment drives
          </p>
        </div>
        <Link
          to="/jobs"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#ffffff',
            padding: '0.65rem 1.3rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
          }}
        >
          Explore More Drives <FaArrowRight style={{ fontSize: '0.8rem' }} />
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.6rem' }}>
        {[
          { label: 'Total Submitted', count: stats.total, color: '#0f172a', bg: '#ffffff', border: '#e2e8f0' },
          { label: 'Active in Pipeline', count: stats.active, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Shortlisted Rounds', count: stats.shortlisted, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { label: 'Selected / Placed', count: stats.selected, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
        ].map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: kpi.bg,
              border: `1px solid ${kpi.border}`,
              borderRadius: '12px',
              padding: '1.1rem 1.3rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color, marginTop: '0.2rem' }}>
              {kpi.count}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Interview Rounds & Hall Tickets */}
      {interviews.length > 0 && (
        <div style={{ marginBottom: '1.8rem', background: '#ffffff', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '1.3rem', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                <FaCalendarCheck />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                  Upcoming Interview Rounds ({interviews.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Recruiters have scheduled your assessment rounds. Be ready on time!
                </span>
              </div>
            </div>
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              Confirmed Schedule
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {interviews.map((iv) => (
              <div
                key={iv.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.8rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>
                      {iv.round_name}
                    </div>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                      {iv.mode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#ea580c', fontWeight: 700, marginBottom: '0.4rem' }}>
                    {iv.company} • {iv.job_title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaCalendarAlt style={{ color: '#94a3b8', fontSize: '0.78rem' }} />
                    {new Date(iv.scheduled_date).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} ({iv.duration_minutes} Mins)
                  </div>
                  {iv.notes && (
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.4rem', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      Instructions: {iv.notes}
                    </div>
                  )}
                </div>

                <a
                  href={iv.location_or_link.startsWith('http') ? iv.location_or_link : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <FaVideo /> Join Assessment / Venue Details
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.1rem',
          marginBottom: '1.6rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', flex: '1 1 300px' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <FaSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search company, job role, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.3rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active Pipeline' },
              { id: 'shortlisted', label: 'Shortlisted' },
              { id: 'selected', label: 'Selected' },
              { id: 'rejected', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  background: filterStatus === tab.id ? '#ffffff' : 'transparent',
                  color: filterStatus === tab.id ? '#ea580c' : '#64748b',
                  fontWeight: 700,
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: filterStatus === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            title="Timeline Cards View"
            style={{
              background: viewMode === 'timeline' ? '#ffffff' : 'transparent',
              color: viewMode === 'timeline' ? '#ea580c' : '#64748b',
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: viewMode === 'timeline' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <FaThLarge /> Cards & Tracker
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Compact Table View"
            style={{
              background: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? '#ea580c' : '#64748b',
              border: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <FaList /> Table
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredApps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>📑</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No applications found</h3>
          <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            {searchTerm || filterStatus !== 'all'
              ? 'No applications match your current filters. Try resetting the search or status tab.'
              : 'You have not submitted applications to any campus placement drives yet. Start exploring active drives now!'}
          </p>
          <Link
            to="/jobs"
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '0.65rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-block'
            }}
          >
            Browse Open Drives
          </Link>
        </div>
      ) : viewMode === 'timeline' ? (
        /* ==================================================== */
        /* 1. TIMELINE CARDS VIEW                               */
        /* ==================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {filteredApps.map((app) => {
            const conf = statusConfig[app.status] || statusConfig.applied;
            const isRejected = app.status === 'rejected';
            const isSelected = app.status === 'selected';
            const isShortlisted = app.status === 'shortlisted' || isSelected;

            return (
              <div
                key={app.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.4rem',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Top Row: Company, Role & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <CompanyLogo company={app.company} size={48} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
                          {app.title}
                        </h3>
                        {app.job_type && (
                          <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.74rem', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 700 }}>
                            {app.job_type}
                          </span>
                        )}
                        {app.stream && (
                          <span style={{ background: '#fff7ed', color: '#c2410c', fontSize: '0.74rem', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 700 }}>
                            {app.stream}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#ea580c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <FaBuilding style={{ fontSize: '0.78rem' }} /> {app.company}
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FaMapMarkerAlt style={{ fontSize: '0.75rem' }} /> {app.location || 'Multiple Locations'}
                        </span>
                        {app.ctc && (
                          <>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <span style={{ color: '#0f172a', fontWeight: 700 }}>{app.ctc}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: conf.bg,
                        color: conf.color,
                        border: `1.5px solid ${conf.border}`,
                        padding: '0.4rem 0.9rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {isSelected ? <FaCheckCircle /> : isRejected ? <FaTimesCircle /> : <FaClock />}
                      {conf.label}
                    </span>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                      Applied: {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>

                {/* Real-time Tracking Stepper */}
                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.1rem 1.4rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.8rem' }}>
                    Application Progress Tracker:
                  </div>

                  {isRejected ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.86rem' }}>
                      <FaTimesCircle style={{ fontSize: '1.2rem' }} />
                      <div>
                        <strong>Application Status Closed:</strong> {conf.desc}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '0.8rem' }}>
                      {/* Step 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 180px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                          ✓
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Application Submitted</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Received by Portal</div>
                        </div>
                      </div>

                      {/* Line 1 */}
                      <div style={{ flex: '1 1 40px', height: '2px', background: isShortlisted ? '#16a34a' : '#cbd5e1' }} />

                      {/* Step 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 180px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isShortlisted ? '#16a34a' : '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                          {isShortlisted ? '✓' : '2'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Screening & Shortlist</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{isShortlisted ? 'Profile Shortlisted' : 'Under Assessment'}</div>
                        </div>
                      </div>

                      {/* Line 2 */}
                      <div style={{ flex: '1 1 40px', height: '2px', background: isSelected ? '#16a34a' : '#cbd5e1' }} />

                      {/* Step 3 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 180px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isSelected ? '#16a34a' : '#e2e8f0', color: isSelected ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                          {isSelected ? '✓' : '3'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? '#16a34a' : '#64748b' }}>Final Selection</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{isSelected ? 'Offer Received! 🎉' : 'Pending Interview Round'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Celebratory Formal Offer Letter Released Banner */}
                {isSelected && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                      border: '1.5px solid #86efac',
                      borderRadius: '12px',
                      padding: '1.1rem 1.3rem',
                      marginBottom: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.35rem',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                        }}
                      >
                        <FaAward />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#14532d', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          🎉 Official Placement Offer Released!
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#166534', marginTop: '0.2rem' }}>
                          {app.offered_ctc && (
                            <span>
                              <strong>Offered CTC:</strong> {app.offered_ctc} •{' '}
                            </span>
                          )}
                          {app.joining_date && (
                            <span>
                              <strong>Tentative Joining Date:</strong>{' '}
                              {new Date(app.joining_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}{' '}
                              •{' '}
                            </span>
                          )}
                          <span>Placement department congratulations on your campus selection!</span>
                        </div>
                      </div>
                    </div>

                    {app.offer_letter_url ? (
                      <a
                        href={
                          app.offer_letter_url.startsWith('http')
                            ? app.offer_letter_url
                            : `http://localhost:5000${app.offer_letter_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                          color: '#ffffff',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                        }}
                      >
                        <FaDownload /> Download Formal Offer Letter
                      </a>
                    ) : (
                      <span
                        style={{
                          background: '#dcfce7',
                          color: '#166534',
                          border: '1px solid #bbf7d0',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        ✓ Hardcopy Dispatch In Progress
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', paddingTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    {/* View Job Description */}
                    <Link
                      to={`/jobs/${app.job_id}`}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} /> View Drive Details
                    </Link>

                    {/* View Submitted Resume */}
                    {app.student_resume && (
                      <a
                        href={getResumeUrl(app.student_resume)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          color: '#ea580c',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <FaFilePdf /> Attached Résumé
                      </a>
                    )}
                  </div>

                  {/* Withdraw Button */}
                  {app.status !== 'selected' && (
                    <button
                      type="button"
                      disabled={withdrawingId === app.id}
                      onClick={() => handleWithdraw(app)}
                      style={{
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#e11d48',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <FaTrashAlt style={{ fontSize: '0.75rem' }} />
                      {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================================================== */
        /* 2. COMPACT TABLE VIEW                                */
        /* ==================================================== */
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>#</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Job & Company</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Stream / Type</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Location & Package</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Decision Status</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Submitted Résumé</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app, i) => {
                const conf = statusConfig[app.status] || statusConfig.applied;
                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CompanyLogo company={app.company} size={36} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{app.title}</div>
                          <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 600 }}>{app.company}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600 }}>{app.stream || 'Computer Science'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600 }}>{app.job_type || 'Full Time'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>{app.ctc || 'Negotiable'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.location || 'Multiple'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          backgroundColor: conf.bg,
                          color: conf.color,
                          border: `1px solid ${conf.border}`,
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          display: 'inline-block'
                        }}
                      >
                        {conf.label}
                      </span>
                      {app.offer_letter_url && (
                        <div style={{ marginTop: '0.4rem' }}>
                          <a
                            href={
                              app.offer_letter_url.startsWith('http')
                                ? app.offer_letter_url
                                : `http://localhost:5000${app.offer_letter_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <FaDownload /> Offer Letter
                          </a>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {app.student_resume ? (
                        <a
                          href={getResumeUrl(app.student_resume)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#fff7ed',
                            color: '#ea580c',
                            border: '1px solid #fed7aa',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <FaFilePdf /> View CV
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                          to={`/jobs/${app.job_id}`}
                          title="View Job"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            textDecoration: 'none'
                          }}
                        >
                          <FaExternalLinkAlt />
                        </Link>
                        {app.status !== 'selected' && (
                          <button
                            type="button"
                            onClick={() => handleWithdraw(app)}
                            title="Withdraw"
                            style={{
                              background: '#fff1f2',
                              border: '1px solid #fecdd3',
                              color: '#e11d48',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}