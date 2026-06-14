'use client';
import { Stack } from '@castlery/fortress';
import { WebCartItemList } from '../web-cart-item-list/web-cart-item-list';
import { selectCartActionLoading, selectReloadCartLoading } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';

export function CartProductsSection() {
  const actionLoading = useAppSelector(selectCartActionLoading);
  const reloadCartLoading = useAppSelector(selectReloadCartLoading);
  const showLoading = actionLoading || reloadCartLoading;

  return (
    <Stack
      sx={{
        position: 'relative',
        opacity: showLoading ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      <WebCartItemList />
    </Stack>
  );
}

export default CartProductsSection;
