import dotenv from 'dotenv';
dotenv.config();
import { productRepository } from '../repositories/product.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { bidRepository } from '../repositories/bid.repository.js';
import { executeTransaction } from '../db/db.helper.js';
import { recalculateAuctionState } from '../utils/auction.util.js';
import { watchListRepository } from '../repositories/watch.list.repository.js';
import { dispatchEmail } from './email.service.queue.js';

const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'product/' || 'http://localhost:3000/product/';
const ORDER_URL_PREFIX = process.env.VITE_URL + 'order/' || 'http://localhost:3000/order/';
class ProductService {
    async createProduct(productData) {
        const requiredFields = [
            'product_name',
            'description',
            'start_price',
            'thumbnail',
            'auction_end_time',
            'category',
            'seller'
        ];
        const isValid = requiredFields.every(field => field in productData);
        if (!isValid) {
            throw new Error('Thiếu thông tin bắt buộc để tạo sản phẩm!');
        }

        const { description, ...restData } = productData;

        const newProductData = {
            ...restData,
            description_history: [{
                content: description || '',
                timestamp: new Date()
            }]
        };

        return await productRepository.create(newProductData);
    }

    async appendDescription(userId, productId, newContent) {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Sản phẩm không tồn tại!');

        // Validate seller
        if (product.seller._id.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền sửa sản phẩm này!');
        }
        const bidderEmail = product.current_highest_bidder?.email;
            if (bidderEmail) {
                dispatchEmail('NOTIFY_DESCRIPTION_UPDATE', {
                    bidderEmail,
                    productName: product.product_name,
                    newDescription: newContent,
                    productLink: PRODUCT_URL_PREFIX + productId
                });
            }
        return await productRepository.appendDescription(productId, newContent);
    }

    async findAllProducts() {
        return await productRepository.findAll();
    }

    async findProductDetails(productId) {
        return await productRepository.findById(productId);
    }

    async findTop5ProductsEndingSoon() {
        const sortOption = { auction_end_time: 1 };
        const filter = { auction_status: 'active', auction_end_time: { $gt: new Date() } };
        const result = await productRepository.findByCondition(
            undefined,
            filter,
            sortOption,
            5,
            1
        );
        result.products.sort((a, b) => b.auction_end_time - a.auction_end_time);
        return result;
    }

    async findTop5HighestPriceProducts() {
        const sortOption = { current_highest_price: -1 };
        return await productRepository.findByCondition(
            undefined,
            { auction_status: 'active', auction_end_time: { $gt: new Date() } },
            sortOption,
            5,
            1
        );
    }

    async findTop5MostBiddedProducts() {
        const sortOption = { bid_count: -1 };
        return await productRepository.findByCondition(
            undefined,
            { auction_status: 'active', auction_end_time: { $gt: new Date() } },
            sortOption,
            5,
            1
        );
    }

    async getProductsByCategorySlug(slug, limit = 9, page = 1, sortOption = {}) {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        const allCategoryIds = await categoryRepository.getAllDescendantIds(category._id);
        const filter = { category: { $in: allCategoryIds }, auction_status: 'active', auction_end_time: { $gt: new Date() } };

        return await productRepository.findByCondition(undefined, filter, sortOption, limit, page);
    }

    async getProductsBySellerId(seller) {
        const filter = { seller: seller };
        const sortOption = { createdAt: -1 };
        return await productRepository.findByCondition(undefined, filter, sortOption, 0, 1);
    }

    async searchProducts(keyword, limit = 9, page = 1, sortOption = {}) {
        return await productRepository.findByCondition(keyword, { auction_status: 'active', auction_end_time: { $gt: new Date() } }, sortOption, limit, page);
    }

    async getRandom5ProductsByCategorySlug(slug) {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        const allCategoryIds = await categoryRepository.getAllDescendantIds(category._id);
        const filter = { category: { $in: allCategoryIds } };

        return await productRepository.findRandom(filter, 5);
    }

    // Đưa vào API lấy chi tiết sản phẩm
    async getMinValidPrice(productId, userId) {
        const product = await productRepository.findById(productId, true);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại!');
        }

        const sellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
        if (userId === sellerId) {
            throw new Error('Seller không thể tự đặt giá sản phẩm của mình!');
        }

        const globalFloor = (product.bid_count === 0  || product.auto_bid_map.size === 0 || !product.current_highest_bidder)
            ? product.start_price
            : product.current_highest_price + product.bid_increment;

        const userFloor = product.auto_bid_map.get(userId.toString()) || 0;

        return {
            min_valid_price: Math.max(globalFloor, userFloor + product.bid_increment),
            last_bid: userFloor !== 0 ? userFloor : null
        };
    }

    async banBidder(sellerId, productId, bidderIdToBan) {
        return await executeTransaction(async (session) => {
            // === VALIDATE & LOCK PRODUCT ===
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại");

            if (product.seller.toString() !== sellerId) {
                throw new Error("Không có quyền thực hiện");
            }

            const bannedSet = new Set(product.banned_bidder.map(id => id.toString()));
            if (!bannedSet.has(bidderIdToBan)) {
                product.banned_bidder.push(bidderIdToBan);
            } else {
                return { success: true, message: "Người dùng đã bị cấm trước đó" };
            }

            // Hủy tất cả các giá hợp lệ của bidder này trong phiên đấu giá
            await bidRepository.banBidsByUser(bidderIdToBan, productId, session);

            // Kiểm tra thứ hạng hiện tại của bidder
            const bannedIdStr = bidderIdToBan.toString();
            const sortedBidders = Array.from(product.auto_bid_map.entries())
                .sort((a, b) => b[1] - a[1]);
            const bidderRank = sortedBidders.findIndex(([bidderId]) => bidderId === bannedIdStr) + 1;

            // Xóa khỏi bản đồ auto bid
            product.auto_bid_map.delete(bidderIdToBan);

            // === LOGIC XỬ LÍ SAU KHI CẤM (Nếu bidder bị cấm là người đang giữ vị trí cao nhất hoặc cao nhì hiện tại) ===
            if (bidderRank < 3) {
                await recalculateAuctionState(product, product.current_highest_bidder, session);

                await productRepository.save(product, session);

                await bidRepository.scaleDownBids(product._id, product.current_highest_price, session);
            } else {
                await productRepository.save(product, session);
            }

            // TODO: Gửi email thông báo
            const bidder = await userRepository.findById(bidderIdToBan, session);
            const bidderEmail = bidder?.email;
            if (bidderEmail) {
                dispatchEmail('NOTIFY_BID_REJECTED', {
                    bidderEmail,
                    productName: product.product_name,
                });
            }
            return { success: true };
        });
    }

    async unbanBidder(sellerId, productId, bidderIdToUnban) {
        return await executeTransaction(async (session) => {
            // === VALIDATE & LOCK PRODUCT ===
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại");

            if (product.seller.toString() !== sellerId) {
                throw new Error("Không có quyền thực hiện");
            }

            const bannedSet = new Set(product.banned_bidder.map(id => id.toString()));
            if (!bannedSet.has(bidderIdToUnban)) {
                return { success: true, message: "Người dùng này không nằm trong danh sách cấm" };
            }

            // Dùng filter để loại bỏ ID
            product.banned_bidder = product.banned_bidder.filter(
                id => id.toString() !== bidderIdToUnban
            );

            await productRepository.save(product, session);

            // TODO: Gửi email thông báo
            const bidder = await userRepository.findById(bidderIdToUnban, session);
            const bidderEmail = bidder?.email;
            const productUrl = PRODUCT_URL_PREFIX + productId;
            if (bidderEmail) {
                dispatchEmail('NOTIFY_UNBAN', {
                    bidderEmail,
                    productName: product.product_name,
                    productLink: productUrl
                });
            }
            return { success: true };
        });
    }

    async toggleWatchList(userId, productId) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // Validate seller
        if (product.seller._id.toString() === userId.toString()) {
            throw new Error('Bạn không thể tự thêm sản phẩm của mình vào yêu thích!')
        }

        const isExist = await watchListRepository.exists(userId, productId);
        if (isExist) {
            await watchListRepository.remove(userId, productId);
            return {
                action: 'removed',
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích'
            };
        } else {
            await watchListRepository.add(userId, productId);
            return {
                action: 'added',
                message: 'Đã thêm sản phẩm vào danh sách yêu thích'
            };
        }
    }

    async getWatchList(userId) {
        const list = await watchListRepository.getByUserId(userId);
        return list;
    }

    async checkIsWatching(userId, productId) {
        const isWatching = await watchListRepository.exists(userId, productId);
        return isWatching;
    }

    async cancelProduct(sellerId, productId, isAdmin, session = null) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại!');
        }

        const realSellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
        if (realSellerId !== sellerId && !isAdmin) {
            throw new Error("Không có quyền thực hiện");
        }

        if (product.seller?.email) {
            dispatchEmail('NOTIFY_AUCTION_CANCELLED_TO_SELLER', {
                sellerEmail: product.seller?.email,
                productName: product.product_name
            });
        }

        if (product.current_highest_bidder?.email) {
            dispatchEmail('NOTIFY_AUCTION_CANCELLED', {
                bidderEmail: product.current_highest_bidder?.email,
                productName: product.product_name
            });
        }

        return await productRepository.cancelProduct(productId, session);
    }

    async getActiveProduct(userId) {
        return await productRepository.findActive(userId);
    }

    async resellProduct(sellerId, productId, newAuctionEndTime) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại!');
        }

        const realSellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
        if (realSellerId !== sellerId) {
            throw new Error('Bạn không có quyền bán lại sản phẩm này!');
        }

        if (product.auction_status === 'active') {
            throw new Error('Sản phẩm đang trong phiên đấu giá, không thể bán lại!');
        }

        if (product.auction_status === 'cancelled') {
            throw new Error('Sản phẩm đã bị hủy, không thể bán lại!');
        }

        if (product.auction_status === 'sold') {
            throw new Error('Sản phẩm đã được bán, không thể bán lại!');
        }

        const newEndTime = new Date(newAuctionEndTime);
        if (newEndTime <= new Date()) {
            throw new Error('Thời gian kết thúc đấu giá phải sau thời điểm hiện tại!');
        }

        const updatedProduct = await productRepository.resellProduct(productId, newEndTime);
        
        return updatedProduct;
    }

    async logicBuyProductNow(userId, product, session) {
        const amount = product.buy_it_now_price;

        // Cập nhật dữ liệu
        const currentBidCount = product.bid_counts.get(userId) || 0;
        product.bid_counts.set(userId, currentBidCount + 1);
        product.auto_bid_map.set(userId, amount);
        product.bid_count += 1;
        product.auction_status = 'sold';
        product.current_highest_price = amount;
        product.current_highest_bidder = userId;
        await productRepository.save(product, session);

        // Tạo đơn hàng
        await auctionResultRepository.create({
            product: product._id,
            winning_bidder: userId,
            seller: product.seller,
            final_price: amount,
            status: 'pending_payment'
        }, session);

        // Tạo bản ghi đấu giá
        await bidRepository.create({
            user: userId,
            product: product._id,
            price: amount
        }, session);
    }

    async buyProductNow(userId, productId) {
        return await executeTransaction(async (session) => {
            // Lock & Load Product
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error('Sản phẩm không tồn tại!');

            if (product.buy_it_now_price == null) {
                throw new Error('Sản phẩm không có giá mua ngay!');
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

            // Lưu previous holder ID để gửi email sau
            const previousHolderId = product.current_highest_bidder ? product.current_highest_bidder.toString() : null;

            // Thực hiện mua ngay
            await this.logicBuyProductNow(userId, product, session);
            const finalPrice = product.buy_it_now_price;
            const finalWinnerId = userId;

            // --- Gửi email thông báo ---

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
            if (previousHolder && previousHolder._id.toString() !== finalWinnerId.toString()) {
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
            }
        });
    }
}
export const productService = new ProductService();