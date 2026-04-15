/**
 * App.jsx - Main Application Component
 * Sets up React Router with all routes for Patient and Hospital portals
 * Patient routes use Navbar + Footer layout
 * Hospital routes use sidebar layout (no navbar/footer)
 */
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { getCurrentUser } from './utils/storage';

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
 * ProtectedRoute – redirects to login if no user is signed in
 */
function ProtectedRoute({ children, requiredRole }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

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
        {/* ---- Public Routes ---- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospitals" element={<Hospitals />} />

        {/* ---- Protected Patient Routes ---- */}
        <Route path="/book-appointment" element={
          <ProtectedRoute requiredRole="patient"><BookAppointment /></ProtectedRoute>
        } />
        <Route path="/token-status" element={
          <ProtectedRoute requiredRole="patient"><TokenStatus /></ProtectedRoute>
        } />
        <Route path="/health-records" element={
          <ProtectedRoute requiredRole="patient"><HealthRecords /></ProtectedRoute>
        } />
        <Route path="/my-appointments" element={
          <ProtectedRoute requiredRole="patient"><MyAppointments /></ProtectedRoute>
        } />

        {/* ---- Hospital Portal Routes ---- */}
        <Route path="/hospital/login" element={<HospitalLogin />} />
        <Route path="/hospital/register" element={
          <ProtectedRoute requiredRole="hospital"><HospitalRegister /></ProtectedRoute>
        } />
        <Route path="/hospital/dashboard" element={
          <ProtectedRoute requiredRole="hospital"><HospitalDashboard /></ProtectedRoute>
        } />
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
