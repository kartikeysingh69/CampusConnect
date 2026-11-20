// src/pages/admin/ReviewApplications.jsx — Candidate Filtering, Search, Bulk Actions & CSV Export
import { useState, useEffect, useMemo } from 'react';
import { getAllApplications, updateApplicationStatus, bulkUpdateApplicationStatus } from '../../services/api';
import CompanyLogo from '../../components/CompanyLogo';
import toast from 'react-hot-toast';
import {
  FaClipboardList,
  FaFilePdf,
  FaExternalLinkAlt,
  FaBuilding,
  FaGraduationCap,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaDownload,
  FaUndo,
  FaUserGraduate,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaIdCard
} from 'react-icons/fa';

const statusConfig = {
  applied: { label: 'Applied', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  shortlisted: { label: 'Shortlisted', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  selected: { label: 'Selected', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
};

export default function ReviewApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState('0');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Candidate Details Modal
  const [viewCandidate, setViewCandidate] = useState(null);

  const fetchApps = () => {
    setLoading(true);
    getAllApplications()
      .then(({ data }) => setApplications(data.applications || []))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const getResumeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  // Distinct Filter Options
  const companiesList = useMemo(() => {
    const list = Array.from(new Set(applications.map((a) => a.company).filter(Boolean)));
    return list.sort();
  }, [applications]);

  const jobsList = useMemo(() => {
    const list = Array.from(new Set(applications.map((a) => a.job_title).filter(Boolean)));
    return list.sort();
  }, [applications]);

  // Filtered Applications Calculation
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (app.student_name && app.student_name.toLowerCase().includes(q)) ||
        (app.student_email && app.student_email.toLowerCase().includes(q)) ||
        (app.student_phone && app.student_phone.includes(q)) ||
        (app.job_title && app.job_title.toLowerCase().includes(q)) ||
        (app.company && app.company.toLowerCase().includes(q)) ||
        (app.student_branch && app.student_branch.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || app.status === statusFilter;

      const matchesCompany =
        companyFilter === 'All' || app.company === companyFilter;

      const matchesJob =
        jobFilter === 'All' || app.job_title === jobFilter;

      const cgpaNum = parseFloat(app.student_cgpa) || 0;
      const minCgpaNum = parseFloat(minCgpaFilter) || 0;
      const matchesCgpa = minCgpaNum === 0 || cgpaNum >= minCgpaNum;

      return matchesSearch && matchesStatus && matchesCompany && matchesJob && matchesCgpa;
    });
  }, [applications, searchTerm, statusFilter, companyFilter, jobFilter, minCgpaFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'applied').length;
    const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
    const selected = applications.filter((a) => a.status === 'selected').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;
    return { total, applied, shortlisted, selected, rejected };
  }, [applications]);

  // Single Status Change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      toast.success(`Application updated to ${newStatus}!`);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Bulk Status Update
  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    try {
      await bulkUpdateApplicationStatus(selectedIds, status);
      toast.success(`${selectedIds.length} candidate(s) marked as ${status}! 🎉`);
      setApplications((prev) =>
        prev.map((app) =>
          selectedIds.includes(app.id) ? { ...app, status } : app
        )
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error('Bulk update failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Toggle Selection
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map((a) => a.id));
    }
  };

  // Export to CSV Function
  const exportToCSV = () => {
    if (filteredApps.length === 0) {
      toast.error('No candidate data to export');
      return;
    }

    const headers = [
      'Application ID',
      'Student Name',
      'Student Email',
      'Phone Number',
      'Branch / Stream',
      'CGPA',
      'College / Institute',
      'Job Title',
      'Company',
      'Location',
      'CTC Package',
      'Status',
      'Applied Date',
      'Resume URL'
    ];

    const rows = filteredApps.map((app) => [
      app.id,
      `"${(app.student_name || '').replace(/"/g, '""')}"`,
      `"${(app.student_email || '').replace(/"/g, '""')}"`,
      `"${app.student_phone || ''}"`,
      `"${(app.student_branch || '').replace(/"/g, '""')}"`,
      app.student_cgpa || '',
      `"${(app.student_college || '').replace(/"/g, '""')}"`,
      `"${(app.job_title || '').replace(/"/g, '""')}"`,
      `"${(app.company || '').replace(/"/g, '""')}"`,
      `"${(app.job_location || '').replace(/"/g, '""')}"`,
      `"${(app.job_ctc || '').replace(/"/g, '""')}"`,
      app.status,
      app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '',
      app.student_resume ? getResumeUrl(app.student_resume) : ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CampusConnect_Applications_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications CSV exported successfully! 📊');
  };

  return (
    <div className="page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
            <FaClipboardList style={{ color: '#ea580c' }} /> Review Student Applications
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.3rem 0 0 0' }}>
            Screen student profiles, evaluate résumés, filter candidates by CGPA/company, and manage shortlists
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: '#0f172a',
            padding: '0.65rem 1.3rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          <FaDownload style={{ color: '#ea580c' }} /> Export to CSV ({filteredApps.length})
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.6rem' }}>
        {[
          { label: 'Total Applications', count: stats.total, color: '#0f172a', bg: '#ffffff', border: '#e2e8f0' },
          { label: 'Pending Review', count: stats.applied, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Shortlisted', count: stats.shortlisted, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { label: 'Selected / Placed', count: stats.selected, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Rejected', count: stats.rejected, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
        ].map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: kpi.bg,
              border: `1px solid ${kpi.border}`,
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
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

      {/* Search & Multi-Filters Bar */}
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
        {/* Search Input */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search candidate, email, drive, branch..."
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

        {/* Company Dropdown */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
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
            <option value="All">All Companies ({companiesList.length})</option>
            {companiesList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Drive Title Dropdown */}
        <div style={{ minWidth: '160px' }}>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
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
            <option value="All">All Placement Roles ({jobsList.length})</option>
            {jobsList.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>

        {/* Minimum CGPA Filter */}
        <div style={{ minWidth: '140px' }}>
          <select
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(e.target.value)}
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
            <option value="0">All CGPAs</option>
            <option value="6.0">CGPA ≥ 6.0</option>
            <option value="7.0">CGPA ≥ 7.0</option>
            <option value="8.0">CGPA ≥ 8.0</option>
            <option value="9.0">CGPA ≥ 9.0</option>
          </select>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px', flexWrap: 'wrap' }}>
          {['all', 'applied', 'shortlisted', 'selected', 'rejected'].map((st) => {
            const count =
              st === 'all'
                ? applications.length
                : applications.filter((a) => a.status === st).length;
            return (
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
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {st}
                <span
                  style={{
                    background: statusFilter === st ? '#fff7ed' : '#e2e8f0',
                    color: statusFilter === st ? '#ea580c' : '#64748b',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clear Filters */}
        {(searchTerm || statusFilter !== 'all' || companyFilter !== 'All' || jobFilter !== 'All' || minCgpaFilter !== '0') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCompanyFilter('All');
              setJobFilter('All');
              setMinCgpaFilter('0');
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

      {/* Bulk Action Toolbar (Active when candidates are selected) */}
      {selectedIds.length > 0 && (
        <div
          style={{
            background: '#fff7ed',
            border: '1.5px solid #fed7aa',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.85rem',
            boxShadow: '0 3px 10px rgba(234, 88, 12, 0.1)'
          }}
        >
          <div style={{ fontWeight: 700, color: '#9a3412', fontSize: '0.92rem' }}>
            ⚡ {selectedIds.length} candidate(s) selected
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Mark selected as:</span>
            <button
              type="button"
              disabled={bulkProcessing}
              onClick={() => handleBulkStatus('shortlisted')}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Shortlisted
            </button>
            <button
              type="button"
              disabled={bulkProcessing}
              onClick={() => handleBulkStatus('selected')}
              style={{
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Selected
            </button>
            <button
              type="button"
              disabled={bulkProcessing}
              onClick={() => handleBulkStatus('rejected')}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Rejected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '0.45rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="loading">Loading candidate applications...</div>
      ) : filteredApps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No applications match the filters</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Try resetting your search query or selecting a different status/company.
          </p>
        </div>
      ) : (
        <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', width: '38px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredApps.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                  />
                </th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Candidate Profile</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Academic Stats</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Drive & Role</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Student Résumé</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Decision Status</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const conf = statusConfig[app.status] || statusConfig.applied;
                const isSelected = selectedIds.includes(app.id);

                return (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#fffdf7' : 'transparent'
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(app.id)}
                        style={{ cursor: 'pointer', transform: 'scale(1.15)' }}
                      />
                    </td>

                    {/* Candidate */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#ffedd5',
                            color: '#ea580c',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem'
                          }}
                        >
                          {(app.student_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                            {app.student_name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {app.student_email}
                          </div>
                          {app.student_phone && (
                            <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                              📞 {app.student_phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Academic Stats */}
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

                    {/* Drive & Role */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <CompanyLogo company={app.company} size={36} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                            {app.job_title}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 600 }}>
                            {app.company}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Resume */}
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

                    {/* Status Dropdown */}
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          padding: '0.38rem 0.75rem',
                          borderRadius: '16px',
                          border: `1.5px solid ${conf.border}`,
                          background: conf.bg,
                          color: conf.color,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          outline: 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px'
                        }}
                      >
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Quick Shortlist */}
                        {app.status !== 'shortlisted' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'shortlisted')}
                            title="Shortlist Candidate"
                            style={{
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              color: '#d97706',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Shortlist
                          </button>
                        )}

                        {/* Quick Select */}
                        {app.status !== 'selected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'selected')}
                            title="Select Candidate"
                            style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              color: '#16a34a',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Select
                          </button>
                        )}

                        {/* View Candidate Full Modal */}
                        <button
                          type="button"
                          onClick={() => setViewCandidate(app)}
                          title="Candidate Information"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FaIdCard /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* CANDIDATE FULL DETAILS MODAL                         */}
      {/* ==================================================== */}
      {viewCandidate && (
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
          onClick={() => setViewCandidate(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              width: 'min(650px, 95vw)',
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
                <FaUserGraduate style={{ color: '#ea580c', fontSize: '1.2rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Candidate Application Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.6rem' }}>
              {/* Header Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.2rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ea580c', color: '#ffffff', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(viewCandidate.student_name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {viewCandidate.student_name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 600 }}>
                    Applied for: {viewCandidate.job_title} ({viewCandidate.company})
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Email Address</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewCandidate.student_email}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewCandidate.student_phone || '—'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Branch & CGPA</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
                    {viewCandidate.student_branch || '—'} (CGPA: {viewCandidate.student_cgpa || '—'})
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>College / Institute</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewCandidate.student_college || '—'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Skills</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{viewCandidate.student_skills || '—'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Applied Date</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
                    {viewCandidate.applied_at ? new Date(viewCandidate.applied_at).toLocaleString() : '—'}
                  </div>
                </div>
              </div>

              {/* Resume Card inside Modal */}
              <div style={{ background: viewCandidate.student_resume ? '#f0fdf4' : '#fffbeb', border: `1.5px solid ${viewCandidate.student_resume ? '#bbf7d0' : '#fde68a'}`, borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <FaFilePdf style={{ fontSize: '1.8rem', color: viewCandidate.student_resume ? '#16a34a' : '#d97706' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Candidate Submitted Résumé</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {viewCandidate.student_resume ? 'Ready for recruiter review' : 'No document attached'}
                    </div>
                  </div>
                </div>

                {viewCandidate.student_resume ? (
                  <a
                    href={getResumeUrl(viewCandidate.student_resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '0.5rem 1.2rem',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    Open Résumé Document <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                  </a>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>Missing Résumé</span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.6rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.55rem 1.3rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}