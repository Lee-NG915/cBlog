import { createAsyncThunk } from '@reduxjs/toolkit';
import type { SummarySchema, GiftPoolSchema, GiftPoolGiftItemSchema } from '@castlery/types';
import { RootState } from '@castlery/shared-redux-store';
import { selectCartZipcode } from '@castlery/modules-cart-domain';
import { batchRetrieveGiftsByVariantIds, selectGiftsVariantList } from '@castlery/modules-promotion-domain';
import { logger } from '@castlery/observability/client';

// --- Campaign gifts soft cache ---
// Cache source-of-truth is the store's `giftsVariantList` — we skip fetch when
// every target variantId is already represented there. This flag forces the
// next fetch (e.g. after gift add-to-cart) to bypass that coverage check.
let forceNextCampaignFetch = false;

export function invalidateCampaignGiftsCache(): void {
  forceNextCampaignFetch = true;
}

// --- Coupon gifts session cache ---
// Tracks which couponCodes have already been fetched in this session.
// Cleared by invalidateCouponGiftsCache() or naturally on page refresh.
const fetchedCouponCodesCache = new Set<string>();

export function invalidateCouponGiftsCache(couponCode?: string): void {
  if (couponCode) {
    fetchedCouponCodesCache.delete(couponCode);
  } else {
    fetchedCouponCodesCache.clear();
  }
}

export function isCouponGiftsCached(couponCode: string): boolean {
  return fetchedCouponCodesCache.has(couponCode);
}

export function markCouponGiftsCached(couponCode: string): void {
  fetchedCouponCodesCache.add(couponCode);
}

export const getPromotionGiftsByVariantIdsCommand = createAsyncThunk(
  'promotion/getPromotionGiftsByVariantIdsCommand',
  async (summary: SummarySchema, { dispatch, getState, fulfillWithValue }) => {
    if (summary.giftPools.length > 0) {
      try {
        const rootState = getState() as RootState;
        const zipcode = selectCartZipcode(rootState);
        const allVariantIds = summary.giftPools.flatMap((giftPool: GiftPoolSchema) =>
          giftPool.gifts.map((gift: GiftPoolGiftItemSchema) => gift.variantId)
        );

        if (allVariantIds.length === 0) return fulfillWithValue({});

        // Soft cache: skip fetch when giftsVariantList in store already covers
        // every target variantId (unless invalidation was requested).
        const giftsVariantList = selectGiftsVariantList(rootState);
        const cachedVariantIds = new Set(giftsVariantList.map((item) => item.variant.id));
        const allCovered = allVariantIds.every((id) => cachedVariantIds.has(id));
        if (!forceNextCampaignFetch && allCovered) return fulfillWithValue({});

        const stockLocationCode = summary.extra?.wareHouseCode ?? '';
        const payload = { variantIds: allVariantIds, zipcode: zipcode, stockLocationCode };
        await dispatch(batchRetrieveGiftsByVariantIds.initiate(payload));
        forceNextCampaignFetch = false;
      } catch (error) {
        logger.error('getPromotionGiftsByVariantIdsCommand error', { error });
      }
    }
    return fulfillWithValue({});
  }
);
