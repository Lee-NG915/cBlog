'use client';

import { memo, useMemo } from 'react';
import { cartFeatureService } from '@castlery/modules-cart-services';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useHasOrderCreated } from '@castlery/shared-components';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import type { SummarySchema } from '@castlery/types';
import { hasFreeGiftPromotion } from '../order-summary-list-core/promotion.helper';
import { OrderSummaryListCore } from '../order-summary-list-core';

export interface WebOrderSummaryListProps {
  summary: SummarySchema;
  inCheckout?: boolean;
  inEstimatedShippingStep?: boolean;
  loading?: boolean;
}

export const WebOrderSummaryList = memo(function WebOrderSummaryList({
  summary,
  inCheckout = false,
  inEstimatedShippingStep = false,
  loading = false,
}: WebOrderSummaryListProps) {
  const isOrderCreated = useHasOrderCreated();
  const currentUser = useAppSelector(selectedActiveUser);
  const { showSalesTax, showShippingZipcode, showTotalWithTax } = cartFeatureService;
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCartSummary' });
  const translate = t as (key: string) => string;

  const shippingLabel = useMemo<string>(() => {
    return !showShippingZipcode || !inEstimatedShippingStep ? translate('shipping') : translate('estimatedShipping');
  }, [showShippingZipcode, inEstimatedShippingStep, translate]);

  const labels = useMemo(
    () => ({
      itemsSubtotal: translate('itemsSubtotal'),
      warrantySubtotal: translate('warranty'),
      shipping: shippingLabel,
      service: translate('service'),
      viewServiceDetails: translate('viewServiceDetails'),
      promotion: translate('promotion'),
      viewPromotionDetails: translate('viewPromotionDetails'),
      salesTax: translate('salesTax'),
      total: translate('total'),
      totalWithTaxLabel: translate('totalWithTax'),
      totalWithTaxTooltip: translate('totalWithTaxTooltip'),
    }),
    [shippingLabel, translate]
  );

  return (
    <OrderSummaryListCore
      summary={summary}
      currentUser={currentUser}
      labels={labels}
      inCheckout={inCheckout}
      loading={loading}
      couponDisabled={isOrderCreated}
      shippingDisabled={isOrderCreated}
      showSalesTax={showSalesTax}
      showShippingZipcode={showShippingZipcode}
      showTotalWithTax={showTotalWithTax}
      shouldShowPromotion={({ promoTotal, summary: summaryInfo }) => !!promoTotal || hasFreeGiftPromotion(summaryInfo)}
      serviceNameMapper={(key, value) => value?.name || key}
      itemTotalZeroToFree
      warrantyTotalZeroToFree
      shipmentTotalZeroToFree
      taxTotalZeroToFree
      totalZeroToFree
    />
  );
});

export default WebOrderSummaryList;
