import { useState, useEffect } from 'react'
import { bidService } from '../../services/bidService'
import { productService } from '../../services/product.service'
import LoginRequestModal from '../common/LoginRequestModal'
import ToastNotification from '../common/ToastNotification'
import ConfirmDialog from '../common/ConfirmDialog'
import BiddingForm from './BiddingForm'
import BidRow from './BidRow'
import { formatPrice, maskName } from './productDetail.utils.jsx'

export default function BiddingSection({ product, minValidPrice, user, isRealSeller, isBannedUser, isNewbie, bidHistory, onRefresh }) {
    const [bidAmount, setBidAmount] = useState(minValidPrice || product.start_price)
    const [showHistory, setShowHistory] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showBidDialog, setShowBidDialog] = useState(false);
    const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);
    const [showBanDialog, setShowBanDialog] = useState(false);
    const [banTarget, setBanTarget] = useState(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const ITEMS_TO_SHOW = 5;

    const visibleBids = isExpanded ? bidHistory : bidHistory.slice(0, ITEMS_TO_SHOW);

    useEffect(() => {
        setBidAmount(minValidPrice > 0 ? minValidPrice : product.start_price);
    }, [minValidPrice, product.start_price]);

    // Ban user
    const handleBanUser = (bidderId, bidderName, is_banned) => {
        setBanTarget({ id: bidderId, name: maskName(bidderName), is_banned: is_banned });
        setShowBanDialog(true);
    };

    const executeBan = async () => {
        setShowBanDialog(false);

        if (!banTarget) return;

        try {
        if (banTarget.is_banned) {
            await productService.unbanBidder(product._id, banTarget.id);
        } else {
            await productService.banBidder(product._id, banTarget.id);
        }
        ToastNotification(`Đã cập nhật trạng thái cấm cho "${banTarget.name}"`, 'success');
        
        if(onRefresh) onRefresh(); 
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
            setBanTarget(null);
        }
    };

    const handleBid = async () => {
        if (!user) {
        setShowLoginModal(true);
        return
        }
        if (bidAmount < minValidPrice) {
        alert(`Giá đặt phải tối thiểu ₫${new Intl.NumberFormat('vi-VN').format(minValidPrice)}`)
        return
        }

        setShowBidDialog(true);
    }

    const executeBid = async () => {
        setShowBidDialog(false);
        
        try {
        const res = await bidService.placeBid(product._id, bidAmount)
        const message = res?.message || '';

        ToastNotification(message, res.outBid ? 'warning' : 'success');
        
        if(onRefresh) onRefresh();
        } catch(err) {
        const message = err?.response?.data?.message || "Có lỗi xảy ra!";
        ToastNotification(message, 'error');
        }
    }

    const handleBuyNowClick = async () => {
        if (!user) {
        setShowLoginModal(true);
        return
        }

        setShowBuyNowDialog(true);
    }

    const executeBuyNow = async () => {
        setShowBuyNowDialog(false);
        
        try {
        await productService.buyProductNow(product._id)
        ToastNotification(`Mua ngay thành công! Vui lòng chờ liên hệ từ người bán.`, 'success')
        
        if(onRefresh) onRefresh();
        } catch(err) {
        const message = err?.response?.data?.message || "Có lỗi xảy ra!";
        ToastNotification(message, 'error');
        }
    }

    return (
        <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold pb-2 border-b-2 border-blue-600 inline-block text-gray-800">💰 Đặt giá & Lịch sử đấu giá</h2>
            <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
            {showHistory ? 'Thu gọn lịch sử' : 'Xem lịch sử đấu giá'}
            </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <BiddingForm
                user={user}
                product={product}
                isRealSeller={isRealSeller}
                isBannedUser={isBannedUser}
                isNewbie={isNewbie}
                bidAmount={bidAmount}
                minValidPrice={minValidPrice}
                setBidAmount={setBidAmount}
                formatPrice={formatPrice}
                handleBidClick={handleBid}
                handleBuyNowClick={handleBuyNowClick}
            />
        </div>

        {showHistory && (
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">📜 Lịch sử đấu giá ({bidHistory.length} lượt)</h3>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {(bidHistory.length === 0) ? (
                    <div className="text-center py-8 text-gray-500">Chưa có lượt đấu giá nào</div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b"></th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Thời điểm</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Người đấu giá</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Giá vào sản phẩm</th>
                                {isRealSeller && (
                                    <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">Kiểm duyệt</th>
                                )}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleBids.map((bid, index) => (
                                <BidRow 
                                    key={bid._id || index}
                                    bid={bid}
                                    index={index}
                                    isRealSeller={isRealSeller}
                                    currentUserId={user?._id}
                                    onBanUser={handleBanUser}
                                    product={product}
                                />
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Nút Mở rộng / Thu gọn */}
                        {bidHistory.length > ITEMS_TO_SHOW && (
                            <div className="p-4 border-t bg-gray-50 flex justify-center">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-white hover:bg-blue-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow -md cursor-pointer"
                            >
                                {isExpanded ? (
                                <>
                                    <span>Thu gọn danh sách</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </>
                                ) : (
                                <>
                                    <span>Xem thêm {bidHistory.length - ITEMS_TO_SHOW} lượt đấu giá</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                                )}
                            </button>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
        )}
        {/* CÁC MODAL */}
        <LoginRequestModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

        {showBidDialog && (
            <ConfirmDialog 
            message={`Bạn có chắc chắn muốn đặt giá ₫${formatPrice(bidAmount)} cho sản phẩm này không?`}
            onYes={executeBid}
            onNo={() => setShowBidDialog(false)}
            />
        )}

        {showBuyNowDialog && (
            <ConfirmDialog 
            message={`Bạn có chắc chắn muốn MUA NGAY sản phẩm này với giá ₫${formatPrice(product.buy_it_now_price)} không?`}
            onYes={executeBuyNow}
            onNo={() => setShowBuyNowDialog(false)}
            />
        )}

        {showBanDialog && banTarget && (
            <ConfirmDialog 
            message={`XÁC NHẬN: Bạn có chắc chắn muốn ${banTarget.is_banned ? 'MỞ KHÓA' : 'CẤM'} người dùng "${banTarget.name}" tham gia đấu giá sản phẩm này? ${banTarget.is_banned ? 'Người này sẽ phải đặt lại giá từ đầu nếu muốn tiếp tục tham gia.' : 'Người này sẽ không thể đặt giá trong phiên đấu giá này, và các mức giá đã đặt sẽ bị hủy bỏ.'}`}
            onYes={executeBan}
            onNo={() => { setShowBanDialog(false); setBanTarget(null); }}
            />
        )}
        </div>
    );
}
