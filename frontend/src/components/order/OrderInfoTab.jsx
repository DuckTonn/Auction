import { useNavigate } from 'react-router-dom';

const OrderInfoTab = ({ orderData }) => {
    const navigate = useNavigate();

    const InfoCard = ({ title, children, bgColor }) => (
        <div className={`${bgColor} rounded-xl p-6 shadow-md border border-gray-200`}>
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <div className="py-2">
            <span className="font-semibold text-gray-700">{label}:</span>
            <span className="ml-2 text-gray-600">{value}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Product Info */}
            <InfoCard 
                title="Sản phẩm" 
                bgColor={`bg-purple-100`}
            >
                <div className="flex items-start space-x-4 bg-white/60 backdrop-blur rounded-xl p-4 border border-purple-100">
                    <img
                        src={orderData.product.thumbnail}
                        alt={orderData.product.product_name}
                        className="w-28 h-28 object-cover rounded-lg shadow-md ring-2 ring-purple-100"
                    />
                    <div className="flex flex-col space-y-2">
                        <button 
                            className="font-semibold text-lg cursor-pointer text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => navigate(`/product/${orderData.product._id}`)}
                        >
                            {orderData.product.product_name}
                        </button>
                        <div className="mt-3 inline-block">
                            <div className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
                                {orderData.final_price?.toLocaleString('vi-VN')} ₫
                            </div>
                        </div>
                    </div>
                </div>
            </InfoCard>

            {/* Buyer */}
            <InfoCard 
                title="Người mua" 
                bgColor={`bg-blue-100`}
            >
                <div className="bg-white/60 backdrop-blur rounded-xl p-4 space-y-2 border border-blue-100">
                    <InfoRow label="Username" value={orderData.winning_bidder.full_name} />
                    <InfoRow label="Email" value={orderData.winning_bidder.email} />
                    <InfoRow 
                        label="Điểm đánh giá" 
                        value={
                            orderData.winning_bidder.rating_count !== 0 
                                ? `${orderData.winning_bidder.rating_score} ⭐ (${orderData.winning_bidder.rating_count} lượt đánh giá)` 
                                : 'Chưa có đánh giá'
                        } 
                    />
                </div>
            </InfoCard>

            {/* Seller */}
            <InfoCard 
                title="Người bán" 
                bgColor={`bg-green-100`}
            >
                <div className="bg-white/60 backdrop-blur rounded-xl p-4 space-y-2 border border-green-100">
                    <InfoRow label="Username" value={orderData.seller.full_name} />
                    <InfoRow label="Email" value={orderData.seller.email} />
                    <InfoRow 
                        label="Điểm đánh giá" 
                        value={
                            orderData.seller.rating_count !== 0 
                                ? `${orderData.seller.rating_score} ⭐ (${orderData.seller.rating_count} lượt đánh giá)`
                                : 'Chưa có đánh giá'
                        } 
                    />
                </div>
            </InfoCard>

            {/* Shipping Address */}
            {orderData.shipping_address && (
                <InfoCard 
                    title="Địa chỉ giao hàng" 
                    bgColor={`bg-amber-100`}
                >
                    <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-orange-100">
                        <p className="text-gray-700 leading-relaxed">{orderData.shipping_address}</p>
                    </div>
                </InfoCard>
            )}

            {/* Sản phẩm bị hủy */}
            {orderData.status === 'cancelled' && orderData.cancellation_reason && (
                <InfoCard 
                    title="Lý do hủy" 
                    bgColor={`bg-red-100`}
                >
                    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-red-900">
                                    Lý do hủy
                                </span>
                                <p className="text-base font-medium text-gray-700 mt-1">
                                    {orderData.cancellation_reason || "Không có lý do cụ thể"}
                                </p>
                            </div>

                            {orderData.cancelled_at && (
                                <div className="sm:text-right">
                                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-red-900">
                                        Thời gian hủy
                                    </span>
                                    <p className="font-mono text-base font-medium text-gray-700 mt-1">
                                        {new Date(orderData.cancelled_at).toLocaleString('vi-VN', {
                                            hour: '2-digit', minute: '2-digit',
                                            day: '2-digit', month: '2-digit', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </InfoCard>
            )}
        </div>
    );
};

export default OrderInfoTab;
