'use client';
import React from 'react';
import { PosSelectCustomer } from '@castlery/modules-user-components';
import { Box } from '@castlery/fortress';
import { PosOnlineCart } from '@castlery/modules-order-components';
import { selectedCustomerId } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { enableO2O, enableO2OFOrderV2 } from '@castlery/config';
import { PosOnlineCartDrawer } from '@castlery/modules-cart-components';
import { sharedFeatureService } from '@castlery/shared-services';
import { usePathname } from 'next/navigation';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

export const PosCustomerHeader = () => {
  const customerId = useAppSelector(selectedCustomerId);
  const showOnlineCart = enableOrderV2 ? enableO2OFOrderV2 && !!customerId : enableO2O && !!customerId;
  const inCheckout = usePathname().includes('/checkout');

  return (
    <Box
      sx={{
        height: 64,
        display: 'grid',
        gridTemplateColumns: showOnlineCart ? 'auto 40px' : '1fr',
        py: 4,
        gap: 1,

      }}
    >
      <PosSelectCustomer />
      {showOnlineCart && !inCheckout && (enableOrderV2 ? <PosOnlineCartDrawer /> : <PosOnlineCart />)}
    </Box>
  );
};

export default React.memo(PosCustomerHeader);
