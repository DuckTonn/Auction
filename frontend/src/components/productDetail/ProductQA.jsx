import { useState } from 'react'
import { productService } from '../../services/product.service'
import ToastNotification from '../common/ToastNotification'
import { avatar } from './productDetail.utils.jsx'

export default function ProductQA({ product, user, isRealSeller, questions = [], onRefresh }) {
    const [questionText, setQuestionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Phần trả lời của Seller
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isReplySubmitting, setIsReplySubmitting] = useState(false);

    // Bidder đặt câu hỏi
    const handlePostQuestion = async (e) => {
        e.preventDefault();
        if (!questionText.trim()) return;

        setIsSubmitting(true);
        try {
        await productService.postQuestion(product._id, questionText);
        setQuestionText('');
        onRefresh();
        } catch (error) {
        const message = error?.response?.data?.message || "Có lỗi xảy ra!";
        ToastNotification(message, 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    // Seller trả lời câu hỏi
    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsReplySubmitting(true);
        try {
        await productService.postAnswer(replyingToId, replyText);
        setReplyingToId(null);
        setReplyText('');
        onRefresh();
        } catch (error) {
        const message = error?.response?.data?.message || "Có lỗi xảy ra!";
        ToastNotification(message, 'error');
        } finally {
        setIsReplySubmitting(false);
        }
    };

    const bannedSet = new Set(
        (product.banned_bidder || []).map(id => id.toString())
    );
    const bannedBidder = bannedSet.has(user?._id.toString());

    const isAdmin = user?.role === 'admin';

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-600 inline-block text-gray-800">
                ❓ Hỏi & Đáp
            </h2>
            <div className="bg-white p-10 text-center rounded-xl border border-gray-200 text-gray-500 italic">
                {/* LOGIC NHẬP CÂU HỎI: Chỉ hiện khi là User thường (Bidder), không phải Seller, không phải Guest, không bị chặn */}
                {!isRealSeller && !isAdmin && user && !bannedBidder ? (
                <form onSubmit={handlePostQuestion} className="mb-8">
                    <div className="flex gap-4">
                    {avatar(user?.full_name)}
                    <div className="flex-1">
                        <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Đặt câu hỏi cho người bán..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none"
                        />
                        <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !questionText.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                        </div>
                    </div>
                    </div>
                </form>
                ) : !user ? (
                <div className="mb-8 p-4 bg-gray-200 border border-gray-300 rounded-lg text-center text-gray-800 text-sm">
                    Vui lòng <span className="font-semibold text-blue-800 cursor-pointer">đăng nhập</span> để đặt câu hỏi.
                </div>
                ) : null}

                {/* DANH SÁCH CÂU HỎI */}
                <div className="space-y-6">
                {questions.length === 0 ? (
                    <p className="text-center text-gray-500 italic py-4">Chưa có câu hỏi nào.</p>
                ) : (
                    questions.map((q) => (
                    <div key={q._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        {/* === PHẦN CÂU HỎI === */}
                        <div className="flex gap-3 items-start">
                        {/* Avatar Người hỏi */}
                        {avatar(q.asker?.full_name, 8)}

                        {/* Bong bóng nội dung câu hỏi */}
                        <div className="flex-1 bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-200">
                            <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900 text-sm">
                                {q.asker?.full_name || 'Người dùng ẩn danh'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(q.question_timestamp).toLocaleDateString('vi-VN')}
                            </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm text-left">
                            {q.question_content}
                            </p>
                        </div>
                        </div>

                        {/* Câu trả lời (Nếu có) */}
                        {q.answer_content ? (
                        <div className="mt-4 ml-11 flex gap-3 rounded-lg">
                            {/* Avatar Người trả lời */}
                            {avatar(q.answerer?.full_name, 8)}

                            {/* Bong bóng nội dung câu trả lời */}
                            <div className="flex-1 bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-200">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-blue-900 text-sm">
                                    {q.answerer?.full_name || 'Người dùng ẩn danh'}
                                </span>
                                <span className="text-xs text-blue-400">
                                    {new Date(q.answer_timestamp).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <p className="text-blue-700 leading-relaxed text-sm text-left">
                                {q.answer_content}
                            </p>
                            </div>
                        </div>
                        ) : (
                        /* LOGIC SELLER TRẢ LỜI: Chỉ hiện khi là Seller và chưa có câu trả lời */
                        isRealSeller && (
                            <div className="mt-3 ml-11">
                            {replyingToId === q._id ? (
                                <div className="animate-fade-in">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Nhập câu trả lời..."
                                    className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 mb-2"
                                    rows="2"
                                    autoFocus
                                    />
                                    <div className="flex gap-2">
                                    <button 
                                        onClick={handleSubmitReply}
                                        disabled={isReplySubmitting || !replyText.trim()}
                                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 cursor-pointer flex items-center gap-1"
                                    >
                                        {isReplySubmitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
                                    </button>
                                    <button 
                                        onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 cursor-pointer flex items-center gap-1"
                                    >
                                        Huỷ
                                    </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                onClick={() => setReplyingToId(q._id)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Trả lời câu hỏi này
                                </button>
                            )}
                            </div>
                        )
                        )}
                    </div>
                    ))
                )}
                </div>
            </div>
        </div>
    );
}
