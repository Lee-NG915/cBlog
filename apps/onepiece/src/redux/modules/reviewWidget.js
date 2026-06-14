const LOAD = 'reviewWidget/LOAD';
const LOAD_SUCCESS = 'reviewWidget/LOAD_SUCCESS';
const LOAD_FAIL = 'reviewWidget/LOAD_FAIL';

const initialState = {};

export default function reviewWidget(state = initialState, action = {}) {
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

// FIXME: doesn't load again when limit changes
function needLoad(reviewWidget) {
  return !reviewWidget.loading && !(reviewWidget && reviewWidget.data);
}

export function load(options) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/product_reviews', {
        params: options,
      }),
  };
}

export function loadIfNeeded(options) {
  return (dispatch, getState) => {
    if (needLoad(getState().reviewWidget)) {
      return dispatch(load(options));
    }
    return Promise.resolve(getState().reviewWidget.data);
  };
}
