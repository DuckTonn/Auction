import { ratingService } from '../services/rating.service.js';

class RatingController {
    async createRating(req, res) {
        try {
            const { rated_user, auction_result, rating_type, comment } = req.body;
            const rater = req.user._id; // Từ auth middleware
            const data = {
                rater,
                rated_user,
                auction_result,
                rating_type, 
                comment,
            };

            const result = await ratingService.addRating(data);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getReviewsGiven(req, res) {
        try {
            const userId = req.user._id;
            const reviews = await ratingService.getReviewsGiven(userId);
            return res.status(200).json({
                message: 'Lấy danh sách đánh giá đã cho thành công!',
                data: reviews
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getReviewsReceived(req, res) {
        try {
            const userId = req.user._id;
            const reviews = await ratingService.getReviewsReceived(userId);
            return res.status(200).json({
                message: 'Lấy danh sách đánh giá đã nhận thành công!',
                ...reviews
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getUserReviewsReceived(req, res) {
        try {
            const userId = req.params.userId;
            const reviews = await ratingService.getReviewsReceived(userId);
            return res.status(200).json({
                message: 'Lấy danh sách đánh giá đã nhận của người dùng thành công!',
                ...reviews
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getByAuctionResult(req, res) {
        try {
            const auctionResultId = req.params.auctionResultId;

            const ratings = await ratingService.getByAuctionResult(auctionResultId);
            return res.status(200).json({
                message: 'Lấy đánh giá theo kết quả đấu giá thành công!',
                data: ratings
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async changeRatingType(req, res) {
        try {
            const ratingId = req.params.ratingId;
            const raterId = req.user._id;

            const { newType, newComment } = req.body;

            const updatedRating = await ratingService.changeRatingType(raterId, ratingId, newType, newComment);
            return res.status(200).json({
                message: 'Cập nhật loại đánh giá thành công!',
                data: updatedRating
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const ratingController = new RatingController();