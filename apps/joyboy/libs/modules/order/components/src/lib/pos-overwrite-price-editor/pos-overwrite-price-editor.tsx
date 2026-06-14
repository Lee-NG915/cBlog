'use client';
import React from 'react';
import { Button, useDecNiceModal, modalDialogClasses, Typography } from '@castlery/fortress';
import { EditorDialogContent } from './editor-dialog-content';
import { overWriteServiceItemPriceCommand } from '@castlery/modules-order-services';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EcEnv } from '@castlery/config';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export interface PosOverwritePriceEditorProps {
  disabled?: boolean;
  amount: string;
  itemId: number;
}

export function PosOverwritePriceEditor({ amount, itemId, disabled = false }: PosOverwritePriceEditorProps) {
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const dispatch = useAppDispatch();

  const overwritePrice = async (price: string) => {
    await dispatch(overWriteServiceItemPriceCommand({ price: price, lineItemId: itemId }));
  };

  return (
    <React.Fragment>
      <Button
        fullWidth
        variant="tertiary"
        color="primary"
        disabled={Number(amount) === 0 || disabled}
        onClick={toggleModal}
        sx={{
          justifyContent: 'space-between',
          borderBottom: (theme) => `1px solid ${theme.palette.brand.wheat[500]}`,
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
        border={false}
        dialogSx={{
          width: 278,
          minWidth: 278,
          padding: 0,
          [`&>.${modalDialogClasses.root}-content`]: {
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
