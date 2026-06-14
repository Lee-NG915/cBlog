'use client';
import { useState, useMemo } from 'react';
import { IconButton, Badge, Drawer, useDecNiceModal, Box, DialogContent } from '@castlery/fortress';
import { ShoppingBag } from '@castlery/fortress/Icons';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { usePathname } from 'next/navigation';
import { PosOnlineCartContent } from './pos-online-cart-content';
import { canAutoOpenOnlineCart, setAutoOpenOnlineCart } from './helper';
import { useAsyncFn, useDebounce } from 'react-use';
import { selectPosOnlineCartItems, getWebCartLineItems } from '@castlery/modules-cart-domain';
import { selectedCurrentCustomer } from '@castlery/modules-user-domain';
import { transferOnlineCartItemsToPosCommand } from '@castlery/modules-cart-services';

export const PosOnlineCartDrawer = () => {
  const clickDisabled = usePathname().includes('/checkout');
  const [open, setOpen] = useState(false);
  const { NiceModal, modalProps, toggleModal } = useDecNiceModal();
  const dispatch = useAppDispatch();

  const customer = useAppSelector(selectedCurrentCustomer);
  const onlineItems = useAppSelector(selectPosOnlineCartItems);

  const hasOnlineItems = useMemo(() => Array.isArray(onlineItems) && onlineItems?.length > 0, [onlineItems]);
  const currentCustomer = useMemo(() => customer?.id, [customer?.id]);

  const canOpenModal = useMemo(() => hasOnlineItems && !clickDisabled, [hasOnlineItems, clickDisabled]);
  const [loadingState, handleClick] = useAsyncFn(async () => {
    await dispatch(getWebCartLineItems.initiate(undefined, { forceRefetch: true }));
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
        <Badge
          invisible={!hasOnlineItems}
          sx={{
            '.MuiBadge-anchorOriginTopRight': {
              padding: 0,
              minHeight: 6,
              minWidth: 6,
              height: 6,
              width: 6,
            },
          }}
        >
          <ShoppingBag color="primary" />
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
        <DialogContent sx={{ px: 6 }}>
          <PosOnlineCartContent
            onClose={() => setOpen(false)}
            onConfirm={async (items) => {
              const payload = items.map((item) => ({
                lineItemId: item.id,
                variantId: item.variant.id,
              }));
              await dispatch(transferOnlineCartItemsToPosCommand(payload));
            }}
            onlineItems={onlineItems}
          />
        </DialogContent>
      </Drawer>
      <NiceModal
        {...modalProps}
        warning
        title="Online Cart"
        desc="This customer has an online cart. Add it here?"
        confirmText="Add Cart"
        showCloseBtn={false}
        onConfirm={() => setOpen(true)}
      />
    </>
  );
};
