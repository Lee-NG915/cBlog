'use client';
import { PosSiteHeader } from '@castlery/modules-composite-components';
import { Box } from '@castlery/fortress';
import * as React from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { enterApp } from '@castlery/modules-user-domain';
import { PosUmsPermissionGuard, PermissionLoading, PermissionDeny } from '@castlery/shared-components';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { RetailContextGuard } from '../discover/retail-context-guard.client';

export default function SaleHistoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(
      enterApp({
        page: 'SALES HISTORY',
      })
    );
  }, [dispatch]);
  return (
    <PosUmsPermissionGuard
      requirement={POS_UMS_PERMISSIONS.posPagesRead}
      loadingFallback={<PermissionLoading />}
      fallback={<PermissionDeny />}
    >
      <RetailContextGuard locale={params.locale}>
        <Box
          sx={{
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box role="heading" sx={{ flex: 'none' }}>
            <PosSiteHeader />
          </Box>
          <Box
            role="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
              width: '100%',
              overflowY: 'auto',
            }}
          >
            {children}
          </Box>
        </Box>
      </RetailContextGuard>
    </PosUmsPermissionGuard>
  );
}
