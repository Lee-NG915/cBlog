'use client';
import * as React from 'react';
import { Box, useBreakpoints } from '@castlery/fortress';
import { PosSiteHeader } from '@castlery/modules-composite-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectedPage } from '@castlery/modules-user-domain';
import { redirect } from 'next/navigation';
import { posRoutes } from '@castlery/config';
import { PosCart, PosCheckoutSection } from '@castlery/modules-composite-components';
import { sharedFeatureService } from '@castlery/shared-services';
import { clearPosOrderPayments } from '@castlery/modules-payment-domain';
import { PosUmsPermissionGuard, PermissionLoading, PermissionDeny } from '@castlery/shared-components';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { RetailContextGuard } from '../discover/retail-context-guard.client';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

export default function CheckoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();

  const page = useAppSelector(selectedPage);
  React.useEffect(() => {
    return () => {
      dispatch(clearPosOrderPayments());
    };
  }, [dispatch]);

  // Order V2 PosCheckoutButton sets `POS_CHECKOUT`; legacy PosCheckoutButtonV2 sets `checkout`.
  if (page !== 'POS_CHECKOUT' && page !== 'checkout') {
    return redirect(posRoutes.products);
  }

  return (
    <PosUmsPermissionGuard
      requirement={POS_UMS_PERMISSIONS.posPagesRead}
      loadingFallback={<PermissionLoading />}
      fallback={<PermissionDeny />}
    >
      <RetailContextGuard locale={params.locale}>
        <Box
          sx={{
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box role="heading">
            <PosSiteHeader />
          </Box>
          <Box role="main" sx={{ flex: 1, display: 'flex' }}>
            <Box
              sx={{
                flex: 5,
                m: mobile ? 1 : 2,
                width: 'inherit',
                // TODO 更优雅的计算方式
                height: 'calc(100vh - 62px)',
                overflow: 'auto',
                marginY: 0,
              }}
            >
              {children}
            </Box>

            <Box
              sx={{
                flex: { xs: 0, sm: 2.5, md: 2 },
                maxWidth: '435px',
                display: { xs: 'none', sm: 'flex' },
                // TODO 更优雅的计算方式
                height: 'calc(100vh - 62px - 16px)',
                marginRight: 2,
                flexDirection: 'column',
                overflow: 'auto',
              }}
            >
              {enableOrderV2 ? <PosCheckoutSection /> : <PosCart />}
            </Box>
          </Box>
        </Box>
      </RetailContextGuard>
    </PosUmsPermissionGuard>
  );
}
