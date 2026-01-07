import mongoose from 'mongoose';
import { ratingRepository } from '../repositories/rating.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { executeTransaction } from '../db/db.helper.js';

class RatingService {
    async _addRatingLogic(data, session) {
        const { rater, rated_user, auction_result, rating_type } = data;

        const existing = await ratingRepository.findByAuctionAndRater(auction_result, rater, session);
        if (existing) {
            throw new Error('Bạn đã đánh giá giao dịch này rồi!');
        }

        // Validate input
        if (![-1, 1].includes(rating_type)) {
            throw new Error('Loại đánh giá không hợp lệ!');
        }

        // Validate trạng thái đơn hàng
        const order = await auctionResultRepository.findById(auction_result, session);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại!');
        }

        // Chỉ cho phép đánh giá khi đơn hàng đã hoàn tất hoặc bị hủy
        const allowedStatus = ['completed', 'cancelled'];
        if (!allowedStatus.includes(order.status)) {
            throw new Error('Giao dịch chưa hoàn tất (hoặc chưa bị hủy), không thể đánh giá lúc này!');
        }

        // Tạo rating
        await ratingRepository.create(data, session);

        // Tính toán lại chỉ số rating
        const newStats = await ratingRepository.calculateUserStats(rated_user, session);

        // Cập nhật vào bảng User
        await userRepository.updateRatingStats(
            rated_user, 
            newStats.score, 
            newStats.count, 
            session
        );

        return { message: 'Đánh giá thành công!' };
    }

    async addRating(data, externalSession = null) {
        if (externalSession) {
            return await this._addRatingLogic(data, externalSession);
        }

        return await executeTransaction(async (newSession) => {
            return await this._addRatingLogic(data, newSession);
        });
    }

    async getReviewsGiven(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại!');
        }
        return await ratingRepository.getReviewsGiven(userId);
    }

    async getReviewsReceived(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại!');
        }
        return {
            user: {
                _id: user.id,
                full_name: user.full_name,
                rating_score: user.rating_score,
                rating_count: user.rating_count,
            },
            data: await ratingRepository.getReviewsReceived(userId),
        }
    }

    async getByAuctionResult(auctionResultId) {
        return await ratingRepository.findByAuctionResult(auctionResultId);
    }

    async changeRatingType(raterId, ratingId, newType, newComment) {
        return await executeTransaction(async (session) => {
            const rating = await ratingRepository.findById(ratingId);
            if (!rating) {
                throw new Error('Đánh giá không tồn tại!');
            }

            if (rating.rater.toString() !== raterId.toString()) {
                throw new Error('Bạn không có quyền thay đổi loại đánh giá này!');
            }

            if (![-1, 1].includes(newType)) {
                throw new Error('Loại đánh giá không hợp lệ!');
            }

            const changed = await ratingRepository.changeRatingType(ratingId, newType, newComment, session);
            if (!changed) {
                throw new Error('Cập nhật loại đánh giá thất bại!');
            }

            // Tính toán lại chỉ số rating
            const newStats = await ratingRepository.calculateUserStats(rating.rated_user, session);

            // Cập nhật vào bảng User
            await userRepository.updateRatingStats(
                rating.rated_user, 
                newStats.score, 
                newStats.count, 
                session
            );

            return changed;
        });
    }

    async _deleteGivenRatingsByUserLogic(userId, session) {
        // Lấy tất cả đánh giá đã đánh giá bởi userId
        const ratings = await ratingRepository.getReviewsGiven(userId, session);

        for (const rating of ratings) {
            await ratingRepository.deleteById(rating._id, session);

            // Tính toán lại chỉ số rating
            const newStats = await ratingRepository.calculateUserStats(rating.rated_user, session);

            // Cập nhật vào bảng User
            await userRepository.updateRatingStats(
                rating.rated_user,
                newStats.score,
                newStats.count,
                session
            );
        }
        return;
    }

    async deleteGivenRatingsByUser(userId, externalSession = null) {
        if (externalSession) {
            return await this._deleteGivenRatingsByUserLogic(userId, externalSession);
        }

        return await executeTransaction(async (session) => {
            // Lấy tất cả đánh giá đã đánh giá bởi userId
            const ratings = await ratingRepository.getReviewsGiven(userId, session);

            for (const rating of ratings) {
                await ratingRepository.deleteById(rating._id, session);

                // Tính toán lại chỉ số rating
                const newStats = await ratingRepository.calculateUserStats(rating.rated_user, session);

                // Cập nhật vào bảng User
                await userRepository.updateRatingStats(
                    rating.rated_user, 
                    newStats.score, 
                    newStats.count, 
                    session
                );
            }
            return;
        });
    }
}

export const ratingService = new RatingService();