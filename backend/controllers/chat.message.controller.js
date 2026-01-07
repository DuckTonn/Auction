import {chatMessageService} from "../services/chat.message.service.js";

class ChatMessageController {
    async sendMessage(req, res) {
        try {
            const sender = req.user._id;
            const resultId = req.params.resultId;
            const { content } = req.body;
            const messageData = {
                auction_result: resultId,
                sender,
                content
            };
            const newMessage = await chatMessageService.sendMessage(messageData);
            res.status(201).json(newMessage);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getMessages(req, res) {
        try {
            const resultId = req.params.resultId;
            const getter = req.user._id;
            const messages = await chatMessageService.listMessages(resultId, {}, getter);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

export const chatMessageController = new ChatMessageController();