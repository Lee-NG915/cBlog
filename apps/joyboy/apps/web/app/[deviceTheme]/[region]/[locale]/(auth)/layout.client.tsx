'use client';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef } from 'react';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';
import { usePathname } from 'next/navigation';

export default function AuthLayoutClient() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const recordPathname = useRef('');

  useEffect(() => {
    if (recordPathname.current === pathname) return;
    dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.ACCOUNT_PAGE }));
    recordPathname.current = pathname;
  }, [dispatch, recordPathname, pathname]);

  return null;
}
