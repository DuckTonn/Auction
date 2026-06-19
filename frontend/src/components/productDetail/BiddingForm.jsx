import { Link } from 'react-router-dom'

const BlockingMessage = ({ title, message, type = 'blue' }) => {
    const styles = {
        blue: "text-blue-800 bg-blue-50 border-blue-100",
        red: "text-red-800 bg-red-50 border-red-100",
        yellow: "text-yellow-800 bg-yellow-50 border-yellow-100",
        green: "text-green-800 bg-green-50 border-green-100",
        gray: "text-gray-800 bg-gray-200 border-gray-300",
    };

    return (
        <div className={`flex flex-col items-center gap-4 p-4 rounded-lg border ${styles[type] || styles.blue}`}>
            <h3 className="font-bold text-2xl text-center">{title}</h3>
            <p className="text-sm opacity-90 text-center">{message}</p>
        </div>
    );
};

export default function BiddingForm({ 
    user, 
    product, 
    isRealSeller, 
    isBannedUser, 
    isNewbie, 
    bidAmount, 
    minValidPrice, 
    setBidAmount, 
    formatPrice,
    handleBidClick, 
    handleBuyNowClick 
}) {
    // Trường hợp 1: Sản phẩm đã kết thúc đấu giá
    if (new Date(product.auction_end_time) <= new Date() || product.auction_status !== 'active') {
        return <BlockingMessage 
        title="Phiên đấu giá đã kết thúc" 
        message="Rất tiếc, phiên đấu giá cho sản phẩm này đã kết thúc. Vui lòng kiểm tra lịch sử đấu giá để biết thêm chi tiết."
        type="green" 
        />;
    }

    // Trường hợp 2: Chưa đăng nhập
    if (!user) {
        return (
        <div className="text-center py-8">
            <p className="text-gray-600 mb-4 font-medium">Vui lòng đăng nhập để tham gia đấu giá sản phẩm này</p>
            <Link to="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md cursor-pointer">
                Đăng nhập ngay
            </button>
            </Link>
        </div>
        );
    }

    // Trường hợp 3: Là Admin
    if (user.role === 'admin') {
        return <BlockingMessage
        title="Quản trị viên không thể tham gia đấu giá"
        message="Quản trị viên không có quyền tham gia đấu giá sản phẩm."
        type="gray"
        />;
    }

    // Trường hợp 4: Là Seller (Chủ hàng)
    if (isRealSeller) {
        return <BlockingMessage 
        title="Bạn là chủ sở hữu sản phẩm này" 
        message="Bạn không thể đặt giá. Hãy theo dõi lịch sử đấu giá để quản lý các lượt ra giá."
        type="blue" 
        />;
    }

    // Trường hợp 5: Bị cấm (Banned)
    if (isBannedUser) {
        return <BlockingMessage 
        title="Bạn đã bị chặn đấu giá" 
        message="Người bán đã từ chối quyền tham gia đấu giá của bạn đối với sản phẩm này."
        type="red" 
        />;
    }

    // Trường hợp 6: Là Newbie
    if (isNewbie) {
        return <BlockingMessage 
        title="Giới hạn người tham gia" 
        message="Sản phẩm này không cho phép tài khoản mới (chưa có đánh giá) tham gia đấu giá."
        type="yellow" 
        />;
    }

    // Trường hợp 7: Có tỉ lệ đánh giá dưới 80%
    let ratingPercentage = ((user.rating_count + user.rating_score) / 2 / user.rating_count) * 100;
    ratingPercentage = Math.min(Math.max(ratingPercentage, 0), 100);
    if (user.rating_count > 0 && ratingPercentage < 80) {
        return <BlockingMessage 
        title="Giới hạn người tham gia"
        message="Sản phẩm này không cho phép tài khoản có tỉ lệ đánh giá dưới 80% tham gia đấu giá."
        type="yellow" 
        />;
    }

    // Trường hợp 8: Hợp lệ -> Hiển thị Form đặt giá
    return (
        <div className="mb-4">
        <label className="block mb-2 font-bold text-gray-700">Giá đặt của bạn (₫)</label>
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Phần Input nhập giá */}
            <div className="flex-1">
            <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={minValidPrice}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium text-gray-900"
            />
            <div className="text-sm text-gray-500 mt-2 ml-1">
                Giá đặt tối thiểu: <span className="font-semibold text-gray-700">₫{formatPrice(minValidPrice)}</span>
            </div>
            </div>

            {/* Nút Đặt giá */}
            <button
            onClick={handleBidClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors active:scale-95 whitespace-nowrap h-[54px] cursor-pointer"
            >
            Đặt giá ngay
            </button>

            {/* Nút Mua ngay */}
            {product.buy_it_now_price && (
            <button
                onClick={handleBuyNowClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors active:scale-95 whitespace-nowrap h-[54px] cursor-pointer"
            >
                Mua ngay
            </button>
            )}
        </div>
        </div>
    );
}
