const LOAD = 'swatches/LOAD';
const LOAD_SUCCESS = 'swatches/LOAD_SUCCESS';
const LOAD_FAIL = 'swatches/LOAD_FAIL';

const initialState = {};

export default function swatches(state = initialState, action = {}) {
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
          loaded: true,
          data: action.result,
        },
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.id]: {
          loading: false,
          loaded: false,
          data: action.error,
        },
      };
    default:
      return state;
  }
}

export function needLoad(id, globalState) {
  return !(!id || (globalState.swatches && globalState.swatches[id] && globalState.swatches[id].loaded));
}

export function load(id) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get(`/products/${id}/swatches`, {
        auth: 'loose',
      }),
    id,
  };
}

export function loadIfNeeded(id) {
  return (dispatch, getState) => {
    if (needLoad(id, getState())) {
      return dispatch(load(id));
    }
    return Promise.resolve();
  };
}
