'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, useNiceModal } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { PaymentErrorPopupDetail } from '../components/payment-error-popup-detail';
import type { PaymentError } from '../payment-wallets.types';
import { contactUsUrl, homePath, orderHistoryPath } from '../constants';

function OrderCanceledContent() {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.paymentWallets.orderCanceled',
  });
  return (
    <Typography level="body2" textAlign="center" sx={{ mt: 3, mb: 6 }}>
      {t('descriptionPrefix' as any)}{' '}
      <a href={contactUsUrl} style={{ textDecoration: 'underline' }}>
        {t('contactUs' as any)}
      </a>{' '}
      {t('descriptionSuffix' as any)}
    </Typography>
  );
}

export interface UsePaymentErrorModalOptions {
  error: PaymentError | null;
  clearPaymentError: () => void;
}

export interface UsePaymentErrorModalReturn {
  /** Rendered by the parent so nice-modal can mount its portal. */
  contextHolder: ReactNode;
}

/**
 * Drives the payment-error modal lifecycle.
 *
 * Routes `PaymentErrorModal` instances to the appropriate nice-modal config
 * based on `category`:
 *   - `orderExpired`              -> two-button modal, navigate to history / home
 *   - `orderCanceled`             -> contact-us copy, navigate to history
 *   - `paymentSuccessOrderCanceled` (BFF `10703048`) -> "View my order" + contact-us refund link, navigate to history
 *   - everything else             -> standard PaymentErrorPopupDetail with i18n copy from `paymentProcessingError.<category>`
 */
export function usePaymentErrorModal({
  error,
  clearPaymentError,
}: UsePaymentErrorModalOptions): UsePaymentErrorModalReturn {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutPayment.paymentWallets',
  });
  const { t: tErr } = useTranslation(LocalesNamespace.ERROR);
  const router = useRouter();
  const [modal, contextHolder] = useNiceModal();

  useEffect(() => {
    if (!error || error.displayType !== 'modal') return;

    if (error.category === 'orderExpired') {
      modal.warning({
        title: t('orderExpired.title' as any),
        desc: t('orderExpired.description' as any),
        confirmText: t('orderExpired.viewOrderHistory' as any),
        cancelText: t('orderExpired.continueShopping' as any),
        showCancelBtn: true,
        onConfirm: () => router.replace(orderHistoryPath),
        onCancel: () => router.replace(homePath),
        onClose: () => router.replace(orderHistoryPath),
      });
      return;
    }

    if (error.category === 'orderCanceled') {
      modal.warning({
        title: t('orderCanceled.title' as any),
        content: <OrderCanceledContent />,
        confirmText: t('orderCanceled.viewMyOrder' as any),
        showCancelBtn: false,
        onConfirm: () => router.replace(orderHistoryPath),
        onClose: () => router.replace(orderHistoryPath),
      });
      return;
    }

    if (error.category === 'paymentSuccessOrderCanceled') {
      // BFF code 10703048: third-party payment succeeded but the order was
      // canceled mid-flow. Per PRD the user should be funneled to order
      // history (both the explicit button and the close action) so they can
      // see the canceled order and request a refund via the contact-us link
      // rendered inside the standard PaymentErrorPopupDetail body.
      modal.warning({
        title: error.title,
        content: (
          <PaymentErrorPopupDetail
            orderNumber={error.orderNumber}
            errorMessage={error.message}
            category={error.category}
            failureCode={error.failureCode}
            failureInfo={error.failureInfo}
            shortMessage={error.shortMessage}
            details={error.details ?? null}
          />
        ),
        confirmText: tErr('paymentProcessingError.paymentSuccessOrderCanceledButton' as string),
        showCancelBtn: false,
        beforeClose: () => router.replace(orderHistoryPath),
      });
      return;
    }

    modal.warning({
      title: error.title,
      content: (
        <PaymentErrorPopupDetail
          orderNumber={error.orderNumber}
          errorMessage={error.message}
          category={error.category}
          failureCode={error.failureCode}
          failureInfo={error.failureInfo}
          shortMessage={error.shortMessage}
          details={error.details ?? null}
        />
      ),
      onClose: clearPaymentError,
      showCancelBtn: false,
      confirmText: 'Okay',
    });
  }, [error, modal, clearPaymentError, t, tErr, router]);

  return { contextHolder };
}
