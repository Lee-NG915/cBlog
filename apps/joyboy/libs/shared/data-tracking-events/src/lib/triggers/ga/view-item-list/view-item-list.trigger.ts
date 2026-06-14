import { GaMetrics } from '../../../metrics';
import type { GAECommerceItem } from '../../../types';
import type { LineItem } from '../../../api-mapping/v1/pos';
/**
 * @description 向用户展示某类商品的列表时记录此事件。
 * @param event - `GaMetrics.view_item_list`
 * @param item_list_id - 商品列表的ID
 * @param item_list_name - 商品列表的名称
 * @param items - 商品列表 `GAECommerceItem` 数组
 * @link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?sjid=11449057795095718791-AP&hl=zh-cn&client_type=gtag#view_item_list
 */
export interface ViewItemList {
  event: GaMetrics.view_item_list;
  ecommerce: {
    item_list_id?: string;
    item_list_name?: string;
    items: GAECommerceItem[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const viewItemList = (args: LineItem[]): ViewItemList => {
  return {
    event: GaMetrics.view_item_list,
    ecommerce: {
      items: [],
    },
  };
};
