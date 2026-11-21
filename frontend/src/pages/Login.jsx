// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleSsoLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSignInAlt, FaGoogle, FaUniversity } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [ssoModal, setSsoModal] = useState(false);
  const [ssoForm, setSsoForm] = useState({
    name: 'Kunal Sharma',
    email: 'kunal.sharma@campus.edu'
  });
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSso = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data } = await googleSsoLogin({
        email: ssoForm.email,
        name: ssoForm.name,
        role: 'student'
      });
      loginUser(data.user, data.token);
      toast.success(`🎉 Authenticated with College SSO: ${data.user.name}`);
      setSsoModal(false);
      navigate(data.user.role === 'admin' ? '/admin' : '/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'College SSO failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2><FaSignInAlt /> Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Phase 13: Google College SSO Divider & Button */}
        <div style={{ margin: '1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={() => setSsoModal(true)}
          style={{
            width: '100%',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '9px 14px',
            color: '#1e293b',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#ea580c')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
        >
          <FaGoogle style={{ color: '#ea4335', fontSize: '1.1rem' }} />
          <span>College Google Account (@campus.edu)</span>
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>

      {/* Google College SSO Modal */}
      {ssoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem',
                  color: '#ea4335',
                  fontSize: '1.6rem'
                }}
              >
                <FaGoogle />
              </div>
              <h3 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontSize: '1.3rem', fontWeight: 800 }}>
                Institutional Google SSO
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Instant single sign-on with your verified college identity
              </p>
            </div>

            <form onSubmit={handleGoogleSso}>
              <div className="form-group">
                <label>Student Full Name</label>
                <input
                  type="text"
                  value={ssoForm.name}
                  onChange={(e) => setSsoForm({ ...ssoForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>College Email (@campus.edu)</label>
                <input
                  type="email"
                  value={ssoForm.email}
                  onChange={(e) => setSsoForm({ ...ssoForm, email: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setSsoModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    background: '#ea580c',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: loading ? 'wait' : 'pointer'
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In with SSO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
