const LOAD = 'reviews/LOAD';
const LOAD_SUCCESS = 'reviews/LOAD_SUCCESS';
const LOAD_FAIL = 'reviews/LOAD_FAIL';
const CHANGE_PAGE = 'reviews/CHANGE_PAGE';

const initialState = { lastLoadPage: 1 };

export default function reviews(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.current_page]: {
          loading: true,
        },
        lastLoadPage: action.current_page,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.current_page]: {
          loading: false,
          loaded: true,
          data: action.result,
        },
        totalPages: action.result.total_pages,
        lastLoadPage: action.result.current_page,
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.current_page]: {
          loading: false,
          loaded: false,
          error: action.error,
        },
        lastLoadPage: action.current_page,
      };
    case CHANGE_PAGE: {
      return {
        ...state,
        lastLoadPage: action.current_page,
      };
    }
    default:
      return state;
  }
}

export function needLoad(current_page, globalState) {
  return !(
    !current_page ||
    (globalState.reviews && globalState.reviews[current_page] && globalState.reviews[current_page].loaded)
  );
}

export function load(current_page, reviewsPerPage = 10) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get(`/gw/reviews/all`, {
        params: {
          page: current_page || 1,
          per_page: reviewsPerPage,
        },
      }),
    current_page,
  };
}

export function loadIfNeeded(current_page, reviewsPerPage = 10) {
  return (dispatch, getState) => {
    const totalPage = getState().reviews.totalPages;
    if (totalPage && current_page > totalPage) {
      // eslint-disable-next-line no-param-reassign
      current_page = totalPage;
    }
    if (needLoad(current_page, getState())) {
      return dispatch(load(current_page, reviewsPerPage));
    }
    dispatch(changeCurrentPage(current_page));
    return Promise.resolve(getState().reviews[current_page].data);
  };
}

export function changeCurrentPage(current_page) {
  return (dispatch) => {
    dispatch({ type: CHANGE_PAGE, current_page });
  };
}
