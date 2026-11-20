// src/pages/admin/ManageJobs.jsx — Create, view and close jobs
import { useState, useEffect } from 'react';
import { getJobs, createJob, closeJob } from '../../services/api';
import toast from 'react-hot-toast';
import { FaBriefcase, FaPlus, FaTimes } from 'react-icons/fa';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', company: '', description: '', location: '', ctc: '', eligibility: '', deadline: '',
  });

  const fetchJobs = () => {
    getJobs()
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createJob(form);
      toast.success('Job created!');
      setShowForm(false);
      setForm({ title: '', company: '', description: '', location: '', ctc: '', eligibility: '', deadline: '' });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this job drive?')) return;
    try {
      await closeJob(id);
      toast.success('Job closed');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to close job');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1><FaBriefcase /> Manage Jobs</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <FaPlus /> {showForm ? 'Cancel' : 'New Job'}
        </button>
      </div>

      {showForm && (
        <div className="auth-card" style={{ maxWidth: 600, marginBottom: '2rem' }}>
          <h3>Create New Placement Drive</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Software Engineer" required />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Google" required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description..." rows={3} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" />
              </div>
              <div className="form-group">
                <label>CTC</label>
                <input type="text" value={form.ctc} onChange={(e) => setForm({ ...form, ctc: e.target.value })} placeholder="e.g. 24 LPA" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Eligibility</label>
                <input type="text" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. CGPA >= 7.5" />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Job</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>CTC</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.company}</td>
                <td>{job.location}</td>
                <td>{job.ctc}</td>
                <td><span className={`status-badge status-${job.status}`}>{job.status.toUpperCase()}</span></td>
                <td>
                  {job.status === 'open' && (
                    <button onClick={() => handleClose(job.id)} className="btn-danger-small">
                      <FaTimes /> Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
