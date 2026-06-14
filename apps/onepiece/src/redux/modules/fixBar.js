import { hasSubscribed } from 'utils/cookies';
import { get as getCookie, set as setCookie } from 'helpers/Cookie';

const SHOW = 'fixBar/SHOW';
const HIDE = 'fixBar/HIDE';
export const PRODUCTS_NUM = 3;

const initialState = {
  hidden: true,
};

export default function fixBar(state = initialState, action = {}) {
  switch (action.type) {
    case SHOW:
      return {
        ...state,
        hidden: false,
      };
    case HIDE:
      return {
        ...state,
        hidden: true,
      };
    default:
      return state;
  }
}

export function load() {
  return (dispatch, getState) => {
    const { user } = getState().auth;

    // don't do anything if user is logged in
    if (!user) {
      const viewedProducts = JSON.parse(getCookie('viewed_products') || '[]');
      const fixBarHidden = JSON.parse(getCookie('fixbar_hidden') || false);
      // const isSubscribed = JSON.parse(getCookie('has_subscribed') || false);
      const isSubscribed = hasSubscribed();

      if (viewedProducts.length >= PRODUCTS_NUM && !isSubscribed && !fixBarHidden) {
        dispatch({
          type: SHOW,
        });
      } else {
        dispatch({
          type: HIDE,
        });
      }
    }
  };
}

export function record(id) {
  return (dispatch, getState) => {
    const { user } = getState().auth;

    // don't do anything if user is logged in
    if (!user) {
      const viewedProducts = JSON.parse(getCookie('viewed_products') || '[]');
      const fixBarHidden = JSON.parse(getCookie('fixbar_hidden') || false);
      // const isSubscribed = JSON.parse(getCookie('has_subscribed') || false);
      const isSubscribed = hasSubscribed();
      const isNotViewed = viewedProducts.indexOf(id) === -1;

      if (!isSubscribed && viewedProducts.length < PRODUCTS_NUM && isNotViewed) {
        viewedProducts.push(id);
        setCookie('viewed_products', JSON.stringify(viewedProducts), 7);
        if (viewedProducts.length >= PRODUCTS_NUM && !fixBarHidden) {
          // delay for better user experience

          setTimeout(
            () =>
              dispatch({
                type: SHOW,
              }),
            1000
          );
        }
      }
    }
  };
}

export function hide(duration = 7) {
  return (dispatch) => {
    setCookie('fixbar_hidden', JSON.stringify(true), duration);
    dispatch({
      type: HIDE,
    });
  };
}
