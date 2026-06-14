'use client';

import React, { useMemo } from 'react';
import { Box, Stack, Typography, Link, useNiceModal } from '@castlery/fortress';
import { OrderDataV1 } from '@castlery/types';
import { toPrice, formatDate } from '@castlery/utils';
import { PosSalesOrderPayButton } from '../../pos-sales-order-pay-button/pos-sales-order-pay-button';
import { posRoutes } from '@castlery/config';
import { OrderHistoryCancelOrderBtn } from '../../order-history-cancel-order-btn/order-history-cancel-order-btn';
import { OrderHistoryAtcButton } from '../../order-history-atc-button/order-history-atc-button';

const InfoBox = ({ label, value }: { label: string; value: string }) => {
  return (
    <Stack direction="column" gap={1}>
      <Typography
        level="body2"
        sx={{
          color: (theme) => theme.palette.brand.mono[600],
          fontSize: '12px',
        }}
      >
        {label}
      </Typography>
      <Typography level="body1">{value}</Typography>
    </Stack>
  );
};

export function PosSalesOrderListItem({
  order,
  onOpenPaymentDrawer,
  onCountdownExpiredRefresh,
}: {
  order: OrderDataV1;
  onOpenPaymentDrawer: () => void;
  onCountdownExpiredRefresh?: () => void;
}) {
  const [modal, contextHolder] = useNiceModal();
  // 格式化日期时间
  const orderDate = React.useMemo(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return order.placedAt ? formatDate(order.placedAt, 'dd/MM/yyyy h:mma', timeZone) : '';
  }, [order.placedAt]);

  // 获取客户名称（从账单地址）
  const customerName = React.useMemo(() => {
    const { billAddress } = order;
    if (billAddress?.firstname || billAddress?.lastname) {
      return `${billAddress.firstname || ''} ${billAddress.lastname || ''}`.trim();
    }
    return 'Guest';
  }, [order]);

  // 格式化金额
  const totalAmount = React.useMemo(() => {
    return String(toPrice(Number(order.summary?.total ?? 0), true));
  }, [order.summary?.total]);

  const isCanceled: boolean = useMemo(() => {
    if (!order) return false;
    if (order.status === 'CANCELED') {
      return true;
    }
    return false;
  }, [order]);

  const onlyHaveService: boolean = useMemo(() => {
    if (!order) return false;
    return !order.shipments || (Array.isArray(order.shipments) && order.shipments?.length === 0);
  }, [order]);

  const isPendingPayment: boolean = useMemo(() => {
    if (!order) return false;
    if (order.status === 'PENDING_PAYMENT') {
      return true;
    }
    return false;
  }, [order]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'start',
        gap: 4,
      }}
    >
      {contextHolder}
      {/* 左侧列 */}
      <Stack direction="column" gap={4}>
        <InfoBox label="Customer" value={customerName} />
        <InfoBox label="Order Placed" value={orderDate} />
        <InfoBox label="Order Status" value={order.displayStatus || order.status || ''} />
      </Stack>

      {/* 右侧列 */}
      <Stack direction="column" gap={4}>
        <InfoBox label="Order No." value={String(order.referenceNumber || order.number)} />
        <InfoBox label="Total" value={totalAmount} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
          }}
        >
          <Link
            variant="primary"
            level="body2"
            href={`${posRoutes.saleHistory}/order-detail?orderId=${String(order.id)}`}
          >
            Details
          </Link>
        </Box>
      </Stack>

      {/* Details 按钮 */}
      {isPendingPayment && (
        <Stack direction="row" gap={4}>
          <PosSalesOrderPayButton
            order={order}
            onOpenPaymentDrawer={onOpenPaymentDrawer}
            onCountdownExpiredRefresh={onCountdownExpiredRefresh}
          />
          <OrderHistoryCancelOrderBtn order={order} />
        </Stack>
      )}

      {isCanceled && !onlyHaveService && <OrderHistoryAtcButton order={order} modal={modal} />}
    </Box>
  );
}
