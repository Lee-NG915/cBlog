import { api, tagTypes } from '@castlery/shared-redux-services';
import type { Order } from '@castlery/types';
import type {
  ATCApiPayload,
  AdjustPriceApiPayload,
  ChangeItemQuantityApiPayload,
  RemoveLineItemApiPayload,
  OrderTransferApiPayload,
  ApplyCouponApiPayload,
} from '../entity/cart.entity';
import type { CouponItemV1 } from '../entity/coupon.entity';
import { EcEnv, POS_CHANNEL, WEB_CHANNEL, X_CHANNEL, X_CHECKOUT_TOKEN } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { FetchBaseQueryError, QueryReturnValue } from '@reduxjs/toolkit/query';
// import { AddressEntity } from '@castlery/modules-checkout-domain';

// Define a service using a base URL and expected endpoints
export const orderApi = api.injectEndpoints({
  // =================== 以下是新增的 ==========================
  endpoints: (builder) => {
    const changeItemQuantity = builder.mutation<Order, ChangeItemQuantityApiPayload>({
      query: ({ orderNumber, lineItemId, ...rest }) => ({
        url: `checkouts/${orderNumber}/line_items/${lineItemId}`,
        method: 'PUT',
        body: { ...rest },
      }),
      invalidatesTags: [tagTypes.Order],
    });
    return {
      createPosOrder: builder.mutation<
        Order,
        {
          sales_user_id: number;
          retail_id?: number;
        }
      >({
        query: ({ retail_id, sales_user_id }) => ({
          url: `checkouts`,
          method: 'POST',
          body: {
            retail_id,
            sales_user_id,
          },
        }),
      }),
      /**
       * @description create online order, just create an empty order for sales,not for customer,need bind customer to order later
       */
      createWebOrder: builder.mutation<Order, void>({
        query: () => ({
          url: `checkouts`,
          method: 'POST',
          headers: {
            [X_CHANNEL]: WEB_CHANNEL,
          },
        }),
        extraOptions: {
          maxRetries: 1 as any,
        },
      }),
      /**
       * @description get online order by user id
       * @param {string} userId User id of the user or 'me' for current user
       * @returns {Order}
       */
      getWebOrderByUid: builder.query<Order, number>({
        query: (userId) => ({
          url: `users/${userId}/current_order`,
          headers: {
            [X_CHANNEL]: WEB_CHANNEL,
          },
        }),
      }),
      getWebOrderByCustomer: builder.query<Order, void>({
        query: () => ({
          url: `users/me/current_order`,
          headers: {
            [X_CHANNEL]: WEB_CHANNEL,
          },
        }),
        extraOptions: {
          retryCondition: (error: any) => false,
        },
      }),
      getPosOrderByUid: builder.query<Order, number>({
        query: (userId) => ({
          url: `users/${userId}/current_order`,
          headers: {
            [X_CHANNEL]: POS_CHANNEL,
          },
        }),
      }),

      // TODO 这里暂时用来清理 address
      bindOrderToUser: builder.mutation<
        Order,
        {
          orderNumber: string;
          userId: number;
          billAddressId?: number;
          shipAddressId?: number;
        }
      >({
        query: ({ orderNumber, userId, billAddressId, shipAddressId }) => ({
          url: `checkouts/${orderNumber}`,
          method: 'PUT',
          body: {
            user_id: userId,
            bill_address_id: billAddressId,
            ship_address_id: shipAddressId,
          },
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      /**
       * @description get order by order number
       * @param {string} orderNumber
       * @returns {Order}
       */
      getOrderByOrderNumber: builder.query<Order, string>({
        query: (orderNumber) => `checkouts/${orderNumber}`,
        forceRefetch: () => true,
      }),
      getWebOrderByOrderNumber: builder.query<Order, any>({
        queryFn: async (arg, api, extraOptions, baseQuery) => {
          const { orderNumber, isNeedSpreeOrderHeader } = arg;
          const webOrderToken = makePersistenceHandles().webOrderToken.getItem();
          const result = await baseQuery({
            url: `checkouts/${orderNumber}`,
            method: 'GET',
            ...(isNeedSpreeOrderHeader && {
              headers: {
                'X-Spree-Order-Token': webOrderToken,
              },
            }),
          });
          if (result.data) {
            result.data = result.data as Order;
          }
          return result as QueryReturnValue<Order, FetchBaseQueryError, {} | undefined>;
        },
        forceRefetch: () => true,
        extraOptions: {
          maxRetries: 1 as any,
        },
      }),
      /**
       * @description add to order
       * @param {} payload
       * @returns {Order}
       */
      addToOrder: builder.mutation<Order, ATCApiPayload>({
        queryFn: async (arg, api, extraOptions, baseQuery) => {
          const { number, suppressDefaultErrorModal, suppressTracking, ...rest } = arg;
          const headers: { [key: string]: any } = {};
          if (EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL.toLocaleLowerCase()) {
            const webAccessToken = makePersistenceHandles().webAccessToken.getItem();
            if (!webAccessToken) {
              const webOrderToken = makePersistenceHandles().webOrderToken.getItem();
              if (webOrderToken) {
                headers['X-Spree-Order-Token'] = webOrderToken;
              }
            }
          }
          const result = await baseQuery({
            url: `checkouts/${number}/line_items`,
            method: 'POST',
            body: rest,
            headers,
          });
          if (result.data) {
            result.data = result.data as Order;
          }
          return result as QueryReturnValue<Order, FetchBaseQueryError, {} | undefined>;
        },
        invalidatesTags: [tagTypes.Order],
        extraOptions: {
          retryCondition: (error: any) => {
            return error.status >= 500;
          },
          maxRetries: 1 as any,
        },
      }),
      /**
       * @description remove line item from order
       * @param {string} orderNumber
       * @param {string} lineItemId
       * @returns {Order}
       */
      removeLineItem: builder.mutation<Order, RemoveLineItemApiPayload>({
        query: ({ orderNumber, lineItemId }) => ({
          url: `checkouts/${orderNumber}/line_items/${lineItemId}`,
          method: 'DELETE',
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      removeWebLineItem: builder.mutation<Order, RemoveLineItemApiPayload>({
        queryFn: async (arg, api, extraOptions, baseQuery) => {
          const { orderNumber, lineItemId } = arg;
          const headers: { [key: string]: any } = {};
          if (EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL.toLocaleLowerCase()) {
            const webAccessToken = makePersistenceHandles().webAccessToken.getItem();
            if (!webAccessToken) {
              const webOrderToken = makePersistenceHandles().webOrderToken.getItem();
              if (webOrderToken) {
                headers['X-Spree-Order-Token'] = webOrderToken;
              }
            }
          }
          const result = await baseQuery({
            url: `checkouts/${orderNumber}/line_items/${lineItemId}`,
            method: 'DELETE',
            headers,
          });
          if (result.data) {
            result.data = result.data as Order;
          }
          return result as QueryReturnValue<Order, FetchBaseQueryError, {} | undefined>;
        },
        invalidatesTags: [tagTypes.Order],
      }),
      /**
       * @description add line item to order
       * @param {string} orderNumber
       * @param {string} lineItemId
       * @returns {Order}
       */
      addItemQuantity: changeItemQuantity,
      /**
       * @description reduce line item to order
       * @param {string} orderNumber
       * @param {string} lineItemId
       * @returns {Order}
       */
      reduceItemQuantity: changeItemQuantity,
      /**
       * @description adjust line item price
       * @param {AdjustPriceApiPayload} { orderNumber, lineItemId, adjustment, type }
       * @returns {Order}
       */
      adjustLineItemPrice: builder.mutation<Order, AdjustPriceApiPayload>({
        query: ({ orderNumber, lineItemId, adjustment, type }) => ({
          url: `checkouts/${orderNumber}/line_items/${lineItemId}/adjust_price`,
          method: 'PUT',
          body: { adjustment, type },
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      overWriteServiceProductPrice: builder.mutation<Order, { price: number; lineItemId: number; number: string }>({
        query: ({ number, lineItemId, price }) => ({
          url: `checkouts/${number}/line_items/${lineItemId}/overwrite_price`,
          method: 'PUT',
          body: { price },
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      getGiftsByOrderNumberV1: builder.query<Order[], void>({
        query: (orderNumber) => `orders/${orderNumber}/promotions/gift`,
        providesTags: [tagTypes.Gift],
      }),

      orderItemsTransfer: builder.mutation<Order, OrderTransferApiPayload>({
        query: ({ number, itemIds }) => ({
          url: `orders/${number}/transfer`,
          method: 'PUT',
          body: {
            line_items: itemIds,
          },
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      /**
       * @description apply coupon to order
       * @param {string} number `order number`
       * @param {string} couponCode
       */
      applyCouponV1: builder.mutation<Order, ApplyCouponApiPayload>({
        query: ({ number, couponCode }) => ({
          url: `checkouts/${number}/coupon`,
          method: 'POST',
          body: {
            coupon_code: couponCode,
          },
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      removeCouponV1: builder.mutation<Order, { number: string; couponCode: string }>({
        query: ({ number, couponCode }) => ({
          url: `checkouts/${number}/coupon`,
          method: 'DELETE',
          body: {
            coupon_code: couponCode,
          },
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      getCouponsByOrderNumberV1: builder.query<CouponItemV1[], string>({
        query: (number) => ({
          url: `checkouts/${number}/coupons`,
        }),
        forceRefetch: () => true,
      }),
      checkoutRegistration: builder.mutation<Order, string>({
        query: (number) => ({
          url: `checkouts/${number}/registration`,
          method: 'PUT',
        }),
      }),
      refreshPrice: builder.mutation<Order, string>({
        query: (number) => ({
          url: `checkouts/${number}/price`,
          method: 'PUT',
        }),
        invalidatesTags: [tagTypes.Order],
      }),
      refreshCheckout: builder.mutation<Order, { order: string; city: string; state: string; zipcode: string }>({
        query: ({ order, ...rest }) => ({
          url: `checkouts/${order}`,
          method: 'PUT',
          body: { ...rest },
        }),
      }),
      mergeOrder: builder.mutation<
        Order,
        { orderNumber: string; orderId?: string; orderToken?: string; skipError?: boolean }
      >({
        query: ({ orderNumber, orderId, orderToken, skipError }) => ({
          url: `checkouts/${orderNumber}/merge`,
          method: 'PUT',
          body: {
            order_to_merge: orderId,
            order_token: orderToken,
            warning_message_delay: skipError || false,
          },
        }),
        extraOptions: {
          retryCondition: (error: any) => {
            return false;
          },
        },
      }),
      updateWebOrder: builder.mutation<Order, { number: string; zipcode: string; country_state: string; city: string }>(
        {
          queryFn: async (arg, api, extraOptions, baseQuery) => {
            const { number, ...rest } = arg;
            const headers: { [key: string]: any } = {};
            if (EcEnv.NEXT_PUBLIC_CHANNEL.toLowerCase() === WEB_CHANNEL.toLocaleLowerCase()) {
              const webAccessToken = makePersistenceHandles().webAccessToken.getItem();
              if (!webAccessToken) {
                const webOrderToken = makePersistenceHandles().webOrderToken.getItem();
                if (webOrderToken) {
                  headers['X-Spree-Order-Token'] = webOrderToken;
                }
              }
            }
            const result = await baseQuery({
              url: `checkouts/${number}`,
              method: 'PUT',
              body: { ...rest },
              headers,
            });
            if (result.data) {
              result.data = result.data as Order;
            }
            return result as QueryReturnValue<Order, FetchBaseQueryError, {} | undefined>;
          },
          invalidatesTags: [tagTypes.Order],
          extraOptions: {
            retryCondition: (error: any) => {
              return error.status >= 500;
            },
            maxRetries: 1 as any,
          },
        }
      ),
    };
  },
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = OrderApi;

// export endpoints for use in SSR
export const {
  createPosOrder,
  getWebOrderByUid,
  getWebOrderByCustomer,
  getOrderByOrderNumber,
  getWebOrderByOrderNumber,
  addToOrder,
  removeLineItem,
  addItemQuantity,
  reduceItemQuantity,
  adjustLineItemPrice,
  orderItemsTransfer,
  getGiftsByOrderNumberV1,
  applyCouponV1,
  getCouponsByOrderNumberV1,
  checkoutRegistration,
  bindOrderToUser,
  overWriteServiceProductPrice,
  removeCouponV1,
  createWebOrder,
  refreshPrice,
  getPosOrderByUid,
  refreshCheckout,
  mergeOrder,
  updateWebOrder,
  removeWebLineItem,
} = orderApi.endpoints;

export const getWebOrderByUidSelect = () => getWebOrderByUid.select();
