/**
 * Hospital Dashboard Page Component
 * Full hospital management panel with:
 * - Doctor management (add/view/delete)
 * - Token management system (update running token)
 * - View all appointments
 * - Real-time token sync via shared localStorage
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getHospitals,
  saveHospitals,
  getAppointments,
  getCurrentToken,
  updateCurrentToken,
  logoutUser
} from '../../utils/storage';
import defaultHospitals from '../../data/hospitals.json';

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // ---- State ----
  const [activeSection, setActiveSection] = useState('dashboard');
  const [hospital, setHospital] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [currentToken, setCurrentTokenState] = useState(0);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: '',
    timeSlots: ''
  });

  // ---- Load hospital data ----
  useEffect(() => {
    if (!user || user.role !== 'hospital') {
      navigate('/hospital/login');
      return;
    }

    // Find hospital owned by this user
    const storedHospitals = getHospitals();
    const defaultIds = new Set(defaultHospitals.map((h) => h.id));
    const allHospitals = [
      ...defaultHospitals,
      ...storedHospitals.filter((h) => !defaultIds.has(h.id))
    ];

    // Find user's hospital (by owner or first match)
    let userHospital = storedHospitals.find((h) => h.ownerUsername === user.username);
    if (!userHospital && allHospitals.length > 0) {
      // For demo, assign first hospital if none owned
      userHospital = allHospitals[0];
    }

    if (userHospital) {
      setHospital(userHospital);
      // Load appointments for this hospital
      const allAppts = getAppointments();
      const hospAppts = allAppts.filter((a) => a.hospitalId === userHospital.id);
      setAppointments(hospAppts);
      // Load current token
      const token = getCurrentToken(userHospital.id);
      setCurrentTokenState(token);
    }
  }, [user, navigate]);

  // ---- Poll for new appointments (simulated real-time) ----
  useEffect(() => {
    if (!hospital) return;
    const interval = setInterval(() => {
      const allAppts = getAppointments();
      const hospAppts = allAppts.filter((a) => a.hospitalId === hospital.id);
      setAppointments(hospAppts);
    }, 3000);
    return () => clearInterval(interval);
  }, [hospital]);

  // ---- Handle advancing token (shared via localStorage for patient portal sync) ----
  const advanceToken = () => {
    const newToken = currentToken + 1;
    setCurrentTokenState(newToken);
    updateCurrentToken(hospital.id, newToken);
  };

  // ---- Set token to specific value ----
  const setTokenTo = (value) => {
    setCurrentTokenState(value);
    updateCurrentToken(hospital.id, value);
  };

  // ---- Add Doctor ----
  const handleAddDoctor = () => {
    if (!doctorForm.name.trim() || !doctorForm.specialization.trim()) return;

    const newDoctor = {
      id: `doc_${Date.now()}`,
      name: doctorForm.name,
      specialization: doctorForm.specialization,
      timeSlots: doctorForm.timeSlots
        ? doctorForm.timeSlots.split(',').map((s) => s.trim()).filter(Boolean)
        : ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
    };

    const updatedHospital = {
      ...hospital,
      doctors: [...(hospital.doctors || []), newDoctor]
    };

    // Update in localStorage
    const allHospitals = getHospitals();
    const index = allHospitals.findIndex((h) => h.id === hospital.id);
    if (index >= 0) {
      allHospitals[index] = updatedHospital;
    } else {
      allHospitals.push(updatedHospital);
    }
    saveHospitals(allHospitals);
    setHospital(updatedHospital);
    setShowAddDoctor(false);
    setDoctorForm({ name: '', specialization: '', timeSlots: '' });
  };

  // ---- Delete Doctor ----
  const deleteDoctor = (doctorId) => {
    const updatedHospital = {
      ...hospital,
      doctors: hospital.doctors.filter((d) => d.id !== doctorId)
    };
    const allHospitals = getHospitals();
    const index = allHospitals.findIndex((h) => h.id === hospital.id);
    if (index >= 0) {
      allHospitals[index] = updatedHospital;
      saveHospitals(allHospitals);
    }
    setHospital(updatedHospital);
  };

  // ---- Logout ----
  const handleLogout = () => {
    logoutUser();
    navigate('/hospital/login');
  };

  if (!hospital) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🏥</div>
            <h3>No Hospital Found</h3>
            <p>Please register your hospital first</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/hospital/register')}>
              Register Hospital
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Today's Appointments ----
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const totalDoctors = hospital.doctors?.length || 0;
  const totalAppts = appointments.length;
  const waitingCount = todayAppts.filter((a) => a.tokenIndex > currentToken).length;

  return (
    <div className="hospital-layout" id="hospital-dashboard">
      {/* ---- Sidebar ---- */}
      <aside className="sidebar">
        <div className="sidebar-logo">🏥 MediCare+</div>
        <p style={{ fontSize: '0.8rem', color: 'var(--outline)', padding: '0 12px', marginBottom: '24px' }}>
          Hospital Portal
        </p>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'doctors', icon: '👨‍⚕️', label: 'Manage Doctors' },
            { id: 'tokens', icon: '🎫', label: 'Token Management' },
            { id: 'appointments', icon: '📅', label: 'Appointments' }
          ].map((item) => (
            <div
              key={item.id}
              className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* User Info and Logout */}
        <div style={{ borderTop: '1px solid var(--surface-container)', paddingTop: '16px' }}>
          <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--outline)' }}>
            👤 {user?.name || user?.username}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '8px' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <main className="main-content">
        {/* ---- Dashboard Overview ---- */}
        {activeSection === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Welcome, {hospital.name}</h2>
            <p style={{ marginBottom: '32px' }}>📍 {hospital.city} — Hospital Dashboard Overview</p>

            <div className="grid-4" style={{ marginBottom: '32px' }}>
              {[
                { value: totalDoctors, label: 'Total Doctors', color: 'var(--primary)', icon: '👨‍⚕️' },
                { value: todayAppts.length, label: "Today's Appointments", color: 'var(--secondary)', icon: '📅' },
                {
                  value: currentToken > 0
                    ? `${hospital.id.toUpperCase().slice(0, 4)}${String(currentToken).padStart(3, '0')}`
                    : '—',
                  label: 'Current Token', color: 'var(--success)', icon: '🎫'
                },
                { value: waitingCount, label: 'Patients Waiting', color: 'var(--tertiary)', icon: '⏳' }
              ].map((stat, i) => (
                <div key={i} className="stat-card card-elevated">
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
                  <div className="stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid-3">
              <button className="card card-hover" style={{ textAlign: 'center', cursor: 'pointer', padding: '32px' }}
                onClick={() => setActiveSection('doctors')}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👨‍⚕️</div>
                <h4>Manage Doctors</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Add or remove doctors</p>
              </button>
              <button className="card card-hover" style={{ textAlign: 'center', cursor: 'pointer', padding: '32px' }}
                onClick={() => setActiveSection('tokens')}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎫</div>
                <h4>Token Management</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Update running token</p>
              </button>
              <button className="card card-hover" style={{ textAlign: 'center', cursor: 'pointer', padding: '32px' }}
                onClick={() => setActiveSection('appointments')}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📅</div>
                <h4>View Appointments</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>See all bookings</p>
              </button>
            </div>
          </div>
        )}

        {/* ---- Manage Doctors ---- */}
        {activeSection === 'doctors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Manage Doctors</h2>
              <button className="btn btn-primary" onClick={() => setShowAddDoctor(!showAddDoctor)}>
                {showAddDoctor ? '✕ Cancel' : '+ Add Doctor'}
              </button>
            </div>

            {/* Add Doctor Form */}
            {showAddDoctor && (
              <div className="card card-elevated" style={{ marginBottom: '24px', padding: '28px' }}>
                <h4 style={{ marginBottom: '20px' }}>Add New Doctor</h4>
                <div className="grid-2" style={{ gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Doctor Name *</label>
                    <input type="text" className="form-input" placeholder="e.g., Dr. Rajesh Sharma"
                      value={doctorForm.name} onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Specialization *</label>
                    <select className="form-input" value={doctorForm.specialization}
                      onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}>
                      <option value="">Select Specialization</option>
                      {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine',
                        'Surgery', 'Dermatology', 'ENT', 'Oncology', 'Psychiatry', 'Ophthalmology',
                        'Dentistry', 'Gynecology', 'Urology', 'Gastroenterology'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Time Slots (comma-separated)</label>
                  <input type="text" className="form-input"
                    placeholder="e.g., 09:00 AM, 10:00 AM, 02:00 PM"
                    value={doctorForm.timeSlots}
                    onChange={(e) => setDoctorForm({ ...doctorForm, timeSlots: e.target.value })} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: '4px' }}>
                    Leave blank for default time slots
                  </p>
                </div>
                <button className="btn btn-success" onClick={handleAddDoctor}>
                  ✓ Add Doctor
                </button>
              </div>
            )}

            {/* Doctors Table */}
            {hospital.doctors?.length > 0 ? (
              <div className="table-wrapper card-elevated" style={{ borderRadius: 'var(--radius-lg)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialization</th>
                      <th>Time Slots</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hospital.doctors.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 600 }}>{doc.name}</td>
                        <td><span className="badge badge-primary">{doc.specialization}</span></td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {doc.timeSlots?.map((slot, i) => (
                              <span key={i} className="badge badge-outline" style={{ fontSize: '0.7rem' }}>{slot}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                            onClick={() => deleteDoctor(doc.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="icon">👨‍⚕️</div>
                <h3>No Doctors Added</h3>
                <p>Add doctors to start accepting appointments</p>
              </div>
            )}
          </div>
        )}

        {/* ---- Token Management ---- */}
        {activeSection === 'tokens' && (
          <div>
            <h2 style={{ marginBottom: '8px' }}>Token Management</h2>
            <p style={{ marginBottom: '32px' }}>Update the currently running token for patients</p>

            {/* Current Token Display */}
            <div className="card card-elevated" style={{ textAlign: 'center', padding: '48px', marginBottom: '32px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--outline)', marginBottom: '16px', fontWeight: 600 }}>
                Currently Serving Token
              </p>
              <div className="token-display current" style={{
                margin: '0 auto',
                width: '120px',
                height: '120px',
                fontSize: '1.5rem'
              }}>
                {currentToken > 0
                  ? `${hospital.id.toUpperCase().slice(0, 4)}${String(currentToken).padStart(3, '0')}`
                  : '—'}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
                <button className="btn btn-success btn-lg" onClick={advanceToken} id="next-token-btn">
                  ▶ Next Token
                </button>
                <button className="btn btn-secondary" onClick={() => setTokenTo(0)}>
                  ↺ Reset
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginTop: '16px' }}>
                🔄 Changes sync automatically to patient portal
              </p>
            </div>

            {/* Quick Set Token */}
            <div className="card card-elevated" style={{ padding: '24px', marginBottom: '32px' }}>
              <h4 style={{ marginBottom: '16px' }}>Quick Set Token</h4>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Token number"
                  min="0"
                  style={{ width: '160px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setTokenTo(parseInt(e.target.value) || 0);
                  }}
                  id="set-token-input"
                />
                <button className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    const input = document.getElementById('set-token-input');
                    setTokenTo(parseInt(input.value) || 0);
                  }}>
                  Set Token
                </button>
              </div>
            </div>

            {/* Today's Queue */}
            <div className="card card-elevated" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>Today's Queue ({todayAppts.length} patients)</h4>
              {todayAppts.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppts
                        .sort((a, b) => a.tokenIndex - b.tokenIndex)
                        .map((appt) => (
                          <tr key={appt.id} style={{
                            background: appt.tokenIndex === currentToken ? 'var(--success-light)' : 'transparent'
                          }}>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{appt.tokenNumber}</td>
                            <td>{appt.patientName}</td>
                            <td>{appt.doctorName}</td>
                            <td>{appt.timeSlot}</td>
                            <td>
                              <span className={`badge ${
                                appt.tokenIndex < currentToken ? 'badge-success' :
                                appt.tokenIndex === currentToken ? 'badge-warning' :
                                'badge-outline'
                              }`}>
                                {appt.tokenIndex < currentToken ? '✓ Done' :
                                 appt.tokenIndex === currentToken ? '● Current' :
                                 'Waiting'}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '32px' }}>
                  <p>No appointments for today</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- All Appointments ---- */}
        {activeSection === 'appointments' && (
          <div>
            <h2 style={{ marginBottom: '8px' }}>All Appointments</h2>
            <p style={{ marginBottom: '32px' }}>{appointments.length} total appointments</p>

            {appointments.length > 0 ? (
              <div className="table-wrapper card-elevated" style={{ borderRadius: 'var(--radius-lg)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((appt) => (
                        <tr key={appt.id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{appt.tokenNumber}</td>
                          <td>{appt.patientName}</td>
                          <td>{appt.doctorName}</td>
                          <td>{new Date(appt.date).toLocaleDateString('en-IN')}</td>
                          <td>{appt.timeSlot}</td>
                          <td>{appt.patientPhone}</td>
                          <td><span className="badge badge-success">✓ Confirmed</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="icon">📅</div>
                <h3>No Appointments Yet</h3>
                <p>Appointments will appear here when patients book</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
