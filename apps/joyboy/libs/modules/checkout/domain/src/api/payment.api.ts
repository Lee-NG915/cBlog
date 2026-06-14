import { api, tagTypes } from '@castlery/shared-redux-services';
import type { PayMethod, PaymentItem, UpdateOrderForStripeLinkPayRequest } from '../entity/payment.entity';
import type { prePayCheckApiPayload, AddPayMethodsApiPayload } from '../entity/api-payload.entity';
import type { Order, PaymentMethodConfigs_V2, PaymentModuleType_V2, APIResponseRoot_V2 } from '@castlery/types';

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PayMethod[], void>({
      query: () => ({
        url: `payment_methods`,
        method: 'GET',
      }),
    }),
    getPayments: builder.query<PaymentItem[], string>({
      query: (number) => ({
        url: `checkouts/${number}/payments`,
        method: 'GET',
      }),
    }),
    prePayCheck: builder.query<void, prePayCheckApiPayload>({
      query: ({ number }) => ({
        url: `checkouts/${number}/prepay_check`,
        method: 'POST',
      }),
    }),
    addPayMethod: builder.mutation<PaymentItem[], AddPayMethodsApiPayload>({
      query: ({ number, ...rest }) => ({
        url: `checkouts/${number}/payments`,
        method: 'POST',
        body: { ...rest },
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    removePayMethod: builder.mutation<PayMethod[], { number: string; id: number }>({
      query: ({ number, id }) => ({
        url: `checkouts/${number}/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    updateOrderForStripeLinkPay: builder.mutation<Order, UpdateOrderForStripeLinkPayRequest>({
      query: ({ number, ...rest }) => ({
        url: `checkouts/${number}`,
        method: 'PUT',
        body: { ...rest },
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    updateOrderForPay: builder.mutation<Order, UpdateOrderForStripeLinkPayRequest>({
      query: ({ number, ...rest }) => ({
        url: `checkouts/${number}`,
        method: 'PUT',
        body: { ...rest },
      }),
    }),
    sendStripePaymentLink: builder.mutation<Order, { number: string }>({
      query: ({ number }) => ({
        url: `checkouts/${number}/stripe_payment_link`,
        method: 'POST',
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    confirmPayments: builder.mutation<Order, { number: string }>({
      query: ({ number }) => ({
        url: `checkouts/${number}/confirm_payments`,
        method: 'PUT',
      }),
    }),
    getStripeClientSecret: builder.mutation<{ client_secret: string }, { number: string; amount: number }>({
      query: ({ number, amount }) => ({
        url: `checkouts/${number}/stripe_offline_intent`,
        method: 'POST',
        body: { amount },
      }),
    }),
    getStripeTerminalAffirmIntent: builder.mutation<
      { client_secret: string; payment_intent_id: string; status: string },
      { number: string; amount: number }
    >({
      query: ({ number, amount }) => ({
        url: `checkouts/${number}/stripe_terminal_affirm_intent`,
        method: 'POST',
        body: { amount },
      }),
    }),
    completePay: builder.mutation<Order, { number: string }>({
      query: ({ number }) => ({
        url: `checkouts/${number}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: [tagTypes.Order],
    }),
    sendQuotationEmail: builder.mutation<void, { number: string }>({
      query: ({ number }) => ({
        url: `checkouts/${number}/quotation_email`,
        method: 'POST',
      }),
    }),
  }),
});
export const {
  useGetPaymentMethodsQuery,
  useAddPayMethodMutation,
  useSendStripePaymentLinkMutation,
  useGetPaymentsQuery,
} = paymentApi;
export const {
  getPaymentMethods,
  prePayCheck,
  addPayMethod,
  sendStripePaymentLink,
  updateOrderForStripeLinkPay,
  getPayments,
  confirmPayments,
  updateOrderForPay,
  removePayMethod,
  getStripeClientSecret,
  getStripeTerminalAffirmIntent,
  completePay,
  sendQuotationEmail,
} = paymentApi.endpoints;
