'use client';
import React, { useRef, useEffect } from 'react';
import { setCMSProductList } from '@castlery/modules-cms-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { enterApp } from '@castlery/modules-user-domain';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

interface BlogPageType {
  storyblokProductList: any;
  slug: string;
}

export const BlogPageClient = ({ storyblokProductList, slug }: BlogPageType) => {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    dispatch(
      enterApp({
        page: 'Blog',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (!hasTrackedPageView.current) {
      dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.BLOG_PAGE, pageVariant: slug }));
      hasTrackedPageView.current = true;
    }
  }, [dispatch, slug]);

  if (!initialized.current) {
    dispatch(setCMSProductList(storyblokProductList));
    initialized.current = true;
  }
  return <></>;
};
