const LOAD = 'instalment/LOAD';
const LOAD_SUCCESS = 'instalment/LOAD_SUCCESS';
const LOAD_FAIL = 'instalment/LOAD_FAIL';

const initialState = {
  loading: true,
  loaded: false,
};

export default function instalment(state = initialState, action = {}) {
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
        loaded: true,
        data: action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: true,
      };
    default:
      return state;
  }
}

function needLoad(instalment) {
  return !(instalment && instalment.data);
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) => client.get('/instalment_options'),
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().instalment)) {
      return dispatch(load());
    }
    return Promise.resolve(getState().instalment.data);
  };
}
