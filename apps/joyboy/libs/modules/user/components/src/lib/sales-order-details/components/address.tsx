/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card } from '@castlery/fortress';
import type { Address } from '@castlery/modules-user-domain';
import { AddressCardContent } from '../../address/address-card-content';

export interface AddressProps {
  address: Address;
  sx?: any;
}

export const SaleAddressCard = (props: AddressProps) => {
  const { address, sx } = props;
  let defaultSx = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    width: '100%',
    gap: 0,
  };
  if (sx !== undefined) defaultSx = Object.assign(defaultSx, sx);
  return (
    <Card sx={defaultSx}>
      <AddressCardContent address={address} />
    </Card>
  );
};
