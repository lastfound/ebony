import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { admin } = useAuth();
  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
