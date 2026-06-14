'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAsyncFn } from 'react-use';
import { Button, useNiceModal, Box, Typography, Modal, ModalDialog, Stack, useBreakpoints } from '@castlery/fortress';
import { PaymentTerms, AddPaymentsV1Drawer } from '@castlery/modules-checkout-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import {
  selectCheckoutRoot,
  selectPosCheckoutAddressCompleted,
  selectPaymentDisabled,
  selectIsZeroOrder,
  selectPosCheckoutExchangeOrderChecked,
  selectPosCheckoutExchangeOrderNumber,
  selectPosCheckoutOrderComment,
  setPosCheckoutSubmitAttempted,
  selectPosCheckoutTradePartnerId,
  useGenerateQuotationMutation,
} from '@castlery/modules-checkout-domain';
import { createPosTransactionOrderCommand } from '@castlery/modules-checkout-services';
import {
  useCancelOrderV1Mutation,
  selectPosOrderId,
  selectPosOrderNumber,
  createTransactionOrder,
  selectPosOrderReferenceNumber,
} from '@castlery/modules-order-domain';
import { posRoutes } from '@castlery/config';
import { getDate, toPrice } from '@castlery/utils';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@castlery/fortress/Icons';
import { getCartData, updateReloadCartLoading } from '@castlery/modules-cart-domain';

export function PosPayButton() {
  const { mobile } = useBreakpoints();
  const router = useRouter();
  const hasExpiredRedirectedRef = useRef(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [modal, contextHolder] = useNiceModal();
  const dispatch = useAppDispatch();
  const paymentDisabled = useAppSelector(selectPaymentDisabled);
  const isZeroOrder = useAppSelector(selectIsZeroOrder);
  const posCheckoutAddressCompleted = useAppSelector(selectPosCheckoutAddressCompleted);
  const posOrderId = useAppSelector(selectPosOrderId);
  const posOrderNumber = useAppSelector(selectPosOrderNumber);
  const posOrderReferenceNumber = useAppSelector(selectPosOrderReferenceNumber);
  const exchangeOrderChecked = useAppSelector(selectPosCheckoutExchangeOrderChecked);
  const exchangeOrderNumber = useAppSelector(selectPosCheckoutExchangeOrderNumber);
  const orderComment = useAppSelector(selectPosCheckoutOrderComment);
  const tradePartnerId = useAppSelector(selectPosCheckoutTradePartnerId);
  const checkoutRoot = useAppSelector(selectCheckoutRoot);
  const paymentExpiredAt = checkoutRoot?.paymentExpiredAt;
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [countdown, setCountdown] = useState<string>('');
  const [completeQuotationModalOpen, setCompleteQuotationModalOpen] = useState(false);
  const [zeroOrderSuccessModalOpen, setZeroOrderSuccessModalOpen] = useState(false);
  const [completedZeroOrderNumber, setCompletedZeroOrderNumber] = useState('');
  const [quotationData, setQuotationData] = useState<any>(null);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderV1Mutation();
  const [timeLoading, setTimeLoading] = useState(false);
  const [generateQuotation, { isLoading: isGeneratingQuotation }] = useGenerateQuotationMutation();
  const reloadCartData = async () => {
    dispatch(updateReloadCartLoading(true));
    await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
    dispatch(updateReloadCartLoading(false));
  };

  useEffect(() => {
    // 如果没有过期时间或者支付未在处理中，则不显示倒计时
    if (!paymentExpiredAt) {
      setCountdown('');
      hasExpiredRedirectedRef.current = false;
      return;
    }

    // 计算倒计时的函数
    const calculateCountdown = () => {
      // 使用 getDate 将 UTC 时间转换为本地时区时间
      const now = getDate();
      const expiredAt = getDate(paymentExpiredAt);
      const diffInMs = expiredAt.getTime() - now.getTime();

      if (diffInMs <= 0) {
        setCountdown('00:00:00');

        // 倒计时结束仅触发一次跳转+刷新，避免每秒重复触发。
        if (!hasExpiredRedirectedRef.current) {
          hasExpiredRedirectedRef.current = true;
          router.replace(posRoutes.products);
          reloadCartData();
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
  }, [paymentExpiredAt, router]);

  const handleGenerateQuotation = async () => {
    modal.success({
      title: 'Generate quotation confirmation',
      desc: 'This order quotation will be generate upon confirmation.',
      confirmText: 'Confirm',
      onConfirm: async () => {
        try {
          const res = await generateQuotation().unwrap();
          setQuotationData(res);
          setCompleteQuotationModalOpen(true);
        } catch (error) {
          setCompleteQuotationModalOpen(false);
        }
      },
    });
  };

  const handleCancelOrder = async () => {
    if (!posOrderId) return;
    try {
      setTimeLoading(true);
      await cancelOrder({ id: posOrderId }).unwrap();
      router.replace(posRoutes.products);
      reloadCartData();
    } finally {
      setTimeLoading(false);
    }
  };

  const [{ loading }, createNewOrder] = useAsyncFn(async () => {
    dispatch(setPosCheckoutSubmitAttempted(true));
    if (exchangeOrderChecked && !exchangeOrderNumber.trim()) {
      return false;
    }

    // 0 元单模式：
    // 1) 未生成订单时：直接调用 createTransactionOrder，成功后展示 success modal；
    // 2) 已有订单时：说明该 0 元单已创建，直接展示 success modal（不弹 payment drawer）。
    if (isZeroOrder) {
      if (posOrderId) {
        setCompletedZeroOrderNumber(posOrderReferenceNumber || '');
        setZeroOrderSuccessModalOpen(true);
        return true;
      }

      const createRes = await dispatch(
        createTransactionOrder.initiate({
          exchangeOrderNumber,
          orderComment,
          tradePartnerId,
        })
      );
      if ('error' in createRes) {
        return false;
      }

      setCompletedZeroOrderNumber(createRes.data?.referenceNumber || '');
      setZeroOrderSuccessModalOpen(true);
      return true;
    }

    // 如果已有订单，直接打开 payment drawer
    if (posOrderId) {
      setPaymentDrawerOpen(true);
      return true;
    }

    // 创建新订单
    const res = await dispatch(createPosTransactionOrderCommand());

    // 检查是否创建失败（rejected 或返回 false）
    if (createPosTransactionOrderCommand.rejected.match(res) || res.payload === false) {
      // 创建订单失败，不打开 payment drawer
      // modal.warning({
      //   title: 'Oops!',
      //   subDesc: 'Failed to create order',
      //   showCancelBtn: false,
      //   confirmText: 'Got it',
      //   dialogSx: {
      //     maxWidth: 360,
      //   },
      // });
      return false;
    }

    // 创建成功，打开 payment drawer
    setPaymentDrawerOpen(true);
    return true;
  }, [
    dispatch,
    exchangeOrderChecked,
    exchangeOrderNumber,
    isZeroOrder,
    modal,
    orderComment,
    posOrderId,
    posOrderNumber,
    tradePartnerId,
  ]);

  const buttonText = useMemo(() => {
    if (isZeroOrder) {
      return 'Place order';
    }
    return paymentExpiredAt ? `make payment (${countdown})` : 'Confirm & Pay';
  }, [countdown, isZeroOrder, paymentExpiredAt]);

  const [nextOrderloadingState, nextOrder] = useAsyncFn(async () => {
    return new Promise((resolve) => {
      router.replace(posRoutes.products);
      window.location.reload();
      setTimeout(resolve, 2000);
    });
  }, [router]);

  return (
    <React.Fragment>
      {contextHolder}

      {posOrderId ? (
        <Button
          variant="outlined"
          color="neutral"
          loading={isCancelling || timeLoading}
          onClick={() => {
            handleCancelOrder();
          }}
        >
          Cancel Order
        </Button>
      ) : (
        <>
          <Button
            variant="plain"
            color="warning"
            loading={isGeneratingQuotation}
            onClick={() => {
              handleGenerateQuotation();
            }}
          >
            generate quotation
          </Button>

          <Typography level="caption2" sx={{ m: 4 }}>
            {' '}
            <span style={{ color: '#A45B37' }}>Reminder:</span> Once you confirm and pay, the applied discounts/prices
            will be reserved, and all the actions can affect the order price/delivery will{' '}
            <span style={{ color: '#A45B37' }}>no longer be editable.</span>
          </Typography>
        </>
      )}
      <Button
        fullWidth
        disabled={!posOrderId && (paymentDisabled || !posCheckoutAddressCompleted || !agreeTerms)}
        loading={loading}
        onClick={() => createNewOrder()}
      >
        {buttonText}
      </Button>

      <PaymentTerms checked={agreeTerms} onChange={(checked) => setAgreeTerms(checked)} />

      <AddPaymentsV1Drawer
        open={paymentDrawerOpen}
        onCloseDrawer={() => setPaymentDrawerOpen(false)}
        afterAddPayMethod={() => setPaymentDrawerOpen(false)}
        title="Payment"
      />

      <Modal open={zeroOrderSuccessModalOpen} onClose={() => undefined} hideBackdrop>
        <ModalDialog
          sx={{
            width: '100vw',
            ...(mobile
              ? {
                  height: '100vh',
                }
              : {
                  height: 'calc(100vh - 62px)',
                  top: 'calc(50% + 31px)',
                }),
          }}
        >
          <Stack spacing={3} justifyContent="center" alignItems="center" flexDirection="column" sx={{ mt: 9 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle width={42} height={42} />
              <Typography level="h3">Order Completed</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography level="subh2">Order Number:</Typography>
              <Typography level="subh2">{completedZeroOrderNumber}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography level="caption1">Total Paid:</Typography>
              <Typography level="h5" sx={{ fontWeight: 700 }}>
                {toPrice(0, false)}
              </Typography>
            </Box>
            <Button
              variant="solid"
              color="primary"
              loading={nextOrderloadingState?.loading}
              onClick={nextOrder}
              sx={{ mt: 6, width: 300 }}
            >
              Next Order
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      <Modal open={completeQuotationModalOpen} onClose={() => undefined} hideBackdrop>
        <ModalDialog
          sx={{
            width: '100vw',
            ...(mobile
              ? {
                  height: '100vh',
                }
              : {
                  height: 'calc(100vh - 62px)',
                  top: 'calc(50% + 31px)',
                }),
          }}
        >
          <Stack spacing={3} justifyContent="center" alignItems="center" flexDirection="column" sx={{ mt: 9 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle width={42} height={42} />
              <Typography level="h3">Quotation has been send to customer</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography level="caption1">Quotation Date</Typography>
              <Typography level="h5" sx={{ fontWeight: 700 }}>
                {quotationData?.quotationDate}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography level="caption1">Quotation Expiry Date</Typography>
              <Typography level="h5" sx={{ fontWeight: 700 }}>
                {quotationData?.quotationExpiryDate}
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              variant="solid"
              color="primary"
              loading={nextOrderloadingState?.loading}
              onClick={nextOrder}
              sx={{ mt: 6, width: 139 }}
            >
              Next Order
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}

export default PosPayButton;
