import { createAction } from '@reduxjs/toolkit';

export type CartProductRecommendationPosition = 'miniCart' | 'fullCart' | 'others';

export interface CartProductRecommendationImpressionPayload {
  label: string;
  position: CartProductRecommendationPosition;
}

export const cartProductRecommendationImpressionEvent = createAction<CartProductRecommendationImpressionPayload>(
  'cart/productRecommendationImpression'
);
