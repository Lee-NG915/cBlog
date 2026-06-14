'use client';
import { Button } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectApplyCouponLoadingV2 } from '@castlery/modules-promotion-domain';

export interface CouponApplyButtonProps {
  couponCode: string;
  inputCodeApply: (code: string) => void;
  verifyLoading: boolean;
}

export function CouponApplyButtonV2({ couponCode, inputCodeApply, verifyLoading }: CouponApplyButtonProps) {
  // const dispatch = useAppDispatch();
  const loading = useAppSelector(selectApplyCouponLoadingV2);

  const applyCoupon = async () => {
    if (!couponCode) return Promise.resolve();
    inputCodeApply(couponCode);
  };

  return (
    <Button
      sx={{ height: 41, minHeight: 41, paddingY: 0 }}
      variant="secondary"
      color="neutral"
      onClick={applyCoupon}
      loading={verifyLoading || loading}
    >
      Apply
    </Button>
  );
}

export default CouponApplyButtonV2;
