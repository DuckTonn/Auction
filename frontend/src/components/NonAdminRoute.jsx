import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import NotFound from '../pages/NotFound';

export default function NonAdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Chỉ cho phép bidder và seller, không cho phép admin
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <NotFound />;
  }

  return <Outlet />;
}
