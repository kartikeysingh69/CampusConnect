// src/components/Navbar.jsx — Clean Internshala-style Header with Warm Orange Brand Palette
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaSignOutAlt,
  FaUser,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaLaptopCode,
  FaCogs,
  FaBolt,
  FaDraftingCompass,
  FaBriefcase,
  FaBuilding,
  FaEllipsisV
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import QuickLauncherDrawer from './QuickLauncherDrawer';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    } else {
      navigate('/jobs');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const streamLinks = [
    { name: 'Computer Science & IT', branch: 'Computer Science', icon: <FaLaptopCode style={{ color: '#ea580c' }} /> },
    { name: 'Mechanical Engineering', branch: 'Mechanical', icon: <FaCogs style={{ color: '#d97706' }} /> },
    { name: 'Electronics & Electrical', branch: 'Electronics', icon: <FaBolt style={{ color: '#f59e0b' }} /> },
    { name: 'Civil Engineering', branch: 'Civil', icon: <FaDraftingCompass style={{ color: '#16a34a' }} /> },
    { name: 'Business & Management', branch: 'Business', icon: <FaBriefcase style={{ color: '#7c3aed' }} /> },
    { name: 'All Campus Drives', branch: '', icon: <FaBuilding style={{ color: '#64748b' }} /> }
  ];

  return (
    <nav
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.65rem 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}
    >
      {/* Left: 3-Dot Quick Launcher + Brand Logo & Jobs Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* 3-Dot Global Platform Hub Launcher Button */}
        <button
          type="button"
          onClick={() => setLauncherOpen(true)}
          title="All Platform Features & Tools"
          aria-label="Open Platform Navigation Menu"
          style={{
            background: launcherOpen ? '#fff7ed' : '#f8fafc',
            border: '1.5px solid #fed7aa',
            borderRadius: '9px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ea580c',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 5px rgba(234, 88, 12, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ea580c';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#ea580c';
            e.currentTarget.style.boxShadow = '0 3px 8px rgba(234, 88, 12, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = launcherOpen ? '#fff7ed' : '#f8fafc';
            e.currentTarget.style.color = '#ea580c';
            e.currentTarget.style.borderColor = '#fed7aa';
            e.currentTarget.style.boxShadow = '0 2px 5px rgba(234, 88, 12, 0.1)';
          }}
        >
          <FaEllipsisV style={{ fontSize: '1rem' }} />
        </button>

        {/* Global Quick Launcher Drawer (Available on ALL pages) */}
        <QuickLauncherDrawer isOpen={launcherOpen} onClose={() => setLauncherOpen(false)} />

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            color: '#0f172a'
          }}
        >
          <img
            src="/campusconnect-logo.svg"
            alt="CampusConnect Logo"
            style={{ width: '34px', height: '34px' }}
          />
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: '#0f172a'
            }}
          >
            Campus<span style={{ color: '#ea580c' }}>Connect</span>
          </span>
        </Link>

        {/* Jobs Stream Dropdown (Warm Orange Hover) */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={() => setDropdownOpen(true)}
            style={{
              background: dropdownOpen ? '#fff7ed' : 'transparent',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              color: dropdownOpen ? '#ea580c' : '#334155',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease'
            }}
          >
            <span>Jobs</span>
            <FaChevronDown
              style={{
                fontSize: '0.72rem',
                color: dropdownOpen ? '#ea580c' : '#64748b',
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              onMouseLeave={() => setDropdownOpen(false)}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #fed7aa',
                padding: '0.5rem',
                minWidth: '260px',
                zIndex: 1010,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div
                style={{
                  padding: '6px 12px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#94a3b8',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                Browse Drives by Engineering Stream
              </div>
              {streamLinks.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.branch ? `/jobs?branch=${encodeURIComponent(item.branch)}` : '/jobs'}
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fff7ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '1rem', display: 'flex' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Bar with Warm Focus */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: 1,
          maxWidth: '440px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaSearch
          style={{
            position: 'absolute',
            left: '14px',
            color: '#94a3b8',
            fontSize: '0.88rem'
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company, role, or skill..."
          style={{
            width: '100%',
            padding: '8px 16px 8px 38px',
            borderRadius: '50px',
            border: '1.5px solid #e2e8f0',
            background: '#f8fafc',
            fontSize: '0.88rem',
            color: '#0f172a',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#ea580c';
            e.target.style.background = '#ffffff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.background = '#f8fafc';
          }}
        />
      </form>

      {/* Right: Auth Buttons / Streamlined User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link
                  to="/jobs"
                  style={{
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  Drives
                </Link>
                <Link
                  to="/my-applications"
                  style={{
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  My Applications
                </Link>
              </>
            )}

            {user.role === 'recruiter' && (
              <>
                <Link
                  to="/recruiter"
                  style={{
                    color: '#ea580c',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  Recruiter Portal
                </Link>
                <Link
                  to="/jobs"
                  style={{
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  Drives
                </Link>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  style={{
                    color: '#ea580c',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/jobs"
                  style={{
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/admin/applications"
                  style={{
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '6px 10px'
                  }}
                >
                  Applications
                </Link>
              </>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Avatar & Badge */}
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '30px',
                padding: '4px 12px',
                textDecoration: 'none',
                color: '#c2410c',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <FaUser style={{ color: '#ea580c' }} />
              <span>{user.name}</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#64748b',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            {/* Login Button (Warm Orange Outlined Style) */}
            <Link
              to="/login"
              style={{
                border: '1.5px solid #ea580c',
                borderRadius: '8px',
                color: '#ea580c',
                background: '#ffffff',
                padding: '6px 18px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff7ed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              Login
            </Link>

            {/* Register Button (Warm Orange Gradient Style) */}
            <Link
              to="/register"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                borderRadius: '8px',
                color: '#ffffff',
                border: 'none',
                padding: '7px 20px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Register
            </Link>

            {/* For Employers Link */}
            <Link
              to="/recruiter"
              style={{
                color: '#ea580c',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 8px'
              }}
            >
              <span>For Employers</span>
              <FaChevronRight style={{ fontSize: '0.72rem' }} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}