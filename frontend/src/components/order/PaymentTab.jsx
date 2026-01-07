import { useState } from 'react';
import ToastNotification from '../common/ToastNotification';
import FileUpload from './FileUpload';

const PaymentTab = ({ orderData, isBuyer, onSubmitPayment, submittingPayment, user }) => {
    const [shippingAddress, setShippingAddress] = useState(
        orderData.shipping_address || orderData.winning_bidder?.address || user?.address || ''
    );
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState(null);

    const processPaymentFile = (file) => {
        if (!file.type.startsWith('image/')) {
            ToastNotification('Vui lòng chọn file ảnh', 'error');
            return;
        }
        setPaymentProofFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPaymentProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleClearFile = () => {
        setPaymentProofFile(null);
        setPaymentProofPreview(null);
    };

    const handleSubmit = () => {
        if (!shippingAddress.trim()) {
            ToastNotification('Vui lòng nhập địa chỉ giao hàng', 'error');
            return;
        }
        if (!paymentProofFile) {
            ToastNotification('Vui lòng tải lên bằng chứng thanh toán', 'error');
            return;
        }

        onSubmitPayment(shippingAddress, paymentProofFile);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Thông tin thanh toán
            </h3>
            
            {orderData.status === 'pending_payment' && isBuyer ? (
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            Địa chỉ giao hàng
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            rows={3}
                            className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                        />
                    </div>

                        {/* Payment Proof */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                        <FileUpload
                            file={paymentProofFile}
                            preview={paymentProofPreview}
                            onFileChange={processPaymentFile}
                            onClear={handleClearFile}
                            label={
                                <>
                                    Bằng chứng thanh toán
                                    <span className="text-red-500">*</span>
                                </>
                            }
                        />
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submittingPayment}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {submittingPayment ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <span>Gửi thông tin thanh toán</span>
                            </>
                        )}
                    </button>
                </div>
            ) : orderData.status === 'pending_payment' ? (
                <div className="text-center py-12 bg-amber-100 rounded-xl border border-amber-200">
                    <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⏳</span>
                    </div>
                    <p className="text-amber-700 font-medium text-lg">Đang chờ người mua thanh toán</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Hiển thị Shipping Address */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            Địa chỉ giao hàng:
                        </p>
                        <div className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm">
                            <p className="text-gray-700 leading-relaxed">{orderData.shipping_address}</p>
                        </div>
                    </div>

                    {/* Hiển thị Payment Proof */}
                    {orderData.payment_proof && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                Bằng chứng thanh toán:
                            </p>
                            <div className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm">
                                <img
                                    src={orderData.payment_proof}
                                    alt="Payment proof"
                                    className="max-w-md h-auto rounded-lg border-2 border-purple-200 shadow-md mx-auto"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentTab;
