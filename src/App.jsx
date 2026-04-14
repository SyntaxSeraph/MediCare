/**
 * App.jsx - Main Application Component
 * Sets up React Router with all routes for Patient and Hospital portals
 * Patient routes use Navbar + Footer layout
 * Hospital routes use sidebar layout (no navbar/footer)
 */
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// ---- Layout Components ----
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ---- Patient Portal Pages ----
import Home from './pages/Home';
import Login from './pages/Login';
import Hospitals from './pages/Hospitals';
import BookAppointment from './pages/BookAppointment';
import TokenStatus from './pages/TokenStatus';
import HealthRecords from './pages/HealthRecords';
import MyAppointments from './pages/MyAppointments';

// ---- Hospital Portal Pages ----
import HospitalLogin from './pages/hospital/HospitalLogin';
import HospitalRegister from './pages/hospital/HospitalRegister';
import HospitalDashboard from './pages/hospital/HospitalDashboard';

/**
 * Layout wrapper that conditionally shows Navbar and Footer
 * Hospital dashboard and login pages have their own layout
 */
function AppLayout() {
  const location = useLocation();

  // Pages that should NOT show the main navbar/footer
  const isHospitalRoute = location.pathname.startsWith('/hospital/');
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {/* Show Navbar only for patient portal pages (not login or hospital) */}
      {!isHospitalRoute && !isLoginPage && <Navbar />}

      <Routes>
        {/* ---- Patient Portal Routes ---- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/token-status" element={<TokenStatus />} />
        <Route path="/health-records" element={<HealthRecords />} />
        <Route path="/my-appointments" element={<MyAppointments />} />

        {/* ---- Hospital Portal Routes ---- */}
        <Route path="/hospital/login" element={<HospitalLogin />} />
        <Route path="/hospital/register" element={<HospitalRegister />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      </Routes>

      {/* Show Footer only for patient pages (not login or hospital) */}
      {!isHospitalRoute && !isLoginPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
