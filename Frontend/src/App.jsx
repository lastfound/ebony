import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import { AuthProvider } from './context/AuthContext';

// 🌟 CODE SPLITTING (Lazy Loading):
// Memisahkan halaman Admin & Reservation dari bundle utama.
// Pengunjung landing page tidak perlu mengunduh seluruh kode Admin, Firebase, atau form reservasi!
const ReservationPage = lazy(() => import('./pages/landing/ReservationPage'));
const EventDetailPage = lazy(() => import('./pages/landing/EventDetailPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ReservationsPage = lazy(() => import('./pages/admin/ReservationsPage'));
const ReservationDetailPage = lazy(() => import('./pages/admin/ReservationDetailPage'));
const MenuManagementPage = lazy(() => import('./pages/admin/MenuManagementPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const FloatingAIChat = lazy(() => import('./components/ui/FloatingAIChat'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <FloatingAIChat />
        </Suspense>
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a1212' }} />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
