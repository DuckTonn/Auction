import { WatchList } from '../db/schema.js';

class WatchListRepository {
  async add(userId, productId) {
    return await WatchList.findOneAndUpdate(
      { user: userId, product: productId }, 
      { user: userId, product: productId }, 
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async remove(userId, productId) {
    return await WatchList.findOneAndDelete({ 
      user: userId, 
      product: productId 
    });
  }

async getByUserId(userId) {
    return await WatchList.find({ user: userId }) 
      .populate({
        path: 'product', 
        select: 'product_name thumbnail current_highest_price start_price buy_it_now_price seller auction_status auction_start_time auction_end_time bid_count',
        populate: {
          path: 'seller',
          select: 'full_name rating'
        }
      })
      .sort({ timestamp_added: -1 })
      .lean();
  }

  async exists(userId, productId) {
    const item = await WatchList.exists({ user: userId, product: productId });
    return !!item; 
  }

  async countByProductId(productId) {
    return await WatchList.countDocuments({ product: productId });
  }
}

export const watchListRepository = new WatchListRepository();