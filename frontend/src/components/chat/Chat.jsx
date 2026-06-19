import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { MessageType } from './ChatMessage';
import * as chatService from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';

export const avatar = (name, background = 'random') => {
  if (!name || typeof name !== 'string') name = '?';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff`;
};

const Chat = ({ resultId, otherUser }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const config = {
    appearance: {
      brandColor: '#3B82F6'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load messages khi mở chat
  useEffect(() => {
    if (isOpen && resultId) {
      loadMessages();
    }
  }, [isOpen, resultId]);

  // Polling: Fetch new messages every 5 seconds
  useEffect(() => {
    if (!isOpen || !resultId) return;

    const pollInterval = setInterval(() => {
      loadMessages(true); // silent load
    }, 5000); // 5 seconds

    return () => clearInterval(pollInterval);
  }, [isOpen, resultId]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const loadMessages = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await chatService.fetchChatMessages(resultId);
      
      // Transform backend messages to frontend format
      const formattedMessages = data.map(msg => ({
        id: msg._id,
        type: msg.sender._id === user._id ? MessageType.Outbound : MessageType.Inbound,
        text: msg.content,
        avatar: msg.sender._id === user._id 
          ? avatar(user.full_name, '3B82F6')
          : avatar(msg.sender.full_name || otherUser?.full_name, '10B981'),
        timestamp: msg.createdAt
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !resultId) return;

    const tempMessage = {
      id: Date.now(),
      type: MessageType.Outbound,
      text: inputText,
      avatar: avatar(user.name, '3B82F6'),
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setInputText('');
    setShowEmojiPicker(false); // Close emoji picker

    try {
      const newMessage = await chatService.sendChatMessage(resultId, inputText);
      
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? {
          id: newMessage._id,
          type: MessageType.Outbound,
          text: newMessage.content,
          avatar: avatar(user.full_name, '3B82F6'),
          timestamp: newMessage.createdAt
        } : msg
      ));

      // Reload messages to get any new ones
      await loadMessages(true);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const onEmojiClick = (emojiData) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-slideUp">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  {otherUser?.full_name || 'Chat'}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:text-red-600 hover:bg-opacity-20 rounded-full p-2 transition-all hover:rotate-90 duration-300"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages with gradient background */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Đang tải tin nhắn...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <p className="mb-2">Chưa có tin nhắn</p>
                  <p className="text-sm">Gửi tin nhắn đầu tiên!</p>
                </div>
              </div>
            ) : (
              <>
                {/* Welcome message */}
                
                {messages.map((msg, index) => (
                  <div key={msg.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                    <ChatMessage
                      type={msg.type}
                      text={msg.text}
                      avatar={msg.avatar}
                      config={config}
                    />
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input with better styling */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-full mb-2 right-4 z-10">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={320}
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Emoji button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`transition-colors p-2 hover:bg-gray-100 rounded-full ${
                  showEmojiPicker ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'
                }`}
                title="Thêm emoji"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Input field */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-all flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                aria-label="Send"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chat;
