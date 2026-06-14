'use client';

import { useRef, useEffect } from 'react';
import { useAppStore } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export function PlpSearchPageClient({ breadcrumb }: { breadcrumb: string }) {
  const initializedRef = useRef(false);
  const store = useAppStore();

  useEffect(() => {
    if (!initializedRef.current) {
      store.dispatch(
        EVENT_COMMON_PAGE_VIEW({
          pageName: WEB_PAGE_NAMES.SEARCH_PAGE,
        })
      );
      initializedRef.current = true;
    }
  }, []);

  return null;
}
