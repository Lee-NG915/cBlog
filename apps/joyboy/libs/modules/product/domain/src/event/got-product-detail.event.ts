import { getProductByIdOrSlug, getProductReviewByVariant } from '../api/product.api';
export const gotProductDetailEvent = getProductByIdOrSlug.matchFulfilled;

export const getProductReviewsEvent = getProductReviewByVariant.matchFulfilled;
