'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { orderFeatureService } from '@castlery/modules-order-services';
import { selectCartLineItems } from '@castlery/modules-cart-domain';
import { selectedCurrentCustomer, type Customer } from '@castlery/modules-user-domain';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { OrderSummaryListCore } from '../order-summary-list-core';
import type { SummarySchema } from '@castlery/types';
import { hasFreeGiftPromotion } from '../order-summary-list-core/promotion.helper';

interface OrderSummaryProps {
  inCheckout?: boolean;
  summaryInfo: SummarySchema;
}

/**
 * POS cart / POS checkout summary wrapper
 * - Reuses shared order summary core renderer
 * - Keeps POS-specific selectors, labels and feature flags
 */
export const PosOrderSummarySection: React.FC<OrderSummaryProps> = ({ summaryInfo, inCheckout = false }) => {
  const currentUser = useAppSelector(selectedCurrentCustomer);
  const cartLineItems = useAppSelector(selectCartLineItems);
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'posCartSummary' });
  const translate = t as (key: string) => string;

  const totalAddonDescription = orderFeatureService.getOrderSummaryTotalAddonDescription();
  const showSalesTax = orderFeatureService.showSalesTax;
  const zeroToFree = !!(cartLineItems && cartLineItems.length > 0);

  const labels = useMemo(
    () => ({
      itemsSubtotal: translate('itemsSubtotal'),
      warrantySubtotal: translate('warrantySubtotal'),
      shipping: inCheckout ? translate('shipping') : translate('estimatedShipping'),
      service: translate('service'),
      viewServiceDetails: translate('viewServiceDetails'),
      promotion: translate('promotion'),
      viewPromotionDetails: translate('viewPromotionDetails'),
      salesTax: translate('salesTax'),
      total: translate('total'),
    }),
    [inCheckout, translate]
  );

  return (
    <OrderSummaryListCore
      summary={summaryInfo}
      currentUser={currentUser as Customer | null}
      labels={labels}
      inCheckout={inCheckout}
      showSalesTax={showSalesTax}
      showShippingZipcode={false}
      showTotalWithTax={false}
      totalAddonDescription={totalAddonDescription}
      originShippingAmountFirst
      forceRowPadding
      useRowForCouponWallet
      itemTotalZeroToFree={zeroToFree}
      warrantyTotalZeroToFree={false}
      shipmentTotalZeroToFree={zeroToFree}
      taxTotalZeroToFree={false}
      totalZeroToFree={false}
      serviceNameMapper={(key, value) => value?.name || key}
      shouldShowPromotion={({ promoTotal, summary: summaryInfo }) => !!promoTotal || hasFreeGiftPromotion(summaryInfo)}
    />
  );
};
