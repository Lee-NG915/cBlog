/**
 * @description Facebook Conversion API Events Name (CAPI - Server To Server)
 * @see https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking/
 * @note 'Standard Events' and 'Custom Events' are different.
 * @example
 * FB_CAPI_PURCHASE: 'Purchase',
 * FB_CAPI_CUSTOM_SWATCH_PURCHASE: 'SwatchPurchase',
 */

export const FB_CAPI_EVENTS_NAME = {
  // standard events
  FB_CAPI_ADD_PAYMENT_INFO: 'AddPaymentInfo', // todo when order refactoring
  FB_CAPI_PURCHASE: 'Purchase', // todo when order refactoring
  FB_CAPI_INITIATE_CHECKOUT: 'InitiateCheckout', // todo when order refactoring
  FB_CAPI_ADD_TO_CART: 'AddToCart', // done
  FB_CAPI_ADD_TO_WISHLIST: 'AddToWishlist', // done
  FB_CAPI_COMPLETE_REGISTRATION: 'CompleteRegistration', // todo when login refactoring @jasper
  FB_CAPI_VIEW_CONTENT: 'ViewContent', // done

  // custom events
  FB_CAPI_CUSTOM_SWATCH_PURCHASE: 'SwatchPurchase', // todo when order refactoring
  FB_CAPI_CUSTOM_NEW_CUSTOMER_PURCHASE: 'NewCustomerPurchase', // todo when order refactoring
  FB_CAPI_CUSTOM_SWATCH_ATC: 'SwatchATC', // done
  FB_CAPI_CUSTOM_EVENT_SIGNUP: 'EventSignUp', // when track Appointment ,todo when order refactoring
  FB_CAPI_CUSTOM_PRODUCT_PAGE_VIEW_MORE_THAN_3: 'Product_page_view_more_than_3', // done
  FB_CAPI_CUSTOM_ACT_WITH_SIGNUP: 'AtcWithSignup', // when user adds to cart and signs up on the same day, track the event
};
