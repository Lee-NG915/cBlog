// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type {
  LeadTimeShippingFee,
  LeadTimeShippingFeeReq,
  Product,
  ProductVariantDetail,
  SocialUgcResult,
  Variant,
} from '../entity/product.entity';
import { api, tagTypes } from '@castlery/shared-redux-services';
import { Swatch } from '../entity/swatch.entity';
import {
  BundleVariants,
  changeLeadtimeShippingFeeIsFetching,
  setLoadingStatus,
  updateCanFindSKU,
} from '../slice/product.slice';
// eslint-disable-next-line
import { DEFAULT_CITY, EcEnv, enableZipCode, WEB_CHANNEL } from '@castlery/config';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getKnightSuffix } from '@castlery/utils';
import { pdpGet as get } from './http';
import { IppResponse } from '../entity/ipp.entity';
import { logger } from '@castlery/observability/client';
import type { ReviewsByVariantImagesResponse } from './review.api';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => {
    return {
      getProductByIdOrSlug: builder.query<Product, { idOrSlug: string; zipCode?: string; stockId?: string }>({
        /**
         * @param idOrSlug The product id, or product slug
         */
        query: ({ idOrSlug, zipCode, stockId }) => ({
          url: `v3/products/${idOrSlug}${stockId ? `&preferred_stock_location_id=${stockId}` : ''}`,
          method: 'GET',
          headers: {
            'X-Location-Zipcode': zipCode,
          },
        }),
        extraOptions: {
          retryCondition: (error) => error.status !== 404,
        },
        // providesTags
        async onQueryStarted(idOrSlug, { dispatch, queryFulfilled }) {
          let abort;
          try {
            const { data } = await queryFulfilled;
            const variant = data.variants[0];

            abort = await dispatch(
              productApi.util.upsertQueryData(
                'getVariantByVariantId',
                variant.id,
                variant
                // (variant) => {}
              )
            ).abort;
            dispatch(setLoadingStatus('loaded'));
          } catch (err) {
            console.log(err);
            abort && abort();
          }
        },
      }),
      getProductBySKU: builder.query<Product, string>({
        query: (sku) => `v3/products/${sku}`,
        extraOptions: {
          retryCondition: (error) => error.status !== 404,
        },
      }),
      getVariantByVariantId: builder.query<Variant, number>({
        /**
         * @param variantId The product id, or product slug
         */
        query: (variantId) => `v3/variants/${variantId}`,
        providesTags: (result, error, variantId) => [{ type: tagTypes.Variant, id: variantId }],
      }),
      getAssemblyFilesByVariantId: builder.query<Variant, number>({
        query: (variantId) => `v3/variants/${variantId}`,
        providesTags: (result, error, variantId) => [{ type: tagTypes.Variant, id: variantId }],
      }),
      searchVariantByVariantId: builder.query<Variant, number>({
        /**
         * @param variantId The product id, or product slug
         */
        query: (variantId) => `v3/variants/${variantId}`,
        providesTags: (result, error, variantId) => [{ type: tagTypes.Variant, id: variantId }],
      }),
      getLeadtimeShippingFee: builder.query<LeadTimeShippingFee, LeadTimeShippingFeeReq>({
        query: (params) => ({
          url: `estimates/leadtime_shipping_fee`,
          method: 'POST',
          body: params,
        }),
        // extraOptions: {
        //   retryCondition: (error) => error.status !== 422 || error.status !== 404,
        // },
        async onQueryStarted(params, { dispatch, queryFulfilled }) {
          dispatch(changeLeadtimeShippingFeeIsFetching(true));
          try {
            await queryFulfilled;
            dispatch(changeLeadtimeShippingFeeIsFetching(false));
            dispatch(updateCanFindSKU(true));
          } catch (error) {
            dispatch(changeLeadtimeShippingFeeIsFetching(false));
            // updateCityCanBeApply 由 product.listener 根据 getLeadtimeShippingFee 的 fulfilled/rejected 派发，避免 product 域依赖 user 域导致循环依赖
            if (error.error.status === 404) {
              dispatch(updateCanFindSKU(false));
            }
            // 在这里处理失败情况，例如分发一个错误动作或更新本地状态
          }
        },
      }),
      getWebLeadTimeShippingFee: builder.query<LeadTimeShippingFee, LeadTimeShippingFeeReq>({
        query: (params) => ({
          url: `v2/estimates/leadtime`,
          method: 'POST',
          body: params,
        }),
        async onQueryStarted(params, { dispatch, queryFulfilled }) {
          dispatch(changeLeadtimeShippingFeeIsFetching(true));
          try {
            await queryFulfilled;
            dispatch(changeLeadtimeShippingFeeIsFetching(false));
          } catch (error) {
            dispatch(changeLeadtimeShippingFeeIsFetching(false));
          }
        },
        extraOptions: {
          retryCondition: () => {
            return false;
          },
        },
      }),
      getProductBySlugFromScanner: builder.query<Product, string>({
        query: (slug) => ({
          url: `v3/products/${slug}`,
          method: 'GET',
        }),
      }),
      // /products/${id}/swatches
      getSwatchesByProductId: builder.query<Swatch[], number>({
        query: (productId) => `products/${productId}/swatches`,
      }),
      getCityZipcodeList: builder.query<{ description: string; google_place_id: string }[], string>({
        query: (query) => `places/autocomplete?query=${encodeURIComponent(query)}&type=zipcode`,
      }),
      getFormattedCity: builder.query<{ city: string; zipcode: string; state_name: string }, string>({
        query: (query) => `places/formatted_address?google_place_id=${query}`,
      }),
      getProductReviewByVariant: builder.query<any, string>({
        query: (query) => {
          return {
            url: `gw/reviews/by_variant?${query}`,
            method: 'GET',
          };
        },
        // extraOptions: {
        //   retryCondition: (error) => error.status !== 404,
        // },
        providesTags: (result, error, query) => [{ type: tagTypes.Review, id: query }],
      }),
      getProductReviewByVariantImages: builder.query<ReviewsByVariantImagesResponse, string>({
        query: (query) => {
          return {
            url: `gw/reviews/by_variant_images?${query}`,
            method: 'GET',
          };
        },
        providesTags: (result, error, query) => [{ type: tagTypes.Review, id: `images:${query}` }],
      }),
      getProductReviewLocateVariantImage: builder.query<ReviewsByVariantImagesResponse, string>({
        query: (query) => {
          return {
            url: `gw/reviews/locate_variant_image?${query}`,
            method: 'GET',
          };
        },
        providesTags: (result, error, query) => [{ type: tagTypes.Review, id: `images-locate:${query}` }],
      }),
      getProductSocialUgcByVariant: builder.query<SocialUgcResult, string>({
        query: (variantId) => ({
          url: `v3/variants/${variantId}/social_ugcs`,
          method: 'GET',
        }),
        providesTags: (result, error, variantId) => [{ type: tagTypes.SocialUgc, id: variantId }],
      }),
      getVariantsByIds: builder.query<ProductVariantDetail[], string>({
        query: (variantIds) => ({
          url: `variants?ids=${variantIds?.replace(/ /g, '')}`,
          method: 'GET',
        }),
      }),
      getProductProperties: builder.query<any, string>({
        query: (query) => ({
          url: `properties/${query}`,
          method: 'GET',
        }),
      }),
      getProductInstalment: builder.query<IppResponse, any>({
        query: (query) => ({
          url: `instalment_options`,
          method: 'GET',
        }),
      }),
    };
  },
});

export const {
  useGetProductByIdOrSlugQuery,
  useLazyGetProductByIdOrSlugQuery,
  useGetVariantByVariantIdQuery,
  useGetLeadtimeShippingFeeQuery,
  useGetWebLeadTimeShippingFeeQuery,
  useLazyGetWebLeadTimeShippingFeeQuery,
  useLazyGetVariantByVariantIdQuery,
  useGetAssemblyFilesByVariantIdQuery,
  useLazyGetAssemblyFilesByVariantIdQuery,
  useGetProductBySlugFromScannerQuery,
  useLazyGetProductBySlugFromScannerQuery,
  useGetSwatchesByProductIdQuery,
  useGetCityZipcodeListQuery,
  useGetFormattedCityQuery,
  useLazySearchVariantByVariantIdQuery,
  useGetProductBySKUQuery,
  useGetProductReviewByVariantQuery,
  useGetProductReviewByVariantImagesQuery,
  useGetProductReviewLocateVariantImageQuery,
  useGetProductSocialUgcByVariantQuery,
  useGetVariantsByIdsQuery,
  useLazyGetVariantsByIdsQuery,
  useLazyGetSwatchesByProductIdQuery,
  useGetProductPropertiesQuery,
  useLazyGetProductPropertiesQuery,
  useLazyGetProductInstalmentQuery,
} = productApi;
export const {
  getProductByIdOrSlug,
  getLeadtimeShippingFee,
  getWebLeadTimeShippingFee,
  getVariantByVariantId,
  getAssemblyFilesByVariantId,
  getProductBySlugFromScanner,
  getFormattedCity,
  getProductBySKU,
  searchVariantByVariantId,
  getProductReviewByVariant,
  getProductReviewByVariantImages,
  getProductReviewLocateVariantImage,
  getProductSocialUgcByVariant,
  getVariantsByIds,
  getSwatchesByProductId,
  getProductProperties,
  getProductInstalment,
} = productApi.endpoints;

export const getProductByIdOrSlugThunk = createAsyncThunk(
  'product/getProductByIdOrSlugThunk',
  async (
    payload: {
      idOrSlug: string;
      cityInfo?: {
        zipcode: string;
        city: string;
        state: string;
      };
      isClientSide?: boolean;
    },
    { rejectWithValue }
  ) => {
    const {
      idOrSlug,
      cityInfo = DEFAULT_CITY[EcEnv.NEXT_PUBLIC_COUNTRY as keyof typeof DEFAULT_CITY],
      isClientSide = false,
    } = payload;
    const knightSlug = getKnightSuffix(idOrSlug);

    try {
      const result = await get(
        `${EcEnv.NEXT_PUBLIC_API_HOST}/${knightSlug?.['product']}`,
        {
          headers: {
            ...('zipcode' in cityInfo && {
              'X-Location-Zipcode': cityInfo?.zipcode,
            }),
            ...(cityInfo?.city &&
              EcEnv.NEXT_PUBLIC_COUNTRY === 'AU' && {
                'X-Location-City': cityInfo?.city,
              }),
          },
          authOption: true,
          cacheOption: 'no-store',
          isClientSide,
        },
        undefined,
        0
      );

      return result;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const getProductCollection = async () => {
  try {
    const result = await fetch(`${EcEnv.APP_API_BASE_URL}/taxonomies/collections`, {
      method: 'GET',
      cache: 'no-store',
    });
    return result.json();
  } catch (e: any) {
    logger.error('Failed to get product collection', { error: e });
    return null;
  }
};
