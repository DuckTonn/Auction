import { useState } from 'react';
import ToastNotification from '../common/ToastNotification';
import FileUpload from './FileUpload';

const ShippingTab = ({ orderData, isBuyer, isSeller, onConfirmShipment, onConfirmReceipt, confirmingShipment, confirmingReceipt }) => {
    const [shippingProofFile, setShippingProofFile] = useState(null);
    const [shippingProofPreview, setShippingProofPreview] = useState(null);
    const [confirmReceipt, setConfirmReceipt] = useState(false);

    const processShippingFile = (file) => {
        if (!file.type.startsWith('image/')) {
            ToastNotification('Vui lòng chọn file ảnh', 'error');
            return;
        }
        setShippingProofFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setShippingProofPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleClearFile = () => {
        setShippingProofFile(null);
        setShippingProofPreview(null);
    };

    const handleConfirmShipment = () => {
        if (!shippingProofFile) {
            ToastNotification('Vui lòng tải lên bằng chứng vận chuyển', 'error');
            return;
        }
        onConfirmShipment(shippingProofFile);
    };

    const handleConfirmReceipt = () => {
        if (!confirmReceipt) {
            ToastNotification('Vui lòng xác nhận đã nhận hàng', 'error');
            return;
        }
        onConfirmReceipt();
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Thông tin vận chuyển
            </h3>
            
            {/* Seller - Pending Shipment */}
            {orderData.status === 'pending_shipment' && isSeller ? (
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                        <FileUpload
                            file={shippingProofFile}
                            preview={shippingProofPreview}
                            onFileChange={processShippingFile}
                            onClear={handleClearFile}
                            label={
                                <>
                                    Bằng chứng giao hàng
                                    <span className="text-red-500">*</span>
                                </>
                            }
                        />
                    </div>

                    <button
                        onClick={handleConfirmShipment}
                        disabled={confirmingShipment}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {confirmingShipment ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                Đang xác nhận...
                            </>
                        ) : (
                            <>
                                Xác nhận đã giao hàng
                            </>
                        )}
                    </button>
                </div>
            ) : orderData.status === 'shipping' && isBuyer ? (
                /* Buyer - Shipping */
                <div className="space-y-6">
                    {orderData.shipping_proof && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                Bằng chứng giao hàng:
                            </p>
                            <div className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm">
                                <img
                                    src={orderData.shipping_proof}
                                    alt="Shipping proof"
                                    className="max-w-md h-auto rounded-lg border-2 border-blue-200 shadow-md mx-auto"
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-3 bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm">
                            <input
                                type="checkbox"
                                id="confirmReceipt"
                                checked={confirmReceipt}
                                onChange={(e) => setConfirmReceipt(e.target.checked)}
                                className="w-6 h-6 text-blue-600 border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="confirmReceipt" className="text-base font-medium text-gray-700 cursor-pointer select-none">
                                Tôi xác nhận đã nhận được hàng
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirmReceipt}
                        disabled={confirmingReceipt}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {confirmingReceipt ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                Đang xác nhận...
                            </>
                        ) : (
                            <>
                                Xác nhận nhận hàng
                            </>
                        )}
                    </button>
                </div>
            ) : orderData.status === 'pending_payment' ? (
                /* Chờ thanh toán */
                <div className="text-center py-12 bg-blue-100 rounded-xl border border-blue-200">
                    <span className="text-5xl flex items-center justify-center mx-auto mb-4">💳</span>
                    <p className="text-blue-700 font-medium text-lg">Vui lòng hoàn thành thanh toán trước</p>
                </div>
            ) : orderData.status === 'pending_shipment' ? (
                /* Chờ người bán giao hàng */
                <div className="text-center py-12 bg-amber-100 rounded-xl border border-amber-200">
                    <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⏳</span>
                    </div>
                    <p className="text-amber-700 font-medium text-lg">Đang chờ người bán giao hàng</p>
                </div>
            ) : orderData.shipping_proof ? (
                /* Hiển thị bằng chứng giao hàng */
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        Bằng chứng giao hàng:
                    </p>
                    <div className="bg-white/70 backdrop-blur rounded-lg p-4 shadow-sm">
                        <img
                            src={orderData.shipping_proof}
                            alt="Shipping proof"
                            className="max-w-md h-auto rounded-lg border-2 border-purple-200 shadow-md mx-auto"
                        />
                    </div>
                </div>
            ) : (
                /* Không có thông tin vận chuyển */
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-600 font-medium text-lg">Chưa có thông tin vận chuyển</p>
                </div>
            )}
        </div>
    );
};

export default ShippingTab;
