const LOAD = 'stores/LOAD';
const LOAD_SUCCESS = 'stores/LOAD_SUCCESS';
const LOAD_FAIL = 'stores/LOAD_FAIL';

const initialState = {
  loading: true,
};

export default function stores(state = initialState, action = {}) {
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
        data: action.result,
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

export function needLoad(globalState) {
  return !(globalState.stores && globalState.stores.data);
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/retails'),
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState())) {
      return dispatch(load());
    }
    return Promise.resolve(getState().stores.data);
  };
}
