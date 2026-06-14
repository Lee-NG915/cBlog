import { SaleState, StockState } from './order.entity';
/**
 * @description Google analytics 4 电子商务商品 item 标准参数, 除这些指定参数外，您还可以在 items 数组中加入最多 27 个自定义参数。
 * @link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?hl=zh-cn&client_type=gtag#view_item_list
 */
export interface StandardECommerceItem {
  item_id: string;
  item_name: string;
  /**
   * 用于指定供应公司或实体店面的商品关联商户。
   * 注意：`affiliation` 仅适用于商品级范围。
   */
  affiliation?: string;
  coupon?: string;
  creative_name?: string;
  creative_slot?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  promotion_id?: string;
  promotion_name?: string;
  /**
   * 商品数量。
   * 如果未设置，quantity 将设置为 1。
   */
  quantity?: number;
}

/**
 * @description Customized ECommerceItem for Google Analytics 4, based on StandardECommerceItem
 */
export interface GAECommerceItem extends StandardECommerceItem {
  dimension1: string; // first category//pageName
  dimension2: keyof typeof StockState; // stock state, values: IN_STOCK, OUT_OF_STOCK, IN_STOCK_SOON
  dimension3: (typeof SaleState)[keyof typeof SaleState]; // is product in sale, values: sale, full
  dimension4: string /** stockState === 'OUT_OF_STOCK' ? 'Long Time' : calcWeeks(deliveryLeadTime), // delivery time, values: 0-1 week, 1-2 weeks, 2-3 weeks, etc.. */;
  metric1: string | number; // amount of discount if applicable, if not leave empty string
  metric2?: number; // for cart, increased/decreased amount
}
