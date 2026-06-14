'use client';
import {
  Drawer,
  Box,
  Stack,
  Divider,
  drawerClasses,
  typographyClasses,
  useBreakpoints,
  dialogTitleClasses,
  modalCloseClasses,
} from '@castlery/fortress';
import { RemoveUndoToast, WebCartItemList, EmptyCart } from '@castlery/modules-cart-components';
import dynamic from 'next/dynamic';
import { WebCartSummary } from '../web-cart-summary/web-cart-summary';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import {
  selectMiniCartMode,
  updateMiniCartMode,
  selectAddToCartLoading,
  selectCartLineItems,
  cartViewedEvent,
} from '@castlery/modules-cart-domain';
import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { CartDYRecommendations } from '@castlery/modules-composite-components';
import { MiniCartTitle } from './mini-cart-title';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';
import { loadGuardsmanCartPlansCommand } from '@castlery/modules-cart-services';
import { sharedFeatureService } from '@castlery/shared-services';
import { PromotionHint } from '@castlery/modules-promotion-components';

// Memoized cart content component for optimized re-rendering
const CartContent = memo(function CartContent({
  cartLineItems,
  mobile,
  desktop,
  miniCartMode,
}: {
  cartLineItems: any[];
  mobile: boolean;
  desktop: boolean;
  miniCartMode: boolean;
}) {
  return (
    <>
      {cartLineItems?.length > 0 ? (
        <>
          <Stack sx={{ gap: desktop ? 4 : 2, ...(miniCartMode && { px: 6 }) }}>
            <PromotionHint />
          </Stack>
          <Stack sx={{ pt: mobile ? 4 : 6, gap: mobile ? 6 : 15 }}>
            <Stack sx={{ ...(miniCartMode && { px: 6 }) }}>
              <WebCartItemList />
            </Stack>
            <Box>
              <WebCartSummary />
            </Box>
          </Stack>
        </>
      ) : (
        <Stack direction="column" gap={8}>
          <EmptyCart />
          <Divider />
        </Stack>
      )}
    </>
  );
});

export function WebMiniCart() {
  const dispatch = useAppDispatch();
  const { mobile, desktop } = useBreakpoints();
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const [open, setOpen] = useState(false);
  const addToCartLoading = useAppSelector(selectAddToCartLoading);
  const cartLineItems = useAppSelector(selectCartLineItems);
  const isGuardsmanEnabled = sharedFeatureService.isGuardsmanEnabled();
  const hasLineItems = useMemo(() => {
    return Array.isArray(cartLineItems) && cartLineItems?.length > 0;
  }, [cartLineItems]);
  const guardsmanCartLookupKey = useMemo(
    () =>
      cartLineItems
        ?.map(
          (item) =>
            `${item.id}:${item.status}:${item.productType}:${item.variant?.sku}:${
              item.salePrice || item.cartSalePrice || item.variant?.price
            }`
        )
        .join('|') || '',
    [cartLineItems]
  );

  // Track if the cart has been opened at least once
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!miniCartMode) {
      setOpen(false);
    }
    if (miniCartMode && !addToCartLoading) {
      setOpen(true);
      // Mark as opened when drawer opens for the first time, and fire view_cart
      if (!hasOpenedRef.current) {
        hasOpenedRef.current = true;
        if (cartLineItems?.length) {
          dispatch(cartViewedEvent({ surface: 'miniCart', lineItems: cartLineItems }));
        }
      }
      // 更新 dy recommendation context @abby
    }
  }, [miniCartMode, addToCartLoading, cartLineItems, dispatch]);

  // [保险接入] MiniCart 打开时预加载 Guardsman cart plans（CA），供行内 Add warranty 按钮使用
  useEffect(() => {
    if (!open || !isGuardsmanEnabled) {
      return;
    }

    void dispatch(loadGuardsmanCartPlansCommand());
  }, [dispatch, guardsmanCartLookupKey, isGuardsmanEnabled, open]);

  const onClose = () => {
    setOpen(false);
    dispatch(updateMiniCartMode(false));
  };

  const wrapperStyle = useMemo(() => {
    return {
      ...(desktop && {
        gap: 4,
      }),
      ...(mobile && {
        px: 4,
      }),
    };
  }, [desktop, mobile]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      closeButtonDataSeleniumId={DATA_SELENIUM_ID_MAP.CLOSE_CART}
      // @ts-expect-error - MuiDrawer title type conflict with DrawerProps
      title={<MiniCartTitle isEmptyCart={!hasLineItems} onClose={onClose} />}
      sx={{
        [`& .${dialogTitleClasses.root}`]: {
          '--Drawer-titleMargin': (theme) => `${theme.spacing(6)} ${theme.spacing(6)}`,
          [`& .${typographyClasses.root}`]: {
            p: 0,
          },
        },
        [`& .${drawerClasses.content}`]: {
          ...(mobile
            ? {
                width: '100vw',
                height: '100dvh',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingTop: 'env(safe-area-inset-top, 0px)',
              }
            : { width: 496 }),
        },
        [`& .${modalCloseClasses.root}`]: {
          top: (theme) => `calc(${theme.spacing(6)} + env(safe-area-inset-top, 0px))`,
        },
      }}
    >
      {/* Only render content after first open */}
      {hasOpenedRef.current && (
        <>
          <Stack sx={wrapperStyle}>
            <CartContent cartLineItems={cartLineItems} mobile={mobile} desktop={desktop} miniCartMode={miniCartMode} />
          </Stack>
          <CartDYRecommendations miniCart />
          <RemoveUndoToast />
        </>
      )}
    </Drawer>
  );
}
