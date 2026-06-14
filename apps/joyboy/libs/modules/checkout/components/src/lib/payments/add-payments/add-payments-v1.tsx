'use client';
import { logger } from '@castlery/observability';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  Box,
  Typography,
  Button,
  Stack,
  Drawer,
  useBreakpoints,
  ModalClose,
  DialogContent,
  Divider,
  IconButton,
  Modal,
  ModalDialog,
} from '@castlery/fortress';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Close, CheckCircle } from '@castlery/fortress/Icons';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import {
  selectPosPaymentMethodsSettings,
  useGetPosPaymentMethodConfigsQuery,
  selectPosOrderPaymentsInfo,
  selectPosOrderPaymentsLoading,
  resendStripePaymentLink,
} from '@castlery/modules-payment-domain';
import {
  selectPosOrderNumber,
  selectPosOrderId,
  selectTransactionOrderDetail,
  selectPosOrderReferenceNumber,
} from '@castlery/modules-order-domain';
import { selectCheckoutSummary } from '@castlery/modules-checkout-domain';
import { toPrice } from '@castlery/utils';
import { posRoutes } from '@castlery/config';
import { useAsyncFn } from 'react-use';
import { brandIconsMaps } from '../pos-payment/card-brand-svg';
import { PaymentMethodGroup } from '../../pos-payment-method-group/pos-payment-method-group';
import type { OrderPaymentV1 } from '@castlery/types';
import {
  deletePosPaymentCommand,
  addPosPaymentCommand,
  confirmPosPaymentCommand,
} from '@castlery/modules-payment-services';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { LoadingMasker } from '@castlery/shared-components';
import { clearPosCartCommand } from '@castlery/modules-cart-services';
import { v4 as uuidV4 } from 'uuid';

/** 与 PosSiteHeader 高度一致，用于成功弹窗避让与整屏居中计算 */
const POS_SITE_HEADER_HEIGHT = 62;
const POS_SITE_HEADER_HALF_HEIGHT = POS_SITE_HEADER_HEIGHT / 2;

// ==================== AddPaymentsV1Drawer 组件 ====================
export interface AddPaymentsV1Props {
  afterAddPayMethod: () => void;
  title?: string;
  open: boolean;
  onCloseDrawer: () => void;
}

export function AddPaymentsV1Drawer({ afterAddPayMethod, title = 'Payment', open, onCloseDrawer }: AddPaymentsV1Props) {
  const { mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const router = useRouter();
  // 判断当前路由是否处于 checkout page
  const isCheckoutPage = useMemo(() => {
    return window.location.pathname.includes(posRoutes.checkout);
  }, [window.location.pathname]);
  const transactionOrderDetail = useAppSelector(selectTransactionOrderDetail);

  const posOrderNumberFromCreateOrderReferenceInfoState = useAppSelector(selectPosOrderNumber);
  const posOrderReferenceNumberFromCreateOrderReferenceInfoState = useAppSelector(selectPosOrderReferenceNumber);
  const posOrderIdFromCreateOrderReferenceInfoState = useAppSelector(selectPosOrderId);

  const posOrderNumber = useMemo(() => {
    return isCheckoutPage ? posOrderNumberFromCreateOrderReferenceInfoState : transactionOrderDetail?.number;
  }, [isCheckoutPage, posOrderNumberFromCreateOrderReferenceInfoState, transactionOrderDetail]);

  const posOrderReferenceNumber = useMemo(() => {
    return isCheckoutPage
      ? posOrderReferenceNumberFromCreateOrderReferenceInfoState
      : transactionOrderDetail?.referenceNumber;
  }, [isCheckoutPage, posOrderReferenceNumberFromCreateOrderReferenceInfoState, transactionOrderDetail]);

  const posOrderId = isCheckoutPage ? posOrderIdFromCreateOrderReferenceInfoState : transactionOrderDetail?.id;
  const checkoutSummary = useAppSelector(selectCheckoutSummary);

  const orderSummary = isCheckoutPage ? checkoutSummary : transactionOrderDetail?.summary;

  const posOrderPaymentsLoading = useAppSelector(selectPosOrderPaymentsLoading);
  const [posCompletePaymentLoading, setPosCompletePaymentLoading] = useState(false);
  // 获取已添加的支付记录
  const posOrderPaymentsInfo = useAppSelector(selectPosOrderPaymentsInfo);
  // 获取支付方式配置
  const posPaymentConfigs = useAppSelector(selectPosPaymentMethodsSettings);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState('');
  const [completedOrderText, setCompletedOrderText] = useState('Order Complete');
  const [completedOrderAmount, setCompletedOrderAmount] = useState(0);

  // 检查是否需要获取支付方式配置
  const providerConfigs = useMemo(() => {
    return Array.isArray(posPaymentConfigs?.configs) ? posPaymentConfigs.configs : [];
  }, [posPaymentConfigs]);

  // 状态管理：start（初始）-> adding（添加支付方式）-> list（显示支付列表）
  const [status, setStatus] = useState<'adding' | 'list'>('list');
  const [activeRemoveId, setActiveRemoveId] = useState<string | null>(null);

  // 检查是否有支付记录
  const hasPayments = useMemo(() => {
    return posOrderPaymentsInfo.length > 0;
  }, [posOrderPaymentsInfo]);

  const hasSplPayment = useMemo(() => {
    const hasSplInPosPayments = posOrderPaymentsInfo.some(
      (payment) => payment.provider === 'stripe-payment-link' && !payment.isVoided
    );
    // 仅 Sales History 场景使用订单详情内嵌 payments，避免 checkout 残留 transactionOrderDetail 误判为 SPL 重发
    const hasSplInOrderPayments =
      !isCheckoutPage &&
      transactionOrderDetail?.payments?.some(
        (payment) => payment.provider === 'stripe-payment-link' && !payment.isVoided
      );
    return Boolean(hasSplInPosPayments || hasSplInOrderPayments);
  }, [isCheckoutPage, posOrderPaymentsInfo, transactionOrderDetail?.payments]);

  const hasNonSplPayment = useMemo(() => {
    return posOrderPaymentsInfo.some((payment) => payment.provider !== 'stripe-payment-link');
  }, [posOrderPaymentsInfo]);

  // 计算订单总金额
  const orderTotal = useMemo(() => {
    const summaryTotal = orderSummary?.total || 0;
    return Number(summaryTotal);
  }, [orderSummary]);

  // 计算已支付金额（仅统计已成功入账且未作废的支付）
  // SPL 重发场景会存在 PAYMENT_STATUS_PENDING 的历史记录，不能计入 paidAmount。
  const paidAmount = useMemo(() => {
    return posOrderPaymentsInfo.reduce((acc, payment) => {
      if (payment.isVoided) return acc;
      if (payment.paymentState !== 'PAYMENT_STATUS_PAID') return acc;
      return acc + Number(payment.amount || 0);
    }, 0);
  }, [posOrderPaymentsInfo]);

  // 计算剩余可支付金额
  const remainingAmount = useMemo(() => {
    return Math.max(0, orderTotal - paidAmount);
  }, [orderTotal, paidAmount]);

  // SPL 重发场景：待支付金额与输入框均展示订单全额
  const amountPayable = useMemo(() => {
    return hasSplPayment ? orderTotal : remainingAmount;
  }, [hasSplPayment, orderTotal, remainingAmount]);

  const addPaymentOriginAmount = amountPayable;

  const shouldFetchPosConfigs = open && providerConfigs.length === 0;

  // 获取支付方式配置
  useGetPosPaymentMethodConfigsQuery(undefined, {
    skip: !shouldFetchPosConfigs,
    refetchOnMountOrArgChange: false,
  });

  // 检查支付是否已完成（已支付金额 = 订单总额）
  const isPaymentComplete = useMemo(() => {
    return paidAmount >= orderTotal && orderTotal > 0;
  }, [paidAmount, orderTotal]);

  // CONFIRM PAYMENT - 完成支付流程
  const handleConfirmPayment = async (provider?: string) => {
    try {
      setPosCompletePaymentLoading(true);
      if (provider === 'stripe-payment-link') {
        setCompletedOrderText('Payment Link Sent');
      } else {
        setCompletedOrderText('Order Complete');
      }
      if (!hasSplPayment) {
        // 不存在 SPL 支付方式，则直接确认支付
        const compeleteRes = await dispatch(
          confirmPosPaymentCommand({
            orderId: posOrderId || '',
            isStripeLink: provider === 'stripe-payment-link',
            hasSplPayment,
          })
        );
        if ('error' in compeleteRes) {
          return;
        }
      } else {
        // 存在 SPL 支付方式，则重复发送邮件接口
        const resendStripePaymentLinkRes = await dispatch(
          resendStripePaymentLink.initiate({
            orderId: posOrderId || '',
            paymentId: posOrderPaymentsInfo[0].paymentId || '',
          })
        );
        if ('error' in resendStripePaymentLinkRes) {
          logger.error('Resend stripe payment link failed', { error: resendStripePaymentLinkRes.error as Error });
          return;
        }
      }
      // 快照订单号，避免 afterAddPayMethod 清空 store 后弹窗显示为空
      setCompletedOrderNumber(posOrderReferenceNumber || '');
      if (provider === 'stripe-payment-link') {
        setCompletedOrderAmount(orderTotal);
      }
      // if (posOrderIdFromCreateOrderReferenceInfoState) {
      // 如果存在则说明是在 checkout page 中创建订单时返回了订单ID，则直接打开成功模态框
      // 否则说明是在 sales order page 中支付的
      setSuccessModalOpen(true);
      afterAddPayMethod();
    } catch (error) {
      logger.error('----error', { error: error as Error });
    } finally {
      setPosCompletePaymentLoading(false);
    }
  };

  const [{ loading: removeMethodLoading }, removePaymentMethod] = useAsyncFn(
    async (paymentId: string) => {
      if (!posOrderId) return false;
      setActiveRemoveId(paymentId);
      await dispatch(deletePosPaymentCommand({ orderId: posOrderId, paymentId }));
      setActiveRemoveId(null);
    },
    [dispatch, posOrderId]
  );

  const [{ loading: addMethodLoading }, addPaymentMethod] = useAsyncFn(
    async (addPayMethodPayload: any): Promise<{ success: boolean; error?: any }> => {
      if (!posOrderNumber || !posOrderId) {
        return { success: false, error: 'Missing order information' };
      }
      const addRes = await dispatch(
        addPosPaymentCommand({
          orderId: posOrderId,
          orderNumber: posOrderNumber,
          idempotencyKey: uuidV4(),
          ...addPayMethodPayload,
        })
      );

      // 检查 thunk 是否返回了 rejected action
      if (addPosPaymentCommand.rejected.match(addRes)) {
        logger.error('Add payment method failed', { error: addRes.payload || addRes.error });
        return { success: false, error: addRes.payload || addRes.error };
      }

      return { success: true };
    },
    [dispatch, posOrderNumber, posOrderId]
  );

  const handleAddPayment = useCallback(
    async (addPayMethodPayload: any) => {
      if (addPayMethodPayload.provider === 'stripe-terminal') {
        setStatus('list'); // 返回列表视图
        return;
      }
      try {
        if (hasSplPayment) {
          handleConfirmPayment('stripe-payment-link');
          return;
        }

        const result = await addPaymentMethod(addPayMethodPayload);
        // 如果添加支付方式失败，不进行后续操作，保持在当前页面
        if (!result.success) {
          logger.warn('Payment method addition failed, staying on current page', { error: result.error });
          // 这里可以添加用户提示（如 toast），目前先保持在 adding 状态让用户重试
          return;
        }

        // 添加成功后的处理
        if (addPayMethodPayload.provider === 'stripe-payment-link') {
          handleConfirmPayment('stripe-payment-link');
        } else {
          setStatus('list'); // 返回列表视图
        }
      } catch (error) {
        logger.error('handleAddPayment unexpected error', { error: error as Error });
        // 发生异常时也保持在当前页面，不跳转
      }
    },
    [addPaymentMethod, handleConfirmPayment, hasSplPayment]
  );

  // 获取卡品牌图标
  const getCardBrandIcon = (brand: string | undefined | null): React.ReactNode => {
    if (!brand) return null;
    return brandIconsMaps.has(brand) ? (brandIconsMaps.get(brand) as React.ReactNode) : null;
  };

  // START PAYMENT 按钮点击
  const handleStartPayment = () => {
    setStatus('adding');
  };

  // 返回支付列表
  const handleBackToList = () => {
    setStatus('list');
  };

  const [loadingState, createNewOrder] = useAsyncFn(async () => {
    await dispatch(clearPosCartCommand());
    return new Promise((resolve) => {
      router.replace(posRoutes.products);
      window.location.reload();
      setTimeout(resolve, 2000);
    });
  }, [router]);

  // 关闭 drawer 时重置状态
  const handleClose = () => {
    onCloseDrawer();
    setStatus('list');
  };

  // 当支付记录变化时，更新状态
  useEffect(() => {
    if (open) {
      setStatus(hasSplPayment ? 'adding' : 'list');
    }
  }, [open, hasSplPayment]);

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={title}
      sx={
        {
          // '& .MuiDrawer-content': {
          //   width: '558px',
          // },
        }
      }
    >
      <ModalClose onClick={handleClose} />
      <DialogContent sx={{ px: 6, py: 4 }}>
        <LoadingMasker loading={posOrderPaymentsLoading} />
        {/* 头部信息 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography level="h5">Payment Type</Typography>
          <Stack direction="row" spacing={3} alignItems="center">
            <Typography level="body2">
              Total Sale: <b>{toPrice(orderTotal, false)}</b>
            </Typography>
            <Typography level="body2">
              Amount Payable: <b>{toPrice(amountPayable, false)}</b>
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 4 }} />

        {/* START PAYMENT 状态 */}
        {/* {status === 'start' && (
          <Stack spacing={2}>
            <Button variant="outlined" color="neutral" onClick={handleStartPayment} fullWidth>
              START PAYMENT
            </Button>
          </Stack>
        )} */}

        {/* 添加支付方式状态 */}
        {status === 'adding' && (
          <PaymentMethodGroup
            originAmount={addPaymentOriginAmount}
            orderTotal={orderTotal}
            paidAmount={paidAmount}
            hasExistingPayments={hasPayments}
            hasNonSplPayment={hasNonSplPayment}
            providerConfigs={providerConfigs}
            lockedProvider={hasSplPayment ? 'stripe-payment-link' : undefined}
            onSuccess={handleAddPayment}
            onCancel={handleBackToList}
            confirmButtonLoading={addMethodLoading || posCompletePaymentLoading}
          />
        )}

        {/* 支付列表状态 */}
        {status === 'list' && (
          <>
            {!hasPayments && (
              <Stack spacing={2}>
                <Button variant="outlined" color="neutral" onClick={handleStartPayment} fullWidth>
                  START PAYMENT
                </Button>
              </Stack>
            )}
            {posOrderPaymentsInfo.length > 0 && (
              <Stack spacing={4}>
                {posOrderPaymentsInfo.map((payment: OrderPaymentV1) => (
                  <Stack key={payment.paymentId} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      {payment.paymentResult?.cardBrand && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getCardBrandIcon(payment.paymentResult.cardBrand)}
                        </Box>
                      )}
                      <Stack>
                        <Typography level="body2" sx={{ fontWeight: 600 }}>
                          {payment.paymentDescription || ''}
                        </Typography>
                        {/* 显示卡号后四位 */}
                        {payment.paymentResult?.cardLast4 && (
                          <Typography level="body2">{payment.paymentResult.cardLast4}</Typography>
                        )}
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography level="body2" sx={{ fontWeight: 600 }}>
                        {toPrice(Number(payment.amount), false)}
                      </Typography>
                      <IconButton
                        size="sm"
                        onClick={() => removePaymentMethod(payment.paymentId)}
                        loading={removeMethodLoading && activeRemoveId === payment.paymentId}
                        sx={{ minWidth: 24, minHeight: 24 }}
                      >
                        <Close />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}

            {!isPaymentComplete && hasPayments && (
              <Button
                variant="outlined"
                color="neutral"
                onClick={handleStartPayment}
                disabled={isPaymentComplete}
                fullWidth
                sx={{
                  my: 4,
                }}
              >
                ADD PAYMENT
              </Button>
            )}

            <Button
              variant="solid"
              color="primary"
              onClick={() => handleConfirmPayment()}
              disabled={!isPaymentComplete}
              loading={posCompletePaymentLoading}
              sx={{
                ml: 'auto',
                width: 'fit-content',
                mt: 6,
              }}
            >
              CONFIRM PAYMENT
            </Button>
          </>
        )}
        <Modal
          open={successModalOpen}
          onClose={() => undefined}
          hideBackdrop
          sx={{
            '&.MuiModal-root': {
              ...(!mobile && {
                top: POS_SITE_HEADER_HEIGHT,
                height: `calc(100vh - ${POS_SITE_HEADER_HEIGHT}px)`,
              }),
            },
          }}
        >
          <ModalDialog
            sx={{
              width: '100vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              ...(mobile
                ? {
                    height: '100vh',
                  }
                : {
                    height: '100%',
                    top: 0,
                    left: 0,
                    transform: 'none',
                    maxHeight: 'none',
                  }),
            }}
          >
            <Stack
              spacing={3}
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              sx={{
                ...(!mobile && {
                  // 在 menu 下方区域居中后再上移半高，使视觉中心对齐整屏（含 menuBar）
                  transform: `translateY(-${POS_SITE_HEADER_HALF_HEIGHT}px)`,
                }),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle width={42} height={42} />
                <Typography level="h3">{completedOrderText}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography level="caption1">Order Number:</Typography>
                <Typography level="h5">{completedOrderNumber}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography level="caption1">Total Paid:</Typography>
                <Typography level="h5">
                  {toPrice(completedOrderText === 'Payment Link Sent' ? completedOrderAmount : paidAmount, false)}
                </Typography>
              </Box>
              <Button
                variant="solid"
                color="primary"
                loading={loadingState?.loading}
                onClick={createNewOrder}
                sx={{ mt: '24px !important' }}
              >
                Next Order
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>
      </DialogContent>
    </Drawer>
  );
}

export default AddPaymentsV1Drawer;
