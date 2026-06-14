import { addCouponToCart, removeCouponFromCart } from '../api/coupons.api';
import { isAnyOf } from '@reduxjs/toolkit';

export const updatedCouponToCartEvent = isAnyOf(addCouponToCart.matchFulfilled, removeCouponFromCart.matchFulfilled);
