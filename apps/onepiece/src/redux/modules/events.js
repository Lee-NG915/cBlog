const LOAD = 'events/LOAD';
const LOAD_SUCCESS = 'events/LOAD_SUCCESS';
const LOAD_FAIL = 'events/LOAD_FAIL';

const initialState = {
  loading: true,
};

export default function events(state = initialState, action = {}) {
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

export function needLoad(globalState) {
  return !(globalState.events && globalState.events.data);
}

export function load(ids) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get('/events', {
        params: {
          ids: Array.isArray(ids) ? ids.join(',') : ids,
        },
      }),
  };
}

export function loadIfNeeded(ids) {
  return (dispatch, getState) => {
    if (needLoad(getState())) {
      return dispatch(load(ids));
    }
    return Promise.resolve(getState().events.data);
  };
}
