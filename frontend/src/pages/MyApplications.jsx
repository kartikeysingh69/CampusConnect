// src/pages/MyApplications.jsx — Track applied jobs with resume preview
import { useState, useEffect } from 'react';
import { getMyApplications } from '../services/api';
import { FaClipboardList, FaFilePdf, FaExternalLinkAlt, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const statusColors = {
  applied: '#3b82f6',
  shortlisted: '#f59e0b',
  selected: '#10b981',
  rejected: '#ef4444',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(({ data }) => setApplications(data.applications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getResumeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  if (loading) return <div className="loading">Loading your applications...</div>;

  return (
    <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>
            <FaClipboardList style={{ color: '#ea580c' }} /> My Applications
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
            Track the status of campus placement drives you have applied to
          </p>
        </div>
        <Link
          to="/jobs"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#ffffff',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
          }}
        >
          Explore More Drives →
        </Link>
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📑</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>You haven't applied to any drives yet</h3>
          <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            Explore available campus placement opportunities and start applying with your student profile.
          </p>
          <Link
            to="/jobs"
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-block'
            }}
          >
            Browse Job Openings
          </Link>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>#</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Job & Company</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Location</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Package (CTC)</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Submitted Résumé</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{app.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                      <FaBuilding style={{ fontSize: '0.75rem' }} /> {app.company}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaMapMarkerAlt style={{ color: '#94a3b8', fontSize: '0.8rem' }} />
                      {app.location || 'Multiple'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>
                    {app.ctc || 'As per norms'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        backgroundColor: `${statusColors[app.status] || '#64748b'}18`,
                        color: statusColors[app.status] || '#64748b',
                        border: `1px solid ${statusColors[app.status] || '#64748b'}40`,
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        display: 'inline-block'
                      }}
                    >
                      {app.status}
                    </span>
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
                        <FaFilePdf /> View CV <FaExternalLinkAlt style={{ fontSize: '0.65rem' }} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                        None attached
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
