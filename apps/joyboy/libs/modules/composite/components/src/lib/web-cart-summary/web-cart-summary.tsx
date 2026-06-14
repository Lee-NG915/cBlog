'use client';
import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { selectCartSummary, selectMiniCartMode } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { WebContinueShopping } from '@castlery/modules-cart-components';
import { WebCheckoutButton } from '../web-checkout-button/web-checkout-button';
import { WebStickyBottomBar } from '../web-sticky-bottom-bar/web-sticky-bottom-bar';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { WebOrderSummaryList } from '../web-order-summary-list/web-order-summary-list';
import type { SummarySchema } from '@castlery/types';

export function WebCartSummary() {
  const { desktop, mobile, tablet } = useBreakpoints();
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const summary = useAppSelector(selectCartSummary);
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCartSummary' });
  const checkoutElementRef = useRef<HTMLDivElement>(null);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);

  // Memoize main container styles
  const containerStyles = useMemo(
    () => ({
      width: '100%',
      color: (theme: any) => theme.palette.brand.maroonVelvet[500],
    }),
    []
  );

  // Memoize checkout section styles
  const checkoutSectionStyles = useMemo(
    () => ({
      ...(desktop && { mt: 0 }),
      ...(mobile && { mt: 3 }),
      ...(tablet && { mt: 6 }),
      ...(miniCartMode && { flexDirection: 'column', alignItems: 'center', gap: 3, px: mobile ? 0 : 6 }),
    }),
    [desktop, mobile, tablet, miniCartMode]
  );

  // Optimize IntersectionObserver callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry) {
      setStickyBarVisible(!entry.isIntersecting);
    }
  }, []);

  // Setup IntersectionObserver for sticky bar visibility
  useEffect(() => {
    if (!mobile || !checkoutElementRef.current) {
      setStickyBarVisible(false);
      return;
    }

    const checkoutEle = checkoutElementRef.current;
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0,
      rootMargin: '0px',
    });

    observer.observe(checkoutEle);

    return () => {
      observer.disconnect();
    };
  }, [mobile, handleIntersection]);

  return (
    <>
      <Stack sx={containerStyles}>
        {!miniCartMode && (
          <Typography level="h2" mb={3}>
            {t('title')}
          </Typography>
        )}
        {summary && <WebOrderSummaryList summary={summary as SummarySchema} inEstimatedShippingStep />}
        <Stack ref={checkoutElementRef} sx={checkoutSectionStyles}>
          <WebCheckoutButton fullFillWidth />
          {miniCartMode && <WebContinueShopping />}
        </Stack>
      </Stack>
      {stickyBarVisible && <WebStickyBottomBar />}
    </>
  );
}

export default WebCartSummary;
