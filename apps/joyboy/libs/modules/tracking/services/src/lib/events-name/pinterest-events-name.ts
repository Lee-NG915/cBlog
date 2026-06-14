// const eventNameEnum = {
//   // facebook event to pinterest event
//   ViewContent: 'page_visit',
//   AddToCart: 'add_to_cart',
//   CompleteRegistration: 'signup',
//   Purchase: 'checkout',
//   // NewCustomerPurchase: 'checkout',
//   Lead: 'lead',
// };

export const PINTEREST_CAPI_EVENTS_NAME = {
  PINTEREST_CAPI_PRODUCT_PAGE_VIEW: 'page_visit', // done
  PINTEREST_CAPI_ADD_TO_CART: 'add_to_cart', // done
  PINTEREST_CAPI_SIGNUP: 'signup', // todo when brand refresh
  PINTEREST_CAPI_PURCHASE: 'checkout', //todo when order refactoring
  PINTEREST_CAPI_LEAD: 'lead', // to  be confirmed
  // custom events
  PINTEREST_CAPI_CUSTOM_EVENT: 'custom', // done, wish list event
};
