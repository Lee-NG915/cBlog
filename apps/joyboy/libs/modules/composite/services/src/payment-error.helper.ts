'use client';
import { isAnyOf } from '@reduxjs/toolkit';
import type { AppDispatch } from '@castlery/shared-redux-store';
import {
  addPosPaymentMethod,
  confirmPayment,
  confirmPosPayment,
  completePosPayment,
  getPaymentMethodConfigs,
  getPosOrderPayments,
  getPosPaymentMethodConfigs,
  initializePayment,
  removePosOrderPayment,
} from '@castlery/modules-payment-domain';
import { TransactionApiErrorCode } from '@castlery/config';
import { updatePosOrderDetail } from '@castlery/modules-order-domain';

export const PaymentProcessFailedEvent = isAnyOf(
  getPaymentMethodConfigs.matchRejected,
  getPosPaymentMethodConfigs.matchRejected,
  initializePayment.matchRejected,
  confirmPayment.matchRejected,
  getPosOrderPayments.matchRejected,
  removePosOrderPayment.matchRejected,
  addPosPaymentMethod.matchRejected,
  confirmPosPayment.matchRejected,
  completePosPayment.matchRejected,
  updatePosOrderDetail.matchRejected
);

// 目前暂无明确的支付错误码规则，先保留占位，后续可扩展
export const needIgnoredPaymentErrorCodes: number[] = [];

export const needReloadPosPaymentConfigsCodes: number[] = [TransactionApiErrorCode.ErrCheckoutCheckoutTokenExpired];

/** 支付错误监听里可调用的副作用（刷新配置、忽略码时的扩展点） */
export const paymentErrorHandlersMap = {
  reloadPosPaymentConfigs: async (dispatch: AppDispatch) => {
    await dispatch(getPosPaymentMethodConfigs.initiate(undefined, { forceRefetch: true }));
  },
  /**
   * 与 cart 侧 needIgnoredCartErrorCodes 行为对齐：忽略的错误不弹窗，可在此刷新数据等。
   * 当前 needIgnoredPaymentErrorCodes 为空，占位供后续扩展。
   */
  onIgnoredPaymentError: async (_dispatch: AppDispatch, _numberCode: number, _msg: string) => {
    return;
  },
};
