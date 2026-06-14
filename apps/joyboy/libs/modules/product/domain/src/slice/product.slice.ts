/* eslint-disable @typescript-eslint/no-unused-vars */
// 不能引入 components 的依赖
// import type { ProductOptionsLineGroupProps } from '@castlery/modules-product-components';
// import { type ProductOptionsLineProps } from '@castlery/modules-product-components';
import { EcEnv } from '@castlery/config';
import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { createEntityAdapter, createSelector, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { getLeadtimeShippingFee, getProductByIdOrSlug } from '../api/product.api';
import type {
  BundleOptionVariants,
  LeadTimeShippingFee,
  MappedSocialUgcItem,
  OptionType,
  Product,
  ProductAssemblyAiData,
  SocialUgc,
  Variant,
} from '../entity/product.entity';
import { StockLocation } from '@castlery/modules-retails-domain';
import { mergeSort, STOCK_STATE } from '@castlery/utils';
import { Swatch } from '../entity/swatch.entity';
import { logger } from '@castlery/observability/client';

export function format(num: number, decimal = 0) {
  try {
    return (+num)
      .toFixed(decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\.0+$/, '');
  } catch (error) {
    logger.error('Price formatting error', { error });
    return '0';
  }
}

export function toPrice(price?: string, zeroToFree?: boolean) {
  if (!price) {
    return '';
  }
  try {
    const num = Number(price);
    if (num > 0) {
      return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(num, 2)}`;
    } else if (num < 0) {
      return `-${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}${format(-num, 2)}`;
    } else {
      if (zeroToFree) {
        return 'Free';
      } else {
        return `${EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL}0`;
      }
    }
  } catch (error) {
    logger.error('Price formatting error', { error });
    return '';
  }
}

export function getPriceByVariant(price: string, minSaleQty = 1, zeroToFree = false) {
  return toPrice(`${(Number(price) || 0) * (minSaleQty || 1)}`, zeroToFree);
}
export function getListPriceByVariant(list_price: string, minSaleQty = 1, zeroToFree = false) {
  return toPrice(`${(Number(list_price) || 0) * (minSaleQty || 1)}`, zeroToFree);
}

export const PRODUCT_FEATURE_KEY = 'product';

/*
 * Update these interfaces according to your requirements.
 */

export type BundleVariants = {
  variant_id: number;
  bundle_options: { bundle_option_id: string; bundle_option_variant_id: number }[];
  sku: string;
};
export interface ProductState extends EntityState<Product, number> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string | null;
  // option_types?: ProductOptionsLineProps[];
  option_types?: [];
  option_selected?: Record<string, unknown>;
  productDetail?: Product;
  selectedVariantId?: number;
  currentProduct?: Product;
  currentVariant?: Variant;
  bundleVariants?: BundleVariants;
  currentBundleVariants?: BundleOptionVariants;
  variantQuantity?: number;
  leadtimeShippingFee?: LeadTimeShippingFee;
  stockLocation?: StockLocation;
  haveFreeSwatch?: boolean;
  isSelfCollection?: boolean;
  leadtimeShippingFeeIsFetching?: boolean;
  listPrice?: string;
  price?: string;
  fulfillmentMethods: { value: boolean; name: string }[];
  socialUgc?: {
    [key: string]: SocialUgc[];
  };
  swatches?: {
    loading: boolean;
    data?: Swatch[];
  };
  hullabalaExperience?: {
    variantId: number;
    exists: boolean;
    image?: string;
    isLoaded: boolean;
  };
  assemblyAiData?: ProductAssemblyAiData;
}

export const productAdapter = createEntityAdapter<Product>();

export const initialProductState: ProductState = productAdapter.getInitialState({
  loadingStatus: 'not loaded',
  error: null,
  option_types: [],
  option_selected: {},
  productDetail: {} as Product,
  selectedVariantId: -1,
  fulfillmentMethods: [
    {
      value: true,
      name: 'Cash ＆ Carry',
    },
    {
      value: false,
      name: 'Delivery',
    },
  ],
  isSelfCollection: false,
  stockLocation: {
    id: '',
    name: '',
    label: 'Warehouse',
    location_type: 'warehouse',
  },
  price: '0',
  listPrice: '0',
  swatches: {
    loading: false,
  },
});

export const productSlice = createSliceWithThunks({
  name: PRODUCT_FEATURE_KEY,
  initialState: initialProductState,
  reducers: (create) => {
    return {
      setProductOptions: create.asyncThunk<{ option_types: OptionType[]; variants: Variant[] }, Product>(
        async (productDetail) => {
          const { option_types, variants } = productDetail;
          return {
            option_types,
            variants,
          };
        }
      ),
      setProductDetail: create.asyncThunk(async (productDetail) => {
        return productDetail;
      }),
      changeVariantQuantity: create.reducer((state, action: PayloadAction<number>) => {
        state.variantQuantity = action.payload;
      }),
      changeProduct: create.reducer((state, action: PayloadAction<Product>) => {
        state.currentProduct = action.payload;
      }),
      changeVariant: create.reducer((state, action: PayloadAction<Variant>) => {
        state.currentVariant = action.payload;
      }),
      changeBundleVariants: create.reducer((state, action: PayloadAction<BundleVariants>) => {
        state.bundleVariants = action.payload;
        const product = state.currentProduct;
        const selectedBundleVariants = action.payload?.bundle_options?.reduce((acc, option) => {
          const bundleOption = product?.bundle_options
            ?.find((item) => String(item?.id) === option?.bundle_option_id)
            ?.variants?.find((item) => item?.id === option?.bundle_option_variant_id);
          const currentBundleOption = product?.bundle_options?.find(
            (item) => String(item?.id) === option?.bundle_option_id
          );
          const preName =
            (currentBundleOption?.default_quantity ?? 1) > 1 ? `${currentBundleOption?.default_quantity} x ` : '';
          return {
            ...acc,
            [option?.bundle_option_id]: {
              ...bundleOption,
              variantName: preName + bundleOption?.product_name,
              variantInfo: bundleOption?.variant_option_values?.map((item) => item.presentation).join(', '),
              quantity: currentBundleOption?.default_quantity ?? 1, // abby
              optionVariantId: option?.bundle_option_variant_id, // abby
              optionId: option?.bundle_option_id, //abby
            },
          };
        }, {});
        state.currentBundleVariants = selectedBundleVariants;
      }),
      changeCurrentBundleVariants: create.reducer((state, action: PayloadAction<BundleOptionVariants>) => {
        state.currentBundleVariants = action.payload;
      }),
      setLeadtimeShippingFee: create.reducer((state, action: PayloadAction<LeadTimeShippingFee>) => {
        state.leadtimeShippingFee = action.payload;
      }),
      changeStockLocation: create.reducer((state, action: PayloadAction<StockLocation>) => {
        console.log('changeStockLocation', action.payload);
        state.stockLocation = action.payload;
      }),
      changeFulfillmentMethods: create.reducer((state, action: PayloadAction<boolean>) => {
        state.isSelfCollection = action.payload;
      }),
      setLoadingStatus: create.reducer(
        (state, action: PayloadAction<'not loaded' | 'loading' | 'loaded' | 'error'>) => {
          state.loadingStatus = action.payload;
        }
      ),
      changeLeadtimeShippingFeeIsFetching: create.reducer((state, action: PayloadAction<boolean>) => {
        state.leadtimeShippingFeeIsFetching = action.payload;
      }),
      changeListPrice: create.reducer((state, action: PayloadAction<string>) => {
        state.listPrice = action.payload;
      }),
      changeSocialUgc: create.reducer(
        (
          state,
          action: PayloadAction<{
            [key: string]: SocialUgc[];
          }>
        ) => {
          state.socialUgc = {
            ...state.socialUgc,
            ...action.payload,
          };
        }
      ),
      changeSwatches: create.reducer((state, action: PayloadAction<Swatch[] | undefined>) => {
        state.swatches = {
          loading: false,
          data: action.payload,
        };
      }),
      changeSwatchLoading: create.reducer((state, action: PayloadAction<boolean>) => {
        state.swatches = {
          ...state.swatches,
          loading: action.payload,
        };
      }),
      setHullabalaExperience: create.reducer(
        (
          state,
          action: PayloadAction<{
            variantId: number;
            exists: boolean;
            image?: string;
            isLoaded: boolean;
          }>
        ) => {
          state.hullabalaExperience = action.payload;
        }
      ),
      updateCanFindSKU: create.reducer((state, action: PayloadAction<boolean>) => {
        // This action is used to update the canFindSKU state
        // The actual state management should be handled by the user domain
        // This is just a placeholder to avoid dependency issues
      }),
      updateCityCanBeApply: create.reducer((state, action: PayloadAction<boolean>) => {
        // This action is used to update the cityCanBeApply state
        // The actual state management should be handled by the user domain
        // This is just a placeholder to avoid dependency issues
      }),
      setAssemblyAiData: create.reducer<ProductAssemblyAiData | undefined>((state, action) => {
        state.assemblyAiData = action.payload;
      }),
    };
    // remove: productAdapter.removeOne,
    // ...
  },
  extraReducers: (builder) => {
    builder
      // TODO 这是错的
      .addMatcher(getProductByIdOrSlug.matchFulfilled, (state, action) => {
        state.currentProduct = action.payload;
      })

      .addMatcher(getLeadtimeShippingFee.matchPending, (state, action) => {
        state.loadingStatus = 'loading';
      })
      .addDefaultCase((state) => {
        state.loadingStatus = 'not loaded';
      });
  },
  selectors: {
    selectProductSpuSlug: (state) => state.currentProduct?.slug,
    selectVariantId: (state) => state.currentVariant?.id,
    selectProduct: (state) => state.currentProduct,
    selectVariant: (state) => state.currentVariant,
    selectVariantCode: (state) => state.currentVariant?.sku,
    selectBundleVariants: (state) => state.bundleVariants,
    selectCurrentBundleVariants: (state) => state.currentBundleVariants,
    selectVariantQuantity: (state) => state.variantQuantity,
    selectedLeadtimeShippingFeeIsFetching: (state) => state.leadtimeShippingFeeIsFetching,
    selectProductCollectionsIds: (state) => state.currentProduct?.collections || [],
    selectVariantPrice: (state) => {
      // let variant = state.currentVariant;
      // if (currentProduct?.product_type === 'bundle') {
      //   price = currentProduct.bundle_options.reduce((result, option) => {
      //     return result + +selectedVariants[option.id].price_modifier * option.default_quantity;
      //   }, +variant.price);

      //   list_price = currentProduct.bundle_options.reduce((result, option) => {
      //     return result + +selectedVariants[option.id].price_modifier * option.default_quantity;
      //   }, +variant.list_price);
      //   return;
      // }
      return toPrice(state?.currentVariant?.price);
    },
    selectLeadtimeShippingFee: (state) => state.leadtimeShippingFee,
    selectProductLoadingStatus: (state) => state.loadingStatus,
    selectHaveFreeSwatch: (state) => {
      return Boolean(state.currentProduct?.show_free_swatch);
    },
    selectStockLocation: (state) => state.stockLocation,
    selectFulfillmentMethods: (state) => state.fulfillmentMethods,
    selectIsSelfCollection: (state) => state.isSelfCollection,

    selectPreferredOptions: (state) => {
      return {
        // TODO 待验证 是否需要 默认值
        preferred_self_collection: state.isSelfCollection || false,
        ...(state.stockLocation?.id && {
          preferred_stock_location_id: state.stockLocation?.id,
        }),
      };
    },
    selectListPrice: (state) => state.listPrice,
    selectSocialUgc: (state) => state.socialUgc,
    selectSwatches: (state) => state.swatches,
    selectSwatchLoading: (state) => state.swatches?.loading,
    selectHullabalaExperience: (state) => state.hullabalaExperience,
  },
  // extraReducers: (builder) => {},
});

/*
 * Export reducer for store configuration.
 */
export const productReducer = productSlice.reducer;
export const {
  setProductOptions,
  setProductDetail,
  changeVariant,
  changeProduct,
  changeVariantQuantity,
  setLeadtimeShippingFee,
  changeStockLocation,
  changeBundleVariants,
  changeCurrentBundleVariants,
  changeFulfillmentMethods,
  setLoadingStatus,
  changeLeadtimeShippingFeeIsFetching,
  changeListPrice,
  changeSocialUgc,
  changeSwatches,
  changeSwatchLoading,
  setHullabalaExperience,
  updateCanFindSKU,
  updateCityCanBeApply,
  setAssemblyAiData,
} = productSlice.actions;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(productActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
// export const {  } = productSlice.actions;
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllProduct);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = productAdapter.getSelectors();

export const getProductState = (rootState: { [PRODUCT_FEATURE_KEY]: ProductState }): ProductState =>
  rootState[PRODUCT_FEATURE_KEY];

export const selectAssemblyAiData = createSelector(getProductState, (state) => state.assemblyAiData);

export const selectAllProduct = createSelector(getProductState, selectAll);

export const selectProductEntities = createSelector(getProductState, selectEntities);

export const selectVariantIds = createSelector(
  [
    (state: { product: ProductState }) => getProductState(state).currentProduct,
    (state: { product: ProductState }) => getProductState(state).currentVariant,
    (state: { product: ProductState }) => getProductState(state).bundleVariants,
  ],
  (product, variant, bundleVariant) => {
    const result: string[] = [];
    if (
      product?.product_type === 'bundle' &&
      product?.bundle_options?.length &&
      bundleVariant?.bundle_options?.length
    ) {
      const bundleIds = bundleVariant?.bundle_options?.map((item) => String(item?.bundle_option_variant_id));
      result.push(...bundleIds);
      return result;
    }

    if (variant?.id) {
      result.push(String(variant.id));
      return result;
    }
    return result;
  }
);

export const selectDiscontinued = createSelector(
  [
    (state: { product: ProductState }) => getProductState(state).currentProduct,
    (state: { product: ProductState }) => getProductState(state).currentVariant,
    (state: { product: ProductState }) => getProductState(state).currentBundleVariants,
  ],
  (product, variant, currentBundleVariants) => {
    let discontinued = false;
    if (product?.product_type === 'bundle') {
      discontinued = Object.values(currentBundleVariants || {})?.some((v) => Boolean(v?.discontinued));
    } else if (variant?.discontinued) {
      discontinued = true;
    }
    if (product?.discontinued) {
      discontinued = true;
    }
    return discontinued;
  }
);

export const selectSortedSocialUgc = createSelector(
  [
    (state: { product: ProductState }) => getProductState(state).socialUgc,
    (state: { product: ProductState }) => selectVariantIds(state),
  ],
  (socialUgc, variantIds) => {
    const socialUgcList = variantIds?.map((variantId: string | number) => socialUgc?.[variantId] || []);
    const socialUgcSortedList = mergeSort(socialUgcList, (item: SocialUgc) => item?.ugc_id)
      ?.map(
        ({
          asset_url: media,
          author,
          caption,
          file_type: fileType,
          source,
          variant_ids,
          ugc_id: _uid,
          start_offset: startOffset,
        }) => {
          const item: MappedSocialUgcItem = {
            media,
            ig_handle: author,
            content: caption,
            variants: variant_ids?.join(','),
            fileType,
            component: source,
            startOffset,
            _uid,
          };
          // if (fileType === 'video') {
          //   const videoInfo = genVideoInfo(image, String(startOffset));
          //   item.videoInfo = videoInfo;
          //   if (videoInfo?.thumbnail) {
          //     item.image = videoInfo?.thumbnail;
          //   }
          // }
          return item;
        }
      )
      .splice(0, 20);
    return socialUgcSortedList;
  }
);

export const selectCurrentProductStockState = createSelector(
  [
    (state: { product: ProductState }) => getProductState(state).currentProduct,
    (state: { product: ProductState }) => getProductState(state).leadtimeShippingFee,
  ],
  (product, leadtimeShippingFee) => {
    const stockState = leadtimeShippingFee?.stock_state;
    const availableQuantity = leadtimeShippingFee?.available_quantity;
    if (stockState === STOCK_STATE.OUT_OF_STOCK || !stockState) return STOCK_STATE.OUT_OF_STOCK;
    if (stockState === STOCK_STATE.IN_STOCK_SOON) return STOCK_STATE.LOW_IN_STOCK;

    const { min_sale_qty = 0, qty_increments = 0 } = product || {};
    if (availableQuantity && availableQuantity <= min_sale_qty + 2 * qty_increments) {
      return STOCK_STATE.LOW_IN_STOCK;
    }
    return STOCK_STATE.IN_STOCK;
  }
);

export const {
  selectProductSpuSlug,
  selectVariantId,
  selectVariantCode,
  selectProduct,
  selectVariant,
  selectBundleVariants,
  selectCurrentBundleVariants,
  selectVariantPrice,
  selectVariantQuantity,
  selectLeadtimeShippingFee,
  selectProductLoadingStatus,
  selectStockLocation,
  selectHaveFreeSwatch,
  selectFulfillmentMethods,
  selectIsSelfCollection,
  selectPreferredOptions,
  selectedLeadtimeShippingFeeIsFetching,
  selectListPrice,
  selectProductCollectionsIds,
  selectSocialUgc,
  selectSwatches,
  selectSwatchLoading,
  selectHullabalaExperience,
} = productSlice.selectors;
