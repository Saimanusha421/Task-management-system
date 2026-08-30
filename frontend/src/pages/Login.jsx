import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [role, setRole] = useState('admin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login({ ...form, role });
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} />
          Task Management System
        </div>
        <p className="auth-subtitle">Sign in to continue</p>

        <div className="role-toggle">
          <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>
            Admin
          </button>
          <button type="button" className={role === 'employee' ? 'active' : ''} onClick={() => setRole('employee')}>
            Employee
          </button>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? <span className="spinner" /> : `Sign in as ${role === 'admin' ? 'Admin' : 'Employee'}`}
          </button>
        </form>

        <p className="form-hint" style={{ textAlign: 'center', marginTop: 18 }}>
          Employee accounts are created by an Admin from the Employees page.
        </p>
      </div>
    </div>
  );
};

export default Login;
