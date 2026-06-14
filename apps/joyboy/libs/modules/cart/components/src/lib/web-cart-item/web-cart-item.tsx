'use client';
import { useEffect, useMemo } from 'react';
import { Stack, Box, useBreakpoints } from '@castlery/fortress';
import { CartItemInfo, LAYOUT_MODE } from '../cart-item-info/cart-item-info';
import { OutDatedNotice } from './out-dated-notice';
import type { LineItemSchema } from '@castlery/types';
import { isItemOutdated } from '@castlery/modules-cart-services';
import { cartOutdatedBannerImpressionEvent } from '@castlery/modules-cart-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';

function Masker() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: (theme) => theme.palette.brand.mono[50],
        opacity: 0.5,
        zIndex: 1,
      }}
    />
  );
}

interface WebCartItemProps {
  item: LineItemSchema;
}

export function WebCartItem({ item }: WebCartItemProps) {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const lineItem = item as LineItemSchema;
  const isOutdated = isItemOutdated(item);

  // Calculate padding based on breakpoint and mode
  const containerPadding = useMemo(() => {
    if (mobile) return { pb: 4, pt: 0 };
    return { pb: 6, pt: 6 }; // desktop or tablet
  }, [mobile]);

  useEffect(() => {
    if (!isOutdated) return;
    const sku = item.variant?.sku;
    const name = item.variant?.name;
    if (!sku || !name) return;
    dispatch(
      cartOutdatedBannerImpressionEvent({
        kind: item.isPriceOutdated ? 'price_change' : 'out_of_stock',
        sku,
        name,
      })
    );
  }, [isOutdated, item.isPriceOutdated, item.variant?.sku, item.variant?.name, dispatch]);

  return (
    <>
      {isOutdated && <OutDatedNotice isPriceOutdated={item.isPriceOutdated} />}
      <Stack
        sx={{
          position: 'relative',
          ...containerPadding,
        }}
      >
        {isOutdated && <Masker />}
        <CartItemInfo item={lineItem} layoutMode={LAYOUT_MODE.CART} showCustomized={false} />
      </Stack>
    </>
  );
}

export default WebCartItem;
