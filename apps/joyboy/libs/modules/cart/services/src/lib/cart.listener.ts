import { RootState, type AppStartListening } from '@castlery/shared-redux-store';
import { Unsubscribe, isAnyOf } from '@reduxjs/toolkit';
import { accessInWeb, accessInPos, enableZipCode, X_CART_TOKEN, X_SALES_ID } from '@castlery/config';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import {
  removedCartItemEvent,
  undoRemoveCartItemEvent,
  cartUpdatedEvent,
  mergedCartEvent,
  updateReloadCartLoading,
  // ============================ Events ================================
  posUpdatedDiscountEvent,
  posUpdatedServicePriceEvent,
  transferredCartLineItemsEvent,
  getWebCartLineItems,
  getCartData,
  refreshCartToken,
  updateShowRemoveUndoToast,
} from '@castlery/modules-cart-domain';
import { updatedCouponToCartEvent, cartCreditsRedeemedEvent } from '@castlery/modules-promotion-domain';
import {
  customerUpdatedEvent,
  selectedCurrentCustomer,
  userSliceUpdatedEvent,
  adminUpdateEvent,
  setCustomer,
  customerFromPosChannelCreatedEvent,
  selectedActiveUser,
  type Customer,
  EnterAppEvent,
} from '@castlery/modules-user-domain';
import { trackViewContent } from '@castlery/modules-tracking-domain';

// eslint-disable-next-line
import { setAutoOnlineCartSymbol } from '@castlery/modules-composite-services';
import { getYotpoPointsCommand, getYotpoRedeemOptionsCommand } from '@castlery/modules-promotion-services';
import {
  mergeCartCommand,
  refreshCartTokenInClientCommand,
  refreshCartCountCommand,
  syncPosZipcodeCommand,
} from './cart.helper';
import { logger } from '@castlery/observability';
import { trackOfflineAccountSignUp } from '@castlery/modules-tracking-services';
import { sharedFeatureService } from '@castlery/shared-services';

export function setupCartListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    ...(accessInWeb
      ? [
          startListening({
            actionCreator: EnterAppEvent,
            effect: async (_, { dispatch }) => {
              const res = await dispatch(refreshCartTokenInClientCommand());
              if (!(res as any)?.error) {
                await dispatch(refreshCartCountCommand());
              }
            },
          }),
          startListening({
            matcher: isAnyOf(userSliceUpdatedEvent),
            effect: async (action, { dispatch, cancelActiveListeners, delay }) => {
              if ('payload' in action && action['payload']) {
                // Cancel any pending listeners to avoid duplicate merge operations
                cancelActiveListeners();
                // Reduced delay since mergeCartCommand is now also called in login/signup flow
                // This listener serves as a fallback mechanism
                await delay(100);
                await dispatch(mergeCartCommand());
              }
            },
          }),
        ]
      : []),
    ...(accessInPos
      ? [
          startListening({
            matcher: adminUpdateEvent,
            effect: async (action, { dispatch, extra, getState }) => {
              // step1: 检查是否有customer，没有customer，则新建cart token
              const { persistenceHandles } = extra as ExtraArgument;
              const rootState = getState() as RootState;
              const posCartToken = persistenceHandles.xPosCartToken.getItem();
              let newPosCartToken = posCartToken;
              const customer = selectedCurrentCustomer(rootState);
              const adminId =
                typeof action.payload?.id === 'string' || typeof action.payload?.id === 'number'
                  ? String(action.payload.id)
                  : '';

              if (!posCartToken && !customer?.id) {
                const res = await dispatch(refreshCartToken.initiate(undefined, { forceRefetch: true }));
                if (res.data && typeof res.data.token === 'string') {
                  newPosCartToken = res.data.token;
                  persistenceHandles.xPosCartToken.setItem(newPosCartToken);
                }
              }
              // step2: 获取cart data
              if (newPosCartToken || customer?.id) {
                const requestHeaders: HeadersInit = {};

                // refreshCartToken 刚返回的新 token 直接透传给首个 line-items 请求，
                // 避免继续依赖“先写 cookie，再由 prepareHeaders 回读 cookie”这条链路，
                // 否则在登录页自动续跳场景下可能出现 token 已拿到但首个请求仍没带 X-Cart-Token。
                if (newPosCartToken) {
                  requestHeaders[X_CART_TOKEN] = newPosCartToken;
                }

                if (adminId && !sharedFeatureService.enabledPosUmsAuth) {
                  requestHeaders[X_SALES_ID] = adminId;
                }

                const cartRes = await dispatch(
                  getCartData.initiate(Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined, {
                    forceRefetch: true,
                  })
                );
                if (cartRes.error) {
                  return;
                }

                const currentCartZipcode = cartRes.data?.['zipcode'];
                if (enableZipCode && currentCartZipcode) {
                  dispatch(syncPosZipcodeCommand({ cartZipcode: currentCartZipcode, hasCustomer: !!customer?.id }));
                }
              }
            },
          }),
          startListening({
            actionCreator: customerUpdatedEvent,
            effect: async (action, { dispatch, extra, cancelActiveListeners, delay }) => {
              if (action['payload']) {
                cancelActiveListeners();
                await delay(500);
                const customer = action['payload'] as Customer;
                const { persistenceHandles } = extra as ExtraArgument;
                const posCartToken = persistenceHandles.xPosCartToken.getItem();
                const needMergeCart = posCartToken && customer?.id;
                // 1. 检查是否需要merge cart
                if (needMergeCart) {
                  // 避免监听器运行时序导致的，请求体统一携带的默认customerId为空，防御性设置customerId
                  persistenceHandles.customerId.setItem(customer?.id + '');
                  await dispatch(mergeCartCommand());
                } else {
                  await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
                }
                // 2. 获取online cart items
                await dispatch(getWebCartLineItems.initiate(undefined, { forceRefetch: true }));
                // 3. 获取 customer的 yotpo points and redeem options
                if (customer?.email) {
                  await dispatch(getYotpoPointsCommand(customer.email));
                  await dispatch(
                    getYotpoRedeemOptionsCommand({ customerEmail: customer.email, customerId: customer.id })
                  );
                }
              }
            },
          }),
          startListening({
            matcher: transferredCartLineItemsEvent,
            effect: async (action, { getState, dispatch }) => {
              // event model:
              // 1. set push to online 标记
              const rootState = getState() as RootState;
              const customerId = selectedCurrentCustomer(rootState)?.id;
              if (customerId) {
                await dispatch(setAutoOnlineCartSymbol({ id: customerId, hasOpen: true }));
              }
              // 2. get pos cart items
              await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
              // 3. get web cart items
              await dispatch(getWebCartLineItems.initiate(undefined, { forceRefetch: true }));
            },
          }),
          /**
           * note：在 POS 创建用户的时候，获取cart data和web cart items，并设置customer
           */
          startListening({
            matcher: customerFromPosChannelCreatedEvent,
            effect: async ({ payload }, { dispatch, extra }) => {
              const { persistenceHandles } = extra as ExtraArgument;
              const posCartToken = persistenceHandles.xPosCartToken.getItem();
              if (!posCartToken) {
                return;
              }
              try {
                dispatch(setCustomer(payload.user));
                await dispatch(trackViewContent());
                await dispatch(trackOfflineAccountSignUp());
              } catch (error) {
                logger.error('Failed to track offline account signup', { error });
              }
            },
          }),
        ]
      : []),
    startListening({
      matcher: isAnyOf(
        cartUpdatedEvent,
        updatedCouponToCartEvent,
        posUpdatedDiscountEvent,
        posUpdatedServicePriceEvent
      ),
      effect: async (action, { dispatch }) => {
        // 业务逻辑：获取新数据
        dispatch(updateReloadCartLoading(true));
        const res = await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
        dispatch(updateReloadCartLoading(false));

        if (removedCartItemEvent(action)) {
          dispatch(updateShowRemoveUndoToast(true));
        }
        if (undoRemoveCartItemEvent(action)) {
          dispatch(updateShowRemoveUndoToast(false));
        }

        if (accessInPos && mergedCartEvent(action)) {
          const currentCartZipcode = res.data?.['zipcode'];
          if (enableZipCode && currentCartZipcode) {
            dispatch(syncPosZipcodeCommand({ cartZipcode: currentCartZipcode, hasCustomer: true }));
          }
        }
        if (('error' in res && res.error) || !res.data) {
          // 防御性检查
          logger.error('Failed to get cart data in cart listener or res.data is empty', { error: res.error });
        }
      },
    }),
    startListening({
      actionCreator: cartCreditsRedeemedEvent,
      effect: async (_, { dispatch, getState }) => {
        await dispatch(getCartData.initiate(undefined, { forceRefetch: true }));
        const rootState = getState() as RootState;
        const customer = accessInWeb ? selectedActiveUser(rootState) : selectedCurrentCustomer(rootState);
        if (customer?.email && customer?.id) {
          await dispatch(getYotpoPointsCommand(customer.email));
          await dispatch(getYotpoRedeemOptionsCommand({ customerEmail: customer.email, customerId: customer.id }));
        }
      },
    }),
  ];
  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
