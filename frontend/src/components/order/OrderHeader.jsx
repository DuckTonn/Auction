import { CircleAlert } from "lucide-react";

const OrderHeader = ({ orderId, status, onBack, canCancel, onCancel, canceling }) => {
    const getStatusText = (status) => {
        const statusMap = {
            'pending_payment': 'Chờ thanh toán',
            'pending_shipment': 'Chờ giao hàng',
            'shipping': 'Đang giao hàng',
            'completed': 'Đã hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    };

    const getGuideText = (status) => {
        const nextMap = {
            'pending_payment': 'Người mua cần hoàn thành thanh toán ở trang thanh toán',
            'pending_shipment': 'Người bán cần xác nhận giao hàng ở trang vận chuyển',
            'shipping': 'Người mua cần xác nhận đã nhận hàng ở trang vận chuyển',
            'completed': 'Đánh giá người mua/người bán ở trang đánh giá',
            'cancelled': 'Sản phẩm sẽ được trả về kho của người bán, tiền (nếu có) sẽ được hoàn trả cho người mua'
        };
        return nextMap[status] || status;
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending_payment:  'bg-amber-50 text-amber-700 border-amber-200',
            pending_shipment: 'bg-blue-50 text-blue-700 border-blue-200',
            shipping:         'bg-purple-50 text-purple-700 border-purple-200',
            completed:        'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled:        'bg-red-50 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <div className="mb-8 font-sans">
            <button
                onClick={onBack}
                className="mb-4 flex items-center gap-2 text-base font-semibold text-blue-700 transition-colors hover:text-blue-500 cursor-pointer"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm ">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Chi tiết đơn hàng
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Mã đơn:</span>
                             <code className="bg-blue-50 px-3 py-1 rounded-lg border border-gray-300 font-mono text-sm text-gray-800 font-semibold">
                                #{orderId.slice(-8)}
                            </code>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusStyle(status)}`}>
                            {getStatusText(status)}
                        </span>
                        
                        {canCancel && (
                            <button
                                onClick={onCancel}
                                disabled={canceling}
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-base font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                            >
                                {canceling && <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />}
                                {canceling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-blue-900">
                    <CircleAlert className="h-5 w-5 flex-shrink-0" />
                    <div className="text-base">
                        <span className="block font-semibold text-blue-800">Bước tiếp theo</span>
                        <span className="mt-1 block text-blue-700 opacity-90">
                            {getGuideText(status)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHeader;
