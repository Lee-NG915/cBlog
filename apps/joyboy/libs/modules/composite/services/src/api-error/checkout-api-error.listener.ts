import type { AppStartListening } from '@castlery/shared-redux-store';
import type { Unsubscribe } from '@reduxjs/toolkit';
import { accessInPos } from '@castlery/config';
import { logger } from '@castlery/observability';
import { handlersMap as cartHandlersMap } from '../cart-error.helper';
import {
  CheckoutProcessFailedEvent,
  UpdateCheckoutAddressZipcodeFailedEvent,
  checkoutHandlersMap,
  checkoutZipcodeErrorCodes,
  needJumpToCheckoutAccountCodes,
  needListingItemsGroups,
  needRefreshCartOrRedirectToCartCodes,
  needRefreshCartOrReloadCheckoutInfoGroups,
  needRefreshCheckoutPromotionCodes,
  needReloadCheckoutAddressesCodes,
  needReplaceToMethodPageCodes,
} from '../checkout-error.helper';
import { isSystemInternalError } from '../global-error.helper';
import { createApiErrorPresenter } from './api-error.presenter';
import { getInvalidLineItems, isFetchError, isHttpForbiddenError, normalizeApiError } from './normalize-api-error';

function isInCheckoutPage(): boolean {
  return accessInPos
    ? window?.location?.pathname?.includes('/checkout')
    : window?.location?.pathname?.includes('/checkout/');
}

export function setupCheckoutApiErrorListener(
  startListening: AppStartListening,
  { apiModal }: { apiModal: any }
): Unsubscribe {
  const presenter = createApiErrorPresenter(apiModal);
  const subscriptions = [
    startListening({
      matcher: UpdateCheckoutAddressZipcodeFailedEvent,
      effect: async (action) => {
        if (action.error && isFetchError(action)) {
          presenter.showFetchError();
        }
      },
    }),
    startListening({
      matcher: CheckoutProcessFailedEvent,
      effect: async (action, { dispatch }) => {
        if (!action.error) return;

        const error = normalizeApiError(action);
        if (error.kind === 'condition-abort') return;

        if (error.kind === 'fetch') {
          logger.warn('Request failed to fetch detected in checkout process', {
            error: action.payload,
            context: 'checkout_fetch_error',
          });
          presenter.showFetchError();
          return;
        }

        if (isSystemInternalError(error.numberCode)) {
          presenter.showSystemInternalError(error);
          return;
        }

        if (isHttpForbiddenError(action) || needJumpToCheckoutAccountCodes.includes(error.numberCode)) {
          checkoutHandlersMap.goToCheckoutAccount();
          return;
        }

        const shouldRefreshCartOrRedirectToCart = needRefreshCartOrRedirectToCartCodes.includes(error.numberCode);
        const shouldRefreshCartOrReloadCheckoutInfo = needRefreshCartOrReloadCheckoutInfoGroups.includes(
          error.numberCode
        );
        const shouldReloadCheckoutAddressesList = needReloadCheckoutAddressesCodes.includes(error.numberCode);
        const shouldListItems = needListingItemsGroups.includes(error.numberCode);
        const isCheckoutZipcodeError = checkoutZipcodeErrorCodes.includes(error.numberCode);
        const shouldReplaceToMethodPage = needReplaceToMethodPageCodes.includes(error.numberCode);
        const invalidLineItems = getInvalidLineItems(error);
        const checkoutPage = isInCheckoutPage();

        let confirmHandler: (() => void) | undefined;
        let cancelHandler: (() => void) | undefined;
        let beforeCloseHandler: (() => void) | undefined;

        if (shouldRefreshCartOrRedirectToCart) {
          confirmHandler = checkoutPage ? checkoutHandlersMap.redirectToCart : cartHandlersMap.autoRefreshCart;
          beforeCloseHandler = checkoutPage ? checkoutHandlersMap.redirectToCart : cartHandlersMap.autoRefreshCart;
        }

        if (shouldReplaceToMethodPage) {
          confirmHandler = () => checkoutHandlersMap.replaceToMethodPage(dispatch);
        }

        if (shouldRefreshCartOrReloadCheckoutInfo) {
          confirmHandler = checkoutPage
            ? () => checkoutHandlersMap.reloadCheckoutInfo(dispatch)
            : () => cartHandlersMap.reloadCartData(dispatch);
        }

        if (shouldReloadCheckoutAddressesList) {
          confirmHandler = () => checkoutHandlersMap.reloadCheckoutAddressesList(dispatch);
        }

        if (isCheckoutZipcodeError) {
          const isCheckoutAddressPage = window?.location?.pathname?.includes('/checkout/shipping-address');
          if (!isCheckoutAddressPage) {
            confirmHandler = () => checkoutHandlersMap.updateCheckoutZipcodeAndRedirectToCheckoutAddress(dispatch);
          }
        }

        if (needRefreshCheckoutPromotionCodes.includes(error.numberCode)) {
          confirmHandler = () => checkoutHandlersMap.forceRefreshCheckoutBaseInfo(dispatch);
          cancelHandler = () => checkoutHandlersMap.redirectToCart();
        }

        presenter.showTransactionError({
          code: error.code,
          message: error.message,
          ...(shouldRefreshCartOrRedirectToCart && checkoutPage ? { customConfirmTextTslKey: 'checkoutConfirm' } : {}),
          ...(shouldListItems && invalidLineItems.length > 0 ? { itemsList: invalidLineItems } : {}),
          ...(confirmHandler ? { onConfirm: confirmHandler } : {}),
          ...(cancelHandler ? { onCancel: cancelHandler } : {}),
          ...(beforeCloseHandler ? { beforeClose: beforeCloseHandler } : {}),
        });
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
