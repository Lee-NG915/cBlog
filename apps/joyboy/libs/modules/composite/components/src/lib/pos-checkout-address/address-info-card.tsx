'use client';

import { useState, memo } from 'react';
import { Drawer } from '@castlery/fortress';
import { ExistingAddressCard } from '@castlery/modules-user-components';
import { AddressEntity } from '@castlery/modules-checkout-domain';
import { PosSelectAddress } from '../address/pos-select-address/pos-select-address';
import { selectedCustomerId, useGetAddressesByUserIdQuery } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

export interface AddressInfoCardProps {
  address: AddressEntity;
  type: 'ship_address' | 'bill_address';
}
// TODO  切换地址的时候 需要添加 loading 状态 来避免重复点击
export const AddressInfoCard = memo(({ type, address }: AddressInfoCardProps) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((pre) => !pre);

  const customerId = useAppSelector(selectedCustomerId);
  const { data: customerAddresses } = useGetAddressesByUserIdQuery(customerId as number, { skip: !customerId });

  return (
    <>
      <ExistingAddressCard address={address} clickHandler={toggle} />
      <Drawer open={open} onClose={toggle}>
        {customerAddresses && (
          <PosSelectAddress afterSelect={toggle} type={type} customerAddresses={customerAddresses} />
        )}
      </Drawer>
    </>
  );
});

export default AddressInfoCard;
