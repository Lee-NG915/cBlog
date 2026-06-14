import { apiV1 } from '@castlery/shared-redux-services';
import type { LineItem_V2 } from '@castlery/types';
import { X_CART_TOKEN, X_CART_SOURCE, accessInPos } from '@castlery/config';

import {
  AtcRequestPayload,
  AtcResponsePayload,
  AddGiftToCartRequestPayload,
  UpdateGiftInCartRequestPayload,
  BatchAtcResponseData,
} from '../entity/atc.entity';

const apiDefaultHeaders = { [X_CART_TOKEN]: 'true' };

const transformResponseHandler = (response: any) => {
  if (response.code !== 0) {
    // 处理错误
    const errorMsg = JSON.stringify(response);
    throw new Error(errorMsg);
  }
  return response.data;
};

export const cartItemApi = apiV1.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * 删除购物车商品
     */
    removeCartItem: builder.mutation<void, { lineItemId: LineItem_V2['id'] }>({
      query: ({ lineItemId }) => ({
        url: accessInPos ? '/api/v1/pos/cart/line-items' : `/api/v1/cart/line-items`,
        method: 'DELETE',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          lineItemIdList: [lineItemId], //可扩展批量删除
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 更新购物车商品数量
     */
    updateCartItemQty: builder.mutation<
      void,
      { lineItemId: LineItem_V2['id']; variantId: LineItem_V2['variant']['id']; quantity: number }
    >({
      query: ({ lineItemId, variantId, quantity }) => ({
        url: accessInPos ? '/api/v1/pos/cart/line-items' : `/api/v1/cart/line-items`,
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          lineItemId,
          variantId,
          quantity,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 撤销购物车删除操作
     */
    cartUndoAction: builder.mutation<void, { lineItemId: LineItem_V2['id'] }>({
      query: ({ lineItemId }) => ({
        url: accessInPos ? '/api/v1/pos/cart/undo' : `/api/v1/cart/undo`,
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
        },
        body: {
          lineItemId,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 添加商品到购物车
     * @param payload
     * @returns
     */
    addLineItemToCart: builder.mutation<AtcResponsePayload['data'], AtcRequestPayload>({
      query: (payload) => ({
        url: accessInPos ? '/api/v1/pos/cart/line-items' : `/api/v1/cart/line-items`,
        method: 'POST',
        headers: {
          ...apiDefaultHeaders,
          [X_CART_SOURCE]: payload.source,
        },
        body: {
          lineItems: payload.lineItems,
          ...('fulfillmentMethod' in payload ? { fulfillmentMethod: payload.fulfillmentMethod } : {}),
          ...('fulfillmentWarehouseType' in payload
            ? { fulfillmentWarehouseType: payload.fulfillmentWarehouseType }
            : {}),
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 批量添加商品到购物车
     * 返回 createLineResults（成功列表）和 failResults（失败列表）
     * 注意：当所有商品都成功加车时，返回 null
     * @param payload
     * @returns BatchAtcResponseData | null
     */
    batchAddLineItemToCart: builder.mutation<BatchAtcResponseData | null, AtcRequestPayload>({
      query: (payload) => ({
        url: accessInPos ? '/api/v1/pos/cart/line-items/batch' : `/api/v1/cart/line-items/batch`,
        method: 'POST',
        headers: {
          ...apiDefaultHeaders,
          [X_CART_SOURCE]: payload.source,
        },
        body: {
          lineItems: payload.lineItems,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    // 通过sku查询库存
    posCheckInventory: builder.mutation<
      {
        state: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNAVAILABLE';
      },
      { sku: string; quantity: number; stockLocationCode?: string }
    >({
      query: ({ sku, quantity, stockLocationCode }) => ({
        url: '/api/v1/pos/cart/inventory',
        method: 'GET',
        headers: {
          ...apiDefaultHeaders,
        },
        params: {
          sku,
          quantity,
          ...(stockLocationCode ? { stockLocationCode } : {}),
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    addGiftToCart: builder.mutation<void, AddGiftToCartRequestPayload>({
      query: ({ source, ...payload }) => ({
        url: accessInPos ? '/api/v1/pos/cart/gift' : `/api/v1/cart/gift`,
        method: 'POST',
        headers: {
          ...apiDefaultHeaders,
          [X_CART_SOURCE]: source,
        },
        body: {
          currency: payload.currency,
          quantity: payload.quantity,
          salePrice: payload.salePrice,
          variantId: payload.variantId,
          giftPoolId: payload.giftPoolId,
          ...('warrantyId' in payload ? { warrantyId: payload.warrantyId } : {}),
          ...('coupon' in payload ? { coupon: payload.coupon } : {}),
          ...('fulfillmentMethod' in payload ? { fulfillmentMethod: payload.fulfillmentMethod } : {}),
          ...('fulfillmentWarehouse' in payload ? { fulfillmentWarehouse: payload.fulfillmentWarehouse } : {}),
          isLowStock: false,
        },
      }),
      transformResponse: transformResponseHandler,
    }),
    /**
     * 更换购物车礼品（change gift）
     */
    updateGiftInCart: builder.mutation<void, UpdateGiftInCartRequestPayload>({
      query: ({ source, ...payload }) => ({
        url: accessInPos ? '/api/v1/pos/cart/gift' : `/api/v1/cart/gift`,
        method: 'PUT',
        headers: {
          ...apiDefaultHeaders,
          [X_CART_SOURCE]: source,
        },
        body: {
          lineItemId: payload.lineItemId,
          giftPoolId: payload.giftPoolId,
          variantId: payload.variantId,
          quantity: payload.quantity,
          salePrice: payload.salePrice,
          currency: payload.currency,
          ...('coupon' in payload ? { coupon: payload.coupon } : {}),
          ...('fulfillmentMethod' in payload ? { fulfillmentMethod: payload.fulfillmentMethod } : {}),
          ...('fulfillmentWarehouse' in payload ? { fulfillmentWarehouse: payload.fulfillmentWarehouse } : {}),
        },
      }),
      transformResponse: transformResponseHandler,
    }),
  }),
});
export const {
  useRemoveCartItemMutation,
  useUpdateCartItemQtyMutation,
  useCartUndoActionMutation,
  useAddLineItemToCartMutation,
  useAddGiftToCartMutation,
  useUpdateGiftInCartMutation,
  useBatchAddLineItemToCartMutation,
  usePosCheckInventoryMutation,
} = cartItemApi;
export const {
  removeCartItem,
  updateCartItemQty,
  cartUndoAction,
  addLineItemToCart,
  addGiftToCart,
  updateGiftInCart,
  batchAddLineItemToCart,
  posCheckInventory,
} = cartItemApi.endpoints;
