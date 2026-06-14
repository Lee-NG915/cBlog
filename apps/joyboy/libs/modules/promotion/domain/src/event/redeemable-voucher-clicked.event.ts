import { createAction } from '@reduxjs/toolkit';

export interface RedeemableVoucherClickedPayload {
  /** Credits cost shown on the dropdown row (`CouponWalletOption.cost`). */
  creditsCost: number;
}

/**
 * @description User clicked a CREDITS row in `<CouponWalletAutocomplete>`'s
 * dropdown (the "Redeem X credits" entry). Fires on every click, ahead of the
 * redemption confirmation modal — independent of whether the user confirms.
 * `promotion-tracking.listener` forwards this to `EVENT_GA_CLICK_REDEEMABLE_VOUCHER`.
 */
export const redeemableVoucherClickedEvent = createAction<RedeemableVoucherClickedPayload>(
  'promotion/redeemableVoucherClicked'
);
