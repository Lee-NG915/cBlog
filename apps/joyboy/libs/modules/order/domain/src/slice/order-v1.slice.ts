import { createSliceWithThunks } from '@castlery/shared-redux-core';
import { AsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createTransactionOrder, getTransactionOrderDetailById } from '../api/order.api.v1';
import { PosCreateOrderResponseData, OrderDataV1 } from '@castlery/types';
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>;

export const ORDER_V1_FEATURE_KEY = 'order-v1';
/**
 * cartAdapter
 * @description 通过createEntityAdapter生成的，一组可重用的reducer和selector来管理存储中的规范化数据
 */

export interface OrderV1State {
  fetchOrderDetailLoading: boolean;
  transactionOrderDetail: OrderDataV1 | null;
  posOrderReferenceInfo: PosCreateOrderResponseData | null;
}

export const initialOrderV1State: OrderV1State = {
  fetchOrderDetailLoading: false,
  transactionOrderDetail: null,
  posOrderReferenceInfo: null,
};

export const orderV1Slice = createSliceWithThunks({
  name: ORDER_V1_FEATURE_KEY,
  initialState: initialOrderV1State,
  reducers: (create) => ({
    clearPosOrderIdAndOrderNumber: create.reducer((state) => {
      state.posOrderReferenceInfo = null;
    }),
    setSalesOrderTransactionOrderDetail: create.reducer((state, { payload }: PayloadAction<OrderDataV1>) => {
      state.transactionOrderDetail = payload;
    }),
    clearSalesOrderTransactionOrderDetail: create.reducer((state) => {
      state.transactionOrderDetail = null;
    }),
  }),

  extraReducers(builder) {
    builder
      .addMatcher(
        (action): action is FulfilledAction => getTransactionOrderDetailById.matchFulfilled(action),
        (state, { payload }) => {
          state.transactionOrderDetail = payload as OrderDataV1;
          state.fetchOrderDetailLoading = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction =>
          getTransactionOrderDetailById.matchPending(action) || createTransactionOrder.matchPending(action),
        (state, { payload }) => {
          state.fetchOrderDetailLoading = true;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction =>
          getTransactionOrderDetailById.matchRejected(action) || createTransactionOrder.matchRejected(action),
        (state, { payload }) => {
          state.fetchOrderDetailLoading = false;
        }
      )
      .addMatcher(
        (action): action is FulfilledAction => createTransactionOrder.matchFulfilled(action),
        (state, { payload }) => {
          const data = payload as PosCreateOrderResponseData;
          state.posOrderReferenceInfo = data;
        }
      )
      .addDefaultCase(() => {});
  },
  selectors: {
    selectFetchOrderDetailLoading: (state) => state.fetchOrderDetailLoading,
    selectHasTransactionOrderDetail: (state) => !!state.transactionOrderDetail,
    selectTransactionOrderDetail: (state) => state.transactionOrderDetail,
    selectPosOrderId: (state) => state.posOrderReferenceInfo?.orderId, // 创建订单时返回的订单ID
    selectPosOrderNumber: (state) => state.posOrderReferenceInfo?.number, // 创建订单时返回的订单号
    selectPosOrderReferenceNumber: (state) => state.posOrderReferenceInfo?.referenceNumber, // 创建订单时返回的参考号
    selectPosOrderPaymentExpiredAt: (state) => state.posOrderReferenceInfo?.paymentExpiredAt, // 创建订单时返回的过期时间
    selectTransactionOrderSummary: (state) => state.transactionOrderDetail?.summary,
    selectTransactionOrderLineItems: (state) =>
      state.transactionOrderDetail?.shipments?.map((shipment: any) => shipment.lineItems)?.flat() || [],
  },
});

export const {
  clearPosOrderIdAndOrderNumber,
  setSalesOrderTransactionOrderDetail,
  clearSalesOrderTransactionOrderDetail,
} = orderV1Slice.actions;
export const {
  selectFetchOrderDetailLoading,
  selectTransactionOrderDetail,
  selectHasTransactionOrderDetail,
  selectPosOrderId,
  selectPosOrderNumber,
  selectPosOrderReferenceNumber,
  selectPosOrderPaymentExpiredAt,
  selectTransactionOrderSummary,
  selectTransactionOrderLineItems,
} = orderV1Slice.selectors;
