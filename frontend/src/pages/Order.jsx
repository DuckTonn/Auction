import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auctionResultService } from '../services/auctionResultService';
import { ratingService } from '../services/ratingService';
import ToastNotification from '../components/common/ToastNotification';
import ConfirmDialog from '../components/common/ConfirmDialog';
import OrderHeader from '../components/order/OrderHeader';
import OrderTabs from '../components/order/OrderTabs';
import OrderInfoTab from '../components/order/OrderInfoTab';
import PaymentTab from '../components/order/PaymentTab';
import ShippingTab from '../components/order/ShippingTab';
import RatingTab from '../components/order/RatingTab';
import Chat from '../components/chat/Chat';
import { Box } from 'lucide-react';

const Order = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [ratings, setRatings] = useState([]);
    
    // Action loading states
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [confirmingShipment, setConfirmingShipment] = useState(false);
    const [confirmingReceipt, setConfirmingReceipt] = useState(false);
    const [cancelingOrder, setCancelingOrder] = useState(false);
    
    // Confirmation modal state
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        fetchOrderDetails(true);
        fetchRatings();

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Polling mỗi 30 giây để cập nhật trạng thái đơn hàng và ratings
        const intervalId = setInterval(() => {
            fetchOrderDetails(false);
            fetchRatings();
        }, 30000);
        return () => clearInterval(intervalId);
    }, [orderId]);

    const fetchOrderDetails = async (loading) => {
        try {
            if (loading) setLoading(true);
            const response = await auctionResultService.getOrderDetails(orderId);
            setOrderData(response);
        } catch (error) {
            console.log("Lỗi khi lấy chi tiết đơn hàng:", error);
        } finally {
            if (loading) setLoading(false);
        }
    };

    // === Xử lý payment ===
    const handleSubmitPayment = async (shippingAddress, paymentProofFile) => {
        try {
            setSubmittingPayment(true);
            
            const formData = new FormData();
            formData.append('address', shippingAddress);
            formData.append('paymentProof', paymentProofFile);
            
            await auctionResultService.submitPayment(orderId, formData);
            
            ToastNotification('Gửi thông tin thanh toán thành công', 'success');
            await fetchOrderDetails();
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
            setSubmittingPayment(false);
        }
    };

    // === Xử lý shipping ===
    const handleConfirmShipment = async (shippingProofFile) => {
        try {
            setConfirmingShipment(true);
            
            const formData = new FormData();
            formData.append('shippingProof', shippingProofFile);
            
            await auctionResultService.confirmShipment(orderId, formData);
            
            ToastNotification('Xác nhận giao hàng thành công', 'success');
            await fetchOrderDetails();
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
            setConfirmingShipment(false);
        }
    };

    // === Xử lý receipt ===
    const handleConfirmReceipt = async () => {
        try {
            setConfirmingReceipt(true);
            await auctionResultService.confirmReceipt(orderId);
            
            ToastNotification('Xác nhận nhận hàng thành công', 'success');
            await fetchOrderDetails();
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
            setConfirmingReceipt(false);
        }
    };

    // === Hủy đơn hàng ===
    const handleCancelOrder = () => {
        setShowCancelConfirm(true);
    };

    const confirmCancelOrder = async () => {
        setShowCancelConfirm(false);
        
        try {
            setCancelingOrder(true);
            await auctionResultService.cancelTransaction(orderId);
            
            ToastNotification('Hủy đơn hàng thành công', 'success');
            await fetchOrderDetails();
        } catch (error) {
            const message = error?.response?.data?.message || "Có lỗi xảy ra!";
            ToastNotification(message, 'error');
        } finally {
            setCancelingOrder(false);
        }
    };
    // =====================================

    // === Xử lý rating ===
    const fetchRatings = async () => {
        try {
            const response = await ratingService.getRatingByAuctionResult(orderId);
            setRatings(response.data || []);
        } catch (error) {
            console.error('Lỗi khi tải đánh giá:', error);
        }
    };

    const handleCreateRating = async (rating_type, comment) => {
        try {
            const rated_user = isBuyer ? orderData.seller._id : orderData.winning_bidder._id;
            
            await ratingService.createRating(rated_user, orderId, rating_type, comment);
            
            ToastNotification('Đánh giá thành công!', 'success');
            
            // Refresh ratings data
            await fetchRatings();
        } catch (error) {
            console.error('Lỗi khi tạo đánh giá:', error);
            ToastNotification(error.response?.data?.message || 'Đã có lỗi xảy ra khi đánh giá. Vui lòng thử lại sau.', 'error');
        }
    };

    const handleChangeRating = async (ratingId, newType, newComment) => {
        try {
            await ratingService.changeRatingType(ratingId, newType, newComment);
            
            ToastNotification('Cập nhật đánh giá thành công!', 'success');
            
            // Refresh ratings data
            await fetchRatings();
        } catch (error) {
            console.error('Lỗi khi cập nhật đánh giá:', error);
            ToastNotification(error.response?.data?.message || 'Đã có lỗi xảy ra khi cập nhật đánh giá. Vui lòng thử lại sau.', 'error');
        }
    };
    // =====================================

    const isBuyer = user?._id === orderData?.winning_bidder?._id;
    const isSeller = user?._id === orderData?.seller?._id;
    const canCancel = isSeller && ['pending_payment', 'pending_shipment', 'shipping'].includes(orderData?.status);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-blue-100 rounded-lg shadow-lg p-12 max-w-md w-full text-center">
                    <div className="mb-6">
                        <Box className="w-24 h-24 mx-auto text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-10">Không tìm thấy đơn hàng</h2>
                    <div className="flex gap-3 justify-center">
                        <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                            Trang chủ
                        </a>
                        <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium cursor-pointer">
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <OrderHeader 
                    orderId={orderId}
                    status={orderData.status}
                    onBack={() => navigate(-1)}
                    canCancel={canCancel}
                    onCancel={handleCancelOrder}
                    canceling={cancelingOrder}
                />

                {/* Tabs */}
                <OrderTabs 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    {activeTab === 'info' && (
                        <OrderInfoTab orderData={orderData} />
                    )}

                    {activeTab === 'payment' && (
                        <PaymentTab 
                            orderData={orderData}
                            isBuyer={isBuyer}
                            onSubmitPayment={handleSubmitPayment}
                            submittingPayment={submittingPayment}
                            user={user}
                        />
                    )}

                    {activeTab === 'shipping' && (
                        <ShippingTab 
                            orderData={orderData}
                            isBuyer={isBuyer}
                            isSeller={isSeller}
                            onConfirmShipment={handleConfirmShipment}
                            onConfirmReceipt={handleConfirmReceipt}
                            confirmingShipment={confirmingShipment}
                            confirmingReceipt={confirmingReceipt}
                        />
                    )}

                    {activeTab === 'rating' && (
                        <RatingTab 
                            orderData={orderData}
                            isBuyer={isBuyer}
                            isSeller={isSeller}
                            user={user}
                            ratings={ratings}
                            onCreateRating={handleCreateRating}
                            onChangeRating={handleChangeRating}
                        />
                    )}
                </div>
                
                {/* Chat Component */}
                {orderData && (
                    <Chat 
                        resultId={orderData._id}
                        otherUser={isBuyer ? orderData.seller : orderData.winning_bidder}
                    />
                )}
                
                {/* Confirmation Modal */}
                {showCancelConfirm && (
                    <ConfirmDialog
                        message="Bạn có chắc chắn muốn hủy đơn hàng này? Việc hủy đơn hàng là không thể hoàn tác. Hệ thống sẽ tự động đánh giá '-1' cho người mua."
                        onYes={confirmCancelOrder}
                        onNo={() => setShowCancelConfirm(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Order;
