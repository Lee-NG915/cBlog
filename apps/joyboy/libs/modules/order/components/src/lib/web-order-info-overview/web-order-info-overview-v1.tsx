'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, Stack, Typography, Link, useBreakpoints } from '@castlery/fortress';
import { toPrice, formatDate } from '@castlery/utils';
import { EcEnv, basePageConfig } from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { CustomLink } from '@castlery/shared-components';
import { OrderDataV1 } from '@castlery/types';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useFirstInViewWithDelay } from '@castlery/modules-tracking-components';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { orderCanceledViewedEvent, orderPendingPaymentViewedEvent } from '@castlery/modules-order-domain';
import { WebOrderHistoryCountDown } from '../web-order-history-count-down/web-order-history-count-down';
import { OrderHistoryAtcButton } from '../order-history-atc-button/order-history-atc-button';

interface WebOrderInfoOverviewV1Props {
  hideViewDetails?: boolean;
  order: OrderDataV1;
  modal: any;
  isOrderListPage?: boolean;
}
export function WebOrderInfoOverviewV1({
  order,
  hideViewDetails = false,
  modal,
  isOrderListPage = false,
}: WebOrderInfoOverviewV1Props) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderInfoOverview',
  });
  const { desktop, mobile, tablet, md } = useBreakpoints();
  const detailsUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['order-details']}?id=${order.id}`;
  const orderPlaced = useMemo(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // 格式：18 Jan 2025, 4:21 PM
    return order.placedAt ? formatDate(order.placedAt, 'd MMM yyyy, h:mm a', timeZone) : '';
  }, [order.placedAt]);

  const isPayProcessing: boolean = useMemo(() => {
    if (!order) return false;
    if (
      Array.isArray(order?.payments) &&
      order.payments?.find((payment) => payment.paymentState === 'PAYMENT_STATUS_PROCESSING')
    ) {
      return true;
    }
    return false;
  }, [order]);
  const orderStatus: string = useMemo(() => {
    if (!order) return '';
    if (order.status === 'PENDING_PAYMENT' && isPayProcessing) {
      return `${order.displayStatus} - payment is being processed`;
    }
    return order.displayStatus ?? '';
  }, [order, isPayProcessing]);
  const isCanceled = order?.status === 'CANCELED';
  const isPendingPayment = order?.status === 'PENDING_PAYMENT' && !isPayProcessing;
  const onlyHaveService = !order?.shipments || (Array.isArray(order.shipments) && order.shipments?.length === 0);
  const haveExchangeOrderNumber = !!order?.exchangeOrderNumber;

  const dispatch = useAppDispatch();
  const displayStatus = order?.displayStatus ?? '';

  // List surface — first-time impression with ≥1s dwell, fires once per mount.
  const handleListImpression = useCallback(() => {
    dispatch(orderCanceledViewedEvent());
  }, [dispatch]);
  const listImpressionRef = useFirstInViewWithDelay(handleListImpression, 1000);
  const handlePendingPaymentListImpression = useCallback(() => {
    dispatch(orderPendingPaymentViewedEvent());
  }, [dispatch]);
  const pendingPaymentListImpressionRef = useFirstInViewWithDelay(handlePendingPaymentListImpression, 1000);

  // Web details surface — fire once on mount for eligible order-state impressions.
  // POS sales-order-details renders the same component but the
  // `accessInWeb` gate in `order-tracking.listener` silently drops it.
  const hasFiredDetailsRef = useRef(false);
  useEffect(() => {
    if (isOrderListPage || !isCanceled || hasFiredDetailsRef.current) return;
    hasFiredDetailsRef.current = true;
    dispatch(orderCanceledViewedEvent());
  }, [isOrderListPage, isCanceled, dispatch]);
  const hasFiredPendingPaymentDetailsRef = useRef(false);
  useEffect(() => {
    if (isOrderListPage || !isPendingPayment || hasFiredPendingPaymentDetailsRef.current) {
      return;
    }
    hasFiredPendingPaymentDetailsRef.current = true;
    dispatch(orderPendingPaymentViewedEvent());
  }, [isOrderListPage, isPendingPayment, dispatch]);
  const overviewImpressionRef =
    isOrderListPage && isCanceled
      ? listImpressionRef
      : isOrderListPage && isPendingPayment && displayStatus
      ? pendingPaymentListImpressionRef
      : undefined;

  return (
    <Box
      ref={overviewImpressionRef}
      sx={{
        ...(desktop
          ? {
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              px: 6,
              py: 3,
            }
          : {
              width: '100vw',
              py: 4,
              px: tablet ? 6 : 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }),
        background: (theme) => theme.palette.brand.warmLinen[500],
      }}
    >
      <Box
        sx={{
          ...(desktop
            ? { width: md ? '80%' : '65%', display: 'flex', justifyContent: 'space-between' }
            : {
                display: 'grid',
                gridTemplateColumns: 'repeat(2,1fr)',
                rowGap: 3,
                alignItems: 'center',
                justifyContent: 'space-between',
              }),
        }}
      >
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {(t as any)('orderNo')}
          </Typography>
          <Typography level="body2">{order.referenceNumber}</Typography>
        </Stack>
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {(t as any)('orderPlaced')}
          </Typography>
          <Typography level="body2">{orderPlaced}</Typography>
        </Stack>
        {isOrderListPage && (
          <Stack direction="column" gap={1}>
            <Typography
              level="subh3"
              sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
            >
              {(t as any)('total')}
            </Typography>
            <Typography level="body2">{toPrice(Number(order.summary.total ?? 0), true)}</Typography>
          </Stack>
        )}
        <Stack direction="column" gap={1}>
          <Typography
            level="subh3"
            sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
          >
            {(t as any)('orderStatus')}
          </Typography>
          <Typography level="body2">{orderStatus}</Typography>
        </Stack>
        {haveExchangeOrderNumber && (
          <Stack direction="column" gap={1}>
            <Typography
              level="subh3"
              sx={{ textTransform: 'uppercase', color: (theme) => theme.palette.brand.mono[700] }}
            >
              {(t as any)('exchangeOrderNumber')}
            </Typography>
            <Typography level="body2">{order.exchangeOrderNumber}</Typography>
          </Stack>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: mobile ? 2 : 4, justifyContent: 'space-between' }}>
        <Box>
          {isCanceled && isOrderListPage && !onlyHaveService && <OrderHistoryAtcButton order={order} modal={modal} />}
          {order.status === 'PENDING_PAYMENT' && !isPayProcessing && isOrderListPage && order.channel !== 'pos' && (
            <WebOrderHistoryCountDown order={order} />
          )}
        </Box>
        {!hideViewDetails && (
          <Link variant="primary" href={detailsUrl} level={mobile ? 'body2' : 'caption1'} component={CustomLink}>
            {(t as any)('viewOrderDetails')}
          </Link>
        )}
      </Box>
    </Box>
  );
}
