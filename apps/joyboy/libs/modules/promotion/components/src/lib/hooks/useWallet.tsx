'use client';
import { getYotpoRedemptionOptions, getYotpoCustomerDetails } from '@castlery/modules-promotion-domain';
import { type CouponWalletOption, CouponWalletOptionType } from '@castlery/modules-promotion-domain';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { DateTime } from 'luxon';
import { Typography } from '@castlery/fortress';
import { selectCartCouponList } from '@castlery/modules-cart-domain';

const CreditsHint = ({ points }: { points: number }) => {
  return (
    <Typography level="caption2" textAlign="center">
      You have{' '}
      <Typography level="caption2" color="primary">
        {points} credits
      </Typography>
      ! Redeem now.
    </Typography>
  );
};

interface UseWalletProps {
  showCreditsHint: ((points: number) => boolean) | boolean;
}
export function useWallet({ showCreditsHint = false }: UseWalletProps) {
  const customer = useAppSelector(selectedCurrentCustomer);

  const getYotpoDetails = useMemo(() => getYotpoCustomerDetails.select(customer?.email || ''), [customer?.email]);
  const getYotpoRedemption = useMemo(
    () =>
      getYotpoRedemptionOptions.select({
        customerId: customer?.id as number,
        customerEmail: customer?.email as string,
      }),
    [customer?.id, customer?.email]
  );
  const coupons = useAppSelector(selectCartCouponList);
  const { data: yotpoCustomerDetails } = useAppSelector(getYotpoDetails);
  const { data: yotpoRedemptionOptions, isLoading: yotpoRedemptionLoading } = useAppSelector(getYotpoRedemption);
  const yotpoPoints = yotpoCustomerDetails?.points_balance || 0;

  const showHint = typeof showCreditsHint === 'function' ? showCreditsHint(yotpoPoints) : showCreditsHint;
  const couponExpiredDate = useCallback(
    (expiredAt: string) =>
      expiredAt && new Date(expiredAt) instanceof Date
        ? DateTime.fromSeconds(Number(expiredAt)).minus({ days: 1 }).toFormat('MMM d, yyyy')
        : 'Forever',
    []
  );

  const creditsExpiredDate = useCallback(() => DateTime.now().plus({ days: 30 }).toFormat('MMM d, yyyy'), []);

  const list = useMemo(() => {
    const reCoupons =
      coupons?.map((coupon) => {
        return {
          type: CouponWalletOptionType.COUPON,
          label: coupon.name,
          value: coupon.code,
          ruleDescription: coupon.content.usingRuleDescription,
          discountDescription: coupon.content.discountDescription,
          unavailableReason: coupon.content.unavailableReason,
          expiredAt: couponExpiredDate(coupon.voucherTime.endTime || ''),
          state: coupon.state,
        } as CouponWalletOption;
      }) || [];
    const reYotpoRedemptionOptions =
      yotpoRedemptionOptions?.map((option, index) => {
        return {
          type: CouponWalletOptionType.CREDITS,
          label: option.name,
          value: option.id.toString(),
          ruleDescription: option.description,
          discountDescription: '',
          unavailableReason: '',
          expiredAt: creditsExpiredDate(),
          state: 0,
          cost: option.amount,
          insertHint: index === 0 && showHint ? <CreditsHint points={yotpoPoints} /> : null,
        } as CouponWalletOption;
      }) || [];
    return [...reCoupons, ...reYotpoRedemptionOptions];
  }, [coupons, yotpoRedemptionOptions, showHint, yotpoPoints, couponExpiredDate, creditsExpiredDate]);

  return {
    walletOptions: list,
    yotpoPoints,
    yotpoRedemptionLoading,
  };
}

export function formatWalltetOption(coupons: any[], redemptions: any[]) {
  const showHint = true;
  const yotpoPoints = 200;
  const couponExpiredDate = (expiredAt: string) =>
    expiredAt && new Date(expiredAt) instanceof Date
      ? DateTime.fromSeconds(Number(expiredAt)).minus({ days: 1 }).toFormat('MMM d, yyyy')
      : 'Forever';

  const creditsExpiredDate = () => DateTime.now().plus({ days: 30 }).toFormat('MMM d, yyyy');

  const reCoupons =
    coupons?.map((coupon) => {
      return {
        type: CouponWalletOptionType.COUPON,
        label: coupon.name,
        value: coupon.code,
        ruleDescription: coupon.content.usingRuleDescription,
        discountDescription: coupon.content.discountDescription,
        unavailableReason: coupon.content.unavailableReason,
        expiredAt: couponExpiredDate(coupon.voucherTime.endTime || ''),
        state: coupon.state,
      } as CouponWalletOption;
    }) || [];
  const reYotpoRedemptionOptions =
    redemptions?.map((option, index) => {
      return {
        type: CouponWalletOptionType.CREDITS,
        label: option.name,
        value: option.id.toString(),
        ruleDescription: option.description,
        discountDescription: '',
        unavailableReason: '',
        expiredAt: creditsExpiredDate(),
        state: 0,
        cost: option.amount,
        insertHint: index === 0 && showHint ? <CreditsHint points={yotpoPoints} /> : null,
      } as CouponWalletOption;
    }) || [];

  return [...reCoupons, ...reYotpoRedemptionOptions];
}
