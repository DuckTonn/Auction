import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function ChatMessageRoutes(chatMessageController) {
    const router = express.Router();

    // Gửi tin nhắn trong một cuộc trò chuyện cụ thể
    router.post('/:resultId', [checkAuth, checkNotAdmin], chatMessageController.sendMessage);
    // Lấy tất cả tin nhắn trong một cuộc trò chuyện cụ thể
    router.get('/get/:resultId', [checkAuth, checkNotAdmin], chatMessageController.getMessages);
    return router;
}