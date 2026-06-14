import modalState from 'containers/Frame/modalState';
import {
  EVENT_CLICK_CART_ICON,
  EVENT_GWP_BANNER_CLICK,
  EVENT_GWP_ADD_TO_CART_CLICK,
  EVENT_CART_REFRESH_CLICK,
  EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION,
  EVENT_PRICE_CHANGED_BANNER_IMPRESSION,
  EVENT_OUT_OF_STOCK_BANNER_IMPRESSION,
  EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK,
  EVENT_VIEW_CART,
} from './constants';
import { getOriginalAmount, getBreadcrumbNames, findBrand } from './common';

// ticket: https://app.clickup.com/t/865dadh7m
const formatLabel = () => (modalState?.states && modalState?.states.includes('cart') ? 'miniCart' : 'fullCart');

/**
 * @description track the event when user click the cart_icon in nav bar
 */
function clickCartIcon() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'click_cart_icon', // static
  };
}
/**
 * @description Triggered when click choose-free-gift-banner
 */
function clickGWPBanner(action) {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'choose_free_gift',
    'eventDetails.label': formatLabel(), // miniCart,fullCart
    'eventDetails.position': action?.result?.position, // "A","B"
  };
}

/**
 * @description Triggered when the user clicks the "Add To Cart" button in GWP Modal
 */
function clickGWPAddToCart(action) {
  return {
    _event: 'trackEvent',
    'eventDetails.action': 'cart_event',
    'eventDetails.label': formatLabel(), // miniCart,fullCart
    'eventDetails.category': 'gwp_add_to_cart', // static
    'eventDetails.gift_id': action.result?.giftId, // dynamic, sku name of pr
  };
}
/**
 * @description Triggered when the user clicks the ‘refresh’ button in the cart
 */
function clickRefreshCart() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'refresh_cart', // refresh_cart
    'eventDetails.label': formatLabel(), // miniCart,fullCart
  };
}

/**
 * @description Storewide tier campaigns Cart message
 */
function campaignBarImpression(action) {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'campaign_progress_bar_impression', //
    'eventDetails.action': action.result?.campaignName, // dynamic
    'eventDetails.label': formatLabel(), // dynamic
    'eventDetails.method': action.result?.discount, //
    'eventDetails.position': action.result?.position, // "A"|"B"|null ABTEST
  };
}

/**
 * @description  Triggered when the outdated banner of the cart item appears
 */
function priceChangedBannerImpression() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'price_change_banner_impression', //
    'eventDetails.label': formatLabel(), // dynamic
  };
}

/**
 *
 * @description  Triggered when the out-of-stock banner of the cart item appears
 */
function outOfStockImpression() {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'out_stock_banner_impression', //
    'eventDetails.label': formatLabel(), // dynamic
  };
}

/**
 *
 */
function campaignBarLinkClick(action) {
  return {
    _event: 'trackEvent',
    'eventDetails.category': 'campaign_progress_bar_link_click', //
    'eventDetails.action': action.result?.campaignName, // dynamic
    'eventDetails.label': formatLabel(), // dynamic
    'eventDetails.method': action.result?.discount, //
    'eventDetails.position': action.result?.position, // "A"|"B"|null ABTEST
  };
}
/**
 * triggered when user open fullcart or minicart
 * @param {*} action
 * @param {*} preState
 * @param {*} nextState
 * @returns
 */
function viewCart(action, preState, nextState) {
  const { data } = nextState?.cart || {};
  if (!data?.line_items || !Array.isArray(data?.line_items)) {
    return false;
  }
  const products = data.line_items.map((item) => {
    const { variant } = item || {};
    const { sku, name, price, list_price, product_taxons } = variant;
    const originalPrice = getOriginalAmount(price);
    const [pageName, subPageName] = getBreadcrumbNames(product_taxons);
    const brand = findBrand(product_taxons);
    const originalDiscountAmount = getOriginalAmount(list_price - price);
    const isSale = +originalDiscountAmount > 0;

    return {
      id: sku,
      name,
      price: originalPrice,
      category: subPageName,
      brand,
      dimension1: pageName,
      dimension2: '',
      dimension3: isSale ? 'sale' : 'full',
      dimension4: '',
      metric1: isSale ? originalDiscountAmount : '',
    };
  });

  return {
    _event: 'trackEvent',
    'eventDetails.category': 'view_cart', //
    'eventDetails.label': formatLabel(), // dynamic,miniCart/fullCart
    ecommerce: {
      currencyCode: __CURRENCY__,
      cart: {
        products,
      },
    },
  };
}

export default {
  [EVENT_CLICK_CART_ICON]: clickCartIcon,
  [EVENT_GWP_BANNER_CLICK]: clickGWPBanner,
  [EVENT_GWP_ADD_TO_CART_CLICK]: clickGWPAddToCart,
  [EVENT_CART_REFRESH_CLICK]: clickRefreshCart,
  [EVENT_CAMPAIGN_PROGRESS_BAR_IMPRESSION]: campaignBarImpression,
  [EVENT_PRICE_CHANGED_BANNER_IMPRESSION]: priceChangedBannerImpression,
  [EVENT_OUT_OF_STOCK_BANNER_IMPRESSION]: outOfStockImpression,
  [EVENT_CAMPAIGN_PROGRESS_BAR_LINK_CLICK]: campaignBarLinkClick,
  [EVENT_VIEW_CART]: viewCart,
};
