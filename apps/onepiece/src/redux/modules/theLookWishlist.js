import { v4 as uuidV4 } from 'uuid';
import * as Cookie from 'helpers/Cookie';

const LOAD = 'theLookWishlist/LOAD';
const LOAD_SUCCESS = 'theLookWishlist/LOAD_SUCCESS';
const LOAD_FAIL = 'theLookWishlist/LOAD_FAIL';
const ADD = 'theLookWishlist/ADD';
const ADD_SUCCESS = 'theLookWishlist/ADD_SUCCESS';
const ADD_FAIL = 'theLookWishlist/ADD_FAIL';
const REMOVE = 'theLookWishlist/REMOVE';
const REMOVE_SUCCESS = 'theLookWishlist/REMOVE_SUCCESS';
const REMOVE_FAIL = 'theLookWishlist/REMOVE_FAIL';

const initialState = {
  loading: true,
  loaded: false,
  processing: false,
  data: [],
};

export default function theLookWishlist(state = initialState, action = {}) {
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
        data:
          state.data.findIndex((d) => d.shop_the_look_id === action.result.shop_the_look_id) > -1
            ? state.data
            : [...state.data, action.result],
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
        data: state.data.filter((d) => d.shop_the_look_id !== action.result.shop_the_look_id),
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

export function load() {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    const guestToken = Cookie.get('guest_token');

    if (accessToken) {
      if (guestToken) {
        return dispatch({
          types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
          promise: (client) =>
            client.put('/wish_items_looks/merge', {
              auth: 'strict',
              header: {
                'X-Guest-Token': guestToken,
              },
              credentials: 'include',
            }),
        });
      }
      return dispatch({
        types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
        promise: (client) => client.get('/wish_items_looks', { auth: 'strict', credentials: 'include' }),
      });
    }
    if (guestToken) {
      return dispatch({
        types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
        promise: (client) =>
          client.get(`/wish_items_looks`, {
            header: {
              'X-Guest-Token': guestToken,
            },
            credentials: 'include',
          }),
      });
    }
    dispatch({
      type: LOAD_FAIL,
    });
    return Promise.resolve();
  };
}

export function add(payload) {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    let guestToken = Cookie.get('guest_token');

    if (accessToken) {
      return dispatch({
        types: [ADD, ADD_SUCCESS, ADD_FAIL],
        promise: (client) =>
          client.post(`/wish_items_looks/${payload.shop_the_look_id}`, {
            auth: 'strict',
            data: payload,
            credentials: 'include',
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
        client.post(`/wish_items_looks/${payload.shop_the_look_id}`, {
          header: {
            'X-Guest-Token': guestToken,
          },
          data: payload,
          credentials: 'include',
        }),
    });
  };
}

export function remove(payload) {
  return (dispatch) => {
    const accessToken = Cookie.get('access_token');
    const guestToken = Cookie.get('guest_token');

    if (accessToken) {
      return dispatch({
        types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
        promise: (client) =>
          client.del(`/wish_items_looks/${payload.shop_the_look_id}`, {
            auth: 'strict',
            credentials: 'include',
          }),
      });
    }
    if (!guestToken) {
      return Promise.reject();
    }

    return dispatch({
      types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
      promise: (client) =>
        client.del(`/wish_items_looks/${payload.shop_the_look_id}`, {
          header: {
            'X-Guest-Token': guestToken,
          },
          credentials: 'include',
        }),
    });
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (!getState().theLookWishlist.loaded) {
      return dispatch(load());
    }
    return Promise.resolve();
  };
}
