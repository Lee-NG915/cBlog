'use client';
import { useReconcilePaymentMutation } from '@castlery/modules-payment-domain';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Box, useNiceModal } from '@castlery/fortress';
import { BackdropLoading } from '@castlery/shared-components';
import { LocalesNamespace, useTranslation } from '@castlery/monorepo-i18n';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { EcEnv, basePageConfig } from '@castlery/config';

export enum CallbackChannel {
  SPL = 'spl',
  GRAB_PAY = 'grabpay',
  ZIP_PAY = 'zippay',
  TCTP = '2c2p',
}

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 1000;

const prefix = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase();

export default function PaymentCallbackPage() {
  const [reconcilePayment] = useReconcilePaymentMutation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ deviceTheme: string; region: string; locale: string }>();
  const [loading, setLoading] = useState(true);
  const [modal, contextHolder] = useNiceModal();
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPaymentCallback',
  });

  const { queryArgs } = useMemo(() => {
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token');
    const stripeCheckoutSessionId = searchParams.get('stripeCheckoutSessionId');

    return {
      queryArgs: {
        orderId,
        token,
        stripeCheckoutSessionId,
      },
      callbackChannel: CallbackChannel.SPL,
    };
  }, [searchParams]);

  const showPendingPaymentModal = useCallback(
    (orderId: string | null) => {
      modal.warning({
        title: t('pendingPaymentError.title'),
        desc: t('pendingPaymentError.description'),
        showCancelBtn: false,
        confirmText: t('pendingPaymentError.viewOrderDetails'),
        onConfirm: () => {
          const orderDetailsPath = orderId
            ? `${prefix}${basePageConfig['order-details']}?id=${orderId}`
            : `${prefix}${basePageConfig['order-details']}`;

          const persistenceHandles = makePersistenceHandles();
          const hasLoggedIn = persistenceHandles.webAccessToken.hasItem();

          if (hasLoggedIn) {
            window.location.href = orderDetailsPath;
          } else {
            const loginUrl = `${prefix}${basePageConfig.login}?redirectUrl=${encodeURIComponent(orderDetailsPath)}`;
            window.location.href = loginUrl;
          }
        },
      });
    },
    [modal, t]
  );

  useEffect(() => {
    const { orderId, token } = queryArgs;
    if (!orderId) {
      setLoading(false);
      showPendingPaymentModal(null);
      return;
    }

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const redirectToSuccess = () => {
      const qs = new URLSearchParams({
        orderId,
        ...(token ? { token } : {}),
      }).toString();
      router.replace(`/${params.region}/checkout/success?${qs}`);
    };

    const poll = async (attempt: number) => {
      if (cancelled) return;
      let paid = false;
      try {
        const result = await reconcilePayment({ orderId }).unwrap();
        paid = result.paid;
      } catch {
        // 静默重试，直到达到 MAX_POLL_ATTEMPTS
      }
      if (cancelled) return;
      if (paid) {
        redirectToSuccess();
        return;
      }
      if (attempt >= MAX_POLL_ATTEMPTS) {
        setLoading(false);
        showPendingPaymentModal(orderId);
        return;
      }
      timerId = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
    };

    poll(1);

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [queryArgs, reconcilePayment, router, params.region, showPendingPaymentModal]);

  return (
    <Box>
      {contextHolder}
      <BackdropLoading loading={loading} />
    </Box>
  );
}
