// src/pages/MyApplications.jsx — Track applied jobs
import { useState, useEffect } from 'react';
import { getMyApplications } from '../services/api';
import { FaClipboardList } from 'react-icons/fa';

const statusColors = {
  applied: '#3498db',
  shortlisted: '#f39c12',
  selected: '#27ae60',
  rejected: '#e74c3c',
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(({ data }) => setApplications(data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1><FaClipboardList /> My Applications</h1>
      {applications.length === 0 ? (
        <p className="empty">You haven't applied to any jobs yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>CTC</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id}>
                  <td>{i + 1}</td>
                  <td>{app.title}</td>
                  <td>{app.company}</td>
                  <td>{app.location}</td>
                  <td>{app.ctc}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[app.status] }}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
