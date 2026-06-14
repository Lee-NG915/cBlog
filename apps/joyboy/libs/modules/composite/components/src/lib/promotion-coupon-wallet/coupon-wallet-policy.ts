import { VoucherType, type CouponSchema } from '@castlery/types';
import { type CouponWalletOption, CouponWalletOptionType } from '@castlery/modules-promotion-domain';

export type CouponWalletMode = 'cart' | 'checkout';

export const isFreeGiftVoucherType = (voucherType?: string | null) => voucherType === VoucherType.FREE_GIFT;

export const isFreeGiftCouponOption = (option?: CouponWalletOption | null) =>
  option?.type === CouponWalletOptionType.COUPON && isFreeGiftVoucherType(option?.voucherType);

export const isFreeGiftAppliedCoupon = (coupon?: CouponSchema | null) =>
  coupon?.actions?.some((action) => action.actionType === 'ActionTypeFreeGift') ?? false;

export const shouldDisableFreeGiftCouponInCheckout = (mode: CouponWalletMode, option?: CouponWalletOption | null) =>
  mode === 'checkout' && isFreeGiftCouponOption(option);
