'use client';
import { useMemo } from 'react';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { EcEnv, basePageConfig } from '@castlery/config';
import { DATA_SELENIUM_ID_MAP } from '@castlery/utils';

export const useWebCheckoutSteps = (): {
  label: string;
  href: string;
  linkKey: string;
  level: number;
  dataSeleniumId: string;
}[] => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT, {
    keyPrefix: 'checkoutStepsBar',
  });

  const steps = t('steps', { returnObjects: true });

  const stepUrls = useMemo(() => {
    const prefix = `/${EcEnv.NEXT_PUBLIC_COUNTRY}`.toLowerCase();

    return [
      {
        href: `${prefix}${basePageConfig['checkout-shipping-address']}`,
        linkKey: 'checkout-shipping-address',
        dataSeleniumId: DATA_SELENIUM_ID_MAP.CHECKOUT_SHIPPING_ADDRESS,
      },
      {
        href: `${prefix}${basePageConfig['checkout-shipping-method']}`,
        linkKey: 'checkout-shipping-method',
        dataSeleniumId: DATA_SELENIUM_ID_MAP.CHECKOUT_SHIPPING_METHOD,
      },
      {
        href: `${prefix}${basePageConfig['checkout-payment']}`,
        linkKey: 'checkout-payment',
        dataSeleniumId: '',
      },
    ];
  }, []);

  const stepList = useMemo(() => {
    return stepUrls.map((step: { href: string; linkKey: string; dataSeleniumId: string }, index: number) => ({
      label: steps[index],
      href: step.href,
      linkKey: step.linkKey,
      level: index,
      dataSeleniumId: step.dataSeleniumId,
    }));
  }, [steps, stepUrls]);

  return stepList || [];
};
