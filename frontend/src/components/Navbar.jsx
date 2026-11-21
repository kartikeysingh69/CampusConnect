// src/components/Navbar.jsx — Clean Internshala-style Header with Jobs Stream Dropdown, Search Bar & Streamlined Navigation
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
  FaBuilding
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    { name: 'Computer Science & IT', branch: 'Computer Science', icon: <FaLaptopCode style={{ color: '#2563eb' }} /> },
    { name: 'Mechanical Engineering', branch: 'Mechanical', icon: <FaCogs style={{ color: '#ea580c' }} /> },
    { name: 'Electronics & Electrical', branch: 'Electronics', icon: <FaBolt style={{ color: '#eab308' }} /> },
    { name: 'Civil Engineering', branch: 'Civil', icon: <FaDraftingCompass style={{ color: '#16a34a' }} /> },
    { name: 'Business & Management', branch: 'Business', icon: <FaBriefcase style={{ color: '#8b5cf6' }} /> },
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem'
      }}
    >
      {/* Left: Brand Logo & Jobs Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
            Campus<span style={{ color: '#008bdc' }}>Connect</span>
          </span>
        </Link>

        {/* Jobs Stream Dropdown (Internshala Style) */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onMouseEnter={() => setDropdownOpen(true)}
            style={{
              background: dropdownOpen ? '#f0f9ff' : 'transparent',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#334155',
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
                color: '#64748b',
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
                border: '1px solid #e2e8f0',
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
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

      {/* Center: Search Bar (Internshala Style) */}
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
            e.target.style.borderColor = '#008bdc';
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
                    color: '#008bdc',
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
                    color: '#008bdc',
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
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '30px',
                padding: '4px 12px',
                textDecoration: 'none',
                color: '#1e293b',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <FaUser style={{ color: '#008bdc' }} />
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
            {/* Login Button (Internshala Outlined Style) */}
            <Link
              to="/login"
              style={{
                border: '1.5px solid #008bdc',
                borderRadius: '8px',
                color: '#008bdc',
                background: '#ffffff',
                padding: '6px 18px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              Login
            </Link>

            {/* Register Button (Internshala Solid Primary Style) */}
            <Link
              to="/register"
              style={{
                background: '#008bdc',
                borderRadius: '8px',
                color: '#ffffff',
                border: '1.5px solid #008bdc',
                padding: '6px 20px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0072b5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#008bdc')}
            >
              Register
            </Link>

            {/* For Employers Link (Internshala Style) */}
            <Link
              to="/recruiter"
              style={{
                color: '#008bdc',
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