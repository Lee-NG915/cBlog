import { createAction } from '@reduxjs/toolkit';

/** Dispatched after credits are successfully redeemed in the cart coupon wallet */
export const cartCreditsRedeemedEvent = createAction('couponWallet/cartCreditsRedeemed');

/** Dispatched after credits are successfully redeemed in the checkout coupon wallet */
export const checkoutCreditsRedeemedEvent = createAction('couponWallet/checkoutCreditsRedeemed');
