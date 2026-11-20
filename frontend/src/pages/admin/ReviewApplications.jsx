// src/pages/admin/ReviewApplications.jsx — View all applications + change status with resume preview
import { useState, useEffect } from 'react';
import { getAllApplications, updateApplicationStatus } from '../../services/api';
import toast from 'react-hot-toast';
import { FaClipboardList, FaFilePdf, FaExternalLinkAlt, FaBuilding, FaGraduationCap } from 'react-icons/fa';

const statusColors = {
  applied: '#3b82f6',
  shortlisted: '#f59e0b',
  selected: '#10b981',
  rejected: '#ef4444',
};

export default function ReviewApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = () => {
    getAllApplications()
      .then(({ data }) => setApplications(data.applications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const getResumeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchApps();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className="page" style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.8rem', color: '#0f172a' }}>
          <FaClipboardList style={{ color: '#ea580c' }} /> Review Applications ({applications.length})
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
          Review student applications, verify submitted résumés, and update shortlist/selection decisions
        </p>
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No applications received yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            When students apply for active placement drives, their details and résumés will appear here.
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>#</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Candidate</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Academic Stats</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Drive & Role</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Student Résumé</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{app.student_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.student_email}</div>
                    {app.student_phone && (
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                        📞 {app.student_phone}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600 }}>
                      {app.student_branch || 'Not specified'}
                    </div>
                    {app.student_cgpa ? (
                      <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 700, marginTop: '0.15rem' }}>
                        CGPA: {app.student_cgpa}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>CGPA: —</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem' }}>{app.job_title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                      <FaBuilding style={{ fontSize: '0.75rem' }} /> {app.company}
                    </div>
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
                          border: '1.5px solid #fed7aa',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 2px 5px rgba(234, 88, 12, 0.08)'
                        }}
                      >
                        <FaFilePdf style={{ fontSize: '0.9rem' }} /> View Résumé <FaExternalLinkAlt style={{ fontSize: '0.65rem' }} />
                      </a>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, background: '#fee2e2', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                        No Résumé
                      </span>
                    )}
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
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
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
