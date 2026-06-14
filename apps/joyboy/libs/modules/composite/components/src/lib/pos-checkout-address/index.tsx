'use client';

import React, { memo, useEffect } from 'react';
import { Stack, cardClasses, Typography } from '@castlery/fortress';
import { AddressInfoCard } from './address-info-card';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { PosAddAddress } from '../address/pos-add-address/pos-add-address';
import { selectCheckoutAddress } from '@castlery/modules-composite-services';
import { setCheckoutAddressesId } from '@castlery/modules-checkout-domain';
import { selectedCustomerId, useGetAddressesByUserIdQuery } from '@castlery/modules-user-domain';

export const PosCheckoutAddress = memo(() => {
  const dispatch = useAppDispatch();
  const { billingAddress, shippingAddress } = useAppSelector(selectCheckoutAddress);
  const customerId = useAppSelector(selectedCustomerId);
  useGetAddressesByUserIdQuery(customerId as number, { skip: !customerId });

  useEffect(() => {
    if (billingAddress?.id || shippingAddress?.id) {
      dispatch(
        setCheckoutAddressesId({
          billingAddressId: billingAddress?.id,
          shippingAddressId: shippingAddress?.id,
        })
      );
    }
  }, [billingAddress?.id, dispatch, shippingAddress?.id]);

  return (
    <Stack
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' },
        gridTemplateRows: '1fr',
        gap: 2,
        pt: 2,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: '100%',
          height: '100%',
          [`&> .${cardClasses.root}`]: {
            minHeight: 132,
          },
        }}
      >
        <Typography level="subh2">Shipping Address</Typography>
        {shippingAddress ? (
          <AddressInfoCard address={shippingAddress} type={'ship_address'} />
        ) : (
          <PosAddAddress type="ship_address" />
        )}
      </Stack>

      <Stack
        spacing={2}
        sx={{
          width: '100%',
          height: '100%',
          [`& .${cardClasses.root}`]: {
            minHeight: 132,
          },
        }}
      >
        <Typography level="subh2">Billing Address</Typography>
        {billingAddress ? (
          <AddressInfoCard address={billingAddress} type={'bill_address'} />
        ) : (
          <PosAddAddress type="bill_address" />
        )}
      </Stack>
    </Stack>
  );
});
