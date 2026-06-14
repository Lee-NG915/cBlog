/* eslint-disable camelcase */
import { trackSPAEvent } from 'utils/tracking';
import { defaultCity, privateVideoCloudinaryRoot, videoCloudinaryRoot } from 'config';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { EVENT_PDP_DETAILS, EVENT_VARIANT_DETAIL } from 'utils/track/constants';
import { getVariantById, postEstimatesLeadtime } from 'api/product';
import { handleErrorZipcode } from './notice';
import { pleaseCallAfterUpdateValitedShippingLocation, selectedShippingLocation } from './geolocation';

const INIT = 'productOptions/INIT';
const UPDATE_SELECTED_VARIANTS = 'productOptions/UPDATE_SELECTED_VARIANTS';
const UPDATE_VARIANT = 'productOptions/UPDATE_VARIANT';
const UPDATE_CITY = 'productOptions/UPDATE_CITY';
const UPDATE_NEEDUPDATE_SHPPINGFEE = 'productOptions/UPDATE_NEEDUPDATE_SHPPINGFEE';
const UPDATE_SELECTED = 'productOptions/UPDATE_SELECTED';
const UPDATE_BUNDLE_PRODUCT = 'productOptions/UPDATE_BUNDLE_PRODUCT';
const UPDATE_BUNDLE_SELECTED = 'productOptions/UPDATE_BUNDLE_SELECTED';
const UPDATE_BUNDLE_VARIANT = 'productOptions/UPDATE_BUNDLE_VARIANT';
const UPDATE_REVIEW_INDEX = 'productOptions/UPDATE_REVIEW_INDEX';
const UPDATE_QUANTITY = 'productOptions/UPDATE_QUANTITY';
const UPDATE_ESTIMATING = 'productOptions/UPDATE_ESTIMATING';
const UPDATE_CUSTOMISABLE = 'productOptions/UPDATE_CUSTOMISABLE';
const UPDATE_OPTIONS = 'productOptions/UPDATE_OPTIONS';

const UPDATE_VARIANT_VERSION = 'productOptions/update_variant_version';

const UPDATE_IMAGE_QUALITY = 'productOptions/UPDATE_IMAGE_QUALITY';

// FIXME There is a possibility of returning undefined,
// probably because of asynchronous problems.
export const selectCurrentVariant = (state) => {
  const { variantId, productSlug } = state.productOptions;
  return state.products[`${productSlug}`]?.data?.variants?.find(({ id }) => id === variantId) || {};
};

export const selectCurrentProduct = (state) => {
  const { productSlug } = state.productOptions;
  return state.products[productSlug]?.data || {};
};

// for bundle
export const selectCurrentVariantsForBundle = (state) => {
  const product = selectCurrentProduct(state);
  const { selectedVariants: selectedVariantIds } = state.productOptions;
  const selectedVariants = Object.keys(selectedVariantIds).reduce((acc, selectedVariantKey) => {
    const selectedVariantId = selectedVariantIds[selectedVariantKey];
    const selectedVariant = product.bundle_options
      .find((option) => option.id === +selectedVariantKey)
      ?.variants?.find((variant) => variant.id === +selectedVariantId);
    return {
      ...acc,
      [selectedVariantKey]: selectedVariant,
    };
  }, {});
  return selectedVariants;
};

export const selectCurrentVariantIds = (state) => {
  const product = selectCurrentProduct(state);
  const variant = selectCurrentVariant(state);
  if (product.product_type === 'bundle') {
    const { selectedVariants } = state.productOptions;
    const res = Object.values(selectedVariants).join(',');
    return res;
  }
  return variant ? String(variant.id) : '';
};

export const selectedDiscontinued = (state) => {
  let discontinued = false;

  const product = selectCurrentProduct(state);
  const variant = selectCurrentVariant(state);
  if (product.product_type === 'bundle') {
    const bundleVariants = selectCurrentVariantsForBundle(state);
    discontinued = Object.values(bundleVariants).some((v) => v?.discontinued);
  } else if (variant.discontinued) {
    discontinued = true;
  }

  if (product.discontinued) {
    discontinued = true;
  }
  return discontinued;
};

export const selectCurrentFields = (state) => {
  // FIXME there are now too many formats to represent a sku(selected)
  // FIXME Subsequent optimization: caching or putting properties directly into Redux
  let res;
  const { selected, selectedVariants, customisable } = state.productOptions;
  const product = selectCurrentProduct(state);
  if (product.product_type === 'bundle') {
    res = Object.keys(selectedVariants).reduce(
      (result, key) => ({
        ...result,
        [product.bundle_options.find((option) => option.id === +key).name]: selectedVariants[key],
      }),
      {}
    );
  } else {
    const initialFields = {};

    if (customisable) {
      initialFields.customisable = 1;
    }

    res = Object.keys(selected).reduce(
      (result, optionTypeId) => ({
        ...result,
        [product.option_types.find((o) => o.id === +optionTypeId).name]: selected[optionTypeId].name,
      }),
      initialFields
    );
  }
  return JSON.stringify(res);
};
export const STOCK_STATE = {
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  IN_STOCK: 'IN_STOCK',
  LOW_IN_STOCK: 'LOW_IN_STOCK',
  IN_STOCK_SOON: 'IN_STOCK_SOON',
};

export const selectedCurrentProductStockState = (state) => {
  const { stockState, stock: availableQuantity } = state.productOptions;
  if (stockState === STOCK_STATE.OUT_OF_STOCK || !stockState) return STOCK_STATE.OUT_OF_STOCK;
  if (stockState === STOCK_STATE.IN_STOCK_SOON) return STOCK_STATE.LOW_IN_STOCK;

  const currentProduct = selectCurrentProduct(state);
  const { min_sale_qty = '', qty_increments = '' } = currentProduct;

  if (availableQuantity && availableQuantity <= min_sale_qty + 2 * qty_increments) {
    return STOCK_STATE.LOW_IN_STOCK;
  }

  return STOCK_STATE.IN_STOCK;
};

const initialState = {
  init: false,
  customisable: false,
  realCustomisable: false,
  quantity: 1,
  selected: {},
  variantId: '',
  selectedVariants: {},
  variantVersions: {
    batchOfVariant: [
      // {
      //   variant_id: 19393,
      //   option_types: '9:329;12:283;15:353',
      //   is_customized: false,
      //   discontinued: false,
      //   batch: 1,
      // },
    ],
    index: 1,
  },
  // for bundle cache
  bundleInit: false,
  bundleProduct: {},
  bundleSelected: {},
  bundleVariant: {},
  // for review
  currentReviewIndex: 0,
  // for display
  productSlug: '',
  estimating: false,
  deliveryLeadTimeDisplay: '',
  warehouseName: '',
  stockState: STOCK_STATE.IN_STOCK,
  city: null,
  prevCorrectCity: null,
  isLongLeadTime: false,
  retailIds: [],
};

export default function productOptions(state = initialState, action = {}) {
  switch (action.type) {
    case INIT:
      return {
        ...initialState,
      };
    case UPDATE_SELECTED_VARIANTS:
      return {
        ...state,
        selectedVariants:
          // ...state.selectedVariants,
          action.data,
      };
    case UPDATE_VARIANT:
      return {
        ...state,
        variantId:
          // ...state.variant,
          action.data,
      };
    case UPDATE_CITY:
      return {
        ...state,
        city: action.data,
      };
    case UPDATE_SELECTED:
      return {
        ...state,
        selected:
          // ...state.selected,
          action.data,
      };
    case UPDATE_BUNDLE_PRODUCT:
      return {
        ...state,
        bundleInit: false,
        bundleVariant: {},
        bundleProduct: { ...action.data, __isBundleProduct: true },
      };
    case UPDATE_BUNDLE_SELECTED:
      return {
        ...state,
        bundleInit: true,
        bundleSelected: action.data,
      };
    case UPDATE_BUNDLE_VARIANT:
      return {
        ...state,
        bundleVariant: action.data,
      };
    case UPDATE_REVIEW_INDEX:
      return {
        ...state,
        currentReviewIndex: action.data,
      };
    case UPDATE_QUANTITY:
      return {
        ...state,
        quantity: action.data,
      };
    case UPDATE_ESTIMATING:
      return {
        ...state,
        estimating: action.data,
      };
    case UPDATE_CUSTOMISABLE:
      return {
        ...state,
        customisable: action.data,
      };
    case UPDATE_OPTIONS:
      return { ...state, ...action.data };
    case UPDATE_VARIANT_VERSION: {
      // eslint-disable-next-line prefer-const
      let { batchOfVariant, index } = action.data;
      // If batchOfVariant is undefined,
      // it means that the user is probably just modifying the index
      batchOfVariant = batchOfVariant
        ? // eslint-disable-next-line camelcase
          batchOfVariant.map(({ batch, variant_id }) => ({
            batch,
            variantId: variant_id,
          }))
        : state.variantVersions.batchOfVariant;
      return {
        ...state,
        variantVersions: {
          batchOfVariant,
          index,
        },
      };
    }
    case UPDATE_IMAGE_QUALITY: {
      const { imageParam } = action.data;
      return {
        ...state,
        imageParam,
      };
    }
    default:
      return state;
  }
}

export function init() {
  return {
    type: INIT,
  };
}

export function updateSelectedVariants(data) {
  return {
    type: UPDATE_SELECTED_VARIANTS,
    data,
  };
}

export function updateBatchOfVariant(batchOfVariant, index = 1) {
  return {
    type: UPDATE_VARIANT_VERSION,
    data: {
      batchOfVariant,
      index,
    },
  };
}

export function updateVariant(variant) {
  trackSPAEvent({
    pageType: 'product',
    variant,
  });

  return {
    type: UPDATE_VARIANT,
    data: variant.id,
  };
}

export function updateCity(data) {
  return {
    type: UPDATE_CITY,
    data: data || defaultCity,
  };
}

export function updateNeedUpdateShippingFee(data) {
  return {
    type: UPDATE_NEEDUPDATE_SHPPINGFEE,
    data,
  };
}

export function updateSelected(data) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_SELECTED,
      data,
    });
    dispatch({
      type: EVENT_VARIANT_DETAIL,
    });
  };
}

export function updateBundleProduct(data) {
  return {
    type: UPDATE_BUNDLE_PRODUCT,
    data,
  };
}

export function updateBundleSelected(data) {
  return {
    type: UPDATE_BUNDLE_SELECTED,
    data,
  };
}

export function updateBundleVariant(data) {
  return {
    type: UPDATE_BUNDLE_VARIANT,
    data,
  };
}

export function updateReviewIndex(data) {
  return {
    type: UPDATE_REVIEW_INDEX,
    data,
  };
}

export function updateQuantity(data) {
  return {
    type: UPDATE_QUANTITY,
    data,
  };
}

export function updateEstimating(data) {
  return {
    type: UPDATE_ESTIMATING,
    data,
  };
}

export function updateCustomisable(data) {
  return {
    type: UPDATE_CUSTOMISABLE,
    data,
  };
}

export function updateProductConfig(options) {
  return (dispatch, getState) => {
    const { productOptions: productOptionState } = getState();
    const data = Object.keys(options).reduce((result, key) => {
      if (!isEqual(options[key], productOptionState[key])) {
        return {
          ...result,
          [key]: options[key],
        };
      }
      return result;
    }, {});
    if (!isEmpty(data)) {
      // FIXME This writing style is very bad, the follow-up should be optimized
      return dispatch({
        type: UPDATE_OPTIONS,
        data,
      });
    }
    return Promise.resolve();
  };
}

export const handleCalculateFee = () => async (dispatch, getState) => {
  const { variantId, quantity, selectedVariants } = getState().productOptions;
  const { zipcode, city, state } = selectedShippingLocation(getState());
  try {
    dispatch(updateEstimating(true));
    const params = {
      quantity,
      variant_id: variantId,
      zipcode,
      city,
      state,
    };

    // set bundle options if selectedVariants is not empty (bundle)
    if (Object.keys(selectedVariants).length > 0) {
      params.options = {
        bundle_options: Object.keys(selectedVariants).map((key) => ({
          bundle_option_id: key,
          bundle_option_variant_id: selectedVariants[key],
        })),
      };
    }
    const res = await postEstimatesLeadtime(params);
    dispatch(
      updateProductConfig({
        deliveryLeadTimeDisplay: res.delivery_lead_time_presentation || '',
        stock: res.available_quantity,
        estimating: false,
        warehouseName: res.warehouse_name,
        stockState: res.stock_state,
        isLongLeadTime: res.show_leadtime_explanation,
        retailIds: res.retail_ids,
      })
    );
    dispatch(pleaseCallAfterUpdateValitedShippingLocation());
  } catch (error) {
    dispatch(
      updateProductConfig({
        stockState: STOCK_STATE.OUT_OF_STOCK,
      })
    );
    dispatch(handleErrorZipcode({ error, errorZipcode: zipcode }));
  } finally {
    dispatch(updateEstimating(false));

    const stockState = selectedCurrentProductStockState(getState());
    const discontinued = selectedDiscontinued(getState());
    if (discontinued || stockState === STOCK_STATE.OUT_OF_STOCK) {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'oos_page_view',
        },
      });
    }
  }
};

export const genVideoInfo = (path = '', startOffset = '0') => {
  const isPrivateCloudinaryVideo = path.startsWith(privateVideoCloudinaryRoot);
  const isCloudinaryVideo = path.startsWith(videoCloudinaryRoot);
  if (isPrivateCloudinaryVideo || isCloudinaryVideo) {
    const videoRoot = isPrivateCloudinaryVideo ? privateVideoCloudinaryRoot : videoCloudinaryRoot;
    const [, url] = path.split(videoRoot);
    const i = url.lastIndexOf('.');
    let id = url.slice(0, i);
    id = id.startsWith('/') ? id.slice(1) : id;
    const thumbnail = `${videoRoot}/w_120,ar_1,c_fill,g_center,so_${startOffset},q_auto,f_auto/${id}.jpg`;
    const transformId = `so_0,q_auto,f_auto/${id}`;
    const res = {
      id,
      type: path?.split('.').pop() || 'mp4',
      thumbnail,
      transformId,
      videoRoot,
    };
    return res;
  }
};

export const AiFileType = {
  VIDEO: 'video',
  DOC: 'doc',
};

export const getAssemblerInstruction = () => async (dispatch, getState) => {
  const { selectedVariants } = getState().productOptions;
  const currentProduct = selectCurrentProduct(getState());
  let assemblyFiles = [];

  if (currentProduct.product_type === 'bundle') {
    const res = await Promise.all(Object.entries(selectedVariants).map(([, variantId]) => getVariantById(variantId)));
    for (const { assembly_files = [] } of res) {
      assemblyFiles.push(...assembly_files);
    }
  } else {
    const { assembly_files = [] } = selectCurrentVariant(getState());
    assemblyFiles = [...assembly_files];
  }

  // remove duplicates
  assemblyFiles = [...new Map(assemblyFiles.map((item) => [item.filename, item])).values()];

  const aiVideos = assemblyFiles
    .filter(({ filetype }) => filetype === AiFileType.VIDEO)
    .map((item) => {
      // effect
      item.videoInfo = genVideoInfo(item.file_link || '');
      return item;
    });

  const aiDocs = assemblyFiles.filter(({ filetype }) => filetype === AiFileType.DOC);

  return {
    aiVideos,
    aiDocs,
  };
};

export const setImageQuality = (imageParam) => (dispatch) => {
  dispatch({
    type: UPDATE_IMAGE_QUALITY,
    data: {
      imageParam,
    },
  });
};
