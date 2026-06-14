'use client';
import { useCallback, useState } from 'react';
import { Stack, circularProgressClasses } from '@castlery/fortress';
import { logger } from '@castlery/observability';
import { toPrice } from '@castlery/utils';
import { accessInWeb } from '@castlery/config';
import { type CouponSchema } from '@castlery/types';
import { CouponWalletAutocomplete } from './coupon-wallet-autocomplete/coupon-wallet-autocomplete';
import { useCouponWallet, type CouponWalletProps } from './hooks/use-coupon-wallet';
import {
  UsedCouponPresentation,
  WebAddCouponButton,
  POSAddCouponButton,
  CouponAmountPresentation,
  AddCouponLabel,
  InvalidCouponPresentation,
} from './coupon-wallet-display';
import { RemoveFreeGiftCouponConfirmModal } from './coupon-wallet-autocomplete/redemption-modals';
import { isFreeGiftAppliedCoupon } from './coupon-wallet-policy';

export type { CouponWalletProps };

export function CouponWallet(props: CouponWalletProps) {
  const {
    mode = 'cart',
    coupon,
    availableCoupons,
    reloadCartLoading,
    applyCoupon,
    applyLoading,
    currentUser,
    isLocked,
    onAfterRedeemCredits,
    removeCoupon,
  } = props;

  const {
    isEditMode,
    hasOpenedOnce,
    mobile,
    hasLogin,
    usedValidCouponInCart,
    availableCouponsCount,
    couponActionDisabled,
    usedInvalidCoupon,
    invalidCouponNotice,
    containerSx,
    handleOpenCouponDropdown,
    handleRemoveCoupon,
    handleExitEditMode,
    handleClickRow,
    removeLoading,
  } = useCouponWallet(props);
  const [openRemoveGiftCouponModal, setOpenRemoveGiftCouponModal] = useState(false);
  const isAppliedFreeGiftCoupon = isFreeGiftAppliedCoupon(coupon as CouponSchema | null);

  const handleRemoveCouponClick = useCallback(() => {
    if (isAppliedFreeGiftCoupon) {
      setOpenRemoveGiftCouponModal(true);
      return;
    }
    handleRemoveCoupon();
  }, [handleRemoveCoupon, isAppliedFreeGiftCoupon]);

  const handleConfirmRemoveGiftCoupon = useCallback(async () => {
    if (removeLoading) {
      return;
    }
    try {
      await removeCoupon().unwrap();
      await handleOpenCouponDropdown();
      setOpenRemoveGiftCouponModal(false);
    } catch (error) {
      logger.error('Failed to remove free gift coupon:', { error });
    }
  }, [removeCoupon, handleOpenCouponDropdown, removeLoading]);

  return (
    <Stack sx={{ width: '100%' }}>
      {hasOpenedOnce && (
        <Stack sx={{ display: isEditMode ? 'flex' : 'none' }}>
          <CouponWalletAutocomplete
            active={isEditMode}
            applyCoupon={applyCoupon}
            applyLoading={applyLoading}
            availableCoupons={availableCoupons}
            exitEditMode={handleExitEditMode}
            mode={mode}
            usedInvalidCoupon={usedInvalidCoupon}
            currentUser={currentUser as { email: string; id: number }}
            onAfterRedeemCredits={onAfterRedeemCredits}
          />
        </Stack>
      )}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          ...containerSx,
          display: isEditMode ? 'none' : 'flex',
          cursor: couponActionDisabled ? 'default' : 'pointer',
        }}
        role="button"
        onClick={handleClickRow}
      >
        {/* Left Section - Coupon Info */}
        <Stack
          direction="row"
          alignItems="center"
          columnGap={2}
          sx={{
            [`& .${circularProgressClasses.root}`]: {
              '--CircularProgress-size': mobile ? '16px' : '20px',
            },
          }}
        >
          {usedValidCouponInCart ? (
            <UsedCouponPresentation
              couponCode={coupon?.code as CouponSchema['code']}
              handleRemoveCoupon={handleRemoveCouponClick}
              removeCouponLoading={removeLoading}
              disabled={couponActionDisabled}
              locked={isLocked}
            />
          ) : (
            <AddCouponLabel
              reloadCartLoading={reloadCartLoading}
              hasLogin={hasLogin}
              availableCouponsCount={availableCouponsCount}
              locked={isLocked}
            />
          )}
        </Stack>

        {/* Right Section - Amount or Add Button */}
        <Stack>
          {usedValidCouponInCart ? (
            <CouponAmountPresentation
              couponAmount={
                isAppliedFreeGiftCoupon ? toPrice(0, true) : (toPrice(Number(coupon?.amount ?? 0) * -1) as string)
              }
              locked={isLocked}
            />
          ) : accessInWeb ? (
            <WebAddCouponButton
              handleOpenCouponDropdown={handleOpenCouponDropdown}
              couponActionDisabled={couponActionDisabled}
            />
          ) : (
            <POSAddCouponButton
              handleOpenCouponDropdown={handleOpenCouponDropdown}
              availableCouponsCount={availableCouponsCount}
              couponActionDisabled={couponActionDisabled}
            />
          )}
        </Stack>
      </Stack>
      {invalidCouponNotice && (
        <Stack sx={{ ...containerSx, pt: 0 }}>
          <InvalidCouponPresentation invalidReason={invalidCouponNotice} />
        </Stack>
      )}

      <RemoveFreeGiftCouponConfirmModal
        open={openRemoveGiftCouponModal}
        close={() => setOpenRemoveGiftCouponModal(false)}
        onConfirm={handleConfirmRemoveGiftCoupon}
      />
    </Stack>
  );
}
