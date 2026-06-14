import { v4 as uuidV4 } from 'uuid';
import { getVariantByIds } from 'api/product';
import * as Cookie from 'helpers/Cookie';

const LOAD = 'wishlist/LOAD';
const LOAD_SUCCESS = 'wishlist/LOAD_SUCCESS';
const LOAD_FAIL = 'wishlist/LOAD_FAIL';
const ADD = 'wishlist/ADD';
const ADD_SUCCESS = 'wishlist/ADD_SUCCESS';
const ADD_FAIL = 'wishlist/ADD_FAIL';
const REMOVE = 'wishlist/REMOVE';
const REMOVE_SUCCESS = 'wishlist/REMOVE_SUCCESS';
const REMOVE_FAIL = 'wishlist/REMOVE_FAIL';

const initialState = {
  loading: true,
  loaded: false, // will be true whether success or failure
  processing: false, // represent adding and removing
  data: [],
};

export default function wishlist(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: [],
      };
    case ADD:
      return {
        ...state,
        processing: true,
      };
    case ADD_SUCCESS:
      return {
        ...state,
        processing: false,
        data: state.data.findIndex((d) => d.id === action.result.id) > -1 ? state.data : [...state.data, action.result],
      };
    case ADD_FAIL:
      return {
        ...state,
        processing: false,
      };
    case REMOVE:
      return {
        ...state,
        processing: true,
      };
    case REMOVE_SUCCESS:
      return {
        ...state,
        processing: false,
        data: state.data.filter((d) => d.id !== action.id),
      };
    case REMOVE_FAIL:
      return {
        ...state,
        processing: false,
      };
    default:
      return state;
  }
}

function needLoad(wishlist) {
  return !(wishlist && wishlist.loaded);
}

export function load() {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    const guestToken = Cookie.get('guest_token') || Cookie.get('wishlist_token');

    if (accessToken) {
      let loadPromise;

      // merge order if orderId and orderToken exist in cookie
      if (guestToken) {
        loadPromise = dispatch({
          types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
          promise: (client) =>
            client
              .put('/wish_items/merge', {
                auth: 'strict',
                header: {
                  'X-Guest-Token': guestToken,
                },
                credentials: 'include',
              })
              .then((result) => {
                const variantIds = result?.map((item) => item?.id);
                if (variantIds && variantIds.length > 0) {
                  return getVariantByIds(variantIds);
                }
                return Promise.resolve([]);
              }),
        });
      } else {
        loadPromise = dispatch({
          types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
          promise: (client) =>
            client.get('/wish_items', { auth: 'strict', credentials: 'include' }).then((result) => {
              const variantIds = result?.map((item) => item?.id);
              if (variantIds && variantIds.length > 0) {
                return getVariantByIds(variantIds);
              }
              return Promise.resolve([]);
            }),
        });
      }
      return loadPromise;
    }
    if (guestToken) {
      return dispatch({
        types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
        promise: (client) =>
          client
            .get(`/wish_items`, {
              header: {
                'X-Guest-Token': guestToken,
              },
              credentials: 'include',
            })
            .then((result) => {
              const variantIds = result?.map((item) => item?.id);
              if (variantIds && variantIds.length > 0) {
                return getVariantByIds(variantIds);
              }
              return Promise.resolve([]);
            }),
      });
    }
    dispatch({
      type: LOAD_FAIL,
    });

    // make sure always return a promise.
    return Promise.resolve();
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().wishlist)) {
      return dispatch(load());
    }
    return Promise.resolve();
  };
}

export function add(id) {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    let guestToken = Cookie.get('guest_token') || Cookie.get('wishlist_token');

    if (accessToken) {
      return dispatch({
        types: [ADD, ADD_SUCCESS, ADD_FAIL],
        promise: (client) =>
          client.post(`/wish_items/${id}`, { auth: 'strict', credentials: 'include' }).then(async (result) => {
            const variantIds = [result?.id];
            if (variantIds && variantIds.length > 0) {
              const variantResult = await getVariantByIds(variantIds);
              if (variantResult?.length > 0) {
                return variantResult[0];
              }
              return Promise.reject(new Error(`Failed to get variant data for id: ${result?.id}`));
            }
            return Promise.reject(new Error(`Invalid variant id from first API call: ${result?.id}`));
          }),
      });
    }
    if (!guestToken) {
      guestToken = uuidV4();
      Cookie.set('guest_token', guestToken);
    }

    return dispatch({
      types: [ADD, ADD_SUCCESS, ADD_FAIL],
      promise: (client) =>
        client
          .post(`/wish_items/${id}`, {
            header: {
              'X-Guest-Token': guestToken,
            },
            credentials: 'include',
          })
          .then(async (result) => {
            const variantIds = [result?.id];
            if (variantIds && variantIds.length > 0) {
              const variantResult = await getVariantByIds(variantIds);
              if (variantResult?.length > 0) {
                return variantResult[0];
              }
              return Promise.reject(new Error(`Failed to get variant data for id: ${result?.id}`));
            }
            return Promise.reject(new Error(`Invalid variant id from first API call: ${result?.id}`));
          }),
    });
  };
}

export function remove(id) {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    const guestToken = Cookie.get('guest_token') || Cookie.get('wishlist_token');

    if (accessToken) {
      return dispatch({
        types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
        promise: (client) => client.del(`/wish_items/${id}`, { auth: 'strict', credentials: 'include' }),
        id,
      });
    }
    if (!guestToken) {
      return Promise.reject();
    }

    return dispatch({
      types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
      promise: (client) =>
        client.del(`/wish_items/${id}`, {
          header: {
            'X-Guest-Token': guestToken,
          },
          credentials: 'include',
        }),
      id,
    });
  };
}
