export interface APIResponseRoot_V2 {
  /**
   * biz code, 0 for success
   * @doc https://github.com/castlery/protocol/blob/order_dev/order/core/common.proto#L18
   */
  code?: number;
  /**
   * biz data, null or something
   */
  data?: any;
  /**
   * biz message, 'success' for success
   */
  msg?: string;
  [property: string]: any;
}
