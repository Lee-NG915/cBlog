'use client';
import { memo, useState } from 'react';
import { IconButton } from '@castlery/fortress';
import { Delete } from '@castlery/fortress/Icons';
import { LineItemSchema } from '@castlery/types';
import { selectRemoveItemLoading, useRemoveCartItemMutation } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { GiftRemoveConfirmPopup } from '../../cart-popups/gift-remove-confirm-popup';

export interface PosDeleteItemActionProps {
  lineItemId: LineItemSchema['id'];
  isGiftItem?: boolean;
}
export const PosDeleteItemAction = memo(({ lineItemId, isGiftItem = false }: PosDeleteItemActionProps) => {
  const [removeCartItemTrigger] = useRemoveCartItemMutation();
  const removeLoading = useAppSelector(selectRemoveItemLoading);
  const [openGiftConfirm, setOpenGiftConfirm] = useState(false);

  const doRemove = async () => {
    if (!lineItemId) return;
    await removeCartItemTrigger({ lineItemId });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGiftItem) {
      setOpenGiftConfirm(true);
    } else {
      doRemove();
    }
  };

  return (
    <>
      <IconButton
        loading={removeLoading}
        disabled={removeLoading}
        onClick={handleClick}
        sx={{ p: 0, minWidth: 24, minHeight: 24 }}
      >
        <Delete color="danger" />
      </IconButton>
      {isGiftItem && (
        <GiftRemoveConfirmPopup
          open={openGiftConfirm}
          onClose={() => setOpenGiftConfirm(false)}
          onConfirm={async () => {
            await doRemove();
            setOpenGiftConfirm(false);
          }}
        />
      )}
    </>
  );
});

export default PosDeleteItemAction;
