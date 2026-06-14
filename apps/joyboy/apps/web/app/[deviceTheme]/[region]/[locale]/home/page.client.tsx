'use client';

import { enterApp } from '@castlery/modules-user-domain';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { setDYCampaignData } from '@castlery/modules-dy-domain';
import { YotpoScript } from '@castlery/modules-promotion-components';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { EcEnv, WEB_PAGE_NAMES } from '@castlery/config';
interface HomePageType {
  pageVariant: string;
  dyCampaignsData: Record<string, any>;
}

export function HomePageClient({ pageVariant, dyCampaignsData }: HomePageType) {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);
  const hasTrackedPageView = useRef(false);
  const user = useAppSelector(selectedActiveUser);
  const searchParams = useSearchParams();
  const srefId = searchParams.get('sref_id');

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      dispatch(enterApp({ page: 'Home' }));
      dispatch(
        EVENT_COMMON_PAGE_VIEW({
          pageName: WEB_PAGE_NAMES.HOME_PAGE,
        })
      );
      hasTrackedPageView.current = true;
    }
  }, [dispatch]);

  if (!initialized.current) {
    Object.keys(dyCampaignsData).forEach((campaignName) => {
      dispatch(
        setDYCampaignData({
          campaignName,
          campaignData: dyCampaignsData[campaignName],
        })
      );
    });
    initialized.current = true;
  }

  return <>{EcEnv.NEXT_PUBLIC_YOTPO_ENABLED && srefId && <YotpoScript user={user} />}</>;
}
