// import { GIFT_POOLS } from 'containers/Account/config';
// import { addCoupon } from 'redux/modules/cart';
// import { couponAutoApplyFlag } from 'components/OrderSummary/util';

const LOAD = 'couponsV2/LOAD';
const LOAD_SUCCESS = 'couponsV2/LOAD_SUCCESS';
const LOAD_FAIL = 'couponsV2/LOAD_FAIL';

const initialState = {
  loading: false,
  data: [],
};

// 模拟数据

export default function couponsV2(state = initialState, action = {}) {
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
        error: action.error,
      };
    default:
      return state;
  }
}

function needLoad(coupons) {
  return !(coupons && coupons.data);
}

export function load(orderNumber) {
  return (dispatch) =>
    dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) =>
        client.get(`/checkouts/${orderNumber}/coupons_v2`, {
          auth: 'strict',
        }),
    });
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().coupons)) {
      return dispatch(load());
    }
    return Promise.resolve(getState().coupons.data);
  };
}
