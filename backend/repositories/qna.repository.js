import { QnA } from "../db/schema.js";

class QnARepository {
    async create(qnaData, session = null) {
        const result = new QnA(qnaData);
        return await result.save({ session });
    }

    async findbyProductId(productId) {
        return await QnA.find({ product: productId })
            .populate('asker', 'full_name role email')
            .populate('answerer', 'full_name role email')
            .sort({ question_timestamp: -1 });
    }

    async findById(qnaId) {
        return await QnA.findById(qnaId)
            .populate({
                path: 'product',
                populate: { path: 'seller', select: 'full_name email' }
            })
            .populate('asker', 'full_name email')
            .populate('answerer', 'full_name email');
    }
    
    async addAnswer(qnaId, answerData) {
        return await QnA.findByIdAndUpdate(
            qnaId,
            {
                answerer: answerData.answerer,
                answer_content: answerData.answer_content,
                answer_timestamp: answerData.answer_timestamp
            },
            { new: true }
        );
    }

    async deleteById(qnaId) {
        return await QnA.findByIdAndDelete(qnaId);
    }

    async exists(qnaId) {
        return await QnA.exists({ _id: qnaId });
    }

    async existsAnswered(qnaId) {
        return await QnA.exists({ _id: qnaId, answer_content: { $exists: true } });
    }
}

export const qnaRepository = new QnARepository();