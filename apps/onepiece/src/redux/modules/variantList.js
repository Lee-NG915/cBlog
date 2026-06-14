const LOAD = 'homeList/LOAD';
const LOAD_SUCCESS = 'homeList/LOAD_SUCCESS';
const LOAD_FAIL = 'homeList/LOAD_FAIL';

const initialState = {};

export default function variantList(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.id]: {
          loading: true,
        },
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.id]: {
          loading: false,
          data: action.result,
        },
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.id]: {
          loading: false,
          error: action.error,
        },
      };
    default:
      return state;
  }
}

function needLoad(id, variantList) {
  return id && !(variantList && variantList[id] && variantList[id].data);
}

function _load(id) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get(`/variant_collections/${id}`),
      id,
    }).catch(() => {});
}

function _loadIfNeeded(id) {
  return (dispatch, getState) => {
    if (needLoad(id, getState().variantList)) {
      return dispatch(load(id));
    }
    return Promise.resolve();
  };
}

export function load(ids) {
  return (dispatch) => {
    if (Array.isArray(ids)) {
      return Promise.all(ids.map((id) => dispatch(_load(id))));
    }
    return dispatch(_load(ids));
  };
}

export function loadIfNeeded(ids) {
  return (dispatch) => {
    if (Array.isArray(ids)) {
      return Promise.all(ids.map((id) => dispatch(_loadIfNeeded(id))));
    }
    return dispatch(_loadIfNeeded(ids));
  };
}

export function loadExpress(params) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) =>
        client.get('/express_delivery', {
          params,
        }),
      id: 'express_delivery',
    });
}

export function loadExpressIfNeeded(params) {
  return (dispatch, getState) => {
    if (needLoad('express_delivery', getState().variantList)) {
      return dispatch(loadExpress(params));
    }
    return Promise.resolve();
  };
}
