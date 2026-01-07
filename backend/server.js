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

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
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