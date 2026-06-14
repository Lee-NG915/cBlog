import { genVideoInfo, selectCurrentVariantIds } from './productOptions';

const LOAD = 'socialUgcs/LOAD';
const LOAD_SUCCESS = 'socialUgcs/LOAD_SUCCESS';
const LOAD_FAIL = 'socialUgcs/LOAD_FAIL';

/**
 * Merge the subarrays of a two-dimensional array to return an ordered one-dimensional array
 * Suppose A B C denotes a subarray in a two-dimensional array,
 * and `A1` denotes the 1st element of the array A
 * The order is: `A1` `B1` `C1` `A2` `B2` `C2`
 * In the case that `B2` is the same as the previous element, jump to `B3` until a different element is found
 * For example, suppose `B2` == `A1` , `B3` == `C1`, then the return order should be `A1` `B1` `C1` `A2` `B4` `C2`
 *
 * ![img](https://s2.loli.net/2023/03/09/rnpoxP4Kuh1w9ls.png)
 * @param {Array<Array<any>>} list - The list of sublists
 * @param {Function} keyItem - The function used to retrieve the key item used for sorting.
 * @returns {Array<any>} - The list of non-duplicate elements
 */
function mergeSort(list, keyItem) {
  const set = new Set();

  const result = []; // Get the maximum length of any sublist in the array
  const maxLength = Math.max(...list.map((sublist) => sublist.length));

  // Loop over each index up to the maximum length
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < maxLength; i++) {
    // Loop over each sublist in the array
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < list.length; j++) {
      let k = i;
      const sublist = list[j];

      // Check if the sublist has an element at the current index
      if (k < sublist.length) {
        while (k < sublist.length && set.has(keyItem(sublist[k]))) {
          k += 1;
        }
        if (!(k < sublist.length)) continue;
        if (set.has(keyItem(sublist[k]))) {
          continue;
        }
        result.push(sublist[k]);
        set.add(keyItem(sublist[k]));
      }
    }
  }
  return result;
}

export const selectCurrentPageUgcs = (state) => {
  // eslint-disable-next-line no-shadow
  const { socialUgcs = {} } = state;

  let res = [];

  const currentvariantIds = `${selectCurrentVariantIds(state)}`?.split(',') || [];
  if (Object.keys(socialUgcs).length === 0) {
    res.isLoading = true;
    return res;
  }
  const isLoading = Object.entries(socialUgcs)
    .map(([, { loading }]) => loading)
    .some((loading) => loading === true);
  if (isLoading) {
    res.isLoading = isLoading;
    return res;
  }

  const socialUgcsArr = currentvariantIds.map((variantId) => socialUgcs[variantId]?.data || []);

  res = mergeSort(socialUgcsArr, (item) => item.ugc_id)
    // for test video
    // .filter(({ file_type }) => ['video'].includes(file_type))
    .map(
      // eslint-disable-next-line camelcase
      ({
        asset_url: image,
        author,
        caption,
        file_type: fileType,
        source,
        variant_ids,
        ugc_id: _uid,
        start_offset: startOffset,
      }) => {
        const item = {
          image,
          ig_handle: author,
          content: caption,
          // eslint-disable-next-line camelcase
          variants: variant_ids?.join(','),
          fileType,
          component: source,

          _uid,
        };
        if (fileType === 'video') {
          const videoInfo = genVideoInfo(image, startOffset);
          item.videoInfo = videoInfo;
          item.image = videoInfo.thumbnail;
        }
        return item;
      }
    )
    .splice(0, 20);

  return res;
};

const initialState = {};
export default function socialUgcs(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.variantId]: {
          loading: true,
        },
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.variantId]: {
          loading: false,
          data: action?.result?.social_ugcs || [],
        },
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.variantId]: {
          loading: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}

// eslint-disable-next-line no-shadow
function needLoad(variantId, socialUgcs) {
  return variantId && !(socialUgcs && socialUgcs[variantId] && socialUgcs[variantId].data);
}

function _load(variantId) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get(`v3/variants/${variantId}/social_ugcs`),
      variantId,
    }).catch((e) => {
      console.log(`==============>e`);
      console.log(e);
    });
}

function _loadIfNeeded(variantId) {
  return (dispatch, getState) => {
    if (needLoad(variantId, getState().socialUgcs)) {
      return dispatch(_load(variantId));
    }
    return Promise.resolve();
  };
}

export function getCurrentSelectedUgcs() {
  return (dispatch, getState) => {
    const variantIds = selectCurrentVariantIds(getState()).split(',').filter(Boolean);

    if (variantIds.length === 0) {
      return Promise.resolve();
    }

    return Promise.all(variantIds.map((variantId) => dispatch(_loadIfNeeded(variantId))));
  };
}
