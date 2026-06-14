import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import { getCustomerOrderHistory, getOrderDetails } from '../api/order-history.api';

/**
 * @description 临时定义， 等order重构合并后，使用order的LineItem_V2
 */
export interface OrderHistoryItem {
  id: string;
  quantity: number; //quantity
  productType: string; //product_type
  isGift: boolean; //is_gift
  variant: {
    name: string;
    images: {
      type: string;
      links: {
        mini: string;
        feed: string;
      };
    }[];
    isClearance: boolean; //is_clearance
    isCustomized: boolean; //is_customized
    productSlug: string; //product_slug
    variantOptionValues: {
      //variant_option_values
      optionTypeName: string; //option_type_name
      optionTypePresentation: string; //option_type_presentation
      name: string;
      presentation: string; //presentation
    }[];
  };
  bundleLineItems: {
    quantity: number; //quantity
    //bundle_line_items
    variant: {
      id: string;
      name: string;
      productName: string; //product_name
      productSlug: string; //product_slug
      images: {
        type: string;
        links: {
          mini: string;
          feed: string;
        };
      }[];
      variantOptionValues: {
        //variant_option_values
        optionTypeName: string; //option_type_name
        optionTypePresentation: string; //option_type_presentation
        name: string;
        presentation: string; //presentation
      }[];
    };
    bundleOption: {
      bundleOptionName: string; //bundle_option.name
      bundleOptionPresentation: string; //bundle_option.presentation
    };
  }[];
  warrantyItems: {
    warrantyOfferPrice: string; //warranty_offer_price
    durationMonths: string; //duration_months
  };
}

export const ORDER_HISTORY_FEATURE_KEY = 'orderHistory';
/**
 * cartAdapter
 * @description 通过createEntityAdapter生成的，一组可重用的reducer和selector来管理存储中的规范化数据
 */
export const orderHistoryAdapter = createEntityAdapter<any>({});
export interface OrderHistoryState extends EntityState<any, number> {
  orderHistoryList: any[];
}

export const initialOrderHistoryState: OrderHistoryState = orderHistoryAdapter.getInitialState({
  orderHistoryList: [],
});

export const orderHistorySlice = createSliceWithThunks({
  name: ORDER_HISTORY_FEATURE_KEY,
  initialState: initialOrderHistoryState,
  reducers: () => ({}),
  extraReducers(builder) {
    builder.addMatcher(
      (action) => getCustomerOrderHistory.matchFulfilled(action),
      (state, payload) => {
        state.orderHistoryList = payload.payload;
      }
    ),
      builder.addMatcher(
        (action) => getOrderDetails.matchFulfilled(action),
        (state, payload) => {
          if (state.orderHistoryList.length === 0) {
            state.orderHistoryList = [payload.payload];
            return;
          }
          const orders = state.orderHistoryList.map((order) => {
            if (order.id === payload.payload.id) {
              return {
                ...order,
                ...payload.payload,
              };
            }
            return order;
          });
          state.orderHistoryList = orders;
        }
      );
  },
  selectors: {
    selectOrderHistoryList: (state: OrderHistoryState) => state.orderHistoryList,
    selectModifiedOrderItems: (state: OrderHistoryState, orderId: string) => {
      const order = state.orderHistoryList.find((order) => order.id === orderId);
      if (!order) return [];
      const orderItems = order.shipments.map((shipment: any) => {
        let lineItems;
        if (shipment.line_items) {
          lineItems = shipment.line_items.map((lineItem: any) => {
            const item = order.line_items.find((i: any) => i.id === lineItem.id);
            const modifiedItem = { ...item, quantity: lineItem.quantity };
            return modifiedItem;
          });
        } else {
          lineItems = shipment.manifest.map((m: any) => order.line_items.find((i: any) => i.id === m));
        }
        const modifiedLineItems = lineItems.map((item: any) => {
          item.variant = {
            ...item.variant,
            isClearance: item.variant.is_clearance,
            isCustomized: item.variant.is_customized,
            productSlug: item.variant.product_slug,
            variantOptionValues: item.variant.variant_option_values?.map((option: any) => ({
              ...option,
              optionTypePresentation: option.option_type_presentation,
              optionTypeName: option.option_type_name,
              presentation: option.presentation,
            })),
          };
          item.bundleLineItems = item.bundle_line_items?.map((bundleItem: any) => {
            return {
              ...bundleItem,
              variant: bundleItem.variant
                ? {
                    ...bundleItem.variant,
                    productName: bundleItem.variant.product_name,
                    productSlug: bundleItem.variant.product_slug,
                    variantOptionValues: bundleItem.variant.variant_option_values?.map((option: any) => ({
                      ...option,
                      optionTypePresentation: option.option_type_presentation,
                      optionTypeName: option.option_type_name,
                      presentation: option.presentation,
                    })),
                  }
                : null,
              bundleOption: bundleItem.bundle_option
                ? {
                    bundleOptionName: bundleItem.bundle_option.name,
                    bundleOptionPresentation: bundleItem.bundle_option.presentation,
                  }
                : null,
            };
          });
          item.warrantyItems = item.warranty_items
            ? {
                ...item.warranty_items,
                warrantyOfferPrice: item.warranty_items.warranty_offer_price,
                durationMonths: item.warranty_items.duration_months,
              }
            : null;
          item.isGift = item.is_gift;
          item.productSlug = item.product_slug;
          item.productType = item.product_type;
          return item;
        });
        return { ...shipment, line_items: modifiedLineItems };
      });

      return orderItems;
    },
  },
});

// export const {  } = orderHistorySlice.actions;
export const { selectOrderHistoryList, selectModifiedOrderItems } = orderHistorySlice.selectors;
