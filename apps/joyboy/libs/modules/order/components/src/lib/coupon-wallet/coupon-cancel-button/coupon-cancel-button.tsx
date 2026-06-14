'use client';

import { IconButton } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectApplyCouponLoading } from '@castlery/modules-order-domain';

export interface CouponCancelButtonProps {
  editToggle: () => void;
}

export function CouponCancelButton({ editToggle }: CouponCancelButtonProps) {
  const loading = useAppSelector(selectApplyCouponLoading);
  return (
    <IconButton
      disabled={loading}
      sx={{ minWidth: 24, minHeight: 24, p: 0, m: 0 }}
      onClick={(e) => {
        e.stopPropagation();
        editToggle && editToggle();
      }}
    >
      <Close sx={{ width: 20, height: 20 }} />
    </IconButton>
  );
}

export default CouponCancelButton;
