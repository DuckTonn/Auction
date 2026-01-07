import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SellerWarning from '../pages/SellerWarning';

export default function SellerRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'seller') {
    return <SellerWarning />;
  }

  return <Outlet />;
}
