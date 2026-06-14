import type { AppStartListening, RootState } from '@castlery/shared-redux-store';
import { Unsubscribe, isAnyOf } from '@reduxjs/toolkit';
import {
  confirmDelivery,
  setCustomerAddresses,
  checkoutUpdatedEvent,
  deliveryOptionUpdatedEvent,
  setDeliveryError,
  paymentCompleteEvent,
  deliveryUpdatedEvent,
  getShipmentOptions,
  orderAddressUpdatedEvent,
  addedPayMethodEvent,
  getPayments,
  setPayments,
  removedPayMethodEvent,
  orderProcessEndedEvent,
  getAvailableShipmentServices,
  getCheckoutAddressList,
  shippingMethodUpdatedEvent,
  getCheckoutInfo,
  // validateAddressForShippingAndUpdateEvent,
  validateAddressForShippingAndUpdate,
  updateCheckoutAddressZipcode,
  selectCheckoutAddressList,
  setAutoSelectedAddressId,
  checkoutShippingAddressSavedEvent,
} from '@castlery/modules-checkout-domain';

import {
  getOrderByOrderNumber,
  selectCurrentOrderNumber,
  checkoutRegistrationEvent,
} from '@castlery/modules-order-domain';
import {
  checkoutRemoveCouponFromCart,
  checkoutAddCouponToCart,
  checkoutCreditsRedeemedEvent,
} from '@castlery/modules-promotion-domain';
import { accessInPos, EcEnv } from '@castlery/config';
import {
  gotAddressByUidEvent,
  // customerAddressUpdatedEvent,
  // EnterAppEvent,
  // enterApp,
} from '@castlery/modules-user-domain';
// eslint-disable-next-line
import { EventsNames, DtManagerType } from '@castlery/data-tracking-events';
// eslint-disable-next-line
import { createANewPosOrder } from '@castlery/modules-order-services';
// eslint-disable-next-line
import { resetUserLocation } from '@castlery/modules-user-services';
import { ZipcodeSchema } from '@castlery/types';

export function setupCheckoutListeners(
  startListening: AppStartListening,
  { dt }: { modal: any; dt: DtManagerType }
): Unsubscribe {
  const subscriptions = [
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && [
      // 把 address 同步到 store
      // TODO  这一块是有问题的，如果接口获取完A，再获取B，最后获取A，此时获取A会走缓存，就不会触发这里的逻辑了
      // TODO 所以，关于接口的缓存，应该直接通过 api.selectors 来获取，而不是通过这里的逻辑
      startListening({
        matcher: gotAddressByUidEvent,
        effect: async ({ payload }, { dispatch }) => {
          await dispatch(setCustomerAddresses(payload));
        },
      }),
      /**
       * 订单地址更新后，重新确认订单
       */
      startListening({
        matcher: orderAddressUpdatedEvent,
        effect: async (action, { dispatch, getState }) => {
          const { country_state, city, zipcode } = action.payload;
          if (country_state && city && zipcode) {
            await dispatch(
              resetUserLocation({
                state: country_state,
                city,
                zipcode,
              })
            );
          }
          const rootState = getState() as RootState;
          try {
            const orderNumber = selectCurrentOrderNumber(rootState);
            if (!orderNumber) return;
            // TODO 后端优化，如果地址失败的话，订单状态就不能是payment,防止用户付款
            dispatch(setDeliveryError(false));
            await dispatch(confirmDelivery.initiate({ number: orderNumber })).unwrap();
          } catch (error) {
            dispatch(setDeliveryError(true));
          }
        },
      }),
      startListening({
        matcher: checkoutUpdatedEvent,
        effect: async (action, { dispatch, getState }) => {
          const orderNumber = selectCurrentOrderNumber(getState());
          if (orderNumber) {
            dispatch(getOrderByOrderNumber.initiate(orderNumber));
          }
        },
      }),
      startListening({
        matcher: deliveryOptionUpdatedEvent,
        effect: async (action, { dispatch, getState }) => {
          const orderNumber = selectCurrentOrderNumber(getState());
          if (orderNumber) {
            dispatch(confirmDelivery.initiate({ number: orderNumber })).unwrap();
          }
        },
      }),
      startListening({
        matcher: paymentCompleteEvent,
        effect: async (_, { getState }) => {
          const order = getState().order.order;
          const customer = getState().customer.customer;
          if (order) {
            dt.track(EventsNames.EVENT_TRANSACTION)({ order, customer });
          }
        },
      }),
      startListening({
        matcher: deliveryUpdatedEvent,
        effect: async (action, { dispatch, getState }) => {
          const number = selectCurrentOrderNumber(getState());
          if (number) {
            await dispatch(getAvailableShipmentServices.initiate(number, { forceRefetch: true }));
            await dispatch(
              getShipmentOptions.initiate(
                { number },
                {
                  forceRefetch: true,
                }
              )
            );
          }
        },
      }),
      startListening({
        matcher: isAnyOf(addedPayMethodEvent, removedPayMethodEvent, checkoutRegistrationEvent),
        effect: async (action, { dispatch, getState }) => {
          const orderNumber = selectCurrentOrderNumber(getState());
          if (orderNumber) {
            const res = await dispatch(getPayments.initiate(orderNumber, { forceRefetch: true }));
            res?.data && dispatch(setPayments(res.data));
          }
        },
      }),
      startListening({
        matcher: orderProcessEndedEvent,
        effect: async (action, { dispatch }) => {
          dispatch(createANewPosOrder());
        },
      }),
    ]) ||
      []),
    //=========================== web refactor ========================
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' && [
      startListening({
        matcher: isAnyOf(updateCheckoutAddressZipcode.matchFulfilled),
        effect: async (action, { dispatch, getState }) => {
          const rootState = getState() as RootState;
          const checkoutAddressList = selectCheckoutAddressList(rootState);

          if (checkoutAddressList.length === 0) {
            return;
          }

          // when update checkout address zipcode, need to auto select address
          if (updateCheckoutAddressZipcode.matchFulfilled(action)) {
            const zipcode = action.meta.arg?.originalArgs?.zipcode as ZipcodeSchema;

            if (zipcode) {
              const reverseAddressList = [...checkoutAddressList].reverse();
              const matchingAddress = reverseAddressList.find((address) => address.zipcode === zipcode);
              if (matchingAddress) {
                dispatch(setAutoSelectedAddressId(matchingAddress.id));
              }
            }
          }
        },
      }),
    ]) ||
      []),
    // ========================= shared with pos and web ========================
    startListening({
      type: checkoutShippingAddressSavedEvent.type,
      effect: async (action, { dispatch }) => {
        await dispatch(getCheckoutAddressList.initiate(undefined, { forceRefetch: true }));
      },
    }),
    startListening({
      matcher: isAnyOf(validateAddressForShippingAndUpdate.matchFulfilled, updateCheckoutAddressZipcode.matchFulfilled),
      effect: async (action, { dispatch }) => {
        await dispatch(
          getCheckoutInfo.initiate(
            { noCache: true, needsShippingMethod: accessInPos ? true : false },
            { forceRefetch: true }
          )
        );
      },
    }),
    startListening({
      matcher: shippingMethodUpdatedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(
          getCheckoutInfo.initiate(
            { noCache: false },
            {
              forceRefetch: true,
            }
          )
        );
      },
    }),
    startListening({
      matcher: isAnyOf(checkoutRemoveCouponFromCart.matchFulfilled, checkoutAddCouponToCart.matchFulfilled),
      effect: async (_, { dispatch }) => {
        await dispatch(getCheckoutInfo.initiate({ noCache: true }, { forceRefetch: true }));
      },
    }),
    startListening({
      actionCreator: checkoutCreditsRedeemedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(getCheckoutInfo.initiate({ noCache: true }, { forceRefetch: true }));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
