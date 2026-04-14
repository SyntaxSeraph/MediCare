import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getHospitals,
  getCurrentUser,
  addAppointment,
  getNextTokenNumber,
  getAppointments
} from '../utils/storage';
import defaultHospitals from '../data/hospitals.json';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedHospitalId = searchParams.get('hospital');

  // ---- State ----
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [bookingResult, setBookingResult] = useState(null);

  // ---- Load hospitals on mount ----
  useEffect(() => {
    const stored = getHospitals();
    const defaultIds = new Set(defaultHospitals.map((h) => h.id));
    const userHospitals = stored.filter((h) => !defaultIds.has(h.id));
    const all = [...defaultHospitals, ...userHospitals];
    setHospitals(all);

    // Pre-select hospital from URL params
    if (preSelectedHospitalId) {
      setSelectedHospital(preSelectedHospitalId);
    }

    // Pre-fill patient name from auth
    const user = getCurrentUser();
    if (user) {
      setPatientName(user.name || '');
    }

    // Set default date to today
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, [preSelectedHospitalId]);

  // ---- Get selected objects ----
  const hospital = hospitals.find((h) => h.id === selectedHospital);
  const doctor = hospital?.doctors?.find((d) => d.id === selectedDoctor);

  // ---- Check if a slot is already booked ----
  const getBookedSlots = () => {
    const appointments = getAppointments();
    return appointments
      .filter((a) => a.hospitalId === selectedHospital && a.doctorId === selectedDoctor && a.date === selectedDate)
      .map((a) => a.timeSlot);
  };

  // ---- Validation ----
  const validateStep = () => {
    const errs = {};
    if (step === 1 && !selectedHospital) errs.hospital = 'Please select a hospital';
    if (step === 2) {
      if (!selectedDoctor) errs.doctor = 'Please select a doctor';
      if (!selectedSlot) errs.slot = 'Please select a time slot';
      if (!selectedDate) errs.date = 'Please select a date';
    }
    if (step === 3) {
      if (!patientName.trim()) errs.name = 'Patient name is required';
      if (!patientPhone.trim()) errs.phone = 'Phone number is required';
      if (patientPhone && !/^\d{10}$/.test(patientPhone)) errs.phone = 'Enter a valid 10-digit phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---- Navigate steps ----
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  // ---- Confirm Booking ----
  const confirmBooking = () => {
    if (!validateStep()) return;

    const user = getCurrentUser();
    const tokenNumber = getNextTokenNumber(selectedHospital);
    const tokenStr = `${hospital.id.toUpperCase().slice(0, 4)}${String(tokenNumber).padStart(3, '0')}`;

    // Create appointment record
    const appointment = {
      id: Date.now().toString(),
      hospitalId: selectedHospital,
      hospitalName: hospital.name,
      hospitalCity: hospital.city,
      doctorId: selectedDoctor,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      date: selectedDate,
      timeSlot: selectedSlot,
      patientName: patientName,
      patientPhone: patientPhone,
      userId: user?.id || 'guest',
      username: user?.username || 'guest',
      tokenNumber: tokenStr,
      tokenIndex: tokenNumber,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    addAppointment(appointment);
    setBookingResult(appointment);
    setStep(4);
  };

  // ---- Success Screen ----
  if (step === 4 && bookingResult) {
    return (
      <div className="page-wrapper" id="booking-success">
        <div className="container" style={{ maxWidth: '560px' }}>
          <div className="card card-elevated" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div className="success-icon">✓</div>
            <h2 style={{ marginBottom: '8px' }}>Appointment Booked!</h2>
            <p style={{ marginBottom: '24px' }}>Your appointment has been confirmed successfully</p>

            <div className="token-reveal" id="token-number">{bookingResult.tokenNumber}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--outline)', marginBottom: '32px' }}>
              Your Token Number
            </p>

            {/* Appointment Details */}
            <div style={{
              background: 'var(--surface-low)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              {[
                { label: 'Hospital', value: bookingResult.hospitalName },
                { label: 'Doctor', value: bookingResult.doctorName },
                { label: 'Specialization', value: bookingResult.doctorSpecialization },
                { label: 'Date', value: new Date(bookingResult.date).toLocaleDateString('en-IN', { dateStyle: 'long' }) },
                { label: 'Time Slot', value: bookingResult.timeSlot },
                { label: 'Patient', value: bookingResult.patientName }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: i < 5 ? '1px solid var(--surface-container)' : 'none'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/token-status')}>
                Track Token Status
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/my-appointments')}>
                View Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="book-appointment-page">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* ---- Page Header ---- */}
        <div className="page-header">
          <h1>Book Appointment</h1>
          <p>Select a hospital, choose your doctor, and get an instant token</p>
        </div>

        {/* ---- Step Indicator ---- */}
        <div className="steps" id="step-indicator">
          {[
            { num: 1, label: 'Select Hospital' },
            { num: 2, label: 'Choose Doctor' },
            { num: 3, label: 'Confirm Booking' }
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={`step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
                <div className="step-number">{step > s.num ? '✓' : s.num}</div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < 2 && <div className={`step-line ${step > s.num ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>

        {/* ---- Step Content ---- */}
        <div className="card card-elevated" style={{ padding: '32px' }}>
          {/* ---- Step 1: Select Hospital ---- */}
          {step === 1 && (
            <div id="step-1">
              <h3 style={{ marginBottom: '20px' }}>Select a Hospital</h3>
              <div className="form-group">
                <label>Hospital / Clinic</label>
                <select
                  className="form-input"
                  value={selectedHospital}
                  onChange={(e) => {
                    setSelectedHospital(e.target.value);
                    setSelectedDoctor('');
                    setSelectedSlot('');
                  }}
                  id="hospital-select"
                >
                  <option value="">-- Choose a Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                  ))}
                </select>
                {errors.hospital && <div className="form-error">{errors.hospital}</div>}
              </div>

              {/* Show selected hospital details */}
              {hospital && (
                <div style={{
                  background: 'var(--surface-low)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  marginTop: '16px'
                }}>
                  <h4>{hospital.name}</h4>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0 8px' }}>
                    📍 {hospital.city} · ⭐ {hospital.rating} · 👨‍⚕️ {hospital.doctors?.length || 0} Doctors
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {hospital.specializations.map((s, i) => (
                      <span key={i} className="badge badge-primary">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={nextStep}>Next: Choose Doctor →</button>
              </div>
            </div>
          )}

          {/* ---- Step 2: Choose Doctor & Time ---- */}
          {step === 2 && (
            <div id="step-2">
              <h3 style={{ marginBottom: '20px' }}>
                Choose Doctor at {hospital?.name}
              </h3>

              {/* Date selector */}
              <div className="form-group">
                <label>Appointment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  id="date-select"
                />
                {errors.date && <div className="form-error">{errors.date}</div>}
              </div>

              {errors.doctor && <div className="form-error" style={{ marginBottom: '16px' }}>{errors.doctor}</div>}

              {/* Doctor Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {hospital?.doctors?.map((doc) => {
                  const isSelected = selectedDoctor === doc.id;
                  const bookedSlots = selectedDate ? getBookedSlots() : [];

                  return (
                    <div
                      key={doc.id}
                      className="card"
                      style={{
                        border: isSelected ? '2px solid var(--primary-container)' : '2px solid transparent',
                        background: isSelected ? 'var(--primary-fixed)' : 'var(--surface-low)',
                        cursor: 'pointer',
                        padding: '20px'
                      }}
                      onClick={() => {
                        setSelectedDoctor(doc.id);
                        setSelectedSlot('');
                      }}
                      id={`doctor-${doc.id}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <h4>{doc.name}</h4>
                          <span className="badge badge-primary" style={{ marginTop: '4px' }}>{doc.specialization}</span>
                        </div>
                        {isSelected && (
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--primary-container)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700
                          }}>✓</div>
                        )}
                      </div>

                      {/* Time Slots */}
                      {isSelected && (
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
                            Available Time Slots:
                          </p>
                          <div className="time-slots">
                            {doc.timeSlots.map((slot) => {
                              const isBooked = bookedSlots.includes(slot);
                              return (
                                <button
                                  key={slot}
                                  className={`time-slot ${selectedSlot === slot ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isBooked) setSelectedSlot(slot);
                                  }}
                                  disabled={isBooked}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          {errors.slot && <div className="form-error" style={{ marginTop: '8px' }}>{errors.slot}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                <button className="btn btn-primary" onClick={nextStep}>Next: Confirm →</button>
              </div>
            </div>
          )}

          {/* ---- Step 3: Confirm Booking ---- */}
          {step === 3 && (
            <div id="step-3">
              <h3 style={{ marginBottom: '20px' }}>Confirm Your Booking</h3>

              {/* Booking Summary */}
              <div style={{
                background: 'var(--surface-low)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h4 style={{ marginBottom: '16px' }}>📋 Booking Summary</h4>
                {[
                  { label: 'Hospital', value: hospital?.name },
                  { label: 'City', value: hospital?.city },
                  { label: 'Doctor', value: doctor?.name },
                  { label: 'Specialization', value: doctor?.specialization },
                  { label: 'Date', value: selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '' },
                  { label: 'Time Slot', value: selectedSlot }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < 5 ? '1px solid var(--surface-container)' : 'none'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--outline)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Patient Details */}
              <h4 style={{ marginBottom: '16px' }}>👤 Patient Details</h4>
              <div className="form-group">
                <label htmlFor="patientName">Full Name</label>
                <input
                  type="text"
                  id="patientName"
                  className="form-input"
                  placeholder="Enter patient full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="patientPhone">Phone Number</label>
                <input
                  type="tel"
                  id="patientPhone"
                  className="form-input"
                  placeholder="Enter 10-digit phone number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  maxLength={10}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                <button className="btn btn-success" onClick={confirmBooking} id="confirm-booking-btn">
                  ✓ Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
