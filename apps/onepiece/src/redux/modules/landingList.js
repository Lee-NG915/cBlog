const LOAD = 'landingList/LOAD';
const LOAD_SUCCESS = 'landingList/LOAD_SUCCESS';
const LOAD_FAIL = 'landingList/LOAD_FAIL';

const initialState = {
  loading: true,
};

export default function landingList(state = initialState, action = {}) {
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

function needLoad(landingList) {
  return !(landingList && landingList.data);
}

export function load() {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) => client.get('/landing/landing_list'),
    });
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().landingList)) {
      return dispatch(load());
    }
    return Promise.resolve();
  };
}
