'use client';
import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectGiftPools, selectCartSummary } from '@castlery/modules-cart-domain';
import { selectGiftsVariantList, selectFreeGiftBreakdown } from '@castlery/modules-promotion-domain';
import { getPromotionGiftsByVariantIdsCommand } from '@castlery/modules-promotion-services';
import type { SummarySchema, GiftPoolSchema } from '@castlery/types';

/**
 * Provides campaign gift data with lazy loading and soft cache.
 *
 * - fetchGiftsDetail(): triggers variant detail fetch only when called
 *   (e.g. when user clicks "Select Free Gift"). Skips fetch if variantIds
 *   are unchanged since last fetch (soft cache in gift.helper.ts).
 * - Cache is invalidated automatically after gift add-to-cart success
 *   (handled by promotion.listener.ts).
 */
export function useCampaignGifts() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const giftPools = useAppSelector(selectGiftPools) as GiftPoolSchema[];
  const giftsVariantList = useAppSelector(selectGiftsVariantList);
  const cartSummary = useAppSelector(selectCartSummary) as SummarySchema;
  const freeGiftBreakdown = useAppSelector(selectFreeGiftBreakdown);

  const fetchGiftsDetail = useCallback(async () => {
    // selectCartSummary returns {} when cart is not loaded, not null/undefined
    if (!cartSummary || !('giftPools' in cartSummary)) return;
    setIsLoading(true);
    try {
      await dispatch(getPromotionGiftsByVariantIdsCommand(cartSummary));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, cartSummary]);

  return {
    // raw gift pools (use to check eligibility before variant details are loaded)
    giftPools,
    // raw variant detail list fetched by variantIds
    giftsVariantList,
    // merged result: giftPools with variant details injected, split by campaign/coupon type
    freeGiftBreakdown,
    isLoading,
    fetchGiftsDetail,
  };
}
