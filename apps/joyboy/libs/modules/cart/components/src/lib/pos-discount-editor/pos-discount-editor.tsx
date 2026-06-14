'use client';
import React from 'react';
import { Button, useDecNiceModal, modalDialogClasses, Typography, Link } from '@castlery/fortress';
import { PosDiscountCalculator, ManualSetDiscountType } from '../pos-discount-calculator/pos-discount-calculator';
import type { LineItemSchema } from '@castlery/types';
import { useManualSetDiscountMutation } from '@castlery/modules-cart-domain';
import { EcEnv } from '@castlery/config';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { useHasPosUmsPermission } from '@castlery/shared-components';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export interface PosDiscountEditorProps {
  item: LineItemSchema;
  discount: string;
  disabled?: boolean;
}

export function PosDiscountEditor({ disabled = false, item }: PosDiscountEditorProps) {
  const { id, manualDiscountTotal: discount, salePrice, quantity } = item;
  const discountNumber = Number(discount);
  const originalPriceTotalNumber = Number(salePrice) * quantity;
  const hasDiscountPermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posCartDiscount);
  const [manualSetDiscount] = useManualSetDiscountMutation();
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();

  const handleSetDiscount = async (type: keyof typeof ManualSetDiscountType, discount: number) => {
    const payload = {
      lineItemId: id,
      type,
      adjustment: discount.toString(),
    };
    // check if the discount is greater than the original total
    if (type === ManualSetDiscountType.fixed_amount && discount > originalPriceTotalNumber) {
      return;
    }
    if (type === ManualSetDiscountType.percentage && discount > 100) {
      return;
    }
    await manualSetDiscount(payload);
    toggleModal();
  };

  return (
    <React.Fragment>
      <Link
        variant="primary"
        component={Button}
        onClick={toggleModal}
        disabled={originalPriceTotalNumber <= 0 || disabled || !hasDiscountPermission}
        sx={{
          textTransform: 'none',
          width: 'fit-content',
          height: 'fit-content',
          p: 0,
          fontSize: '14px',
          button: {
            fontSize: '14px',
          },
        }}
      >
        {discountNumber
          ? discountNumber > 0
            ? `${currencySymbol}${discountNumber} off discount`
            : `${currencySymbol}${discountNumber * -1} off discount`
          : 'Apply discount'}
      </Link>
      <NiceModal
        {...modalProps}
        showDefaultFooter={false}
        showCloseBtn={false}
        dialogSx={{
          width: 282,
          minWidth: 282,
          p: 0,
          m: 0,
          gap: 0,
          border: 'unset',
          [`&>.${modalDialogClasses.root}-content`]: {
            p: 0,
            gap: 0,
          },
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        <PosDiscountCalculator
          originalPriceTotal={originalPriceTotalNumber}
          defaultDiscountOrigin={discountNumber || 0}
          setDiscount={handleSetDiscount}
        />
      </NiceModal>
    </React.Fragment>
  );
}

export default PosDiscountEditor;
