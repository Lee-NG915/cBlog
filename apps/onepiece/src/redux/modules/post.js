const LOAD = 'post/LOAD';
const LOAD_SUCCESS = 'post/LOAD_SUCCESS';
const LOAD_FAIL = 'post/LOAD_FAIL';

const initialState = {
  loading: true,
};

export default function post(state = initialState, action = {}) {
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
        [action.result.slug]: action.result,
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

export function load(slug) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get(`/blogs/${slug}`),
  };
}

export function loadIfNeeded(slug) {
  return (dispatch, getState) => {
    if (!getState().post[slug]) {
      return dispatch(load(slug));
    }
    return Promise.resolve();
  };
}
