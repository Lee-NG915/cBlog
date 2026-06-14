'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  RadioButton,
  RadioGroup,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Button,
  useNiceModal,
} from '@castlery/fortress';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '@castlery/shared-redux-store';
import { type PosPaymentProviderConfigV2, type PosPaymentInitiatePayload } from '@castlery/types';
import { formatDate } from '@castlery/utils';
import { AddStripeMethodButtonV1 } from '../payments/add-stripe-method-button/add-stripe-method-button-v1';
import { EcEnv, INTL_CURRENCY, MarketCurrency, posRoutes } from '@castlery/config';
import {
  selectPosOrderNumber,
  selectTransactionOrderDetail,
  selectPosOrderId,
  selectPosOrderPaymentExpiredAt,
} from '@castlery/modules-order-domain';
import { v4 as uuidV4 } from 'uuid';
type PosAddPaymentPayload = Omit<PosPaymentInitiatePayload, 'orderNumber' | 'orderId'>;

const STRIPE_PAYMENT_LINK_RESTRICTED_TIME_START = 23 * 60 + 30;
const STRIPE_PAYMENT_LINK_EXPIRING_SOON_THRESHOLD_MS = 2 * 60 * 1000;
const STRIPE_PAYMENT_LINK_RESTRICTION_CHECK_INTERVAL = 30 * 1000;

export const isStripePaymentLinkRestrictedAtLocalTime = (
  date: Date | string | number = new Date(),
  timezone = EcEnv.NEXT_PUBLIC_TIME_ZONE
) => {
  const localTime = formatDate(date, 'HH:mm', timezone);
  const [hours = '0', minutes = '0'] = localTime.split(':');
  const totalMinutes = Number(hours) * 60 + Number(minutes);

  return totalMinutes >= STRIPE_PAYMENT_LINK_RESTRICTED_TIME_START;
};

/**
 * 判断 Stripe Payment Link 是否被支付过期限制
 * @param paymentExpiredAt 支付过期时间
 * @returns 是否被支付过期限制
 */
export const isStripePaymentLinkBlockedByPaymentExpiry = (paymentExpiredAt?: string) => {
  if (!paymentExpiredAt) return false;
  const remainingTimeMs = new Date(paymentExpiredAt).getTime() - Date.now();
  return remainingTimeMs <= STRIPE_PAYMENT_LINK_EXPIRING_SOON_THRESHOLD_MS;
};

export interface PaymentMethodGroupV1Props {
  originAmount: number;
  orderTotal: number;
  paidAmount: number;
  hasExistingPayments: boolean;
  hasNonSplPayment: boolean;
  providerConfigs: PosPaymentProviderConfigV2[];
  lockedProvider?: string;
  confirmButtonLoading: boolean;
  onSuccess: (addPayMethodPayload: PosAddPaymentPayload | { provider: string }) => void;
  onCancel: () => void;
}

interface PaymentFormData {
  paymentMethodId: string;
  amount: number;
  payType: string;
  externalReference: string;
  remarks: string;
}

/**
 * 保留两位小数
 */
const normalizeAmount = (value: number) => Math.round(value * 100) / 100;
const REMARKS_ENABLED_PROVIDERS = new Set([
  'offline-transfer',
  'offline-credit-memo',
  'stripe-terminal',
  'offline-cash',
  'offline-cheque',
]);
const REMARKS_ENABLED_METHOD_NAMES = new Set(['transfer', 'credit memo', 'stripe', 'cash', 'cheque']);

export function PaymentMethodGroup({
  originAmount,
  orderTotal,
  paidAmount,
  hasExistingPayments,
  hasNonSplPayment,
  providerConfigs,
  lockedProvider,
  confirmButtonLoading,
  onSuccess,
  onCancel,
}: PaymentMethodGroupV1Props) {
  const [modal, contextHolder] = useNiceModal();
  const isCheckoutPage = useMemo(() => {
    return window.location.pathname.includes(posRoutes.checkout);
  }, [window.location.pathname]);
  const posOrderNumberFromCreateOrderReferenceInfoState = useAppSelector(selectPosOrderNumber);
  const posOrderIdFromCreateOrderReferenceInfoState = useAppSelector(selectPosOrderId);
  const posOrderPaymentExpiredAtFromCreateOrderReferenceInfoState = useAppSelector(selectPosOrderPaymentExpiredAt);
  const transactionOrderDetail = useAppSelector(selectTransactionOrderDetail);
  const posOrderNumber = useMemo(() => {
    return isCheckoutPage ? posOrderNumberFromCreateOrderReferenceInfoState : transactionOrderDetail?.number;
  }, [isCheckoutPage, posOrderNumberFromCreateOrderReferenceInfoState, transactionOrderDetail]);
  const posOrderId = useMemo(() => {
    return isCheckoutPage ? posOrderIdFromCreateOrderReferenceInfoState : transactionOrderDetail?.id;
  }, [isCheckoutPage, posOrderIdFromCreateOrderReferenceInfoState, transactionOrderDetail]);
  const orderPaymentExpiredAt = useMemo(() => {
    return isCheckoutPage
      ? posOrderPaymentExpiredAtFromCreateOrderReferenceInfoState
      : transactionOrderDetail?.paymentExpiredAt;
  }, [isCheckoutPage, posOrderPaymentExpiredAtFromCreateOrderReferenceInfoState, transactionOrderDetail]);
  // orderId 从 posOrderReferenceInfo 中获取（创建订单时返回）
  const orderId = posOrderId || '';

  const [currentSelectedMethod, setCurrentSelectedMethod] = useState<PosPaymentProviderConfigV2 | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());

  // 是否是 Stripe Payment Link
  const isStripeLinkPayment = useMemo(
    () => currentSelectedMethod?.provider === 'stripe-payment-link',
    [currentSelectedMethod]
  );

  // 是否是 Stripe 终端支付
  const isStripeTerminalPayment = useMemo(
    () => currentSelectedMethod?.provider === 'stripe-terminal',
    [currentSelectedMethod]
  );
  const isStripePaymentLinkRestricted = useMemo(
    () => isStripeLinkPayment && isStripePaymentLinkRestrictedAtLocalTime(currentTimestamp),
    [currentTimestamp, isStripeLinkPayment]
  );
  const shouldShowOfflineRemarks = useMemo(() => {
    if (!currentSelectedMethod) return false;
    const provider = (currentSelectedMethod.provider || '').toLowerCase();
    if (REMARKS_ENABLED_PROVIDERS.has(provider)) return true;
    const methodName = (currentSelectedMethod.name || '').trim().toLowerCase();
    return REMARKS_ENABLED_METHOD_NAMES.has(methodName);
  }, [currentSelectedMethod]);

  const lockedMethodConfig = useMemo(
    () => providerConfigs.find((method) => method.provider === lockedProvider) || null,
    [providerConfigs, lockedProvider]
  );

  const isProviderLocked = useMemo(
    () => Boolean(lockedProvider && lockedMethodConfig),
    [lockedProvider, lockedMethodConfig]
  );
  // 是否处于“锁定 SPL”模式：
  // 该模式用于已发过 SPL 邮件的订单重发场景，支付方式固定为 SPL，不允许切换。
  const isLockedStripeLink = useMemo(
    () => isProviderLocked && lockedProvider === 'stripe-payment-link',
    [isProviderLocked, lockedProvider]
  );

  // SPL 重发场景允许支付到订单全额，不受 pending SPL 记录影响
  const maxAllowedAmount = useMemo(() => {
    return isLockedStripeLink ? orderTotal : normalizeAmount(orderTotal - paidAmount);
  }, [isLockedStripeLink, orderTotal, paidAmount]);

  // 表单管理
  const {
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<PaymentFormData>({
    mode: 'onChange',
    defaultValues: {
      paymentMethodId: '',
      amount: normalizeAmount(originAmount),
      payType: '',
      externalReference: '',
      remarks: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedPayType = watch('payType');
  const watchedExternalReference = watch('externalReference');
  const watchedRemarks = watch('remarks');

  const currency = useMemo(() => INTL_CURRENCY ?? MarketCurrency, []);
  useEffect(() => {
    if (originAmount) {
      setValue('amount', normalizeAmount(originAmount));
    }
    if (isStripeLinkPayment) {
      setValue('amount', normalizeAmount(originAmount), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [originAmount, setValue, isStripeLinkPayment]);

  useEffect(() => {
    void trigger('amount');
  }, [currentSelectedMethod, trigger]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTimestamp(Date.now());
      if (currentSelectedMethod?.provider === 'stripe-payment-link') {
        void trigger('amount');
      }
    }, STRIPE_PAYMENT_LINK_RESTRICTION_CHECK_INTERVAL);

    return () => window.clearInterval(timer);
  }, [currentSelectedMethod, trigger]);

  // 不默认选中支付方式，用户自行选择

  // responseCodeRequired = true
  // externalReference：必传（UI 可用 responseCodeHint 做输入框提示文案）
  // autoResponseCode = true
  // 可由前端自动生成 / 填充 externalReference，但最终仍需保证请求里有值
  // remarks
  // 非必填，仅离线场景可选
  useEffect(() => {
    if (currentSelectedMethod?.paymentTypes && currentSelectedMethod.paymentTypes.length > 0) {
      setValue('payType', currentSelectedMethod.paymentTypes[0]);
    }
    if (!shouldShowOfflineRemarks) {
      setValue('remarks', '');
    }
  }, [currentSelectedMethod, setValue, shouldShowOfflineRemarks]);

  useEffect(() => {
    if (isProviderLocked && lockedMethodConfig) {
      setCurrentSelectedMethod(lockedMethodConfig);
    }
  }, [isProviderLocked, lockedMethodConfig]);

  // 自动生成响应码
  useEffect(() => {
    if (!currentSelectedMethod?.responseCodeRequired) {
      setValue('externalReference', '');
      return;
    }
    if (currentSelectedMethod?.autoResponseCode) {
      // 用 uuid 生成 4 位数字（取 uuid 最后四位的十进制，填充前导零）
      const randomFourDigit = String(parseInt(uuidV4().replace(/-/g, '').slice(-4), 16) % 10000).padStart(4, '0');
      setValue('externalReference', randomFourDigit);
      return;
    }
    setValue('externalReference', '');
  }, [
    currentSelectedMethod?.id,
    currentSelectedMethod?.responseCodeRequired,
    currentSelectedMethod?.autoResponseCode,
    setValue,
  ]);

  // 金额验证规则
  const amountValidationRules = {
    required: 'Amount is required',
    min: {
      value: 0.01,
      message: 'Amount must be greater than 0',
    },
    validate: (value: number) => {
      if (isLockedStripeLink) return true;
      if (isStripePaymentLinkRestricted) {
        return 'Creation of Stripe payment link in time range (23:30 - 00:00) is not supported.';
      }
      if (value > maxAllowedAmount) {
        setValue('amount', maxAllowedAmount);
        return true;
      }
      return true;
    },
  };

  const addPayMethodPayload = useMemo<PosAddPaymentPayload | null>(() => {
    if (!currentSelectedMethod || !currentSelectedMethod?.provider || !posOrderNumber) return null;
    const amountValue = typeof watchedAmount === 'number' ? watchedAmount : Number(watchedAmount || 0);

    return {
      amount: String(amountValue || ''),
      provider: currentSelectedMethod.provider,
      description: currentSelectedMethod.name,
      remarks: shouldShowOfflineRemarks ? watchedRemarks || undefined : undefined,
      paymentIntentId: undefined,
      orderNumber: posOrderNumber,
      currency,
      externalReference: currentSelectedMethod.responseCodeRequired ? watchedExternalReference : undefined,
    };
  }, [
    currentSelectedMethod,
    posOrderNumber,
    watchedAmount,
    shouldShowOfflineRemarks,
    watchedRemarks,
    watchedExternalReference,
    currency,
  ]);

  const stripeAddApiPayload = useMemo(() => {
    if (!currentSelectedMethod || !posOrderNumber || !orderId) return null;
    const amountValue = typeof watchedAmount === 'number' ? watchedAmount : Number(watchedAmount || 0);
    const description = currentSelectedMethod.name;
    if (!description) return null; // 确保 description 存在
    return {
      orderNumber: posOrderNumber,
      orderId: orderId,
      provider: currentSelectedMethod.provider || 'stripe-terminal',
      amount: String(amountValue),
      description: description,
      remarks: shouldShowOfflineRemarks ? watchedRemarks || undefined : undefined,
      currency,
    };
  }, [
    currentSelectedMethod,
    posOrderNumber,
    orderId,
    watchedAmount,
    shouldShowOfflineRemarks,
    watchedRemarks,
    currency,
  ]);

  // 按钮禁用逻辑
  const isButtonDisabled = useMemo(() => {
    if (!currentSelectedMethod?.id) return true;
    if (isStripePaymentLinkRestricted) return true;
    // 锁定 SPL 重发场景下允许重复点击 Send（只要已锁定到 SPL 即可触发重发逻辑）。
    // 这里不再依赖 amount > 0 的校验，避免被旧记录导致的金额状态误伤。
    if (isLockedStripeLink) return false;
    if (!watchedAmount || watchedAmount <= 0) return true;
    if (currentSelectedMethod?.responseCodeRequired && !watchedExternalReference?.trim()) return true;
    if (
      Array.isArray(currentSelectedMethod?.paymentTypes) &&
      currentSelectedMethod.paymentTypes.length > 0 &&
      !watchedPayType
    ) {
      return true;
    }
    if (!addPayMethodPayload) return true;
    return false;
  }, [
    currentSelectedMethod,
    watchedAmount,
    watchedExternalReference,
    watchedPayType,
    addPayMethodPayload,
    isLockedStripeLink,
    isStripePaymentLinkRestricted,
  ]);

  const handleConfirmAddPayment = useCallback(
    (source: 'stripe-link' | 'stripe-terminal' | 'default') => {
      if (source === 'stripe-link' && isStripePaymentLinkRestricted) return;
      if (source === 'stripe-link' && isStripePaymentLinkBlockedByPaymentExpiry(orderPaymentExpiredAt)) {
        modal.warning({
          title: 'Order expiring soon',
          subDesc: 'This order is about to expire and is no longer eligible for Stripe Payment Link.',
          showCancelBtn: false,
          confirmText: 'Ok',
          dialogSx: {
            maxWidth: 360,
          },
        });
        return;
      }
      // 锁定 SPL 时不再走“新增支付记录”流程，直接通知父组件执行 SPL confirm（重发）逻辑。
      if (source === 'stripe-link' && isLockedStripeLink) {
        onSuccess({
          provider: 'stripe-payment-link',
          amount: String(originAmount ?? watchedAmount),
          currency,
        });
        return;
      }
      if (!addPayMethodPayload) return;
      onSuccess(addPayMethodPayload);
    },
    [
      addPayMethodPayload,
      currency,
      isLockedStripeLink,
      isStripePaymentLinkRestricted,
      modal,
      onSuccess,
      orderPaymentExpiredAt,
      originAmount,
      watchedAmount,
    ]
  );

  const actionButtonText = useMemo(() => {
    const amountValue = typeof watchedAmount === 'number' ? watchedAmount : Number(watchedAmount || 0);
    if (!hasExistingPayments) {
      const normalizedAmount = normalizeAmount(amountValue);
      if (normalizedAmount >= orderTotal && orderTotal > 0) {
        return 'FULL PAYMENT';
      }
      if (normalizedAmount > 0 && normalizedAmount < orderTotal) {
        return 'PARTIAL PAYMENT';
      }
      return 'START PAYMENT';
    }
    return 'PARTIAL PAYMENT';
  }, [watchedAmount, hasExistingPayments, orderTotal]);

  return (
    <Stack spacing={6}>
      {contextHolder}
      {/* 支付方式选择 */}
      <Box>
        <RadioGroup
          value={currentSelectedMethod?.id ? String(currentSelectedMethod.id) : ''}
          onChange={(e) => {
            if (isProviderLocked) return;
            const id = e.target.value;
            setCurrentSelectedMethod(providerConfigs.find((method) => String(method.id) === id) || null);
          }}
          sx={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            flexDirection: 'row',
            '--RadioGroup-gap': '0px',
            '& .Mui-disabled': {
              cursor: 'not-allowed',
              backgroundColor: 'transparent',
              color: 'var(--fortress-palette-brand-mono-500)',
              borderColor: 'var(--fortress-palette-brand-mono-500)',
              '& .MuiRadio-label': {
                cursor: 'not-allowed',
              },
            },
          }}
        >
          {providerConfigs.map((method) => (
            <RadioButton
              key={method.id}
              label={method.name}
              value={String(method.id)}
              disabled={
                isProviderLocked
                  ? method.provider !== lockedProvider
                  : hasNonSplPayment && method.provider === 'stripe-payment-link'
              }
              slotProps={{
                root: {
                  sx: {
                    '.Mui-disabled': {
                      backgroundColor: 'var(--fortress-palette-brand-mono-900)',
                    },
                  },
                },
              }}
            />
          ))}
        </RadioGroup>
      </Box>

      {/* 金额输入 */}
      <Controller
        name="amount"
        control={control}
        rules={amountValidationRules}
        render={({ field }) => (
          <FormControl
            error={!!errors.amount}
            sx={{
              '& .form-helper-text-container': {
                position: 'unset',
              },
            }}
          >
            <FormLabel>Amount ({EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL})</FormLabel>
            <Input
              {...field}
              variant="outlined"
              type="number"
              inputMode="decimal"
              placeholder="Enter amount"
              disabled={isStripeLinkPayment} // SPL 不可编辑金额
              error={!!errors.amount}
              value={field.value ?? ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === '') {
                  field.onChange('');
                  return;
                }
                const numValue = parseFloat(inputValue);
                if (!isNaN(numValue)) {
                  if (numValue > maxAllowedAmount) {
                    field.onChange(maxAllowedAmount);
                  } else {
                    field.onChange(normalizeAmount(numValue));
                  }
                } else {
                  field.onChange(inputValue);
                }
              }}
              onBlur={(e) => {
                // 失焦时进行验证
                const numValue = parseFloat(e.target.value);
                if (!isNaN(numValue)) {
                  if (numValue > maxAllowedAmount) {
                    field.onChange(maxAllowedAmount);
                  } else {
                    field.onChange(normalizeAmount(numValue));
                  }
                }
              }}
            />
            {errors.amount && <FormHelperText>{errors.amount.message as string}</FormHelperText>}
          </FormControl>
        )}
      />

      {/* externalReference（responseCodeRequired 时必填） */}
      {currentSelectedMethod?.responseCodeRequired && (
        <Controller
          name="externalReference"
          control={control}
          rules={{
            required: currentSelectedMethod?.responseCodeRequired ? 'This field cannot be empty' : false,
          }}
          render={({ field }) => (
            <FormControl error={!!errors.externalReference}>
              <FormLabel>{currentSelectedMethod?.responseCodeHint || 'Comments'}</FormLabel>
              <Input
                {...field}
                variant="outlined"
                type="text"
                placeholder={currentSelectedMethod?.responseCodeHint || 'Enter external reference'}
                error={!!errors.externalReference}
              />
              {errors.externalReference && (
                <FormHelperText>{errors.externalReference.message as string}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      )}

      {/* remarks（仅指定线下支付方式展示，非必填） */}
      {shouldShowOfflineRemarks && (
        <Controller
          name="remarks"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormLabel>Comments</FormLabel>
              <Input {...field} variant="outlined" type="text" placeholder="Add comments" />
            </FormControl>
          )}
        />
      )}

      {/* 操作按钮 */}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 6 }}>
        <Button variant="plain" color="warning" onClick={onCancel}>
          BACK
        </Button>

        {/* 根据支付类型显示不同按钮 */}
        {isStripeLinkPayment ? (
          <Button
            variant="solid"
            color="primary"
            onClick={() => handleConfirmAddPayment('stripe-link')}
            disabled={isButtonDisabled || (!isLockedStripeLink && (!!errors.amount || !!errors.externalReference))}
            loading={confirmButtonLoading}
          >
            Send Payment Link
          </Button>
        ) : isStripeTerminalPayment ? (
          <AddStripeMethodButtonV1
            disabled={isButtonDisabled}
            addApiPayload={stripeAddApiPayload}
            buttonText={actionButtonText}
            afterAddPayMethod={() => {
              onSuccess({ provider: 'stripe-terminal' });
            }}
          />
        ) : (
          <Button
            variant="solid"
            color="primary"
            onClick={() => handleConfirmAddPayment('default')}
            disabled={isButtonDisabled}
            loading={confirmButtonLoading}
          >
            {actionButtonText}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
