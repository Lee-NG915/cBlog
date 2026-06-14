// @ts-ignore - TypeScript may not resolve these imports correctly without rebuild
import { apiV1 } from '@castlery/shared-redux-services';
// @ts-ignore - TypeScript may not resolve these imports correctly without rebuild
import type { GiftVariantDetailSchema, GiftPoolSchema } from '@castlery/types';
import { X_CART_TOKEN, accessInPos } from '@castlery/config';

interface BatchRetrieveGiftsByVariantIdsRequest {
  variantIds: string[];
  stockLocationCode?: string; // POS only
  zipcode?: {
    // SG => null
    city: string;
    state: string;
    zipcode: string;
  } | null;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  [key: string]: any;
}

interface VariantDetailResponse {
  variantDetail?: GiftVariantDetailSchema[];
}

export const promotionApiV1 = apiV1.injectEndpoints({
  endpoints: (builder: any) => {
    return {
      // @ts-expect-error - Builder type inference issue with injectEndpoints
      batchRetrieveGiftsByVariantIds: builder.mutation<
        GiftVariantDetailSchema[],
        BatchRetrieveGiftsByVariantIdsRequest
      >({
        query: ({ variantIds, stockLocationCode, zipcode }: BatchRetrieveGiftsByVariantIdsRequest) => ({
          url: accessInPos ? '/api/v1/pos/cart/variant/details' : '/api/v1/cart/variant/details',
          method: 'POST',
          body: {
            variants: variantIds.map((variantId: string) => ({
              variantId,
              quantity: 1, // 非必要参数，后端后续需要移除
            })),
            stockLocationCode: stockLocationCode || '',
            zipcode: zipcode || null,
          },
        }),
        transformResponse: (response: ApiResponse<VariantDetailResponse>) => {
          if (response.code !== 0) {
            // 处理错误
            const errorMsg = JSON.stringify(response);
            throw new Error(errorMsg);
          }
          return response.data.variantDetail || [];
        },
      }),
      // @ts-expect-error - Builder type inference issue with injectEndpoints
      getGiftsByCouponCode: builder.query<GiftPoolSchema[], string>({
        query: (coupon: string) => ({
          url: accessInPos ? '/api/v1/pos/cart/gift' : '/api/v1/cart/gift',
          method: 'GET',
          headers: {
            [X_CART_TOKEN]: 'true',
          },
          params: {
            coupon,
          },
        }),
        transformResponse: (response: ApiResponse<{ giftPools: GiftPoolSchema[] }>) => {
          if (response.code !== 0) {
            const errorMsg = JSON.stringify(response);
            throw new Error(errorMsg);
          }
          return response.data.giftPools || [];
        },
      }),
    };
  },
});

export const {
  useBatchRetrieveGiftsByVariantIdsMutation,
  useGetGiftsByCouponCodeQuery,
  useLazyGetGiftsByCouponCodeQuery,
} = promotionApiV1;
export const { batchRetrieveGiftsByVariantIds, getGiftsByCouponCode } = promotionApiV1.endpoints;
