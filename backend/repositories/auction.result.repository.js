import { AuctionResult } from '../../db/schema.js';

class AuctionResultRepository {
    async create(resultData, session = null) {
        const result = new AuctionResult(resultData);
        return await result.save({ session });
    }

    async findById(id, session = null) {
        return await AuctionResult.findById(id).session(session)
            .populate('product', 'product_name thumbnail')
            .populate('winning_bidder', 'full_name email rating_score rating_count')
            .populate('seller', 'full_name email rating_score rating_count');
    }

    async findByProduct(productId, session = null) {
        return await AuctionResult.findOne({ product: productId }).session(session)
            .populate('winning_bidder', 'full_name email rating_score rating_count')
            .populate('seller', 'full_name email rating_score rating_count');
    }

    async findByWinner(userId, session = null) {
        return await AuctionResult.find({ winning_bidder: userId }).session(session)
            .sort({ createdAt: -1 })
            .populate('product', 'product_name thumbnail')
            .populate('seller', 'full_name email rating_score rating_count');
    }

    async findBySeller(userId, session = null) {
        return await AuctionResult.find({ seller: userId }).session(session)
            .sort({ createdAt: -1 })
            .populate('product', 'product_name thumbnail')
            .populate('winning_bidder', 'full_name email rating_score rating_count');
    }

    async existPendingTransaction(userId, session = null) {
        return await AuctionResult.exists({
            $or: [
                { seller: userId },
                { winning_bidder: userId }
            ],
            status: { $nin: ['completed', 'cancelled'] }
        }).session(session);
    }

    // Người mua thanh toán -> Chờ vận chuyển
    async updatePaymentInfo(id, address, paymentProofUrl, session = null) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { 
                shipping_address: address,
                payment_proof: paymentProofUrl,
                status: 'pending_shipment'
            },
            { new: true, session }
        );
    }

    // Người bán gửi hàng -> Đang giao
    async updateShipmentInfo(id, shippingProofUrl, session = null) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { 
                shipping_proof: shippingProofUrl,
                status: 'shipping'
            },
            { new: true, session }
        );
    }

    // Người mua xác nhận -> Hoàn tất
    async completeTransaction(id, session = null) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true, session }
        );
    }

    // Huỷ giao dịch
    async cancelTransaction(id, reason, session = null) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { 
                status: 'cancelled',
                cancellation_reason: reason,
                cancelled_at: new Date()
            },
            { new: true, session }
        );
    }
}

export const auctionResultRepository = new AuctionResultRepository();