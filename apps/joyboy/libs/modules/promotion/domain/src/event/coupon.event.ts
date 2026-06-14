import { getCouponsByOrderNumberV2 } from '../api/coupon.api';
import { applyCouponV2, removeCouponV2 } from '../api/coupon.api';

export const getCouponsByOrderNumberEvent = getCouponsByOrderNumberV2.matchFulfilled;
export const removeCouponEvent = removeCouponV2.matchFulfilled;
export const applyCouponEvent = applyCouponV2.matchFulfilled;
