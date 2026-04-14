import { useState, useEffect } from 'react';
import { getCurrentUser, getHealthRecords, saveHealthRecords } from '../utils/storage';

export default function HealthRecords() {
  const user = getCurrentUser();

  // ---- State ----
  const [healthData, setHealthData] = useState({
    profile: { name: '', age: '', bloodGroup: '', phone: '', email: '' },
    records: []
  });
  const [activeTab, setActiveTab] = useState('history');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    hospital: '',
    doctor: '',
    diagnosis: '',
    symptoms: '',
    notes: ''
  });

  // ---- Load health records on mount ----
  useEffect(() => {
    if (user) {
      const data = getHealthRecords(user.username);
      // Pre-fill profile name from auth
      if (!data.profile.name && user.name) {
        data.profile.name = user.name;
      }
      setHealthData(data);
    }
  }, [user?.username]);

  // ---- Save profile updates ----
  const saveProfile = () => {
    saveHealthRecords(user.username, healthData);
    setEditingProfile(false);
  };

  // ---- Add new medical record ----
  const addRecord = () => {
    if (!newRecord.diagnosis.trim()) return;

    const record = {
      id: Date.now().toString(),
      ...newRecord,
      symptoms: newRecord.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...healthData,
      records: [record, ...healthData.records]
    };
    setHealthData(updated);
    saveHealthRecords(user.username, updated);
    setShowAddForm(false);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      hospital: '', doctor: '', diagnosis: '', symptoms: '', notes: ''
    });
  };

  // ---- Delete a record ----
  const deleteRecord = (recordId) => {
    const updated = {
      ...healthData,
      records: healthData.records.filter((r) => r.id !== recordId)
    };
    setHealthData(updated);
    saveHealthRecords(user.username, updated);
  };

  // ---- Auth guard ----
  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🔒</div>
            <h3>Please Login</h3>
            <p>You need to be logged in to access health records</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="health-records-page">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* ---- Page Header ---- */}
        <div className="page-header">
          <h1>My Digital Health Records</h1>
          <p>Your complete medical history in one place</p>
        </div>

        {/* ---- Patient Profile Card ---- */}
        <div className="card card-elevated" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>👤 Patient Profile</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)}
              id="edit-profile-btn"
            >
              {editingProfile ? '✓ Save' : '✏️ Edit'}
            </button>
          </div>

          <div className="grid-3" style={{ gap: '16px' }}>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'Enter name' },
              { key: 'age', label: 'Age', placeholder: 'Enter age' },
              { key: 'bloodGroup', label: 'Blood Group', placeholder: 'e.g., O+' },
              { key: 'phone', label: 'Phone', placeholder: 'Enter phone' },
              { key: 'email', label: 'Email', placeholder: 'Enter email' }
            ].map((field) => (
              <div key={field.key} className="form-group" style={{ margin: 0 }}>
                <label>{field.label}</label>
                {editingProfile ? (
                  <input
                    type="text"
                    className="form-input"
                    placeholder={field.placeholder}
                    value={healthData.profile[field.key]}
                    onChange={(e) => setHealthData({
                      ...healthData,
                      profile: { ...healthData.profile, [field.key]: e.target.value }
                    })}
                  />
                ) : (
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--surface-low)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    minHeight: '45px'
                  }}>
                    {healthData.profile[field.key] || '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---- Tabs ---- */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          background: 'var(--surface-lowest)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          width: 'fit-content'
        }}>
          {[
            { id: 'history', label: '📋 Medical History' },
            { id: 'medications', label: '💊 Medications' },
            { id: 'allergies', label: '⚠️ Allergies' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`portal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---- Medical History Tab ---- */}
        {activeTab === 'history' && (
          <div>
            {/* Add Record Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(!showAddForm)}
                id="add-record-btn"
              >
                {showAddForm ? '✕ Cancel' : '+ Add New Record'}
              </button>
            </div>

            {/* Add Record Form */}
            {showAddForm && (
              <div className="card card-elevated" style={{ marginBottom: '24px', padding: '28px' }}>
                <h4 style={{ marginBottom: '20px' }}>📝 Add Medical Record</h4>
                <div className="grid-2" style={{ gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Hospital</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hospital name"
                      value={newRecord.hospital}
                      onChange={(e) => setNewRecord({ ...newRecord, hospital: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Doctor</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Doctor name"
                      value={newRecord.doctor}
                      onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Diagnosis</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Diagnosis"
                      value={newRecord.diagnosis}
                      onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Symptoms (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., fever, headache, cough"
                    value={newRecord.symptoms}
                    onChange={(e) => setNewRecord({ ...newRecord, symptoms: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-input"
                    placeholder="Additional notes..."
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  />
                </div>
                <button className="btn btn-success" onClick={addRecord}>
                  ✓ Save Record
                </button>
              </div>
            )}

            {/* Records List */}
            {healthData.records.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {healthData.records.map((record) => (
                  <div key={record.id} className="card card-elevated" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4>{record.diagnosis}</h4>
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                          📅 {new Date(record.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                          {record.hospital && ` · 🏥 ${record.hospital}`}
                          {record.doctor && ` · 👨‍⚕️ ${record.doctor}`}
                        </p>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                        onClick={() => deleteRecord(record.id)}
                      >
                        Delete
                      </button>
                    </div>

                    {/* Symptoms Tags */}
                    {record.symptoms?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {record.symptoms.map((symptom, i) => (
                          <span key={i} className="badge badge-warning">{symptom}</span>
                        ))}
                      </div>
                    )}

                    {record.notes && (
                      <p style={{ fontSize: '0.85rem', background: 'var(--surface-low)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                        {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>No Medical Records</h3>
                <p>Add your first medical record to start building your health history</p>
              </div>
            )}
          </div>
        )}

        {/* ---- Medications Tab ---- */}
        {activeTab === 'medications' && (
          <div className="card card-elevated" style={{ padding: '32px' }}>
            <div className="empty-state">
              <div className="icon">💊</div>
              <h3>Medications Tracker</h3>
              <p>Track your current medications and dosages. Add records in Medical History to see medications here.</p>
            </div>
          </div>
        )}

        {/* ---- Allergies Tab ---- */}
        {activeTab === 'allergies' && (
          <div className="card card-elevated" style={{ padding: '32px' }}>
            <div className="empty-state">
              <div className="icon">⚠️</div>
              <h3>Allergies List</h3>
              <p>Document your allergies for healthcare providers. This ensures safe treatment during emergencies.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
