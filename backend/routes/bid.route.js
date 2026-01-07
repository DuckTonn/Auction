import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function BidRoutes(bidController) {
    const router = express.Router();

    // ======= PUBLIC ROUTES =======

    // === ROUTER ĐỘNG ===
    // API Xem lịch sử (Public)
    router.get('/:id/history', bidController.getBidHistory);


    // ======= CẦN QUYỀN BIDDER =======

    // API Lấy danh sách sản phẩm đang bid
    router.get('/active-bidded-products', [checkAuth, checkNotAdmin], bidController.getActiveBiddedProductsByUser);

    // === ROUTER ĐỘNG ===
    // API Ra giá (Cần login + quyền bidder)
    router.post('/:id/place', [checkAuth, checkNotAdmin], bidController.placeBid);

    return router;
}