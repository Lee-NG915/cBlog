'use client';
import { useMemo } from 'react';
import { paymentFeatureService } from '@castlery/modules-payment-services';
import { ProviderConfigSchema } from '@castlery/types';
import { PaymentMethodProviderEnum } from '@castlery/modules-payment-domain';

export interface UseGetFormattedMethodsSettingsProps {
  paymentMethodConfigs: ProviderConfigSchema[];
}

export const useGetFormattedMethodsSettings = ({ paymentMethodConfigs }: UseGetFormattedMethodsSettingsProps) => {
  return useMemo(() => {
    if (!paymentMethodConfigs || paymentMethodConfigs.length === 0) return [];
    const staticSettings = paymentFeatureService.getPaymentMethodStaticSettings();
    const formattedMethodsSettings = paymentMethodConfigs.map((config) => {
      const targetPaymentMethod = staticSettings.find((setting) => setting.provider === config.provider);
      return {
        ...config,
        ...targetPaymentMethod,
      };
    });
    const stripeOnlineEnabled = paymentMethodConfigs.some(
      (config) => config.provider === PaymentMethodProviderEnum.STRIPE_ONLINE
    );
    const stripeLinKPayItemSetting = staticSettings.find(
      (setting) => setting.provider === PaymentMethodProviderEnum.STRIPE_LINK_PAY
    );
    if (stripeOnlineEnabled && stripeLinKPayItemSetting) {
      const stripeOnlineItemConfig = formattedMethodsSettings.find(
        (setting) => setting.provider === PaymentMethodProviderEnum.STRIPE_ONLINE
      );
      formattedMethodsSettings.push({
        ...stripeOnlineItemConfig,
        ...stripeLinKPayItemSetting,
      } as any);
    }
    return formattedMethodsSettings.sort((a, b) => (a.displaySort ?? 0) - (b.displaySort ?? 0)) || [];
  }, [paymentMethodConfigs]);
};
