'use client';

import { Box, Stack, Typography, Link, useBreakpoints } from '@castlery/fortress';
import { ArrowRight } from '@castlery/fortress/Icons';
import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { basePageConfig, EcEnv } from '@castlery/config';
import { OrderShipmentV1 } from '@castlery/types';
import { formatDate } from '@castlery/utils';
import { useAppDispatch } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { orderTrackingLinkClickedEvent } from '@castlery/modules-order-domain';

interface OrderShipmentStateV1Props {
  shipment: OrderShipmentV1;
  orderNumber: string;
}

export function OrderShipmentStateV1({ shipment, orderNumber }: OrderShipmentStateV1Props) {
  const { desktop, mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'webOrderHistoryPage.shipmentStatus',
  });

  const { status, fulfillmentType } = shipment;

  // 判断 shipment 类型
  const isCashCarryShipment = fulfillmentType === 2;

  // 基于 status 判断状态
  const isPending = status === 'NEW';
  const isShipped = status === 'DISPATCHED';
  const isDelivered = status === 'DELIVERED';
  const isCanceled = status === 'CLOSED' || status === 'CANCELLED';

  // 配送日期：UTC 时间转换为本地时区格式
  const estimatedDeliveryStartDate = useMemo(() => {
    const dateStr = shipment.promisedDeliveryStartDate || shipment.preferredDeliveryStartDate || '';
    // 使用 formatDate 将 UTC 时间转换为本地时区格式 (e.g., "Nov 05, 2025")
    return dateStr ? formatDate(dateStr, 'MMM dd, yyyy') : '';
  }, [shipment]);

  const estimatedDeliveryEndDate = useMemo(() => {
    const dateStr = shipment.promisedDeliveryEndDate || shipment.preferredDeliveryEndDate || '';
    return dateStr ? formatDate(dateStr, 'MMM dd, yyyy') : '';
  }, [shipment]);
  // Review 按钮逻辑
  const showReviewCta = shipment.hasUnreviewedItems && (isDelivered || isCashCarryShipment);

  const shipmentIdentifier = shipment.number || shipment.trackingNumber?.[0] || '';
  const reviewLink = useMemo(() => {
    return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
      basePageConfig['submit-review']
    }?order=${orderNumber}&shipment=${shipmentIdentifier}`;
  }, [orderNumber, shipmentIdentifier]);

  const trackingLinks = shipment.trackingLink || [];

  // Cash & Carry shipment 展示 "Picked up at showroom"
  if (isCashCarryShipment) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: desktop ? 'center' : 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Typography level="body2">Picked up at showroom</Typography>
        </Box>
        {showReviewCta && (
          <Link
            variant="primary"
            level={mobile ? 'caption1' : 'body2'}
            sx={{ marginTop: 2 }}
            href={reviewLink}
            endDecorator={<ArrowRight />}
          >
            {(t as any)('reviewCta')}
          </Link>
        )}
      </>
    );
  }

  // 正常 delivery shipment
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: desktop ? 'center' : 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* NEW - Pending Fulfillment */}
        {isPending && (
          <Stack sx={{ gap: 2 }} direction="column">
            <Typography level="body2">Shipping Soon</Typography>
            <Typography
              level={mobile ? 'body2' : 'caption1'}
              sx={{
                color: (theme) => theme.palette.brand.mono[700],
                whiteSpace: 'pre-wrap',
                mobile: {
                  whiteSpace: 'normal',
                },
              }}
            >
              {(t as any)('pendingDesc', {
                estimatedDeliveryStartDate,
                estimatedDeliveryEndDate,
              })}
            </Typography>
          </Stack>
        )}

        {/* DISPATCHED - Shipping In Progress */}
        {isShipped && (
          <Stack sx={{ gap: 1 }} direction="column">
            <Typography level="body2">Shipping in Progress</Typography>
            {trackingLinks.length > 0 &&
              trackingLinks.map((trackingUrl, index) => (
                <Typography level={mobile ? 'body2' : 'caption1'} key={trackingUrl + index}>
                  <Link
                    variant="primary"
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener"
                    endDecorator={<ArrowRight />}
                    onClick={() => dispatch(orderTrackingLinkClickedEvent())}
                  >
                    {(t as any)('trackShipping', {
                      index: trackingLinks.length > 1 ? index + 1 : '',
                    })}
                  </Link>
                </Typography>
              ))}
          </Stack>
        )}

        {/* DELIVERED - Delivered */}
        {isDelivered && (
          <Stack>
            <Typography level="body2">Delivered</Typography>
          </Stack>
        )}

        {/* CLOSED / CANCELLED - Canceled */}
        {isCanceled && (
          <Stack>
            <Typography level="body2">{(t as any)('canceled')}</Typography>
          </Stack>
        )}
      </Box>

      {/* Review CTA */}
      {showReviewCta && (
        <Link
          variant="primary"
          level={mobile ? 'caption1' : 'body2'}
          sx={{ marginTop: 2 }}
          href={reviewLink}
          endDecorator={<ArrowRight />}
        >
          {(t as any)('reviewCta')}
        </Link>
      )}
    </>
  );
}

export default OrderShipmentStateV1;
