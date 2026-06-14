'use client';
import { useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export function PlpCollectionPageClient({ breadcrumb, slug }: { breadcrumb: string; slug: string }) {
  const initializedRef = useRef(false);
  const store = useAppStore();

  useEffect(() => {
    if (!initializedRef.current) {
      store.dispatch(
        EVENT_COMMON_PAGE_VIEW({
          pageName: WEB_PAGE_NAMES.COLLECTION_PAGE,
          customPageProduct: slug,
        })
      );
      initializedRef.current = true;
    }
  }, [slug]);

  return null;
}
