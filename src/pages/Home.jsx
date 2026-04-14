import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: '🏥', title: 'Find Hospitals', desc: 'Search and filter 500+ hospitals across major Indian cities by specialization.' },
    { icon: '📅', title: 'Instant Booking', desc: 'Book appointments with your preferred doctor and receive a unique token instantly.' },
    { icon: '⚡', title: 'Live Token Tracking', desc: 'Monitor the running token and your estimated wait time in real-time.' },
    { icon: '📋', title: 'Health Records', desc: 'Store and access your complete medical history digitally, anytime, anywhere.' }
  ];

  const steps = [
    { num: '01', title: 'Browse Hospitals', desc: 'Search and filter hospitals by city, specialization, or doctor name' },
    { num: '02', title: 'Book & Get Token', desc: 'Choose your doctor, select a time, and receive your unique token number' },
    { num: '03', title: 'Track in Real-Time', desc: 'Monitor the currently running token and your estimated wait time' }
  ];

  return (
    <div id="home-page">
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-badge">
          ✦ India's Smart Healthcare Platform
        </div>

        <h1 className="hero-title">
          Book Appointments.<br />
          <span className="gradient-text">Track Tokens Live.</span>
        </h1>

        <p className="hero-subtitle">
          Find top hospitals, choose your doctor, get an instant token number,
          and monitor your queue position in real-time — all from one dashboard.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
            Get Started Free →
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/hospitals')}>
            Browse Hospitals
          </button>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="container">
        <div className="stats-bar">
          {[
            { value: '500+', label: 'Hospitals & Clinics' },
            { value: '1,000+', label: 'Expert Doctors' },
            { value: '50,000+', label: 'Appointments Booked' }
          ].map((s, i) => (
            <div key={i} className="stat">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-in">
          <h2>Everything You Need</h2>
          <p style={{ marginTop: '12px', maxWidth: '480px', margin: '12px auto 0' }}>
            A complete healthcare management solution at your fingertips
          </p>
        </div>

        <div className="grid-4">
          {features.map((f, i) => (
            <div key={i} className={`feature-card animate-in animate-in-delay-${i + 1}`}>
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how-it-works">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-in">
            <h2>How It Works</h2>
            <p style={{ marginTop: '12px' }}>Get started in just 3 simple steps</p>
          </div>

          <div className="grid-3">
            {steps.map((s, i) => (
              <div key={i} className={`how-step animate-in animate-in-delay-${i + 1}`}>
                <div className="step-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container" style={{ paddingBottom: '20px' }}>
        <div className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of patients and hospitals already using MediCare+</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Get Started — It's Free
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/hospitals')}>
              Browse Hospitals
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
