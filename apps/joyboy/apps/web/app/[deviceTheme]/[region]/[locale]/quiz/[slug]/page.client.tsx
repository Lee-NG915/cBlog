'use client';

import { enterApp } from '@castlery/modules-user-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef } from 'react';

export function PageClient() {
  const dispatch = useAppDispatch();
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    dispatch(
      enterApp({
        page: 'Quiz',
      })
    );
  }, [dispatch]);

  // useEffect(() => {
  //   if (!hasTrackedPageView.current) {
  //     dispatch(
  //       EVENT_COMMON_PAGE_VIEW({
  //         pageName: WEB_PAGE_NAMES.CORPORATE_PAGE,
  //       })
  //     );
  //     hasTrackedPageView.current = true;
  //   }
  // }, [dispatch]);

  return <></>;
}
