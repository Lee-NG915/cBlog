import React from 'react';
import { Box } from '@castlery/fortress';
import { ProductSearch } from '@castlery/modules-product-components';
import { PosCart, PosCartSection, PosSiteHeader } from '@castlery/modules-composite-components';
import { sharedFeatureService } from '@castlery/shared-services';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { PermissionDeny, PermissionLoading, PosUmsPermissionGuard } from '@castlery/shared-components';
import { RetailContextGuard } from '../../discover/retail-context-guard.client';
import { ProductsListingLayoutClient } from './layout.client';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;

export default function ProductsListingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  return (
    <PosUmsPermissionGuard
      requirement={POS_UMS_PERMISSIONS.posPagesRead}
      loadingFallback={<PermissionLoading />}
      fallback={<PermissionDeny />}
    >
      <RetailContextGuard locale={params.locale}>
        <>
          <ProductsListingLayoutClient />
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
            <Box
              role="main"
              sx={{
                flex: 1,
                display: 'flex',
              }}
            >
              <Box
                m={{
                  xs: 1,
                  md: 2,
                }}
                sx={{
                  flex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: 2,
                  gap: 1,
                }}
              >
                <ProductSearch />
                <Box
                  sx={{
                    width: 'inherit',
                    height: 'calc(100vh - 62px - 32px - 44px - 10px)',
                    overflow: 'auto',
                    position: 'relative',
                  }}
                >
                  {children}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: { sm: 0, md: 2 },
                  minWidth: 360,
                  maxWidth: 435,
                  display: { xs: 'none', md: 'flex' },
                  height: 'calc(100vh - 62px - 14px)',
                  marginRight: 2,
                  flexDirection: 'column',
                  backgroundColor: 'var(--fortress-palette-brand-warmLinen-500)',
                  px: 4,
                  pb: 4,
                }}
              >
                {enableOrderV2 ? <PosCartSection /> : <PosCart />}
              </Box>
            </Box>
          </Box>
        </>
      </RetailContextGuard>
    </PosUmsPermissionGuard>
  );
}
