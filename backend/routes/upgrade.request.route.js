import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function UpgradeRequestRoutes(upgradeRequestController) {
    const router = express.Router();

    // ======= PUBLIC ROUTES =======


    // ======= CẦN QUYỀN BIDDER =======

    // Tạo request
    router.post('/', [checkAuth, checkRole('bidder')], upgradeRequestController.createRequest);


    // ======= CẦN QUYỀN ADMIN =======

    // Tạo sản phẩm
    router.get('/pending-list', [checkAuth, checkRole('admin')], upgradeRequestController.getPendingList);


    // ======= ROUTER ĐỘNG =======

    // Update trạng thái
    router.post('/:id', [checkAuth, checkRole('admin')], upgradeRequestController.updateRequestStatus);

    return router;
}