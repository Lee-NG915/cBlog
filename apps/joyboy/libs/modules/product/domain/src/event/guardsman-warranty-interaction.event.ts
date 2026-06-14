import { createAction } from '@reduxjs/toolkit';

/**
 * 与 Mulberry 实际 dispatch 的 action 对齐（见 product-mulberry-picker / product-add-to-cart）。
 * 未在 Mulberry 落地的 action（remove / open_popup / not_interested_popup / cart popup）不在 Guardsman 实现。
 */
export type GuardsmanWarrantyGaAction = 'select_extended_warranty' | 'add_extended_warranty' | 'extended_warranty_faq';

export type GuardsmanWarrantyGaPosition = 'pdp';

export interface GuardsmanWarrantyInteractionPayload {
  action: GuardsmanWarrantyGaAction;
  label?: string;
  sku: string;
  skuName: string;
  position?: GuardsmanWarrantyGaPosition;
  price?: number | string;
}

/**
 * PDP 侧 Guardsman 保险 GA 交互事件。
 * 由 product-tracking listener 转发为 `guardsman_warranty` GA trackEvent。
 */
export const guardsmanWarrantyInteractionEvent = createAction<GuardsmanWarrantyInteractionPayload>(
  'product/guardsmanWarrantyInteraction'
);
