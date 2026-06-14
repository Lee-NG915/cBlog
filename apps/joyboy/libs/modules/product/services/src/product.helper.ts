/* eslint-disable @typescript-eslint/no-unused-vars */
import { EcEnv, enableMulberry, enableZipCode } from '@castlery/config';
import {
  addToOrder,
  createWebOrder,
  selectCurrentOrderNumber,
  selectOrder,
  setOrder,
  updateWebOrder,
} from '@castlery/modules-order-domain';
import {
  BundleVariants,
  LeadTimeShippingFee,
  Product,
  SwatchVariant,
  Variant,
  changeBundleVariants,
  changeProduct,
  changeVariant,
  createReviewsByVariantApiPayload,
  createReviewsByVariantImagesApiPayload,
  createReviewsLocateVariantImageApiPayload,
  getAssemblyFilesByVariantId,
  getLeadtimeShippingFee,
  getProductReviewLocateVariantImage,
  getProductReviewByVariant,
  getProductReviewByVariantImages,
  getProductSocialUgcByVariant,
  getWebLeadTimeShippingFee,
  postSubscription,
  selectBundleVariants,
  selectPreferredOptions,
  selectProduct,
  selectStockLocation,
  selectVariant,
  selectVariantId,
  selectVariantIds,
  selectVariantQuantity,
  selectedOfferId,
  setAssemblyAiData,
  setLeadtimeShippingFee,
} from '@castlery/modules-product-domain';
import {
  getCityInfo,
  noticeCityInfoUpdated,
  selectedCurrentCityInfo,
  selectedPrevCorrectShippingLocation,
  updateErrorInfo,
  updatePrevCorrectShippingLocation,
} from '@castlery/modules-user-domain';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import type { RootState } from '@castlery/shared-redux-store';
import { STOCK_STATE } from '@castlery/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getVariantCodes } from './utils';
import { captureStructuredError, logger } from '@castlery/observability/client';

type optionsType = {
  preferred_self_collection?: boolean;
  bundle_option_id?: number;
  bundle_option_variant_id?: number;
  warranty_offer_id?: string;
  bundle_options?: { bundle_option_id: string; bundle_option_variant_id: number }[];
};

const createWebOrderForCurrentUser = createAsyncThunk(
  'order/createWebOrderForCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    const res = await dispatch(createWebOrder.initiate(undefined));
    if ('error' in res) {
      return rejectWithValue(res.error);
    }
    return res.data;
  }
);

export const addToCartCommand = createAsyncThunk(
  'product/addToCartCommand',
  async (trackingParams: { source?: string; position?: string } = {}, { getState, dispatch, rejectWithValue }) => {
    try {
      const rootState = getState() as RootState;
      const product = selectProduct(rootState);
      let currentOrderNumber = selectCurrentOrderNumber(rootState);
      const { source, position } = trackingParams;

      if (!currentOrderNumber) {
        const createOrderResult = await dispatch(createWebOrderForCurrentUser());
        if ('error' in createOrderResult) {
          return rejectWithValue('Failed to create new order for add to cart');
        }
        currentOrderNumber = createOrderResult.payload?.number;
        if (!currentOrderNumber) {
          return rejectWithValue('Failed to get order number after creating new order');
        }
        // 同步订单到 state，避免加车失败时因 state 无订单而重复创建
        if (createOrderResult.payload) {
          dispatch(setOrder(createOrderResult.payload));
        }
      }

      let variantId = selectVariantId(rootState);
      const quantity = selectVariantQuantity(rootState) || 1;
      const preferredOptions = selectPreferredOptions(rootState);
      const options: optionsType = {
        ...preferredOptions,
      };
      // [保险接入] US legacy Order V1 加车 — 将 Mulberry 选中 plan 写入 options.warranty_offer_id
      // CA 走 addToCartCommandV2 + buildCartWarrantyFields，不会进入此分支
      if (enableMulberry) {
        const mulberryId = selectedOfferId(rootState);
        if (mulberryId !== '') {
          options.warranty_offer_id = mulberryId;
        }
      }
      if (product?.product_type === 'bundle') {
        const bundleOptions = selectBundleVariants(rootState);
        if (!bundleOptions) {
          throw new Error(`${bundleOptions} is not a valid bundle option`);
        }

        if (!bundleOptions?.bundle_options) {
          throw new Error(`${bundleOptions?.bundle_options} is not a valid bundle option`);
        }
        variantId = bundleOptions?.variant_id;
        options.bundle_options = bundleOptions?.bundle_options;
      }
      if (!variantId) {
        throw new Error(`variantId: ${variantId}`);
      }

      const params: {
        number: string;
        quantity: number;
        variant_id: number;
        options: {
          preferred_self_collection: boolean;
          bundle_option_id?: number;
          bundle_option_variant_id?: number;
          warranty_offer_id?: string;
          bundle_options?: { bundle_option_id: string; bundle_option_variant_id: number }[];
        };
      } = {
        number: currentOrderNumber,
        quantity: quantity,
        variant_id: variantId,
        options: options as {
          preferred_self_collection: boolean;
          bundle_option_id?: number;
          bundle_option_variant_id?: number;
          bundle_options?: { bundle_option_id: string; bundle_option_variant_id: number }[];
        },
      };
      const paramsWithTracking = params as typeof params & { source?: string; position?: string };
      if (source) {
        paramsWithTracking.source = source;
      }
      if (position) {
        paramsWithTracking.position = position;
      }
      return await dispatch(addToOrder.initiate(paramsWithTracking as any)).unwrap();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const webAddToCartCommand = createAsyncThunk(
  'product/webAddToCartCommand',
  async (
    params: {
      isSwatch?: boolean;
      swatchRelatedProduct?: Product;
      variant?: Variant | SwatchVariant;
      quantity?: number;
      /**
       * Optional source of the add to cart action, used for tracking only.
       */
      source?: string;
      /**
       * Optional position of the add to cart action, used for tracking only.
       */
      position?: string;
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    // isSwatch 用于数据追踪
    // swatchRelatedProduct 用于数据追踪
    const { isSwatch, swatchRelatedProduct, variant, quantity, source, position } = params;
    const rootState = getState() as RootState;
    let currentOrderNumber = selectCurrentOrderNumber(rootState);

    if (!currentOrderNumber) {
      try {
        const createOrderResult = await dispatch(createWebOrderForCurrentUser());
        if ('error' in createOrderResult) {
          return rejectWithValue('Failed to create new order for add to cart');
        }
        currentOrderNumber = createOrderResult.payload?.number;
        // 写入 Redux state，确保后续 addToCartCommandByParams 读取时订单号已存在，避免重复创建订单
        if (createOrderResult.payload) {
          dispatch(setOrder(createOrderResult.payload));
        }
      } catch (error) {
        return rejectWithValue('Failed to create new order for add to cart');
      }
    }
    const cityInfo = await dispatch(getCityInfo());
    const order = selectOrder(rootState);
    // op logic，city 信息与订单信息不符时需要更新订单信息
    if (
      order?.zipcode !== cityInfo?.payload?.zipcode ||
      order?.city !== cityInfo?.payload?.city ||
      order?.country_state !== cityInfo?.payload?.state
    ) {
      try {
        await dispatch(
          updateWebOrder.initiate({
            number: currentOrderNumber,
            zipcode: cityInfo?.payload?.zipcode,
            country_state: cityInfo?.payload?.state,
            city: cityInfo?.payload?.city,
          })
        )?.unwrap();
      } catch (error) {
        return rejectWithValue(error);
      }
    }
    try {
      if (!variant?.id) {
        return await dispatch(
          addToCartCommand({
            source,
            position,
          })
        ).unwrap();
      }
      // add to cart
      // skipCityCheck: webAddToCartCommand 已完成城市校验，无需在 addToCartCommandByParams 中重复
      return await dispatch(
        addToCartCommandByParams({
          quantity: quantity,
          variant_id: variant?.id,
          source,
          position,
          skipCityCheck: true,
        })
      ).unwrap();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addToCartCommandByParams = createAsyncThunk(
  'addToCartCommandByParams',
  async (
    params: {
      quantity?: number;
      variant_id: number;
      source?: string;
      position?: string;
      suppressDefaultErrorModal?: boolean;
      suppressTracking?: boolean;
      /**
       * 当上层调用方（如 webAddToCartCommand）已完成城市信息校验时，设为 true 跳过重复校验。
       * 直接调用时（如 Room Designer）保持 false（默认），以确保城市信息与订单同步。
       */
      skipCityCheck?: boolean;
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    const rootState = getState() as RootState;
    let currentOrderNumber = selectCurrentOrderNumber(rootState);
    const rootQuantity = selectVariantQuantity(rootState) || 1;

    if (!currentOrderNumber) {
      const createOrderResult = await dispatch(createWebOrderForCurrentUser());
      if ('error' in createOrderResult) {
        return rejectWithValue('Failed to create new order for add to cart');
      }
      currentOrderNumber = createOrderResult.payload?.number;
      if (!currentOrderNumber) {
        return rejectWithValue('Failed to get order number after creating new order');
      }
      // 同步订单到 state，避免加车失败时因 state 无订单而重复创建
      if (createOrderResult.payload) {
        dispatch(setOrder(createOrderResult.payload));
      }
    }

    // 城市信息校验：直接调用（如 Room Designer）时执行，经由 webAddToCartCommand 调用时跳过（已在上层处理）
    if (!params.skipCityCheck) {
      const cityInfo = await dispatch(getCityInfo());
      // setOrder 后重新读取 state，确保拿到最新的订单信息
      const freshState = getState() as RootState;
      const order = selectOrder(freshState);
      if (
        order?.zipcode !== cityInfo?.payload?.zipcode ||
        order?.city !== cityInfo?.payload?.city ||
        order?.country_state !== cityInfo?.payload?.state
      ) {
        try {
          await dispatch(
            updateWebOrder.initiate({
              number: currentOrderNumber,
              zipcode: cityInfo?.payload?.zipcode,
              country_state: cityInfo?.payload?.state,
              city: cityInfo?.payload?.city,
            })
          )?.unwrap();
        } catch (error) {
          return rejectWithValue(error);
        }
      }
    }

    try {
      const result = await dispatch(
        addToOrder.initiate({
          number: currentOrderNumber,
          quantity: params.quantity ?? rootQuantity,
          variant_id: params.variant_id,
          // source is used only for tracking in listener middleware
          ...(params.source ? { source: params.source } : {}),
          // position is used only for tracking in listener middleware
          ...(params.position ? { position: params.position } : {}),
          ...(params.suppressDefaultErrorModal ? { suppressDefaultErrorModal: true } : {}),
          ...(params.suppressTracking ? { suppressTracking: true } : {}),
        })
      );
      if (result?.error) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const refreshLeadtimeCommand = createAsyncThunk(
  'refreshLeadtimeCommand',
  async (outerParams: { outerVariantId?: number; outerStockLocationCode?: number }, { getState, dispatch }) => {
    try {
      const rootState = getState() as RootState;
      const stockLocation = selectStockLocation(rootState);
      const stockLocationId = stockLocation?.id || '';
      const stockLocationCode = stockLocation?.code || '';
      const quantity = selectVariantQuantity(rootState) || 1;
      const product = selectProduct(rootState);
      const variantId = selectVariantId(rootState);
      const orderNumber = selectCurrentOrderNumber(rootState);
      let params = {
        variant_id: variantId,
        quantity: quantity,
        stock_location_id: stockLocationId,
        options: {},
      } as {
        quantity: number;
        stock_location_id: string;
        variant_id: number;
        options: {
          bundle_options?: BundleVariants['bundle_options'];
        };
        zipcode?: string;
        city?: string;
        state?: string;
        order_number?: string;
      };
      if (outerParams?.outerVariantId) {
        params.variant_id = outerParams.outerVariantId;
      }
      if (product?.product_type === 'bundle') {
        const bundleVariants = selectBundleVariants(rootState);
        if (!bundleVariants) {
          return;
        }
        params = {
          ...params,
          variant_id: bundleVariants.variant_id,
          options: {
            bundle_options: bundleVariants.bundle_options,
          },
        };
      } else {
        if (!variantId) {
          return;
        }
      }
      if (enableZipCode) {
        const cityInfo = await dispatch(getCityInfo());
        if (cityInfo?.payload) {
          params = {
            ...params,
            zipcode: cityInfo.payload.zipcode,
            order_number: orderNumber,
            city: cityInfo.payload.city,
            state: cityInfo.payload.state,
          };
        }
      }

      // if (stockLocationCode === 'Studio-AUSC-Stock') {
      //   params = {
      //     ...params,
      //     zipcode: '2033',
      //     city: 'KENSINGTON',
      //     state: 'NSW',
      //   };
      // }
      // if (stockLocationCode === 'Studio-AUFV-Stock') {
      //   params = {
      //     ...params,
      //     zipcode: '4000',
      //     city: 'Fortitude Valley',
      //     state: 'QLD',
      //   };
      // }
      if (stockLocationCode) {
        params = {
          ...params,
          zipcode: stockLocation?.zipcode,
          city: stockLocation?.city,
          state: stockLocation?.state_text,
        };
      }

      try {
        const data = await dispatch(
          getLeadtimeShippingFee.initiate(params, {
            forceRefetch: true,
          })
        ).unwrap();
        dispatch(setLeadtimeShippingFee(data));
      } catch (error) {
        logger.error('Failed to set leadtime shipping fee in helper', { error });
        return;
      }
    } catch (e) {
      logger.error('Error in product helper', { error: e });
    }
  }
);

export const refreshWebLeadTimeCommand = createAsyncThunk(
  'refreshLeadtimeCommand',
  async (
    outerParams: {
      outerVariantId?: number;
      outerZipcode?: string;
      outerCity?: string;
      outerState?: string;
      outerBundleVariant?: BundleVariants;
    },
    { getState, dispatch, extra, rejectWithValue }
  ) => {
    try {
      const rootState = getState() as RootState;
      const { persistenceHandles } = extra as ExtraArgument;
      const quantity = selectVariantQuantity(rootState) || 1;
      const product = selectProduct(rootState);
      const variantId = selectVariantId(rootState);
      const isOuterCityInfo = !!(outerParams?.outerZipcode || outerParams?.outerCity || outerParams?.outerState);
      let params = {
        variant_id: variantId,
        quantity: quantity,
        options: {},
      } as {
        quantity: number;
        variant_id: number;
        options: {
          bundle_options?: BundleVariants['bundle_options'];
        };
        zipcode?: string;
        city?: string;
        state?: string;
      };
      if (outerParams?.outerVariantId) {
        params.variant_id = outerParams.outerVariantId;
      }
      if (product?.product_type === 'bundle') {
        const bundleVariants = outerParams?.outerBundleVariant || selectBundleVariants(rootState);
        if (!bundleVariants) {
          return rejectWithValue('No bundle variants found');
        }
        params = {
          ...params,
          variant_id: bundleVariants.variant_id,
          options: {
            bundle_options: bundleVariants.bundle_options,
          },
        };
      } else {
        if (!variantId) {
          return rejectWithValue('No variant ID found');
        }
      }
      // WEB logic, consume from redux instead of cookie
      // switch location zipcode, city, state
      if (isOuterCityInfo) {
        params = {
          ...params,
          zipcode: outerParams?.outerZipcode,
          city: outerParams?.outerCity,
          state: outerParams?.outerState,
        };
      } else {
        const cityInfo = selectedCurrentCityInfo(rootState);
        if (cityInfo) {
          params = {
            ...params,
            zipcode: cityInfo?.zipcode,
            city: cityInfo?.city,
            state: cityInfo?.state,
          };
        }
      }

      try {
        const data = await dispatch(
          getWebLeadTimeShippingFee.initiate(params, {
            forceRefetch: true,
          })
        ).unwrap();
        dispatch(setLeadtimeShippingFee(data));
        dispatch(
          updatePrevCorrectShippingLocation({
            city: params.city || '',
            state: params.state || '',
            zipcode: params.zipcode || '',
          })
        );
        return data;
      } catch (error: any) {
        dispatch(
          setLeadtimeShippingFee({
            stock_state: STOCK_STATE.OUT_OF_STOCK,
          } as LeadTimeShippingFee)
        );
        dispatch(updateErrorInfo({ errorZipcode: params?.zipcode || '', errorCode: error?.data?.errors?.[0]?.code }));
        const prevCorrectShippingLocation = selectedPrevCorrectShippingLocation(rootState);
        if (
          prevCorrectShippingLocation &&
          prevCorrectShippingLocation?.city &&
          prevCorrectShippingLocation?.state &&
          prevCorrectShippingLocation?.zipcode
        ) {
          const fallbackParams = {
            ...params,
            city: prevCorrectShippingLocation.city,
            state: prevCorrectShippingLocation.state,
            zipcode: prevCorrectShippingLocation.zipcode,
          };
          // fallback fetch
          try {
            const data = await dispatch(
              getWebLeadTimeShippingFee.initiate(fallbackParams, {
                forceRefetch: true,
              })
            ).unwrap();
            dispatch(setLeadtimeShippingFee(data));
            dispatch(noticeCityInfoUpdated(prevCorrectShippingLocation));
            persistenceHandles.webCity.setItem(JSON.stringify(prevCorrectShippingLocation));
          } catch (error) {
            return rejectWithValue(error);
          }
        }
        return rejectWithValue(error);
      }
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Unknown error');
    }
  }
);

export const serviceGuaranteeAnchor = {
  title: 'Service Guarantee',
  anchor_id: 'service_guarantee',
  variantSymbol: 'service_guarantee',
};

export const getWebProductReviewsCommand = createAsyncThunk(
  'getWebProductReviews',
  async (
    params: {
      product?: Product;
      variant?: Variant;
      bundleVariant?: BundleVariants;
      country?: string;
      orderBy?: string;
      pageNumber?: number;
      perPage?: number;
      tag?: string;
    } = {},
    { getState, dispatch, rejectWithValue }
  ) => {
    const { product, variant, bundleVariant, country, orderBy, pageNumber, perPage, tag } = params;
    const rootState = getState() as RootState;
    const finalProduct = product || selectProduct(rootState);
    const finalVariant = variant || selectVariant(rootState);
    const finalBundleVariant = bundleVariant || selectBundleVariants(rootState);
    if (!finalVariant && !finalBundleVariant) {
      return;
    }
    if (!finalProduct) {
      return;
    }

    const { variantCode, bundleVariantCodes } = getVariantCodes(finalProduct, finalVariant, finalBundleVariant);

    const { ...rest } = createReviewsByVariantApiPayload({
      variantCode,
      bundleVariantCodes: bundleVariantCodes || undefined,
      country,
      orderBy: orderBy,
      pageNumber: pageNumber,
      perPage: perPage,
      tag,
    });
    const queryStr = Object.entries(rest.params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    try {
      const result = await dispatch(
        getProductReviewByVariant.initiate(queryStr, {
          forceRefetch: true,
        })
      ).unwrap();

      return {
        ...result,
        // available_tags: Array.isArray(result?.available_tags) ? result.available_tags : [],
      };
    } catch (e: any) {
      const errorMessage = e?.error || e?.message || 'Unknown error';
      const errorStatus = e?.status != null ? String(e.status) : 'UNKNOWN';
      const tags: Record<string, string> = {
        ['errorType']: errorStatus,
      };

      if (finalVariant?.sku) {
        tags['productSku'] = finalVariant.sku;
      }

      captureStructuredError(e, {
        tags,
        extra: {
          errorMessage,
          errorStatus,
          variantCode,
          bundleVariantCodes,
          queryStr,
        },
      });

      return rejectWithValue({
        error: errorMessage,
        status: errorStatus,
      });
    }
    // let finalReviews = [];
    // finalReviews =
    //   reviews?.results?.filter((item: { attachments: string | any[] }) => item.attachments?.length > 0).slice(0, 5) ||
    //   [];
    // if (finalReviews.length < 5) {
    //   finalReviews =
    //     reviews?.results
    //       ?.filter((item: { attachments: string | any[] }) => item?.attachments?.length <= 0)
    //       ?.slice(0, 5) || [];
    // }
    // if (finalReviews.length < 5) {
    //   finalReviews = [];
    // }
    // finalReviews?.sort((a: { rating: number }, b: { rating: number }) => b.rating - a.rating);
    // dispatch(setReviews(finalReviews));
    // return;
  }
);

export const getWebProductReviewsImagesCommand = createAsyncThunk(
  'getWebProductReviewsImages',
  async (
    params: {
      product?: Product;
      variant?: Variant;
      bundleVariant?: BundleVariants;
      country?: string;
      orderBy?: string;
      pageNumber?: number;
      perPage?: number;
    } = {},
    { getState, dispatch, rejectWithValue }
  ) => {
    const { product, variant, bundleVariant, country, orderBy, pageNumber, perPage } = params;
    const rootState = getState() as RootState;
    const finalProduct = product || selectProduct(rootState);
    const finalVariant = variant || selectVariant(rootState);
    const finalBundleVariant = bundleVariant || selectBundleVariants(rootState);
    if (!finalVariant && !finalBundleVariant) {
      return;
    }
    if (!finalProduct) {
      return;
    }

    const { variantCode, bundleVariantCodes } = getVariantCodes(finalProduct, finalVariant, finalBundleVariant);

    const { ...rest } = createReviewsByVariantImagesApiPayload({
      variantCode,
      bundleVariantCodes: bundleVariantCodes || undefined,
      country,
      orderBy: orderBy,
      pageNumber: pageNumber,
      perPage: perPage,
    });
    const queryStr = Object.entries(rest.params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    try {
      const result = await dispatch(
        getProductReviewByVariantImages.initiate(queryStr, {
          forceRefetch: true,
        })
      ).unwrap();

      return result;
    } catch (e: any) {
      const errorMessage = e?.error || e?.message || 'Unknown error';
      const errorStatus = e?.status != null ? String(e.status) : 'UNKNOWN';
      const tags: Record<string, string> = {
        ['errorType']: errorStatus,
      };

      if (finalVariant?.sku) {
        tags['productSku'] = finalVariant.sku;
      }

      captureStructuredError(e, {
        tags,
        extra: {
          errorMessage,
          errorStatus,
          variantCode,
          bundleVariantCodes,
          queryStr,
        },
      });

      return rejectWithValue({
        error: errorMessage,
        status: errorStatus,
      });
    }
  }
);

export const getWebProductReviewsLocateVariantImageCommand = createAsyncThunk(
  'getWebProductReviewsLocateVariantImage',
  async (
    params: {
      key: string;
      perPage: number;
      product?: Product;
      variant?: Variant;
      bundleVariant?: BundleVariants;
      country?: string;
    },
    { getState, dispatch, rejectWithValue }
  ) => {
    const { key, perPage, product, variant, bundleVariant, country } = params;
    const rootState = getState() as RootState;
    const finalProduct = product || selectProduct(rootState);
    const finalVariant = variant || selectVariant(rootState);
    const finalBundleVariant = bundleVariant || selectBundleVariants(rootState);

    if (!key) {
      return rejectWithValue({
        error: 'key is required',
        status: 'BAD_REQUEST',
      });
    }

    if (!finalVariant && !finalBundleVariant) {
      return;
    }

    if (!finalProduct) {
      return;
    }

    const { variantCode, bundleVariantCodes } = getVariantCodes(finalProduct, finalVariant, finalBundleVariant);
    const { ...rest } = createReviewsLocateVariantImageApiPayload({
      variantCode,
      key,
      perPage,
      country,
      bundleVariantCodes: bundleVariantCodes || undefined,
    });
    const queryStr = Object.entries(rest.params)
      .map(([paramKey, value]) => `${paramKey}=${value}`)
      .join('&');

    try {
      const result = await dispatch(
        getProductReviewLocateVariantImage.initiate(queryStr, {
          forceRefetch: true,
        })
      ).unwrap();

      return result;
    } catch (e: any) {
      const errorMessage = e?.error || e?.message || 'Unknown error';
      const errorStatus = e?.status != null ? String(e.status) : 'UNKNOWN';
      const tags: Record<string, string> = {
        ['errorType']: errorStatus,
      };

      if (finalVariant?.sku) {
        tags['productSku'] = finalVariant.sku;
      }

      captureStructuredError(e, {
        tags,
        extra: {
          errorMessage,
          errorStatus,
          variantCode,
          bundleVariantCodes,
          queryStr,
          key,
          perPage,
        },
      });

      return rejectWithValue({
        error: errorMessage,
        status: errorStatus,
      });
    }
  }
);

export const initializeProduct = createAsyncThunk(
  'product/initializeProduct',
  (
    {
      product,
      bundleVariant,
    }: {
      product: Product;
      bundleVariant?: BundleVariants;
    },
    { dispatch }
  ) => {
    if (!product) return;
    dispatch(changeProduct(product));
    dispatch(changeVariant(product.variants[0]));
    if (bundleVariant) {
      dispatch(changeBundleVariants(bundleVariant));
    }
  }
);

export const getProductSocialUgcByVariantCommand = createAsyncThunk(
  'product/getProductSocialUgcByVariant',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const variantIds = selectVariantIds(rootState);
    if (variantIds?.length === 0) {
      return rejectWithValue('No variant id or bundle variant ids');
    }

    try {
      const results = await Promise.all(
        variantIds.map((variantId) => dispatch(getProductSocialUgcByVariant.initiate(variantId)).unwrap())
      );
      return results;
    } catch (e: any) {
      logger.error('Failed to initialize SKU configurator', { error: e?.message });
      return rejectWithValue(e?.message);
    }
  }
);

export const changeBundleVariantsCommand = createAsyncThunk(
  'product/changeBundleVariantsCommand',
  async (params: { bundleVariants: BundleVariants }, { dispatch, getState }) => {
    dispatch(changeBundleVariants(params.bundleVariants));
  }
);

export const postSubscriptionCommand = createAsyncThunk(
  'product/postSubscriptionCommand',
  async (params: { email: string }, { dispatch, getState, rejectWithValue }) => {
    const rootState = getState() as RootState;
    const product = selectProduct(rootState);
    const variant = selectVariant(rootState);
    if (variant?.sku && product?.min_sale_qty) {
      try {
        const cityInfo = await dispatch(getCityInfo());
        const submitParams = {
          email: params.email,
          source: 'LLT',
          extra: {
            variant_sku: variant?.sku,
            quatity: product?.min_sale_qty,
            ...(EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() !== 'sg' && {
              zipcode: cityInfo?.payload?.zipcode,
            }),
            ...(EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase() !== 'au' && {
              city: cityInfo?.payload?.city,
              state: cityInfo?.payload?.state,
            }),
          },
        };
        return await dispatch(postSubscription.initiate(submitParams)).unwrap();
      } catch (error) {
        return rejectWithValue(error);
      }
    }
    rejectWithValue('No variant or product');
  }
);

export const postZipcodeFailureSubscriptionCommand = createAsyncThunk(
  'product/postZipcodeFailureSubscriptionCommand',
  async (params: { email: string; extra?: { zipcode: string } }, { dispatch, getState, rejectWithValue }) => {
    const submitParams = {
      email: params.email,
      source: 'ZIPCODE_FAILURE_POPUP',
      extra: params.extra || {},
    };

    try {
      const result = await dispatch(postSubscription.initiate(submitParams)).unwrap();
      return result;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const getAssemblerInstructionCommand = createAsyncThunk(
  'product/getAssemblerInstructionCommand',
  async (_, { dispatch, getState }) => {
    const rootState = getState() as RootState;
    const variant = selectVariant(rootState);
    const bundleVariant = selectBundleVariants(rootState);
    const product = selectProduct(rootState);
    let assemblyFiles = [];
    const AiFileType = {
      VIDEO: 'video',
      DOC: 'doc',
    };
    if (product?.product_type === 'bundle') {
      if (!bundleVariant?.bundle_options) {
        const emptyResult = { aiVideos: [], aiDocs: [] };
        dispatch(setAssemblyAiData(emptyResult));
        return emptyResult;
      }
      try {
        const res = await Promise.all(
          bundleVariant?.bundle_options?.map((bundleOption) =>
            dispatch(getAssemblyFilesByVariantId.initiate(bundleOption?.bundle_option_variant_id)).unwrap()
          )
        );
        for (const { assembly_files = [] } of res) {
          assemblyFiles.push(...assembly_files);
        }
      } catch (e) {
        logger.error('Error in product helper', { error: e });
        const errorResult = { aiVideos: [], aiDocs: [] };
        dispatch(setAssemblyAiData(errorResult));
        return errorResult;
      }
    } else {
      const { assembly_files = [] } = variant || {};
      assemblyFiles = [...assembly_files];
    }
    assemblyFiles = [...new Map(assemblyFiles.map((item) => [item.filename, item])).values()];
    const aiVideos = assemblyFiles.filter(({ filetype }) => filetype === AiFileType.VIDEO);
    // .map((item) => {
    //   // effect
    //   item.videoInfo = item.file_link || '';
    //   return item;
    // });

    const aiDocs = assemblyFiles.filter(({ filetype }) => filetype === AiFileType.DOC);

    const result = { aiVideos, aiDocs };
    dispatch(setAssemblyAiData(result));
    return result;
  }
);
