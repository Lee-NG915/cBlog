/**
 * @description Customized EventDetails for Google Analytics 4, based on StandardEventDetails
 */
export interface StandardEventDetails {
  category: string;
  action: string;
  label: string;
  position: string;
  method: string;
}

/**
 * SOURCE.PAGE.MODULE.ELEMENT_NAME.INTERACTION
 * 维度：来源标识 + 页面 + 模块 + 元素 + 交互
 * eg: OP.FULLCART.PROMPT.GWP_BANNER.CLICK
 */
export interface EventBaseInfo {
  source: 'ONEPIECE' | 'POS';
  page: string;
  module: string;
  element: string;
  interaction: string;
}
