import api from './api.js';

// Lấy tất cả tin nhắn của một auction result
export const fetchChatMessages = async (resultId) => {
    try {
        const response = await api.get(`/chat/get/${resultId}`);
        return response.data; // Array of messages
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        throw error;
    }
};

// Gửi tin nhắn mới
export const sendChatMessage = async (resultId, content) => {
    try {
        const response = await api.post(`/chat/${resultId}`, { content });
        return response.data; // Message object
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw error;
    }
};
