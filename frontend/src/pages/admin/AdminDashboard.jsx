// src/pages/admin/AdminDashboard.jsx — Placement statistics
import { useState, useEffect } from 'react';
import { getStats } from '../../services/api';
import { FaChartBar, FaUsers, FaBriefcase, FaClipboardCheck, FaTrophy } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading stats...</div>;
  if (!stats) return <div className="page"><p>Failed to load stats</p></div>;

  return (
    <div className="page">
      <h1><FaChartBar /> Placement Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
          <FaUsers className="stat-icon" />
          <div>
            <h3>{stats.totalStudents}</h3>
            <p>Registered Students</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#2ecc71' }}>
          <FaBriefcase className="stat-icon" />
          <div>
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs ({stats.openJobs} open)</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f39c12' }}>
          <FaClipboardCheck className="stat-icon" />
          <div>
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
          <FaTrophy className="stat-icon" />
          <div>
            <h3>{stats.selected}</h3>
            <p>Students Selected</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Company-wise Stats</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Applications</th>
              <th>Selected</th>
            </tr>
          </thead>
          <tbody>
            {stats.companyStats.map((c, i) => (
              <tr key={i}>
                <td>{c.company}</td>
                <td>{c.applications}</td>
                <td>{c.selected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
