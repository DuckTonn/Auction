import { Link } from 'react-router-dom'
import { calculateRatingRatio, avatar, maskName, formatDateTime, formatPrice } from './productDetail.utils.jsx'
import { Medal } from 'lucide-react';

// Helper function to format rating display
const formatRating = (ratingScore, ratingCount) => {
    if (!ratingCount || ratingCount === 0) {
        return 'Chưa có đánh giá';
    }
    const ratio = calculateRatingRatio(ratingScore, ratingCount);
    return (
        <>
            ⭐ {ratio}%
            <span className="text-gray-400 ml-1 group-hover/rating:text-purple-600 transition-colors">({ratingCount} đánh giá)</span>
        </>
    );
};

export default function BidRow({ bid, index, isRealSeller, currentUserId, onBanUser, product }) {
    let bidderName = bid.user?.full_name;
    if (!bid.is_valid && !isRealSeller) bidderName = undefined;
    
    const isUserMe = currentUserId === bid.user?._id?.toString();
    const isInvalid = !bid.is_valid;

    // Product is sold and having a winner
    const isTopRow = index === 0;
    const winnerExists = product.auction_status === 'sold' && product.current_highest_bidder?._id && isTopRow;

    const rowBgClass = isInvalid 
        ? 'bg-red-200 hover:bg-red-100' 
        : winnerExists ? 'bg-gradient-to-r from-yellow-100 to-amber-100 hover:from-yellow-50 hover:to-amber-50'
        : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100';

    return (
        <tr className={`group transition-colors ${rowBgClass}`}>
            {/* STT */}
            <td className="py-3 px-4 border-b w-8">
                <span className="text-gray-900 font-mono">{index + 1}</span>
            </td>

            {/* Thời gian */}
            <td className="py-3 px-4 border-b">
                <div className="font-medium text-gray-900">{formatDateTime(bid.date)}</div>
            </td>

            {/* Người đấu giá */}
            <td className="py-3 px-4 border-b">
                <div className="flex items-center gap-2">
                    {winnerExists && <Medal className="text-orange-500 w-8 h-8" />}
                    {avatar(bidderName, 8)}
                    <span className={`font-medium text-sm leading-tight ${isInvalid ? 'text-gray-500 line-through italic' : 'text-gray-800'}`}>
                        <span>{bidderName ? maskName(bidderName) : '********'}</span>
                        {isRealSeller && !isInvalid && (
                            <Link
                                to={`/users/${bid.user?._id}/ratings`}
                                className="text-xs text-yellow-500 flex items-center hover:text-purple-600 transition-colors group/rating">
                                {formatRating(bid.user?.rating_score, bid.user?.rating_count)}
                            </Link>
                        )}
                        {isUserMe && ' (Bạn)'}
                    </span>
                </div>
            </td>

            {/* Giá (Kèm Tooltip & Auto-bid badge) */}
            <td className="py-3 px-4 border-b relative">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-red-600 text-lg">
                        {isInvalid ? '********' : `₫${formatPrice(bid.price)}`}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {/* Badge Auto Bid */}
                        {!isInvalid && !bid.is_adjusted && bid.is_priority && (
                        <span className="group/scaled relative w-fit bg-orange-100 text-orange-700 text-[12px] font-semibold px-2 py-0.5 rounded-full border border-orange-200 flex items-center justify-center gap-1 select-none">
                            <span>Ưu thế</span>
                            <span>⚡</span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/scaled:block z-50 w-72 pointer-events-none">
                                <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-xl leading-relaxed opacity-95">
                                    <p>Người này được ưu tiên giữ thứ hạng cao hơn do đạt mức giá sớm hơn hoặc có giá đặt tối đa cao hơn.</p>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800 opacity-95"></div>
                            </div>
                        </span>
                        )}

                        {/* Badge Scaled Price */}
                        {!isInvalid && bid.is_adjusted && (
                        <span className="group/scaled relative w-fit bg-blue-100 text-blue-700 text-[12px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 flex items-center justify-center gap-1 select-none">
                            <span>Điều chỉnh giá</span>
                            <span>🔄</span>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/scaled:block z-50 w-72 pointer-events-none">
                                <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-xl leading-relaxed opacity-95">
                                    <p>Do có người đặt giá khác bị loại khỏi phiên đấu giá, giá của bid này đã được hệ thống tự động điều chỉnh để phù hợp với phiên đấu giá.</p>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800 opacity-95"></div>
                            </div>
                        </span>
                        )}
                    </div>
                </div>

                {/* Tooltip khi bị hủy */}
                {isInvalid && (
                <div className="absolute top-1/2 -translate-y-1/2 right-full mr-3 hidden group-hover:block z-50 w-80 pointer-events-none">
                    <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-xl text-center leading-relaxed opacity-95">
                        <p>Người dùng này đã bị loại khỏi phiên đấu giá.</p>
                        <p>Các mức giá được đặt từ người này đã bị hủy bỏ.</p>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[12px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800 mx-auto opacity-95"></div>
                </div>
                )}
            </td>

            {/* Kiểm duyệt (Seller only) */}
            {isRealSeller && (
                <td className="py-3 px-4 border-b text-center">
                    {(!bid.is_banned && isInvalid) || product.auction_status !== 'active' ? (
                        <span className="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 cursor-not-allowed select-none whitespace-nowrap">
                            Đã vô hiệu
                        </span>
                    ) : (
                        <button
                            onClick={() => onBanUser(bid.user?._id, bidderName, bid.is_banned)}
                            className={`${bid.is_banned ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-100 hover:bg-red-200 text-red-700'} p-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-1 mx-auto cursor-pointer z-10 relative`}
                            title="Kiểm duyệt người dùng"
                        >
                            {bid.is_banned ? 'Mở lại' : 'Từ chối'}
                        </button>
                    )}
                </td>
            )}
        </tr>
    );
}
