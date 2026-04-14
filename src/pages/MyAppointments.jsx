import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getAppointments } from '../utils/storage';

export default function MyAppointments() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // ---- State ----
  const [appointments, setAppointments] = useState([]);

  // ---- Load user's appointments ----
  useEffect(() => {
    if (user) {
      const allAppointments = getAppointments();
      const userAppts = allAppointments
        .filter((a) => a.username === user.username)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(userAppts);
    }
  }, [user?.username]);

  // ---- Auth guard ----
  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🔒</div>
            <h3>Please Login</h3>
            <p>You need to be logged in to view your appointments</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="my-appointments-page">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* ---- Page Header ---- */}
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>View all your booked appointments and token details</p>
        </div>

        {appointments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map((appt) => (
              <div key={appt.id} className="card card-elevated" id={`appointment-${appt.id}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  {/* Left: Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3>{appt.hospitalName}</h3>
                      <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' : 'badge-outline'}`}>
                        {appt.status === 'confirmed' ? '✓ Confirmed' : appt.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px'
                    }}>
                      {[
                        { icon: '👨‍⚕️', label: 'Doctor', value: appt.doctorName },
                        { icon: '🏷️', label: 'Specialization', value: appt.doctorSpecialization },
                        { icon: '📅', label: 'Date', value: new Date(appt.date).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                        { icon: '⏰', label: 'Time', value: appt.timeSlot },
                        { icon: '📍', label: 'City', value: appt.hospitalCity },
                        { icon: '👤', label: 'Patient', value: appt.patientName }
                      ].map((item, i) => (
                        <div key={i}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {item.icon} {item.label}
                          </span>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Token */}
                  <div style={{
                    textAlign: 'center',
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, var(--primary-fixed), var(--surface-lowest))',
                    borderRadius: 'var(--radius-lg)',
                    minWidth: '120px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginBottom: '8px', fontWeight: 600 }}>
                      TOKEN
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      letterSpacing: '-0.02em'
                    }}>
                      {appt.tokenNumber}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '12px', fontSize: '0.75rem', padding: '6px 14px' }}
                      onClick={() => navigate('/token-status')}
                    >
                      Track →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">📅</div>
            <h3>No Appointments Yet</h3>
            <p>Book your first appointment to see it here</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/book-appointment')}>
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
