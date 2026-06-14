'use client';

import { useRef, useEffect } from 'react';
import { useAppStore } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export function PlpPageClient({ permalinkList, link }: { permalinkList: Array<string>; link: string }) {
  const initializedRef = useRef(false);
  const store = useAppStore();

  // 由于当前breadcrumb Data 和 op不一致，所以数据追踪这里取值也和op不一致，等待breadcrumb优化后这里再优化
  useEffect(() => {
    if (!initializedRef.current) {
      if (Array.isArray(permalinkList) && permalinkList.length > 0) {
        const customPageContent = permalinkList[0];

        store.dispatch(
          EVENT_COMMON_PAGE_VIEW({
            pageName: WEB_PAGE_NAMES.CATEGORY_PAGE,
            customPageContent,
            customPageProduct: link,
          })
        );
        initializedRef.current = true;
      }
    }
  }, [permalinkList]);

  return null;
}
