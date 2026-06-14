'use client';
import React from 'react';
import { Typography, Button } from '@castlery/fortress';
import { WarrantyItems } from '@castlery/types';
import { useAsyncFn } from 'react-use';

export interface PosAddWarrantyProps {
  loading?: boolean;
  children: string;
  clickHandler: () => void;
}

export function PosAddWarranty({ loading, children, clickHandler }: PosAddWarrantyProps) {
  return (
    <React.Fragment>
      <Button
        variant="tertiary"
        onClick={clickHandler}
        loading={loading}
        sx={{ maxWidth: 140, justifyContent: 'flex-start', p: 0, m: 0, minHeight: 'auto' }}
      >
        <Typography
          level="caption2"
          sx={{ color: (theme) => theme.palette.brand.charcoal[500], textDecoration: 'underline' }}
        >
          {children}
        </Typography>
      </Button>
    </React.Fragment>
  );
}

export interface PosAddWarrantyButtonProps {
  warrantyItem: WarrantyItems | null;
  add: () => void;
  remove: () => Promise<any>;
}
export const PosAddWarrantyButton = ({ warrantyItem, add, remove }: PosAddWarrantyButtonProps) => {
  const [removeState, handleRemove] = useAsyncFn(async () => {
    return await remove();
  }, [remove]);

  return (
    <>
      {warrantyItem ? (
        <PosAddWarranty loading={removeState.loading} clickHandler={handleRemove}>
          {'Remove Warranty'}
        </PosAddWarranty>
      ) : (
        <PosAddWarranty clickHandler={add}>{'Add Warranty'}</PosAddWarranty>
      )}
    </>
  );
};

export default PosAddWarranty;
