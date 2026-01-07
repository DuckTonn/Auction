import { User } from '../db/schema.js';
import { Bid } from '../db/schema.js';

export const recalculateAuctionState = async (product, currentHolderId, session = null) => {
    const allBids = Array.from(product.auto_bid_map.entries())
        .map(([uid, price]) => ({ userId: uid.toString(), price }));

    if (allBids.length === 0) {
        product.current_highest_price = product.start_price;
        product.current_highest_bidder = null;
        return product;
    }

    // Danh sách bidder đã bị xóa khỏi hệ thống
    const bidderIds = allBids.map(b => b.userId);
    
    const deletedUsers = await User.find({
        _id: { $in: bidderIds },
        is_deleted: true
    }).session(session).select('_id');

    // Lọc bidder
    const deletedSet = new Set(deletedUsers.map(u => u._id.toString()));
    const bannedIds = new Set(product.banned_bidder.map(id => id.toString()));
    const activeIds = allBids.filter(bid => 
        !bannedIds.has(bid.userId) && 
        !deletedSet.has(bid.userId)
    );

    // Sort
    activeIds.sort((a, b) => {
        if (b.price !== a.price) {
            return b.price - a.price;
        }

        // Nếu giá bằng nhau, ưu tiên người đang giữ giá cao nhất hiện tại
        if (currentHolderId && a.userId === currentHolderId.toString()) {
            return -1;
        }

        if (currentHolderId && b.userId === currentHolderId.toString()) {
            return 1;
        }

        return 0;
    });

    const winner = activeIds[0];
    const second = activeIds[1];

    // Tính toán giá mới
    let newPrice = product.start_price;
    let newWinnerId = null;

    if (winner) {
        newWinnerId = winner.userId;
        if (second) {
            newPrice = second.price;

            /* === LOGIC XỬ LÝ SYSTEM BID ===

            // Tìm bản ghi mới nhất trong lịch sử
            const latestHistoryBid = await Bid.findOne({
                product: product._id,
                user: { $in: activeIds.map(b => b.userId) }
            }).session(session).sort({ date: -1 });

            // Chỉ tạo record mới nếu Giá Mới > Giá Lịch Sử Gần Nhất
            if (latestHistoryBid && latestHistoryBid.price < newPrice) {
                // Cập nhật bản ghi cho người đang giữ vị trí cao nhất hiện tại
                const currentHolderMaxBidObj = activeIds.find(b => b.userId === latestHistoryBid.user.toString());
                const amountForHolder = Math.min(newPrice, currentHolderMaxBidObj?.price || newPrice);

                // Ghi bản ghi mới
                const revealBid = new Bid({
                    user: latestHistoryBid.user,
                    product: product._id,
                    price: amountForHolder,
                    is_priority: true
                });
                await revealBid.save({ session });

                // Tạo bản ghi chiến thắng cho Winner Mới (Nếu người này khác người giữ vị trí cao nhất hiện tại)
                if (latestHistoryBid.user.toString() !== winner.userId.toString()) {
                    await new Promise(r => setTimeout(r, 1000));
                    const winnerBid = new Bid({
                        user: winner.userId,
                        product: product._id,
                        price: newPrice,
                        is_priority: true
                    });
                    await winnerBid.save({ session });

                    // TODO: Gửi email thông báo cho người này rằng họ đã bị vượt mất vị trí cao nhất
                }
            }
            */
        }
        // Nếu sàn chỉ còn 1 người giá hiện tại vẫn là giá ban đầu
    }
    // Nếu sàn không còn người đấu giá hiện tại thì giá vẫn là giá ban đầu

    // Cập nhật ngược vào product
    product.current_highest_price = newPrice;
    product.current_highest_bidder = newWinnerId;

    return product;
};