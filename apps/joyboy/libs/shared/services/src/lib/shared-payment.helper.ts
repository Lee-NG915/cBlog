import { createAsyncThunk } from '@reduxjs/toolkit';
import { EcEnv, basePageConfig } from '@castlery/config';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { PaymentMethodProviderEnum, initializePayment, confirmPayment } from '@castlery/modules-payment-domain';
import { createTransactionOrder } from '@castlery/modules-order-domain';
import type { IPaymentProcessingError, IPlaceOrderSuccess, IPlaceOrderError } from '@castlery/types';

const checkoutSuccessUrl = `${EcEnv.NEXT_PUBLIC_WEB_SERVER_NAME}/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${
  basePageConfig['checkout-success']
}`;

/**
 * Place order command
 * @description place order command
 * @param orderId - order id
 * @param orderNumber - order number
 * @param amount - amount
 * @param provider - provider
 * @param submitHandler - submit handler
 * @param confirmHandler - confirm handler
 * @returns order data
 */
interface PlaceOrderArgs {
  orderId: string;
  orderNumber: string;
  amount: string;
  provider: PaymentMethodProviderEnum;
  submitHandler?: () => Promise<boolean | IPaymentProcessingError>;
  confirmHandler?: (clientSecret: string, returnUrl: string) => Promise<boolean | IPaymentProcessingError>;
  /**
   * Called immediately after initializePayment succeeds, before confirm steps.
   * Use this to persist the paymentId so it can be cleaned up on the next attempt.
   */
  onPaymentInitiated?: (paymentId: string) => void;
}

export const placeOrderCommand = createAsyncThunk<
  IPlaceOrderSuccess,
  PlaceOrderArgs,
  { rejectValue: IPlaceOrderError }
>(
  'shared-payment/placeOrderBasedOnOrderIdCommand',
  async (
    { orderId, orderNumber, amount, provider, submitHandler, confirmHandler, onPaymentInitiated },
    { dispatch, rejectWithValue, fulfillWithValue }
  ) => {
    // Step 1: validate order data
    if (!orderId || !orderNumber || !amount || !provider) {
      return rejectWithValue({
        status: 'error',
        errorMessage: 'Invalid order data, please check the order data and try again',
      } satisfies IPlaceOrderError);
    }

    // Step 2: Submit to payment provider if needed
    if (submitHandler) {
      const result = (await submitHandler()) as IPaymentProcessingError | true;
      console.log('submit order data to payment provider response>>', result);
      if (result !== true) {
        return rejectWithValue({
          status: 'error',
          errorMessage: 'Payment validation failed',
          failureCode: result.code,
          failureInfo: result.message,
        } satisfies IPlaceOrderError);
      }
    }
    const realProvider =
      provider === PaymentMethodProviderEnum.STRIPE_LINK_PAY ? PaymentMethodProviderEnum.STRIPE_ONLINE : provider;
    // Step 3: Initialize payment via BE API
    const initRes = await dispatch(initializePayment.initiate({ orderNumber, amount, provider: realProvider }));
    if ('error' in initRes) {
      const rawError = initRes.error as any;
      const httpStatus: number | undefined = typeof rawError?.status === 'number' ? rawError.status : undefined;
      const error =
        initRes.error instanceof Error
          ? { failureCode: initRes.error.name, errorMessage: initRes.error.message }
          : { failureCode: 'initialize_payment_failed', errorMessage: JSON.stringify(initRes.error) };
      return rejectWithValue({ status: 'error', httpStatus, ...error } satisfies IPlaceOrderError);
    }
    const initResult = initRes?.data as any;
    const { paymentId, paymentResult } = initResult || {};

    // Notify caller as soon as payment record is created on backend,
    // so the paymentId can be stored for cleanup on the next attempt.
    if (paymentId) {
      onPaymentInitiated?.(paymentId);
    }

    const clientSecret = paymentResult?.stripeResult?.clientSecret;
    const returnUrl = `${checkoutSuccessUrl}?orderId=${orderId}`;

    if (!clientSecret) {
      return rejectWithValue({
        status: 'error',
        errorMessage: 'Client secret is not found, please try again',
      } satisfies IPlaceOrderError);
    }

    // Step 4: Confirm payment with 3rd party provider if needed
    if (confirmHandler) {
      const result = await confirmHandler(clientSecret, returnUrl);
      console.log('confirm payment to 3rd party payment provider response>>', result);
      if (result !== true) {
        const err = result as IPaymentProcessingError;
        return rejectWithValue({
          status: 'error',
          errorMessage: 'Payment confirmation failed',
          failureCode: err.code,
          failureInfo: err.message,
        } satisfies IPlaceOrderError);
      }
    }

    // Step 5: Confirm payment via BE API
    const confirmRes = await dispatch(
      confirmPayment.initiate({
        orderId,
        orderNumber,
        paymentId,
        provider: realProvider,
        amount: amount,
      })
    );
    if ('error' in confirmRes) {
      const rawConfirmError = confirmRes.error as any;
      const httpStatus: number | undefined =
        typeof rawConfirmError?.status === 'number' ? rawConfirmError.status : undefined;
      const errorMessage =
        confirmRes.error instanceof Error ? confirmRes.error.message : JSON.stringify(confirmRes.error);
      return rejectWithValue({ status: 'error', errorMessage, httpStatus } satisfies IPlaceOrderError);
    }
    return fulfillWithValue({ status: 'success', data: confirmRes.data } as IPlaceOrderSuccess);
  }
);

export const createTransactionOrderCommand = createAsyncThunk(
  'shared-payment/createTransactionOrderCommand',
  async (_, { dispatch, extra, rejectWithValue, fulfillWithValue }) => {
    const createRes = await dispatch(createTransactionOrder.initiate({}));
    if ('error' in createRes) {
      const error = createRes.error instanceof Error ? createRes.error.message : JSON.stringify(createRes.error);
      return rejectWithValue(error);
    }
    const { persistenceHandles } = extra as ExtraArgument;
    const checkoutToken = persistenceHandles.xCheckoutSessionToken.getItem();
    console.log('create transaction order response>>', createRes.data);
    const { orderId } = createRes.data;
    if (orderId) {
      persistenceHandles.webTransactionOrderId.setItem(orderId);
      const symbol = `${checkoutToken}-${orderId}`;
      persistenceHandles.webTransactionSymbol.setItem(symbol);
    }

    return fulfillWithValue(createRes.data);
  }
);
