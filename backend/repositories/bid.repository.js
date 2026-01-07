import { Bid } from '../../db/schema.js';

class BidRepository {
    async create(bidData, session) {
        const bid = new Bid(bidData);
        return await bid.save({ session });
    }

    async findByProduct(productId, session = null) {
        return await Bid.find({ product: productId }).session(session)
            .sort({ date: -1 })
            .populate('user', 'full_name rating_count rating_score is_deleted');
    }

    async findHighestByUser(userId, session = null) {
        return await Bid.findOne({ user: userId }).session(session)
            .sort({ price: -1 });
    }

    async banBidsByUser(userId, productId, session = null) {
        return await Bid.updateMany(
            { user: userId, product: productId, is_valid: true },
            { $set: { is_valid: false } },
            { session: session }
        );
    }

    async banAllBidsByUser(userId, session = null) {
        return await Bid.updateMany(
            { user: userId, is_valid: true },
            { $set: { is_valid: false } },
            { session: session }
        );
    }

    async findByUser(userId, session = null) {
        return await Bid.find({ user: userId }).session(session)
            .distinct('product');
    }


    async scaleDownBids(productId, newPrice, session = null) {
        return await Bid.updateMany({
            product: productId,
            price: { $gt: newPrice }
        }, {
            $set: { price: newPrice, is_adjusted: true }
        }).session(session);
    }
}

export const bidRepository = new BidRepository();