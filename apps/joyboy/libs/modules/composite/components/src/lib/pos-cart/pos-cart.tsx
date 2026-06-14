'use client';
import React, { useMemo } from 'react';
import { Box, Button, Stack, Card } from '@castlery/fortress';
import { DynamicDialogContent } from '@castlery/shared-fortress-client';
import { Replay } from '@castlery/fortress/Icons';
import { selectOrder } from '@castlery/modules-order-domain';
import {
  PosAddService,
  PushToOnline,
  PosCartItemsV2,
  OrderSummaryV2,
  CouponWalletV2,
} from '@castlery/modules-order-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { refreshCartCommand } from '@castlery/modules-order-services';
import { useAsyncFn } from 'react-use';
import { PosCheckoutButtonV2 } from '@castlery/modules-cart-components';
import { PosTradePartner, PayButton } from '@castlery/modules-checkout-components';
import { usePathname } from 'next/navigation';
import { accessInSG, enableO2O } from '@castlery/config';
import { PosCustomerHeader } from '../pos-customer-header/pos-customer-header';

export const PosCart = () => {
  const pathname = usePathname();
  const inCheckout = pathname.includes('/checkout');

  const dispatch = useAppDispatch();
  const order = useAppSelector(selectOrder);
  const needRefresh = useMemo(() => order?.line_items?.some((item) => item.is_price_outdated), [order]);

  const [loadingState, refreshHandler] = useAsyncFn(async () => {
    return await dispatch(refreshCartCommand());
  }, [dispatch]);

  const showTradePartner = inCheckout && accessInSG;
  return (
    <React.Fragment>
      <DynamicDialogContent sx={{ padding: 0 }}>
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
            {showTradePartner && <PosTradePartner />}
          </Stack>
          {needRefresh && (
            <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                variant="tertiary"
                loading={loadingState.loading}
                startDecorator={<Replay color="neutral" />}
                sx={{ width: 100, p: 0, minHeight: 'auto' }}
                onClick={refreshHandler}
              >
                Refresh
              </Button>
            </Stack>
          )}
          <Card
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 0,
              minHeight: 200,
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            }}
          >
            <PosCartItemsV2 />
          </Card>
          {!inCheckout && (
            <Stack sx={{ flex: 'none' }}>
              <PosAddService />
            </Stack>
          )}
          <Stack sx={{ flex: 'none' }}>
            <OrderSummaryV2 inCheckout={inCheckout} CouponWallet={<CouponWalletV2 />} />
          </Stack>
        </Box>
      </DynamicDialogContent>
      <Stack spacing={2} sx={{ flex: 'none' }}>
        {inCheckout ? (
          <PayButton />
        ) : (
          <>
            <PosCheckoutButtonV2 />
            {enableO2O && <PushToOnline />}
          </>
        )}
      </Stack>
    </React.Fragment>
  );
};
