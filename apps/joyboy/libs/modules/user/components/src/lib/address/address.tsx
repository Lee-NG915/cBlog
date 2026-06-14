import React from 'react';
import { Typography, Stack } from '@castlery/fortress';
import { AddressCard } from './address-card';

export interface CheckoutAddressProps {
  address: any; //AddressEntity
  handler: () => void;
}
export function CheckoutAddress({ address, handler }: CheckoutAddressProps) {
  return (
    <Stack direction={'row'} gap={2}>
      <Stack flex={1} gap={1} onClick={handler}>
        <Typography level="subh2">Shipping Address</Typography>
        <AddressCard address={address} />
      </Stack>
      <Stack flex={1} gap={1} onClick={handler}>
        <Typography level="subh2">Billing Address</Typography>
        <AddressCard address={address} />
      </Stack>
    </Stack>
  );
}
