import { getUrl } from 'pages';
import {
  EVENT_CHECKOUT,
  EVENT_PAGE_VIEW,
  EVENT_PRODUCT_DETAIL,
  EVENT_VARIANT_DETAIL,
  EVENT_PRODUCT_PAGE_VIEW_MORE_THAN_3,
} from './constants';

function isProductDetail(pathname) {
  return [getUrl('product'), getUrl('pla')].some((url) => pathname?.startsWith(url));
}

function getCheckoutStep(pathname) {
  const urls = [getUrl('checkout-shipping-address'), getUrl('checkout-shipping-method'), getUrl('checkout-payment')];
  const index = urls.findIndex((url) => pathname === url);
  return index + 2;
}

/*
  note: Do not moidfy the content of action, preState and nextState directly. Make sure to update in a duplicate of them only.
*/
export default function registerTracking(event, target, action, preState, nextState, dispatch) {
  if (typeof event === 'function' && typeof target === 'function') {
    const data = event(action, preState, nextState);
    if (data instanceof Array && data.length) {
      data.forEach((item) => {
        if (item) target(item);
      });
    } else if (data instanceof Object) {
      target(data);
    }
    // trigger event after pageview immediately
    if (action.type === EVENT_PAGE_VIEW) {
      const { pathname } = action.result;

      if (isProductDetail(pathname)) {
        dispatch({ type: EVENT_PRODUCT_DETAIL });
        dispatch({ type: EVENT_VARIANT_DETAIL });
        dispatch({
          type: EVENT_PRODUCT_PAGE_VIEW_MORE_THAN_3,
        });
        return;
      }
      const checkoutStep = getCheckoutStep(pathname);
      if (checkoutStep > 1) {
        dispatch({ type: EVENT_CHECKOUT, result: { checkoutStep } });
      }
    }
  }
}
