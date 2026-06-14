'use client';
import { useMemo } from 'react';
import { basePageConfig, EcEnv } from '@castlery/config';
import { Box, Link, Stack, Typography, useBreakpoints, useNiceModal } from '@castlery/fortress';
import { ArrowBackIosNew } from '@castlery/fortress/Icons';
import { OrderDataV1 } from '@castlery/types';
import { useGetOrderDetailsV1Query } from '@castlery/modules-order-domain';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ContentLoading, CustomLink } from '@castlery/shared-components';
import { useSearchParams } from 'next/navigation';
import { WebOrderItemTableV1 } from '../web-order-line-items/web-order-line-items-v1';
import { WebOrderSummaryDisplayV1 } from '../web-order-summary-display/web-order-summary-display-V1';
import OrderBaseInfoV1 from './order-base-info-v1';
import { WebOrderInfoOverviewV1 } from '../web-order-info-overview/web-order-info-overview-v1';
import { WebOrderItemsMobileV1 } from '../web-order-line-items/web-order-items-mobile/web-order-items-mobile-v1';
import { WebOrderServiceItemsMobileV1 } from '../web-order-line-items/web-order-service-items-mobile/web-order-service-items-mobile-v1';
import { WebOrderHistoryCountDown } from '../web-order-history-count-down/web-order-history-count-down';
import { OrderHistoryAtcButton } from '../order-history-atc-button/order-history-atc-button';

export function WebOrderDetailsV1() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') as string;
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderDetailsPage',
  });
  const ordersHistoryUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig.orders}`;

  const { desktop, tablet, mobile } = useBreakpoints();
  const { data: order, isLoading, refetch } = useGetOrderDetailsV1Query({ id: orderId });
  const [modal, modalContextHolder] = useNiceModal();
  const currentOrder = order?.data as unknown as OrderDataV1;

  const isCanceled: boolean = useMemo(() => {
    if (!currentOrder) return false;
    if (currentOrder.status === 'CANCELED') {
      return true;
    }
    return false;
  }, [currentOrder]);
  const onlyHaveService: boolean = useMemo(() => {
    if (!currentOrder) return false;
    return !currentOrder.shipments || (Array.isArray(currentOrder.shipments) && currentOrder.shipments?.length === 0);
  }, [currentOrder]);

  const isPayProcessing: boolean = useMemo(() => {
    if (!currentOrder) return false;
    if (
      currentOrder.status === 'PENDING_PAYMENT' &&
      currentOrder.channel !== 'pos' &&
      !currentOrder.payments?.find((payment) => payment.paymentState === 'PAYMENT_STATUS_PROCESSING')
    ) {
      return true;
    }
    return false;
  }, [currentOrder]);

  return (
    <>
      {modalContextHolder}
      <Box
        sx={{
          boxSizing: 'border-box',
          minHeight: 500,
          ...(desktop ? { px: 15, py: 10 } : { py: 8 }),
        }}
      >
        <Stack
          sx={{
            ...(desktop ? { gap: 8 } : { gap: 4, px: tablet ? 6 : 4 }),
          }}
        >
          <Link
            level="body1"
            color="neutral"
            startDecorator={<ArrowBackIosNew sx={{ width: 16, height: 16 }} />}
            href={ordersHistoryUrl}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
            }}
            component={CustomLink}
          >
            {(t as any)('backButton')}
          </Link>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Typography level="h2">{(t as any)('title')}</Typography>
            {isCanceled && !onlyHaveService && (
              <OrderHistoryAtcButton order={currentOrder} modal={modal} isWebOrderDetailPage={true} />
            )}
            {isPayProcessing && currentOrder.channel !== 'pos' && (
              <WebOrderHistoryCountDown
                order={currentOrder}
                refreshContext="order-detail"
                onRefreshOrderDetail={refetch}
              />
            )}
          </Box>
        </Stack>
        {isLoading ? (
          <Box sx={{ px: desktop ? 15 : tablet ? 6 : 4, py: 20 }}>
            <ContentLoading loading={isLoading} />
          </Box>
        ) : order?.code !== 0 ? (
          <Box sx={{ px: desktop ? 8 : tablet ? 4 : 2, py: 8 }}>
            <Typography level="body2">{(t as any)('notFound')}</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              ...(desktop && {
                gap: 7,
                py: 4,
              }),
              ...(tablet && {
                gap: 7,
              }),
              ...(mobile && {
                gap: 4,
              }),
            }}
          >
            <OrderBaseInfoV1 order={currentOrder} />
            <Stack>
              <WebOrderInfoOverviewV1 order={currentOrder} hideViewDetails={true} modal={modal} />
              {desktop ? (
                <WebOrderItemTableV1 order={currentOrder} />
              ) : (
                <>
                  <WebOrderItemsMobileV1 order={currentOrder} />
                  <WebOrderServiceItemsMobileV1 addServiceList={currentOrder.addOnServiceLineItems || []} />
                </>
              )}
            </Stack>
            <WebOrderSummaryDisplayV1 order={currentOrder} />
          </Box>
        )}
      </Box>
    </>
  );
}

export default WebOrderDetailsV1;
