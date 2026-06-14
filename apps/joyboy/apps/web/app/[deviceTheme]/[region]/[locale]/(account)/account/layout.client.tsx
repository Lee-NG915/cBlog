'use client';

import { enterApp, useGetUserSubscriptionsQuery } from '@castlery/modules-user-domain';
import { Box, Container } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress';
import { AccountSidebar } from '@castlery/modules-user-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useEffect, useRef } from 'react';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';
import { usePathname } from 'next/navigation';

export default function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { desktop, mobile, tablet } = useBreakpoints();
  const pathname = usePathname();
  const recordPathname = useRef('');

  // 只在组件首次挂载时请求一次用户订阅信息
  useGetUserSubscriptionsQuery();

  useEffect(() => {
    dispatch(enterApp({ page: 'Account' }));
  }, [dispatch]);

  useEffect(() => {
    if (recordPathname.current === pathname) return;
    // 跟踪所有account下的child page view
    dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: WEB_PAGE_NAMES.ACCOUNT_PAGE }));
    recordPathname.current = pathname;
  }, [dispatch, recordPathname, pathname]);
  return (
    <>
      {desktop && (
        <Container
          disableGutters
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'minmax(288px, min(20%, 356px)) 1fr',
            px: 0,
          }}
        >
          <AccountSidebar />
          <Box
            sx={{
              flex: 1,
              minHeight: '90vh',
              position: 'relative',
            }}
          >
            {children}
          </Box>
        </Container>
      )}
      {(mobile || tablet) && (
        <>
          <AccountSidebar />
          <Box
            sx={{
              width: '100vw',
            }}
          >
            {children}
          </Box>
        </>
      )}
    </>
  );
}
