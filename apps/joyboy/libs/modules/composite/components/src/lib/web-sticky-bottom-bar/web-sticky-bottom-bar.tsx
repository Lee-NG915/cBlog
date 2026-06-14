'use client';

import { Box, Stack } from '@castlery/fortress';
import { WebCheckoutButton } from '../web-checkout-button/web-checkout-button';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { WebTotalItem, WebContinueShopping } from '@castlery/modules-cart-components';

export function WebStickyBottomBar() {
  const isInMiniCart = useAppSelector(selectMiniCartMode);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        boxShadow: 'md',
        zIndex: 'var(--fortress-zIndex-tooltip)',
        mx: 'auto',
        right: 0,
        p: 4,
        background: (theme) => theme.palette.brand.warmLinen[100],
      }}
    >
      <Stack spacing={4} alignItems="center">
        <WebTotalItem />
        <WebCheckoutButton fullFillWidth />
        {isInMiniCart && <WebContinueShopping />}
      </Stack>
    </Box>
  );
}

export default WebStickyBottomBar;
