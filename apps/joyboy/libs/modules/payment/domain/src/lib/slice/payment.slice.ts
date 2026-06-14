import { createSliceWithThunks } from '@castlery/shared-redux-core';
// import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  PaymentMethodConfigs_V2,
  PosPaymentConfigsResponse,
  OrderPaymentV1,
  ProviderConfigSchema,
} from '@castlery/types';
import { getPaymentMethodConfigs, getPosPaymentMethodConfigs, getPosOrderPayments } from '../api/payment.api';

export const PAY_FEATURE_KEY = 'pay';

export interface PayState {
  paymentMethodsSettings: PaymentMethodConfigs_V2 | null;
  posPaymentMethodsSettings: PosPaymentConfigsResponse | null;
  paymentMethodConfigs: ProviderConfigSchema[];
  posOrderPaymentsInfo: OrderPaymentV1[];
  posOrderPaymentsLoading: boolean;
}

export const initialPayState: PayState = {
  paymentMethodsSettings: null,
  paymentMethodConfigs: [],
  posPaymentMethodsSettings: null,
  posOrderPaymentsInfo: [],
  posOrderPaymentsLoading: false,
};

export const paySlice = createSliceWithThunks({
  name: PAY_FEATURE_KEY,
  initialState: initialPayState,
  reducers: (create) => ({
    clearPosOrderPayments: create.reducer((state) => {
      state.posOrderPaymentsInfo = [];
      state.posOrderPaymentsLoading = false;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => getPaymentMethodConfigs.matchFulfilled(action),
        (state, { payload }) => {
          state.paymentMethodConfigs = payload.configs || [];
        }
      )
      .addMatcher(
        (action) => getPosPaymentMethodConfigs.matchFulfilled(action),
        (state, { payload }) => {
          state.posPaymentMethodsSettings = payload;
        }
      )
      .addMatcher(
        (action) => getPosOrderPayments.matchFulfilled(action),
        (state, { payload }) => {
          state.posOrderPaymentsInfo = payload.payments || [];
          state.posOrderPaymentsLoading = false;
        }
      )
      .addMatcher(
        (action) => getPosOrderPayments.matchPending(action),
        (state) => {
          state.posOrderPaymentsLoading = true;
        }
      )
      .addDefaultCase((state) => state);
  },
  selectors: {
    selectPaymentMethodsSettings: (state) => state.paymentMethodsSettings,
    selectStripePublicKey: (state) => state.paymentMethodsSettings?.stripePublicKey?.publicApiKey,
    selectAffirmPublicKey: (state) => state.paymentMethodsSettings?.affirmPublicKey?.publicApiKey,
    selectPaypalPublicKey: (state) => state.paymentMethodsSettings?.paypalPublicKey?.publicApiKey,
    selectInstalmentOptions: (state) => state.paymentMethodsSettings?.instalmentOptions?.ippOptions,
    selectStripeTerminalConnectionToken: (state) => state.paymentMethodsSettings?.stripeTerminalConnectionToken?.secret,
    selectPosPaymentMethodsSettings: (state) => state.posPaymentMethodsSettings,
    selectPaymentMethodConfigs: (state) => state.paymentMethodConfigs,
    selectPosOrderPaymentsInfo: (state) => state.posOrderPaymentsInfo,
    selectPosOrderPaymentsLoading: (state) => state.posOrderPaymentsLoading,
  },
});

export const { clearPosOrderPayments } = paySlice.actions;
export const {
  selectPaymentMethodsSettings,
  selectStripePublicKey,
  selectAffirmPublicKey,
  selectPaypalPublicKey,
  selectInstalmentOptions,
  selectStripeTerminalConnectionToken,
  selectPosPaymentMethodsSettings,
  selectPaymentMethodConfigs,
  selectPosOrderPaymentsInfo,
  selectPosOrderPaymentsLoading,
} = paySlice.selectors;
