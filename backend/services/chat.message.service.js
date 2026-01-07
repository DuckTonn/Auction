import { chatMessageRepository } from '../repositories/chat.message.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';

class ChatMessageService {
  async sendMessage({ auction_result, sender, content }) {
    if (!auction_result || !sender || !content || !content.trim()) {
      throw new Error('Thiếu dữ liệu: auction_result, sender, content');
    }

    // Fetch auction result để validate sender
    const auctionData = await auctionResultRepository.findById(auction_result);
    if (!auctionData) {
      throw new Error('Giao dịch không tồn tại');
    }
    const winnerId = auctionData.winning_bidder?._id || auctionData.winning_bidder;
    const sellerId = auctionData.seller?._id || auctionData.seller;

    if (sender.toString() !== winnerId.toString() && sender.toString() !== sellerId.toString()) {
      throw new Error('Người gửi không thuộc giao dịch này');
    }

    return await chatMessageRepository.create({ auction_result, sender, content: content.trim() });
  }

  async listMessages(auctionResultId, options = {}, getter) {
    if (!auctionResultId) throw new Error('Thiếu auctionResultId');
    const auctionData = await auctionResultRepository.findById(auctionResultId);
    if (!auctionData) {
      throw new Error('Giao dịch không tồn tại');
    }
    const winnerId = auctionData.winning_bidder?._id || auctionData.winning_bidder;
    const sellerId = auctionData.seller?._id || auctionData.seller;

    if (getter.toString() !== winnerId.toString() && getter.toString() !== sellerId.toString()) {
      throw new Error('Người lấy không thuộc giao dịch này');
    }

    const { limit = 50, skip = 0, sort = { createdAt: 1 } } = options;
    return await chatMessageRepository.findByAuctionResult(auctionResultId, { limit, skip, sort });
  }
}

export const chatMessageService = new ChatMessageService();
