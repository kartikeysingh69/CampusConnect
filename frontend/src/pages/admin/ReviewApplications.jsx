// src/pages/admin/ReviewApplications.jsx — View all applications + change status
import { useState, useEffect } from 'react';
import { getAllApplications, updateApplicationStatus } from '../../services/api';
import toast from 'react-hot-toast';
import { FaClipboardList } from 'react-icons/fa';

const statusColors = {
  applied: '#3498db',
  shortlisted: '#f39c12',
  selected: '#27ae60',
  rejected: '#e74c3c',
};

export default function ReviewApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = () => {
    getAllApplications()
      .then(({ data }) => setApplications(data.applications))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchApps();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1><FaClipboardList /> Review Applications ({applications.length})</h1>
      {applications.length === 0 ? (
        <p className="empty">No applications received yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id}>
                  <td>{i + 1}</td>
                  <td>{app.student_name}</td>
                  <td>{app.student_email}</td>
                  <td>{app.job_title}</td>
                  <td>{app.company}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: statusColors[app.status] }}
                    >
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="status-select"
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
