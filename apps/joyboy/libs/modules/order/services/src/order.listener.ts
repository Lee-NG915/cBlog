import type { AppStartListening, RootState } from '@castlery/shared-redux-store';
import { Unsubscribe, isAnyOf } from '@reduxjs/toolkit';
import {
  setOnlineOrder,
  orderUpdatedEvent,
  getOrderByOrderNumber,
  getOrderByOrderNumberEvent,
  setOrder,
  orderItemsTransferEvent,
  PosOrderCreatedEvent,
  addonServicesUpdatedEvent,
  setAddonServices,
  getWebOrderByUidEvent,
  webOrderCreatedEvent,
  selectCurrentOrderNumber,
  gotWebOrderByUidErrorEvent,
  addToOrder,
  addItemQuantity,
  bindOrderToUser,
  redeemYotpoCreditsSucceededEvent,
  mergeOrderSuccessEvent,
  mergeOrderErrorEvent,
  updateWebOrder,
  removeWebLineItem,
  selectOrder,
} from '@castlery/modules-order-domain';
import {
  addGiftsByOrderNumberEvent,
  applyCouponEvent as applyCouponEventV2,
  removeCouponEvent as removeCouponEventV2,
} from '@castlery/modules-promotion-domain';
import { fetchGiftsCommand } from '@castlery/shared-services';
import { EcEnv } from '@castlery/config';
import {
  customerUpdatedEvent,
  selectedCurrentCustomer,
  EnterAppEvent,
  customerFromPosChannelCreatedEvent,
  setCustomer,
  getAddressesByUserId,
} from '@castlery/modules-user-domain';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { changeWebOrderStatusCommand, createPosOrderForCurrentAdmin, getWebOrderByUidCommand } from './order.helper';
import { handleATC, trackViewContent } from '@castlery/modules-tracking-domain';
import { setCustomerAddresses } from '@castlery/modules-checkout-domain';
// eslint-disable-next-line
import { setAutoOnlineCartSymbol } from '@castlery/modules-composite-services';
import { logger, addBreadcrumb, captureStructuredError, isExpectedBusinessError, BUSINESS_DOMAIN, ErrorSeverity } from '@castlery/observability/client';
import { getYotpoPointsCommand, getYotpoRedeemOptionsCommand, refreshCouponsAndCredits } from './credits.helper';
import { refreshAndAutoApplyCoupon } from './coupon.helper';
import { EVENT_CART_ACTION, trackOfflineAccountSignUp } from '@castlery/modules-tracking-services';
import { pickLatest } from './utils';
import { Order } from '@castlery/types';
import { isTransientMergeOrderFailure } from './merge-order-error';

export function setupOrderListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' && [
      // startListening({
      //   actionCreator: initShoppingBagEvent,
      //   effect: async (action, { dispatch }) => {
      //     await dispatch(getWebOrderByUid.initiate());
      //   },
      // }),
      startListening({
        matcher: webOrderCreatedEvent,
        effect: async (action, { extra }) => {
          // const res = action?.['payload'] as any;
          // const data = 'error' in res ? null : res;
          // dispatch(setOrder(data));
          const { persistenceHandles } = extra as ExtraArgument;
          const webOrderNumber = action.payload.number;
          const webOrderToken = action.payload.guest_token;
          persistenceHandles.webOrderId.setItem(webOrderNumber);
          if (!persistenceHandles.webAccessToken.getItem()) {
            persistenceHandles.webOrderToken.setItem(webOrderToken);
          }
        },
      }),

      startListening({
        matcher: mergeOrderSuccessEvent,
        effect: async (action, { extra }) => {
          // const res = action?.['payload'] as any;
          // const data = 'error' in res ? null : res;
          const { persistenceHandles } = extra as ExtraArgument;
          const webOrderData = action?.payload;
          persistenceHandles.webOrderId.setItem(webOrderData?.number);
        },
      }),
      startListening({
        matcher: mergeOrderErrorEvent,
        effect: async (action, { extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const error: any = action.payload;

          if (isTransientMergeOrderFailure(error)) {
            logger.warn('Merge order failed due to a transient network error', { error });
            return;
          }

          persistenceHandles.webOrderId.removeItem();
          persistenceHandles.webOrderToken.removeItem();

          captureStructuredError(error || new Error('Merge order failed'), {
            // 过滤预期的业务错误（如订单已合并、冲突等）
            skipSentry: isExpectedBusinessError(error),
          });
        },
      }),
      startListening({
        actionCreator: EnterAppEvent,
        effect: async (_, { dispatch }) => {
          await dispatch(changeWebOrderStatusCommand());
        },
      }),
      startListening({
        matcher: addToOrder.matchFulfilled,
        effect: async (action, { getState, dispatch }) => {
          const rootState = getState() as RootState;
          // 1.获取当前order
          const originOrder = selectOrder(rootState);
          const currentOrder = action.payload;
          // 2.设置当前order
          await dispatch(setOrder(currentOrder));
          // 3. 跟踪add to cart事件
          // await dispatch(trackOnlineATC());
          const targetVariantId = action.meta.arg?.originalArgs?.variant_id?.toString();
          const targetItem = currentOrder?.line_items?.find?.(
            (item: any) => item.variant.id.toString() === targetVariantId
          );
          const quantityDifference = currentOrder.item_count - (originOrder?.item_count || 0);

          // read optional add to cart source from original arguments
          const atcSource = (action.meta?.arg as any)?.originalArgs?.source;
          // read optional add to cart position from original arguments
          const atcPosition = (action.meta?.arg as any)?.originalArgs?.position;
          const suppressTracking = (action.meta?.arg as any)?.originalArgs?.suppressTracking;

          if (targetItem) {
            // 记录加购成功
            addBreadcrumb({
              message: 'Item added to cart',
              data: {
                productId: targetItem?.variant?.product_id,
                variantId: targetItem?.variant?.id,
                quantity: quantityDifference,
                price: targetItem?.price,
              },
            });

            if (!suppressTracking) {
              await dispatch(
                EVENT_CART_ACTION({
                  actionType: 'add',
                  lineItem: targetItem,
                  quantityDifference,
                  ...(atcSource ? { atcSource: atcSource } : {}),
                  ...(atcPosition ? { atcPosition: atcPosition } : {}),
                })
              );
            }
          }
        },
      }),

      // 加购失败监控
      startListening({
        matcher: addToOrder.matchRejected,
        effect: (action) => {
          try {
            const error: any = action.payload;
            const variantId = action.meta.arg.originalArgs.variant_id;
            const quantity = action.meta.arg.originalArgs.quantity || 1;
            const errorMessage = error?.data?.errors?.[0]?.detail || error?.data?.error || 'Add to cart failed';

            // 1. 添加面包屑（无论是否上报 Sentry，都记录用户路径）
            addBreadcrumb({
              message: 'Add to cart failed',
              domain: BUSINESS_DOMAIN.CART,
              level: 'error',
              data: {
                variantId,
                quantity,
                status: error?.status,
                errorMessage,
              },
            });

            // 2. 捕获错误（过滤预期的业务错误）
            captureStructuredError(error, {
              domain: BUSINESS_DOMAIN.CART,
              extra: {
                step: 'add_to_cart',
                variantId,
                quantity,
                apiStatus: error?.status,
                errorMessage,
              },
              // 过滤预期的业务错误（如库存不足、商品已下架）
              skipSentry: isExpectedBusinessError(error),
            });
          } catch (error) {
            logger.error('Add to cart failed:', { error });
          }
        },
      }),
      // order history v1
      // 注意：addToOrder 是用户交互操作，错误捕获应该在组件层处理
      // 监听层不处理用户交互操作的错误，避免重复和时序问题

      // TODO web 后续 cart order 后续前端后端都重构，暂时先不使用读写分离，@abby @jasper
      // startListening({
      //   matcher: isAnyOf(orderUpdatedEvent),
      //   effect: async (action, listenerApi) => {
      //     const rootState = listenerApi.getState() as RootState;
      //     const { persistenceHandles } = listenerApi.extra as ExtraArgument;
      //     const prevOrder = selectOrder(rootState);
      //     const orderNumber = selectCurrentOrderNumber(listenerApi.getState());
      //     if (!orderNumber) return;
      //     // https://redux-toolkit.js.org/api/createListenerMiddleware#complex-async-workflows
      //     listenerApi.cancelActiveListeners();
      //     // Delay before starting actual work
      //     await listenerApi.delay(500);
      //     if (persistenceHandles.webAccessToken.getItem()) {
      //       await listenerApi.dispatch(
      //         getWebOrderByOrderNumber.initiate({
      //           orderNumber,
      //         })
      //       );
      //     } else {
      //       await listenerApi.dispatch(
      //         getWebOrderByOrderNumber.initiate({
      //           orderNumber,
      //           isNeedSpreeOrderHeader: true,
      //         })
      //       );
      //     }
      //     console.log('🚀 ~ file: order.listener.ts:140 ~ effect: ~ orderUpdatedEvent action:', action);
      //     console.log('🚀 ~ file: order.listener.ts:140 ~ effect: ~orderUpdatedEvent prevOrder:', prevOrder);
      //   },
      // }),
      startListening({
        matcher: updateWebOrder.matchFulfilled,
        effect: async ({ payload }, { dispatch, getState }) => {
          const result = payload;
          const order = selectOrder(getState());
          if (result && order) {
            dispatch(setOrder(pickLatest(order, result) as Order));
          }
        },
      }),
      startListening({
        matcher: removeWebLineItem.matchFulfilled,
        effect: async ({ payload }, { dispatch, getState }) => {
          const result = payload;
          const order = selectOrder(getState());
          if (result && order) {
            dispatch(setOrder(pickLatest(order, result) as Order));
          }
        },
      }),
      startListening({
        matcher: removeWebLineItem.matchFulfilled,
        effect: async ({ payload }, { dispatch, getState }) => {
          const result = payload;
          const order = selectOrder(getState());
          if (result && order) {
            dispatch(setOrder(pickLatest(order, result) as Order));
          }
        },
      }),
    ]) ||
      []),
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && [
      startListening({
        matcher: addonServicesUpdatedEvent,
        effect: (action, { dispatch }) => {
          dispatch(setAddonServices(action.payload));
        },
      }),
      /**
       * @description query the online order of the user when user
       * @scenario1 监听customerUpdatedEvent
       * @scenario2 监听order transfer
       */
      startListening({
        matcher: isAnyOf(customerUpdatedEvent, orderItemsTransferEvent),
        effect: async (action, { dispatch, getState }) => {
          const rootState = getState() as RootState;
          const customerId = selectedCurrentCustomer(rootState)?.id;
          if (customerId) {
            // @ts-ignore
            if (action?.meta?.arg?.endpointName === 'orderItemsTransfer') {
              await dispatch(setAutoOnlineCartSymbol({ id: customerId, hasOpen: true }));
            }
            await dispatch(getWebOrderByUidCommand({ forceRefetch: true }));
          }
        },
      }),
      /**
       * @description set online order when getWebOrderByUidEvent fulfilled
       */
      startListening({
        matcher: isAnyOf(getWebOrderByUidEvent, webOrderCreatedEvent, gotWebOrderByUidErrorEvent),
        effect: async (action, { dispatch }) => {
          const res = action?.['payload'] as any;
          const data = 'error' in res ? null : res;
          dispatch(setOnlineOrder(data));
        },
      }),
      /**
       * @description query the order by order number when user add to order, remove line item, change item quantity, adjust line item price
       */
      startListening({
        matcher: isAnyOf(orderUpdatedEvent, applyCouponEventV2, removeCouponEventV2),
        effect: async (action, listenerApi) => {
          const orderNumber = selectCurrentOrderNumber(listenerApi.getState());
          if (!orderNumber) return;
          // https://redux-toolkit.js.org/api/createListenerMiddleware#complex-async-workflows
          listenerApi.cancelActiveListeners();
          // Delay before starting actual work
          await listenerApi.delay(500);
          await listenerApi.dispatch(getOrderByOrderNumber.initiate(orderNumber));
          await listenerApi.dispatch(refreshAndAutoApplyCoupon());
        },
      }),
      startListening({
        matcher: addToOrder.matchFulfilled,
        effect: async ({ payload }, { dispatch }) => {
          await dispatch(
            handleATC({
              order: payload,
            })
          );
        },
      }),
      startListening({
        matcher: addItemQuantity.matchFulfilled,
        effect: async ({ payload }, { dispatch }) => {
          await dispatch(
            handleATC({
              order: payload,
            })
          );
        },
      }),
      /**
       * @description set order when getOrderByOrderNumberEvent fulfilled
       */
      startListening({
        matcher: getOrderByOrderNumberEvent,
        effect: ({ payload }, { dispatch }) => {
          dispatch(
            fetchGiftsCommand({
              couponCode: payload.coupon?.code,
            })
          );
          dispatch(setOrder(payload));
        },
      }),
      /**
       * @description refresh order when addGiftsByOrderNumber fulfilled
       */
      startListening({
        matcher: addGiftsByOrderNumberEvent,
        effect: (action, { dispatch, getState }) => {
          const orderNumber = selectCurrentOrderNumber(getState());
          if (!orderNumber) return;
          dispatch(getOrderByOrderNumber.initiate(orderNumber));
        },
      }),
      /**
       * 进入 APP 的时候 从 sessionStorage 中获取 OrderNumber
       * 如果没有 OrderNumber 就创建一个新的 POS 订单
       */
      startListening({
        actionCreator: EnterAppEvent,
        effect: async (_, { dispatch, extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          let orderNumber = persistenceHandles.orderNumber.getItem() || undefined;
          // 如果没有 OrderNumber 就创建一个新的 POS 订单
          if (!orderNumber) {
            const res = await dispatch(createPosOrderForCurrentAdmin({}));
            if ('error' in res) {
              throw new Error(' ~ file: order.listener.ts:139 , create order failed');
            }
            orderNumber = res?.payload?.number;
          }
          if (!orderNumber) {
            throw new Error(' ~ file: order.listener.ts:148 , create order failed');
          }
          // 如果有 OrderNumber 就获取订单信息.   : 看起来在 getOrderByOrderNumberEvent 中已经设置了 setOrder
          // const { data } = await dispatch(getOrderByOrderNumber.initiate(orderNumber));

          // if (data) {
          //   await dispatch(setOrder(data));
          // }
          // 使用 Promise.all 并行处理请求
          if (orderNumber) {
            Promise.all([dispatch(getOrderByOrderNumber.initiate(orderNumber))]);
          }
        },
      }),

      // 创建新的POS订单的时候把 OrderNumber 存到 localStorage
      startListening({
        matcher: PosOrderCreatedEvent,
        effect: (action, { extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const orderNumber = action.payload.number;
          persistenceHandles.orderNumber.setItem(orderNumber);
        },
      }),

      startListening({
        actionCreator: customerUpdatedEvent,
        effect: async (action, { dispatch, extra, getState }) => {
          const rootState = getState() as RootState;
          const { persistenceHandles } = extra as ExtraArgument;
          const orderNumber = persistenceHandles.orderNumber.getItem();
          if (!orderNumber) return;
          const userId = action.payload?.id;
          const userEmail = action.payload?.email;
          if (!orderNumber || !userId) {
            logger.error('Order number or user ID is missing', { orderNumber, userId });
            return;
          }
          await dispatch(bindOrderToUser.initiate({ orderNumber, userId }));
          if (userEmail && userId) {
            await dispatch(getYotpoPointsCommand(userEmail));
            await dispatch(getYotpoRedeemOptionsCommand({ customerEmail: userEmail, customerId: userId }));
          }
          await dispatch(getAddressesByUserId.initiate(userId));
          try {
            // TODO 后续再思考统一吧
            const { data } = getAddressesByUserId.select(userId)(rootState);
            if (!data) return;
            dispatch(setCustomerAddresses(data));
          } catch (error) {
            logger.error('Failed to set customer addresses', { error });
          }
        },
      }),
      /**
       * note：在 POS 创建用户的时候不创建订单，否则会给线上订单默认绑定销售
       */
      startListening({
        matcher: customerFromPosChannelCreatedEvent,
        effect: async ({ payload }, { dispatch }) => {
          try {
            dispatch(setCustomer(payload.user));
            await dispatch(trackViewContent());
            await dispatch(trackOfflineAccountSignUp());
          } catch (error) {
            logger.error('Failed to track offline account signup', { error });
          }
        },
      }),
      startListening({
        matcher: redeemYotpoCreditsSucceededEvent,
        effect: async (_, { ...controls }) => {
          await refreshCouponsAndCredits(controls);
        },
      }),
    ]) ||
      []),
  ];
  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
