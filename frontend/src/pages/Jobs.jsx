// src/pages/Jobs.jsx — Browse placement drives with Company Logos, Multi-Stream Filters & Auto-Shuffle on refresh
import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs, getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { calculateSkillMatch } from '../utils/skillMatcher';
import CompanyLogo from '../components/CompanyLogo';
import toast from 'react-hot-toast';
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendar,
  FaFilter,
  FaSearch,
  FaTag,
  FaTimes,
  FaUndo,
  FaSlidersH,
  FaSortAmountDown,
  FaGraduationCap,
  FaCheckSquare,
  FaRegSquare,
  FaRandom
} from 'react-icons/fa';

const STREAMS = [
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

function parseCtc(val) {
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

// Fisher-Yates array shuffle algorithm
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State: Multi-select stream support (array)
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('shuffle');

  // Mobile drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const branchParam = searchParams.get('branch') || searchParams.get('stream');
    const searchParam = searchParams.get('search');
    if (branchParam) {
      const match = STREAMS.find((s) => s.toLowerCase().includes(branchParam.toLowerCase()));
      setSelectedStreams([match || branchParam]);
    }
    if (searchParam) {
      setSearch(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    getJobs()
      .then(({ data }) => {
        const raw = data.jobs || [];
        // Every time page is loaded / refreshed, shuffle jobs automatically!
        setJobs(shuffleArray(raw));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // If user is a student, fetch their profile skills for AI match scoring
    if (user && user.role === 'student') {
      getProfile()
        .then(({ data }) => setStudentProfile(data))
        .catch(() => {});
    }
  }, [user]);

  // AI Skill Match calculations for all jobs
  const jobMatches = useMemo(() => {
    const candidate = studentProfile || user;
    const map = {};
    jobs.forEach((j) => {
      map[j.id] = calculateSkillMatch(j, candidate);
    });
    return map;
  }, [jobs, studentProfile, user]);

  // Compute stream counts
  const streamCounts = useMemo(() => {
    const counts = { All: jobs.length };
    jobs.forEach((j) => {
      const s = j.stream || 'Other';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Compute unique locations
  const locations = useMemo(() => {
    const locSet = new Set();
    jobs.forEach((j) => {
      if (j.location) {
        const parts = j.location.split('/').map((p) => p.trim());
        parts.forEach((p) => {
          if (p) locSet.add(p);
        });
        locSet.add(j.location.trim());
      }
    });
    return ['All', ...Array.from(locSet).sort()];
  }, [jobs]);

  // Toggle single stream in multi-select array
  const toggleStream = (streamName) => {
    if (selectedStreams.includes(streamName)) {
      setSelectedStreams(selectedStreams.filter((s) => s !== streamName));
    } else {
      setSelectedStreams([...selectedStreams, streamName]);
    }
  };

  const selectAllStreams = () => {
    setSelectedStreams([...STREAMS]);
  };

  const clearStreams = () => {
    setSelectedStreams([]);
  };

  // Re-shuffle jobs on demand
  const handleShuffle = () => {
    setJobs((prev) => shuffleArray(prev));
    setSortBy('shuffle');
    toast.success('🔀 Jobs shuffled! Showing fresh opportunities');
  };

  // Compute active filters count
  const activeCount =
    selectedStreams.length +
    (selectedJobType !== 'All' ? 1 : 0) +
    (selectedLocation !== 'All' ? 1 : 0) +
    (search.trim() !== '' ? 1 : 0) +
    (sortBy !== 'shuffle' && sortBy !== 'newest' ? 1 : 0);

  const resetFilters = () => {
    setSelectedStreams([]);
    setSelectedJobType('All');
    setSelectedLocation('All');
    setSearch('');
    setSortBy('shuffle');
  };

  // Filter & Sort
  const filtered = useMemo(() => {
    return jobs
      .filter((j) => {
        // Multi-Stream filter: if any streams selected, job must match one of them
        if (selectedStreams.length > 0) {
          const jobStream = (j.stream || '').toLowerCase();
          const matchesStream = selectedStreams.some(
            (s) => s.toLowerCase() === jobStream
          );
          if (!matchesStream) return false;
        }

        // Job Type filter
        if (selectedJobType !== 'All') {
          if (!j.job_type || j.job_type.toLowerCase() !== selectedJobType.toLowerCase()) {
            return false;
          }
        }

        // Location filter
        if (selectedLocation !== 'All') {
          if (!j.location || !j.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
            return false;
          }
        }

        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            (j.title && j.title.toLowerCase().includes(q)) ||
            (j.company && j.company.toLowerCase().includes(q)) ||
            (j.location && j.location.toLowerCase().includes(q)) ||
            (j.eligibility && j.eligibility.toLowerCase().includes(q)) ||
            (j.stream && j.stream.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match_desc') {
          const scoreB = jobMatches[b.id]?.score || 0;
          const scoreA = jobMatches[a.id]?.score || 0;
          return scoreB - scoreA;
        }
        if (sortBy === 'ctc_desc') return parseCtc(b.ctc) - parseCtc(a.ctc);
        if (sortBy === 'ctc_asc') return parseCtc(a.ctc) - parseCtc(b.ctc);
        if (sortBy === 'company_asc') return (a.company || '').localeCompare(b.company || '');
        if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        return 0; // Default 'shuffle': retain randomized dynamic order!
      });
  }, [jobs, selectedStreams, selectedJobType, selectedLocation, search, sortBy, jobMatches]);

  if (loading) return <div className="loading">Loading placement opportunities...</div>;

  return (
    <div className="page">
      {/* Mobile Screen Filter Toggle Bar */}
      <div className="mobile-filter-bar">
        <div>
          <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Showing <strong style={{ color: '#ea580c' }}>{filtered.length}</strong> of {jobs.length} jobs
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleShuffle} className="btn-shuffle" title="Shuffle jobs">
            <FaRandom />
          </button>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="mobile-filter-btn"
          >
            <FaSlidersH />
            {mobileFilterOpen ? 'Hide Filters' : 'Filters'}
            {activeCount > 0 && <span className="filter-badge-count">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Left Sidebar + Right Job Cards */}
      <div className="jobs-page-layout">
        {/* ==================================================== */}
        {/* LEFT SIDEBAR: FILTERS                                */}
        {/* ==================================================== */}
        <aside className={`jobs-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
          {/* Sidebar Top Header */}
          <div className="sidebar-header">
            <div className="sidebar-title">
              <FaFilter />
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="filter-badge-count" title={`${activeCount} active filters`}>
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={resetFilters} className="sidebar-clear-btn" title="Reset all filters">
                <FaUndo style={{ fontSize: '0.72rem' }} /> Clear All
              </button>
            )}
          </div>

          {/* Filter 1: Search Keyword */}
          <div className="filter-section">
            <label className="filter-section-title">
              <FaSearch /> Search Keyword
            </label>
            <div className="sidebar-search-box">
              <FaSearch className="sidebar-search-icon" />
              <input
                type="text"
                placeholder="Role, company, skill, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="sidebar-search-clear"
                  title="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Filter 2: Multi-Select Stream / Branch / Category */}
          <div className="filter-section">
            <div className="filter-section-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaGraduationCap /> Streams
                {selectedStreams.length > 0 && (
                  <span className="stream-selected-badge">{selectedStreams.length} selected</span>
                )}
              </span>
              {selectedStreams.length > 0 && (
                <button
                  onClick={clearStreams}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ea580c',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="stream-list">
              {/* Option: All Streams */}
              <button
                type="button"
                onClick={clearStreams}
                className={`stream-item ${selectedStreams.length === 0 ? 'active' : ''}`}
                title="Show all streams"
              >
                <span className="stream-item-name">
                  {selectedStreams.length === 0 ? (
                    <FaCheckSquare className="stream-checkbox-icon" />
                  ) : (
                    <FaRegSquare className="stream-checkbox-icon" />
                  )}
                  All Streams
                </span>
                <span className="stream-count-pill">{jobs.length}</span>
              </button>

              {/* Individual Multi-Select Streams */}
              {STREAMS.map((s) => {
                const isSelected = selectedStreams.includes(s);
                const count = streamCounts[s] || 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStream(s)}
                    className={`stream-item ${isSelected ? 'active' : ''}`}
                    title={isSelected ? `Deselect ${s}` : `Select ${s}`}
                  >
                    <span className="stream-item-name">
                      {isSelected ? (
                        <FaCheckSquare className="stream-checkbox-icon" />
                      ) : (
                        <FaRegSquare className="stream-checkbox-icon" />
                      )}
                      {s}
                    </span>
                    <span className="stream-count-pill">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions: Select All / Clear */}
            <div className="stream-quick-actions">
              <button type="button" onClick={selectAllStreams}>
                Select all
              </button>
              {selectedStreams.length > 0 && (
                <button type="button" onClick={clearStreams}>
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Filter 3: Job Type (Full Time / Internship) */}
          <div className="filter-section">
            <label className="filter-section-title">
              <FaBriefcase /> Job Type
            </label>
            <div className="type-pills">
              {['All', 'Full Time', 'Internship'].map((t) => {
                const isSelected = selectedJobType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedJobType(t)}
                    className={`type-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 4: Location */}
          <div className="filter-section">
            <label className="filter-section-title">
              <FaMapMarkerAlt /> Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="sidebar-select"
            >
              <option value="All">All Locations</option>
              {locations
                .filter((l) => l !== 'All')
                .map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter 5: Sort By */}
          <div className="filter-section" style={{ marginBottom: '0.8rem' }}>
            <label className="filter-section-title">
              <FaSortAmountDown /> Sort Opportunities
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sidebar-select"
            >
              <option value="shuffle">🔀 Dynamic Shuffle (Auto on Refresh)</option>
              <option value="match_desc">🎯 AI Skill Match (Highest First)</option>
              <option value="newest">Newest Drives First</option>
              <option value="ctc_desc">Highest Package (CTC: High to Low)</option>
              <option value="ctc_asc">Lowest Package (CTC: Low to High)</option>
              <option value="company_asc">Company Name (A - Z)</option>
              <option value="title_asc">Job Role (A - Z)</option>
            </select>
          </div>

          {/* Shuffle Button in Sidebar */}
          <button
            type="button"
            onClick={handleShuffle}
            className="btn-shuffle"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem' }}
          >
            <FaRandom /> Shuffle All Drives
          </button>
        </aside>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: JOBS LISTING & HEADER                  */}
        {/* ==================================================== */}
        <section className="jobs-content">
          {/* Header Banner */}
          <div className="page-header" style={{ marginBottom: '1.2rem' }}>
            <div>
              <h1>
                <FaBriefcase /> Campus Placement Drives
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '0.3rem' }}>
                Explore verified career opportunities across engineering, tech, management, finance, and enterprise operations.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button onClick={handleShuffle} className="btn-shuffle" title="Click to shuffle jobs randomly">
                <FaRandom /> Shuffle Drives
              </button>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                Showing <strong style={{ color: '#ea580c' }}>{filtered.length}</strong> of {jobs.length} jobs
              </span>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeCount > 0 && (
            <div className="active-filters-bar">
              <span className="active-filter-label">Active filters:</span>

              {/* Multi-stream chips */}
              {selectedStreams.map((stream) => (
                <span
                  key={stream}
                  className="filter-chip"
                  onClick={() => toggleStream(stream)}
                  title={`Remove ${stream}`}
                >
                  Stream: {stream} <FaTimes />
                </span>
              ))}

              {selectedJobType !== 'All' && (
                <span className="filter-chip" onClick={() => setSelectedJobType('All')} title="Remove filter">
                  Type: {selectedJobType} <FaTimes />
                </span>
              )}

              {selectedLocation !== 'All' && (
                <span className="filter-chip" onClick={() => setSelectedLocation('All')} title="Remove filter">
                  City: {selectedLocation} <FaTimes />
                </span>
              )}

              {search.trim() !== '' && (
                <span className="filter-chip" onClick={() => setSearch('')} title="Remove search filter">
                  Search: "{search}" <FaTimes />
                </span>
              )}

              {sortBy !== 'shuffle' && sortBy !== 'newest' && (
                <span className="filter-chip" onClick={() => setSortBy('shuffle')} title="Reset sort">
                  Sorted: {sortBy.replace('_', ' ')} <FaTimes />
                </span>
              )}

              <button onClick={resetFilters} className="clear-all-chip">
                Clear all
              </button>
            </div>
          )}

          {/* Job Cards Grid */}
          <div className="job-grid">
            {filtered.length === 0 ? (
              <div className="empty" style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '1.15rem', color: '#475569', marginBottom: '0.5rem' }}>
                  No placement drives matched your criteria.
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Try selecting different streams, resetting your search term, or clearing filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn-secondary"
                  style={{ marginTop: '1.2rem' }}
                >
                  <FaUndo style={{ marginRight: '0.4rem' }} /> Reset All Filters
                </button>
              </div>
            ) : (
              filtered.map((job) => (
                <div key={job.id} className="job-card">
                  {/* Card Header with Company Logo & Badges */}
                  <div className="job-card-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <CompanyLogo company={job.company} size={46} />
                      <div>
                        <span className="job-card-stream-badge">
                          <FaTag style={{ fontSize: '0.62rem' }} />
                          {job.stream || 'General'}
                        </span>
                        <p className="company" style={{ margin: '0.25rem 0 0', fontSize: '0.95rem', color: '#c2410c', fontWeight: 600 }}>
                          {job.company}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span className="job-card-type-badge">
                        {job.job_type || 'Full Time'}
                      </span>
                      {jobMatches[job.id] && (
                        <span
                          style={{
                            background: jobMatches[job.id].bg,
                            color: jobMatches[job.id].color,
                            border: `1px solid ${jobMatches[job.id].border}`,
                            padding: '0.18rem 0.55rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            whiteSpace: 'nowrap'
                          }}
                          title={`AI Match: ${jobMatches[job.id].score}% (${jobMatches[job.id].ratingLabel})`}
                        >
                          🎯 {jobMatches[job.id].score}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', marginBottom: '0.4rem', color: '#0f172a' }}>
                    {job.title}
                  </h3>

                  <div className="job-meta">
                    <span>
                      <FaMapMarkerAlt /> {job.location || 'Pan India'}
                    </span>
                    <span style={{ color: '#ea580c', fontWeight: '700' }}>
                      <FaMoneyBillWave /> {job.ctc}
                    </span>
                    <span>
                      <FaCalendar />{' '}
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : 'Ongoing'}
                    </span>
                  </div>

                  <p className="eligibility" style={{ minHeight: '2.5rem' }}>
                    {job.eligibility || 'Open for final year students'}
                  </p>

                  <Link to={`/jobs/${job.id}`} className="btn-primary" style={{ marginTop: 'auto' }}>
                    View Details & Apply →
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
