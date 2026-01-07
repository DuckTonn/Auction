import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionResultService } from '../services/auctionResultService';
import ToastNotification from '../components/common/ToastNotification';

export default function WonProducts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    fetchWonProducts();
  }, []);

  const fetchWonProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await auctionResultService.getOrdersByWinner();
      console.log('Won Products API Response:', response);

      // Xử lý response theo cấu trúc backend trả về
      const wonOrders = response.data || [];
      console.log('Số lượng đơn hàng thắng:', wonOrders.length);
      setOrders(wonOrders);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm đã thắng:', err);
      console.error('Error details:', err.response?.data);
      setError('Không thể tải danh sách sản phẩm đã thắng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount).replace('₫', 'đ');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status text and color
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending_payment': { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      'pending_shipment': { text: 'Chờ vận chuyển', color: 'bg-blue-100 text-blue-800' },
      'shipping': { text: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
      'completed': { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Đang tải danh sách sản phẩm đã thắng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">TRANG CHỦ</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 font-bold">SẢN PHẨM ĐÃ THẮNG</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Sản phẩm đã thắng đấu giá
            </h2>
            <p className="text-gray-500 mt-2">
              {orders.length > 0
                ? `Bạn đã thắng ${orders.length} sản phẩm`
                : 'Bạn chưa thắng sản phẩm nào'
              }
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Link to={`/product/${order.product._id}`}>
                      <img
                        src={order.product.thumbnail || '/placeholder.jpg'}
                        alt={order.product.product_name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = '/placeholder.jpg' }}
                      />
                    </Link>
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="p-4">
                    <Link to={`/product/${order.product._id}`}>
                      <h3 className="font-semibold text-gray-800 hover:text-blue-600 line-clamp-2 h-10 text-base mb-2">
                        {order.product.product_name}
                      </h3>
                    </Link>

                    {/* Final Price */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-500">Giá thắng cuộc</div>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(order.final_price)}
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-500">Người bán</div>
                      <div className="text-sm font-medium text-gray-700">
                        {order.seller.full_name}
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-500">Ngày thắng</div>
                      <div className="text-sm text-gray-700">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/orders/${order._id}`}
                      className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                    >
                      Xem chi tiết đơn hàng
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 text-gray-500">
            <div className="w-24 h-24 mx-auto text-slate-300 mb-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl mb-6">Chưa có sản phẩm nào thắng</p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Bạn chưa thắng sản phẩm nào trong các cuộc đấu giá. Hãy tham gia đấu giá nhiều hơn để có cơ hội sở hữu những sản phẩm yêu thích!
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}