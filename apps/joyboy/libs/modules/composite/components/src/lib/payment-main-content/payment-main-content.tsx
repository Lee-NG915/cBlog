'use client';

import { Box, Divider, Skeleton, Stack, useBreakpoints, useNiceModal } from '@castlery/fortress';
import { WebCheckoutStepBar, WebCheckoutContinueButton } from '@castlery/modules-checkout-components';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useGetPaymentDataSource, useHasOrderCreated } from '@castlery/shared-components';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { WebPaymentSummary } from '../web-payment-summary/web-payment-summary';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PaymentWallets,
  PaymentTermsAndConditions,
  PaymentTermsAndConditionsText,
  WebPaymentBillingAddressSelector,
  WebPaymentShippingAddress,
} from '@castlery/modules-payment-components';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';

type ResumePaymentState = {
  status: 'failure' | 'processing';
  provider?: string;
  paymentId?: string;
  traceId?: string;
  errorCode?: string;
  orderNumber?: string;
};

const TermsDialogMessage = () => (
  <Box component="span" sx={{ '& a': { mx: 0.5 } }}>
    <PaymentTermsAndConditionsText i18nKey="checkoutPayment.termsAndConditions.dialogMessage" />
  </Box>
);

export const PaymentMainContent = ({
  orderId,
  resumeState,
}: {
  orderId: string;
  resumeState?: ResumePaymentState | null;
}) => {
  const { loading: isLoading, shippingAddress, billingAddress, summary } = useGetPaymentDataSource();

  const useShippingAddress = !!shippingAddress?.id && billingAddress?.id === shippingAddress.id;

  const effectiveBillingAddress = useShippingAddress ? shippingAddress : billingAddress;
  const isZeroTotal = !isLoading && Number(summary?.total ?? 0) === 0;
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);

  // 正常流程进入 payment 页（total > 0）时写入标志，用于区分直接 link 访问 0元单的场景
  useEffect(() => {
    if (!isLoading && !isZeroTotal) {
      persistenceHandles.paymentPageNonZeroVisited.setItem('true');
    }
  }, [isLoading, isZeroTotal, persistenceHandles]);
  const { desktop, mobile } = useBreakpoints();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [modal, contextHolder] = useNiceModal();
  const hasOrderCreated = useHasOrderCreated();
  const i18n = useTranslation(LocalesNamespace.MODULES_CHECKOUT as never);
  const t = i18n.t as (key: string) => string;

  const tauCheckHandler = useCallback(
    (onProceed?: () => void) => {
      if (acceptedTerms) return true;
      modal.confirmation({
        title: <TermsDialogMessage />,
        cancelText: t('checkoutPayment.termsAndConditions.dialogClose'),
        confirmText: t('checkoutPayment.termsAndConditions.dialogAcceptAndContinue'),
        onConfirm: () => {
          setAcceptedTerms(true);
          onProceed?.();
        },
        dialogSx: {
          width: mobile ? '90%' : '50%',
        },
      });
      return false;
    },
    [acceptedTerms, modal, t, mobile]
  );

  // 数据加载完成后再 mount selector，确保 defaultUseShippingAddress 拿到正确的初始值
  // （selector 内部用 useState(defaultUseShippingAddress) 锁住首次值，prop 后续变化不会同步）
  const billingAndTerms = (
    <>
      {isLoading ? (
        <Box sx={{ py: 2 }}>
          <Skeleton variant="text" width={160} height={32} sx={{ mb: 3 }} />
          <Skeleton variant="text" width={220} height={28} />
        </Box>
      ) : (
        <WebPaymentBillingAddressSelector
          shippingAddressId={shippingAddress?.id}
          defaultUseShippingAddress={useShippingAddress}
          selectedAddressId={effectiveBillingAddress?.id}
          orderId={orderId}
        />
      )}
      <PaymentTermsAndConditions checked={acceptedTerms} onChange={setAcceptedTerms} />
    </>
  );

  const stackProps = desktop ? { gap: 8, sx: { mb: 8 } } : {};

  const paymentSection = isZeroTotal ? (
    <Stack {...stackProps}>
      {billingAndTerms}
      <WebCheckoutContinueButton tauCheckHandler={tauCheckHandler} isOrderCreated={hasOrderCreated} />
    </Stack>
  ) : (
    <PaymentWallets
      isLoading={isLoading}
      orderId={orderId}
      tauCheckHandler={tauCheckHandler}
      defaultSelectedKey={resumeState?.provider}
      resumeState={resumeState}
      billingAddress={effectiveBillingAddress}
      ExtraComponent={<Stack {...stackProps}>{billingAndTerms}</Stack>}
    />
  );

  if (desktop) {
    return (
      <>
        <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <WebCheckoutStepBar isOrderCreated={hasOrderCreated} loading={isLoading} />
          <WebPaymentShippingAddress address={shippingAddress} isLoading={isLoading} />
          {paymentSection}
        </Box>
        <Divider orientation="vertical" />
        <WebPaymentSummary />
        {contextHolder}
      </>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: mobile ? 4 : 6 }}>
        <WebCheckoutStepBar isOrderCreated={hasOrderCreated} loading={isLoading} />
        <WebPaymentSummary />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, px: 6, mt: 5 }}>
        <WebPaymentShippingAddress address={shippingAddress} isLoading={isLoading} />
        {paymentSection}
      </Box>
      {contextHolder}
    </>
  );
};

export default PaymentMainContent;
