import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findUser, registerUser, setCurrentUser, getUsers } from '../../utils/storage';

export default function HospitalLogin() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password.trim()) errs.password = 'Password is required';
    if (form.password.length < 4) errs.password = 'Min 4 characters';
    if (mode === 'register') {
      if (!form.name.trim()) errs.name = 'Hospital name is required';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      const users = getUsers();
      if (users.find((u) => u.username === form.username && u.role === 'hospital')) {
        errs.username = 'Username already exists';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'login') {
      const user = findUser(form.username, form.password, 'hospital');
      if (user) {
        setCurrentUser(user);
        navigate('/hospital/dashboard');
      } else {
        setErrors({ general: 'Invalid credentials' });
      }
    } else {
      const newUser = {
        id: Date.now().toString(),
        name: form.name,
        username: form.username,
        password: form.password,
        role: 'hospital',
        createdAt: new Date().toISOString()
      };
      registerUser(newUser);
      setCurrentUser(newUser);
      navigate('/hospital/register');
    }
  };

  return (
    <div className="login-wrapper" id="hospital-login-page">
      <div className="login-card">
        <div className="logo">MediCare+</div>
        <p className="subtitle">
          🏢 Hospital Portal — {mode === 'login' ? 'Sign in to manage your hospital' : 'Register your hospital account'}
        </p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{
              background: 'var(--error-container)', color: 'var(--error)',
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem', fontWeight: 500, marginBottom: '20px'
            }}>
              {errors.general}
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="h-name">Hospital / Admin Name</label>
              <input type="text" id="h-name" name="name" className="form-input"
                placeholder="Enter hospital or admin name" value={form.name} onChange={handleChange} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="h-username">Username</label>
            <input type="text" id="h-username" name="username" className="form-input"
              placeholder="Enter username" value={form.username} onChange={handleChange} />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="h-password">Password</label>
            <input type="password" id="h-password" name="password" className="form-input"
              placeholder="Enter password" value={form.password} onChange={handleChange} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="h-confirm">Confirm Password</label>
              <input type="password" id="h-confirm" name="confirmPassword" className="form-input"
                placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {mode === 'login' ? 'Sign In to Hospital Portal' : 'Create Hospital Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
            style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', border: 'none' }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', color: 'var(--outline)',
            fontSize: '0.8rem', cursor: 'pointer'
          }}>
            ← Back to Patient Login
          </button>
        </div>
      </div>
    </div>
  );
}
