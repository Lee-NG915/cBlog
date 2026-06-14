'use client';
import React from 'react';
import { Button, useDecNiceModal, modalDialogClasses, Typography } from '@castlery/fortress';
import { PosDiscountCalculator, type SetDiscountFunction } from '../pos-discount-calculator/pos-discount-calculator';
import { EcEnv } from '@castlery/config';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export interface PosDiscountEditorProps {
  amount: string;
  discount: string;
  discountFn: SetDiscountFunction;
  disabled?: boolean;
}

export function PosDiscountEditor({ amount, discount, discountFn, disabled = false }: PosDiscountEditorProps) {
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();

  return (
    <React.Fragment>
      <Button
        variant="secondary"
        sx={{
          flex: 1,
          minWidth: 90,
          justifyContent: 'flex-start',
          ml: 1,
          paddingX: { xs: 1, lg: 2 },
          paddingY: 1.5,
        }}
        onClick={toggleModal}
        disabled={Number(amount) <= 0 || disabled}
      >
        <Typography
          level="body2"
          sx={{
            color: disabled
              ? (theme) => theme.palette.text.secondary
              : Number(discount)
              ? 'inherit'
              : (theme) => theme.palette.brand.wheat[500],
          }}
        >
          {Number(discount)
            ? Number(discount) > 0
              ? `-${currencySymbol}${Number(discount)}`
              : `${currencySymbol}${Number(discount) * -1}`
            : 'Discount'}
        </Typography>
      </Button>
      <NiceModal
        {...modalProps}
        showDefaultFooter={false}
        showCloseBtn={false}
        border={false}
        dialogSx={{
          width: 278,
          minWidth: 278,
          p: 0,
          [`&>.${modalDialogClasses.root}-content`]: {
            p: 0,
            gap: 0,
          },
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <PosDiscountCalculator
          total={Number(amount)}
          defaultDiscountOrigin={Number(discount) || 0}
          setDiscount={discountFn}
          afterSetDiscount={toggleModal}
        />
      </NiceModal>
    </React.Fragment>
  );
}

export default PosDiscountEditor;
