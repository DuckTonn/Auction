import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { configService } from '../../services/configService';
import ToastNotification from '../common/ToastNotification';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingIndicator from '../common/LoadingIndicator';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  // State cho tham số hệ thống
  const [systemParams, setSystemParams] = useState({
    extend_threshold_minutes: 0,
    extend_duration_minutes: 0
  });
  const [isEditingParams, setIsEditingParams] = useState(false);
  const [tempParams, setTempParams] = useState({
    extend_threshold_minutes: 0,
    extend_duration_minutes: 0
  });

  const fetchData = async () => {
    try {
      // Lấy tất cả sản phẩm (cần endpoint admin trả về list all, hoặc dùng getProducts chung)
      // Giả sử getProducts public trả về active, nếu cần admin list all status thì backend cần hỗ trợ
      // Tạm thời dùng getProducts với limit lớn hoặc logic admin
      const res = await productService.getProducts({ limit: 100 }); 
      setProducts(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  const fetchSystemParams = async () => {
    try {
      const res = await configService.getSystemParams();
      if (res.success) {
        setSystemParams(res.data);
        setTempParams(res.data);
      }
    } catch (error) {
      console.error("Fetch system params error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSystemParams();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelAuction = (product) => {
    setConfirmDialog({
      isOpen: true,
      message: `Bạn có chắc chắn muốn HỦY buổi đấu giá sản phẩm "${product.product_name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await productService.cancelProduct(product._id);
          ToastNotification('Đã hủy đấu giá sản phẩm thành công', 'success');
          fetchData();
        } catch(error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleEditParams = () => {
    setIsEditingParams(true);
    setTempParams({ ...systemParams });
  };

  const handleCancelEdit = () => {
    setIsEditingParams(false);
    setTempParams({ ...systemParams });
  };

  const handleSaveParams = async () => {
    // Validation: thời gian gia hạn phải >= ngưỡng gia hạn
    if (tempParams.extend_duration_minutes < tempParams.extend_threshold_minutes) {
      ToastNotification('Thời gian gia hạn phải lớn hơn hoặc bằng ngưỡng gia hạn', 'error');
      return;
    }

    try {
      const res = await configService.updateSystemParams(
        tempParams.extend_threshold_minutes,
        tempParams.extend_duration_minutes
      );
      if (res.success) {
        setSystemParams(res.data);
        setIsEditingParams(false);
        ToastNotification('Cập nhật tham số hệ thống thành công', 'success');
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật tham số!";
      ToastNotification(message, 'error');
    }
  };

  // Validation check
  const isValidParams = tempParams.extend_duration_minutes > tempParams.extend_threshold_minutes;

  // Helper format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && products.length === 0) return <LoadingIndicator />;

  return (
    <div className="space-y-6">
      {/* Phần Tham số hệ thống */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Tham số hệ thống</h2>
            <p className="text-sm text-gray-600">Cấu hình tham số đấu giá tự động gia hạn</p>
          </div>
          {!isEditingParams ? (
            <button
              onClick={handleEditParams}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSaveParams}
                disabled={!isValidParams}
                className={`px-6 py-2.5 font-medium rounded-lg transition-all duration-200 shadow-md flex items-center gap-2 ${
                  isValidParams 
                    ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 hover:shadow-lg cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Ngưỡng gia hạn (phút)
            </label>
            <input
              type="number"
              min="0"
              value={isEditingParams ? tempParams.extend_threshold_minutes : systemParams.extend_threshold_minutes}
              onChange={(e) => setTempParams({...tempParams, extend_threshold_minutes: Number(e.target.value)})}
              disabled={!isEditingParams}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed transition-all"
            />
            <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-blue-50 p-2 rounded border-l-4 border-blue-400">
              Nếu có bid trong thời gian này, phiên đấu giá sẽ tự động gia hạn
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Thời gian gia hạn (phút)
            </label>
            <input
              type="number"
              min="0"
              value={isEditingParams ? tempParams.extend_duration_minutes : systemParams.extend_duration_minutes}
              onChange={(e) => setTempParams({...tempParams, extend_duration_minutes: Number(e.target.value)})}
              disabled={!isEditingParams}
              className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed transition-all ${
                isEditingParams && !isValidParams 
                  ? 'border-red-400 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {isEditingParams && !isValidParams && (
              <p className="text-xs text-red-600 mt-2 leading-relaxed bg-red-50 p-2 rounded border-l-4 border-red-500 font-medium">
                ⚠️ Thời gian gia hạn phải lớn hơn ngưỡng gia hạn ({tempParams.extend_threshold_minutes} phút)
              </p>
            )}
            <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-indigo-50 p-2 rounded border-l-4 border-indigo-400">
              Số phút sẽ được cộng thêm vào thời gian kết thúc mỗi lần gia hạn
            </p>
          </div>
        </div>
      </div>

      {/* Phần Quản lý Sản phẩm */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quản lý Sản phẩm</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 border-b">Sản phẩm</th>
              <th className="p-4 border-b">Người bán</th>
              <th className="p-4 border-b">Giá hiện tại</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        <img src={product.thumbnail} alt="" className="w-10 h-10 object-cover rounded border border-gray-200"/>
                        <div>
                            <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.product_name}</p>
                            <p className="text-xs text-gray-500">ID: {product._id}</p>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-gray-600">
                    {product.seller?.full_name || 'Unknown'}
                </td>
                <td className="p-4 font-medium text-gray-900">
                    {formatCurrency(product.current_highest_price || product.start_price)}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${product.auction_status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${product.auction_status === 'ended' ? 'bg-gray-100 text-gray-800' : ''}
                    ${product.auction_status === 'failed' || product.auction_status === 'canceled' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {product.auction_status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {product.auction_status === 'active' && (
                    <button 
                      onClick={() => handleCancelAuction(product)}
                      className="text-red-600 hover:text-red-800 font-medium px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded transition"
                    >
                      Hủy đấu giá
                    </button>
                  )}
                </td>
              </tr>
            ))}
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
    </div>
  );
}