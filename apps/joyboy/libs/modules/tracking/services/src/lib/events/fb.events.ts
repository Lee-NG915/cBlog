export {
  // Product
  trackFacebookViewContentEvent as EVENT_FB_VIEW_CONTENT,
  trackFacebookProductViewMoreThan3Event as EVENT_PRODUCT_VIEW_MORE_THAN_3,
  trackFacebookProductViewMoreThan3Event as EVENT_FB_PRODUCT_VIEW_MORE_THAN_3,
  // Cart
  trackFacebookAddToCartEvent as EVENT_FB_ADD_TO_CART,
  trackFacebookAddSwatchToCartEvent as EVENT_FB_ADD_SWATCH_TO_CART,
  // Wishlist
  trackFacebookAddToWishlistEvent as EVENT_FB_ADD_TO_WISHLIST,
  // Checkout
  trackFacebookInitiateCheckoutEvent as EVENT_FB_INITIATE_CHECKOUT,
  trackFacebookAddPaymentInfoEvent as EVENT_FB_ADD_PAYMENT_INFO,
  // Purchase
  trackFacebookPurchaseEvent as EVENT_FB_PURCHASE,
  trackFacebookSwatchPurchaseEvent as EVENT_FB_SWATCH_PURCHASE,
  trackFacebookNewCustomerPurchaseEvent as EVENT_FB_NEW_CUSTOMER_PURCHASE,
  // User
  trackFacebookCompleteRegistrationEvent as EVENT_FB_COMPLETE_REGISTRATION,
  trackFacebookNewsletterSubscriptionEvent as EVENT_FB_NEWSLETTER_SUBSCRIPTION,
  trackFacebookActWithSignupEvent as EVENT_FB_CAPI_CUSTOM_ACT_WITH_SIGNUP,
  trackFacebookActWithSignupEvent as EVENT_FB_ACT_WITH_SIGNUP,
} from '../triggers/fb-capi-events.trigger';
