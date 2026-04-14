import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../utils/storage';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span>Medi</span>Care+
        </div>

        <div className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/hospitals">Hospitals</NavLink>
          <NavLink to="/book-appointment">Book</NavLink>
          <NavLink to="/token-status">Tokens</NavLink>
          <NavLink to="/health-records">Records</NavLink>
          <NavLink to="/my-appointments">Appointments</NavLink>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent-pale)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700
              }}>
                {(user.name || user.username || '?').charAt(0).toUpperCase()}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
