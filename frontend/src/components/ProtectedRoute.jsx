import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from 'react';
import ToastNotification from './common/ToastNotification';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  // kiểm tra nếu người dùng chưa đăng nhập
  if (!user) {
    // chuyển hướng đến trang đăng nhập
    // state: lưu đường dẫn hiện tại để quay lại sau khi đăng nhập thành công
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // đăng nhập nhưng sai role -> đẩy về home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    useEffect(() => {
      ToastNotification('Bạn không có quyền truy cập trang này', 'error');
    }, []);
    return <Navigate to ="/" replace />;
  }

  return children ? children : <Outlet />;
}
