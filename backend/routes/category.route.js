import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function CategoryRoutes(categoryController) {
    const router = express.Router();

    // ======= PUBLIC ROUTES =======

    // Lấy tất cả danh mụC
    router.get('/', categoryController.getAllCategories);

    // Lấy chi tiết danh mục
    router.get('/:id', categoryController.getCategory);


    // ======= CẦN QUYỀN ADMIN =======

    // Tạo danh mục mới
    router.post('/', [checkAuth, checkRole('admin')], categoryController.createCategory);

    // ======= ROUTER ĐỘNG =======

    // Cập nhật danh mục
    router.put('/:id', [checkAuth, checkRole('admin')], categoryController.updateCategory);

    // Xóa danh mục
    router.delete('/:id', [checkAuth, checkRole('admin')], categoryController.deleteCategory);

    return router;
}