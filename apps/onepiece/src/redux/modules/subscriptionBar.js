import { hasSubscribed } from 'utils/cookies';

const HIDE = 'subscriptionBar/HIDE';
const SHOW = 'subscriptionBar/SHOW';

const initialState = {
  hidden: true,
  showOnProductPage: false,
  showOnHomePage: false,
};

export default function subscriptionBar(state = initialState, action = {}) {
  switch (action.type) {
    case SHOW:
      return {
        ...state,
        showOnProductPage: false,
        showOnHomePage: true,
        hidden: false,
      };
    case HIDE:
      return {
        ...state,
        showOnProductPage: action.showOnProductPage,
        showOnHomePage: action.showOnHomePage,
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
      // const isSubscribed = JSON.parse(getCookie('has_subscribed') || false);
      const isSubscribed = hasSubscribed();

      if (isSubscribed) {
        dispatch({
          type: HIDE,
          showOnProductPage: false,
          showOnHomePage: false,
        });
      } else {
        dispatch({
          type: SHOW,
        });
      }
    } else {
      dispatch({
        type: HIDE,
        showOnProductPage: false,
        showOnHomePage: false,
      });
    }
  };
}

export function hideSubscriptionBar({ showOnProductPage = true, showOnHomePage = true } = {}) {
  return (dispatch) => {
    dispatch({
      type: HIDE,
      showOnProductPage,
      showOnHomePage,
    });
  };
}
