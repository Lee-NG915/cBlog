'use client';
import React from 'react';
import { Button, useDecNiceModal, modalDialogClasses, Typography } from '@castlery/fortress';
import { EditorDialogContent } from './editor-dialog-content';
import { EcEnv } from '@castlery/config';
import { useOverWriteServicePriceMutation } from '@castlery/modules-cart-domain';
import { LineItem_V2, LineItemSchema } from '@castlery/types';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { useHasPosUmsPermission } from '@castlery/shared-components';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export interface PosOverwritePriceEditorProps {
  disabled?: boolean;
  amount: string;
  lineItemId: LineItemSchema['id'];
}

export function PosOverwritePriceEditor({ amount, lineItemId, disabled = false }: PosOverwritePriceEditorProps) {
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const [overWriteServicePriceTrigger] = useOverWriteServicePriceMutation();
  const hasOverwritePricePermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posCartDiscount);
  const overwritePrice = async (price: string) => {
    await overWriteServicePriceTrigger({ price: price, lineItemId: lineItemId });
  };

  return (
    <React.Fragment>
      <Button
        fullWidth
        variant="tertiary"
        color="primary"
        disabled={Number(amount) < 0 || disabled || !hasOverwritePricePermission}
        onClick={toggleModal}
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <Typography color="neutral">
          {currencySymbol}
          {amount}
        </Typography>
        Set
      </Button>

      <NiceModal
        {...modalProps}
        showDefaultFooter={false}
        showCloseBtn={false}
        dialogSx={{
          width: 278,
          minWidth: 278,
          padding: 0,
          gap: 0,
          [`&> .${modalDialogClasses.root}-content`]: {
            padding: 0,
          },
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <EditorDialogContent defaultAmount={amount} overwritePrice={overwritePrice} afterSet={toggleModal} />
      </NiceModal>
    </React.Fragment>
  );
}

export default PosOverwritePriceEditor;
