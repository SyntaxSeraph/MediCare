import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addHospital, getCurrentUser } from '../../utils/storage';

export default function HospitalRegister() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // ---- Form State ----
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    specializations: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Hospital name is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const hospital = {
      id: `hosp_${Date.now()}`,
      name: form.name,
      city: form.city,
      address: form.address,
      phone: form.phone,
      rating: 4.0,
      specializations: form.specializations
        ? form.specializations.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      doctors: [],
      tokenCounter: 0,
      ownerId: user?.id || '',
      ownerUsername: user?.username || '',
      createdAt: new Date().toISOString()
    };

    addHospital(hospital);
    navigate('/hospital/dashboard');
  };

  return (
    <div className="page-wrapper" id="hospital-register-page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1>Register Your Hospital</h1>
          <p>Add your hospital or clinic to MediCare+ platform</p>
        </div>

        <div className="card card-elevated" style={{ padding: '36px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="hosp-name">Hospital / Clinic Name *</label>
              <input type="text" id="hosp-name" name="name" className="form-input"
                placeholder="e.g., Apollo Hospital" value={form.name} onChange={handleChange} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="hosp-city">City *</label>
                <select id="hosp-city" name="city" className="form-input" value={form.city} onChange={handleChange}>
                  <option value="">Select City</option>
                  {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="hosp-phone">Phone Number</label>
                <input type="tel" id="hosp-phone" name="phone" className="form-input"
                  placeholder="Contact number" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hosp-address">Full Address *</label>
              <textarea id="hosp-address" name="address" className="form-input"
                placeholder="Enter complete address" value={form.address} onChange={handleChange}
                style={{ minHeight: '80px' }} />
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="hosp-spec">Specializations (comma-separated)</label>
              <input type="text" id="hosp-spec" name="specializations" className="form-input"
                placeholder="e.g., Cardiology, Neurology, Pediatrics" value={form.specializations}
                onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              🏥 Register Hospital
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
