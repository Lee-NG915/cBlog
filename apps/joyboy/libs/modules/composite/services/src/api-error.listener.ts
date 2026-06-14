import type { AppStartListening } from '@castlery/shared-redux-store';
import type { Unsubscribe } from '@reduxjs/toolkit';
import { ErrorTranslatePrefix } from './api-error/api-error.presenter';
import { setupCartApiErrorListener } from './api-error/cart-api-error.listener';
import { setupCheckoutApiErrorListener } from './api-error/checkout-api-error.listener';
import { setupPaymentApiErrorListener } from './api-error/payment-api-error.listener';

export { ErrorTranslatePrefix };

/**
 * TODO(backend-sync): Gift invalid code mapping is currently based on frontend assumptions from existing enum/i18n.
 * Current assumed codes:
 * - 10701022: cart gift invalid (ErrGiftInvalid)
 * - 10702028: checkout gift invalid (ErrCheckoutGiftInvalid)
 * Replace with backend-confirmed codes once aligned.
 */

export function setupApiErrorListeners(
  startListening: AppStartListening,
  { apiModal }: { apiModal: any }
): Unsubscribe {
  const subscriptions = [
    setupCartApiErrorListener(startListening, { apiModal }),
    setupCheckoutApiErrorListener(startListening, { apiModal }),
    setupPaymentApiErrorListener(startListening, { apiModal }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
