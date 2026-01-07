import api from './api';

class RatingService {
    async createRating(rated_user, auction_result, rating_type, comment) {
        try {
            const response = await api.post('/ratings', {
                rated_user,
                auction_result,
                rating_type,
                comment
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getRatingByAuctionResult(auction_result_id) {
        try {
            const response = await api.get(`/ratings/auction-result/${auction_result_id}`);

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getReviewsGiven() {
        try {
            const response = await api.get(`/ratings/given`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getReviewsReceived() {
        try {
            const response = await api.get(`/ratings/received`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async changeRatingType(ratingId, newType, newComment) {
        try {
            const response = await api.put(`/ratings/${ratingId}/type`, {
                newType,
                newComment
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getUserRatings(userId) {
        try {
            const response = await api.get(`/ratings/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const ratingService = new RatingService();