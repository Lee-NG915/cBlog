'use client';
import { useState, useMemo } from 'react';
import { IconButton, Badge, Drawer, useDecNiceModal } from '@castlery/fortress';
import { ShoppingBag } from '@castlery/fortress/Icons';
import { selectOnlineLineItems, selectOnlineOrder } from '@castlery/modules-order-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { transferItemsCommand, getWebOrderByUidCommand } from '@castlery/modules-order-services';
import { usePathname } from 'next/navigation';
import { PosOnlineCartContent } from './pos-online-cart-content';
import { canAutoOpenOnlineCart, setAutoOpenOnlineCart } from './helper';
import { useAsyncFn, useDebounce } from 'react-use';

export const PosOnlineCart = () => {
  const clickDisabled = usePathname().includes('/checkout');
  const [open, setOpen] = useState(false);
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const dispatch = useAppDispatch();

  const onlineItems = useAppSelector(selectOnlineLineItems);
  const onlineOrder = useAppSelector(selectOnlineOrder);
  const hasOnlineOrder = Array.isArray(onlineItems) && onlineItems?.length > 0;
  const currentCustomer = useMemo(() => onlineOrder?.user_id, [onlineOrder?.user_id]);

  const canOpenModal = useMemo(() => hasOnlineOrder && !clickDisabled, [hasOnlineOrder, clickDisabled]);
  const [loadingState, handleClick] = useAsyncFn(async () => {
    await dispatch(
      getWebOrderByUidCommand({
        forceRefetch: true,
      })
    );
    setOpen(true);
  }, [setOpen, dispatch]);

  useDebounce(
    () => {
      if (canOpenModal && canAutoOpenOnlineCart(currentCustomer)) {
        toggleModal();
        currentCustomer && setAutoOpenOnlineCart(currentCustomer, true);
      }
    },
    500,
    [canOpenModal, currentCustomer, toggleModal]
  );

  return (
    <>
      <IconButton size="sm" onClick={handleClick} loading={loadingState.loading} disabled={clickDisabled}>
        <Badge invisible={!hasOnlineOrder}>
          <ShoppingBag color="primary" sx={{ width: 24, height: 24 }} />
        </Badge>
      </IconButton>
      <Drawer
        title="Online Cart"
        showCloseButton
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <PosOnlineCartContent
          cancel={() => {
            setOpen(false);
          }}
          confirm={async ({ to, itemIds }) => {
            return await dispatch(transferItemsCommand({ to, itemIds }));
          }}
          onlineOrder={onlineOrder}
        />
      </Drawer>
      <NiceModal
        {...modalProps}
        warning
        title="Online Cart"
        desc="This customer has an online cart. Add it here?"
        confirmText="Add Cart"
        showCloseBtn={false}
        onConfirm={() => setOpen(true)}
        dialogSx={{
          h2: {
            justifyContent: 'center',
          },
        }}
      />
    </>
  );
};
