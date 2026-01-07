import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function QnARoutes(qnaController) {
    const router = express.Router();

    // Trả lời cho một câu hỏi cụ thể
    router.post('/:id/answers', [checkAuth, checkNotAdmin], qnaController.answerQuestion);

    return router;
}