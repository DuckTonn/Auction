import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/product.service'
import LoginRequestModal from '../common/LoginRequestModal'
import ToastNotification from '../common/ToastNotification'
import ConfirmDialog from '../common/ConfirmDialog'
import AuctionCountdown from './AuctionCountdown'
import { calculateRatingRatio, maskName, avatar, formatPrice, formatDate, isEndingSoon, isAuctionActive } from './productDetail.utils.jsx'

export default function ProductInfo({ product, minValidPrice, lastBid, user, isRealSeller }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Helper function to format rating display
    const formatRating = (ratingScore, ratingCount) => {
        if (!ratingCount || ratingCount === 0) {
            return 'Chưa có đánh giá';
        }
        const ratio = calculateRatingRatio(ratingScore, ratingCount);
        return (
            <>
                ⭐ {ratio}%
                <span className="text-gray-400 ml-1 group-hover:text-purple-600 transition-colors">({ratingCount} đánh giá)</span>
            </>
        );
    };

    useEffect(() => {
        const checkFavoriteStatus = async () => {
        if (user && product._id) {
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

    const handleToggleFavorite = async () => {
        if (!user) {
        setShowLoginModal(true);
        return;
        }
        if (isLoading) return;
        try {
        setIsLoading(true);
        await productService.toggleWatchList(product._id);
        setIsFavorite((prev) => !prev);
        } catch (error) {
        const message = error?.response?.data?.message || "Có lỗi xảy ra!";
        ToastNotification(message, 'error');
        } finally {
        setIsLoading(false);
        }
    };

    const handleCancelAuction = () => {
        setShowConfirmDialog(true);
    };

    const confirmCancelAuction = async () => {
        try {
            setIsCancelling(true);
            setShowConfirmDialog(false);
            await productService.cancelProduct(product._id);
            ToastNotification('Đã hủy đấu giá thành công', 'success');
            // Reload trang để cập nhật trạng thái
            window.location.reload();
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi khi hủy đấu giá!";
            ToastNotification(message, 'error');
        } finally {
            setIsCancelling(false);
        }
    };

    const FavoriteButton = () => (
        <button
            type="button"
            disabled={isLoading}
            onClick={handleToggleFavorite}
            title="Yêu thích sản phẩm"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 cursor-pointer"
            style={{
                backgroundColor: isFavorite ? '#FEE2E2' : '#F3F4F6',
                borderColor: isFavorite ? '#FCA5A5' : '#D1D5DB',
                color: isFavorite ? '#DC2626' : '#4B5563'
        }}
        >
        <img src={isFavorite ? "/red_heart.png" : "/white_heart.png"} alt="Icon" className="w-5 h-5 object-contain" />
        <span className="font-semibold">Theo dõi</span>
        </button>
    );

    const isAdmin = user && user.role === 'admin';

    return (
        <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm h-fit">
            {/* Tên sản phẩm & Trạng thái đấu giá & Yêu thích */}
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-blue-900 mb-4 leading-tight">{product.product_name}</h1>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${isAuctionActive(product) ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                    {isAuctionActive(product) ? '🟢 Đang đấu giá' : '🔴 Đã kết thúc'}
                </div>
                <div className="flex gap-2">
                    {!isRealSeller && !isAdmin && product.auction_status === 'active' && <FavoriteButton />}
                    {isRealSeller && product.auction_status === 'active' && (
                        <button
                            type="button"
                            disabled={isCancelling}
                            onClick={handleCancelAuction}
                            title="Hủy đấu giá"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                        >
                            <span>🚫</span>
                            <span>{isCancelling ? 'Đang hủy...' : 'Hủy đấu giá'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Giá hiện tại, Giá mua ngay, Giá đặt tối thiểu */}
            <div className="mb-5 pb-5 border-b border-gray-100">
                <div className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">
                    {product.bid_count === 0 || !product.current_highest_bidder ? 'Giá khởi điểm' : 'Giá hiện tại'}
                </div>
                <div className="text-3xl font-bold text-red-600">₫{formatPrice(product.current_highest_price || product.start_price)}</div>
            </div>

            {product.buy_it_now_price > 0 && (
                <div className="mb-5">
                <div className="text-sm text-gray-500 mb-1 font-medium">Giá mua ngay</div>
                <div className="text-xl font-bold text-blue-600">₫{formatPrice(product.buy_it_now_price)}</div>
                </div>
            )}

            {!isRealSeller && product.auction_status === 'active' && minValidPrice > 0 && (
                <div className="mb-5 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div>
                    <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
                        Giá đặt tối thiểu của bạn
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                        ₫{formatPrice(minValidPrice)}
                    </div>
                    </div>
                    {lastBid && lastBid > 0 && (
                    <div className="text-sm text-black">
                        (Lần đặt gần nhất của bạn: ₫{formatPrice(lastBid)})
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Thông tin bổ sung */}
            <div className={`p-4 rounded-lg mb-6 border ${isEndingSoon(product.auction_end_time) ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between mb-3 items-center">
                    <span className="text-gray-600">🔁 Số lượt ra giá:</span>
                    <span className="font-semibold text-gray-900">{product.bid_count || 0}</span>
                </div>

                <div className="flex justify-between mb-3 items-center">
                    <span className="text-gray-600">📈 Bước giá:</span>
                    <span className="font-semibold text-gray-900">₫{formatPrice(product.bid_increment)}</span>
                </div>

                <div className="flex justify-between mb-3 items-center">
                    <span className="text-gray-600">🔨 Số người ra giá:</span>
                    <span className="font-semibold text-gray-900">{product.bid_counts ? Object.keys(product.bid_counts).length : 0}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-600">🚫 Số người bị cấm:</span>
                    <span className="font-semibold text-gray-900">{product.banned_bidder ? product.banned_bidder.length : 0}</span>
                </div>
            </div>

            {/* Thông tin Người bán & Người giữ giá cao nhất */}
            <div className="mb-6 flex items-center gap-3">
                {avatar(product.seller?.full_name)}
                <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Người bán</div>
                    <div className="font-bold text-gray-900">{product.seller?.full_name || "Ẩn danh"}</div>
                    <Link 
                        to={`/users/${product.seller?._id}/ratings`}
                        className="text-xs text-yellow-500 flex items-center hover:text-purple-600 transition-colors group"
                    >
                        {product.seller && formatRating(product.seller.rating_score, product.seller.rating_count)}
                    </Link>
                </div>
            </div>

            {product.auction_status !== 'cancelled' && product.current_highest_bidder && (
                <div className="mb-6 flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                {avatar(product.current_highest_bidder.full_name)}
                <div>
                    <div className="text-xs text-yellow-700 uppercase font-bold mb-0.5">{product.auction_status === 'active' ? 'Người giữ giá cao nhất' : 'Người thắng đấu giá'}</div>
                    <div className="font-bold text-gray-900">
                        <span>{maskName(product.current_highest_bidder.full_name)}</span>
                        {user?._id.toString() === product.current_highest_bidder._id.toString() ? ' (Bạn)' : ''}
                    </div>
                    {isRealSeller ? (
                        <Link
                            to={`/users/${product.current_highest_bidder._id}/ratings`}
                            className="text-xs text-yellow-500 flex items-center hover:text-purple-600 transition-colors group"
                        >
                            {formatRating(product.current_highest_bidder.rating_score, product.current_highest_bidder.rating_count)}
                        </Link>
                    ) : (
                        <div className="text-xs text-yellow-500 flex items-center">
                            {formatRating(product.current_highest_bidder.rating_score, product.current_highest_bidder.rating_count)}
                        </div>
                    )}
                </div>
                </div>
            )}

            {/* Thời gian đấu giá & Modal yêu cầu đăng nhập */}
            <div className="border-t border-gray-100 pt-4 text-sm text-gray-600 space-y-2">
                <div className="flex justify-between"><span>Thời điểm đăng:</span><span className="font-medium text-gray-800">{formatDate(product.auction_start_time)}</span></div>
                <AuctionCountdown endTime={product.auction_end_time} formatDate={formatDate} />
            </div>
            <LoginRequestModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} productName={product.product_name} />
            {showConfirmDialog && (
                <ConfirmDialog
                    message="Bạn có chắc chắn muốn hủy đấu giá sản phẩm này? Hành động này không thể hoàn tác."
                    onYes={confirmCancelAuction}
                    onNo={() => setShowConfirmDialog(false)}
                />
            )}
        </div>
    )
}
