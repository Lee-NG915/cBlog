'use client';
import React, { useMemo } from 'react';
import { Box, Button, Stack, Card, DialogContent } from '@castlery/fortress';
import { Replay } from '@castlery/fortress/Icons';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useAsyncFn } from 'react-use';
import { PosCartItems, PosCheckoutButton, PosAddServiceItems } from '@castlery/modules-cart-components';
import { PosTradePartner } from '@castlery/modules-checkout-components';
import { PosCartPromotionHint } from '@castlery/modules-promotion-components';
import { accessInSG, enableO2OFOrderV2 } from '@castlery/config';
import { PosCustomerHeader } from '../pos-customer-header/pos-customer-header';
import {
  selectCartLineItems,
  selectCartServiceLineItems,
  selectLineItemsAndServiceLineItems,
  selectCartGiftItems,
  refreshCart,
  selectCheckoutLoading,
  selectCartSummary,
  selectReloadCartLoading,
} from '@castlery/modules-cart-domain';
import { PosOrderSummarySection } from '../pos-order-summary-section/pos-order-summary-section';
import { PushToOnlineButton } from '../push-to-online-button/push-to-online-button';

export const PosCartSection = () => {
  const dispatch = useAppDispatch();
  const posServiceLineItems = useAppSelector(selectCartServiceLineItems);
  const posLineItems = useAppSelector(selectCartLineItems);
  const giftItems = useAppSelector(selectCartGiftItems);

  const cartItems = useMemo(
    () => [...(posLineItems || []), ...(giftItems || []), ...(posServiceLineItems || [])],
    [posLineItems, giftItems, posServiceLineItems]
  );
  const hasCartItems = posLineItems.length > 0 || giftItems.length > 0 || posServiceLineItems.length > 0;
  const reloadLoading = useAppSelector(selectReloadCartLoading);
  const cartLoading = useAppSelector(selectCheckoutLoading);
  const cartSummary = useAppSelector(selectCartSummary);
  const outdatedCartItems = useMemo(() => cartItems?.filter((item) => item.isPriceOutdated) || [], [cartItems]);
  const needRefresh = outdatedCartItems.length > 0;

  const [loadingState, refreshHandler] = useAsyncFn(async () => {
    const payload = outdatedCartItems.map((item) => ({
      cartItemId: item.id,
      variantId: item.variant.id,
    }));
    return await dispatch(refreshCart.initiate(payload));
  }, [dispatch, outdatedCartItems]);

  return (
    <React.Fragment>
      <DialogContent sx={{ padding: 0 }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Stack sx={{ flex: 'none' }}>
            <PosCustomerHeader />
            {accessInSG && <PosTradePartner />}
          </Stack>
          {needRefresh && (
            <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                variant="tertiary"
                loading={loadingState.loading}
                sx={{ width: 100, p: 0, gap: 1, minHeight: 'auto' }}
                onClick={refreshHandler}
              >
                <Replay color="inherit" />
                Refresh
              </Button>
            </Stack>
          )}
          <Box sx={{ position: 'relative', opacity: cartLoading || reloadLoading ? 0.7 : 1 }}>
            <Card
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                minHeight: 200,
                backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
              }}
            >
              {hasCartItems && <PosCartPromotionHint />}
              <PosCartItems lineItems={cartItems} />
            </Card>
            <Stack sx={{ flex: 'none', mt: 4 }}>
              <PosAddServiceItems />
            </Stack>
            <Stack sx={{ flex: 'none' }}>
              <PosOrderSummarySection summaryInfo={cartSummary} />
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <Stack spacing={2} sx={{ flex: 'none' }}>
        <PosCheckoutButton />
        {enableO2OFOrderV2 && <PushToOnlineButton />}
      </Stack>
    </React.Fragment>
  );
};
