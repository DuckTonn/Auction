import express from 'express';
import { checkAuth, checkRole, checkNotAdmin } from '../middleware/auth.middleware.js';
import sanitizeDescription from '../middleware/sanitizeDescription.js';

import uploadCloud from '../config/cloudinary.config.js';

export function ProductRoutes(productController, qnaController) {
    const router = express.Router();

    // ======= PUBLIC ROUTES =======

    // Tìm kiếm
    router.get('/search', productController.searchProducts);

    // Lấy top 5 sản phẩm (trang HOME)
    router.get('/top-ending', productController.getTop5EndingSoon);
    router.get('/top-price', productController.getTop5HighestPrice);
    router.get('/top-bidded', productController.getTop5MostBidded);

    // Lấy danh sách theo danh mục (Có phân trang)
    router.get('/category/:slug', productController.getProductsByCategory); 

    // Lấy ngẫu nhiên 5 sản phẩm từ 1 danh mục
    router.get('/category/:slug/random', productController.getRandom5ProductsByCategory);


    // ======= CẦN CHECK AUTH =======

    // Xem watch list
    router.get('/watch-list', [checkAuth, checkNotAdmin], productController.getWatchList);


    // ======= CẦN QUYỀN SELLER =======

    // Tạo sản phẩm
    router.post('/create', 
        [
            checkAuth, 
            checkRole('seller'),

            // Upload
            uploadCloud.fields([
                { name: 'thumbnail', maxCount: 1 }, // Field name là 'thumbnail', tối đa 1 ảnh
                { name: 'images', maxCount: 10 }    // Field name là 'images', tối đa 10 ảnh
            ]),

            // Làm sạch dữ liệu
            sanitizeDescription
        ], 
        productController.createProduct
    );

    // Lấy sản phẩm của seller
    router.get('/seller', [checkAuth, checkNotAdmin], productController.getSellerProducts);

    // ====== CẦN QUYỀN ADMIN =======

    // Lấy tất cả sản phẩm
    router.get('/', [checkAuth, checkRole('admin')], productController.getAllProducts);


    // ======= ROUTER ĐỘNG =======

    // Cập nhật mô tả
    router.post('/:id/description', [checkAuth, checkNotAdmin], productController.appendDescription);

    // Ban bidder
    router.post('/:id/ban', [checkAuth, checkNotAdmin], productController.banBidder);

    // Unban bidder
    router.post('/:id/unban', [checkAuth, checkNotAdmin], productController.unbanBidder);
    
    // Lấy chi tiết sản phẩm
    router.get('/:id', productController.getProductDetails);
    
    // Lấy giá trị đặt thấp nhất
    router.get('/:id/min-price', [checkAuth, checkNotAdmin], productController.getMinValidPrice);

    // Toggle watch list
    router.post('/:id/watch-list', [checkAuth, checkNotAdmin], productController.toggleWatchList);

    // Kiểm tra xem có thích sản phẩm không
    router.get('/:id/watch-list/check', [checkAuth, checkNotAdmin], productController.checkIsWatching);

    // Q&A routes
    router.get('/:id/questions', qnaController.listByProduct);
    router.post('/:id/questions', [checkAuth, checkNotAdmin], qnaController.askQuestion);

    // Mua ngay
    router.post('/:id/buy-now', [checkAuth, checkNotAdmin], productController.buyProductNow);

    // Hủy sản phẩm
    router.post('/:id/cancel', checkAuth, productController.cancelProduct);

    // Bán lại sản phẩm
    router.post('/:id/resell', [checkAuth, checkNotAdmin], productController.resellProduct);

    return router;
}