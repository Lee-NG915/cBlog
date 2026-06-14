'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, useBreakpoints, Button, Tooltip, ClickAwayListener, useNiceModal } from '@castlery/fortress';
import { getDate } from '@castlery/utils';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { CustomLink } from '@castlery/shared-components';
import { OrderDataV1 } from '@castlery/types';
import { Info, Close } from '@castlery/fortress/Icons';
import {
  useLazyGetCustomerOrderHistoryV1Query,
  useLazyGetOrderDetailsV1Query,
  orderHistoryPayClickedEvent,
} from '@castlery/modules-order-domain';
import { basePageConfig, EcEnv } from '@castlery/config';
import { useAppDispatch } from '@castlery/shared-redux-store';

interface WebOrderHistoryCountDownProps {
  order: OrderDataV1;
  refreshContext?: 'order-list' | 'order-detail';
  onRefreshOrderDetail?: () => void;
}

/** 与 order history 列表 Pay 按钮展示条件保持一致 */
export function canShowWebOrderHistoryPayButton(order: OrderDataV1): boolean {
  if (order.channel === 'pos') {
    return false;
  }
  if (order.status !== 'PENDING_PAYMENT') {
    return false;
  }
  const isPaymentProcessing =
    Array.isArray(order.payments) &&
    order.payments.some((payment) => payment.paymentState === 'PAYMENT_STATUS_PROCESSING');
  return !isPaymentProcessing;
}

export function WebOrderHistoryCountDown({
  order,
  refreshContext = 'order-list',
  onRefreshOrderDetail,
}: WebOrderHistoryCountDownProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [modal, modalContextHolder] = useNiceModal();
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderInfoOverview',
  });
  const translate = t as unknown as (key: string) => string;
  const payProcessingTooltipText = translate('payProcessingTooltip');
  const orderNoLongerAwaitingPaymentText = translate('orderNoLongerAwaitingPayment');
  const refreshStatusText = translate('refreshStatus');
  const { mobile } = useBreakpoints();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // 倒计时逻辑
  const [countdown, setCountdown] = useState<string>('');

  const paymentUrl = useMemo(
    () =>
      `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['checkout-payment']}?orderId=${order.id}`,
    [order.id]
  );

  // 使用 lazy query，在倒计时结束时手动触发请求
  const [triggerRefresh] = useLazyGetCustomerOrderHistoryV1Query();
  const [triggerGetOrderDetails] = useLazyGetOrderDetailsV1Query();

  const refreshPage = useCallback(() => {
    if (refreshContext === 'order-detail') {
      onRefreshOrderDetail?.();
      return;
    }
    if (order.currentPage) {
      triggerRefresh({
        page: order.currentPage,
        pageSize: 10,
        refreshPage: true,
      });
    }
  }, [refreshContext, onRefreshOrderDetail, order.currentPage, triggerRefresh]);

  const showOrderStatusChangedModal = useCallback(() => {
    modal.warning({
      desc: orderNoLongerAwaitingPaymentText,
      showCancelBtn: false,
      confirmText: refreshStatusText,
      beforeClose: () => refreshPage(),
    });
  }, [modal, orderNoLongerAwaitingPaymentText, refreshStatusText, refreshPage]);

  const proceedToPayment = useCallback(() => {
    dispatch(orderHistoryPayClickedEvent({ remainingTime: countdown || '00:00:00' }));
    router.push(paymentUrl);
  }, [dispatch, countdown, router, paymentUrl]);

  const handlePayClick = useCallback(
    async (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (refreshContext !== 'order-list') {
        dispatch(orderHistoryPayClickedEvent({ remainingTime: countdown || '00:00:00' }));
        return;
      }

      event.preventDefault();
      if (payLoading) {
        return;
      }

      setPayLoading(true);
      try {
        const result = await triggerGetOrderDetails({ id: String(order.id) }).unwrap();
        const latestOrder = result?.data as OrderDataV1 | undefined;

        if (latestOrder && canShowWebOrderHistoryPayButton(latestOrder)) {
          proceedToPayment();
        } else {
          showOrderStatusChangedModal();
        }
      } catch {
        proceedToPayment();
      } finally {
        setPayLoading(false);
      }
    },
    [
      refreshContext,
      payLoading,
      triggerGetOrderDetails,
      order.id,
      proceedToPayment,
      showOrderStatusChangedModal,
      dispatch,
      countdown,
    ]
  );

  useEffect(() => {
    // 如果没有过期时间或者支付未在处理中，则不显示倒计时
    if (!order.paymentExpiredAt) {
      setCountdown('');
      return;
    }

    // 计算倒计时的函数
    const calculateCountdown = () => {
      // 使用 getDate 将 UTC 时间转换为本地时区时间
      const now = getDate();
      const expiredAt = getDate(order.paymentExpiredAt);
      const diffInMs = expiredAt.getTime() - now.getTime();

      if (diffInMs <= 0) {
        setCountdown('00:00:00');

        // 倒计时结束，按当前页面场景刷新对应接口：
        // - order-list: 刷新订单列表当前页
        // - order-detail: 刷新当前订单详情
        if (!hasRefreshed) {
          setHasRefreshed(true);
          refreshPage();
        }
        return;
      }

      // 计算小时、分钟、秒
      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

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
  }, [order.paymentExpiredAt, hasRefreshed, refreshPage]);

  return (
    <>
      {modalContextHolder}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: mobile ? 2 : 4,
          flexDirection: mobile ? 'row-reverse' : 'row',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography level="body2">{countdown || '00:00:00'}</Typography>
          <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
            <Box>
              <Tooltip
                arrow
                theme="dark"
                placement="top"
                open={tooltipOpen}
                title={
                  <Box sx={{ display: 'flex', gap: 1, width: 220 }}>
                    <Typography level="body2">{payProcessingTooltipText}</Typography>
                    <Close onClick={() => setTooltipOpen(false)} sx={{ cursor: 'pointer' }} />
                  </Box>
                }
              >
                <Box
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setTooltipOpen(!tooltipOpen)}
                  onMouseEnter={() => setTooltipOpen(true)}
                >
                  <Info width={24} height={24} />
                </Box>
              </Tooltip>
            </Box>
          </ClickAwayListener>
        </Box>
        <Button
          size="sm"
          component={CustomLink}
          href={paymentUrl}
          loading={payLoading}
          sx={{
            px: 8,
          }}
          onClick={handlePayClick}
        >
          Pay
        </Button>
      </Box>
    </>
  );
}
