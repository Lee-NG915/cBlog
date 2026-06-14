export {
  // API (server-side)
  trackDYApiRecommendationsEngagementEvent as EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT,
  trackDYApiCustomCodeCampaignEngagementEvent as EVENT_DY_API_CUSTOM_CODE_CAMPAIGN_ENGAGEMENT,
  // Cart
  trackDYAddToCartEvent as EVENT_DY_ADD_TO_CART,
  trackDYAddToCartEventV2 as EVENT_DY_ADD_TO_CART_V2,
  trackDYRemoveFromCartEvent as EVENT_DY_REMOVE_FROM_CART,
  trackDYSwatchAddToCartEvent as EVENT_DY_SWATCH_ATC,
  trackDYSwatchAddToCartEvent as EVENT_DY_SWATCH_ADD_TO_CART,
  // Wishlist
  trackDYAddToWishlistEvent as EVENT_DY_ADD_TO_WISHLIST,
  // Purchase
  trackDYPurchaseEvent as EVENT_DY_PURCHASE,
  trackDYSwatchPurchaseEvent as EVENT_DY_SWATCH_PURCHASE,
  // Search & Filter
  trackDYKeywordSearchEvent as EVENT_DY_KEYWORD_SEARCH,
  trackDYFilterItemsEvent as EVENT_DY_FILTER_ITEMS,
  // User
  trackDYSignupEvent as EVENT_DY_SIGNUP,
  trackDYLoginEvent as EVENT_DY_LOGIN,
  trackDYNewsletterSubscriptionEvent as EVENT_DY_NEWSLETTER_SUBSCRIPTION,
  // Checkout
  trackDYPromoCodeEnteredEvent as EVENT_DY_PROMO_CODE_ENTERED,
} from '../triggers/dy-events.trigger';
