const SET = 'searchkitState/SET';
const CLEAR = 'searchkitState/CLEAR';

const initialState = {};

export default function searchkitState(state = initialState, action = {}) {
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

export function get() {
  return (dispatch, getState) => {
    const state = { ...getState().searchkitState.data };
    return state;
  };
}
