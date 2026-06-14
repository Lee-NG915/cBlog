import { dyAddToCart } from './dy/add-to-cart';
import { offlineAtc, offlineAtcClick, onlineAddToCart, pushToOnline, retrieveOnlineCart } from './ga/add-to-cart';
import { onlineWebAddToCart } from './ga/add-to-cart/base-atc.trigger';
import { campaignProgressBarClick, campaignProgressBarImpression, gwpAddToCart, gwpBannerClick } from './ga/campaign';
import { offlineCheckout } from './ga/checkout';
import { offlineAddCoupon, offlineRedeemCoupon, offlineSelectCoupon } from './ga/coupon';
import { experienceImpression } from './ga/experiment';
import { identifyUser } from './ga/identify';
import { offlineAccount } from './ga/offline-account';
import { basePageViewTrigger } from './ga/page-view';
import { transaction } from './ga/purchase';

import { linkClick } from './ga/link-click';
import { socialWidgetTrigger } from './ga/social-widget';

export const TriggersMap = {
  ['PAGE_VIEW']: basePageViewTrigger,
  ['EXPERIENCE_IMPRESSION']: experienceImpression,
  ['TRANSACTION']: transaction,
  ['OFFLINE_ACCOUNT']: offlineAccount,
  ['RETRIEVE_ONLINE_CART']: retrieveOnlineCart,
  ['OFFLINE_ATC']: offlineAtc,
  ['ONLINE_ADD_TO_CART']: onlineAddToCart,
  ['ONLINE_WEB_ADD_TO_CART']: onlineWebAddToCart,
  ['PUSH_TO_ONLINE']: pushToOnline,
  ['OFFLINE_ATC_CLICK']: offlineAtcClick,
  ['OFFLINE_ADD_COUPON']: offlineAddCoupon,
  ['OFFLINE_REDEEM_COUPON']: offlineRedeemCoupon,
  ['OFFLINE_SELECT_COUPON']: offlineSelectCoupon,
  ['OFFLINE_CHECKOUT']: offlineCheckout,
  ['DY_ADD_TO_CART']: dyAddToCart,
  ['IDENTIFY_USER']: identifyUser,
  ['GWP_BANNER_CLICK']: gwpBannerClick,
  ['GWP_ADD_TO_CART_CLICK']: gwpAddToCart,
  ['CAMPAIGN_PROGRESS_BAR_IMPRESSION']: campaignProgressBarImpression,
  ['CAMPAIGN_PROGRESS_BAR_LINK_CLICK']: campaignProgressBarClick,
  ['LINK_CLICK']: linkClick,
  ['SOCIAL_WIDGET']: socialWidgetTrigger,
};

export enum EventsNames {
  EVENT_PAGE_VIEW = 'PAGE_VIEW',
  EVENT_EXPERIENCE_IMPRESSION = 'EXPERIENCE_IMPRESSION',
  EVENT_TRANSACTION = 'TRANSACTION',
  EVENT_OFFLINE_ACCOUNT = 'OFFLINE_ACCOUNT',
  EVENT_RETRIEVE_ONLINE_CART = 'RETRIEVE_ONLINE_CART',
  EVENT_OFFLINE_ATC = 'OFFLINE_ATC',
  EVENT_ONLINE_ADD_TO_CART = 'ONLINE_ADD_TO_CART',
  EVENT_ONLINE_WEB_ADD_TO_CART = 'ONLINE_WEB_ADD_TO_CART',
  EVENT_PUSH_TO_ONLINE = 'PUSH_TO_ONLINE',
  EVENT_OFFLINE_ATC_CLICK = 'OFFLINE_ATC_CLICK',
  EVENT_OFFLINE_ADD_COUPON = 'OFFLINE_ADD_COUPON',
  EVENT_OFFLINE_REDEEM_COUPON = 'OFFLINE_REDEEM_COUPON',
  EVENT_OFFLINE_SELECT_COUPON = 'OFFLINE_SELECT_COUPON',
  EVENT_OFFLINE_CHECKOUT = 'OFFLINE_CHECKOUT',
  EVENT_DY_ADD_TO_CART = 'DY_ADD_TO_CART',
  EVENT_IDENTIFY_USER = 'IDENTIFY_USER',
  EVENT_GWP_BANNER_CLICK = 'GWP_BANNER_CLICK',
  EVENT_GWP_ADD_TO_CART_CLICK = 'GWP_ADD_TO_CART_CLICK',
  EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION = 'CAMPAIGN_PROGRESS_BAR_IMPRESSION',
  EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK = 'CAMPAIGN_PROGRESS_BAR_LINK_CLICK',
  EVENT_LINK_CLICK = 'LINK_CLICK',
  EVENT_SOCIAL_WIDGET = 'SOCIAL_WIDGET',
}
