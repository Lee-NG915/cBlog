const LOAD_YOTPO_DETAILS = 'yotpo/LOAD_YOTPO_DETAILS';
const LOAD_YOTPO_DETAILS_SUCCESS = 'yotpo/LOAD_YOTPO_DETAILS_SUCCESS';
const LOAD_YOTPO_DETAILS_FAIL = 'yotpo/LOAD_YOTPO_DETAILS_FAIL';

const initialState = {
  customerYotpoDetails: null,
  customerYotpoPoints: 0,
};

export default function yotpo(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD_YOTPO_DETAILS:
      return {
        ...state,
        loadingYotpoPoints: true,
      };
    case LOAD_YOTPO_DETAILS_SUCCESS:
      return {
        ...state,
        customerYotpoDetails: action.result,
        customerYotpoPoints: action.result?.points_balance || 0,
      };
    case LOAD_YOTPO_DETAILS_FAIL:
      return {
        ...state,
        loadingYotpoPoints: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export function load(user) {
  const email = window?.encodeURIComponent(user?.email);
  return {
    types: [LOAD_YOTPO_DETAILS, LOAD_YOTPO_DETAILS_SUCCESS, LOAD_YOTPO_DETAILS_FAIL],
    promise: (client) =>
      client.get(`/yotpo/customers?customer_email=${email}`, {
        auth: 'strict',
      }),
  };
}
export function loadYotpoDetails() {
  return (dispatch, getState) =>
    Promise.resolve(getState().auth.user).then((user) => {
      if (__YOTPO_ENABLED__ && __CLIENT__ && user) {
        return dispatch(load(user));
      }
      return Promise.resolve(getState().yotpo);
    });
}
