import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { ratingService } from '../services/rating.service.js';
import { executeTransaction } from '../db/db.helper.js';

class AuctionResultService {
    async getOrderDetails(orderId, userId) {
        const order = await auctionResultRepository.findById(orderId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        // Validate: Chỉ người mua hoặc người bán mới được xem
        const isBuyer = order.winning_bidder._id.toString() === userId;
        const isSeller = order.seller._id.toString() === userId;

        if (!isBuyer && !isSeller) {
            throw new Error("Bạn không có quyền xem đơn hàng này");
        }

        return order;
    }

    async getOrderByProductId(productId, userId) {
        const order = await auctionResultRepository.findByProduct(productId);
        if (!order) throw new Error("Sản phẩm đã chọn không có đơn hàng đấu giá tương ứng");

        // Validate: Chỉ người mua hoặc người bán mới được xem
        const isBuyer = order.winning_bidder._id.toString() === userId;
        const isSeller = order.seller._id.toString() === userId;

        if (!isBuyer && !isSeller) {
            throw new Error("Bạn không có quyền xem đơn hàng này");
        }

        return order;
    }

    async getOrdersByWinner(userId, session = null) {
        return await auctionResultRepository.findByWinner(userId, session);
    }

    async getOrdersBySeller(userId, session = null) {
        return await auctionResultRepository.findBySeller(userId, session);
    }

    // ======= NGƯỜI MUA THANH TOÁN =======
    async submitPayment(orderId, userId, address, paymentProofUrl) {
        const order = await auctionResultRepository.findById(orderId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        // Validate quyền hạn & trạng thái
        if (order.winning_bidder._id.toString() !== userId) {
            throw new Error("Bạn không phải người thắng cuộc của sản phẩm này");
        }

        if (order.status !== 'pending_payment') {
            throw new Error("Trạng thái đơn hàng không hợp lệ để thanh toán");
        }

        return await auctionResultRepository.updatePaymentInfo(order._id, address, paymentProofUrl);
    }

    // ======= SELLER XÁC NHẬN GỬI HÀNG =======
    async confirmShipment(orderId, userId, shippingProofUrl) {
        const order = await auctionResultRepository.findById(orderId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        // Validate quyền hạn & trạng thái
        if (order.seller._id.toString() !== userId) {
            throw new Error("Bạn không phải người bán sản phẩm này");
        }

        if (order.status !== 'pending_shipment') {
            throw new Error("Người mua chưa thanh toán hoặc đơn hàng đã được xử lý");
        }

        return await auctionResultRepository.updateShipmentInfo(order._id, shippingProofUrl);
    }

    // ======= NGƯỜI MUA XÁC NHẬN ĐÃ NHẬN HÀNG =======
    async confirmReceipt(orderId, userId) {
        const order = await auctionResultRepository.findById(orderId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        // Validate quyền hạn & trạng thái
        if (order.winning_bidder._id.toString() !== userId) {
            throw new Error("Không có quyền thực hiện");
        }

        if (order.status !== 'shipping') {
            throw new Error("Đơn hàng chưa được gửi đi hoặc đã hoàn tất");
        }

        return await auctionResultRepository.completeTransaction(order._id);
    }

    // ======= HUỶ GIAO DỊCH (SELLER ONLY) =======
    async cancelTransaction(orderId, sellerId, reason) {
        return await executeTransaction(async (session) => {
            const order = await auctionResultRepository.findById(orderId);
            if (!order) throw new Error("Đơn hàng không tồn tại");

            // Validate
            if (order.seller._id.toString() !== sellerId) {
                throw new Error("Bạn không có quyền huỷ đơn hàng này");
            }
            if (order.status === 'completed' || order.status === 'cancelled') {
                throw new Error("Không thể huỷ đơn hàng đã hoàn tất hoặc đã huỷ trước đó");
            }

            if (!reason || reason.trim() === '') {
                reason = 'Người thắng không thanh toán';
            }

            // Update trạng thái đơn hàng & đánh giá -1 cho bidder
            const updatedOrder = await auctionResultRepository.cancelTransaction(order._id, reason, session);
            
            await ratingService.addRating({
                rater: sellerId,
                rated_user: order.winning_bidder._id,
                auction_result: order._id,
                rating_type: -1,
                comment: reason
            }, session);

            return updatedOrder;
        });
    }
}

export const auctionResultService = new AuctionResultService();