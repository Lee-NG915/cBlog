import { createSelector } from '@reduxjs/toolkit';
import { promotionSlice } from '../slice/promotion.slice';
import { selectCartDataFromAdapter } from '../adapter/adapter';
import type {
  GiftLineItemSchema,
  GiftPoolSchema,
  GiftPoolGiftItemSchema,
  GiftVariantDetailSchema,
} from '@castlery/types';
import type { FreeGiftState } from './promotion.helper.v1';

const { selectGiftsVariantList, selectCouponGifts } = promotionSlice.selectors as unknown as {
  selectGiftsVariantList: (state: {
    promotion: { giftsVariantList: GiftVariantDetailSchema[] };
  }) => GiftVariantDetailSchema[];
  selectCouponGifts: (state: { promotion: { couponGifts: GiftPoolSchema[] } }) => GiftPoolSchema[];
};

export const selectFreeGiftBreakdownV2 = createSelector(
  [selectCartDataFromAdapter, selectGiftsVariantList],
  (cartRoot, giftsVariantList): FreeGiftState => {
    const cartGifts = cartRoot?.gifts || [];
    const giftPools = cartRoot?.summary?.giftPools || [];
    // 分类促销活动
    const allFreeGiftValidPromotion = (giftPools || []).filter((giftPool: GiftPoolSchema) => giftPool?.isEligible);
    const allFreeGiftCampaignPromotion = (giftPools || []).filter(
      (giftPool: GiftPoolSchema) => giftPool?.controlType === 1
    );

    // 获取有效的促销活动
    const validCampaignGiftPromotion =
      allFreeGiftValidPromotion?.find((giftPool: GiftPoolSchema) => giftPool?.controlType === 1) || null;
    const validCouponGiftPromotion =
      allFreeGiftValidPromotion?.find((giftPool: GiftPoolSchema) => giftPool?.controlType === 2) || null;

    // 获取购物车中的所有礼品
    const cartGiftList = cartGifts;
    // const cartGiftList = cart?.lineItems?.filter((lineItem: any) => lineItem.giftPoolId || lineItem.isGift);

    // 根据gift_id判断gift类型的辅助函数
    const getGiftType = (giftPoolId: string) => {
      const giftType =
        allFreeGiftValidPromotion.find((item: GiftPoolSchema) =>
          item.gifts.find((gift: GiftPoolGiftItemSchema) => gift.freeGiftId === giftPoolId)
        )?.controlType || null;
      return giftType;
    };

    // 区分不同类型的赠品
    const cartCouponGift =
      cartGiftList?.find((lineItem: GiftLineItemSchema) => {
        const giftType = getGiftType(lineItem.giftPoolId);
        return giftType === 2; // control_type === 2 表示coupon gift
      }) || null;

    const cartCampaignGift =
      cartGiftList?.find((lineItem: any) => {
        const giftType = getGiftType(lineItem.giftPoolId);
        return giftType === 1; // control_type === 1 表示campaign gift
      }) || null;

    const reAllFreeGiftCampaignPromotion = allFreeGiftCampaignPromotion.map((giftPool: GiftPoolSchema) => {
      return {
        ...giftPool,
        gifts: giftPool.gifts.map((gift: GiftPoolGiftItemSchema) => {
          const giftVariant = giftsVariantList?.find(
            (giftVariant: GiftVariantDetailSchema) => giftVariant.variant.id === gift.variantId
          );
          return {
            ...gift,
            ...giftVariant,
          };
        }),
      };
    });
    const reAllFreeGiftValidPromotion = allFreeGiftValidPromotion.map((giftPool: GiftPoolSchema) => {
      return {
        ...giftPool,
        gifts: giftPool.gifts.map((gift: GiftPoolGiftItemSchema) => {
          const giftVariant = giftsVariantList?.find(
            (giftVariant: GiftVariantDetailSchema) => giftVariant.variant.id === gift.variantId
          );
          return {
            ...gift,
            ...giftVariant,
          };
        }),
      };
    });
    const reValidCampaignGiftPromotion = validCampaignGiftPromotion
      ? {
          ...validCampaignGiftPromotion,
          gifts: validCampaignGiftPromotion.gifts.map((gift: GiftPoolGiftItemSchema) => {
            const giftVariant = giftsVariantList?.find(
              (giftVariant: GiftVariantDetailSchema) => giftVariant.variant.id === gift.variantId
            );
            return {
              ...gift,
              ...giftVariant,
            };
          }),
        }
      : null;
    const reValidCouponGiftPromotion = validCouponGiftPromotion
      ? {
          ...validCouponGiftPromotion,
          gifts: validCouponGiftPromotion.gifts.map((gift: GiftPoolGiftItemSchema) => {
            const giftVariant = giftsVariantList?.find(
              (giftVariant: GiftVariantDetailSchema) => giftVariant.variant.id === gift.variantId
            );
            return {
              ...gift,
              ...giftVariant,
            };
          }),
        }
      : null;

    return {
      orderCouponGift: cartCouponGift,
      orderCampaignGift: cartCampaignGift,
      allFreeGiftCampaignPromotion: reAllFreeGiftCampaignPromotion,
      allFreeGiftValidPromotion: reAllFreeGiftValidPromotion,
      validCampaignGiftPromotion: reValidCampaignGiftPromotion,
      validCouponGiftPromotion: reValidCouponGiftPromotion,
    };
  }
);

/**
 * Get eligible coupon gifts
 */
export const selectFilteredCouponGifts = createSelector([selectCouponGifts], (couponGifts): GiftPoolSchema[] => {
  const eligibleCouponGifts = (couponGifts || []).filter(
    (giftPool: GiftPoolSchema) => giftPool?.isEligible && giftPool?.controlType === 2
  );
  return eligibleCouponGifts;
});
