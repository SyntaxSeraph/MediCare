/**
 * main.jsx - Application Entry Point
 * Renders the React app and initializes dummy data in localStorage
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { getHospitals, saveHospitals } from './utils/storage';
import defaultHospitals from './data/hospitals.json';

// ---- Initialize dummy hospitals in localStorage if empty ----
const existingHospitals = getHospitals();
if (existingHospitals.length === 0) {
  saveHospitals(defaultHospitals);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
