import { api, tagTypes } from '@castlery/shared-redux-services';
import type { FreeGiftPromotionType } from '../entity/gift.entity';
import type { Gift } from '@castlery/types';

// Define a service using a base URL and expected endpoints
export const promotionApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      /**
       * @description get free gift list by order number
       * @param {string | { orderNumber: string; stockLocationId?: string }} arg
       * @returns {FreeGiftPromotionType[]}
       */
      getGiftsByOrderNumberV2: builder.query<
        FreeGiftPromotionType[],
        { orderNumber: string; stockLocationId?: string; coupon_code?: string }
      >({
        query: (arg) => {
          const orderNumber = arg?.orderNumber;
          return {
            url: `v2/orders/${orderNumber}/promotions/gift`,
            params: {
              stock_location_id: arg?.stockLocationId,
              coupon_code: arg?.coupon_code,
            },
          };
        },
        transformResponse: (response: FreeGiftPromotionType[]) => {
          return response
            .filter((item) => {
              if (item.control_type === 2) return true;
              return item.gifts.some((gift) => gift.state !== 'OUT_OF_STOCK');
            })
            .map((item) => ({
              ...item,
              gifts: item.gifts.map((gift) => ({
                ...gift,
                controlType: item.control_type,
                promotionId: item.promotion_id.toString(),
              })),
            }));
        },
        providesTags: [tagTypes.Gift],
        forceRefetch: () => true,
      }),

      /**
       * @description get free gift list by order number (silent mode - no side effects)
       * @param {object} arg
       * @param {string} arg.orderNumber - 订单号
       * @param {string} [arg.stockLocationId] - 库存位置ID
       * @param {string} [arg.coupon_code] - 优惠券代码
       * @returns {FreeGiftPromotionType[]}
       */
      getGiftsByOrderNumberSilent: builder.query<
        FreeGiftPromotionType[],
        { orderNumber: string; stockLocationId?: string; coupon_code?: string }
      >({
        query: (arg) => {
          const orderNumber = arg?.orderNumber;
          return {
            url: `v2/orders/${orderNumber}/promotions/gift`,
            params: {
              stock_location_id: arg?.stockLocationId,
              coupon_code: arg?.coupon_code,
            },
          };
        },
        transformResponse: (response: FreeGiftPromotionType[]) => {
          return response
            .filter((item) => {
              if (item.control_type === 2) return true;

              // 过滤掉所有gift都没有库存的 campaign
              return item.gifts.some((gift) => gift.state !== 'OUT_OF_STOCK');
            })
            .map((item) => ({
              ...item,
              gifts: item.gifts.map((gift) => ({
                ...gift,
                controlType: item.control_type,
                promotionId: item.promotion_id.toString(),
              })),
            }));
        },
        // 使用特殊的 tag，避免与主查询的缓存冲突. 因为 silent 模式不会触发主查询的缓存
        providesTags: [{ type: tagTypes.Gift as const, id: 'SILENT' }],
        // 强制刷新，不使用缓存
        forceRefetch: () => true,
      }),

      /**
       * @description add free gift to order
       * @param {object} params
       * @param {string} params.orderNumber - 订单号
       * @param {number} params.gift_id - 礼品ID
       * @param {number} params.variant_id - 变体ID
       * @param {number} params.promotion_id - 促销ID
       * @param {string} params.coupon_code - 优惠券代码 (仅当 controlType !== 1 时需要)
       * @returns {GiftType}
       */
      addGiftsByOrderNumberV2: builder.mutation<
        Gift,
        {
          orderNumber: string;
          gift_id: string;
          variant_id: number;
          coupon_code?: string;
        }
      >({
        query: ({ orderNumber, ...rest }) => ({
          url: `checkouts/${orderNumber}/gift_v2`,
          method: 'PUT',
          body: { ...rest },
        }),
      }),
      // 这里不能使用providesTags， 因为addGiftsByOrderNumber
      // 会触发 getGiftsByOrderNumber 的缓存，导致缓存失效 重新调用之前缓存过的请求
      // providesTags: [tagTypes.Gift],
    };
  },
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
// export const { } = OrderApi;

// export endpoints for use in SSR
export const { getGiftsByOrderNumberV2, addGiftsByOrderNumberV2, getGiftsByOrderNumberSilent } = promotionApi.endpoints;
