import { getProductReviewByVariant } from '../api/product.api';
import { getReviewsByVariant } from '../api/review.api';

export const reviewsUpdatedEvent = getReviewsByVariant.matchFulfilled;

export const productReviewsUpdatedEvent = getProductReviewByVariant.matchFulfilled;
