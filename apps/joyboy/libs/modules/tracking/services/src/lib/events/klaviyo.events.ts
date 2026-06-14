export {
  // Product
  trackKlaviyoViewedProductEvent as EVENT_KL_VIEWED_PRODUCT,
  // Cart
  trackKlaviyoAddedToCartEvent as EVENT_KL_ADDED_TO_CART,
  trackKlaviyoAddedToCartEventV2 as EVENT_KL_ADDED_TO_CART_V2,
  // Checkout
  trackKlaviyoStartedCheckoutEvent as EVENT_KL_STARTED_CHECKOUT,
  // User
  trackKlaviyoIdentifyEvent as EVENT_KL_IDENTIFY,
} from '../triggers/klaviyo-events.trigger';
