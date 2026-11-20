// src/pages/admin/AdminDashboard.jsx — Placement Intelligence & KPI Analytics
import { useState, useEffect, useMemo } from 'react';
import { getStats } from '../../services/api';
import CompanyLogo from '../../components/CompanyLogo';
import { Link } from 'react-router-dom';
import {
  FaChartBar,
  FaUsers,
  FaBriefcase,
  FaClipboardCheck,
  FaTrophy,
  FaGraduationCap,
  FaBuilding,
  FaArrowRight,
  FaUserCheck,
  FaCheckCircle,
  FaPercentage,
  FaSearch
} from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companySearch, setCompanySearch] = useState('');

  useEffect(() => {
    getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!stats?.companyStats) return [];
    if (!companySearch.trim()) return stats.companyStats;
    return stats.companyStats.filter((c) =>
      c.company.toLowerCase().includes(companySearch.toLowerCase().trim())
    );
  }, [stats, companySearch]);

  const placementRate = useMemo(() => {
    if (!stats || !stats.totalApplications) return 0;
    return Math.round((stats.selected / stats.totalApplications) * 100);
  }, [stats]);

  if (loading) return <div className="loading">Loading placement analytics...</div>;
  if (!stats) return <div className="page"><p>Failed to load statistics.</p></div>;

  return (
    <div className="page" style={{ maxWidth: '1350px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
            <FaChartBar style={{ color: '#ea580c' }} /> Placement Analytics & Overview
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
            Comprehensive institutional placement statistics, recruiter engagement and candidate progress
          </p>
        </div>

        {/* Quick Nav Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/jobs"
            style={{
              background: '#ffffff',
              border: '1.5px solid #fed7aa',
              color: '#ea580c',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
            }}
          >
            <FaBriefcase /> Manage Drives
          </Link>
          <Link
            to="/admin/applications"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              padding: '0.6rem 1.3rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
            }}
          >
            <FaClipboardCheck /> Review Applications →
          </Link>
        </div>
      </div>

      {/* Top Level KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginBottom: '1.8rem' }}>
        {/* Total Students */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Registered Students</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <FaUsers />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Eligible on placement portal</div>
        </div>

        {/* Total Drives */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Recruitment Drives</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <FaBriefcase />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.totalJobs}</div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>
            ✓ {stats.openJobs} active & accepting applications
          </div>
        </div>

        {/* Applications Received */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Total Applications</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <FaClipboardCheck />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.totalApplications}</div>
          <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, marginTop: '0.2rem' }}>
            {stats.shortlisted} candidates shortlisted
          </div>
        </div>

        {/* Students Selected */}
        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '1.3rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#15803d' }}>Offers / Selected</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              <FaTrophy />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', marginTop: '0.5rem' }}>{stats.selected}</div>
          <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700, marginTop: '0.2rem' }}>
            🎉 Placed Candidates
          </div>
        </div>
      </div>

      {/* Stream Distribution Section */}
      {stats.streamStats && stats.streamStats.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FaGraduationCap style={{ color: '#ea580c' }} /> Academic Streams & Hiring Distribution
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {stats.streamStats.map((st, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.2rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                  {st.stream || 'General'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Drives</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ea580c' }}>{st.drivesCount}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Applied</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{st.applications}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', textTransform: 'uppercase', fontWeight: 700 }}>Selected</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>{st.selected}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Hiring Intelligence Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FaBuilding style={{ color: '#ea580c' }} /> Recruiter & Corporate Hiring Performance
          </h2>
          <div style={{ position: 'relative', width: '260px' }}>
            <FaSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search company..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.8rem 0.45rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>#</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Company Partner</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>Active Drives</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>Applications</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>Shortlisted</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>Selected</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CompanyLogo company={c.company} size={36} />
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{c.company}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#ea580c' }}>
                    {c.drivesCount || 1}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {c.applications}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#d97706' }}>
                    {c.shortlisted || 0}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        background: c.selected > 0 ? '#dcfce7' : '#f1f5f9',
                        color: c.selected > 0 ? '#15803d' : '#64748b',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.82rem'
                      }}
                    >
                      {c.selected} placed
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link
                      to={`/admin/applications`}
                      style={{
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        color: '#ea580c',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      View Candidates <FaArrowRight style={{ fontSize: '0.7rem' }} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}