import { getGiftsByOrderNumberV2, addGiftsByOrderNumberV2 } from '../api/promotion.api';
export const getGiftsByOrderNumberEvent = getGiftsByOrderNumberV2.matchFulfilled;
export const addGiftsByOrderNumberEvent = addGiftsByOrderNumberV2.matchFulfilled;

// export const removeCouponEvent = applyCoupon.matchFulfilled;
