import { GIFT_POOLS } from 'containers/Account/config';
import { addCoupon } from 'redux/modules/cart';
import { couponAutoApplyFlag } from 'components/OrderSummary/util';

const LOAD = 'coupons/LOAD';
const LOAD_SUCCESS = 'coupons/LOAD_SUCCESS';
const LOAD_FAIL = 'coupons/LOAD_FAIL';

const initialState = {};

export default function coupons(state = initialState, action = {}) {
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

function handleAutoApply(dispatch, order, data) {
  const isEffectiveOrder = order && order.total > 0 && !order.coupon && order.line_items?.length > 0;
  const isSingleCoupon = data?.length === 1 && data?.[0]?.available === true;

  if (isEffectiveOrder && isSingleCoupon) {
    const { calculators = [], code } = data?.[0] || {};
    const notFreeGift = calculators?.length === 1 && calculators?.[0]?.type !== GIFT_POOLS;

    if (notFreeGift) {
      dispatch(addCoupon(code)).catch(() => {});
    }
  }
}

export function load(orderNumber, autoApply = true) {
  return (dispatch, getState) => {
    const loadPromise = dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: (client) =>
        client.get(`/checkouts/${orderNumber}/coupons`, {
          auth: 'strict',
        }),
    });

    return loadPromise
      .then((result) => {
        if (autoApply) {
          const order = getState().cart.data;
          const user = getState().auth.user;
          if (!couponAutoApplyFlag.isHitMark(user?.emailHashed, result?.[0]?.code)) {
            handleAutoApply(dispatch, order, result);
          }
        }
      })
      .catch(() => {});
  };
}

export function loadIfNeeded() {
  return (dispatch, getState) => {
    if (needLoad(getState().coupons)) {
      return dispatch(load());
    }
    return Promise.resolve(getState().coupons.data);
  };
}
