import { createSliceWithThunks } from '@castlery/shared-redux-core';
import {
  getCheckoutInfo,
  updateCheckoutShippingMethod,
  getOrderCheckoutDetail,
  updateCheckoutAddressZipcode,
} from '../api/checkout-session.api';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  LineItemSchema,
  CheckoutSessionInfoSchema,
  DeliveryServiceTypeEnum,
  DeliveryServiceItemSchema,
  AddOnServiceLineItemSchema,
} from '@castlery/types';

export const CHECKOUT_SESSION_FEATURE_KEY = 'checkoutSession';

export type CheckoutDataSource = 'orderCheckout' | 'checkoutSession' | null;

export interface CheckoutSessionState {
  localDeliveryRequests: string;
  updateShippingMethodLoading: boolean;
  checkoutRoot: CheckoutSessionInfoSchema | null;
  fetchCheckoutDataLoading: boolean;
  /** 记录 checkoutRoot 数据来源：orderCheckout 来自 getOrderCheckoutDetail，checkoutSession 来自 getCheckoutInfo */
  checkoutDataSource: CheckoutDataSource;
  updateCheckoutZipcodeLoading: boolean;
  couponLoading: boolean;
  //默认选中的地址ID
  autoSelectedAddressId: number;
  posCheckoutExchangeOrderNumber: string;
  posCheckoutExchangeOrderChecked: boolean;
  posCheckoutSubmitAttempted: boolean;
  posCheckoutTradePartnerId: string;
  posCheckoutOrderComment: string;
}

export const initialCheckoutSessionState: CheckoutSessionState = {
  localDeliveryRequests: '',
  updateShippingMethodLoading: false,
  checkoutRoot: null,
  // ================== For Checkout Info ==================
  fetchCheckoutDataLoading: false,
  checkoutDataSource: null,
  autoSelectedAddressId: 0,
  updateCheckoutZipcodeLoading: false,
  couponLoading: false,
  // For Pos Checkout
  posCheckoutExchangeOrderNumber: '',
  posCheckoutExchangeOrderChecked: false,
  posCheckoutSubmitAttempted: false,
  posCheckoutTradePartnerId: '',
  posCheckoutOrderComment: '',
};

export const checkoutSessionSlice = createSliceWithThunks({
  name: CHECKOUT_SESSION_FEATURE_KEY,
  initialState: initialCheckoutSessionState,
  reducers: (create) => ({
    setLocalDeliveryRequests: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.localDeliveryRequests = payload;
    }),
    setAutoSelectedAddressId: create.reducer((state, { payload }: PayloadAction<number>) => {
      state.autoSelectedAddressId = payload;
    }),
    setPosCheckoutExchangeOrderNumber: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.posCheckoutExchangeOrderNumber = payload;
    }),
    setPosCheckoutExchangeOrderChecked: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.posCheckoutExchangeOrderChecked = payload;
    }),
    setPosCheckoutSubmitAttempted: create.reducer((state, { payload }: PayloadAction<boolean>) => {
      state.posCheckoutSubmitAttempted = payload;
    }),
    setPosCheckoutTradePartnerId: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.posCheckoutTradePartnerId = payload;
    }),
    setPosCheckoutOrderComment: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.posCheckoutOrderComment = payload;
    }),
  }),
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => getCheckoutInfo.matchPending(action),
      (state) => {
        state.fetchCheckoutDataLoading = true;
      }
    );
    builder
      .addMatcher(
        (action) => getCheckoutInfo.matchFulfilled(action),
        (state, { payload }) => {
          state.checkoutRoot = payload;
          state.checkoutDataSource = 'checkoutSession';
          state.fetchCheckoutDataLoading = false;
          state.updateShippingMethodLoading = false;
          state.updateCheckoutZipcodeLoading = false;
        }
      )

      .addMatcher(
        (action) => getCheckoutInfo.matchRejected(action),
        (state) => {
          state.fetchCheckoutDataLoading = false;
          state.updateCheckoutZipcodeLoading = false;
        }
      )
      .addMatcher(
        (action) => updateCheckoutShippingMethod.matchPending(action),
        (state) => {
          state.updateShippingMethodLoading = true;
        }
      )
      .addMatcher(
        (action) =>
          updateCheckoutShippingMethod.matchRejected(action) || updateCheckoutShippingMethod.matchFulfilled(action),
        (state) => {
          state.updateShippingMethodLoading = false;
        }
      )
      .addMatcher(
        (action) => getOrderCheckoutDetail.matchFulfilled(action),
        (state, { payload }) => {
          state.checkoutRoot = payload;
          state.checkoutDataSource = 'orderCheckout';
          state.fetchCheckoutDataLoading = false;
          state.updateShippingMethodLoading = false;
          state.updateCheckoutZipcodeLoading = false;
        }
      )
      .addMatcher(
        (action) => getOrderCheckoutDetail.matchPending(action),
        (state) => {
          state.fetchCheckoutDataLoading = true;
          state.updateShippingMethodLoading = true;
        }
      )
      .addMatcher(
        (action) => getOrderCheckoutDetail.matchRejected(action) || getOrderCheckoutDetail.matchFulfilled(action),
        (state) => {
          state.fetchCheckoutDataLoading = false;
          state.updateShippingMethodLoading = false;
        }
      )
      .addMatcher(
        (action) => updateCheckoutAddressZipcode.matchPending(action),
        (state) => {
          state.updateCheckoutZipcodeLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          return (
            (action.meta?.arg?.endpointName === 'checkoutAddCouponToCart' ||
              action.meta?.arg?.endpointName === 'checkoutRemoveCouponFromCart') &&
            action.type.endsWith('/pending')
          );
        },
        (state) => {
          state.couponLoading = true;
        }
      )
      .addMatcher(
        (action) => {
          return (
            (action.meta?.arg?.endpointName === 'checkoutAddCouponToCart' ||
              action.meta?.arg?.endpointName === 'checkoutRemoveCouponFromCart') &&
            (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'))
          );
        },
        (state) => {
          state.couponLoading = false;
        }
      )
      .addDefaultCase((state) => state);
  },
  selectors: {
    selectHasCheckoutRoot: (state) => !!state.checkoutRoot,
    selectCheckoutRoot: (state) => state.checkoutRoot,
    selectCheckoutDataSource: (state) => state.checkoutDataSource,
    selectIsZeroOrder: (state) => {
      if (!state.checkoutRoot) return false;
      return Number(state.checkoutRoot.summary?.total) === 0 || Number(state.checkoutRoot.summary?.total) < 0;
    },
    selectFetchCheckoutDataLoading: (state) => state.fetchCheckoutDataLoading,
    selectCouponLoading: (state) => state.couponLoading,
    selectCheckoutSummary: (state) => state.checkoutRoot?.summary,
    selectCheckoutCoupon: (state) => state.checkoutRoot?.summary?.coupon || null,
    selectAvailableCheckoutCoupons: (state) => {
      const couponList = state.checkoutRoot?.summary?.couponList;
      return Array.isArray(couponList) ? couponList.filter((coupon) => coupon.state === 0) : [];
    },
    selectCheckoutLineItems: (state) => state.checkoutRoot?.lineItems || [],
    selectCheckoutGiftLineItems: (state) => state.checkoutRoot?.gifts || [],
    selectAllPosCheckoutLineItems: (state) => {
      return [
        ...(state.checkoutRoot?.lineItems || []),
        ...(state.checkoutRoot?.gifts || []),
        ...(state.checkoutRoot?.addOnServiceLineItems || []),
      ];
    },
    selectCheckoutZipcode: (state) => state.checkoutRoot?.zipcode,
    selectUpdateCheckoutZipcodeLoading: (state) => state.updateCheckoutZipcodeLoading,
    selectCheckoutAddress: (state) => {
      const hasAddressInCheckout = !!state.checkoutRoot?.addressInfo?.id;
      return hasAddressInCheckout ? state.checkoutRoot?.addressInfo : null;
    },

    selectCheckoutBillingAddress: (state) => {
      const hasBillAddressInCheckout = !!state.checkoutRoot?.billAddress?.id;
      return hasBillAddressInCheckout ? state.checkoutRoot?.billAddress : null;
    },
    //校验状态字段
    selectPosCheckoutAddressCompleted: (state) => {
      return !!state.checkoutRoot?.addressInfo?.id;
    },
    selectShippingMethod: (state) => state.checkoutRoot?.shippingMethod,
    selectShipments: (state) => state.checkoutRoot?.shippingMethod?.shipments || [],
    selectShipmentsWithLineItems: (state) => {
      const shipments = state.checkoutRoot?.shippingMethod?.shipments || [];
      const shippingLineItemIds = shipments.flatMap((shipment) => shipment?.lineItems?.map((item) => item?.lineItemId));
      // 所有商品包括商品、赠品、增值服务
      const allLineItems = [
        ...(state.checkoutRoot?.lineItems || []),
        ...(state.checkoutRoot?.addOnServiceLineItems || []),
        ...(state.checkoutRoot?.gifts || []),
      ];
      const finalLineItems = allLineItems?.filter((lineItem) => shippingLineItemIds.includes(lineItem.id)) || [];
      if (finalLineItems.length === 0) {
        return [];
      }
      return shipments.map((shipment) => {
        const perShipmentLineItems = shipment.lineItems.map((item) => {
          const finalLineItem = finalLineItems.find(
            (lineItem) => lineItem.id === item.lineItemId && item.skuCode === lineItem.variant.sku
          );
          return {
            ...finalLineItem,
            quantity: item.quantity || 1,
          };
        });
        return {
          ...shipment,
          lineItems: perShipmentLineItems,
        };
      });
    },
    selectCanMergeShipments: (state) => state.checkoutRoot?.shippingMethod?.canMerge,
    selectShippingPreference: (state) => state.checkoutRoot?.shippingMethod?.shippingTypes,
    selectAssemblyPreference: (state) => state.checkoutRoot?.shippingMethod?.assemblyPreference,
    selectDeliveryRequests: (state) => state.checkoutRoot?.shippingMethod?.deliveryRequests,
    selectLocalDeliveryRequests: (state) => state.localDeliveryRequests,
    selectServicesInShipment: (state, shipmentId: string) => {
      const shipment = state.checkoutRoot?.shippingMethod?.shipments.find((shipment) => shipment.id === shipmentId);
      const services = shipment?.deliveryServices || [];
      const servicesMap = services.reduce((acc, service) => {
        acc[service.serviceType] = service;
        return acc;
      }, {} as Record<DeliveryServiceTypeEnum, DeliveryServiceItemSchema>);
      return servicesMap;
    },
    selectUpdateShippingMethodLoading: (state) => state.updateShippingMethodLoading,
    selectPaymentDisabled: (state) => {
      // prd: https://castlery.atlassian.net/wiki/x/W4DVsw
      const checkoutSummary = state.checkoutRoot?.summary;
      const checkoutLineItems = state.checkoutRoot?.lineItems;
      const checkoutAddOnServiceLineItems = state.checkoutRoot?.addOnServiceLineItems;
      const hasSummary = checkoutSummary && Object.keys(checkoutSummary).length > 0;
      const hasActiveLineItem =
        checkoutLineItems?.some((item: LineItemSchema) => item.isActive) ||
        checkoutAddOnServiceLineItems?.some((item: AddOnServiceLineItemSchema) => item.isActive);
      const hasAbnormalStateItem =
        checkoutLineItems?.some((item: LineItemSchema) => {
          return (
            item.status !== 'enabled' ||
            item.isDeleted ||
            item.isPriceOutdated ||
            item.isRegionOutdated ||
            !item.isActive
          );
        }) || checkoutAddOnServiceLineItems?.some((item: AddOnServiceLineItemSchema) => !item.isActive);
      return !hasSummary || !hasActiveLineItem || hasAbnormalStateItem;
    },
    selectAutoSelectedAddressId: (state) => state.autoSelectedAddressId,
    selectPosCheckoutExchangeOrderNumber: (state) => state.posCheckoutExchangeOrderNumber,
    selectPosCheckoutExchangeOrderChecked: (state) => state.posCheckoutExchangeOrderChecked,
    selectPosCheckoutSubmitAttempted: (state) => state.posCheckoutSubmitAttempted,
    selectPosCheckoutTradePartnerId: (state) => state.posCheckoutTradePartnerId,
    selectPosCheckoutOrderComment: (state) => state.posCheckoutOrderComment,
  },
});

export const {
  setLocalDeliveryRequests,
  setAutoSelectedAddressId,
  setPosCheckoutExchangeOrderNumber,
  setPosCheckoutExchangeOrderChecked,
  setPosCheckoutSubmitAttempted,
  setPosCheckoutTradePartnerId,
  setPosCheckoutOrderComment,
} = checkoutSessionSlice.actions;
export const {
  selectShipments,
  selectShippingMethod,
  selectShipmentsWithLineItems,
  selectShippingPreference,
  selectAssemblyPreference,
  selectCheckoutZipcode,
  selectDeliveryRequests,
  selectLocalDeliveryRequests,
  selectServicesInShipment,
  selectUpdateShippingMethodLoading,
  selectCheckoutRoot,
  selectCheckoutDataSource,
  selectCheckoutSummary,
  selectCheckoutCoupon,
  selectAvailableCheckoutCoupons,
  selectCheckoutLineItems,
  selectCheckoutAddress,
  selectCheckoutBillingAddress,
  selectPosCheckoutAddressCompleted,
  selectFetchCheckoutDataLoading,
  selectCouponLoading,
  selectPaymentDisabled,
  selectAutoSelectedAddressId,
  selectAllPosCheckoutLineItems,
  selectCanMergeShipments,
  selectHasCheckoutRoot,
  selectPosCheckoutExchangeOrderNumber,
  selectPosCheckoutExchangeOrderChecked,
  selectPosCheckoutSubmitAttempted,
  selectPosCheckoutTradePartnerId,
  selectPosCheckoutOrderComment,
  selectIsZeroOrder,
  selectUpdateCheckoutZipcodeLoading,
  selectCheckoutGiftLineItems,
} = checkoutSessionSlice.selectors;
