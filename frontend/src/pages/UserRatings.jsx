import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ratingService } from '../services/ratingService';
import { ThumbsUp, ThumbsDown, Package, Star, ArrowLeft } from 'lucide-react';
import ToastNotification from '../components/common/ToastNotification';
import { useAuth } from '../context/AuthContext';

const UserRatings = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [ratedUser, setRatedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPositive: 0,
        totalNegative: 0,
        total: 0,
        percentage: 0
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (user && userId && user._id === userId) {
            navigate('/profile/ratings', { replace: true });
        }
    }, [user, userId, navigate]);

    useEffect(() => {
        if (userId) {
            fetchRatings();

            const intervalId = setInterval(() => fetchRatings(false), 30000);

            return () => clearInterval(intervalId);
        }
    }, [userId]);

    const fetchRatings = async (loading = true) => {
        try {
            if (loading) setLoading(true);
            const response = await ratingService.getUserRatings(userId);
            
            let reviewsData = [];
            if (Array.isArray(response.data)) {
                reviewsData = response.data;
            } else if (Array.isArray(response)) {
                reviewsData = response;
            }
            
            setRatings(reviewsData);
            
            if (response.user && response.user.full_name) {
                setRatedUser(response.user);
            } else if (reviewsData.length > 0 && reviewsData[0].rated_user) {
                setRatedUser(reviewsData[0].rated_user);
            }

            const positive = reviewsData.filter(r => r.rating_type === 1).length;
            const negative = reviewsData.filter(r => r.rating_type === -1).length;
            const total = reviewsData.length;
            const percentage = total > 0 ? Math.round((positive / total) * 100) : 0;

            setStats({
                totalPositive: positive,
                totalNegative: negative,
                total,
                percentage
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đánh giá:', error);
            ToastNotification('Không thể tải danh sách đánh giá', 'error');
        } finally {
            if (loading) setLoading(false);
        }
    };

    const maskName = (name) => {
        if (!name || typeof name !== 'string') return 'u***r'; 

        const cleanName = name.split('(')[0].trim();
        
        if (!cleanName) return 'u***r';

        const chars = Array.from(cleanName);
        const len = chars.length;

        if (len === 1) {
            return `${chars[0]}***${chars[0]}`;
        }

        const first = chars[0];
        const last = chars[len - 1];
        const middleLength = Math.min(len - 2, 6); 
        const middle = "*".repeat(middleLength);
        
        return `${first}${middle}${last}`;
    };

    const getUserName = () => {
        return maskName(ratedUser?.full_name) || 'người dùng';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Đang tải đánh giá...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Quay lại</span>
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá và phản hồi</h1>
                    <p className="text-gray-600">
                        Xem các đánh giá mà{" "}
                        <span className="font-semibold text-yellow-900">
                            {getUserName()}
                        </span>{" "}
                        đã nhận
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-600 mt-1">Tổng đánh giá</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.totalPositive}</div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                                Đánh giá tích cực
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.totalNegative}</div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                                Đánh giá tiêu cực
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                            <div className="text-sm text-gray-600 mt-1">Tỷ lệ đánh giá tích cực</div>
                        </div>
                    </div>
                </div>

                {ratings.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-gray-500">Người dùng chưa nhận được đánh giá nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ratings.map((rating) => {
                            const productName = rating.auction_result?.product?.product_name || 'Sản phẩm không xác định';
                            const productImage = rating.auction_result?.product?.thumbnail || '/placeholder.jpg';
                            const finalPrice = rating.auction_result?.final_price || 0;
                            const isPositive = rating.rating_type === 1;
                            const maskedName = maskName(rating.rater?.full_name);

                            return (
                                <div 
                                    key={rating._id} 
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-lg">
                                                    {maskedName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {maskedName}
                                                </h3>
                                            </div>
                                        </div>
                                        
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {isPositive ? 
                                                <ThumbsUp className="w-4 h-4" /> : 
                                                <ThumbsDown className="w-4 h-4" />
                                            }
                                            <span className="text-sm font-medium">
                                                {isPositive ? 'Tích cực' : 'Tiêu cực'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-500 mb-3">
                                        {new Date(rating.createdAt).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>

                                    {rating.comment && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-gray-700 text-sm">{rating.comment}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <img 
                                            src={productImage} 
                                            alt={productName}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                                                <Package className="w-4 h-4" />
                                                <span className="text-xs font-medium">Đơn hàng</span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                                                {productName}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Giá: <span className="font-semibold text-gray-900">
                                                    {finalPrice.toLocaleString('vi-VN')} ₫
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRatings;
