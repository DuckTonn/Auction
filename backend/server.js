import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js'
import passport from 'passport';
import cookieParser from 'cookie-parser';
import './config/passport.config.js';
import simpleLogger from './middleware/logger.middleware.js';

await connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(simpleLogger);

// 1. Định nghĩa danh sách các tên miền được phép truy cập
const allowedOrigins = [
  'http://localhost:5173',                // Cho phép chạy dưới Local
  'http://localhost:5174',                // Phòng hờ nếu Local chạy port khác
  'https://du-an-cua-ban.vercel.app'      // <--- QUAN TRỌNG: Thay dòng này bằng Link Vercel thực tế của bạn
];

// 2. Cấu hình CORS
app.use(cors({
  origin: function (origin, callback) {
    // Cho phép request không có origin (như Postman hoặc Server-to-Server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      // Nếu origin không nằm trong danh sách cho phép -> Chặn
      var msg = 'Lỗi CORS: Domain ' + origin + ' không được phép truy cập tài nguyên này.';
      return callback(new Error(msg), false);
    }
    
    // Nếu OK -> Cho qua
    return callback(null, true);
  },
  credentials: true, // Cho phép gửi cookie/session
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Các method được phép
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Import routes

// === AUTH ===
const { authController } = await import('./controllers/auth.controller.js');
const { AuthRoutes } = await import('./routes/auth.route.js');

// === USER ===
const { userController } = await import('./controllers/user.controller.js');
const { UserRoutes } = await import('./routes/user.route.js');

// === CATEGORY ===
const { categoryController } = await import('./controllers/category.controller.js');
const { CategoryRoutes } = await import('./routes/category.route.js');

// === PRODUCT ===
const { productController } = await import('./controllers/product.controller.js');
const { ProductRoutes } = await import('./routes/product.route.js');

// === BID ===
const { bidController } = await import('./controllers/bid.controller.js');
const { BidRoutes } = await import('./routes/bid.route.js');

// === UPGRADE REQUEST ===
const { upgradeRequestController } = await import('./controllers/upgrade.request.controller.js');
const { UpgradeRequestRoutes } = await import('./routes/upgrade.request.route.js');

// === RATING ===
const { ratingController } = await import('./controllers/rating.controller.js');
const { RatingRoutes } = await import('./routes/rating.route.js');

// === QNA ===
const { qnaController } = await import('./controllers/qna.controller.js');
const { QnARoutes } = await import('./routes/qna.route.js');

// === CHAT MESSAGE ===
const { chatMessageController } = await import('./controllers/chat.message.controller.js');
const { ChatMessageRoutes } = await import('./routes/chat.message.route.js');

// === AUCTION RESULT ===
const { auctionResultController } = await import('./controllers/auction.result.controller.js');
const { AuctionResultRoutes } = await import('./routes/auction.result.route.js');

// === BACKGROUND SERVICES (CRON JOB) ===
const { cronService } = await import('./services/cron.service.js');
cronService.start(); 
console.log('Cron Service đã được khởi động...');

// === CONFIG ROUTES ===
const { configController } = await import('./controllers/config.controller.js');
const { ConfigRoutes } = await import('./routes/config.route.js');

// === ROUTER SETUP ===

app.get('/api', (req, res) => {
    res.send('Chào mừng đến với API Sàn Đấu Giá!');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "API Sàn Đấu Giá đang chạy tốt!" });
});

app.use('/api/admin', ConfigRoutes(configController));
app.use('/api/auth', AuthRoutes(authController));
app.use('/api/users', UserRoutes(userController));
app.use('/api/products', ProductRoutes(productController, qnaController));
app.use('/api/categories', CategoryRoutes(categoryController));
app.use('/api/bids', BidRoutes(bidController));
app.use('/api/upgrade-requests', UpgradeRequestRoutes(upgradeRequestController));
app.use('/api/ratings', RatingRoutes(ratingController));
app.use('/api/qnas', QnARoutes(qnaController));
app.use('/api/chat', ChatMessageRoutes(chatMessageController));
app.use('/api/auction-results', AuctionResultRoutes(auctionResultController));
// START
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng http://localhost:${PORT}/api`);
});
