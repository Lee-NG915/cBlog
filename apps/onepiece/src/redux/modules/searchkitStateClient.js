const SET = 'searchkitStateClient/SET';
const CLEAR = 'searchkitStateClient/CLEAR';

const initialState = {};

export default function searchkitStateClient(state = initialState, action = {}) {
  switch (action.type) {
    case SET:
      return {
        ...state,
        data: action.data,
      };
    case CLEAR:
      return initialState;
    default:
      return state;
  }
}

export function set(data) {
  return {
    type: SET,
    data,
  };
}

function clear() {
  return {
    type: CLEAR,
  };
}

export function get() {
  return (dispatch, getState) => {
    const state = { ...getState().searchkitStateClient.data };
    if (__CLIENT__ && Object.keys(state).length > 0) {
      dispatch(clear());
    }
    return state;
  };
}
