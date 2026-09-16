import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import ReservationPage from './pages/landing/ReservationPage';
import EventDetailPage from './pages/landing/EventDetailPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ReservationsPage from './pages/admin/ReservationsPage';
import ReservationDetailPage from './pages/admin/ReservationDetailPage';
import MenuManagementPage from './pages/admin/MenuManagementPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FloatingAIChat from './components/ui/FloatingAIChat';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: 'ease-out-cubic',
      offset: 60,
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <FloatingAIChat />
        <Routes>
          {/* === LANDING PAGE (Publik) === */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* === ADMIN === */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected — harus login */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="reservations/:id" element={<ReservationDetailPage />} />
            <Route path="menu-management" element={<MenuManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
