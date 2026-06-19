import { useState, useEffect } from 'react';
import { upgradeRequestService } from '../../services/upgradeRequestService';
import { useDelayedAction } from '../../hooks/useDelayedAction';
import ToastNotification from '../common/ToastNotification';
import { Check, X, Undo2 } from 'lucide-react';
import LoadingIndicator from '../common/LoadingIndicator';

export default function UpgradeRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await upgradeRequestService.getPendingList();
      setRequests(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Polling 30s
    return () => clearInterval(interval);
  }, []);

  // Hàm thực thi API
  const executeDecision = async (id, status) => {
    try {
      await upgradeRequestService.updateRequestStatus(id, { status });
      ToastNotification(status === 'approved' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu', 'success');
      fetchData();
    } catch(error) {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra!';
      ToastNotification(message, 'error');
    }
  };

  const { pendingIds, triggerAction, cancelAction } = useDelayedAction(executeDecision);

  if (loading && requests.length === 0) return <LoadingIndicator />;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Yêu cầu nâng cấp</h2>
        <span className="text-sm text-gray-500">Tổng: {requests.length} yêu cầu</span>
      </div>

      {loading && requests.length === 0 ? (
        <LoadingIndicator />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b">Tên người dùng</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Ngày yêu cầu</th>
                <th className="p-4 border-b text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Không có yêu cầu nào đang chờ duyệt.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isPending = pendingIds.has(req._id);
                  return (
                    <tr 
                      key={req._id} 
                      className={`hover:bg-gray-50 transition-colors ${isPending ? 'bg-yellow-50' : ''}`}
                    >
                      <td className={`p-4 font-medium text-gray-900 ${isPending ? 'opacity-50' : ''}`}>
                        {req.bidder?.full_name || 'N/A'}
                      </td>
                      <td className={`p-4 text-gray-600 ${isPending ? 'opacity-50' : ''}`}>
                        {req.bidder?.email}
                      </td>
                      <td className={`p-4 text-gray-500 ${isPending ? 'opacity-50' : ''}`}>
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right">
                        {isPending ? (
                          <button 
                            onClick={() => cancelAction(req._id)} 
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-md text-xs font-medium transition-colors"
                          >
                            <Undo2 className="w-3 h-3" /> Hoàn tác (5s)
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {/* Nút Duyệt - Style giống UserManagement: Khôi phục */}
                            <button 
                              onClick={() => triggerAction(req._id, 'approved')}
                              className="font-medium px-3 py-1.5 rounded-md transition-colors text-xs border border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Duyệt
                            </button>

                            {/* Nút Từ chối - Style giống UserManagement: Vô hiệu hóa */}
                            <button 
                              onClick={() => triggerAction(req._id, 'rejected')}
                              className="font-medium px-3 py-1.5 rounded-md transition-colors text-xs border border-red-600 text-red-600 hover:bg-red-50 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
