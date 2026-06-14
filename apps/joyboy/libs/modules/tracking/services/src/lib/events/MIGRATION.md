# Events Migration Checklist

`events-map.ts` is kept as a deprecated compatibility layer and re-exports from `events/`.
New event constants should be added to one of the channel files: `ga.events.ts`, `fb.events.ts`,
`pinterest.events.ts`, `klaviyo.events.ts`, or `dy.events.ts`.

Legacy public events that are GA custom events or multi-channel orchestration entry points are placed in
`ga.events.ts`.

| Event constant                                 | Trigger                                       | Target file    | Status   |
| ---------------------------------------------- | --------------------------------------------- | -------------- | -------- |
| `EVENT_VIEW_ITEM`                              | `trackViewItemEvent`                          | `ga.events.ts` | migrated |
| `EVENT_PDP_IMAGE_IMPRESSION`                   | `trackPDPImageImpressionEvent`                | `ga.events.ts` | migrated |
| `EVENT_PDP_DETAILS`                            | `trackProductDetailsEvent`                    | `ga.events.ts` | migrated |
| `EVENT_PDP_CONFIGURATION`                      | `trackPDPConfigurationEvent`                  | `ga.events.ts` | migrated |
| `EVENT_PDP_SELECTOR`                           | `trackPDPSelectorEvent`                       | `ga.events.ts` | migrated |
| `EVENT_PDP_HULLABALA_BANNER`                   | `trackPDPHullabalaBannerEvent`                | `ga.events.ts` | migrated |
| `EVENT_PDP_IMAGE_5S`                           | `trackPDPImage5sEvent`                        | `ga.events.ts` | migrated |
| `EVENT_PDP_REVIEW_SECTION`                     | `trackPDPReviewSectionEvent`                  | `ga.events.ts` | migrated |
| `EVENT_SOCIAL_WIDGET`                          | `trackSocialWidgetEvent`                      | `ga.events.ts` | migrated |
| `EVENT_LONG_LT`                                | `trackLongLTEvent`                            | `ga.events.ts` | migrated |
| `EVENT_MULBERRY_WARRANTY`                      | `trackMulberryWarrantyEvent`                  | `ga.events.ts` | migrated |
| `EVENT_PDP_PAGE_VIEW`                          | `trackProductPageView`                        | `ga.events.ts` | migrated |
| `EVENT_PRODUCT_VIEW_MORE_THAN_3`               | `trackFacebookProductViewMoreThan3Event`      | `fb.events.ts` | migrated |
| `EVENT_PLP_PRODUCT_IMPRESSION`                 | `trackPLPProductImpressionEvent`              | `ga.events.ts` | migrated |
| `EVENT_PLP_PRODUCT_CLICK`                      | `trackPLPProductClickEvent`                   | `ga.events.ts` | migrated |
| `EVENT_PLP_FILTER`                             | `trackProductListingsFilterEvent`             | `ga.events.ts` | migrated |
| `EVENT_ADD_TO_CART`                            | `trackAddToCartEvent`                         | `ga.events.ts` | migrated |
| `EVENT_CART_ACTION`                            | `trackCartActionEvent`                        | `ga.events.ts` | migrated |
| `EVENT_CHECKOUT_ACTION`                        | `trackCheckoutActionEvent`                    | `ga.events.ts` | migrated |
| `EVENT_USP_IMPRESSION`                         | `trackingUSPImpression`                       | `ga.events.ts` | migrated |
| `EVENT_USP_CLICK`                              | `trackingUSPClick`                            | `ga.events.ts` | migrated |
| `EVENT_UGC_CLICK`                              | `trackingUgcClickEvent`                       | `ga.events.ts` | migrated |
| `EVENT_STORYBLOK`                              | `trackStoryblokEvent`                         | `ga.events.ts` | migrated |
| `EVENT_CUSTOMER_REVIEW_IMPRESSION`             | `trackCustomerReviewImpression`               | `ga.events.ts` | migrated |
| `EVENT_ADD_TO_WISHLIST`                        | `trackAddToWishlistEvent`                     | `ga.events.ts` | migrated |
| `EVENT_ADD_SWATCH`                             | `trackAddSwatchEvent`                         | `ga.events.ts` | migrated |
| `EVENT_IDENTIFY`                               | `trackUserIdentify`                           | `ga.events.ts` | migrated |
| `EVENT_CUSTOMER_IDENTIFY`                      | `trackCustomerIdentifyEvent`                  | `ga.events.ts` | migrated |
| `EVENT_FORM_SUBMIT`                            | `trackFormSubmitEvent`                        | `ga.events.ts` | migrated |
| `EVENT_NEWSLETTER_SUBSCRIPTION`                | `trackNewsletterSubscriptionEvent`            | `ga.events.ts` | migrated |
| `EVENT_COMMON_PAGE_VIEW`                       | `trackCommonPageViewEvent`                    | `ga.events.ts` | migrated |
| `EVENT_PAGE_VIEW_AFTER_AUTH_BY_MODAL`          | `trackPageViewAfterAuthByModalEvent`          | `ga.events.ts` | migrated |
| `EVENT_SHIPPING_SELECTOR`                      | `trackShippingSelectorEvent`                  | `ga.events.ts` | migrated |
| `EVENT_GENERAL_LINK_CLICK`                     | `trackGeneralLinkClickEvent`                  | `ga.events.ts` | migrated |
| `EVENT_APPLIED_COUPON_UNIFIED`                 | `trackAppliedCouponUnifiedEvent`              | `ga.events.ts` | migrated |
| `EVENT_GLADLY_CHAT_BUTTON_CLICK`               | `trackGladlyChatButtonClickEvent`             | `ga.events.ts` | migrated |
| `EVENT_SUGGESTIONS_RESULT`                     | `trackSuggestionsResultEvent`                 | `ga.events.ts` | migrated |
| `EVENT_SUGGESTIONS_SELECT`                     | `trackSuggestionsSelectEvent`                 | `ga.events.ts` | migrated |
| `EVENT_SEARCH_RESULTS_LOADED`                  | `trackSearchResultsLoadedEvent`               | `ga.events.ts` | migrated |
| `EVENT_CASA_EVENT`                             | `trackCasaEvent`                              | `ga.events.ts` | migrated |
| `EVENT_DY_ADD_TO_CART`                         | `trackDYAddToCartEvent`                       | `dy.events.ts` | migrated |
| `EVENT_DY_ADD_TO_WISHLIST`                     | `trackDYAddToWishlistEvent`                   | `dy.events.ts` | migrated |
| `EVENT_DY_SWATCH_ATC`                          | `trackDYSwatchAddToCartEvent`                 | `dy.events.ts` | migrated |
| `EVENT_DY_SWATCH_ADD_TO_CART`                  | `trackDYSwatchAddToCartEvent`                 | `dy.events.ts` | migrated |
| `EVENT_DY_PURCHASE`                            | `trackDYPurchaseEvent`                        | `dy.events.ts` | migrated |
| `EVENT_DY_SIGNUP`                              | `trackDYSignupEvent`                          | `dy.events.ts` | migrated |
| `EVENT_DY_LOGIN`                               | `trackDYLoginEvent`                           | `dy.events.ts` | migrated |
| `EVENT_DY_PROMO_CODE_ENTERED`                  | `trackDYPromoCodeEnteredEvent`                | `dy.events.ts` | migrated |
| `EVENT_DY_NEWSLETTER_SUBSCRIPTION`             | `trackDYNewsletterSubscriptionEvent`          | `dy.events.ts` | migrated |
| `EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT`      | `trackDYApiRecommendationsEngagementEvent`    | `dy.events.ts` | migrated |
| `EVENT_DY_API_CUSTOM_CODE_CAMPAIGN_ENGAGEMENT` | `trackDYApiCustomCodeCampaignEngagementEvent` | `dy.events.ts` | migrated |
| `EVENT_DY_FILTER_ITEMS`                        | `trackDYFilterItemsEvent`                     | `dy.events.ts` | migrated |
| `EVENT_DY_KEYWORD_SEARCH`                      | `trackDYKeywordSearchEvent`                   | `dy.events.ts` | migrated |
| `EVENT_FB_CAPI_CUSTOM_ACT_WITH_SIGNUP`         | `trackFacebookActWithSignupEvent`             | `fb.events.ts` | migrated |
