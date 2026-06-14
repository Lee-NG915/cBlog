import { EcEnv } from '@castlery/config';
import type { AppStartListening, RootState } from '@castlery/shared-redux-store';
import { Unsubscribe } from '@reduxjs/toolkit';
import {
  formatErrorMessage,
  checkoutProcessFailedEvent,
  refreshOrderAfterErrorEventNames,
  webProcessFailedEvent,
} from './error.helper';
import { getOrderByOrderNumber, selectCurrentOrderNumber } from '@castlery/modules-order-domain';
import { resetSelectedOfferId } from '@castlery/modules-product-domain';
import { EnterAppEvent, initDefaultZipcode, noticeCityInfoUpdated } from '@castlery/modules-user-domain';
import { enableZipCode, accessInPos, accessInWeb } from '@castlery/config';
import { refreshCartTokenInClientCommand, refreshCartCountCommand } from '@castlery/modules-cart-services';
import { updateZipcodeInCart, selectCartZipcode } from '@castlery/modules-cart-domain';

export function setupCompositesListeners(startListening: AppStartListening, { modal }: { modal: any }): Unsubscribe {
  const subscriptions = [
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && [
      startListening({
        matcher: checkoutProcessFailedEvent,
        effect: async (action, { dispatch, getState }) => {
          const message = formatErrorMessage(action);

          modal.warning({
            title: 'Oops!',
            subDesc: message,
            showCancelBtn: false,
            confirmText: 'Got it!',
            dialogSx: {
              width: 400,
            },
          });
          const { endpointName } = action.meta.arg;
          if (endpointName === 'addToOrder') {
            dispatch(resetSelectedOfferId());
          }
          if (refreshOrderAfterErrorEventNames.includes(endpointName)) {
            const orderNumber = selectCurrentOrderNumber(getState());
            orderNumber && (await dispatch(getOrderByOrderNumber.initiate(orderNumber)));
          }
        },
      }),
    ]) ||
      []),
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' && [
      startListening({
        matcher: webProcessFailedEvent,
        effect: async (action, { dispatch, getState }) => {
          const message = formatErrorMessage(action);
          const { endpointName, originalArgs } = action.meta.arg;
          if (
            endpointName === 'addToOrder' ||
            endpointName === 'updateWebOrder' ||
            endpointName === 'addLineItemToCart'
          ) {
            if (originalArgs?.suppressDefaultErrorModal) return;
            if (message.includes('maximum swatches in one order is 3')) {
              modal.warning({
                title: 'You’ve reached the maximum quantity',
                subDesc: 'You can add up to 3 free swatches to your cart.',
                showCancelBtn: false,
                confirmText: 'got it',
                dialogSx: {
                  textAlign: 'center',
                },
              });
            } else {
              modal.warning({
                title: 'Unable to add item to cart',
                subDesc: 'Something went wrong. Please try again later.',
                showCancelBtn: false,
                confirmText: 'CLOSE',
                dialogSx: {
                  textAlign: 'center',
                },
              });
            }

            return;
          }
        },
      }),
    ]) ||
      []),
    // ==================  Shared listeners ： as global listeners ==================

    startListening({
      actionCreator: EnterAppEvent,
      effect: async (action, { dispatch, getState, cancelActiveListeners, delay }) => {
        // 逻辑存在时序依赖，请谨慎修改
        if (accessInPos) {
          if (enableZipCode) {
            const res = await dispatch(initDefaultZipcode());
            dispatch(noticeCityInfoUpdated(res.payload));
          }
          return;
        }

        if (accessInWeb) {
          let zipcodeObj = null;

          if (enableZipCode) {
            const res = await dispatch(initDefaultZipcode());
            zipcodeObj = res.payload;
          }
          const cartTokenRes = await dispatch(refreshCartTokenInClientCommand());
          if (!(cartTokenRes as any)?.error) {
            await dispatch(refreshCartCountCommand());
            const isInCheckoutPage = window?.location?.pathname?.includes('/checkout');
            if (isInCheckoutPage) {
              return;
            }
            if (zipcodeObj) {
              cancelActiveListeners();
              await delay(500);
              const rootState = getState() as RootState;
              const currentCartZipcode = selectCartZipcode(rootState);
              if (currentCartZipcode?.zipcode !== zipcodeObj.zipcode) {
                dispatch(
                  updateZipcodeInCart.initiate({
                    zipcode: zipcodeObj.zipcode,
                    countryState: zipcodeObj.state,
                    city: zipcodeObj.city,
                  })
                );
              }
            }
          }

          return;
        }
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
