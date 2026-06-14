import { baseCouponTrigger, type BaseTrackCouponArgs } from './base-coupon.trigger';

export type CouponTriggerPayload = Omit<BaseTrackCouponArgs, 'category' | 'action'>;

/**
 * scenario: CTR: Clicking 'coupon code' section on POS
 * @param payload
 * @returns
 */
export const offlineAddCoupon = (payload: CouponTriggerPayload) => {
  const { sales, transactionId, customer } = payload;
  return baseCouponTrigger({
    category: 'offline_coupon',
    action: 'add_coupon',
    customer,
    sales,
    transactionId,
  });
};

/**
 * scenario: CTR:clicking the coupon itself
 * @param payload
 * @returns
 */
export const offlineSelectCoupon = (payload: CouponTriggerPayload) => {
  const { sales, transactionId, customer } = payload;
  return baseCouponTrigger({
    category: 'offline_coupon',
    action: 'select_coupon',
    customer,
    sales,
    transactionId,
  });
};

/**
 * scenario: CTR: clicking the 'redeem' button
 * @param payload
 * @returns
 */
export const offlineRedeemCoupon = (payload: CouponTriggerPayload) => {
  const { sales, transactionId, customer } = payload;
  return baseCouponTrigger({
    category: 'offline_coupon',
    action: 'redeem_coupon',
    customer,
    sales,
    transactionId,
  });
};
