const LOAD = 'globalReview/LOAD';
const LOAD_SUCCESS = 'globalReview/LOAD_SUCCESS';
const LOAD_FAIL = 'globalReview/LOAD_FAIL';

const initialState = {
  loading: false,
  visitedArray: [],
};

export default function globalReview(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      // return {
      //   ...state,
      //   loading: false,
      //   data: action.result,
      // };
      return {
        ...state,
        loading: false,
        data: action.result,
        visitedArray: [...state.visitedArray, action.code],
        country: action.country,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
}

export function load(variantCode, country, orderItems, pageNumber, bundleVariantCodes = '') {
  return async (dispatch) => {
    const params = {
      variant_code: variantCode,
      country,
      order_by: orderItems,
      page: pageNumber,
      per_page: 5,
      bundle_variant_codes: bundleVariantCodes,
    };

    try {
      await dispatch({
        types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
        promise: (client) =>
          client.get(`/gw/reviews/by_variant`, {
            params: {
              ...params,
            },
          }),
        country,
        code: `${variantCode}+${bundleVariantCodes}`,
      });
    } catch (error) {
      console.log('🚀 ~ file: globalReview.js:59 ~ return ~ error:', error);
    }
  };
}

export function needLoad(globalState) {
  return !(globalState.globalReview && globalState.globalReview.data);
}

// eslint-disable-next-line default-param-last
export function loadIfNeeded(variantCode, country, orderItems, pageNumber = 1, productBundleVariantCode) {
  return (dispatch) =>
    // if (needLoad(getState())) {
    //   console.log('in hehre');
    //   return dispatch(load());
    // }
    dispatch(load(variantCode, country, orderItems, pageNumber, productBundleVariantCode));
}
