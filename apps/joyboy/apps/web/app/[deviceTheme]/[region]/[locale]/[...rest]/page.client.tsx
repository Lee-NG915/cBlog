'use client';

import { WEB_PAGE_NAMES } from '@castlery/config';
import { setDYCampaignData } from '@castlery/modules-dy-domain';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef } from 'react';

interface StoryblokPageType {
  pageVariant: string;
  dyCampaignsData?: Record<string, any>;
}

export function PageClient({ pageVariant, dyCampaignsData }: StoryblokPageType) {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    dispatch(
      enterApp({
        page: 'Storyblok',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!hasTrackedPageView.current && pageVariant) {
      dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.STORYBLOK_PAGE, pageVariant: pageVariant }));
      hasTrackedPageView.current = true;
    }
  }, [dispatch, pageVariant]);

  if (!initialized.current) {
    //   // 如果要求组件在服务端要拿到接口进行渲染的话, 在page.tax(RSC)获取数据后
    //   // 在这里进行  store.dispatch 把数据注入到redux中
    //   // store.dispatch(setShsopTheLookData(shopTheLook));
    if (dyCampaignsData) {
      Object.keys(dyCampaignsData).forEach((campaignName) => {
        dispatch(
          setDYCampaignData({
            campaignName,
            campaignData: dyCampaignsData[campaignName],
          })
        );
      });
    }
    initialized.current = true;
  }

  return <></>;
}
