import { createSelector } from '@reduxjs/toolkit';
import { selectFreeGiftsV2 } from '../slice/promotion.slice';
import { selectOrderFromAdapter } from '../adapter/adapter';

export interface FreeGiftState {
  orderCouponGift: any | null;
  orderCampaignGift: any | null;
  allFreeGiftCampaignPromotion: any[];
  allFreeGiftValidPromotion: any[];
  validCampaignGiftPromotion: any | null;
  validCouponGiftPromotion: any | null;
}

export const selectFreeGiftBreakdownV1 = createSelector(
  [selectOrderFromAdapter, selectFreeGiftsV2],
  (order, giftPromotions): FreeGiftState => {
    // 分类促销活动
    const allFreeGiftValidPromotion = (giftPromotions || []).filter((promotion) => promotion?.is_eligible);
    const allFreeGiftCampaignPromotion = (giftPromotions || []).filter((promotion) => promotion?.control_type === 1);

    // 获取有效的促销活动
    const validCampaignGiftPromotion =
      allFreeGiftValidPromotion?.find((promotion) => promotion?.control_type === 1) || null;
    const validCouponGiftPromotion =
      allFreeGiftValidPromotion?.find((promotion) => promotion?.control_type === 2) || null;

    // 获取订单中的所有礼品
    const orderGiftList = order?.line_items?.filter((lineItem: any) => lineItem.gift_id || lineItem.is_gift);

    // 根据gift_id判断gift类型的辅助函数
    const getGiftType = (giftId: string) => {
      for (const promotion of allFreeGiftValidPromotion) {
        const gift = promotion.gifts?.find((gift: any) => gift.gift_pool_id === giftId);
        if (gift) {
          return promotion.control_type;
        }
      }
      return null;
    };

    // 区分不同类型的赠品
    const orderCouponGift =
      orderGiftList?.find((lineItem: any) => {
        const giftType = getGiftType(lineItem.gift_id);
        return giftType === 2; // control_type === 2 表示coupon gift
      }) || null;

    const orderCampaignGift =
      orderGiftList?.find((lineItem: any) => {
        const giftType = getGiftType(lineItem.gift_id);
        return giftType === 1; // control_type === 1 表示campaign gift
      }) || null;

    return {
      orderCouponGift,
      orderCampaignGift,
      allFreeGiftCampaignPromotion,
      allFreeGiftValidPromotion,
      validCampaignGiftPromotion,
      validCouponGiftPromotion,
    };
  }
);
