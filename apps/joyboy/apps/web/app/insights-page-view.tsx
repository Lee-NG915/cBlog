'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WEB_PAGE_NAMES, EC_COUNTRIES_ENUM, EcEnv } from '@castlery/config';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

/**
 * @description 跟踪页面视图
 * @note 由于页面视图触发时机有点晚了，后续优化后再启用， todo @abby
 */
let trackedPagePath = '';
export function InsightsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const regionCode = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase() as keyof typeof EC_COUNTRIES_ENUM;
  const [recordPageName, setRecordPageName] = useState('');
  const dispatch = useAppDispatch();

  const pageRules = {
    [WEB_PAGE_NAMES.HOME_PAGE]: new RegExp(`^/${regionCode}/?(?:\\?.*)?$`),
    [WEB_PAGE_NAMES.PRODUCT_DETAIL_PAGE]: new RegExp(`^/${regionCode}/products/[^/]+/?(?:\\?.*)?$`),
    [WEB_PAGE_NAMES.CART_PAGE]: new RegExp(`^/${regionCode}/cart/?(?:\\?.*)?$`),
    [WEB_PAGE_NAMES.CHECKOUT_PAGE]: new RegExp(`^/${regionCode}/checkout/?(?:\\?.*)?$`),
    [WEB_PAGE_NAMES.SHOP_THE_LOOK_PAGE]: new RegExp(`^/${regionCode}/shop-the-look/[^/]+/?(?:\\?.*)?$`),
    // [WEB_PAGE_NAMES.ROOM_DESIGNER_PAGE]: new RegExp(`^/${regionCode}/room-designer/[^/]+/?(?:\\?.*)?$`),
    // [WEB_PAGE_NAMES.BLOG_PAGE]: new RegExp(`^/${regionCode}/blog/[^/]+/?(?:\\?.*)?$`),
    [WEB_PAGE_NAMES.BLOG_LIST_PAGE]: new RegExp(`^/${regionCode}/blog/?(?:\\?.*)?$`),
    // [WEB_PAGE_NAMES.O2O_PAGE]: new RegExp(`^/${regionCode}/o2o/[^/]+/?(?:\\?.*)?$`),
  };

  const getPageName = (pathname: string) => {
    if (!pathname) return '';
    // const extraPathname = pathname.replace(`/${regionCode}`, '');
    for (const [pageName, rule] of Object.entries(pageRules)) {
      if (rule.test(pathname)) {
        return pageName;
      }
    }
    return '';
  };

  const trackPageView = async (pageName: string) => {
    await dispatch(EVENT_COMMON_PAGE_VIEW({ pageName }));
  };

  useEffect(() => {
    if (!pathname) return;
    // console.log('InsightsPageView searchParams', searchParams);
    if (pathname !== trackedPagePath) {
      const pageName = getPageName(pathname);
      console.log('InsightsPageView pageName', pageName);
      trackPageView(pageName);
      trackedPagePath = pathname;
    }

    // const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');

    // // 在这里调用你的统计逻辑
    // // 例如 Google Analytics / PostHog / 自建埋点
    // window.gtag?.('event', 'page_view', { page_path: url });
    // 或者 posthog.capture('$pageview')
    // 或自建 fetch('/api/track', {method:'POST', body: JSON.stringify({url})})
  }, [pathname]);

  return null;
}
