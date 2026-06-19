import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function ConfigRoutes(configController) {
    const router = express.Router();

    // ======= CẦN QUYỀN ADMIN =======

    // Lấy tham số hệ thống
    router.get('/system-params', [checkAuth, checkRole('admin')], configController.getParams);

    // Cập nhật tham số hệ thống
    router.put('/system-params', [checkAuth, checkRole('admin')], configController.updateParams);

    return router;
}