'use client';
import { Divider, Stack, useBreakpoints } from '@castlery/fortress';
import { WebCartItem } from '../web-cart-item/web-cart-item';
import { useAppSelector } from '@castlery/shared-redux-store';
import {
  selectCartGiftItems,
  selectCartLineItems,
  selectHasItemsInWebCart,
  selectMiniCartMode,
} from '@castlery/modules-cart-domain';
import type { GiftLineItemSchema, LineItemSchema } from '@castlery/types';
import { WebCartGiftItem } from '../web-cart-gift-item/web-cart-gift-item';

export function WebCartItemList() {
  const { lineItems, giftsItems, miniCartMode, hasItemsInWebCart } = useAppSelector((state) => ({
    lineItems: selectCartLineItems(state) as LineItemSchema[],
    giftsItems: selectCartGiftItems(state),
    miniCartMode: selectMiniCartMode(state),
    hasItemsInWebCart: selectHasItemsInWebCart(state),
  }));
  const { tablet, desktop, mobile } = useBreakpoints();

  if (!hasItemsInWebCart) {
    return null;
  }
  return (
    <Stack sx={{ ...(mobile && { gap: 6 }) }}>
      {lineItems.map((item: LineItemSchema, index: number) => (
        <Stack key={item.id} sx={{ ...(mobile && { gap: 6 }) }}>
          {!mobile && index !== 0 && <Divider sx={{ mb: 6 }} />}
          <WebCartItem item={item} />
        </Stack>
      ))}
      {giftsItems.map((item: GiftLineItemSchema, index: number) => (
        <Stack key={item.id}>
          {!mobile && (index !== 0 || lineItems.length > 0) && (
            <Divider
              sx={{
                ...(tablet && {
                  my: 5,
                }),
                ...(desktop && {
                  my: 4,
                }),
                ...(miniCartMode
                  ? {
                      my: 5,
                    }
                  : {}),
              }}
            />
          )}
          <WebCartGiftItem item={item} />
        </Stack>
      ))}
    </Stack>
  );
}

export default WebCartItemList;
