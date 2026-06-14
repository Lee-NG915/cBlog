'use client';

import { useRef, useEffect } from 'react';
import { useAppStore } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export function PlpVisualSalePageClient({ breadcrumb, key }: { breadcrumb: string; key: string }) {
  const initializedRef = useRef(false);
  const store = useAppStore();

  useEffect(() => {
    if (!initializedRef.current) {
      store.dispatch(
        EVENT_COMMON_PAGE_VIEW({
          pageName: WEB_PAGE_NAMES.SALE_PAGE,
          customPageProduct: key,
        })
      );
      initializedRef.current = true;
    }
  }, [key]);

  return null;
}
