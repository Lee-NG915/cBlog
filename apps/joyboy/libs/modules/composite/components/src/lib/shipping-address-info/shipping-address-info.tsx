'use client';

import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCheckoutAddress } from '@castlery/modules-checkout-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ShippingAddressCard } from '@castlery/shared-components';

export const ShippingAddressInfo = () => {
  const { t } = useTranslation(LocalesNamespace.MODULES_CHECKOUT);
  const address = useAppSelector(selectCheckoutAddress);

  if (!address) {
    return null;
  }
  return <ShippingAddressCard title={t('addressSectionTitle')} address={address} />;
};

export default ShippingAddressInfo;
