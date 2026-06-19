import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ShieldBan, Clock } from 'lucide-react';

const AuctionStatusAlert = ({ product, user, orderId }) => {
  if (!product) return null;

  const { auction_status, current_highest_bidder, seller, _id, name } = product;
  
  // Xác định vai trò người dùng
  const isSeller = user && (user?._id === seller?._id || user?._id === seller);
  const isHighestBidder = user && current_highest_bidder && (user?._id === current_highest_bidder?._id || user?._id === current_highest_bidder);
  
  switch (auction_status) {
  // CASE I: Sản phẩm đã bán
  case 'sold':

    // Người dùng là Seller hoặc Winner
    if (isSeller || isHighestBidder) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4 flex flex-col items-center text-center gap-2">
          <div className="w-full">
            <h3 className="text-lg font-bold text-green-800">
              {isSeller ? 'Sản phẩm đã được bán thành công!' : 'Chúc mừng! Bạn đã thắng phiên đấu giá này.'}
            </h3>
            
            <p className="text-base text-green-700 mt-1 mb-3">
              Đơn hàng cho sản phẩm <strong>{name}</strong> đã được tạo.
            </p>
            
            <Link 
              to={`/orders/${orderId}`} 
              className="inline-flex items-center justify-center text-base font-medium text-white bg-green-600 hover:bg-green-700 py-2 px-6 rounded-md transition-colors shadow-sm"
            >
              Xem chi tiết đơn hàng
            </Link>
          </div>
        </div>
      );
    }
    
    // Người dùng là người ngoài
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 flex flex-col items-center text-center gap-3">
        <AlertCircle className="w-10 h-10 text-gray-500" />
        <span className="text-base font-medium text-gray-600">
          Phiên đấu giá này đã kết thúc và sản phẩm đã có chủ.
        </span>
      </div>
    );

  // CASE II: Sản phẩm bị hủy
  case 'cancelled':
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex flex-col items-center text-center gap-3">
        <ShieldBan className="w-10 h-10 text-red-500" />
        <div>
          <h3 className="text-base font-semibold text-red-800">Phiên đấu giá đã bị hủy</h3>
          <p className="text-base text-red-600">
            Sản phẩm này không còn khả dụng để đấu giá.
          </p>
        </div>
      </div>
    );

  // CASE III: Hết giờ không ai mua
  case 'ended':
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex flex-col items-center text-center gap-3">
        <Clock className="w-10 h-10 text-amber-500 mb-1" />
        <div>
          <h3 className="text-base font-semibold text-amber-800">Đã kết thúc</h3>
          <p className="text-base text-amber-700">
            Thời gian đấu giá đã hết và không có lượt đặt giá nào hợp lệ.
          </p>
        </div>
      </div>
    );

  // CASE IV: Sản phẩm còn active
  case 'active':
    if (isHighestBidder) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
          
          <div className="flex flex-col items-center text-center gap-2 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-blue-800">
                Bạn đang dẫn đầu!
              </h3>
              <p className="text-base text-blue-600 mt-1 mb-3">
                Giá bạn đặt hiện đang dẫn đầu. Hãy duy trì vị trí này cho đến khi phiên đấu giá kết thúc!
              </p>
              
              <div className="text-sm text-blue-600 font-medium bg-blue-100 inline-block px-4 py-1.5 rounded-full">
                Chúng tôi sẽ gửi thông báo ngay khi có người đặt giá cao hơn bạn.
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null; // Người khác xem active thì không hiện gì ở component này

  default:
    return null;
  }
};

export default AuctionStatusAlert;