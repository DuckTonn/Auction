import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import ToastNotification from '../components/common/ToastNotification';
import { ProductCard } from '../components/product/ProductSection';
import Button from '../components/common/Button';

export default function WatchList() {
  const [watchList, setWatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho undo feature
  const [removingId, setRemovingId] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    fetchWatchList();

    // Cleanup timeout khi component unmount
    return () => {
      if (undoTimeout) {
        clearTimeout(undoTimeout);
      }
    };
  }, []);

  const fetchWatchList = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await productService.getWatchList();
      console.log('WatchList API Response:', response);

      // Xử lý response theo cấu trúc backend trả về
      const watchListItems = response.data || [];
      console.log('Số lượng item yêu thích:', watchListItems.length);
      setWatchList(watchListItems);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách yêu thích:', err);
      console.error('Error details:', err.response?.data);
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId) => {
    // Nếu đang remove item khác, hủy undo trước đó
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }

    // Tìm watchlist item cần xóa
    const itemToRemove = watchList.find(item => item.product?._id === productId);
    if (!itemToRemove) return;

    // Set state để hiển thị tô mờ và nút undo
    setRemovingId(productId);
    setItemToRemove(itemToRemove);
    setShowUndo(true);

    // Đếm ngược 5 giây trước khi thực sự xóa
    const timeout = setTimeout(async () => {
      await performRemove(productId);
      setShowUndo(false);
      setRemovingId(null);
      setItemToRemove(null);
    }, 5000);

    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }
    setShowUndo(false);
    setRemovingId(null);
    setItemToRemove(null);
  };

  const performRemove = async (productId) => {
    try {
      const result = await productService.toggleWatchList(productId);

      console.log('Toggle result:', result);

      if (result.action === 'removed' || result.message?.includes('xóa') || result.message?.includes('removed')) {
        // Cập nhật local state ngay lập tức
        setWatchList(prev => prev.filter(item => item.product?._id !== productId));
        ToastNotification(result.message || 'Đã xóa khỏi danh sách yêu thích', 'success');
      } else {
        // Nếu API trả về action: 'added' (đã thêm lại), vẫn fetch lại
        await fetchWatchList();
        ToastNotification(result.message || 'Đã cập nhật danh sách yêu thích', 'info');
      }
    } catch (err) {
      console.error('Lỗi khi xóa khỏi danh sách yêu thích:', err);
      console.error('Error details:', err.response?.data);

      const errorMsg = err.response?.data?.message || err.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.';

      // Xử lý trường hợp sản phẩm không tồn tại
      if (errorMsg.includes('không tồn tại') || errorMsg.includes('not exist')) {
        // Sản phẩm không tồn tại nữa, vẫn cần remove khỏi local state
        setWatchList(prev => prev.filter(item => item.product?._id !== productId));
        ToastNotification('Sản phẩm không còn tồn tại, đã xóa khỏi danh sách', 'info');
      } else if (errorMsg.includes('tự thêm')) {
        // Lỗi seller tự thêm sản phẩm của mình
        ToastNotification('Không thể thao tác với sản phẩm của chính mình', 'warning');
      } else {
        ToastNotification(errorMsg, 'error');
      }

      // Khôi phục trạng thái
      setRemovingId(null);
    }
  };

  const handleRemoveNow = async (productId) => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }
    setShowUndo(false);
    await performRemove(productId);
    setRemovingId(null);
    setItemToRemove(null);
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Calculate time remaining
  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return { minutes: 0, hours: 0, days: 0 };

    try {
      const end = new Date(endTime);
      const now = new Date();

      if (isNaN(end.getTime())) return { minutes: 0, hours: 0, days: 0 };

      const diffMs = end - now;
      if (diffMs <= 0) return { minutes: 0, hours: 0, days: 0 };

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return { minutes, hours, days };
    } catch {
      return { minutes: 0, hours: 0, days: 0 };
    }
  };

  // Lọc và transform data thành format phù hợp
  const productsForDisplay = watchList
    .filter(item => item.product && item.product.auction_status === 'active') // Chỉ lấy items có product
    .map(item => {
      const product = item.product;
      const timeRemaining = calculateTimeRemaining(product.auction_end_time);

      return {
        // Format data cho ProductCard
        id: product._id,
        _id: product._id,
        name: product.product_name,
        current_price: product.current_highest_price || product.start_price,
        start_price: product.start_price,
        formatted_price: formatCurrency(product.current_highest_price || product.start_price),
        end_time: product.auction_end_time,
        formatted_end_time: formatDate(product.auction_end_time),
        start_time: product.auction_start_time,
        formatted_start_time: formatDate(product.auction_start_time),
        time_remaining: timeRemaining,
        time_remaining_text: timeRemaining.days > 0
          ? `${timeRemaining.days} ngày`
          : timeRemaining.hours > 0
            ? `${timeRemaining.hours} giờ`
            : `${timeRemaining.minutes} phút`,
        images: product.thumbnail ? [product.thumbnail] : [],
        thumbnail: product.thumbnail,
        auction_status: product.auction_status,
        bid_count: product.bid_count || 0,
        formatted_bid_count: (product.bid_count || 0) + ' lượt',
        seller: product.seller,
        seller_name: product.seller?.full_name || 'Không xác định',
        // Thêm các field từ watchlist item nếu cần
        watchlist_id: item._id, // ID của watchlist item
        is_watching: true, // Đánh dấu đang trong watchlist
      };
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Đang tải danh sách yêu thích...</p>
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
            <span className="text-gray-700 font-bold">DANH SÁCH YÊU THÍCH</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
              Sản phẩm yêu thích của bạn
            </h2>
            <p className="text-gray-500 mt-2">
              {productsForDisplay.length > 0
                ? `Bạn có ${productsForDisplay.length} sản phẩm trong danh sách yêu thích`
                : watchList.length > 0
                  ? `Có ${watchList.length} item trong danh sách nhưng không có sản phẩm hợp lệ`
                  : 'Chưa có sản phẩm nào trong danh sách yêu thích'
              }
            </p>
          </div>
        </div>

        {/* Undo Notification */}
        {showUndo && itemToRemove?.product && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded overflow-hidden">
                  <img
                    src={itemToRemove.product.thumbnail || '/placeholder.jpg'}
                    alt={itemToRemove.product.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder.jpg' }}
                  />
                </div>
                <span className="text-slate-700 text-sm">
                  Đang xóa "<span className="font-semibold">{itemToRemove.product.product_name}</span>"...
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleUndo}
                >
                  Hoàn tác
                </Button>
                <Button
                  variant="danger"
                  size="xs"
                  onClick={() => handleRemoveNow(itemToRemove.product._id)}
                >
                  Xóa ngay
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Products Grid - Custom Display */}
        {productsForDisplay.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {productsForDisplay.map((product) => {
              const isRemoving = removingId === product.id;

              console.log('Product for display:', product); // Debug log

              return (
                <div
                  key={product.id}
                  className={`transition-all duration-300 ${isRemoving ? 'opacity-50' : ''}`}
                >
                  {/* Custom Product Card thay vì dùng ProductCard component */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                    {/* Product Image */}
                    <div className="relative h-40 overflow-hidden">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.thumbnail || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = '/placeholder.jpg' }}
                        />
                      </Link>
                      {/* Watchlist Badge */}
                      <div className="absolute top-2 right-2">
                        <div className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          Yêu thích
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-blue-600 truncate line-clamp-2 h-10 text-sm mb-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="mb-2">
                        <div className="text-xs text-gray-500">Giá hiện tại</div>
                        <div className="text-base font-bold text-red-600">
                          {product.formatted_price}
                        </div>
                      </div>

                      {/* Auction Info */}
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Lượt đấu:</span>
                          <span className="font-medium">{product.formatted_bid_count}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Người bán:</span>
                          <span className="font-medium truncate ml-1 max-w-[60%]">{product.seller_name}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Đăng lúc:</span>
                          <span className="font-medium">{product.formatted_start_time}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Còn lại:</span>
                          <span className="font-medium text-green-600 text-xs">
                            {product.time_remaining_text}
                          </span>
                        </div>
                      </div>

                      {/* Remove from favorites Button */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        disabled={isRemoving}
                        className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm font-medium flex items-center justify-center gap-1.5 border border-red-200"
                      >
                        {isRemoving ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xóa...
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xóa khỏi yêu thích
                          </>
                        )}
                      </button>
                    </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-xl mb-6">Danh sách yêu thích trống</p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy thêm nhiều sản phẩm hơn để theo dõi và không bỏ lỡ các cuộc đấu giá hấp dẫn!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}