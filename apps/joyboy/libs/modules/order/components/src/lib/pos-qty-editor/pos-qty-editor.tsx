'use client';
import { useState } from 'react';
import { Typography, Stack } from '@castlery/fortress';
import { CartQtyButton, QtyType } from '../pos-cart-buttons/cart-qty-button/cart-qty-button';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCheckoutBtnStatus } from '@castlery/modules-order-services';

export type PosQtyType = QtyType;
export interface PosQtyEditorProps {
  quantity: number;
  changeQty: (type: QtyType) => Promise<void>;
  disabled?: boolean;
}

export function PosQtyEditor({ quantity, changeQty, disabled }: PosQtyEditorProps) {
  const checkoutBtnStatus = useAppSelector(selectCheckoutBtnStatus);
  const [qtyType, setQtyType] = useState<QtyType | null>(null);
  const [qtyLoading, setQtyLoading] = useState<boolean>(false);

  const qtyFn = async (type: QtyType) => {
    setQtyLoading(true);
    setQtyType(type);
    await changeQty(type);
    setTimeout(() => {
      setQtyLoading(false);
    }, 1000);
  };

  const btnLoading = checkoutBtnStatus.loading || qtyLoading;
  return (
    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <CartQtyButton
        type={QtyType.REDUCE}
        disabled={quantity === 1 || btnLoading || disabled}
        loading={btnLoading && qtyType === QtyType.REDUCE}
        handler={qtyFn}
      />
      <Typography
        level="body2"
        sx={{
          minWidth: 48,
          textAlign: 'center',
          marginY: 'auto',
          color: (theme) => (disabled ? theme.palette.text.secondary : 'inherit'),
        }}
      >
        {quantity}
      </Typography>
      <CartQtyButton
        disabled={quantity >= 99 || btnLoading || disabled}
        type={QtyType.ADD}
        loading={btnLoading && qtyType === QtyType.ADD}
        handler={qtyFn}
      />
    </Stack>
  );
}

export default PosQtyEditor;
