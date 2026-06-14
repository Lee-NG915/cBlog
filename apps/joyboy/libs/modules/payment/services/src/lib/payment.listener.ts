import { AppStartListening } from '@castlery/shared-redux-store';
import { Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb } from '@castlery/config';
import { EnterAppEvent } from '@castlery/modules-user-domain';
import { paymentFeatureService } from './feature.helper';
import { getPaymentMethodConfigs } from '@castlery/modules-payment-domain';
import { PaymentModuleSettingsKeys_V2, PaymentModuleType_V2 } from '@castlery/types';

export function setupPaymentListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    // ====================== Only for Web : start ======================
    ...(accessInWeb
      ? [
          startListening({
            actionCreator: EnterAppEvent,
            effect: async (action, { dispatch }) => {
              if (action.payload === 'CHECKOUT_PAYMENT') {

                const methods = paymentFeatureService.getSupportedPaymentMethods();
                const keys = [...new Set(methods.map((method) => method.settingsOptionKey))].filter(
                  (key) => key !== ''
                );
                if (keys) {
                  const filteredMethods = keys.reduce((acc, key) => {
                    acc[key as PaymentModuleSettingsKeys_V2] = true;
                    return acc;
                  }, {} as Record<PaymentModuleSettingsKeys_V2, boolean>);
                  await dispatch(getPaymentMethodConfigs.initiate(filteredMethods));
                }
              }
            },
          }),
        ]
      : []),
    //   ===================== Only for Web : end ======================
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
