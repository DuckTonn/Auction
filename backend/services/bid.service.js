import dotenv from 'dotenv';
dotenv.config();
import { productRepository } from '../repositories/product.repository.js';
import { bidRepository } from '../repositories/bid.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { configRepository } from '../repositories/config.repository.js';

import { executeTransaction } from '../../db/db.helper.js';
import { dispatchEmail } from './email.service.queue.js';
import { productService } from './product.service.js';

const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'product/' || 'http://localhost:3000/product/';
const ORDER_URL_PREFIX = process.env.VITE_URL + 'orders/' || 'http://localhost:3000/orders/';

const EXTEND_THRESHOLD_MINUTES = await (async () => {
    const config = await configRepository.getConfigs();
    return config.extend_threshold_minutes || 5;
})();

const EXTEND_DURATION_MINUTES = await (async () => {
    const config = await configRepository.getConfigs();
    return config.extend_duration_minutes || 10;
})();

class BidService {
    // Hàm logic trả về true nếu người đặt giá là người giữ giá cao nhất sau khi đặt
    async _logicPlaceBid(userId, product, amount, session) {
        /* Check first bid
            Case 1: Chưa ai bid (bid_count === 0)
            Case 2: Holder cũ bị ban => current_highest_bidder được reset về undefined
        */
        const isFirstBid = product.bid_count === 0 || !product.current_highest_bidder;
        const userIdStr = userId.toString();

        // Cập nhật dữ liệu
        const currentBidCount = product.bid_counts.get(userIdStr) || 0;
        product.bid_counts.set(userIdStr, currentBidCount + 1);
        product.auto_bid_map.set(userIdStr, amount);
        product.bid_count += 1;
        
        const now = new Date();
        if (product.auto_renew) {
            const timeLeft = product.auction_end_time.getTime() - now.getTime();
            if (timeLeft > 0 && timeLeft < EXTEND_THRESHOLD_MINUTES * 60 * 1000) {
                product.auction_end_time = new Date(product.auction_end_time.getTime() + EXTEND_DURATION_MINUTES * 60 * 1000);
            }
        }

        // ====== PLACE BID LOGIC ======
        
        // 0. LÀ NGƯỜI ĐẶT GIÁ ĐẦU TIÊN
        if (isFirstBid) {
            product.current_highest_price = product.start_price;
            product.current_highest_bidder = userId;
            await productRepository.save(product, session);

            // Tạo bản ghi đấu giá
            await bidRepository.create({
                user: userId,
                product: product._id,
                price: product.start_price,
            }, session);

            return true;
        }

        // 1. BIDDER LÀ NGƯỜI ĐẶT GIÁ CAO NHẤT BAN ĐẦU (TĂNG MAX BID)
        if (product.current_highest_bidder?.toString() === userIdStr) {
            // Không làm tăng số lượt bid
            product.bid_counts.set(userIdStr, currentBidCount);
            product.bid_count -= 1;
            await productRepository.save(product, session);
            return true;
        }

        // 2.1. BIDDER KHÁC NGƯỜI GIỮ GIÁ CAO NHẤT (VÀ ĐẶT GIÁ CAO HƠN NGƯỜI GIỮ GIÁ CAO NHẤT)
        const currentHolderId = product.current_highest_bidder ? product.current_highest_bidder.toString() : null;
        const currentHolderIdStr = currentHolderId ? currentHolderId.toString() : null;
        const currentHolderMaxBid = currentHolderIdStr ? product.auto_bid_map.get(currentHolderIdStr) : 0;

        if (amount > currentHolderMaxBid) {
            // Cập nhật người giữ giá mới và giá hiện tại
            // Giá = min(amount người mới, max_bid holder cũ + increment)
            product.current_highest_bidder = userId;
            product.current_highest_price = Math.min(amount, currentHolderMaxBid + product.bid_increment);
            await productRepository.save(product, session);

            // Tạo bản ghi đấu giá
            await bidRepository.create({
                user: userId,
                product: product._id,
                price: product.current_highest_price
            }, session);

            return true;
        }
        // 2.2. BIDDER KHÁC NGƯỜI GIỮ GIÁ CAO NHẤT (NHƯNG ĐẶT GIÁ THẤP HƠN HOẶC BẰNG NGƯỜI GIỮ GIÁ CAO NHẤT)
        else {
            // Cập nhật giá hiện tại (= amount)
            product.current_highest_price = amount;

            // Tạo bản ghi đấu giá cho người vừa đấu giá
            await bidRepository.create({
                user: userId,
                product: product._id,
                price: amount
            }, session);

            // Tạo bản ghi đấu giá đè cho người giữ giá cao nhất
            await bidRepository.create({
                user: currentHolderId,
                product: product._id,
                price: product.current_highest_price,
                is_priority: true
            }, session);
            product.bid_counts.set(currentHolderIdStr, (product.bid_counts.get(currentHolderIdStr) || 0) + 1);
            product.bid_count += 1;
            await productRepository.save(product, session);

            return false;
        }
    }

    async placeBid(userId, productId, amount) {
        return await executeTransaction(async (session) => {
            // Lock & Load Product
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại!");

            // ==== VALIDATE ====
            // Validate Trạng thái & Thời gian
            if (product.auction_status !== 'active') {
                throw new Error("Phiên đấu giá này không còn hoạt động (Đã kết thúc, đã bán hoặc bị hủy)");
            }

            const now = new Date();
            if (now > product.auction_end_time) {
                product.auction_status = 'ended';
                await productRepository.save(product, session);
                throw new Error("Phiên đấu giá đã kết thúc!");
            }

            // Validate Quyền hạn
            if (product.seller.toString() === userId) throw new Error("Không thể tự đấu giá sản phẩm của mình!");
            if (product.banned_bidder && product.banned_bidder.some(id => id.toString() === userId)) {
                throw new Error("Bạn đã bị người bán chặn đấu giá sản phẩm này!");
            }

            // Validate Điểm đánh giá
            const bidder = await userRepository.findById(userId);
            if (!bidder) throw new Error("Không tìm thấy thông tin người dùng");

            if (bidder.rating_count === 0) {
                if (!product.allow_newbie) {
                    throw new Error('Sản phẩm này không cho phép người mới (chưa có đánh giá) tham gia!');
                }
            } else {
                const positiveCount = (bidder.rating_count + bidder.rating_score) / 2;
                const positiveRatio = positiveCount / bidder.rating_count;

                if (positiveRatio < 0.8) {
                    throw new Error(`Điểm uy tín thấp (${(positiveRatio * 100).toFixed(1)}%). Yêu cầu trên 80% mới được đấu giá.`);
                }
            }
            // ==================

            // Lưu previous holder để gửi email sau
            const previousHolderId = product.current_highest_bidder;

            // ==== MUA NGAY ====
            if (product.buy_it_now_price && amount >= product.buy_it_now_price) {
                await productService.logicBuyProductNow(userId, product, session);
                const finalPrice = product.buy_it_now_price;
                const finalWinnerId = userId;

                // --- Gửi email thông báo (cho winner, seller, và holder cũ nếu có) ---

                // Lấy thông tin cần thiết để gửi email
                const auctionResult = await auctionResultRepository.findByProduct(product._id, session);
                if (!auctionResult) {
                    throw new Error('Không tìm thấy kết quả đấu giá cho sản phẩm này!');
                }

                const winner = await userRepository.findById(finalWinnerId);
                const seller = await userRepository.findById(product.seller);
                const previousHolder = previousHolderId ? await userRepository.findById(previousHolderId) : null;

                // Gửi email cho winner và seller
                const productUrl = PRODUCT_URL_PREFIX + product?._id;
                const checkOutUrl = ORDER_URL_PREFIX + auctionResult?._id;

                dispatchEmail('NOTIFY_AUCTION_WINNER', {
                    winnerEmail: winner.email,
                    productName: product.product_name,
                    finalPrice: finalPrice,
                    checkoutLink: checkOutUrl
                });

                dispatchEmail('NOTIFY_AUCTION_SOLD', {
                    sellerEmail: seller.email,
                    productName: product.product_name,
                    winnerName: winner.full_name,
                    finalPrice: finalPrice,
                    productLink: productUrl
                });

                // Gửi email cho previous holder nếu có và khác winner
                if (previousHolder && previousHolder._id.toString() !== winner._id.toString()) {
                    dispatchEmail('NOTIFY_HOLDER', {
                        holderEmail: previousHolder.email,
                        productName: product.product_name,
                        currentPrice: finalPrice,
                        top1Email: winner.email,
                        productLink: productUrl
                    });
                }

                return {
                    success: true,
                    current_price: finalPrice,
                    winner_id: finalWinnerId,
                    status: product.auction_status,
                    message: 'Mua ngay thành công!'
                };
            }
            // ==================

            // ==== ĐẤU GIÁ THƯỜNG ====

            // --- VALIDATE GIÁ ---
            // Check giá phải cao hơn giá cũ của chính mình
            const userCurrentMaxBid = product.auto_bid_map.get(userId);
            if (userCurrentMaxBid !== undefined && amount <= userCurrentMaxBid) {
                throw new Error(`Giá mới phải cao hơn mức giá cũ bạn đã đặt (${userCurrentMaxBid})`);
            }

            // Check giá phải cao hơn sàn toàn cục
            const globalMinPrice = product.bid_count === 0
                ? product.start_price
                : product.current_highest_price + product.bid_increment;

            if (amount < globalMinPrice) {
                throw new Error(`Giá đặt không hợp lệ. Sàn hiện tại yêu cầu tối thiểu: ${globalMinPrice}`);
            }
            // --------------------

            // --- LOGIC ĐẤU GIÁ ---
            const isNowHolder = await this._logicPlaceBid(userId, product, amount, session);
            const notification = isNowHolder ? 'Bạn hiện là người giữ giá cao nhất!' : 'Bạn đã bị vượt giá bởi người khác. Hãy thử lại!';

            // --- Gửi email thông báo (cho seller, bidder, previous holder nếu có) ---

            // Lấy thông tin cần thiết để gửi email
            const user = await userRepository.findById(userId);
            const seller = await userRepository.findById(product.seller);
            const holder = await userRepository.findById(product.current_highest_bidder);
            const previousHolder = previousHolderId ? await userRepository.findById(previousHolderId) : null;

            // Gửi email cho user và seller
            const productUrl = PRODUCT_URL_PREFIX + product?._id;

            dispatchEmail('NOTIFY_BID_SUCCESS', {
                bidderEmail: user.email,
                productName: product.product_name,
                holderName: holder.full_name,
                bidderPrice: amount,
                currentPrice: product.current_highest_price,
                productLink: productUrl
            });

            dispatchEmail('NOTIFY_NEW_BID_SELLER', {
                sellerEmail: seller.email,
                productName: product.product_name,
                newPrice: product.current_highest_price,
                bidderName: user.full_name,
                productLink: productUrl
            });

            // Gửi email cho previous holder nếu có và khác user hiện tại
            if (previousHolder && previousHolder._id.toString() !== user._id.toString()) {
                dispatchEmail('NOTIFY_HOLDER', {
                    holderEmail: previousHolder.email,
                    productName: product.product_name,
                    currentPrice: product.current_highest_price,
                    top1Email: holder.email,
                    productLink: productUrl
                });
            }

            return {
                success: true,
                outBid: !isNowHolder,
                current_price: product.current_highest_price,
                highest_bidder_id: product.current_highest_bidder,
                status: product.auction_status,
                message: `Ra giá thành công (đã đặt giá ${amount})! ` + notification
            }
        });
    }

    async getBidHistory(productId) {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Không tìm thấy sản phẩm!');

        const bannedSet = new Set(
            (product.banned_bidder || []).map(id => id.toString())
        );

        const history = await bidRepository.findByProduct(productId);

        const currentPrice = product.current_highest_price;

        const result = history.map(h => {
            const bidObj = h.toObject ? h.toObject() : h;
            const user = bidObj.user;

            // Nếu user bị ban thì đánh dấu is_banned
            let is_banned = false;
            if (bannedSet.has(user._id.toString())) {
                is_banned = true;
            }

            // === XÁC ĐỊNH GIÁ HIỂN THỊ ===
            let finalDisplayPrice = undefined;

            if (bidObj.is_valid) {
                if (bidObj.price > currentPrice) {
                    finalDisplayPrice = currentPrice;
                } else {
                    finalDisplayPrice = bidObj.price;
                }
            }

            return {
                ...bidObj,
                price: finalDisplayPrice,
                user: user,
                is_banned: is_banned
            };
        })

        return result;
    }

    async getActiveBiddedProductsByUser(userId) {
        const productIds = await bidRepository.findByUser(userId);
        const products = await productRepository.findActive(productIds, true);

        const result = products
            .filter(product => {
                const productObj = product.toObject ? product.toObject() : product;
                const userIdStr = userId.toString();
                
                // Loại bỏ sản phẩm có banned_bidder chứa userId
                const isBanned = productObj.banned_bidder && 
                    productObj.banned_bidder.some(id => id.toString() === userIdStr);
                return !isBanned;
            })
            .map(product => {
                const productObj = product.toObject ? product.toObject() : product;
                const userIdStr = userId.toString();
                const bidCount = productObj.bid_counts?.get(userIdStr) || 0;
                const maxBid = productObj.auto_bid_map?.get(userIdStr) || null;

                // Loại bỏ auto_bid_map và thêm user_bid_info
                const { auto_bid_map, ...cleanProduct } = productObj;

                return {
                    ...cleanProduct,
                    user_bid_info: {
                        bid_count: bidCount,
                        max_bid: maxBid
                    }
                };
            });

        return result;
    }
}

export const bidService = new BidService();