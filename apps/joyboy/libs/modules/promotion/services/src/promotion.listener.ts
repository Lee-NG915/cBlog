import type { AppStartListening } from '@castlery/shared-redux-store';
import { Unsubscribe } from '@reduxjs/toolkit';
import {
  getGiftsByOrderNumberEvent,
  addGiftsByOrderNumberEvent,
  yotpoDetailsRefreshedEvent,
  setYotpoDetails,
  setFreeGiftsPromotionsV2,
  clearCouponGifts,
} from '@castlery/modules-promotion-domain';
import { invalidateCampaignGiftsCache, invalidateCouponGiftsCache } from './gift.helper';

export function setupPromotionListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    startListening({
      matcher: yotpoDetailsRefreshedEvent,
      effect: async (action, { dispatch }) => {
        if (action.payload) {
          dispatch(setYotpoDetails(action.payload));
        }
      },
    }),
    startListening({
      matcher: getGiftsByOrderNumberEvent,
      effect: async ({ payload }, { dispatch }) => {
        const data = Array.isArray(payload) ? payload : [payload];
        dispatch(setFreeGiftsPromotionsV2(data));
      },
    }),
    // Gift add-to-cart success: invalidate both soft caches so next open re-fetches
    startListening({
      matcher: addGiftsByOrderNumberEvent,
      effect: async (_action, { dispatch }) => {
        invalidateCampaignGiftsCache();
        invalidateCouponGiftsCache();
        dispatch(clearCouponGifts());
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
