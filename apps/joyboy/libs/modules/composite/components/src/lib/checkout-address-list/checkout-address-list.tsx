'use client';
import { useAppSelector } from '@castlery/shared-redux-store';
import { Stack } from '@castlery/fortress';
import { selectCheckoutAddressList } from '@castlery/modules-checkout-domain';
import { CustomerAddressEntity_V2 } from '@castlery/types';
import { accessInPos } from '@castlery/config';
import { AddressDisplayCard } from '@castlery/shared-components';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';

export interface CheckoutAddressListProps {
  selectedAddressId: number | undefined;
  onSelect: (address: CustomerAddressEntity_V2) => void;
  onEdit?: (address: CustomerAddressEntity_V2) => void;
}
export const CheckoutAddressList = ({ selectedAddressId, onEdit, onSelect }: CheckoutAddressListProps) => {
  const addressList = useAppSelector(selectCheckoutAddressList);

  const handleEdit = (address: CustomerAddressEntity_V2) => {
    onEdit?.(address);
  };

  const handleSelect = (address: CustomerAddressEntity_V2) => {
    onSelect?.(address);
  };

  return (
    <>
      <Stack
        data-selenium={DATA_SELENIUM_ID_MAP.ADDRESS_LIST}
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: accessInPos
            ? '1fr'
            : {
                xs: '1fr',
                md: 'repeat(2,1fr)',
              },
          rowGap: 6,
          columnGap: 6,
        }}
      >
        {addressList.map((address) => (
          <AddressDisplayCard
            key={address.id}
            address={address}
            selected={selectedAddressId === address.id}
            onSelect={handleSelect}
            onEdit={handleEdit}
            enableEdit={!accessInPos}
          />
        ))}
      </Stack>
    </>
  );
};

export default CheckoutAddressList;
