'use client';
import { CircularProgress, Link, linkClasses, useBreakpoints } from '@castlery/fortress';
import { Delete } from '@castlery/fortress/Icons';
import { selectRemoveItemLoading, updateRecordRemovedItem } from '@castlery/modules-cart-domain';
import { removeCartItemCommand } from '@castlery/modules-cart-services';
import { GiftLineItemSchema, LineItemSchema } from '@castlery/types';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { RemoveItemPopup } from '../cart-popups/remove-item-popup';
import { useState } from 'react';
import { logger } from '@castlery/observability';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';
import { GiftRemoveConfirmPopup } from '../cart-popups/gift-remove-confirm-popup';
interface WebRemoveActionProps {
  item: LineItemSchema | GiftLineItemSchema;
  isGift?: boolean;
}
export function WebRemoveAction({ item, isGift = false }: WebRemoveActionProps) {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const [openRemovePopup, setOpenRemovePopup] = useState(false);
  const [openRemoveGiftPopup, setOpenRemoveGiftPopup] = useState(false);
  const [activeRemoveItemId, setActiveRemoveItemId] = useState<LineItemSchema['id']>();
  const removeLoading = useAppSelector(selectRemoveItemLoading);

  const isLoading = removeLoading && activeRemoveItemId === item.id;

  const removeHandler = async () => {
    if (removeLoading) {
      return;
    }
    try {
      setActiveRemoveItemId(item.id);
      // recordRemovedItem is kept solely for the remove-undo-toast UI; tracking no longer
      // depends on this slice-as-relay pattern.
      dispatch(updateRecordRemovedItem(item as LineItemSchema));
      const res = await dispatch(removeCartItemCommand({ lineItem: item as LineItemSchema }));
      return res;
    } catch (error) {
      logger.error('web remove action removeHandler error', { error });
    }
  };

  const handleRemove = async () => {
    if (removeLoading) {
      return;
    }
    if (isGift) {
      setOpenRemoveGiftPopup(true);
      return;
    }
    if (item.llt && item.stockStatus !== 'OUT_OF_STOCK') {
      setOpenRemovePopup(true);
      return;
    }
    await removeHandler();
  };

  return (
    <>
      <Link
        data-selenium={DATA_SELENIUM_ID_MAP.CART_ITEM_REMOVE}
        component="button"
        level="body2"
        onClick={handleRemove}
        color="primary"
        sx={{
          minHeight: 22,
          p: 0,
          m: 0,
          paddingBlock: 0,
          paddingInline: 0,
          marginBlock: 0,
          marginInline: 0,
          gap: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          [`& .${linkClasses.startDecorator}`]: {
            marginInlineEnd: 1,
          },
        }}
        startDecorator={
          isLoading ? null : <Delete sx={{ ...(mobile ? { width: 16, height: 16 } : { width: 20, height: 20 }) }} />
        }
      >
        {isLoading ? <CircularProgress size={'md'} color="neutral" /> : 'Remove'}
      </Link>
      {!isGift && (
        <RemoveItemPopup
          item={item as LineItemSchema}
          openModal={openRemovePopup}
          setOpenModal={setOpenRemovePopup}
          removeHandler={removeHandler}
        />
      )}
      <GiftRemoveConfirmPopup
        open={openRemoveGiftPopup}
        onClose={() => setOpenRemoveGiftPopup(false)}
        onConfirm={async () => {
          await removeHandler();
          setOpenRemoveGiftPopup(false);
        }}
      />
    </>
  );
}

export default WebRemoveAction;
