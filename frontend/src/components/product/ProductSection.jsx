import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service'
import LoginRequestModal from '../common/LoginRequestModal';
import { useAuth } from '../../context/AuthContext';
import ToastNotification from '../common/ToastNotification';

// Hàm mask tên
const maskName = (name) => {
  if (!name || typeof name !== 'string') return 'u***r'; 

  // Lọc bỏ phần trong ngoặc () và khoảng trắng thừa
  const cleanName = name.split('(')[0].trim();
  
  if (!cleanName) return 'u***r';

  const chars = Array.from(cleanName);
  const len = chars.length;

  if (len === 1) {
      return `${chars[0]}***${chars[0]}`;
  }

  // CÔNG THỨC EBAY: Ký tự đầu + *** + Ký tự cuối
  const first = chars[0];
  const last = chars[len - 1];
  const middleLength = Math.min(len - 2, 6); 
  const middle = "*".repeat(middleLength);
  
  return `${first}${middle}${last}`;
};

// Utility functions
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price);
};

const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) return 'Đã kết thúc';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  } else {
    return `${minutes} phút`;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function ProductSection({ title, products, loading = false }) {
  if (loading) {
    return (
      <div className="my-10">
        <h2 className="bg-blue-600 text-white w-fit rounded-full px-4 py-2 mb-5 font-bold shadow-md">
          🏷️ {title}
        </h2>
        <div className="text-center py-10 text-gray-500 italic">
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="my-10">
        <h2 className="bg-blue-600 text-white w-fit rounded-full px-4 py-2 mb-5 font-bold shadow-md">
          🏷️ {title}
        </h2>
        <div className="text-center py-10 text-gray-500 italic">
          Không có sản phẩm nào
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      {/* Tiêu đề section */}
      <h2 className="bg-blue-600 text-white w-fit rounded-full px-4 py-2 mb-5 font-bold shadow-md">
        🏷️ {title}
      </h2>

      {/* Vùng chứa các card - Sử dụng Grid để responsive tốt hơn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

// Component thẻ sản phẩm
export function ProductCard({ product }) {
  // State hỗ trợ nút yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modal yêu cầu đăng nhập
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { user } = useAuth();

  // Kiểm tra trạng thái yêu thích
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // Chỉ check nếu user đã đăng nhập và là bidder/seller
      if (user && user.role !== 'admin' && product._id) {
        try {
          const result = await productService.checkIsWatching(product._id);

          if (result && result.is_watching) {
            setIsFavorite(true);
          }

        } catch (error) {
          console.error("Lỗi check favorite:", error);
        }
      }
    };

    checkFavoriteStatus();
  }, [user, product._id]);

  // Hàm xử lý toggle yêu thích
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // --- Chưa đăng nhập ---
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (user.role === 'admin') {
      ToastNotification("Quản trị viên không thể theo dõi sản phẩm!", 'warning');
      return;
    }

    // --- Xử lý API ---
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      await productService.toggleWatchList(product._id);
      
      // Đảo ngược state UI
      setIsFavorite((prev) => !prev);
    } catch (error) {
      const message = error?.response?.data?.message || "Có lỗi xảy ra, thử lại sau!";
      ToastNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Component nút yêu thích
  function FavoriteButton({ isFavorite, isLoading, onClick }) {
    return (
      <button
        type="button"
        disabled={isLoading}
        onClick={onClick}
        title={isFavorite ? "Bỏ theo dõi" : "Theo dõi sản phẩm"}
        className="absolute top-3 left-3 z-20 p-2 rounded-full bg-white/70 hover:bg-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 group/btn"
      >
        <img
          src={isFavorite ? "/red_heart.png" : "/white_heart.png"}
          alt="Favorite Icon"
          className={`w-6 h-6 object-contain transition-transform duration-200 ${
            isFavorite ? 'scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'
          }`}
        />
      </button>
    );
  }
  
  const now = Date.now();
  const startTime = new Date(product.auction_start_time).getTime();
  const timeSinceStart = now - startTime;

  if (timeSinceStart >= 0 && timeSinceStart <= THIRTY_MINUTES_MS) {
    return (
      <div
        // 1. Container
        className="group relative bg-white border-2 border-orange-500 rounded-xl p-2 sm:p-3 text-center shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex flex-col pb-2 min-h-[420px] sm:min-h-[450px] lg:min-h-[500px]"
      >
        {/* 2. Badge */}
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg shadow-sm animate-pulse">
          MỚI ĐĂNG
        </div>

        <FavoriteButton 
          isFavorite={isFavorite} 
          isLoading={isLoading} 
          onClick={handleToggleFavorite} 
        />

        <div className="relative overflow-hidden rounded-lg h-[150px] sm:h-[180px] lg:h-[200px] group/image">
              <img
              src={product.thumbnail}
              alt={product.product_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
              }}
            />
            {/* Category Badge */}
            {product.category && (
              <Link
                to={`/category/${product.category.slug}`}
                className="absolute bottom-2 left-2 bg-orange-500 hover:bg-white text-white hover:text-orange-600 text-xs font-semibold px-2 py-1 rounded-md shadow-sm transition-all duration-200 z-10"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Category: ${product.category.category_name}`}
              >
                📁 {product.category.category_name}
              </Link>
            )}
        </div>

        <div className="flex flex-col flex-1 pt-2 sm:pt-3">
          <h3 className="text-orange-900 text-base sm:text-lg font-semibold truncate min-h-[3rem] sm:min-h-10 group-hover:text-orange-600 transition-colors">
            {product.product_name}
          </h3>

          {/* Thông tin sản phẩm */}
          <ProductInfo product={product} />

          <div className="mt-auto pt-2">
            <Link
              to={`/product/${product._id}`}
              className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02]"
            >
              Xem ngay
            </Link>
          </div>
        </div>

        <LoginRequestModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          productName={product.product_name}
        />

      </div>
    );
  } else {
    return (
      <div
        // 1. Container
        className="group relative bg-white border-2 border-blue-500 rounded-xl p-2 sm:p-3 text-center shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex flex-col pb-2 min-h-[420px] sm:min-h-[450px] lg:min-h-[500px]"
      >
        <div className="relative overflow-hidden rounded-lg h-[150px] sm:h-[180px] lg:h-[200px] group/image">
             <img
              src={product.thumbnail}
              alt={product.product_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
              }}
            />
            {/* Category Badge */}
            {product.category && (
              <Link
                to={`/category/${product.category.slug}`}
                className="absolute bottom-2 left-2 bg-blue-500 hover:bg-white text-white hover:text-blue-600 text-xs font-semibold px-2 py-1 rounded-md shadow-sm transition-all duration-200 z-10"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Category: ${product.category.category_name}`}
              >
                📁 {product.category.category_name}
              </Link>
            )}
        </div>

        <FavoriteButton 
          isFavorite={isFavorite} 
          isLoading={isLoading} 
          onClick={handleToggleFavorite} 
        />
          
        <div className="flex flex-col flex-1 pt-2 sm:pt-3">
          <h3 className="text-blue-900 text-base sm:text-lg font-semibold truncate min-h-[3rem] sm:min-h-10 group-hover:text-blue-600 transition-colors">
            {product.product_name}
          </h3>
          
          {/* Thông tin sản phẩm */}
          <ProductInfo product={product} user={user} />
          
          <div className="mt-auto pt-2">
            <Link
              to={`/product/${product._id}`}
              className="block w-full bg-blue-400 hover:bg-blue-600 text-white font-bold text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>

        <LoginRequestModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          productName={product.product_name}
        />

      </div>
    );
  }
}

// Component hiển thị thông tin sản phẩm
function ProductInfo({ product, user }) {
  const timeLeft = getTimeRemaining(product.auction_end_time);
  const now = Date.now();
  const startTime = new Date(product.auction_start_time || product.createdAt).getTime();
  const isNew = (now - startTime) <= THIRTY_MINUTES_MS;

  // Check giá mua ngay
  const hasBuyNow = product.buy_it_now_price && product.buy_it_now_price > 0;

  return (
    <div className="flex flex-col h-full justify-between pt-2">
      
      {/* GIÁ & BID */}
      <div className="flex justify-between items-end mb-1">
        {!product.current_highest_bidder ? (
          <div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Giá khởi điểm</p>
            <span className="text-lg sm:text-xl font-bold text-red-600 leading-none">
              {formatPrice(product.current_highest_price || product.start_price)}₫
            </span>
          </div>
        ) : (
          <div>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium">Giá hiện tại</p>
            <span className="text-lg sm:text-xl font-bold text-red-600 leading-none">
              {formatPrice(product.current_highest_price || product.start_price)}₫
            </span>
          </div>
        )}
        
        {/* SỐ LƯỢT BID */}
        <div className="flex items-center text-[11px] sm:text-[13px] text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-1 rounded-lg">
          <span className="mr-1">Số lượt đấu giá</span>
          <b>{product.bid_count || 0}</b>
        </div>
      </div>

      {/* TRẠNG THÁI MUA NGAY */}
      <div className="mb-2">
         {hasBuyNow ? (
            <div className={`inline-flex items-center ${isNew ? 'bg-orange-50 border-red-400' : 'bg-blue-50 border-teal-400'} text-[11px] sm:text-[12px] px-1.5 sm:px-2 py-1 rounded border uppercase font-semibold`}>
              <span className={`${isNew ? 'text-red-600' : 'text-teal-600'} mr-1`}>
                Mua ngay: {formatPrice(product.buy_it_now_price)}₫
              </span>
            </div>
         ) : (
            <div className="inline-block bg-gray-100 text-gray-400 text-[11px] sm:text-[12px] px-1.5 sm:px-2 py-1 rounded border border-gray-200 uppercase tracking-wider font-medium">
              KHÔNG CÓ GIÁ MUA NGAY
            </div>
         )}
      </div>

      {/* BIDDER GIỮ GIÁ */}
      <div className="mb-1">
         {product.current_highest_bidder ? (
            <div className={`inline-flex items-center ${isNew ? 'bg-orange-50 border-red-400' : 'bg-blue-50 border-teal-400'} text-[11px] sm:text-[12px] px-1.5 sm:px-2 py-1 rounded border uppercase font-semibold`}>
              <span className={`${isNew ? 'text-red-600' : 'text-teal-600'} mr-1`}>
                {user?._id?.toString() === product.current_highest_bidder?._id?.toString() ? 'BẠN' : maskName(product.current_highest_bidder.full_name)}
              </span>
              <span className="text-gray-700">
                hiện đang giữ mức giá cao nhất
              </span>
            </div>
         ) : (
            <div className="inline-block bg-gray-100 text-gray-400 text-[11px] sm:text-[12px] px-1.5 sm:px-2 py-1 rounded border border-gray-200 uppercase tracking-wider font-medium">
              Phiên đấu giá hiện đang trống
            </div>
         )}
      </div>

      {/* THÔNG TIN PHỤ (GRID 2 CỘT) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-3 border-t border-gray-100 mt-2">
        
        {/* CỘT TRÁI: Người bán & Ngày đăng */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {/* Block Người bán */}
          <div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
              Người bán
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600 transition-colors" title={product.seller?.full_name}>
              {product.seller?.full_name || "Ẩn danh"}
            </p>
          </div>

          {/* Block Ngày đăng */}
          <div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
              Ngày đăng
            </p>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              {formatDate(product.auction_start_time || product.createdAt)}
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: Thời gian còn lại */}
        <div className="flex flex-col justify-center items-center">
          <div className={`flex flex-col items-center justify-center w-full h-full rounded-lg px-1.5 sm:px-2 ${isNew ? 'bg-orange-50' : 'bg-blue-50'}`}>
            <p className="text-center text-[12px] sm:text-[14px] font-semibold text-gray-500 mb-1">
              Thời gian còn lại
            </p>
            <p className={`text-base sm:text-lg font-bold leading-none whitespace-nowrap ${isNew ? 'text-orange-600' : 'text-blue-600'}`}>
              {timeLeft}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}