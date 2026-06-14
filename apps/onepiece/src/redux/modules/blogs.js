const LOAD = 'blogs/LOAD';
const LOAD_SUCCESS = 'blogs/LOAD_SUCCESS';
const LOAD_FAIL = 'blogs/LOAD_FAIL';
const CLEAN = 'blogs/CLEAN';

const PER_PAGE = 10;

const initialState = {
  loading: true,
  page: 0,
  totalPages: 1,
  data: [],
};

export default function blogs(state = initialState, action = {}) {
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
        data: [...state.data, ...action.result.results],
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
      };
    case CLEAN:
      return {
        ...state,
        page: 1,
        data: state.data,
      };
    default:
      return state;
  }
}

const getStoryblokBlogPageList = () =>
  new Promise((resolve, reject) => {
    if (!__storyblokBlogPages) {
      reject('Error: can not find __storyblokBlogPages in window object.');
    }
    const pages = __storyblokBlogPages;
    resolve(pages);
  });

export function load(page) {
  return (dispatch, getState) =>
    // const { blogs } = getState();
    // if (blogs && blogs.totalPages <= blogs.page) {
    //   const result = Promise.reject();
    //   result.catch(() => {});
    //   return result;
    // }
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: () =>
        getStoryblokBlogPageList(page).then((pages) => ({
          results: pages,
        })),
    });
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    const { blogs } = getState();
    if (blogs && blogs.page > 0) {
      return Promise.resolve(blogs.data);
    }
    return dispatch(load());
  };
}

export function clean() {
  return {
    type: CLEAN,
  };
}
