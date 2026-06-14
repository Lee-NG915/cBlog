import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@castlery/shared-redux-store';
import { type CheckoutSessionState, getOrderCheckoutDetail } from '@castlery/modules-checkout-domain';
import { createTransactionOrder } from '@castlery/modules-order-domain';
import {
  selectPosCheckoutExchangeOrderNumber,
  selectPosCheckoutOrderComment,
  selectPosCheckoutTradePartnerId,
} from '@castlery/modules-checkout-domain';
import { getPosOrderPayments } from '@castlery/modules-payment-domain';

/**
 * 延迟函数
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 带重试的获取订单 checkout 信息
 * 因为服务端数据有延迟，需要延迟 500ms 再请求
 * 如果返回的 shippingMethod.shipments 为 null 或空数组，则重新请求
 * 最大重试次数为 5 次
 */
const fetchPosOrderCheckoutInfoWithRetry = async (
  dispatch: AppDispatch,
  orderId: string,
  maxRetries = 5,
  delayMs = 500
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // 每次请求前延迟
    await delay(delayMs);

    const res = await dispatch(getOrderCheckoutDetail.initiate(orderId, { forceRefetch: true }));

    // 检查 shippingMethod.shipments 是否有数据
    const shipments = res?.data?.shippingMethod?.shipments;
    const hasShipments = Array.isArray(shipments) && shipments.length > 0;

    if (hasShipments) {
      console.log(`[fetchPosOrderCheckoutInfoWithRetry] 成功获取 shipments 数据，第 ${attempt} 次尝试`);
      return res;
    }

    console.log(
      `[fetchPosOrderCheckoutInfoWithRetry] shipments 为空，第 ${attempt}/${maxRetries} 次尝试，${
        attempt < maxRetries ? '将重试...' : '已达最大重试次数'
      }`
    );
  }

  // 达到最大重试次数后，返回最后一次的结果
  console.warn('[fetchPosOrderCheckoutInfoWithRetry] 达到最大重试次数，返回最后结果');
  return dispatch(getOrderCheckoutDetail.initiate(orderId, { forceRefetch: true }));
};

export const createPosTransactionOrderCommand = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'createPosTransactionOrderCommand',
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as RootState & { checkoutSession: CheckoutSessionState };
    const payload = {
      exchangeOrderNumber: selectPosCheckoutExchangeOrderNumber(state),
      orderComment: selectPosCheckoutOrderComment(state),
      tradePartnerId: selectPosCheckoutTradePartnerId(state),
    };

    // 创建订单
    const res = await dispatch(createTransactionOrder.initiate(payload));

    // 检查创建订单是否失败
    if ('error' in res) {
      const errorMsg = typeof res?.error === 'string' ? res?.error : JSON.stringify(res?.error);
      return rejectWithValue(errorMsg);
    }

    if (!res?.data?.number) {
      return rejectWithValue('Failed to create order: order number is missing');
    }

    const orderId = res.data.orderId || '';

    // 后台异步获取 checkout 信息（带重试），不阻塞主流程
    fetchPosOrderCheckoutInfoWithRetry(dispatch as AppDispatch, orderId);

    // 只等待 getPosOrderPayments 返回结果
    await dispatch(getPosOrderPayments.initiate({ orderId }));

    return true;
  }
);
