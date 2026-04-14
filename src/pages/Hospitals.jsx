import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHospitals } from '../utils/storage';
import defaultHospitals from '../data/hospitals.json';

export default function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    const stored = getHospitals();
    const defaultIds = new Set(defaultHospitals.map((h) => h.id));
    const merged = [
      ...defaultHospitals,
      ...stored.filter((h) => !defaultIds.has(h.id))
    ];
    setHospitals(merged);
  }, []);

  const cities = [...new Set(hospitals.map((h) => h.city))].sort();

  const filtered = hospitals.filter((h) => {
    const matchesSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.specializations?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCity = !cityFilter || h.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div className="page-wrapper" id="hospitals-page">
      <div className="container">
        <div className="page-header">
          <h1>Find Hospitals & Clinics</h1>
          <p>Browse 500+ healthcare facilities across major Indian cities</p>
        </div>

        {/* ── Search & Filter ── */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search hospitals, cities, or specializations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '280px' }}
            id="hospital-search"
          />
          <select
            className="form-input"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{ width: '200px' }}
            id="city-filter"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> hospitals
        </p>

        {/* ── Hospital Cards ── */}
        <div className="grid-3">
          {filtered.map((hospital) => (
            <div key={hospital.id} className="hospital-card" id={`hospital-${hospital.id}`}>
              <div className="hospital-card-header">
                <h3>{hospital.name}</h3>
                <span className="city">📍 {hospital.city}</span>
              </div>

              <div className="hospital-card-body">
                <div className="meta">
                  <span className="rating" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem' }}>{renderStars(hospital.rating)}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{hospital.rating}</strong>
                  </span>
                  <span>👨‍⚕️ {hospital.doctors?.length || 0} Doctors</span>
                </div>

                {hospital.address && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {hospital.address}
                  </p>
                )}

                <div className="specializations">
                  {hospital.specializations?.slice(0, 4).map((spec, i) => (
                    <span key={i} className="badge badge-primary">{spec}</span>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/book-appointment', { state: { hospitalId: hospital.id } })}
                >
                  Book Appointment →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No hospitals found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
