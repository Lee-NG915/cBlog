'use client';
import { useCallback, useMemo } from 'react';
import { Link, CircularProgress } from '@castlery/fortress';
import { Refresh } from '@castlery/fortress/Icons';
import {
  selectCartLineItems,
  useRefreshCartMutation,
  selectRefreshLoading,
  cartRefreshButtonClickedEvent,
  type CartRefreshButtonSurface,
} from '@castlery/modules-cart-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';

interface CartRefreshButtonProps {
  surface: CartRefreshButtonSurface;
}

export function CartRefreshButton({ surface }: CartRefreshButtonProps) {
  const dispatch = useAppDispatch();
  const cartLineItems = useAppSelector(selectCartLineItems);
  const refreshLoading = useAppSelector(selectRefreshLoading);
  const [refreshCartTrigger] = useRefreshCartMutation();

  const outdatedItems = useMemo(
    () => (Array.isArray(cartLineItems) ? cartLineItems.filter((item) => item.isPriceOutdated) : []),
    [cartLineItems]
  );

  const showRefreshButton = outdatedItems.length > 0;

  const handleRefresh = useCallback(async () => {
    dispatch(cartRefreshButtonClickedEvent({ surface }));

    if (!outdatedItems.length || refreshLoading) {
      return;
    }

    const cartItemIdList = outdatedItems.map((item) => ({
      cartItemId: item.id,
      variantId: item.variant.id,
    }));

    await refreshCartTrigger(cartItemIdList);
  }, [dispatch, surface, outdatedItems, refreshLoading, refreshCartTrigger]);

  if (!showRefreshButton) return null;

  return (
    <Link level="body1" variant="primary" component="button" onClick={handleRefresh} sx={{ gap: 1 }}>
      {refreshLoading ? (
        <CircularProgress variant="soft" size="sm" />
      ) : (
        <>
          Refresh
          <Refresh />
        </>
      )}
    </Link>
  );
}

export default CartRefreshButton;
