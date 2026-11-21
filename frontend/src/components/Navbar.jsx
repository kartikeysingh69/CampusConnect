// src/components/Navbar.jsx — CampusConnect Navbar with notification center
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img
          src="/campusconnect-logo.svg"
          alt="CampusConnect Logo"
          className="navbar-logo-img"
        />
        <span className="brand-text">CampusConnect</span>
      </Link>
      <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/jobs">Drives</Link>
                <Link to="/my-applications">My Applications</Link>
                <Link to="/ats-checker" style={{ color: '#ea580c', fontWeight: 700 }}>AI ATS</Link>
                <Link to="/mock-prep">Prep Q&A</Link>
                <Link to="/forum">TPO Bulletin</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}
            {user.role === 'recruiter' && (
              <>
                <Link to="/recruiter" style={{ color: '#ea580c', fontWeight: 800 }}>Recruiter Portal</Link>
                <Link to="/jobs">Browse Drives</Link>
                <Link to="/forum">TPO Bulletin</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/jobs">Manage Jobs</Link>
                <Link to="/admin/applications">Applications</Link>
                <Link to="/forum">TPO Bulletin</Link>
              </>
            )}

            {/* Notification Bell */}
            <NotificationBell />

            <span className="user-badge">
              <FaUser /> {user.name} ({user.company_name ? `${user.company_name} HR` : user.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/jobs">Explore Jobs</Link>
            <Link to="/mock-prep">Interview Prep</Link>
            <Link to="/forum">TPO Bulletin</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
