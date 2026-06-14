'use client';
import { useCallback } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { Stack, Box } from '@castlery/fortress';
import { selectCheckoutAddressList } from '@castlery/modules-checkout-domain';
import { CustomerAddressEntity_V2 } from '@castlery/types';
import { accessInPos } from '@castlery/config';
import { AddressDisplayCard, BackdropLoading } from '@castlery/shared-components';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';

const containerSx = { position: 'relative' } as const;

const gridSx = {
  display: 'grid',
  gridTemplateColumns: accessInPos
    ? '1fr'
    : {
        xs: '1fr',
        sm: 'repeat(2,1fr)',
      },
  rowGap: accessInPos ? 5 : { xs: 6, md: 4, lg: 6 },
  columnGap: accessInPos ? 5 : { xs: 6, md: 4, lg: 6 },
} as const;

export interface CheckoutAddressListProps {
  selectedAddressId: number | undefined;
  onSelect: (address: CustomerAddressEntity_V2) => void;
  onEdit?: (address: CustomerAddressEntity_V2) => void;
  loading?: boolean;
  /** When true, selection and edit are disabled (e.g. order already created) */
  readOnly?: boolean;
}
export const CheckoutAddressList = ({
  selectedAddressId,
  onEdit,
  onSelect,
  loading = false,
  readOnly = false,
}: CheckoutAddressListProps) => {
  const addressList = useAppSelector(selectCheckoutAddressList);

  const handleEdit = useCallback(
    (address: CustomerAddressEntity_V2) => {
      if (readOnly) return;
      onEdit?.(address);
    },
    [onEdit, readOnly]
  );

  const handleSelect = useCallback(
    (address: CustomerAddressEntity_V2) => {
      if (readOnly) return;
      onSelect?.(address);
    },
    [onSelect, readOnly]
  );

  return (
    <Box sx={containerSx}>
      <Stack data-selenium={DATA_SELENIUM_ID_MAP.ADDRESS_LIST} sx={gridSx}>
        {addressList.map((address) => (
          <AddressDisplayCard
            key={address.id}
            address={address}
            selected={selectedAddressId === address.id}
            onSelect={handleSelect}
            onEdit={handleEdit}
            enableEdit={!accessInPos && !readOnly}
          />
        ))}
      </Stack>
      <BackdropLoading loading={loading} />
    </Box>
  );
};
