import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// route chỉ dành cho khách
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  // đang trong quá trình xác thực
  if (loading) return <div>Loading auth...</div>;

  // nếu đã đăng nhập
  if (user) {
    if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
    else return <Navigate to="/" replace />;
  }

  // nếu chưa đăng nhập -> cho phép truy cập (render children hoặc Outlet)
  return children ? children : <Outlet />;
}