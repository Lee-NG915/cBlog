import { accessInPos, MarketCurrency, X_CHECKOUT_TOKEN } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { apiV1 } from '@castlery/shared-redux-services';
import type {
  APIResponseRoot_V2,
  PaymentConfigsResponseSchema,
  PosPaymentConfigsResponse,
  PosPaymentData,
  PosPaymentInitiatePayload,
} from '@castlery/types';

/**
 * 业务 code !== 0 时与 checkout-session / cart 等 API 保持一致：
 * 将整份 `{ code, msg, data, ... }` 序列化进 Error.message，
 * 便于 `setupApiErrorListeners` 内 `parseBizError` 解析出业务码与文案（含 POS payment initiate 等）。
 */
const transformResponseHandler = (response: APIResponseRoot_V2) => {
  if (response.code !== 0) {
    throw new Error(JSON.stringify(response));
  }
  return response.data;
};

export const payApi = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethodConfigs: builder.query<PaymentConfigsResponseSchema, void>({
      query: () => ({
        url: `/api/v1/payment/configs`,
        method: 'GET',
      }),
      transformResponse: transformResponseHandler,
    }),
    initializePayment: builder.mutation<
      void,
      {
        orderNumber: string;
        amount: string;
        provider: string;
        affirmConfig?: {
          cancelUrl: string;
          returnUrl: string;
          platform: 'web' | 'ios' | 'android';
        };
        grabPayConfig?: {};
      }
    >({
      query: ({ orderNumber, amount, provider, affirmConfig, grabPayConfig }) => ({
        url: '/api/v1/order/payment/initiate',
        method: 'PUT',
        body: {
          orderNumber,
          amount,
          currency: MarketCurrency,
          paymentConfig: {
            provider,
            ...(affirmConfig && { affirmConfig }),
            ...(grabPayConfig && { grabPayConfig }),
          },
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    deleteOrderPayment: builder.mutation<void, { orderId: string; paymentId: string }>({
      query: ({ orderId, paymentId }) => ({
        url: `/api/v1/order/payment`,
        method: 'DELETE',
        body: { orderId, paymentId },
      }),
      extraOptions: { maxRetries: 1 },
      transformResponse: transformResponseHandler,
    }),
    confirmPayment: builder.mutation<
      void,
      {
        orderNumber: string;
        orderId: string;
        paymentId: string;
        provider: string;
        amount?: string;
        idempotencyKey?: string; // uuid
        affirmData?: {
          checkoutId: string;
          authorizationId?: string;
          checkoutToken?: string;
        };
        grabPayData?: {
          grabTxID: string;
          partnerTxID: string;
        };
        paypalData?: {
          orderId: string;
          payerId?: string;
        };
        twoCTwoPData?: {
          paymentToken: string;
          transactionId: string;
          responseCode: string;
        };
      }
    >({
      query: ({
        orderId,
        orderNumber,
        paymentId,
        provider,
        idempotencyKey,
        affirmData,
        grabPayData,
        paypalData,
        twoCTwoPData,
        amount,
      }) => ({
        url: accessInPos ? '/api/v1/pos/order/payment/confirm' : '/api/v1/order/payment/confirm',
        method: 'PUT',
        body: {
          orderId: orderId,
          orderNumber: orderNumber,
          paymentId: paymentId,
          ...(idempotencyKey && { idempotencyKey }),
          ...(amount && { amount }),
          confirmData: {
            provider,
            ...(affirmData && { affirmData }),
            ...(grabPayData && { grabPayData }),
            ...(paypalData && { paypalData }),
            ...(twoCTwoPData && { twoCTwoPData }),
          },
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    // /api/v1/order/payment/reconcile
    // 通用支付确认后，调用此接口进行支付结果 reconciliations
    reconcilePayment: builder.mutation<
      {
        paid: boolean;
      },
      { orderId: string; stripeCheckoutSessionId?: string }
    >({
      query: ({ orderId, stripeCheckoutSessionId }) => ({
        url: `/api/v1/order/payment/reconcile`,
        method: 'PUT',
        body: { orderId, ...(stripeCheckoutSessionId && { stripeCheckoutSessionId }) },
      }),
      transformResponse: transformResponseHandler,
      extraOptions: { maxRetries: 0 },
    }),
    getPosPaymentMethodConfigs: builder.query<PosPaymentConfigsResponse, void>({
      query: () => ({
        url: `/api/v1/pos/payment/configs`,
        method: 'GET',
      }),
      transformResponse: transformResponseHandler,
      keepUnusedDataFor: 60 * 60 * 12,
    }),
    getPosOrderPayments: builder.query<PosPaymentData, { orderId: string }>({
      query: ({ orderId }) => ({
        url: `/api/v1/pos/order/payments`,
        method: 'GET',
        headers: {
          [X_CHECKOUT_TOKEN]: 'true',
        },
        params: {
          orderId: orderId,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    removePosOrderPayment: builder.mutation<void, { orderId: string; paymentId: string }>({
      query: ({ orderId, paymentId }) => ({
        url: `/api/v1/pos/order/payment`,
        method: 'DELETE',
        body: {
          orderId: orderId,
          paymentId: paymentId,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    addPosPaymentMethod: builder.mutation<
      {
        status: string;
        paymentId: string;
        [prop: string]: any;
      },
      PosPaymentInitiatePayload
    >({
      query: (payload) => ({
        url: `/api/v1/pos/order/payment/initiate`,
        method: 'PUT',
        body: {
          ...payload,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    confirmPosPayment: builder.mutation<
      void,
      {
        orderId: string;
        orderNumber: string;
        paymentId: string;
        idempotencyKey?: string;
        confirmData: {
          provider: string;
          [prop: string]: any;
        };
      }
    >({
      query: (params) => ({
        url: `/api/v1/pos/order/payment/confirm`,
        method: 'PUT',
        body: params,
      }),
      transformResponse: transformResponseHandler,
    }),
    completePosPayment: builder.mutation<void, { orderId: string }>({
      query: (params) => ({
        url: `/api/v1/pos/order/payment/finalize`,
        method: 'PUT',
        body: params,
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 重新发送 stripe payment link
     */
    resendStripePaymentLink: builder.mutation<
      void,
      {
        orderId: string;
        paymentId: string;
        customerEmail?: string;
      }
    >({
      query: (params) => ({
        url: `/api/v1/pos/order/payment/resend-stripe-link`,
        method: 'PUT',
        body: params,
      }),
      transformResponse: transformResponseHandler,
    }),
  }),
});
export const {
  useGetPaymentMethodConfigsQuery,
  useLazyGetPaymentMethodConfigsQuery,
  useInitializePaymentMutation,
  useConfirmPaymentMutation,
  useGetPosPaymentMethodConfigsQuery,
  useGetPosOrderPaymentsQuery,
  useRemovePosOrderPaymentMutation,
  useAddPosPaymentMethodMutation,
  useLazyGetPosOrderPaymentsQuery,
  useDeleteOrderPaymentMutation,
  useResendStripePaymentLinkMutation,
  useReconcilePaymentMutation,
} = payApi;
export const {
  getPaymentMethodConfigs,
  initializePayment,
  getPosPaymentMethodConfigs,
  getPosOrderPayments,
  removePosOrderPayment,
  addPosPaymentMethod,
  confirmPayment,
  confirmPosPayment,
  completePosPayment,
  deleteOrderPayment,
  resendStripePaymentLink,
  reconcilePayment,
} = payApi.endpoints;
