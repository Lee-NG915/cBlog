import {
  SupportedPaymentMethods,
  PaymentMethodProviderEnum,
  removePosOrderPayment,
  getPosOrderPayments,
  addPosPaymentMethod,
  confirmPosPayment,
  completePosPayment,
} from '@castlery/modules-payment-domain';
import { updatePosOrderDetail } from '@castlery/modules-order-domain';
import { featureManager } from '@castlery/monorepo-features';
import { PaymentModuleSettingsKeys_V2, PosPaymentInitiatePayload } from '@castlery/types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  selectPosCheckoutExchangeOrderNumber,
  selectPosCheckoutOrderComment,
  selectPosCheckoutTradePartnerId,
} from '@castlery/modules-checkout-domain';
import type { RootState } from '@castlery/shared-redux-store';
import { v4 as uuidV4 } from 'uuid';

export const paymentMethodMapping = {
  [SupportedPaymentMethods.CREDIT_CARD]: {
    key: SupportedPaymentMethods.CREDIT_CARD,
    collection: ['Stripe Credit Card'],
    label: 'Credit Card',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.STRIPE),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.STRIPE),
    settingsOptionKey: PaymentModuleSettingsKeys_V2.StripePublicKey,
    icons: [
      {
        key: 'amex',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044008/payments-wallet/amex_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'visa',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044016/payments-wallet/visa_icon.png',
        width: 36,
        height: 30,
      },
      {
        key: 'master',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044011/payments-wallet/master_icon.png',
        width: 36,
        height: 36,
      },
    ],
  },
  [SupportedPaymentMethods.EXPRESS_PAYMENT]: {
    key: SupportedPaymentMethods.EXPRESS_PAYMENT,
    label: 'Express Payment',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.STRIPE),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.STRIPE),
    settingsOptionKey: PaymentModuleSettingsKeys_V2.StripePublicKey,
    icons: [
      {
        key: 'google-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/google_pay_icon.png',
        width: 37,
        height: 34,
      },
      {
        key: 'apple-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044009/payments-wallet/apple_pay_icon.png',
        width: 32,
        height: 32,
      },
    ],
  },
  [SupportedPaymentMethods.PAYPAL]: {
    key: SupportedPaymentMethods.PAYPAL,
    label: 'PayPal',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.PAYPAL),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.PAYPAL),
    settingsOptionKey: PaymentModuleSettingsKeys_V2.PaypalPublicKey,
    icons: [
      {
        key: 'paypal',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044013/payments-wallet/paypal_icon.png',
        width: 64,
        height: 34,
      },
    ],
  },
  [SupportedPaymentMethods.AFTER_PAY]: {
    key: SupportedPaymentMethods.AFTER_PAY,
    label: 'AfterPay',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.AFTER_PAY),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.AFTER_PAY),
    settingsOptionKey: PaymentModuleSettingsKeys_V2.StripePublicKey,
    icons: [
      {
        key: 'after-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044009/payments-wallet/after_pay_icon.png',
        width: 60,
        height: 34,
      },
    ],
  },
  [SupportedPaymentMethods.GRAB_PAY]: {
    key: SupportedPaymentMethods.GRAB_PAY,
    label: 'GrabPay',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.GRAB_PAY),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.GRAB_PAY),
    settingsOptionKey: '',

    icons: [
      {
        key: 'grab-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/garbpay_icon.png',
        width: 67,
        height: 36,
      },
    ],
  },
  [SupportedPaymentMethods.ZIP_PAY]: {
    key: SupportedPaymentMethods.ZIP_PAY,
    label: 'Zip',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.ZIP_PAY),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.ZIP_PAY),
    settingsOptionKey: '',
    icons: [
      {
        key: 'zip-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044017/payments-wallet/zip_pay_icon.png',
        width: 37,
        height: 34,
      },
    ],
  },
  [SupportedPaymentMethods.INSTALMENT_2C2P]: {
    key: SupportedPaymentMethods.INSTALMENT_2C2P,
    label: 'Instalment Plans',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.INSTALMENT_2C2P),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.INSTALMENT_2C2P),
    settingsOptionKey: PaymentModuleSettingsKeys_V2.InstalmentOptions,
    icons: [
      {
        key: 'dbs',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/dbs_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'ocbc',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044012/payments-wallet/ocbc_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'uob',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044015/payments-wallet/uob_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'amex',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044008/payments-wallet/amex_icon.png',
        width: 24,
        height: 24,
      },
    ],
  },
  [SupportedPaymentMethods.AFFIRM]: {
    key: SupportedPaymentMethods.AFFIRM,
    label: 'Affirm',
    enabled: featureManager.isFeatureEnabled(featureManager.featureName.AFFIRM),
    payload: featureManager.getFeatureFlagPayload(featureManager.featureName.AFFIRM),
    settingsOptionKey: PaymentModuleSettingsKeys_V2.AffirmPublicKey,
    icons: [
      {
        key: 'affirm',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750045063/payments-wallet/affirm_icon.png',
        width: 53,
        height: 28,
      },
    ],
  },
};

// Flatten paymentMethodStaticSettings by PaymentMethodProviderEnum
export interface PaymentMethodStaticSettingsEntity {
  key: PaymentMethodProviderEnum;
  integrationType: SupportedPaymentMethods;
  label: string;
  icons: { key: string; url: string; width: number; height: number }[];
  displaySort: number;
  instructionText?: string;
}
export const paymentMethodStaticSettings: Record<PaymentMethodProviderEnum, PaymentMethodStaticSettingsEntity> = {
  [PaymentMethodProviderEnum.STRIPE_ONLINE]: {
    key: PaymentMethodProviderEnum.STRIPE_ONLINE,
    integrationType: SupportedPaymentMethods.CREDIT_CARD,
    label: 'Credit Card',
    icons: [
      {
        key: 'amex',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044008/payments-wallet/amex_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'visa',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044016/payments-wallet/visa_icon.png',
        width: 36,
        height: 30,
      },
      {
        key: 'master',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044011/payments-wallet/master_icon.png',
        width: 36,
        height: 36,
      },
    ],
    displaySort: 0,
  },
  [PaymentMethodProviderEnum.STRIPE_APPLE_PAY]: {
    key: PaymentMethodProviderEnum.STRIPE_APPLE_PAY,
    integrationType: SupportedPaymentMethods.EXPRESS_PAYMENT,
    label: 'Apple Pay',
    instructionText: 'Please click on the Apple Pay button below to place your order.',
    icons: [
      {
        key: 'apple-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044009/payments-wallet/apple_pay_icon.png',
        width: 32,
        height: 32,
      },
    ],
    displaySort: 1,
  },
  [PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY]: {
    key: PaymentMethodProviderEnum.STRIPE_GOOGLE_PAY,
    integrationType: SupportedPaymentMethods.EXPRESS_PAYMENT,
    label: 'Google Pay',
    instructionText: 'Please click on the Google Pay button below to place your order.',
    icons: [
      {
        key: 'google-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/google_pay_icon.png',
        width: 37,
        height: 34,
      },
    ],
    displaySort: 2,
  },
  [PaymentMethodProviderEnum.STRIPE_LINK_PAY]: {
    key: PaymentMethodProviderEnum.STRIPE_LINK_PAY,
    integrationType: SupportedPaymentMethods.EXPRESS_PAYMENT,
    label: 'Link',
    instructionText: 'Please click on the Link button below to place your order.',
    icons: [
      {
        key: 'link-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1768878440/payments-wallet/link_pay_icon.png',
        width: 37,
        height: 34,
      },
    ],
    displaySort: 3,
  },
  [PaymentMethodProviderEnum.PAYPAL_ONLINE]: {
    key: PaymentMethodProviderEnum.PAYPAL_ONLINE,
    integrationType: SupportedPaymentMethods.PAYPAL,
    label: 'PayPal',
    instructionText: 'Please click on the PayPal button below to place your order.',
    icons: [
      {
        key: 'paypal',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044013/payments-wallet/paypal_icon.png',
        width: 64,
        height: 34,
      },
    ],
    displaySort: 4,
  },
  [PaymentMethodProviderEnum.STRIPE_AFTERPAY]: {
    key: PaymentMethodProviderEnum.STRIPE_AFTERPAY,
    integrationType: SupportedPaymentMethods.AFTER_PAY,
    label: 'AfterPay',
    icons: [
      {
        key: 'after-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044009/payments-wallet/after_pay_icon.png',
        width: 60,
        height: 34,
      },
    ],
    displaySort: 5,
  },
  [PaymentMethodProviderEnum.GRABPAY]: {
    key: PaymentMethodProviderEnum.GRABPAY,
    integrationType: SupportedPaymentMethods.GRAB_PAY,
    label: 'GrabPay',
    icons: [
      {
        key: 'grab-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/garbpay_icon.png',
        width: 67,
        height: 36,
      },
    ],
    displaySort: 6,
  },
  [PaymentMethodProviderEnum.ZIPPAY]: {
    key: PaymentMethodProviderEnum.ZIPPAY,
    integrationType: SupportedPaymentMethods.ZIP_PAY,
    label: 'Zip',
    icons: [
      {
        key: 'zip-pay',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044017/payments-wallet/zip_pay_icon.png',
        width: 37,
        height: 34,
      },
    ],
    displaySort: 7,
  },
  [PaymentMethodProviderEnum.TWO_C2P]: {
    key: PaymentMethodProviderEnum.TWO_C2P,
    integrationType: SupportedPaymentMethods.INSTALMENT_2C2P,
    label: 'Instalment plans',
    icons: [
      {
        key: 'dbs',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044010/payments-wallet/dbs_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'ocbc',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044012/payments-wallet/ocbc_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'uob',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044015/payments-wallet/uob_icon.png',
        width: 24,
        height: 24,
      },
      {
        key: 'amex',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750044008/payments-wallet/amex_icon.png',
        width: 24,
        height: 24,
      },
    ],
    displaySort: 8,
  },
  [PaymentMethodProviderEnum.STRIPE_AFFIRM]: {
    key: PaymentMethodProviderEnum.STRIPE_AFFIRM,
    integrationType: SupportedPaymentMethods.AFFIRM,
    label: 'Affirm',
    icons: [
      {
        key: 'affirm',
        url: 'https://res.cloudinary.com/castlery/image/upload/v1750045063/payments-wallet/affirm_icon.png',
        width: 53,
        height: 28,
      },
    ],
    displaySort: 9,
  },
} as Record<PaymentMethodProviderEnum, PaymentMethodStaticSettingsEntity>;

export const deletePosPaymentCommand = createAsyncThunk(
  'deletePosPaymentCommand',
  async (payload: { orderId: string; paymentId: string }, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(removePosOrderPayment.initiate({ orderId: payload.orderId, paymentId: payload.paymentId }));
      await dispatch(getPosOrderPayments.initiate({ orderId: payload.orderId }, { forceRefetch: true }));
    } catch (error) {
      return rejectWithValue(error);
    }
    return true;
  }
);

export const addPosPaymentCommand = createAsyncThunk(
  'addPosPaymentCommand',
  async (payload: PosPaymentInitiatePayload, { dispatch, rejectWithValue }) => {
    const { orderNumber, orderId, provider } = payload;
    if (!orderNumber || !orderId) {
      return rejectWithValue('orderNumber and orderId are required');
    }
    try {
      // Step 1: 添加支付方式
      const addPaymentResult = await dispatch(addPosPaymentMethod.initiate(payload));

      // 检查添加支付方式是否失败
      if ('error' in addPaymentResult) {
        return rejectWithValue(addPaymentResult.error);
      }

      const addPaymentRes = addPaymentResult.data;
      if (!addPaymentRes || !addPaymentRes?.paymentId) {
        return rejectWithValue('Failed to add payment method: no paymentId returned');
      }

      // Step 2: 确认支付方式
      const confirmResult = await dispatch(
        confirmPosPayment.initiate({
          idempotencyKey: uuidV4(),
          orderId,
          orderNumber,
          paymentId: addPaymentRes.paymentId,
          confirmData: {
            provider,
          },
        })
      );

      // 检查确认支付是否失败
      if ('error' in confirmResult) {
        // 确认失败时，尝试删除已添加的支付方式以保持数据一致性
        await dispatch(removePosOrderPayment.initiate({ orderId, paymentId: addPaymentRes.paymentId }));
        return rejectWithValue(confirmResult.error);
      }

      // Step 3: 刷新支付列表
      await dispatch(getPosOrderPayments.initiate({ orderId }, { forceRefetch: true }));

      return { success: true, paymentId: addPaymentRes.paymentId };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const confirmPosPaymentCommand = createAsyncThunk(
  'confirmPosPaymentCommand',
  async (
    payload: { orderId: string; isStripeLink: boolean; hasSplPayment: boolean },
    { dispatch, getState, rejectWithValue }
  ) => {
    if (!payload.orderId) {
      return rejectWithValue('orderNumber and orderId are required');
    }
    const rootState = getState() as RootState;
    const exchangeOrderNumber = selectPosCheckoutExchangeOrderNumber(rootState);
    const orderComment = selectPosCheckoutOrderComment(rootState);
    const tradePartnerId = selectPosCheckoutTradePartnerId(rootState);
    try {
      if (!payload.hasSplPayment) {
        const updateRes = await dispatch(
          updatePosOrderDetail.initiate({ orderId: payload.orderId, exchangeOrderNumber, orderComment, tradePartnerId })
        );
        if ('error' in updateRes) {
          // TODO: 订单信息更新失败时的支付失败处理（如提示错误、记录日志、上报埋点等）
          return rejectWithValue(updateRes.error);
        }
      }
      if (!payload.isStripeLink) {
        const completeRes = await dispatch(completePosPayment.initiate({ orderId: payload.orderId }));
        if ('error' in completeRes) {
          return rejectWithValue(completeRes.error);
        }
      }
    } catch (error) {
      return rejectWithValue(error);
    }
    return true;
  }
);
