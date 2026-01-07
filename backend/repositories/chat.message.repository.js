import { ChatMessage } from '../../db/schema.js';

class ChatMessageRepository {
  async create({ auction_result, sender, content }) {
    const msg = new ChatMessage({ auction_result, sender, content });
    return await msg.save();
  }

  async findByAuctionResult(auctionResultId, { limit = 50, skip = 0, sort = { createdAt: 1 } } = {}) {
    return await ChatMessage.find({ auction_result: auctionResultId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('sender', 'full_name role');
  }
}

export const chatMessageRepository = new ChatMessageRepository();
