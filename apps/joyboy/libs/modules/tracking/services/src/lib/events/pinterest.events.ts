export {
  // Product
  trackPinterestPageVisitEvent as EVENT_PINTEREST_PAGE_VISIT,
  // Cart
  trackPinterestAddToCartEvent as EVENT_PINTEREST_ADD_TO_CART,
  trackPinterestAddSwatchToCartEvent as EVENT_PINTEREST_ADD_SWATCH_TO_CART,
  // Wishlist
  trackPinterestAddToWishlistEvent as EVENT_PINTEREST_ADD_TO_WISHLIST,
  // Purchase
  trackPinterestPurchaseEvent as EVENT_PINTEREST_PURCHASE,
  trackPinterestSwatchPurchaseEvent as EVENT_PINTEREST_SWATCH_PURCHASE,
  // Checkout
  trackPinterestInitiateCheckoutEvent as EVENT_PINTEREST_INITIATE_CHECKOUT,
  trackPinterestAddPaymentInfoEvent as EVENT_PINTEREST_ADD_PAYMENT_INFO,
  // User
  trackPinterestSignupEvent as EVENT_PINTEREST_SIGNUP,
  trackPinterestNewsletterSubscriptionEvent as EVENT_PINTEREST_NEWSLETTER_SUBSCRIPTION,
} from '../triggers/pinterest-capi-events.trigger';
