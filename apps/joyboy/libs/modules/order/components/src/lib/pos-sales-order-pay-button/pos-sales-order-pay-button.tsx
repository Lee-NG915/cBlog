'use client';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@castlery/fortress';
import { getDate } from '@castlery/utils';
import { OrderDataV1 } from '@castlery/types';
import { setSalesOrderTransactionOrderDetail } from '@castlery/modules-order-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { clearPosOrderPayments, useLazyGetPosOrderPaymentsQuery } from '@castlery/modules-payment-domain';

interface PosSalesOrderPayButtonProps {
  order: OrderDataV1;
  onOpenPaymentDrawer: () => void;
  onCountdownExpiredRefresh?: () => void;
}
export function PosSalesOrderPayButton({
  order,
  onOpenPaymentDrawer,
  onCountdownExpiredRefresh,
}: PosSalesOrderPayButtonProps) {
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [openPaymentDrawerLoading, setOpenPaymentDrawerLoading] = useState(false);
  const [getPosOrderPayments] = useLazyGetPosOrderPaymentsQuery();
  const dispatch = useAppDispatch();
  // 判断是否有正在处理的支付
  const isPendingPayment: boolean = useMemo(() => {
    if (!order) return false;
    return order.status === 'PENDING_PAYMENT';
  }, [order]);

  // 倒计时逻辑
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    // 如果没有过期时间或者支付未在处理中，则不显示倒计时
    if (!order || !order?.paymentExpiredAt || !isPendingPayment) {
      setCountdown('');
      return;
    }

    // 计算倒计时的函数
    const calculateCountdown = () => {
      // 使用 getDate 将 UTC 时间转换为本地时区时间
      const nowMs = getDate().getTime();
      const expiredAtMs = getDate(order.paymentExpiredAt).getTime();
      const effectiveDiffInMs = expiredAtMs - nowMs;

      if (effectiveDiffInMs <= 0) {
        setCountdown('00:00:00');

        // 倒计时结束，触发当前列表实例的 refetch，确保页面可见数据立即刷新。
        if (!hasRefreshed) {
          setHasRefreshed(true);
          onCountdownExpiredRefresh?.();
        }
        return;
      }

      // 计算小时、分钟、秒
      const hours = Math.floor(effectiveDiffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((effectiveDiffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((effectiveDiffInMs % (1000 * 60)) / 1000);

      // 格式化为 HH:MM:SS
      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
      ).padStart(2, '0')}`;
      setCountdown(formattedTime);
    };

    // 立即计算一次
    calculateCountdown();

    // 每秒更新一次
    const timer = setInterval(calculateCountdown, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [order, hasRefreshed, isPendingPayment, onCountdownExpiredRefresh]);

  const handlePayClick = async () => {
    setOpenPaymentDrawerLoading(true);
    try {
      dispatch(clearPosOrderPayments());
      dispatch(setSalesOrderTransactionOrderDetail(order));
      if (order?.id) {
        await getPosOrderPayments({ orderId: order.id }).unwrap();
      }
      onOpenPaymentDrawer();
    } finally {
      setOpenPaymentDrawerLoading(false);
    }
  };

  return <Button onClick={handlePayClick} loading={openPaymentDrawerLoading}>{`Pay (${countdown})`}</Button>;
}
