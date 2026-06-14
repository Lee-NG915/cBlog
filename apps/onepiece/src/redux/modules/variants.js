import { getVariantByIds, getVariantCollectionList } from 'api/product';

const LOAD = 'variants/LOAD';
const LOAD_SUCCESS = 'variants/LOAD_SUCCESS';
const LOAD_FAIL = 'variants/LOAD_FAIL';

const initialState = {};

export default function variants(state = initialState, action = {}) {
  if (action.type === LOAD_SUCCESS) {
    const result = action.result.reduce(
      (prev, curr) => ({
        ...prev,
        [curr.id]: curr,
      }),
      {}
    );
    return {
      ...state,
      ...result,
    };
  }
  return {
    ...state,
  };
}

export function load(variantIDArray) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/variants', {
        auth: 'loose',
        params: {
          ids: variantIDArray.toString(),
        },
      }),
  };
}

export function loadIfNeeded(variantIDArray) {
  return (dispatch, getState) => {
    let shouldLoad = false;
    variantIDArray.forEach((id) => {
      if (!getState().variants[id]) {
        shouldLoad = true;
      }
    });
    if (shouldLoad) {
      return dispatch(load(variantIDArray));
    }
    return Promise.resolve();
  };
}

// get category from variantId
export const getVariantsCategories = async (variantIds) => {
  if (!variantIds || variantIds.length === 0) {
    return [];
  }
  try {
    const res = await getVariantByIds(variantIds);
    if (res) {
      const categories = res.map((variant) => {
        const level1Item = variant?.breadcrumbs?.find((item) => item.level === 2);
        return level1Item?.name;
      });
      return categories;
    }
  } catch (e) {
    return [];
  }
};

export const getVariantCollection = async (params) => {
  try {
    const result = await getVariantCollectionList(params);
    if (result?.errors) {
      console.error(JSON.stringify({ message: 'Variants result errors', errors: result.errors }, null, 2));
      return null;
    }
    return result;
  } catch (error) {
    console.error(JSON.stringify({ message: 'Variants operation error', error }, null, 2));
    return null;
  }
};
