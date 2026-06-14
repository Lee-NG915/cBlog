'use client';
import React, { useMemo } from 'react';
import { Box, Button, Stack, Card, DialogContent } from '@castlery/fortress';
import { Replay } from '@castlery/fortress/Icons';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useAsyncFn } from 'react-use';
import { PosCartItems } from '@castlery/modules-cart-components';
import { PosTradePartner } from '@castlery/modules-checkout-components';
import { PosPayButton } from '../pos-pay-button/pos-pay-button';
import { accessInSG, } from '@castlery/config';
import { PosCustomerHeader } from '../pos-customer-header/pos-customer-header';
import { refreshCart, selectCheckoutLoading } from '@castlery/modules-cart-domain';
import { PosOrderSummarySection } from '../pos-order-summary-section/pos-order-summary-section';
import { BackdropLoading } from '@castlery/shared-components';
import { selectAllPosCheckoutLineItems, selectCheckoutSummary } from '@castlery/modules-checkout-domain';
import type { SummarySchema } from '@castlery/types';

export const PosCheckoutSection = () => {
  const dispatch = useAppDispatch();
  const checkoutLineItems = useAppSelector(selectAllPosCheckoutLineItems);
  const checkoutSummary = useAppSelector(selectCheckoutSummary);

  const cartLoading = useAppSelector(selectCheckoutLoading);
  const outdatedCartItems = useMemo(
    () => checkoutLineItems?.filter((item) => item.isPriceOutdated) || [],
    [checkoutLineItems]
  );
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
          <Box sx={{ position: 'relative' }}>
            {cartLoading ? <BackdropLoading loading={true} size="sm" /> : null}
            <Card
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 0,
                minHeight: 200,
                backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
              }}
            >
              <PosCartItems lineItems={checkoutLineItems} />
            </Card>
            <Stack sx={{ flex: 'none' }}>
              <PosOrderSummarySection summaryInfo={checkoutSummary as SummarySchema} inCheckout={true} />
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <Stack spacing={4} sx={{ flex: 'none' }}>
        <PosPayButton />
      </Stack>
    </React.Fragment>
  );
};
