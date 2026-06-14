/* eslint-disable camelcase */
import { getHistory } from 'helpers/History';
import { get as getCookie } from 'helpers/Cookie';
import { getPriceByVariantId, getShippingConfigurations, getVariantById } from 'api/product';
import isEqual from 'lodash/isEqual';
import { selectedObjToStr } from 'containers/Product/utils';
import { productTools } from 'containers/Product/hooks/product';
import { EVENT_PRODUCT_FILTER } from 'utils/track/constants';
import queryString from 'query-string';
import { globalFeatureInAU } from 'config';
import { client } from 'helpers/ApiClient';
import { selectCurrentFields, selectCurrentVariant } from './productOptions';

import {
  handleChangeShippingLocation,
  pleaseCallAfterUpdateValitedShippingLocation,
  selectedShippingLocation,
} from './geolocation';
import { handleErrorZipcode } from './notice';

const LOAD = 'products/LOAD';
const LOAD_SUCCESS = 'products/LOAD_SUCCESS';
const LOAD_FAIL = 'products/LOAD_FAIL';

const FETCH_VARIANT = 'products/fetch_variant';
const FETCH_VARIANT_SUCCESS = 'products/fetch_variant_success';
const FETCH_VARIANT_FAIL = 'products/fetch_variant_fail';

const UPDATE_VARIANT_PRICE = 'products/update_variant_price';

export const FETCH_GLOBAL_REVIEWS = 'products/fetch_global_reviews';

export function updatePriceModifier(oldBundleOptions, newBundleOptions) {
  return oldBundleOptions.map((bundleOption) => {
    // eslint-disable-next-line prefer-const
    let { id: bundleOptionId, variants } = bundleOption;
    const newVariants = newBundleOptions.find(({ id }) => id === bundleOptionId)?.variants;
    if (newVariants) {
      variants = variants.map((variant) => {
        const { id: variantId, price_modifier } = variant;
        return {
          ...variant,
          price_modifier:
            newVariants.find(({ id: targetId }) => targetId === variantId)?.price_modifier || price_modifier,
        };
      });
    }
    return {
      ...bundleOption,
      variants,
    };
  });
}

export const fetchProductGlobalReview = (state) =>
  (state.globalReview = {
    loading: true,
  });

export const selectCurrentProduct = (state) => {
  const { productSlug } = state.productOptions;
  return state.products?.[productSlug]?.data || {};
};

export const selectCurrentProductName = (state) => {
  const { name } = selectCurrentProduct(state);
  return name || '';
};

export const selectCurrentVariantStatus = (state) => {
  const { isLoading, error } = selectCurrentProduct(state);
  return { isLoading: isLoading || false, error };
};

const initialState = {};
export default function products(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.id]: {
          loading: true,
          loaded: false,
          data: state[action.id] ? state[action.id].data : {},
        },
      };
    case LOAD_SUCCESS: {
      return {
        ...state,
        [action.id]: {
          loading: false,
          loaded: true,
          data: action.result,
          zipcode: action.zipcode,
          city: action.city,
        },
      };
    }
    case LOAD_FAIL:
      return {
        ...state,
        [action.id]: {
          loading: false,
          loaded: false,
          error: action.error,
        },
      };
    case FETCH_VARIANT: {
      const { slug } = action;
      return {
        ...state,
        [slug]: {
          ...state[slug],
          data: {
            ...state[slug].data,
            isLoading: true,
            error: null,
          },
        },
      };
    }
    case FETCH_VARIANT_FAIL: {
      const { slug } = action;
      // TODO  error tip and back to prev selected options
      return {
        ...state,
        [slug]: {
          ...state[slug],
          data: {
            ...state[slug].data,
            isLoading: false,
            error: action.error,
          },
        },
      };
    }
    case FETCH_VARIANT_SUCCESS: {
      // eslint-disable-next-line no-case-declarations
      const { slug, result: variant } = action;
      return {
        ...state,
        [slug]: {
          ...state[slug],
          data: {
            ...state[slug].data,
            variants: [...state[slug].data.variants, variant],
            isLoading: false,
            error: null,
          },
        },
      };
    }
    case UPDATE_VARIANT_PRICE: {
      const { slug, variantId, newListPrice, newPrice, newBundleOptions } = action.result;

      const variant = state[slug]?.data?.variants?.find(({ id }) => id === variantId);

      variant.price = newPrice;
      variant.list_price = newListPrice;
      return {
        ...state,
        [slug]: {
          ...state[slug],
          data: {
            ...state[slug].data,
            variants: [...state[slug].data.variants],
            bundle_options: newBundleOptions || state[slug]?.data?.bundle_options,
          },
        },
      };
    }
    case FETCH_GLOBAL_REVIEWS: {
      console.log('FETCH_GLOBAL_REVIEWS', action);
      return {
        ...state,
        globalReview: {
          loading: false,
        },
      };
    }
    default:
      return state;
  }
}

const apiFetchVariant = ({ variantId, slug }) => ({
  types: [FETCH_VARIANT, FETCH_VARIANT_SUCCESS, FETCH_VARIANT_FAIL],
  promise: () => getVariantById(variantId),
  slug,
});
export const updateVariantPrice = () => async (dispatch, getState) => {
  try {
    const currentVariant = selectCurrentVariant(getState());
    const { product_type, bundle_options: oldBundleOptions, variants } = selectCurrentProduct(getState());
    const currentFields = selectCurrentFields(getState());

    const { product_slug: slug, id: variantId } = currentVariant;

    if (!variantId) return;

    let query = '';
    if (product_type === 'bundle') {
      query = `?${new URLSearchParams(JSON.parse(currentFields)).toString()}`;
    }

    const {
      original_price: newListPrice,
      price: newPrice,
      bundle_options: newBundleOptions,
    } = await getPriceByVariantId(variantId, query);

    const variant = variants?.find(({ id }) => id === variantId);
    const { price, list_price: listPrice } = variant || {};

    if (product_type === 'bundle') {
      const temp = updatePriceModifier(oldBundleOptions, newBundleOptions);
      if (price === newPrice && listPrice === newListPrice && isEqual(temp, oldBundleOptions)) return;

      dispatch({
        type: UPDATE_VARIANT_PRICE,
        result: {
          slug,
          variantId,
          newListPrice,
          newPrice,
          newBundleOptions: temp,
        },
      });
    } else {
      if (price === newPrice && listPrice === newListPrice) return;

      dispatch({
        type: UPDATE_VARIANT_PRICE,
        result: {
          slug,
          variantId,
          newListPrice,
          newPrice,
        },
      });
    }
  } catch (e) {
    console.log(`======updateVariantPrice========>e`);
    console.log(e);
  }
};

export const fetchVariant =
  ({ selected, batch, slug }) =>
  (dispatch, getState) => {
    // eslint-disable-next-line no-shadow
    const { products } = getState();

    const product = products[slug]?.data || {};
    const { customizations, variants } = product;

    const batchOfVariant = customizations.filter(
      // eslint-disable-next-line camelcase
      ({ option_types }) => option_types === selectedObjToStr(selected)
    );

    let variantId;
    if (!batch) {
      if (batchOfVariant.length > 1) console.error('must push batch');
      variantId = batchOfVariant[0].variant_id;
    } else {
      variantId = batchOfVariant.find(({ batch: targetBatch }) => targetBatch === batch)?.variant_id;
      if (!variantId) {
        console.error('batch is wrong');
        variantId = batchOfVariant[0].variant_id;
      }
    }

    const variant = variants?.find(({ id }) => id === variantId);
    if (variant) return Promise.resolve(variant);
    return dispatch(apiFetchVariant({ variantId, slug }));
  };

export function needLoad(slug, globalState, newShippingLocation) {
  // discontined variant from review section
  const product = globalState.products[slug];
  const { zipcode, city } = newShippingLocation;
  if (zipcode !== product?.zipcode || (globalFeatureInAU && city !== product?.city)) {
    return true;
  }

  const { query } = getHistory().getCurrentLocation();
  if (query && product?.loaded) {
    const optionTypes = product.data?.option_types?.map((optionType) => optionType.name) || [];
    for (const [key, value] of Object.entries(query)) {
      if (optionTypes.includes(key)) {
        const exist = product.data.variants.some((v) =>
          v.variant_option_values.some((option) => option.option_type_name === key && option.name === value)
        );
        if (!exist) {
          return true;
        }
      }
    }
  }

  return !product?.loaded;
}

/**
 *
 * @param {*} slug
 * @param {*} shippingLocation
 * @returns
 */
export function load(slug, shippingLocation) {
  const location = getHistory().getCurrentLocation();
  let { search } = location;
  if (!search) {
    // from search page
    const query = `${queryString.stringify(location?.state?.optionTypes || {})}`;
    if (query) {
      search = `?${query}`;
    }
  }

  // remove the ZERO WIDTH SPACE from the end of product slug
  const productSlug = slug.replace(/[\u200B-\u200D\uFEFF]/g, '');

  const productUrl = `/v3/products/${productSlug}${search}`;
  let { zipcode, city } = shippingLocation;
  if (!zipcode || !city) {
    const shippingLocationFromCookie = JSON.parse(getCookie('city') || '{}');
    zipcode = shippingLocation?.zipcode || shippingLocationFromCookie?.zipcode;
    city = shippingLocation?.city || shippingLocationFromCookie?.city;
  }

  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get(productUrl, {
        auth: 'loose',
        header: {
          ...(zipcode && {
            'X-Location-Zipcode': zipcode,
          }),
          ...(city &&
            globalFeatureInAU && {
              'X-Location-City': city,
            }),
        },
      }),
    id: productSlug,
    ...(zipcode && { zipcode }),
    ...(city && { city }),
  };
}

export function loadIfNeeded(slug, newShippingLocation) {
  return (dispatch, getState) => {
    const currentShippingLocation = newShippingLocation || selectedShippingLocation(getState());
    if (needLoad(slug, getState(), currentShippingLocation)) {
      return dispatch(load(slug, currentShippingLocation));
    }
    return Promise.resolve(getState().products[slug].data);
  };
}

/**
 * only call when user changeZipcode
 * @param {*} locationFromContext
 * @returns
 */
export const handleUpdateProduct =
  ({ locationFromContext, shippingLocation }) =>
  async (dispatch, getState) => {
    const currentShippingLocation = selectedShippingLocation(getState());
    if (isEqual(currentShippingLocation, shippingLocation)) {
      return;
    }
    const { productSlug } = getState().productOptions;
    try {
      const product = await dispatch(loadIfNeeded(productSlug, shippingLocation));
      await productTools.reduxInit(locationFromContext, product, dispatch);
      await dispatch(updateVariantPrice());
    } catch (error) {
      console.log(`==============>error`);
      console.log(error);
    }
  };

class ZipcodeError extends Error {
  constructor({ message, code }, ...rest) {
    super(rest);
    this.errors = [
      {
        code,
        message,
      },
    ];
  }
}

export const fetchInventoryRegionCode =
  ({ frame, onClick, shippingLocation }) =>
  async (dispatch, getState) => {
    const { zipcode: targetZipcode } = shippingLocation;
    try {
      const data = await getShippingConfigurations(targetZipcode);
      const { inventory_region_code: inventoryRegionCode } = data;
      if (!inventoryRegionCode) {
        throw new ZipcodeError({
          code: 40011,
          message: 'The inventoryRegionCode is null.',
        });
      }
      const newShipping = {
        ...shippingLocation,
        inventoryRegionCode,
      };
      dispatch(handleChangeShippingLocation(newShipping));
      dispatch(pleaseCallAfterUpdateValitedShippingLocation());
      onClick(true);
      dispatch({
        type: EVENT_PRODUCT_FILTER,
        result: {
          filterKey: 'quickship',
          label: shippingLocation.zipcode,
        },
      });
    } catch (error) {
      console.log(`==============>error`);
      console.log(error);
      onClick(false);

      if (error.message === 'The inventoryRegionCode is null.' || error.errors[0].code === 40011) {
        dispatch(
          handleErrorZipcode({
            error,
            errorZipcode: shippingLocation.zipcode,
          })
        );
      } else {
        frame.openModal('response', { body: error });
      }
    } finally {
      frame.removeModal();
    }
  };

/**
 * 根据 SKU 获取产品详情
 * @param {string} sku - 产品 SKU
 * @param {Object} options - 可选配置项
 * @param {string} options.zipcode - 邮编
 * @param {string} options.city - 城市
 * @returns {Promise} 返回产品详情数据
 */
export const getProductBySKU = (sku) =>
  client.get(`/v3/products/${sku}`, {
    auth: 'loose',
  });
