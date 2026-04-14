import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo">MediCare+</div>
          <p>
            India's smart healthcare platform. Book appointments,
            track tokens in real-time, and manage your digital health records.
          </p>
        </div>

        <div className="footer-section">
          <h4>Platform</h4>
          <Link to="/hospitals">Find Hospitals</Link>
          <Link to="/book-appointment">Book Appointment</Link>
          <Link to="/token-status">Track Token</Link>
          <Link to="/health-records">Health Records</Link>
        </div>

        <div className="footer-section">
          <h4>Portals</h4>
          <Link to="/login">Patient Login</Link>
          <Link to="/hospital/login">Hospital Login</Link>
          <Link to="/hospital/register">Register Hospital</Link>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} MediCare+ — Built for India's healthcare future.
      </div>
    </footer>
  );
}
