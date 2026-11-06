import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 🌟 CODE SPLITTING (Route-level Lazy Loading):
// Setiap halaman dipisah menjadi chunk terpisah menggunakan React.lazy & Suspense.
// Pengunjung hanya mengunduh kode untuk halaman yang sedang mereka buka.
// Tampilan dan alur navigasi UI/UX tetap 100% sama.
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
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

export default function App() {
  const [loadChat, setLoadChat] = useState(false);

  useEffect(() => {
    // 🌟 PERFORMANCE: Tunda inisialisasi AI Chat widget agar tidak menghambat critical rendering path
    const timer = setTimeout(() => {
      setLoadChat(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        {loadChat && (
          <Suspense fallback={null}>
            <FloatingAIChat />
          </Suspense>
        )}
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#181212' }} />}>
          <Routes>
            {/* === LANDING PAGE (Publik) === */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            {/* === ADMIN === */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected — harus login */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/:id" element={<ReservationDetailPage />} />
              <Route path="menu-management" element={<MenuManagementPage />} />
              <Route path="gallery" element={<MenuManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
