import type { AppStartListening } from '@castlery/shared-redux-store';
import type { Unsubscribe } from '@reduxjs/toolkit';
import { logger } from '@castlery/observability';
import { isSystemInternalError } from '../global-error.helper';
import {
  PaymentProcessFailedEvent,
  needIgnoredPaymentErrorCodes,
  needReloadPosPaymentConfigsCodes,
  paymentErrorHandlersMap,
} from '../payment-error.helper';
import { createApiErrorPresenter } from './api-error.presenter';
import { normalizeApiError } from './normalize-api-error';

export function setupPaymentApiErrorListener(
  startListening: AppStartListening,
  { apiModal }: { apiModal: any }
): Unsubscribe {
  const presenter = createApiErrorPresenter(apiModal);

  return startListening({
    matcher: PaymentProcessFailedEvent,
    effect: async (action, { dispatch }) => {
      if (!action.error) return;

      const error = normalizeApiError(action);
      if (error.kind === 'condition-abort') return;

      if (error.kind === 'fetch') {
        logger.warn('Request failed to fetch detected in payment process', {
          error: action.payload,
          context: 'payment_fetch_error',
        });
        presenter.showFetchError();
        return;
      }

      if (isSystemInternalError(error.numberCode)) {
        presenter.showSystemInternalError(error);
        return;
      }

      if (needIgnoredPaymentErrorCodes.includes(error.numberCode)) {
        await paymentErrorHandlersMap.onIgnoredPaymentError(dispatch, error.numberCode, error.message);
        return;
      }

      const confirmHandler = needReloadPosPaymentConfigsCodes.includes(error.numberCode)
        ? () => paymentErrorHandlersMap.reloadPosPaymentConfigs(dispatch)
        : undefined;

      presenter.showTransactionError({
        code: error.code,
        message: error.message,
        ...(confirmHandler ? { onConfirm: confirmHandler } : {}),
      });
    },
  });
}
