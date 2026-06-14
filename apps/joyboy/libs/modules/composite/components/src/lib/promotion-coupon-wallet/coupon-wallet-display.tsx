'use client';
import { Typography, IconButton, Link, Loading, useBreakpoints, Badge } from '@castlery/fortress';
import { Plus, Edit } from '@castlery/fortress/Icons';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { LoginButton } from '@castlery/shared-components';
import { type CouponSchema } from '@castlery/types';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';
import { accessInWeb } from '@castlery/config';

const lockedTextSx = { color: (theme: any) => theme.palette.brand.mono[500] } as const;

export function UsedCouponPresentation({
  couponCode,
  handleRemoveCoupon,
  removeCouponLoading,
  disabled = false,
  locked = false,
}: {
  couponCode: CouponSchema['code'];
  handleRemoveCoupon: () => void;
  removeCouponLoading: boolean;
  disabled?: boolean;
  locked?: boolean;
}) {
  const { mobile } = useBreakpoints();
  return (
    <>
      <Typography level="body2" sx={locked ? lockedTextSx : undefined}>
        Coupon Code:
      </Typography>
      <Link
        level="body2"
        component="button"
        variant="primary"
        disabled={disabled}
        endDecorator={
          disabled ? null : removeCouponLoading ? (
            <Loading size="sm" theme="dark" />
          ) : (
            <Edit
              sx={{
                width: 20,
                height: 20,
                minHeight: 20,
                ...(mobile && { width: 16, height: 16, minHeight: 16 }),
              }}
            />
          )
        }
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          handleRemoveCoupon();
        }}
      >
        {couponCode}
      </Link>
    </>
  );
}

export function AvailableCouponsPresentation({
  availableCouponsCount,
  locked = false,
}: {
  availableCouponsCount: number;
  locked?: boolean;
}) {
  return (
    <Typography level="caption2" sx={locked ? lockedTextSx : undefined}>
      {availableCouponsCount} voucher{availableCouponsCount > 1 ? 's' : ''} available
    </Typography>
  );
}

export function LoginButtonPresentation() {
  return (
    <Typography level="caption2">
      <LoginButton /> to view your coupons
    </Typography>
  );
}

export function WebAddCouponButton({
  handleOpenCouponDropdown,
  couponActionDisabled,
}: {
  handleOpenCouponDropdown: () => void;
  couponActionDisabled: boolean;
}) {
  return (
    <IconButton
      onClick={handleOpenCouponDropdown}
      disabled={couponActionDisabled}
      sx={{ height: 20, minHeight: 20, p: 0, m: 0 }}
      aria-label="Add coupon"
    >
      <Plus sx={{ width: 20, height: 20, minHeight: 20 }} />
    </IconButton>
  );
}

export function POSAddCouponButton({
  handleOpenCouponDropdown,
  availableCouponsCount,
  couponActionDisabled,
}: {
  handleOpenCouponDropdown: () => void;
  availableCouponsCount: number;
  couponActionDisabled: boolean;
}) {
  return (
    <Badge invisible={availableCouponsCount === 0} sx={{ '.MuiBadge-badge': { minHeight: 12, minWidth: 12 } }}>
      <IconButton
        onClick={handleOpenCouponDropdown}
        disabled={couponActionDisabled}
        sx={{ height: 20, minHeight: 20, p: 0, m: 0 }}
        aria-label="Add coupon"
      >
        <Plus sx={{ width: 20, height: 20, minHeight: 20 }} />
      </IconButton>
    </Badge>
  );
}

export function CouponAmountPresentation({ couponAmount, locked = false }: { couponAmount: string; locked?: boolean }) {
  return (
    <Typography level="body2" sx={locked ? lockedTextSx : undefined}>
      {couponAmount}
    </Typography>
  );
}

export function InvalidCouponPresentation({ invalidReason }: { invalidReason: string }) {
  return (
    <Typography level="caption1" color="danger">
      {invalidReason}
    </Typography>
  );
}

export function AddCouponLabel({
  reloadCartLoading,
  hasLogin,
  availableCouponsCount,
  locked = false,
}: {
  reloadCartLoading: boolean;
  hasLogin: boolean;
  availableCouponsCount: number;
  locked?: boolean;
}) {
  if (!accessInWeb) {
    return (
      <Typography level="body2" sx={locked ? lockedTextSx : undefined}>
        Coupon Code
      </Typography>
    );
  }

  const renderHint = () => {
    if (reloadCartLoading) return <Loading size="sm" theme="dark" />;
    if (!hasLogin) return <LoginButtonPresentation />;
    if (availableCouponsCount > 0)
      return <AvailableCouponsPresentation availableCouponsCount={availableCouponsCount} locked={locked} />;
    return null;
  };

  return (
    <>
      <Typography
        level="body2"
        data-selenium={DATA_SELENIUM_ID_MAP.ADD_COUPON_CODE}
        sx={locked ? lockedTextSx : undefined}
      >
        Add Coupon Code
      </Typography>
      {renderHint()}
    </>
  );
}
