const LOAD = 'marketing/LOAD';
const LOAD_SUCCESS = 'marketing/LOAD_SUCCESS';
const LOAD_FAIL = 'marketing/LOAD_FAIL';
const LOAD_MENU_SUCCESS = 'marketing/LOAD_MENU_SUCCESS';
const initialState = {};

export default function variantList(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.slug]: {
          loading: true,
        },
      };
    case LOAD_SUCCESS: {
      return {
        ...state,
        [action.slug]: {
          loading: false,
          data: action.result,
        },
      };
    }
    case LOAD_FAIL:
      return {
        ...state,
        [action.slug]: {
          loading: false,
          error: action.error,
        },
      };
    case LOAD_MENU_SUCCESS:
      return {
        ...state,
        menu: {
          loading: false,
          data: action.result,
        },
      };
    default:
      return state;
  }
}

function needLoad(slug, marketing) {
  return slug && !(marketing && marketing[slug] && marketing[slug].data);
}

function _load(slug) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get(`/story_bloks/${slug}`),
      slug,
    });
}

export function initMenu() {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_MENU_SUCCESS, LOAD_FAIL],
      promise: () =>
        new Promise((resolve) => {
          if (global.__menuData) {
            resolve(global.__menuData);
          } else {
            resolve([]);
          }
        }),
    });
}

export function load(slugs) {
  return (dispatch) => {
    if (Array.isArray(slugs)) {
      return Promise.all(slugs.map((slug) => dispatch(_load(slug))));
    }
    return dispatch(_load(slugs));
  };
}

function _loadIfNeeded(slug) {
  return (dispatch, getState) => {
    if (needLoad(slug, getState().marketing)) {
      return dispatch(load(slug));
    }
    return Promise.resolve(getState().marketing[slug].data);
  };
}

export function loadIfNeeded(slugs) {
  return (dispatch) => {
    if (Array.isArray(slugs)) {
      return Promise.all(slugs.map((slug) => dispatch(_loadIfNeeded(slug))));
    }
    return dispatch(_loadIfNeeded(slugs));
  };
}
