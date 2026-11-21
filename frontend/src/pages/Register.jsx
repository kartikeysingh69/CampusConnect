// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleSsoLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUserPlus, FaGoogle } from 'react-icons/fa';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', employee_id: '', company_name: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role !== 'admin') delete payload.employee_id;
      if (form.role !== 'recruiter') delete payload.company_name;
      await register(payload);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSso = async () => {
    const ssoEmail = prompt('Enter your College Email (@campus.edu):', 'student@campus.edu');
    if (!ssoEmail) return;
    const ssoName = prompt('Enter your Full Name:', 'College Student');
    if (!ssoName) return;

    setLoading(true);
    try {
      const { data } = await googleSsoLogin({
        email: ssoEmail.trim(),
        name: ssoName.trim(),
        role: 'student'
      });
      loginUser(data.user, data.token);
      toast.success(`🎉 Registered & Signed in with College SSO!`);
      navigate('/jobs');
    } catch (err) {
      toast.error('SSO failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2><FaUserPlus /> Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Kunal Sharma"
              required
            />
          </div>
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
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => {
                setForm({
                  ...form,
                  role: e.target.value,
                  employee_id: e.target.value === 'admin' ? form.employee_id : '',
                  company_name: e.target.value === 'recruiter' ? form.company_name : ''
                });
              }}
            >
              <option value="student">Student</option>
              <option value="admin">Admin (Placement Cell)</option>
              <option value="recruiter">Corporate Recruiter / HR Partner</option>
            </select>
          </div>
          {form.role === 'admin' && (
            <div className="form-group">
              <label>Employee ID (Placement Cell Staff Only)</label>
              <input
                type="text"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                placeholder="e.g. EMP-2024-001"
                required
              />
              <small style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                Only authorized placement cell employees can register as admin. Students cannot use this field.
              </small>
            </div>
          )}
          {form.role === 'recruiter' && (
            <div className="form-group">
              <label>Company / Organization Name *</label>
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Google, Amazon, Microsoft, TCS"
                required
              />
              <small style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                Recruiters can review applicants, evaluate talent, schedule rounds, and post hiring drives for their company.
              </small>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ margin: '1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            or fast register with
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={handleQuickSso}
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
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
