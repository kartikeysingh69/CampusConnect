// src/components/QuickLauncherDrawer.jsx — Global 3-Dots Platform Hub Drawer
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTimes,
  FaSearch,
  FaHome,
  FaBuilding,
  FaFileAlt,
  FaLaptopCode,
  FaComments,
  FaQuestionCircle,
  FaUsers,
  FaChartLine,
  FaUser,
  FaBriefcase,
  FaShieldAlt,
  FaChevronRight,
  FaCheckCircle,
  FaEllipsisV
} from 'react-icons/fa';

export default function QuickLauncherDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const [filterText, setFilterText] = useState('');
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const featureGroups = [
    {
      title: 'Placements & Drives',
      items: [
        {
          to: '/',
          label: 'CampusConnect Home',
          badge: 'Main',
          desc: 'Platform front page & highlights',
          icon: <FaHome style={{ color: '#ea580c' }} />
        },
        {
          to: '/jobs',
          label: 'Campus Drives & Jobs',
          badge: 'Active',
          desc: 'Browse stream drives, CTC & eligibility',
          icon: <FaBuilding style={{ color: '#f97316' }} />
        },
        {
          to: '/my-applications',
          label: 'My Applications',
          badge: user?.role === 'student' ? 'Status' : null,
          desc: 'Track submissions, interview calls & offers',
          icon: <FaCheckCircle style={{ color: '#16a34a' }} />,
          requireAuth: true
        }
      ]
    },
    {
      title: 'AI Prep & Coding Assessments',
      items: [
        {
          to: '/assessment',
          label: 'Coding Assessment',
          badge: 'Compiler',
          desc: 'Live in-browser code editor & test cases',
          icon: <FaLaptopCode style={{ color: '#0284c7' }} />
        },
        {
          to: '/ats-checker',
          label: 'AI ATS Resume Match',
          badge: 'AI Powered',
          desc: 'Scan resume match score & keyword analysis',
          icon: <FaFileAlt style={{ color: '#8b5cf6' }} />,
          requireAuth: true
        },
        {
          to: '/mock-prep',
          label: 'Technical Q&A & Mock Viva',
          badge: 'Simulator',
          desc: 'AI interview simulator & technical drills',
          icon: <FaQuestionCircle style={{ color: '#ec4899' }} />
        },
        {
          to: '/forum',
          label: 'Campus Discussion & Q&A Forum',
          badge: 'TPO Bulletin',
          desc: 'Campus community, peer tips & official news',
          icon: <FaUsers style={{ color: '#10b981' }} />
        }
      ]
    },
    {
      title: 'Communication & Analytics',
      items: [
        {
          to: '/messages',
          label: 'Direct Messages',
          badge: 'Live',
          desc: 'Chat directly with recruiters, TPO & peers',
          icon: <FaComments style={{ color: '#0ea5e9' }} />,
          requireAuth: true
        },
        {
          to: '/analytics',
          label: 'Placement Analytics',
          badge: 'Insights',
          desc: 'CTC stats, branch rates & recruitment trends',
          icon: <FaChartLine style={{ color: '#f59e0b' }} />
        },
        {
          to: '/profile',
          label: 'Student Profile & Resume',
          badge: 'Verified',
          desc: 'Manage skills, academic records & portfolio',
          icon: <FaUser style={{ color: '#6366f1' }} />,
          requireAuth: true
        }
      ]
    },
    {
      title: 'Portals & Admin',
      items: [
        {
          to: '/recruiter',
          label: 'Recruiter Portal',
          badge: 'Employers',
          desc: 'Post job drives & review applicant pipelines',
          icon: <FaBriefcase style={{ color: '#ea580c' }} />
        },
        {
          to: '/admin',
          label: 'Admin Control Center',
          badge: 'Admin Only',
          desc: 'Institutional settings, user & drive control',
          icon: <FaShieldAlt style={{ color: '#dc2626' }} />,
          adminOnly: true
        }
      ]
    }
  ];

  const filteredGroups = featureGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((item) => {
        if (item.adminOnly && user?.role !== 'admin') return false;
        if (!filterText) return true;
        const q = filterText.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
        );
      })
    }))
    .filter((grp) => grp.items.length > 0);

  return (
    <>
      {/* Backdrop with Smooth Blur */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease'
        }}
      />

      {/* Slide-out Drawer from Left Top Corner */}
      <aside
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '380px',
          maxWidth: '90vw',
          height: '100vh',
          background: '#ffffff',
          boxShadow: '10px 0 35px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.4rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #ea580c'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(234, 88, 12, 0.25)',
                border: '1px solid rgba(251, 146, 60, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c'
              }}
            >
              <FaEllipsisV style={{ fontSize: '1.05rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Campus<span style={{ color: '#ea580c' }}>Connect</span> Hub
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                All Platform Tools & Services
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Hub"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ea580c')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <FaTimes style={{ fontSize: '0.9rem' }} />
          </button>
        </div>

        {/* Quick Search Filter Inside Drawer */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.82rem' }} />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search tools (coding, ats, drives...)"
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                fontSize: '0.84rem',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#ea580c')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Links Navigation Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {filteredGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.88rem' }}>
              No platform features found matching "{filterText}".
            </div>
          ) : (
            filteredGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#64748b',
                    marginBottom: '0.45rem',
                    paddingLeft: '0.35rem'
                  }}
                >
                  {group.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {group.items.map((item, iIdx) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={iIdx}
                        to={item.to}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          textDecoration: 'none',
                          background: isActive ? '#fff7ed' : '#ffffff',
                          border: isActive ? '1px solid #fed7aa' : '1px solid transparent',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? '0 2px 6px rgba(234, 88, 12, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isActive ? '#fed7aa' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.05rem',
                            flexShrink: 0
                          }}
                        >
                          {item.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                color: isActive ? '#ea580c' : '#0f172a',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  background: isActive ? '#ea580c' : '#f1f5f9',
                                  color: isActive ? '#ffffff' : '#64748b',
                                  padding: '1px 6px',
                                  borderRadius: '9999px',
                                  flexShrink: 0
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              color: '#64748b',
                              fontSize: '0.72rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '2px'
                            }}
                          >
                            {item.desc}
                          </div>
                        </div>

                        <FaChevronRight
                          style={{
                            fontSize: '0.7rem',
                            color: isActive ? '#ea580c' : '#cbd5e1',
                            flexShrink: 0
                          }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with User Status */}
        <div
          style={{
            padding: '0.9rem 1.25rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}
        >
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#ea580c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  flexShrink: 0
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', truncate: true, fontSize: '0.82rem' }}>
                  {user.name}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'capitalize' }}>
                  {user.role} Account
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Welcome, Guest Candidate</div>
          )}

          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#ea580c',
              background: '#fff7ed',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #fed7aa'
            }}
          >
            v2.4 Live
          </div>
        </div>
      </aside>
    </>
  );
}
