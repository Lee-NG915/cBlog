'use client';
import React from 'react';
import { Box, useBreakpoints } from '@castlery/fortress';
import { ProductSearch } from '@castlery/modules-product-components';
import { useAppDispatch } from '@castlery/shared-redux-store';
// import Script from 'next/script';
import { enterApp } from '@castlery/modules-user-domain';
import { PosCart, PosSiteHeader, PosCartSection } from '@castlery/modules-composite-components';
import { sharedFeatureService } from '@castlery/shared-services';
import { PosUmsPermissionGuard, PermissionLoading, PermissionDeny } from '@castlery/shared-components';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { RetailContextGuard } from '../../discover/retail-context-guard.client';

const enableOrderV2 = sharedFeatureService.enabledOrderV2;
export default function DiscoverLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const dispatch = useAppDispatch();
  // const [generatePosQuery] = useLazyGeneratePosQuery();
  const { mobile } = useBreakpoints();
  React.useEffect(() => {
    dispatch(
      enterApp({
        page: 'PRODUCT',
      })
    );
  }, [dispatch]);
  // const onFetchConnectionToken = () => {
  //   return generatePosQuery().then((res) => {
  //     if (res?.data?.secret) {
  //       return res.data.secret;
  //     } else {
  //       // 如果没有得到预期的令牌 应该抛出错误
  //       throw new Error('Connection token fetch failed');
  //     }
  //   });
  // };
  // const onUnexpectedReaderDisconnect = () => {
  //   dispatch(clearReader());
  //   console.log('====> onUnexpectedReaderDisconnect: should have a modal');
  // };
  // const onConnectionStatusChange = ({ status }: { status: string }) => {
  //   if (status === 'not_connected') {
  //     dispatch(clearReader());
  //   }
  //   dispatch(updateConnectionStatus(status));
  // };
  // const onPaymentStatusChange = ({ status }: { status: string }) => {
  //   if (status === 'not_connected') {
  //     dispatch(clearReader());
  //   }
  //   dispatch(updatePaymentStatus(status));
  // };
  return (
    <>
      {/* <Script
        src="https://js.stripe.com/terminal/v1/"
        onReady={() => {
          window.terminal = window.StripeTerminal.create({
            onFetchConnectionToken: onFetchConnectionToken,
            onUnexpectedReaderDisconnect: onUnexpectedReaderDisconnect,
            onConnectionStatusChange: onConnectionStatusChange,
            onPaymentStatusChange: onPaymentStatusChange,
          });
        }}
        onError={(error) => {
          console.log('stripe terminal error', error);
        }}
      /> */}
      <PosUmsPermissionGuard
        requirement={POS_UMS_PERMISSIONS.posPagesRead}
        loadingFallback={<PermissionLoading />}
        fallback={<PermissionDeny />}
      >
        <RetailContextGuard locale={params.locale}>
          <Box
            sx={{
              // height: '500px'
              // minHeight: '100vh',
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
                // height: 'calc(100vh - 62px - 16px)',
                flex: 1,
                display: 'flex',
              }}
            >
              <Box
                sx={{
                  flex: 5,
                  m: mobile ? 1 : 2,
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
                    // TODO 更优雅的计算方式
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
                  maxWidth: '435px',
                  display: { xs: 'none', md: 'flex' },
                  // TODO 更优雅的计算方式
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
        </RetailContextGuard>
      </PosUmsPermissionGuard>
    </>
  );
}
