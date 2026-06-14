'use client';
import React from 'react';
import { Card, Stack, Link, typographyClasses, linkClasses } from '@castlery/fortress';
import { CheckoutAddressEntity_V2, CustomerAddressEntity_V2 } from '@castlery/types';
import { AddressDisplayCardContent } from '@castlery/shared-components';
import { accessInPos } from '@castlery/config';
export interface AddressDisplayCardProps {
  address: CustomerAddressEntity_V2 | CheckoutAddressEntity_V2;
  selected: boolean;
  enableEdit?: boolean;
  onEdit?: (address: CustomerAddressEntity_V2 | CheckoutAddressEntity_V2) => void;
  onSelect?: (address: CustomerAddressEntity_V2 | CheckoutAddressEntity_V2) => void;
  children?: React.ReactNode;
}

export const AddressDisplayCard: React.FC<AddressDisplayCardProps> = ({
  address,
  selected = false,
  enableEdit = true,
  onSelect,
  onEdit,
}) => {
  return (
    <Card
      role="button"
      variant={selected ? 'solid' : 'outlined'}
      sx={{
        p: 0,
        m: 0,
        gap: 0,
        width: '100%',
        minWidth: 250,
        minHeight: 172,
        position: 'relative',
        ...(accessInPos &&
          !selected && {
            '&:hover': {
              backgroundColor: 'var(--fortress-palette-brand-terracotta-100)',
              cursor: 'pointer',
            },
            '&:active': {
              backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
              color: 'var(--fortress-palette-brand-warmLinen-500)',
              span: {
                color: 'var(--fortress-palette-brand-warmLinen-500)',
              },
            },
          }),
        backgroundColor: (theme) => (selected ? theme.palette.brand.terracotta[500] : 'transparent'),
        [`& .${typographyClasses.root}`]: {
          color: (theme) => (selected ? theme.palette.common.white : theme.palette.text.primary),
        },
        [`& .${linkClasses.root}`]: {
          color: (theme) => (selected ? theme.palette.common.white : theme.palette.text.primary),
          textDecorationColor: (theme) => (selected ? theme.palette.common.white : theme.palette.text.primary),
        },
      }}
      onClick={() => onSelect?.(address)}
    >
      <Stack
        sx={{
          p: 6,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 0,
          cursor: 'pointer',
        }}
      >
        <Stack>
          <AddressDisplayCardContent address={address} />
        </Stack>

        {enableEdit && (
          <Stack direction="row" justifyContent="flex-start">
            <Link
              component="button"
              level="caption1"
              sx={{
                py: 2,
                display: 'inline',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(address);
              }}
            >
              Edit
            </Link>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
