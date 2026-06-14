'use client';
import { Button } from '@castlery/fortress';
import { selectApplyCouponLoading } from '@castlery/modules-order-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { applyCouponCommand } from '@castlery/shared-services';

export interface CouponApplyButtonProps {
  couponCode: string;
  editToggle: () => void;
}

export function CouponApplyButton({ couponCode, editToggle }: CouponApplyButtonProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectApplyCouponLoading);

  const applyCoupon = async () => {
    if (!couponCode) return Promise.resolve();
    await dispatch(applyCouponCommand({ couponCode }));
    editToggle && editToggle();
  };

  return (
    <Button
      sx={{ height: 41, minHeight: 41, paddingY: 0 }}
      variant="secondary"
      color="neutral"
      onClick={applyCoupon}
      loading={loading}
    >
      Apply
    </Button>
  );
}

export default CouponApplyButton;
