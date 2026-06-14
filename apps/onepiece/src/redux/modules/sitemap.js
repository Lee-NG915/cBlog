const LOAD = 'sitemap/LOAD';
const LOAD_SUCCESS = 'sitemap/LOAD_SUCCESS';
const LOAD_FAIL = 'sitemap/LOAD_FAIL';

const initialState = {
  loading: true,
};

export default function sitemap(state = initialState, action = {}) {
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

export function load() {
  const needAuth = __APPLICATION_ENV__.includes('test') || __APPLICATION_ENV__.includes('uat');

  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) =>
        client.get(
          `${__ONE_PIECE_WEB_SERVER_NAME__}${
            __ONE_PIECE_WEB_SERVER_NAME__ === 'http://localhost' ? `:${__PORT__}` : ''
          }${__BASE_ROUTE__}/api/sitemap`,
          {
            params: {
              type: 'page',
            },
            ...(needAuth && {
              header: {
                authorization: `Basic Y2FzdGxlcnk6Y3NsciRUQGc=`,
              },
            }),
          }
        ),
    });
}

export function needLoad(globalState) {
  return !(globalState.sitemap && globalState.sitemap.data);
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState())) {
      return dispatch(load());
    }
    return Promise.resolve(getState().sitemap.data);
  };
}
