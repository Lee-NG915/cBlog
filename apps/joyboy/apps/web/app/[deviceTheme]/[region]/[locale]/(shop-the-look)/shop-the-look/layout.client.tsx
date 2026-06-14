'use client';

import { enterApp } from '@castlery/modules-user-domain';
import { Container, useBreakpoints } from '@castlery/fortress';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { ShopTheLookTopBar } from '@castlery/modules-others-components';
import { ShopTheLookDataV2Storyblok } from '@castlery/types';
import { setShopTheLookData } from '@castlery/modules-cms-domain';
import { trackCommonPageViewEvent } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export default function ShopTheLookLayoutClient({
  shopTheLookContent,
  children,
}: {
  shopTheLookContent: ShopTheLookDataV2Storyblok;
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    dispatch(enterApp({ page: 'ShopTheLook' }));
  }, [dispatch]);

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      dispatch(trackCommonPageViewEvent({ pageName: WEB_PAGE_NAMES.SHOP_THE_LOOK_PAGE }));
      hasTrackedPageView.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(setShopTheLookData(shopTheLookContent));
  }, [dispatch, shopTheLookContent]);

  return (
    <Container
      sx={{
        ...(!desktop && { padding: '0 !important' }),
      }}
    >
      <ShopTheLookTopBar />
      {children}
    </Container>
  );
}
