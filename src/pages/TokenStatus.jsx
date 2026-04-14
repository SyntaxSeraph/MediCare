import { useState, useEffect } from 'react';
import { getCurrentUser, getAppointments, getCurrentToken } from '../utils/storage';

export default function TokenStatus() {
  const user = getCurrentUser();

  // ---- State ----
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentRunning, setCurrentRunning] = useState(0);

  // ---- Load user's appointments on mount ----
  useEffect(() => {
    const allAppointments = getAppointments();
    const userAppointments = allAppointments.filter(
      (a) => a.username === user?.username && a.status === 'confirmed'
    );
    setAppointments(userAppointments);

    // Auto-select the most recent appointment
    if (userAppointments.length > 0) {
      setSelectedAppointment(userAppointments[userAppointments.length - 1]);
    }
  }, [user?.username]);

  // ---- Simulate real-time token updates using setInterval ----
  useEffect(() => {
    if (!selectedAppointment) return;

    // Read current token from localStorage immediately
    const token = getCurrentToken(selectedAppointment.hospitalId);
    setCurrentRunning(token);

    // Poll localStorage every 2 seconds for updates (sync with hospital portal)
    const interval = setInterval(() => {
      const updatedToken = getCurrentToken(selectedAppointment.hospitalId);
      setCurrentRunning(updatedToken);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAppointment]);

  // ---- Calculate queue position ----
  const myTokenIndex = selectedAppointment?.tokenIndex || 0;
  const peopleAhead = Math.max(0, myTokenIndex - currentRunning);
  const estimatedMinutes = peopleAhead * 8; // ~8 min per patient
  const isYourTurn = currentRunning === myTokenIndex;
  const hasPassedToken = currentRunning > myTokenIndex;

  // ---- Generate queue visualization ----
  const generateQueue = () => {
    if (!selectedAppointment) return [];
    const queue = [];
    const start = Math.max(1, currentRunning - 1);
    const end = Math.min(myTokenIndex + 2, myTokenIndex + 2);
    for (let i = start; i <= end; i++) {
      const hospPrefix = selectedAppointment.hospitalId.toUpperCase().slice(0, 4);
      queue.push({
        tokenStr: `${hospPrefix}${String(i).padStart(3, '0')}`,
        index: i,
        isCurrent: i === currentRunning,
        isYours: i === myTokenIndex,
        isNext: i === currentRunning + 1
      });
    }
    return queue;
  };

  // ---- No appointments state ----
  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🔒</div>
            <h3>Please Login</h3>
            <p>You need to be logged in to view token status</p>
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🎫</div>
            <h3>No Active Appointments</h3>
            <p>Book an appointment to get your token number</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="token-status-page">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* ---- Page Header ---- */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1>Live Token Status</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="status-dot live"></span>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <p>Track your token in real-time</p>
        </div>

        {/* ---- Appointment Selector (if multiple) ---- */}
        {appointments.length > 1 && (
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Select Appointment</label>
            <select
              className="form-input"
              value={selectedAppointment?.id || ''}
              onChange={(e) => {
                const appt = appointments.find((a) => a.id === e.target.value);
                setSelectedAppointment(appt);
              }}
              id="appointment-selector"
            >
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.hospitalName} — {a.doctorName} ({a.date})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedAppointment && (
          <>
            {/* ---- Token Display Cards ---- */}
            <div className="grid-2" style={{ marginBottom: '32px' }}>
              {/* Currently Serving */}
              <div className="card card-elevated" style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--outline)', marginBottom: '16px', fontWeight: 600 }}>
                  Currently Serving
                </p>
                <div className="token-display current" style={{ margin: '0 auto', width: '100px', height: '100px', fontSize: '1.5rem' }}>
                  {currentRunning > 0
                    ? `${selectedAppointment.hospitalId.toUpperCase().slice(0, 4)}${String(currentRunning).padStart(3, '0')}`
                    : '—'}
                </div>
                <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                  ● Active Now
                </p>
              </div>

              {/* Your Token */}
              <div className="card card-elevated" style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--outline)', marginBottom: '16px', fontWeight: 600 }}>
                  Your Token
                </p>
                <div className="token-display yours" style={{ margin: '0 auto', width: '100px', height: '100px', fontSize: '1.5rem' }}>
                  {selectedAppointment.tokenNumber}
                </div>
                <p style={{
                  marginTop: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isYourTurn ? 'var(--success)' : hasPassedToken ? 'var(--error)' : 'var(--primary)'
                }}>
                  {isYourTurn ? '🎉 It\'s Your Turn!' : hasPassedToken ? '⏰ Token Passed' : `📊 Position: ${peopleAhead} ahead`}
                </p>
              </div>
            </div>

            {/* ---- Wait Time Card ---- */}
            <div className="card card-elevated" style={{ textAlign: 'center', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {peopleAhead}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>People Ahead</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--tertiary)' }}>
                    ~{estimatedMinutes} min
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--outline)' }}>Estimated Wait</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-full)',
                height: '8px',
                marginTop: '24px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, var(--primary-container), var(--success))',
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  width: `${myTokenIndex > 0 ? Math.min(100, (currentRunning / myTokenIndex) * 100) : 0}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            {/* ---- Queue Visualization ---- */}
            <div className="card card-elevated" style={{ marginBottom: '32px' }}>
              <h4 style={{ padding: '20px 24px 0', marginBottom: '12px' }}>Queue Visualization</h4>
              <div className="queue-visual">
                {generateQueue().map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="queue-item">
                      <div
                        className="token-mini"
                        style={{
                          background: item.isCurrent
                            ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                            : item.isYours
                              ? 'linear-gradient(135deg, var(--primary-container), var(--primary))'
                              : item.isNext
                                ? 'var(--warning-light)'
                                : 'var(--surface-container)',
                          color: item.isCurrent || item.isYours ? 'white' : item.isNext ? '#B45309' : 'var(--on-surface-variant)'
                        }}
                      >
                        {item.tokenStr.slice(-3)}
                      </div>
                      <span className="label">
                        {item.isCurrent ? '● Current' : item.isYours ? '★ You' : item.isNext ? '→ Next' : ''}
                      </span>
                    </div>
                    {i < generateQueue().length - 1 && <span className="queue-arrow">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Appointment Details ---- */}
            <div className="card card-elevated" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>📋 Appointment Details</h4>
              {[
                { label: 'Hospital', value: selectedAppointment.hospitalName },
                { label: 'Doctor', value: selectedAppointment.doctorName },
                { label: 'Specialization', value: selectedAppointment.doctorSpecialization },
                { label: 'Date', value: new Date(selectedAppointment.date).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                { label: 'Time Slot', value: selectedAppointment.timeSlot }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < 4 ? '1px solid var(--surface-container)' : 'none'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
