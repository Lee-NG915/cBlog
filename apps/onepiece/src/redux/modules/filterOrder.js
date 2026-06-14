const LOAD = 'filterOrder/LOAD';
const LOAD_SUCCESS = 'filterOrder/LOAD_SUCCESS';
const LOAD_FAIL = 'filterOrder/LOAD_FAIL';

const initialState = {
  filterOrder: {},
};

export default function filterOrder(state = initialState, action = {}) {
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
        [action.result.name]: action.result,
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

export const load = (property) => (dispatch) =>
  dispatch({
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get(`/properties/${property}`),
  });
