// frontend/src/pages/BiddingProducts.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bidService } from '../services/bidService';
import { useAuth } from '../context/AuthContext';
import ToastNotification from '../components/common/ToastNotification';

export default function BiddingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBiddingProducts();
  }, []);

  const fetchBiddingProducts = async () => {
    try {
      setLoading(true);
      const res = await bidService.getActiveBiddedProducts();
      if (res && res.data) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch bidding products:", error);
      ToastNotification("Không thể tải danh sách đấu giá.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper format ngày giờ
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
          Sản phẩm đang đấu giá
        </h1>
        <span className="text-gray-500 text-sm">
          Hiển thị {products.length} sản phẩm
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M槌19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bạn chưa tham gia đấu giá sản phẩm nào</h3>
          <p className="text-gray-500 mb-6">Hãy tìm kiếm sản phẩm và bắt đầu đặt giá ngay!</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isWinning = product.current_highest_bidder?._id === user?._id;
            
            return (
              <div key={product._id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border overflow-hidden flex flex-col ${isWinning ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'}`}>
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden group">
                  <Link to={`/product/${product._id}`}>
                    <img 
                      src={product.thumbnail || "https://via.placeholder.com/300"} 
                      alt={product.product_name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  
                  {/* Badge trạng thái đấu giá của User */}
                  <div className="absolute top-2 right-2">
                    {isWinning ? (
                      <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Đang dẫn đầu
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        Đã bị vượt
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-3">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-gray-900 font-semibold line-clamp-2 hover:text-blue-600 transition-colors h-[3rem]">
                        {product.product_name}
                      </h3>
                    </Link>
                  </div>

                  {/* Giá hiện tại */}
                  <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Giá hiện tại</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(product.current_highest_price)}
                    </p>
                  </div>

                  {/* Thông tin Bid của User (Theo yêu cầu docs) */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-xs text-gray-500">Giá max của bạn</p>
                      <p className="font-medium text-gray-900">
                         {formatCurrency(product.user_bid_info?.max_bid || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Số lần bid</p>
                      <p className="font-medium text-gray-900">
                        {product.user_bid_info?.bid_count || 0} lần
                      </p>
                    </div>
                  </div>

                  {/* Thời gian kết thúc */}
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Kết thúc:
                    </span>
                    <span className="font-medium text-gray-700">
                       {formatDateTime(product.auction_end_time)}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <Link 
                    to={`/product/${product._id}`}
                    className={`mt-4 w-full py-2 rounded-lg text-sm font-semibold text-center transition-colors border ${
                      isWinning 
                        ? 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                        : 'bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-md shadow-blue-900/10'
                    }`}
                  >
                    {isWinning ? 'Xem chi tiết' : 'Đặt giá ngay'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}