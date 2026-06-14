const LOAD = 'productList/LOAD';
const LOAD_SUCCESS = 'productList/LOAD_SUCCESS';
const LOAD_FAIL = 'productList/LOAD_FAIL';

const initialState = {
  loaded: false,
};

export default function productList(state = initialState, action = {}) {
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
        loaded: false,
        error: action.error,
      };
    default:
      return state;
  }
}

export function needLoad(globalState) {
  return !(globalState.productList && (globalState.productList.loading || globalState.productList.loaded));
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/products'),
  };
}
