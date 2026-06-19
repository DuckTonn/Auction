import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Edit2, CheckCircle, XCircle } from 'lucide-react';

const RatingTab = ({ orderData, isBuyer, isSeller, user, ratings, onCreateRating, onChangeRating }) => {
    const [editingRating, setEditingRating] = useState(null);
    const [ratingType, setRatingType] = useState(1);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const canRate = ['completed', 'cancelled'].includes(orderData.status);

    // Tìm đánh giá của user hiện tại (đánh giá cho người khác)
    const myRating = ratings.find(r => r.rated_user?._id !== user._id) || null;
    
    // Tìm đánh giá của người khác dành cho user (đánh giá nhận được)
    const otherRating = ratings.find(r => r.rated_user?._id === user._id) || null;
    
    // Xác định người dùng khác trong giao dịch
    const otherUser = isBuyer ? orderData.seller : orderData.winning_bidder;

    const handleSubmitRating = async () => {
        if (!comment.trim()) {
            return;
        }

        setSubmitting(true);
        try {
            if (editingRating) {
                await onChangeRating(editingRating._id, ratingType, comment);
                setEditingRating(null);
            } else {
                await onCreateRating(ratingType, comment);
            }
            setComment('');
            setRatingType(1);
        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = () => {
        if (myRating) {
            setEditingRating(myRating);
            setRatingType(myRating.rating_type);
            setComment(myRating.comment || '');
        }
    };

    const cancelEditing = () => {
        setEditingRating(null);
        setRatingType(1);
        setComment('');
    };

    if (!canRate) {
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Đánh giá
                </h3>
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-3xl">📛</div>
                    </div>
                    <p className="text-red-600 font-medium text-lg">
                        Chỉ có thể đánh giá khi đơn hàng đã hoàn thành hoặc bị hủy
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Đánh giá giao dịch
            </h3>

            {/* Container 1: Đánh giá của bản thân cho người khác */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                        Đánh giá của bạn cho {isBuyer ? 'người bán' : 'người mua'}
                    </h4>
                </div>

                {myRating && !editingRating ? (
                    // Hiển thị đánh giá đã có
                    <div className="bg-white rounded-lg p-5 border border-blue-100">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {myRating.rating_type === 1 ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <ThumbsUp className="w-5 h-5" />
                                        <span className="font-semibold">Tích cực</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <ThumbsDown className="w-5 h-5" />
                                        <span className="font-semibold">Tiêu cực</span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={startEditing}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                                <Edit2 className="w-4 h-4" />
                                Chỉnh sửa
                            </button>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{myRating.comment}</p>
                    </div>
                ) : (
                    // Form đánh giá mới hoặc chỉnh sửa
                    <div className="bg-white rounded-lg p-5 border border-blue-100">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Loại đánh giá
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRatingType(1)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition cursor-pointer ${
                                        ratingType === 1
                                            ? 'bg-green-700 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <ThumbsUp className="w-5 h-5" />
                                    Tích cực
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRatingType(-1)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition cursor-pointer ${
                                        ratingType === -1
                                            ? 'bg-red-700 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <ThumbsDown className="w-5 h-5" />
                                    Tiêu cực
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nhận xét
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về giao dịch này..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmitRating}
                                disabled={!comment.trim() || submitting}
                                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                {submitting ? 'Đang xử lý...' : (editingRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
                            </button>
                            {editingRating && (
                                <button
                                    onClick={cancelEditing}
                                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Container 2: Đánh giá của người khác cho bản thân */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                        Đánh giá của {otherUser?.full_name || 'người dùng'} dành cho bạn
                    </h4>
                </div>

                {otherRating ? (
                    <div className="bg-white rounded-lg p-5 border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                            {otherRating.rating_type === 1 ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <ThumbsUp className="w-5 h-5" />
                                    <span className="font-semibold">Tích cực</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                    <ThumbsDown className="w-5 h-5" />
                                    <span className="font-semibold">Tiêu cực</span>
                                </div>
                            )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{otherRating.comment}</p>
                    </div>
                ) : (
                    <div className="bg-white/70 rounded-lg p-6 border border-purple-100 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-3xl">⏳</span>
                        </div>
                        <p className="text-gray-600 font-medium">
                            {otherUser?.full_name || 'Người dùng'} chưa đánh giá bạn
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Vui lòng đợi đối tác hoàn tất đánh giá
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingTab;
