import express from 'express';
import { checkNotAdmin, checkAuth } from '../middleware/auth.middleware.js';

import uploadCloud from '../config/cloudinary.config.js';

export function AuctionResultRoutes(auctionResultController) {
    const router = express.Router();

    // Lấy danh sách đơn hàng đấu giá thắng cuộc của người dùng
    router.get('/winner', checkAuth, checkNotAdmin, auctionResultController.getOrdersByWinner);

    // Lấy danh sách đơn hàng đấu giá bán của người dùng
    router.get('/seller', checkAuth, checkNotAdmin, auctionResultController.getOrdersBySeller);

    // Lấy đơn hàng theo productId
    router.get('/by-product/:productId', checkAuth, checkNotAdmin, auctionResultController.getOrderByProductId);

    // Lấy chi tiết đơn hàng
    router.get('/:orderId', checkAuth, checkNotAdmin, auctionResultController.getOrderDetails);

    // Người mua thanh toán
    router.post('/:orderId/submit-payment', checkAuth, checkNotAdmin, uploadCloud.single('paymentProof'), auctionResultController.submitPayment);

    // Người bán xác nhận gửi hàng
    router.post('/:orderId/confirm-shipment', checkAuth, checkNotAdmin, uploadCloud.single('shippingProof'), auctionResultController.confirmShipment);

    // Người mua xác nhận đã nhận hàng
    router.post('/:orderId/confirm-receipt', checkAuth, checkNotAdmin, auctionResultController.confirmReceipt);

    // Người bán huỷ giao dịch
    router.post('/:orderId/cancel-transaction', checkAuth, checkNotAdmin, auctionResultController.cancelTransaction);
    
    return router;
}