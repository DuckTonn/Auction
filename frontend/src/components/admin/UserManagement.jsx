import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import ToastNotification from '../common/ToastNotification';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingIndicator from '../common/LoadingIndicator';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const fetchData = async () => {
    try {
      const res = await userService.getUsers();
      
      // Xử lý dữ liệu linh hoạt dựa trên cấu trúc backend bạn vừa sửa
      // Bạn nói backend trả về: { data: users } -> res.data sẽ chứa mảng users
      let userList = [];
      if (res.data && Array.isArray(res.data)) {
        userList = res.data;
      } else if (Array.isArray(res)) {
        userList = res; // Fallback nếu trả về mảng trực tiếp
      }

      setUsers(userList);
      setLoading(false);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Polling 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = (user) => {
    const isDeleted = user.is_deleted; // Backend cần trả về field này
    const actionName = isDeleted ? 'Khôi phục' : 'Vô hiệu hóa';
    
    setConfirmDialog({
      isOpen: true,
      message: `Bạn có chắc chắn muốn ${actionName} tài khoản "${user.email}"?`,
      onConfirm: async () => {
        try {
          if (isDeleted) {
            await userService.restoreUser(user._id);
            ToastNotification('Khôi phục tài khoản thành công', 'success');
          } else {
            await userService.deleteUser(user._id);
            ToastNotification('Vô hiệu hóa tài khoản thành công', 'success');
          }
          // Gọi lại API ngay lập tức để cập nhật UI
          fetchData(); 
        } catch (error) {
          const msg = error.response?.data?.message || 'Có lỗi xảy ra';
          ToastNotification(msg, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleResetPassword = async (user) => {
    try {
      await userService.resetUserPassword(user._id);
      ToastNotification('Đã reset mật khẩu cho tài khoản', 'success');
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi reset mật khẩu';
      ToastNotification(msg, 'error');
    }
  };

  if (loading && users.length === 0) return <LoadingIndicator />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Người dùng</h2>
        <span className="text-sm text-gray-500">Tổng số: {users.length} tài khoản</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 border-b">Họ tên</th>
              <th className="p-4 border-b">Email</th>
              <th className="p-4 border-b">Vai trò</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className={`hover:bg-gray-50 transition-colors ${user.is_deleted ? 'bg-red-50/50' : ''}`}>
                  <td className="p-4 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                {user.full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                     </div>
                     <span className={`font-medium ${user.is_deleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {user.full_name || 'Chưa đặt tên'}
                     </span>
                  </td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.is_deleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'admin' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`font-medium px-3 py-1.5 rounded-md transition-colors text-xs border ${
                            user.is_deleted 
                              ? 'border-green-600 text-green-600 hover:bg-green-50' 
                              : 'border-red-600 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {user.is_deleted ? 'Khôi phục' : 'Vô hiệu hóa'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="font-medium px-3 py-1.5 rounded-md transition-colors text-xs border border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          Reset mật khẩu
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
               <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                     Không tìm thấy người dùng nào.
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDialog.isOpen && (
        <ConfirmDialog 
          message={confirmDialog.message}
          onYes={confirmDialog.onConfirm}
          onNo={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}