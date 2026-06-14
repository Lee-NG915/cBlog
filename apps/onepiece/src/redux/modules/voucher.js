import config from 'config';

const LOAD = 'voucher/LOAD';
const LOAD_SUCCESS = 'voucher/LOAD_SUCCESS';
const LOAD_FAIL = 'voucher/LOAD_FAIL';
const initialState = {};

export default function voucher(state = initialState, action = {}) {
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
        data: config.enableNewPromotion ? action.result?.data?.vouchers : action.result,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    default:
      return state;
  }
}

function needLoad(voucher) {
  return !(voucher && voucher.data);
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get(config.enableNewPromotion ? '/api/v1/promotion/vouchers' : '/users/me/vouchers', {
        auth: 'strict',
      }),
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().voucher)) {
      return dispatch(load());
    }
    return Promise.resolve(getState().voucher.data);
  };
}
