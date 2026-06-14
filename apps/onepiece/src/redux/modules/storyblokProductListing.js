import { postProductSearch } from 'api/search';
import { _sortFilterVariantsByColor } from 'containers/Category/EnhancedSearchkitManager/utils';

const LOAD = 'storyblokProductListing/LOAD';
const LOAD_SUCCESS = 'storyblokProductListing/LOAD_SUCCESS';
const LOAD_FAIL = 'storyblokProductListing/LOAD_FAIL';

const initialState = {};

export default function storyblokProductListing(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.uid]: {
          loading: true,
        },
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.uid]: {
          loading: false,
          data: action.result?.hits?.hits?.map((h) => ({
            ...h._source,
            ..._sortFilterVariantsByColor(h._source.variants),
          })),
        },
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.uid]: {
          loading: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}

export function load({ uid, productId }) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: () =>
        postProductSearch({
          query: {
            bool: {
              must: {
                ids: {
                  values: [...(Array.isArray(productId) ? productId : [productId])],
                },
              },
              filter: {
                nested: {
                  path: 'variants',
                  query: {
                    bool: {
                      filter: {
                        exists: {
                          field: 'variants',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      uid,
    });
}
