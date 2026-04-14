import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUser, registerUser, setCurrentUser, getUsers } from '../utils/storage';

export default function Login() {
  const navigate = useNavigate();

  const [portal, setPortal] = useState('patient');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Required';
    if (!form.password.trim()) errs.password = 'Required';
    if (form.password.length < 4) errs.password = 'Min 4 characters';
    if (mode === 'register') {
      if (!form.name.trim()) errs.name = 'Required';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      const users = getUsers();
      if (users.find((u) => u.username === form.username && u.role === portal)) {
        errs.username = 'Already taken';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'login') {
      const user = findUser(form.username, form.password, portal);
      if (user) {
        setCurrentUser(user);
        navigate(portal === 'hospital' ? '/hospital/dashboard' : '/hospitals');
      } else {
        setErrors({ general: 'Invalid username or password' });
      }
    } else {
      const newUser = {
        id: Date.now().toString(),
        name: form.name,
        username: form.username,
        password: form.password,
        role: portal,
        createdAt: new Date().toISOString()
      };
      registerUser(newUser);
      setCurrentUser(newUser);
      navigate(portal === 'hospital' ? '/hospital/register' : '/hospitals');
    }
  };

  return (
    <div className="login-wrapper" id="login-page">
      <div className="login-card">
        <div className="logo">MediCare+</div>
        <p className="subtitle">
          {mode === 'login' ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
        </p>

        {/* Portal Tabs */}
        <div className="portal-tabs">
          {[
            { id: 'patient', label: '👤 Patient' },
            { id: 'hospital', label: '🏥 Hospital' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`portal-tab ${portal === tab.id ? 'active' : ''}`}
              onClick={() => { setPortal(tab.id); setErrors({}); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{
              background: 'var(--rose-pale)', color: 'var(--rose)',
              padding: '12px 16px', borderRadius: 'var(--r-md)',
              fontSize: '0.82rem', fontWeight: 500, marginBottom: '20px',
              border: '1px solid rgba(244, 63, 94, 0.2)'
            }}>
              {errors.general}
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" className="form-input"
                placeholder="Enter your full name" value={form.name} onChange={handleChange} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" className="form-input"
              placeholder="Enter your username" value={form.username} onChange={handleChange} />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="form-input"
              placeholder="Enter your password" value={form.password} onChange={handleChange} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" className="form-input"
                placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
            style={{
              background: 'none', color: 'var(--accent)', fontWeight: 600,
              cursor: 'pointer', fontSize: '0.85rem', border: 'none'
            }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
