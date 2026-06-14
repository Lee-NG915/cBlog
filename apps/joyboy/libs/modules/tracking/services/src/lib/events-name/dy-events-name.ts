/**
 * @description DY Events Name
 * @see https://support.dynamicyield.com/hc/en-us/articles/360023172893-Events
 * @note To avoid conflicts with other platform event names, all event names keys begin with DY_
 * @example
 * DY_PURCHASE: 'Purchase',
 * DY_ADD_TO_CART: 'Add to Cart',
 */
export const DY_EVENTS_NAME = {
  DY_SWATCH_PURCHASE: 'Swatch Purchase', // todo when order refactoring
  DY_PURCHASE: 'Purchase', // todo when order refactoring
  DY_SWATCH_ATC: 'Swatch ATC', // done
  DY_ADD_TO_CART: 'Add to Cart', // done
  DY_REMOVE_FROM_CART: 'Remove from Cart', // todo when order refactoring
  DY_ADD_TO_WISHLIST: 'Add to Wishlist', // done
  DY_NEWSLETTER_SUBSCRIPTION: 'Newsletter Subscription', // todo when brand refresh
  DY_KEYWORD_SEARCH: 'Keyword Search', // todo when brand refresh
  DY_PROMO_CODE_ENTERED: 'Promo Code Entered', // todo when order refactoring
  DY_FILTER_ITEMS: 'Filter Items', // done
  DY_LOGIN: 'Login', // todo when login refactoring @jasper
  DY_SIGNUP: 'Signup', // todo when login refactoring @jasper
};
