import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { PayloadAction, EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import { type AddressEntity } from '../entity/address.entity';
import { CheckoutStep } from '../entity/checkout.entity';
import type { PaymentItem } from '../entity/payment.entity';
import { type AdditionalShippingService } from '../entity/service.entity';
import { CheckoutAddressEntity_V2 } from '@castlery/types';
import { getCheckoutAddressList } from '../api/address.api';

export const CHECKOUT_FEATURE_KEY = 'checkout';

export const checkoutAdapter = createEntityAdapter<any>({});
export interface CheckoutState extends EntityState<any, number> {
  checkoutLoading: boolean;
  addressLoading: boolean;
  deliveryLoading: boolean;
  customerAddresses: AddressEntity[];
  checkoutStep: keyof typeof CheckoutStep;
  tradePartnerId: string;
  orderComment: string;
  exchangeOrderNumber: string;
  assemblyPreferences: string[];
  deliveryError: boolean;
  payments: PaymentItem[];
  availableShipmentServices: AdditionalShippingService[];
  //========== checkout session state ============
  checkoutAddressList: CheckoutAddressEntity_V2[];
}
export const initialCheckoutState: CheckoutState = checkoutAdapter.getInitialState({
  checkoutLoading: false,
  addressLoading: false,
  deliveryLoading: false,
  customerAddresses: [],
  checkoutStep: CheckoutStep.SHIPPING_ADDRESS,
  // ============ user interaction state ==============
  tradePartnerId: '',
  orderComment: '',
  exchangeOrderNumber: '',
  assemblyPreferences: ['free_assembly'],
  deliveryError: false,
  payments: [],
  availableShipmentServices: [],
  //========== checkout session state ============
  checkoutAddressList: [],
});

export const checkoutSlice = createSliceWithThunks({
  name: CHECKOUT_FEATURE_KEY,
  initialState: initialCheckoutState,
  reducers: (create) => ({
    setCustomerAddresses: create.reducer((state, { payload }: PayloadAction<AddressEntity[]>) => {
      state.customerAddresses = payload;
    }),
    setCheckoutStep: create.reducer((state, { payload }: PayloadAction<keyof typeof CheckoutStep>) => {
      state.checkoutStep = payload;
    }),
    setTradePartnerId: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.tradePartnerId = payload;
    }),
    setOrderComment: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.orderComment = payload;
    }),
    setExchangeOrderNumber: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.exchangeOrderNumber = payload;
    }),
    setAssemblyPreferences: create.reducer((state, { payload }: PayloadAction<string[]>) => {
      state.assemblyPreferences = payload;
    }),
    setDeliveryError: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.deliveryError = payload;
    }),
    setPayments: create.reducer((state, { payload }: PayloadAction<PaymentItem[]>) => {
      const arr = Array.isArray(payload)
        ? payload?.map((payment) => {
            const { payment_method, offline_payment_source } = payment;
            const { payment_type, masked_pan, card_brand } = offline_payment_source || {};
            if (payment_type === 'Stripe') {
              return {
                ...payment,
                label: masked_pan
                  ? card_brand?.toUpperCase() + ' ' + masked_pan.slice(-4)?.padStart(8, '●')
                  : card_brand,
              };
            }
            const { name, payment_types } = payment_method || {};
            const type = Array.isArray(payment_types) && payment_types.length > 1 ? payment_type : '';
            return {
              ...payment,
              label: `${name || ''}${type ? '(' + type + ')' : ''}`,
            };
          })
        : [];
      state.payments = arr;
    }),
    setAvailableShipmentServices: create.reducer((state, { payload }: PayloadAction<AdditionalShippingService[]>) => {
      state.availableShipmentServices = payload;
    }),
    setCheckoutAddressList: create.reducer((state, { payload }: PayloadAction<CheckoutAddressEntity_V2[]>) => {
      console.log('setCheckoutAddressList', payload);
      state.checkoutAddressList = Array.isArray(payload) ? payload : [];
    }),
    setCheckoutAddressesId: create.reducer(
      (
        state
        // {
        //   payload,
        // }: PayloadAction<{
        //   billingAddressId?: number;
        //   shippingAddressId?: number;
        // }>
      ) => {
        return state;
      }
    ),
  }),
  extraReducers(builder) {
    builder
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'changeAddress';
          return isRightApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.addressLoading = false;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'changeAddress';
          return isRightApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.addressLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = ['confirmDelivery', 'changeDeliveryOption'].includes(action.meta?.arg?.endpointName);
          return isRightApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.deliveryLoading = false;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = ['confirmDelivery', 'changeDeliveryOption'].includes(action.meta?.arg?.endpointName);
          return isRightApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.deliveryLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'checkoutRegistration';
          return isRightApi && action.type.endsWith('/pending');
        },
        (state) => {
          state.checkoutLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          const isRightApi = action.meta?.arg?.endpointName === 'checkoutRegistration';
          return isRightApi && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'));
        },
        (state) => {
          state.checkoutLoading = false;
        }
      )
      .addMatcher(
        (action) => getCheckoutAddressList.matchFulfilled(action),
        (state, { payload }) => {
          state.checkoutAddressList = Array.isArray(payload.data) ? payload.data : [];
        }
      )
      .addDefaultCase((state) => state);
  },
  selectors: {
    selectCheckoutLoading: (state) => state.checkoutLoading,
    selectAddressLoading: (state) => state.addressLoading,
    selectDeliveryLoading: (state) => state.deliveryLoading,
    selectCustomerAddresses: (state) => state.customerAddresses,
    selectDeliveryError: (state) => state.deliveryError,
    selectPayments: (state) => state.payments,
    selectAvailableShipmentServices: (state) => state.availableShipmentServices,
    selectOrderComment: (state) => state.orderComment,
    selectExchangeOrderNumber: (state) => state.exchangeOrderNumber,
    selectCheckoutAddressList: (state) => state.checkoutAddressList || [],
  },
});

export const {
  setCustomerAddresses,
  setCheckoutStep,
  setTradePartnerId,
  setOrderComment,
  setExchangeOrderNumber,
  setAssemblyPreferences,
  setDeliveryError,
  setPayments,
  setAvailableShipmentServices,
  setCheckoutAddressList,
  setCheckoutAddressesId,
} = checkoutSlice.actions;

export const {
  selectCustomerAddresses,
  selectCheckoutLoading,
  selectAddressLoading,
  selectDeliveryLoading,
  selectDeliveryError,
  selectPayments,
  selectAvailableShipmentServices,
  selectOrderComment,
  selectExchangeOrderNumber,
  selectCheckoutAddressList,
} = checkoutSlice.selectors;
