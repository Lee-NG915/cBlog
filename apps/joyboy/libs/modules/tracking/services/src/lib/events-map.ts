/**
 * @deprecated Use `./events` for new imports. This compatibility layer is kept
 * for branches that still import from `events-map.ts` during the migration.
 */
export * from './events';
import {
  trackViewItemEvent,
  trackPDPImageImpressionEvent,
  trackProductDetailsEvent,
  trackPDPFAQEvent,
  trackPDPConfigurationEvent,
  trackLongLTEvent,
  trackMulberryWarrantyEvent,
  trackPDPImage5sEvent,
  trackPDPReviewSectionEvent,
  trackHowItSitsEvent,
  trackSocialWidgetEvent,
  trackAddToCartEvent,
  trackRemoveFromCartEvent,
  trackAddSwatchEvent,
  trackCartActionEvent,
  trackCheckoutActionEvent,
  trackProductPageView,
  trackAddToWishlistEvent,
  trackFacebookProductViewMoreThan3Event,
  trackingUSPImpression,
  trackingUSPClick,
  trackPLPProductImpressionEvent,
  trackPLPProductClickEvent,
  trackProductListingsFilterEvent,
  trackCustomerIdentifyEvent,
  trackCustomerIdentifyGAEvent,
  trackFormSubmitEvent,
  trackNewsletterSubscriptionEvent,
  trackCommonPageViewEvent,
  trackShippingSelectorEvent,
  trackingUgcClickEvent,
  trackDYKeywordSearchEvent,
  trackDYFilterItemsEvent,
  trackDYAddToWishlistEvent,
  trackDYAddToCartEvent,
  trackDYSwatchAddToCartEvent,
  trackDYPurchaseEvent,
  trackDYSignupEvent,
  trackUserIdentify,
  trackPageViewAfterAuthByModalEvent,
  trackStoryblokEvent,
  trackGeneralLinkClickEvent,
  trackCustomerReviewImpression,
  trackFacebookActWithSignupEvent,
  trackDYApiRecommendationsEngagementEvent,
  trackDYApiCustomCodeCampaignEngagementEvent,
  trackDYNewsletterSubscriptionEvent,
  trackDYPromoCodeEnteredEvent,
  trackDYLoginEvent,
  trackPDPSelectorEvent,
  trackPDPHullabalaBannerEvent,
  trackGladlyChatButtonClickEvent,
  trackSuggestionsResultEvent,
  trackSuggestionsSelectEvent,
  trackSearchResultsLoadedEvent,
  trackCasaEvent,
  trackRecommendationsEvent,
} from './triggers';

// Export individual constants for direct import

// PRODUCT
export const EVENT_VIEW_ITEM = trackViewItemEvent;
export const EVENT_PDP_IMAGE_IMPRESSION = trackPDPImageImpressionEvent;
export const EVENT_PDP_DETAILS = trackProductDetailsEvent;
export const EVENT_PDP_FAQ = trackPDPFAQEvent;
export const EVENT_RECOMMENDATIONS = trackRecommendationsEvent;
export const EVENT_PDP_CONFIGURATION = trackPDPConfigurationEvent;
export const EVENT_PDP_SELECTOR = trackPDPSelectorEvent;
export const EVENT_PDP_HULLABALA_BANNER = trackPDPHullabalaBannerEvent;
export const EVENT_PDP_IMAGE_5S = trackPDPImage5sEvent;
export const EVENT_PDP_PAGE_VIEW = trackProductPageView;
export const EVENT_PRODUCT_VIEW_MORE_THAN_3 = trackFacebookProductViewMoreThan3Event;
export const EVENT_PLP_PRODUCT_IMPRESSION = trackPLPProductImpressionEvent;
export const EVENT_PLP_PRODUCT_CLICK = trackPLPProductClickEvent;

// Cart
export const EVENT_ADD_TO_CART = trackAddToCartEvent;
export const EVENT_REMOVE_FROM_CART = trackRemoveFromCartEvent;
export const EVENT_CART_ACTION = trackCartActionEvent;
export const EVENT_DY_ADD_TO_CART = trackDYAddToCartEvent;

// Checkout
export const EVENT_CHECKOUT_ACTION = trackCheckoutActionEvent;

// USP
export const EVENT_USP_IMPRESSION = trackingUSPImpression;
export const EVENT_USP_CLICK = trackingUSPClick;

// Social UGC
export const EVENT_SOCIAL_WIDGET = trackSocialWidgetEvent;
export const EVENT_UGC_CLICK = trackingUgcClickEvent;

// Long Lead Time
export const EVENT_LONG_LT = trackLongLTEvent;

// Mulberry Warranty
export const EVENT_MULBERRY_WARRANTY = trackMulberryWarrantyEvent;

// Wishlist
export const EVENT_ADD_TO_WISHLIST = trackAddToWishlistEvent;
export const EVENT_DY_ADD_TO_WISHLIST = trackDYAddToWishlistEvent;

// Swatch
export const EVENT_ADD_SWATCH = trackAddSwatchEvent;
export const EVENT_DY_SWATCH_ATC = trackDYSwatchAddToCartEvent;

// Review
export const EVENT_PDP_REVIEW_SECTION = trackPDPReviewSectionEvent;
export const EVENT_HOW_IT_SITS = trackHowItSitsEvent;

// Filter
export const EVENT_PLP_FILTER = trackProductListingsFilterEvent;
export const EVENT_DY_FILTER_ITEMS = trackDYFilterItemsEvent;
export const EVENT_DY_KEYWORD_SEARCH = trackDYKeywordSearchEvent; // todo when website header refactoring @carl please read the README.md

// DY Events
export const EVENT_DY_PURCHASE = trackDYPurchaseEvent;
export const EVENT_DY_SIGNUP = trackDYSignupEvent;
export const EVENT_DY_LOGIN = trackDYLoginEvent;
export const EVENT_DY_PROMO_CODE_ENTERED = trackDYPromoCodeEnteredEvent;
export const EVENT_DY_NEWSLETTER_SUBSCRIPTION = trackDYNewsletterSubscriptionEvent;
export const EVENT_DY_SWATCH_ADD_TO_CART = trackDYSwatchAddToCartEvent;
export const EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT = trackDYApiRecommendationsEngagementEvent;
export const EVENT_DY_API_CUSTOM_CODE_CAMPAIGN_ENGAGEMENT = trackDYApiCustomCodeCampaignEngagementEvent;

// Identify
export const EVENT_IDENTIFY = trackUserIdentify;
export const EVENT_CUSTOMER_IDENTIFY = trackCustomerIdentifyEvent; // todo when login refactoring @jasper please read the README.md
export const EVENT_CUSTOMER_IDENTIFY_GA = trackCustomerIdentifyGAEvent;

// Form Submit
export const EVENT_FORM_SUBMIT = trackFormSubmitEvent;

// Newsletter Subscription
export const EVENT_NEWSLETTER_SUBSCRIPTION = trackNewsletterSubscriptionEvent; //todo @carl please read the README.md

// Page View
export const EVENT_COMMON_PAGE_VIEW = trackCommonPageViewEvent;
export const EVENT_PAGE_VIEW_AFTER_AUTH_BY_MODAL = trackPageViewAfterAuthByModalEvent;

// Shipping Selector
export const EVENT_SHIPPING_SELECTOR = trackShippingSelectorEvent;

// Storyblok
export const EVENT_STORYBLOK = trackStoryblokEvent;

// General Link Click
export const EVENT_GENERAL_LINK_CLICK = trackGeneralLinkClickEvent;

// Customer Review Impression
export const EVENT_CUSTOMER_REVIEW_IMPRESSION = trackCustomerReviewImpression;

// Facebook Act With Signup
export const EVENT_FB_CAPI_CUSTOM_ACT_WITH_SIGNUP = trackFacebookActWithSignupEvent;

// Gladly Chat Button Click
export const EVENT_GLADLY_CHAT_BUTTON_CLICK = trackGladlyChatButtonClickEvent;

// Search Suggestion Result
export const EVENT_SUGGESTIONS_RESULT = trackSuggestionsResultEvent;
export const EVENT_SUGGESTIONS_SELECT = trackSuggestionsSelectEvent;
export const EVENT_SEARCH_RESULTS_LOADED = trackSearchResultsLoadedEvent;
// CASA Events
export const EVENT_CASA_EVENT = trackCasaEvent;
