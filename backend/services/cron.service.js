import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import mongoose from 'mongoose';
import { productRepository } from '../repositories/product.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { dispatchEmail } from './email.service.queue.js';

import { executeTransaction } from '../db/db.helper.js';

const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'product/' || 'http://localhost:3000/product/';
const ORDER_URL_PREFIX = process.env.VITE_URL + 'orders/' || 'http://localhost:3000/orders/';

class CronService {
    start() {
        // Chạy mỗi 1 phút: '* * * * *'
        cron.schedule('* * * * *', async () => {
            await this.closeEndedAuctions();
        });

        // Chạy mỗi 10 phút: '* * * * *'
        cron.schedule('*/10 * * * *', async () => {
             await this.downgradeExpiredSellers();
        });
    }

    async closeEndedAuctions() {
        // Tìm sản phẩm hết hạn mà vẫn đang active
        const expiredProducts = await productRepository.findExpired();
        if (expiredProducts.length === 0) return;

        // Log tổng quan số lượng tìm thấy
        console.log(`[${new Date().toISOString()}] [CRON] [SCAN] Tìm thấy ${expiredProducts.length} sản phẩm cần chốt.`);

        for (const product of expiredProducts) {
            try {
                await executeTransaction(async (session) => {
                    const currentProduct = await productRepository.findById(product._id, false, session); 
                    
                    // Kiểm tra trạng thái
                    if (!currentProduct || currentProduct.auction_status !== 'active') {
                        return; 
                    }

                    // Nếu có bidder thắng cuộc
                    if (currentProduct.current_highest_bidder) {
                        currentProduct.auction_status = 'sold';
                        await currentProduct.save({ session });

                        // Kiểm tra xem auction result đã tồn tại chưa
                        const existingResult = await auctionResultRepository.findByProduct(currentProduct._id, session);
                        if (!existingResult) {
                            await auctionResultRepository.create({
                                product: currentProduct._id,
                                winning_bidder: currentProduct.current_highest_bidder._id,
                                seller: currentProduct.seller._id,
                                final_price: currentProduct.current_highest_price,
                                status: 'pending_payment'
                            }, session);
                        }

                        console.log(`[CRON] [SOLD] ID: ${currentProduct._id} | Price: ${currentProduct.current_highest_price}`);
                        
                        // --- Gửi email thông báo ---
                        
                        // Lấy thông tin cần thiết để gửi email
                        const auctionResult = await auctionResultRepository.findByProduct(currentProduct._id, session);
                        if (!auctionResult) {
                            throw new Error('Không tìm thấy kết quả đấu giá cho sản phẩm này!');
                        }
            
                        const winner = await userRepository.findById(currentProduct.current_highest_bidder._id, session);
                        const seller = await userRepository.findById(currentProduct.seller._id, session);
            
                        // Gửi email cho winner và seller
                        const productUrl = PRODUCT_URL_PREFIX + currentProduct._id;
                        const checkOutUrl = ORDER_URL_PREFIX + auctionResult?._id;
            
                        dispatchEmail('NOTIFY_AUCTION_WINNER', {
                            winnerEmail: winner.email,
                            productName: currentProduct.product_name,
                            finalPrice: currentProduct.current_highest_price,
                            checkoutLink: checkOutUrl
                        });
            
                        dispatchEmail('NOTIFY_AUCTION_SOLD', {
                            sellerEmail: seller.email,
                            productName: currentProduct.product_name,
                            winnerName: winner.full_name,
                            finalPrice: currentProduct.current_highest_price,
                            productLink: productUrl
                        });

                    } else {
                        // Không có bidder nào
                        currentProduct.auction_status = 'ended';
                        await currentProduct.save({ session });

                        console.log(`[CRON] [ENDED] ID: ${currentProduct._id} | Không có bidder`);
                        
                        // Gửi mail cho seller
                        const mailSeller = currentProduct.seller.email;
                        const productLink = PRODUCT_URL_PREFIX + currentProduct._id.toString();

                        dispatchEmail('NOTIFY_AUCTION_NO_BID', {
                            sellerEmail: mailSeller,
                            productName: currentProduct.product_name,
                            productLink: productLink
                        });
                    }
                });

            } catch (err) {
                console.error(`[CRON] [ERROR] Product ${product._id}: ${err.message}`);
            }
        }
        
        console.log(`[${new Date().toISOString()}] [CRON] [DONE] Hoàn tất xử lý batch.`);
    }

    async downgradeExpiredSellers() {
        console.log(`[${new Date().toISOString()}] [CRON] Đang quét Seller hết hạn...`);
        try {
            const result = await userRepository.downgradeExpiredSellers();
            
            if (result.modifiedCount > 0) {
                console.log(`[CRON] Đã hạ cấp ${result.modifiedCount} seller do hết hạn.`);
            }
        } catch (error) {
            console.error('[CRON ERROR] Hạ bậc Seller:', error);
        }
    }
}

export const cronService = new CronService();