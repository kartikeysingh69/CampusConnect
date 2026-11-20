// src/components/Navbar.jsx — CampusConnect Navbar with custom brand logo
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

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
      <div className="navbar-links">
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/jobs">Jobs</Link>
                <Link to="/my-applications">My Applications</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/jobs">Manage Jobs</Link>
                <Link to="/admin/applications">Applications</Link>
              </>
            )}
            <span className="user-badge">
              <FaUser /> {user.name} ({user.role})
            </span>
            <button onClick={handleLogout} className="btn-logout">
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/jobs">Explore Jobs</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
