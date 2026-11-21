// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import toast from 'react-hot-toast';
import { FaUserPlus } from 'react-icons/fa';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', employee_id: '', company_name: '' });
  const [loading, setLoading] = useState(false);
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
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
