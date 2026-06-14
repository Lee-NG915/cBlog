'use client';
import { useState, memo } from 'react';
import { Drawer, Box, Button } from '@castlery/fortress';
import type { CheckoutAddressEntity_V2 } from '@castlery/types';
import { AddressDisplayCardContent } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCheckoutAddressList } from '@castlery/modules-checkout-domain';
import { PosAddressSelector } from '../pos-address-selector/pos-address-selector';
import { Plus } from '@castlery/fortress/Icons';
import { selectPosOrderNumber } from '@castlery/modules-order-domain';
export interface PosAddressDisplayCardProps {
  address: CheckoutAddressEntity_V2 | null;
  type: 'shipAddress' | 'billAddress';
}
export const PosAddressDisplayCard = memo(({ type, address }: PosAddressDisplayCardProps) => {
  const [open, setOpen] = useState(false);
  const checkoutAddressList = useAppSelector(selectCheckoutAddressList);
  const hasBeenGeneratedOrder = useAppSelector(selectPosOrderNumber);
  const addressDisabled = hasBeenGeneratedOrder && type === 'shipAddress';

  const toggle = () => {
    if (addressDisabled) {
      return;
    }
    setOpen((pre) => !pre);
  };

  const activeCardStyles = {
    backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
    span: {
      color: 'var(--fortress-palette-brand-warmLinen-500)',
    },
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          p: 6,
          cursor: hasBeenGeneratedOrder ? 'default' : 'pointer',
          border: (theme) => `1px solid ${theme.palette.brand.mono[300]}`,
          span: {
            color: addressDisabled
              ? 'var(--fortress-palette-brand-mono-500)'
              : 'var(--fortress-palette-brand-maroonVelvet-500)',
          },
          ...(open && !addressDisabled ? activeCardStyles : {}),
          ...(!open &&
            !addressDisabled && {
              '&:hover': {
                backgroundColor: 'var(--fortress-palette-brand-terracotta-100)',
              },
            }),
          ...(!addressDisabled && {
            '&:active': activeCardStyles,
          }),
        }}
        onClick={toggle}
      >
        {address ? (
          <AddressDisplayCardContent address={address} />
        ) : (
          <Button variant="tertiary" startDecorator={<Plus />} sx={{ margin: 'auto' }}>
            Add New Address
          </Button>
        )}
      </Box>
      <Drawer
        open={open}
        onClose={toggle}
        sx={{
          '& .MuiDrawer-content': {
            '@media (min-width:600px)': {
              width: 558, // 大于 600px 时改为 558px
            },
          },
          '@media (max-width:600px)': {
            '& .MuiModalClose-root': {
              top: 0,
              right: 8,
              zIndex: 9,
            },
          },
        }}
      >
        {checkoutAddressList && <PosAddressSelector afterSelect={toggle} type={type} />}
      </Drawer>
    </>
  );
});
