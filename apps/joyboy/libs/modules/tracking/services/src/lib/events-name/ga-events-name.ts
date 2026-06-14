export const GA_EVENTS_NAME = {
  GA_CUSTOM_TRACK_EVENT: 'trackEvent',
  GA_CUSTOM_PRODUCT_DETAIL: 'productDetail', // 对应的GA事件是view_item
  GA_CUSTOM_PRODUCT_IMPRESSION: 'productImpression', // 对应的GA事件是view_item_list
  GA_CUSTOM_PRODUCT_CLICK: 'productClick', // 对应的GA事件是select_item

  GA_ADD_TO_CART: 'addToCart',
  GA_REMOVE_FROM_CART: 'removeFromCart',
  GA_CHECKOUT: 'checkout',
  GA_PURCHASE: 'transaction', // 对应GA事件是purchase（订单支付成功后上报）
  GA_PAGE_VIEW: 'pageview',
};
