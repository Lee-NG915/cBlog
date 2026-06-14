'use client';
import React from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PosSelectCustomer } from '@castlery/modules-user-components';
import { Box } from '@castlery/fortress';
import { PosOnlineCart } from '../pos-online-cart/pos-online-cart';
import { selectedCustomerId } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { enableO2O } from '@castlery/config';

export const CustomerHeader = () => {
  const customerId = useAppSelector(selectedCustomerId);
  const showOnlineCart = enableO2O && !!customerId;

  return (
    <Box
      sx={{
        height: 64,
        display: 'grid',
        gridTemplateColumns: showOnlineCart ? 'auto 40px' : '1fr',
        background: (theme) => theme.palette.brand.wheat[50],
        paddingX: 2,
        paddingY: 1,
        gap: 1,
      }}
    >
      <PosSelectCustomer />
      {showOnlineCart && <PosOnlineCart />}
    </Box>
  );
};

export default React.memo(CustomerHeader);
