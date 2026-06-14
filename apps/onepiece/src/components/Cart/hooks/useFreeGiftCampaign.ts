// 禁用eslint
/* eslint-disable */
import { useSelector } from 'react-redux';

interface FreeGiftErrorInfo {
  title: string;
  description: string;
}

interface UseFreeGiftCampaignReturn {
  // 赠品状态
  orderCouponGift: any | null;
  orderCampaignGift: any | null;
  allFreeGiftCampaignPromotion: any[];
  allFreeGiftValidPromotion: any[];
  validCampaignGiftPromotion: any | null;
  validCouponGiftPromotion: any | null;
}

export const useFreeGiftCampaign = (): UseFreeGiftCampaignReturn => {
  const cart = useSelector((state: { cart: any }) => state.cart);
  const order = cart.data;

  const allFreeGiftValidPromotion = (cart.giftPromotions || []).filter((promotion: any) => promotion?.is_eligible);
  const allFreeGiftCampaignPromotion = (cart.giftPromotions || []).filter(
    (promotion: any) => promotion?.control_type === 1
  );

  // campaign gift promotion
  const validCampaignGiftPromotion = allFreeGiftValidPromotion?.find((promotion: any) => promotion?.control_type === 1);

  // coupon gift promotion
  const validCouponGiftPromotion = allFreeGiftValidPromotion?.find((promotion: any) => promotion?.control_type === 2);

  // 获取订单中的所有礼品
  const orderGiftList = order?.line_items?.filter((lineItem: any) => lineItem.gift_id);

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

  // 根据gift_id和promotion的control_type来区分campaign gift和coupon gift
  const orderCouponGift = orderGiftList?.find((lineItem: any) => {
    const giftType = getGiftType(lineItem.gift_id);
    return giftType === 2; // control_type === 2 表示coupon gift
  });

  const orderCampaignGift = orderGiftList?.find((lineItem: any) => {
    const giftType = getGiftType(lineItem.gift_id);
    return giftType === 1; // control_type === 1 表示campaign gift
  });

  return {
    allFreeGiftValidPromotion,
    allFreeGiftCampaignPromotion,
    orderCouponGift,
    orderCampaignGift,
    validCampaignGiftPromotion,
    validCouponGiftPromotion,
  };
};
