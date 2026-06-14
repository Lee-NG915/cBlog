'use client';
import React, { useMemo, useState } from 'react';
import { Box, Divider, Typography, useNiceModal } from '@castlery/fortress';
import { selectOrder, getYotpoCustomerDetails } from '@castlery/modules-order-domain';
import { CouponDropdownV2 } from '../coupon-dropdown/coupon-dropdownV2';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CouponRowItem } from '../coupon-row-item/coupon-row-item';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { selectCouponsV2 } from '@castlery/modules-promotion-domain';
import { ChooseCouponGiftModal } from '@castlery/modules-promotion-components';

interface CouponWalletProps {
  wrapperSx?: Object;
}
export function CouponWalletV2({ wrapperSx = {} }: CouponWalletProps) {
  const [modal, contextHolder] = useNiceModal();
  const order = useAppSelector(selectOrder);
  const coupons = useAppSelector(selectCouponsV2) || [];
  const coupon = useAppSelector(selectOrder)?.coupon;
  const customer = useAppSelector(selectedCurrentCustomer) as { email: string; id: number } | null;
  const [couponGiftModalOpen, setCouponGiftModalOpen] = useState(false);
  const hasCoupons = coupons.length > 0;
  const [canEdit, setCanEdit] = React.useState<boolean>(false);
  const getPoints = useMemo(() => getYotpoCustomerDetails.select(customer?.email || ''), [customer]);
  const { data: yotpoCustomerDetails = {} } = useAppSelector(getPoints);
  const points = yotpoCustomerDetails?.points_balance || 0;
  const [couponCode, setCouponCode] = useState<string>('');
  const showWarningMessage = Array.isArray(order?.warning_messages) && order.warning_messages.length > 0;
  const errorMessage = order?.warning_messages?.join('');

  const changeMode = () => {
    if (coupon) return;
    setCanEdit((pre) => !pre);
  };

  const closeDropDown = () => {
    setCanEdit(false);
  };

  const openCouponGiftModal = (code: string) => {
    closeDropDown();
    setCouponCode(code);
    setCouponGiftModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          padding: '8px 0',
        }}
      >
        {showWarningMessage && (
          <Box
            sx={{
              display: 'flex',
              padding: '4px 8px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
              alignSelf: 'stretch',
              backgroundColor: 'var(--fortress-palette-primary-500)',
            }}
          >
            <Typography level="caption1" textColor="white">
              {errorMessage}
            </Typography>
          </Box>
        )}
        <Box sx={{ p: 1, ...wrapperSx }}>
          {canEdit ? (
            <CouponDropdownV2 editToggle={closeDropDown} openCouponGiftModal={openCouponGiftModal} modal={modal} />
          ) : (
            <CouponRowItem coupon={coupon} hasCoupons={hasCoupons || points > 0} editToggle={changeMode} />
          )}
        </Box>
        <ChooseCouponGiftModal
          open={couponGiftModalOpen}
          code={couponCode}
          onClose={() => {
            setCouponGiftModalOpen(false);
          }}
        />
      </Box>
      <Divider />
      {contextHolder}
    </>
  );
}
export default CouponWalletV2;
