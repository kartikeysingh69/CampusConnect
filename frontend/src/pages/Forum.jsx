// src/pages/Forum.jsx — TPO Official Bulletin Board & Campus Recruitment Q&A Forum
import { useState, useEffect } from 'react';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getJobs,
  getDriveDiscussions,
  postDriveDiscussion
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaBullhorn,
  FaComments,
  FaThumbtack,
  FaPlus,
  FaTrashAlt,
  FaCheckCircle,
  FaPaperPlane,
  FaBuilding,
  FaCalendarAlt,
  FaUserCircle
} from 'react-icons/fa';

export default function Forum() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form (Admin only)
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    message: '',
    category: 'Urgent',
    is_pinned: true
  });

  // Discussion Form
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchForumData = async () => {
    setLoading(true);
    try {
      const [annRes, jobsRes] = await Promise.all([
        getAnnouncements(),
        getJobs()
      ]);
      setAnnouncements(annRes.data.announcements || []);
      const rawJobs = jobsRes.data.jobs || [];
      setJobs(rawJobs);
      if (rawJobs.length > 0) {
        setSelectedJobId(rawJobs[0].id);
        const discRes = await getDriveDiscussions(rawJobs[0].id);
        setDiscussions(discRes.data.discussions || []);
      }
    } catch (err) {
      toast.error('Failed to load forum announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumData();
  }, []);

  // When selected drive changes, fetch its discussion messages
  const handleSelectJob = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const { data } = await getDriveDiscussions(jobId);
      setDiscussions(data.discussions || []);
    } catch (err) {
      console.warn('Failed to load discussions:', err);
    }
  };

  // Submit Notice (Admin)
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement(noticeForm);
      toast.success('📢 Official circular published & broadcast to students!');
      setShowNoticeForm(false);
      setNoticeForm({ title: '', message: '', category: 'General', is_pinned: false });
      const { data } = await getAnnouncements();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post notice');
    }
  };

  // Delete Notice (Admin)
  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Notice removed');
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error('Failed to delete notice');
    }
  };

  // Submit Discussion Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedJobId) return;

    setSubmittingComment(true);
    try {
      const { data } = await postDriveDiscussion(selectedJobId, { message: commentText });
      toast.success('Comment posted!');
      setDiscussions((prev) => [...prev, data.discussion]);
      setCommentText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const activeJob = jobs.find((j) => String(j.id) === String(selectedJobId));

  if (loading) return <div className="loading">Loading placement bulletin and discussion forum...</div>;

  return (
    <div className="page" style={{ maxWidth: '1250px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>
            <FaBullhorn style={{ color: '#ea580c' }} /> TPO Bulletin & Placement Forum
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0.35rem 0 0 0' }}>
            Official Training & Placement Cell notices, circulars, and recruiter-student discussion threads
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setShowNoticeForm(!showNoticeForm)}
            style={{
              background: '#ea580c',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
            }}
          >
            <FaPlus /> {showNoticeForm ? 'Cancel Notice' : 'Publish TPO Notice'}
          </button>
        )}
      </div>

      {/* Admin Publish Notice Form */}
      {showNoticeForm && user?.role === 'admin' && (
        <form
          onSubmit={handleCreateNotice}
          style={{
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)'
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
            Broadcast New Official Circular / Notice
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Notice Headline *
              </label>
              <input
                type="text"
                required
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                placeholder="e.g. Mandatory Pre-Placement Briefing"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Category
              </label>
              <select
                value={noticeForm.category}
                onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="Urgent">Urgent Circular</option>
                <option value="Drive Update">Drive Update</option>
                <option value="Workshop">Workshop & Training</option>
                <option value="General">General Notice</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Notice Content *
            </label>
            <textarea
              rows="3"
              required
              value={noticeForm.message}
              onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
              placeholder="Full circular details, date, reporting instructions..."
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={noticeForm.is_pinned}
                onChange={(e) => setNoticeForm({ ...noticeForm, is_pinned: e.target.checked })}
              />
              Pin this circular to top of Bulletin Board
            </label>
            <button
              type="submit"
              style={{ background: '#ea580c', color: '#ffffff', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              Publish & Broadcast
            </button>
          </div>
        </form>
      )}

      {/* 2-Column Layout: Left = Official Bulletin, Right = Drive Q&A Discussions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.8rem', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN: OFFICIAL NOTICES */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FaBullhorn style={{ color: '#ea580c' }} /> TPO Official Circulars ({announcements.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${ann.is_pinned ? '#fed7aa' : '#e2e8f0'}`,
                  borderRadius: '14px',
                  padding: '1.3rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {ann.is_pinned && (
                      <span style={{ background: '#fff7ed', color: '#ea580c', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '12px', border: '1px solid #fed7aa', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        📌 PINNED
                      </span>
                    )}
                    <span
                      style={{
                        background:
                          ann.category === 'Urgent'
                            ? '#fee2e2'
                            : ann.category === 'Drive Update'
                            ? '#e0f2fe'
                            : '#f0fdf4',
                        color:
                          ann.category === 'Urgent'
                            ? '#991b1b'
                            : ann.category === 'Drive Update'
                            ? '#0369a1'
                            : '#166534',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '12px'
                      }}
                    >
                      {ann.category}
                    </span>
                  </div>

                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(ann.id)}
                      title="Delete Notice"
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                  {ann.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                  {ann.message}
                </p>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.7rem' }}>
                  Issued on: {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: DRIVE DISCUSSION & COMMUNITY Q&A */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FaComments style={{ color: '#2563eb' }} /> Drive Q&A & Candidate Discussions
          </h2>

          {/* Drive Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <select
              value={selectedJobId}
              onChange={(e) => handleSelectJob(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #bfdbfe',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1e3a8a',
                background: '#eff6ff'
              }}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  Thread: {j.company} — {j.title} ({j.stream})
                </option>
              ))}
            </select>
          </div>

          {/* Discussion Messages Box */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              minHeight: '380px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.2rem'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.4rem' }}>
              {discussions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <FaComments style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#cbd5e1' }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>No questions posted for this drive yet.</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem' }}>Be the first candidate or recruiter to start the discussion!</p>
                </div>
              ) : (
                discussions.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: d.user_role === 'admin' ? '#fff7ed' : d.user_role === 'recruiter' ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${d.user_role === 'admin' ? '#fed7aa' : d.user_role === 'recruiter' ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: '10px',
                      padding: '0.8rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>{d.user_name}</span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '8px',
                            background: d.user_role === 'admin' ? '#ea580c' : d.user_role === 'recruiter' ? '#16a34a' : '#64748b',
                            color: '#ffffff',
                            textTransform: 'uppercase'
                          }}
                        >
                          {d.user_role}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                      {d.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem' }}>
              <input
                type="text"
                placeholder={user ? `Ask a question about ${activeJob?.company || 'this drive'}...` : 'Please login to ask a question'}
                disabled={!user || submittingComment}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem'
                }}
              />
              <button
                type="submit"
                disabled={!user || submittingComment || !commentText.trim()}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <FaPaperPlane /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
