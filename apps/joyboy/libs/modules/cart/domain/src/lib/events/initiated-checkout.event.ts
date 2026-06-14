import { createAction } from '@reduxjs/toolkit';

/**
 * @description Web 端用户点击 Checkout 按钮触发，在 initCheckout 接口调用前发出
 * @scenario 用于触发 tracking 等副作用，未来 POS 端可扩展对应的 posInitiatedCheckoutEvent
 */
export const webInitiatedCheckoutEvent = createAction('cart/webInitiatedCheckoutEvent');
