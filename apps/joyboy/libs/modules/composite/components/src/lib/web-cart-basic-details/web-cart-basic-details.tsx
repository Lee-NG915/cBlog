'use client';
import { useMemo } from 'react';
import { Box, Divider, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { WebCartSummary } from '../web-cart-summary/web-cart-summary';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectInitialCartLoading, selectHasItemsInWebCart } from '@castlery/modules-cart-domain';
import { PromotionHint } from '@castlery/modules-promotion-components';
import {
  WebCartLayout,
  CartProductsSection,
  RemoveUndoToast,
  EmptyCart,
  WebCartSkeleton,
  CartRefreshButton,
} from '@castlery/modules-cart-components';

export function WebCartBasicDetails() {
  const { desktop } = useBreakpoints();
  const initialCartLoading = useAppSelector(selectInitialCartLoading);
  const hasItemsInWebCart = useAppSelector(selectHasItemsInWebCart);
  const isEmptyCartMode = !hasItemsInWebCart;

  const contentStyles = useMemo(() => {
    const leftSectionStyle = {
      width: '100%',
      flex: 1,
      gap: 6,
      overflow: 'hidden',
    };

    const headerStyle = {
      mb: { xs: 0, lg: 2 },
      columnGap: { xs: 0, lg: 4 },
    };

    const rightSectionStyle = {
      flex: 'none',
      width: '100%',
      background: {
        xs: (theme: any) => theme.palette.brand.warmLinen[500],
        md: (theme: any) => theme.palette.brand.warmLinen[200],
      },
      maxWidth: {
        x: '100%',
        md: 582,
      },
      py: {
        xs: 6,
        md: 0,
      },
    };

    return {
      leftSectionStyle,
      headerStyle,
      rightSectionStyle,
    };
  }, []);

  if (initialCartLoading) {
    return <WebCartSkeleton />;
  }

  if (isEmptyCartMode) {
    return <EmptyCart />;
  }

  return (
    <>
      <WebCartLayout>
        <Stack sx={contentStyles.leftSectionStyle}>
          <Stack>
            <Stack direction="row" alignItems="center" sx={contentStyles.headerStyle}>
              <Typography level="h1">Your cart </Typography>
              <CartRefreshButton surface="fullCart" />
            </Stack>
            <PromotionHint />
          </Stack>
          <CartProductsSection />
        </Stack>
        {desktop && <Divider orientation="vertical" />}
        <Box sx={contentStyles.rightSectionStyle}>
          <WebCartSummary />
        </Box>
      </WebCartLayout>
      <RemoveUndoToast />
    </>
  );
}
