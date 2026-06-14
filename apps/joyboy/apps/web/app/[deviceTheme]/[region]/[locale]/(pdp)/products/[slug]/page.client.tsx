'use client';
import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW, EVENT_PDP_DETAILS, EVENT_VIEW_ITEM } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export function PDPPageClient() {
  const dispatch = useAppDispatch();
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      dispatch(
        EVENT_COMMON_PAGE_VIEW({
          pageName: WEB_PAGE_NAMES.PRODUCT_DETAIL_PAGE,
        })
      );
      dispatch(EVENT_VIEW_ITEM());
      dispatch(EVENT_PDP_DETAILS({ action: 'page_view' }));
      hasTrackedPageView.current = true;
    }
  }, [dispatch]);

  return <></>;
}
