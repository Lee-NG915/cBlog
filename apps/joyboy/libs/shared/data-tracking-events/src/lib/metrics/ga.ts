/**
 * @description E-commerce measurement metrics defined and supported by GA itself
 * @doc https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?hl=zh-cn&client_type=gtag
 * @doc2 https://developers.google.com/analytics/devguides/collection/ga4/reference/events?hl=zh-cn&client_type=gtag#add_to_wishlist
 *
 */
export enum GaMetrics {
  pageview = 'pageview',
  /**
   * @description 衡量商品或者商品列表的:浏览or展示情况  |  Measure product views / impressions
   * @trigger Triggered when the product list page is loaded
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_productitem_list_viewsimpressions
   */
  view_item_list = 'view_item_list',
  /**
   * @description 衡量商品/商品详情的浏览/展示情况  |  Measure a view of product details.
   * @trigger Triggered when product details are loaded
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_viewsimpressions_of_productitem_details
   */
  view_item = 'view_item',
  /**
   * @description 衡量商品/商品列表的点击情况  |  Measure clicks on products/item lists
   * @trigger Triggered when a user clicks on a product link.
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_productitem_list_clicks
   */
  select_item = 'select_item',
  /**
   * @description 衡量向购物车中添加商品的情况 | Measure when a product is added to a shopping cart
   * @trigger Triggered when an item is added to the shopping cart （add / add successfully）
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_additions_or_removals_from_a_shopping_cart
   */
  add_to_cart = 'add_to_cart',
  /**
   * @description 衡量从购物车移除商品的情况 | Measure the removal of a product from a shopping cart.
   * @trigger Triggered when an item is removed from the shopping cart (removal/removal successful)
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_additions_or_removals_from_a_shopping_cart
   */
  remove_from_cart = 'remove_from_cart',
  /**
   * @description Measure adding items to wishlists/favorites
   * @trigger Triggered when an item is added to wish/collection
   * @doc https://developers.google.com/analytics/devguides/collection/ga4/reference/events?hl=zh-cn&client_type=gtag#add_to_wishlist
   */
  add_to_wishlist = 'add_to_wishlist',
  /**
   * @description 衡量结帐情况 ｜ Measure checkout =>  The steps in the checkout process
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_a_checkout
   */
  checkout = 'begin_checkout',
  /**
   * @description 衡量购买情况 | Measure purchases
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_purchases
   */
  purchase = 'purchase',
  /**
   * @description 衡量退款情况 | Measure chargebacks => Distinguish between full refunds and partial refunds
   * @doc https://developers.google.com/tag-manager/ecommerce-ga4?hl=zh-cn#measure_refunds
   */
  refund = 'refund',
  /** ================== promotion start ===================== */
  /** --------------------------- todo  ---------------------------- */
  /** ================== promotion end ===================== */
  /**
   * https://developers.google.com/analytics/devguides/collection/ga4/integration?hl=zh-cn
   */
  experience_impression = 'experience_impression',
  /**
   * https://developers.google.com/analytics/devguides/collection/ga4/integration?hl=zh-cn
   * @description 衡量链接点击情况 | Measure link clicks
   */
  link_click = 'link_click',
}
