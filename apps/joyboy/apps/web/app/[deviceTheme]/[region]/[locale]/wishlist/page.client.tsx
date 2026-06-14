'use client';

import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';
import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef } from 'react';

export function PageClient() {
  const dispatch = useAppDispatch();
  const hasTrackedPageView = useRef(false);
  useEffect(() => {
    dispatch(
      enterApp({
        page: 'Wishlist',
      })
    );
  }, [dispatch]);
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.WISHLIST_PAGE }));
      hasTrackedPageView.current = true;
    }
  }, [dispatch]);
  return <></>;
}
