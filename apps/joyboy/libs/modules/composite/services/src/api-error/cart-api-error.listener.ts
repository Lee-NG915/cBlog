import type { AppStartListening } from '@castlery/shared-redux-store';
import type { Unsubscribe } from '@reduxjs/toolkit';
import { addLineItemToCart } from '@castlery/modules-cart-domain';
import { logger } from '@castlery/observability';
import {
  CartProcessFailedEvent,
  UpdateZipcodeInCartFailedEvent,
  handlersMap as cartHandlersMap,
  needAutoReloadCartDataGroups,
  needIgnoredCartErrorCodes,
  needRemoveCartTokenAndReloadPageErrorCodes,
} from '../cart-error.helper';
import { isSystemInternalError } from '../global-error.helper';
import { createApiErrorPresenter } from './api-error.presenter';
import { isFetchError, normalizeApiError } from './normalize-api-error';

function isRecommendationAddToCartRejected(action: unknown): boolean {
  return (
    addLineItemToCart.matchRejected(action) &&
    (action as any).meta.arg.originalArgs?.source?.toLowerCase()?.includes('recommendation')
  );
}

export function setupCartApiErrorListener(
  startListening: AppStartListening,
  { apiModal }: { apiModal: any }
): Unsubscribe {
  const presenter = createApiErrorPresenter(apiModal);
  const subscriptions = [
    startListening({
      matcher: UpdateZipcodeInCartFailedEvent,
      effect: async (action) => {
        if (action.error && isFetchError(action)) {
          presenter.showFetchError();
        }
      },
    }),
    startListening({
      matcher: CartProcessFailedEvent,
      effect: async (action, { dispatch }) => {
        if (!action.error) return;

        const error = normalizeApiError(action);
        if (error.kind === 'condition-abort') return;

        if (isRecommendationAddToCartRejected(action)) {
          // Recommendation carousel owns its add-to-cart error toast.
          return;
        }

        if (error.kind === 'fetch') {
          logger.warn('Request timeout detected in cart process', {
            error: action.payload,
            context: 'cart_timeout_error',
          });
          presenter.showFetchError();
          return;
        }

        if (isSystemInternalError(error.numberCode)) {
          presenter.showSystemInternalError(error);
          return;
        }

        if (needRemoveCartTokenAndReloadPageErrorCodes.includes(error.numberCode)) {
          cartHandlersMap.removeCartTokenAndReloadPage();
          return;
        }

        if (needIgnoredCartErrorCodes.includes(error.numberCode)) {
          cartHandlersMap.reloadCartData(dispatch);
          return;
        }

        const isAutoReloadCartData = needAutoReloadCartDataGroups.includes(error.numberCode);
        presenter.showTransactionError({
          code: error.code,
          message: error.message,
          ...(isAutoReloadCartData ? { onConfirm: () => cartHandlersMap.reloadCartData(dispatch) } : {}),
        });
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
