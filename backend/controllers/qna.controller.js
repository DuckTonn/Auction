import { qnaService } from "../services/qna.service.js";
class QnaController {
    async askQuestion(req, res) {
        try {
            const asker = req.user._id; // Từ auth middleware
            const { question_content } = req.body;
            const productId = req.params.id;
            const qna = await qnaService.askQuestion({ product_id: productId, asker, question_content });
            return res.status(201).json({
                message: 'Câu hỏi đã được gửi thành công!',
                data: qna
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async listByProduct(req, res) {
        try {
            const productId = req.params.id;
            const qnaList = await qnaService.listByProduct(productId);
            return res.status(200).json({
                message: 'Lấy danh sách hỏi đáp thành công!',
                data: qnaList
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async answerQuestion(req, res) {
        try {
            const qnaId = req.params.id;
            const answerer = req.user._id; // Từ auth middleware
            const { answer_content } = req.body;
            await qnaService.answerQuestion(qnaId, { answerer, answer_content });
            return res.status(200).json({
                message: 'Trả lời câu hỏi thành công!'
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
    
}

export const qnaController = new QnaController();