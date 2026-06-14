import { Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  appliedCouponActionSucceededEvent,
  campaignProgressBarLinkClickedEvent,
  chooseFreeGiftClickedEvent,
  redeemableVoucherClickedEvent,
} from '@castlery/modules-promotion-domain';
import {
  EVENT_GA_APPLIED_COUPON,
  EVENT_DY_PROMO_CODE_ENTERED,
  EVENT_GA_CLICK_REDEEMABLE_VOUCHER,
  EVENT_GA_CAMPAIGN_PROGRESS_BAR_LINK_CLICK,
  EVENT_GA_CHOOSE_FREE_GIFT,
} from '../events';

/**
 * @description Subscribes to promotion-domain behavior events and fans them out to
 * channel-specific tracking triggers. The listener stays decoupled from RTK Query
 * endpoint matchers — payload semantics are owned by the promotion domain.
 */
export function setupPromotionTrackingListeners(startListening: AppStartListening): Unsubscribe {
  if (!accessInWeb) {
    return () => undefined;
  }

  const subscriptions = [
    startListening({
      actionCreator: appliedCouponActionSucceededEvent,
      effect: async ({ payload }, { dispatch }) => {
        const { couponCode, category } = payload;
        if (!couponCode) return;

        await Promise.allSettled([
          dispatch(EVENT_GA_APPLIED_COUPON({ couponCode, category })),
          dispatch(EVENT_DY_PROMO_CODE_ENTERED({ promoCode: couponCode })),
        ]);
      },
    }),
    startListening({
      actionCreator: redeemableVoucherClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_REDEEMABLE_VOUCHER({ label: String(payload.creditsCost) }));
      },
    }),
    startListening({
      actionCreator: campaignProgressBarLinkClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(
          EVENT_GA_CAMPAIGN_PROGRESS_BAR_LINK_CLICK({
            campaignName: payload.campaignName,
            discount: payload.discount,
          })
        );
      },
    }),
    startListening({
      actionCreator: chooseFreeGiftClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CHOOSE_FREE_GIFT({ label: payload.label }));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
