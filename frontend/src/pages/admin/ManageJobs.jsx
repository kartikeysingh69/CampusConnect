// src/pages/admin/ManageJobs.jsx — Complete Drive Creation, Editing & Stream/Type Management
import { useState, useEffect, useMemo } from 'react';
import { getAllAdminJobs, createJob, updateJob, toggleJobStatus, deleteJob } from '../../services/api';
import CompanyLogo from '../../components/CompanyLogo';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FaBriefcase,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaBuilding,
  FaCheckCircle,
  FaBan,
  FaUndo
} from 'react-icons/fa';

export const STREAMS = [
  'Computer Science',
  'Mechanical',
  'Electrical',
  'Electronics & Comm',
  'Civil',
  'Business & Management',
  'Finance & Banking',
  'Customer Support & BPO',
  'Marketing & Sales',
  'Human Resources'
];

export const JOB_TYPES = [
  'Full Time',
  'Internship',
  'Part Time',
  'Full Time + Internship'
];

const initialForm = {
  title: '',
  company: '',
  description: '',
  location: '',
  ctc: '',
  eligibility: '',
  deadline: '',
  stream: 'Computer Science',
  job_type: 'Full Time',
  status: 'open'
};

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [streamFilter, setStreamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // all, open, closed
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchJobs = () => {
    setLoading(true);
    getAllAdminJobs()
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => toast.error('Failed to load placement drives'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filtered jobs calculation
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.location && job.location.toLowerCase().includes(q));

      const matchesStream =
        streamFilter === 'All' ||
        (job.stream && job.stream.toLowerCase() === streamFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || job.status === statusFilter;

      const matchesType =
        typeFilter === 'All' ||
        (job.job_type && job.job_type.toLowerCase() === typeFilter.toLowerCase());

      return matchesSearch && matchesStream && matchesStatus && matchesType;
    });
  }, [jobs, searchTerm, streamFilter, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((j) => j.status === 'open').length;
    const closed = total - open;
    const streamsSet = new Set(jobs.map((j) => j.stream).filter(Boolean));
    return { total, open, closed, streamCount: streamsSet.size };
  }, [jobs]);

  // Open modal for Creating
  const handleOpenCreate = () => {
    setEditingJobId(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (job) => {
    setEditingJobId(job.id);
    let deadlineStr = '';
    if (job.deadline) {
      deadlineStr = job.deadline.split('T')[0];
    }
    setForm({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      location: job.location || '',
      ctc: job.ctc || '',
      eligibility: job.eligibility || '',
      deadline: deadlineStr,
      stream: job.stream || 'Computer Science',
      job_type: job.job_type || 'Full Time',
      status: job.status || 'open'
    });
    setModalOpen(true);
  };

  // Save (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) {
      toast.error('Job Title and Company are required!');
      return;
    }

    setSaving(true);
    try {
      if (editingJobId) {
        await updateJob(editingJobId, form);
        toast.success('Placement drive updated successfully! ✨');
      } else {
        await createJob(form);
        toast.success('New placement drive launched successfully! 🚀');
      }
      setModalOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save drive');
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Status (Open / Closed)
  const handleToggleStatus = async (job) => {
    try {
      const { data } = await toggleJobStatus(job.id);
      toast.success(data.message || `Status changed to ${data.status}`);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: data.status } : j))
      );
    } catch (err) {
      toast.error('Failed to change status');
    }
  };

  // Delete Job
  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title} at ${job.company}"?\n\nThis will also remove all candidate applications submitted for this drive!`
    );
    if (!confirmed) return;

    try {
      await deleteJob(job.id);
      toast.success('Drive deleted successfully');
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (err) {
      toast.error('Failed to delete job drive');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '1350px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
            <FaBriefcase style={{ color: '#ea580c' }} /> Manage Placement Drives
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
            Create, categorize, edit and manage campus recruitment drives across engineering & management streams
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.7rem 1.5rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)'
          }}
        >
          <FaPlus /> New Placement Drive
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.6rem' }}>
        {[
          { label: 'Total Drives', value: stats.total, color: '#0f172a', bg: '#ffffff', border: '#e2e8f0' },
          { label: 'Active (Open)', value: stats.open, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Closed Drives', value: stats.closed, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
          { label: 'Streams Represented', value: stats.streamCount, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: item.bg,
              border: `1px solid ${item.border}`,
              borderRadius: '12px',
              padding: '1.1rem 1.3rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: item.color, marginTop: '0.2rem' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search drive, company, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Stream Filter */}
        <div style={{ minWidth: '180px' }}>
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#0f172a',
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Academic Streams</option>
            {STREAMS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Job Type Filter */}
        <div style={{ minWidth: '150px' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#0f172a',
              background: '#ffffff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Job Types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
          {['all', 'open', 'closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? '#ffffff' : 'transparent',
                color: statusFilter === st ? '#ea580c' : '#64748b',
                fontWeight: 700,
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Reset Filter Button */}
        {(searchTerm || streamFilter !== 'All' || statusFilter !== 'all' || typeFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStreamFilter('All');
              setStatusFilter('all');
              setTypeFilter('All');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ea580c',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <FaUndo style={{ fontSize: '0.75rem' }} /> Clear
          </button>
        )}
      </div>

      {/* Main Drives Table */}
      {loading ? (
        <div className="loading">Loading placement drives...</div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No matching placement drives found</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.2rem' }}>
            Try adjusting your search keywords or filter criteria.
          </p>
          <button
            onClick={handleOpenCreate}
            style={{
              background: '#ea580c',
              color: '#ffffff',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Create New Drive
          </button>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Company & Drive Title</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Stream / Domain</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Type & Package</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Location</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Deadline</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Company & Title */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <CompanyLogo company={job.company} size={42} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.96rem' }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 600 }}>
                          {job.company}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Stream */}
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        background: '#fff7ed',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                        padding: '0.3rem 0.7rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-block'
                      }}
                    >
                      {job.stream || 'Computer Science'}
                    </span>
                  </td>

                  {/* Type & CTC */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                      {job.ctc || 'Negotiable'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, marginTop: '0.15rem' }}>
                      {job.job_type || 'Full Time'}
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaMapMarkerAlt style={{ color: '#94a3b8', fontSize: '0.78rem' }} />
                      {job.location || 'Multiple'}
                    </div>
                  </td>

                  {/* Deadline */}
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    {job.deadline ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FaCalendarAlt style={{ color: '#94a3b8', fontSize: '0.75rem' }} />
                        {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    ) : (
                      'No deadline'
                    )}
                  </td>

                  {/* Status & Quick Toggle */}
                  <td style={{ padding: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job)}
                      title="Click to toggle status"
                      style={{
                        background: job.status === 'open' ? '#dcfce7' : '#f1f5f9',
                        color: job.status === 'open' ? '#15803d' : '#64748b',
                        border: `1px solid ${job.status === 'open' ? '#86efac' : '#cbd5e1'}`,
                        padding: '0.28rem 0.65rem',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {job.status === 'open' ? <FaCheckCircle style={{ fontSize: '0.7rem' }} /> : <FaBan style={{ fontSize: '0.7rem' }} />}
                      {job.status}
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                      {/* View live */}
                      <Link
                        to={`/jobs/${job.id}`}
                        target="_blank"
                        title="View Live Job Page"
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          textDecoration: 'none'
                        }}
                      >
                        <FaExternalLinkAlt />
                      </Link>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(job)}
                        title="Edit Placement Drive"
                        style={{
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          color: '#ea580c',
                          padding: '0.4rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <FaEdit /> Edit
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(job)}
                        title="Delete Placement Drive"
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* CREATE / EDIT DRIVE MODAL                            */}
      {/* ==================================================== */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              width: 'min(750px, 95vw)',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.6rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaBriefcase style={{ color: '#ea580c', fontSize: '1.2rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                  {editingJobId ? 'Edit Placement Drive' : 'Launch New Placement Drive'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                {/* Job Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Job / Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Software Development Engineer"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Hiring Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. Google, Microsoft, Infosys"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Stream & Job Type Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                {/* Academic Stream */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Academic Stream / Branch *
                  </label>
                  <select
                    value={form.stream}
                    onChange={(e) => setForm({ ...form, stream: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #fed7aa',
                      background: '#fffdfa',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  >
                    {STREAMS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Job Employment Type *
                  </label>
                  <select
                    value={form.job_type}
                    onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #fed7aa',
                      background: '#fffdfa',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  >
                    {JOB_TYPES.map((jt) => (
                      <option key={jt} value={jt}>{jt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Package (CTC) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Bangalore, Hyderabad, Remote"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    CTC / Stipend Package
                  </label>
                  <input
                    type="text"
                    value={form.ctc}
                    onChange={(e) => setForm({ ...form, ctc: e.target.value })}
                    placeholder="e.g. 24 LPA or 50,000/month"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Eligibility & Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. B.Tech / BE, CGPA >= 7.0, No Active Backlogs"
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Status (when editing or creating) */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Drive Acceptance Status
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="driveStatus"
                      checked={form.status === 'open'}
                      onChange={() => setForm({ ...form, status: 'open' })}
                    />
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>Open (Accepting Applications)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="driveStatus"
                      checked={form.status === 'closed'}
                      onChange={() => setForm({ ...form, status: 'closed' })}
                    />
                    <span style={{ color: '#64748b', fontWeight: 700 }}>Closed</span>
                  </label>
                </div>
              </div>

              {/* Detailed Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Job Description & Candidate Responsibilities
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline key job roles, technical expectations, recruitment process..."
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.8rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)'
                  }}
                >
                  {saving ? 'Saving...' : editingJobId ? 'Update Placement Drive' : 'Launch Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}