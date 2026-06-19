import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function RatingRoutes(ratingController) {
    const router = express.Router();

    router.post('/', [checkAuth, checkNotAdmin], ratingController.createRating);

    router.get('/given', [checkAuth, checkNotAdmin], ratingController.getReviewsGiven);
    
    router.get('/received', [checkAuth, checkNotAdmin], ratingController.getReviewsReceived);

    router.get('/user/:userId', ratingController.getUserReviewsReceived);

    router.get('/auction-result/:auctionResultId', [checkAuth, checkNotAdmin], ratingController.getByAuctionResult);

    router.put('/:ratingId/type', [checkAuth, checkNotAdmin], ratingController.changeRatingType);

    return router;
}