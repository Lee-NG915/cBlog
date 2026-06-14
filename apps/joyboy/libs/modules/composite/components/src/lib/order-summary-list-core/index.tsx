'use client';

import { memo, useMemo } from 'react';
import { Box, Divider, Skeleton, Typography } from '@castlery/fortress';
import { CartCouponWallet, CheckoutCouponWallet } from '@castlery/modules-composite-components';
import { toPrice } from '@castlery/utils';
import { ItemTotal } from './item-total';
import { WarrantyTotal } from './warranty-total';
import { ShippingItem } from './shipping-item';
import { ServiceItem } from './service-item';
import { PromotionItem, PromotionInvalidItem } from './promotion-item';
import { SalesTaxItem } from './sales-tax-item';
import { TotalItem } from './total-item';
import { SummaryRow } from './summary-row';
import { hasFreeGiftPromotion } from './promotion.helper';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useCalculateCartSummary } from '@castlery/shared-components';
import type { SummarySchema } from '@castlery/types';
import type { Customer } from '@castlery/modules-user-domain';
import { accessInPos } from '@castlery/config';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectPosOrderId } from '@castlery/modules-order-domain';

type ServiceAmountMapValue = {
  name?: string;
  actualTotal: number | string;
  originalTotal: number | string;
};

export interface SummaryListLabels {
  itemsSubtotal: string;
  warrantySubtotal: string;
  shipping: string;
  service: string;
  viewServiceDetails: string;
  promotion: string;
  viewPromotionDetails: string;
  salesTax: string;
  total: string;
  totalWithTaxLabel?: string;
  totalWithTaxTooltip?: string;
}

export interface OrderSummaryListCoreProps {
  summary: SummarySchema;
  currentUser: Customer | null;
  labels: SummaryListLabels;
  inCheckout?: boolean;
  loading?: boolean;
  shippingDisabled?: boolean;
  couponDisabled?: boolean;
  showSalesTax?: boolean;
  showShippingZipcode?: boolean;
  showTotalWithTax?: boolean;
  totalAddonDescription?: string;
  originShippingAmountFirst?: boolean;
  forceRowPadding?: boolean;
  useRowForCouponWallet?: boolean;
  itemTotalZeroToFree?: boolean;
  warrantyTotalZeroToFree?: boolean;
  shipmentTotalZeroToFree?: boolean;
  taxTotalZeroToFree?: boolean;
  totalZeroToFree?: boolean;
  serviceNameMapper?: (key: string, value: ServiceAmountMapValue) => string;
  shouldShowPromotion?: (args: { promoTotal?: number; summary: SummarySchema }) => boolean;
}

export const OrderSummaryListCore = memo(function OrderSummaryListCore({
  summary,
  currentUser,
  labels,
  inCheckout = false,
  loading = false,
  couponDisabled = false,
  shippingDisabled = false,
  showSalesTax = false,
  showShippingZipcode = false,
  showTotalWithTax = false,
  totalAddonDescription,
  originShippingAmountFirst = false,
  forceRowPadding = false,
  useRowForCouponWallet = false,
  itemTotalZeroToFree = true,
  warrantyTotalZeroToFree = true,
  shipmentTotalZeroToFree = true,
  taxTotalZeroToFree = true,
  totalZeroToFree = true,
  serviceNameMapper,
  shouldShowPromotion,
}: OrderSummaryListCoreProps) {
  const calculateSummary = useCalculateCartSummary(summary);
  const posOrderId = useAppSelector(selectPosOrderId);

  const {
    itemTotal,
    warrantyTotal,
    shipmentTotal,
    shipmentOriginal,
    serviceTotal,
    serviceOriginalTotal,
    promoTotal,
    taxTotal,
    total,
  } = calculateSummary || {};

  const promotionInvalidMsg = summary?.promotionDetails?.promotionInvalidMsg;

  const showWarranty = Boolean(warrantyTotal);
  const showService = Boolean(serviceOriginalTotal);
  const showPromotion =
    shouldShowPromotion?.({ promoTotal, summary }) ?? Boolean(promoTotal || hasFreeGiftPromotion(summary));
  const showOriginShippingAmount = Boolean(
    shipmentOriginal && shipmentOriginal > 0 && shipmentOriginal !== shipmentTotal
  );

  const serviceList = useMemo(() => {
    const typeAmountMap = summary?.serviceAmount?.typeAmountMap as Record<string, ServiceAmountMapValue> | undefined;
    if (!typeAmountMap) return [];

    return Object.entries(typeAmountMap).map(([key, value]) => ({
      name: serviceNameMapper ? serviceNameMapper(key, value) : value.name || key,
      amount: +value.actualTotal,
      originalTotal: value.originalTotal,
    }));
  }, [summary?.serviceAmount?.typeAmountMap, serviceNameMapper]);

  const promotionList = useMemo(() => {
    const promotions = summary?.promotionDetails?.promotions;
    if (!promotions?.length) return [];

    return promotions.map((promotion) => ({
      id: promotion.promotionID,
      name: promotion.promotionName,
      description: promotion.promotionDesc?.trim() ? promotion.promotionDesc : undefined,
      amount: promotion.actions.some((action) => action.actionType === 'ActionTypeFreeGift')
        ? 0
        : -1 * +promotion.discount || 0,
    }));
  }, [summary?.promotionDetails?.promotions]);

  const formattedPrices = useMemo(
    () => ({
      itemTotal: toPrice(itemTotal ?? 0, itemTotalZeroToFree),
      warrantyTotal: toPrice(warrantyTotal ?? 0, warrantyTotalZeroToFree),
      shipmentTotal: toPrice(shipmentTotal ?? 0, shipmentTotalZeroToFree),
      shipmentOriginal: toPrice(shipmentOriginal ?? 0),
      serviceTotal: '' + (serviceTotal ?? '0'),
      promoTotal: '-' + (promoTotal ?? '0'),
      taxTotal: toPrice(taxTotal ?? 0, taxTotalZeroToFree),
      total: toPrice(total ?? 0, totalZeroToFree),
    }),
    [
      itemTotal,
      itemTotalZeroToFree,
      warrantyTotal,
      warrantyTotalZeroToFree,
      shipmentTotal,
      shipmentTotalZeroToFree,
      shipmentOriginal,
      serviceTotal,
      promoTotal,
      taxTotal,
      taxTotalZeroToFree,
      total,
      totalZeroToFree,
    ]
  );

  const couponWalletNode = inCheckout ? (
    <CheckoutCouponWallet disabled={accessInPos && !!posOrderId ? true : couponDisabled} currentUser={currentUser} />
  ) : (
    <CartCouponWallet disabled={couponDisabled} currentUser={currentUser} />
  );

  return (
    <>
      <ItemTotal
        label={labels.itemsSubtotal}
        value={formattedPrices.itemTotal}
        loading={loading}
        forcePadding={forceRowPadding}
      />
      <Divider />

      {showWarranty && (
        <>
          <WarrantyTotal
            label={labels.warrantySubtotal}
            value={formattedPrices.warrantyTotal}
            loading={loading}
            forcePadding={forceRowPadding}
          />
          <Divider />
        </>
      )}

      <ShippingItem
        label={labels.shipping}
        amount={formattedPrices.shipmentTotal}
        originAmount={formattedPrices.shipmentOriginal}
        showOriginAmount={showOriginShippingAmount}
        showShippingZipcode={showShippingZipcode}
        inCheckout={inCheckout}
        loading={loading}
        forcePadding={forceRowPadding}
        originAmountFirst={originShippingAmountFirst}
        actionDisabled={shippingDisabled}
      />
      <Divider />

      {showService && (
        <>
          <ServiceItem
            text={labels.service}
            ctaText={labels.viewServiceDetails}
            amount={formattedPrices.serviceTotal}
            list={serviceList}
            loading={loading}
            forcePadding={forceRowPadding}
          />
          <Divider />
        </>
      )}

      {showPromotion ? (
        <>
          <PromotionItem
            text={labels.promotion}
            ctaText={labels.viewPromotionDetails}
            amount={formattedPrices.promoTotal}
            list={promotionList}
            loading={loading}
            forcePadding={forceRowPadding}
          />
          {!!promotionInvalidMsg && (
            <Typography
              level="caption2"
              color="danger"
              sx={{
                mobile: { px: 4, pb: showPromotion ? 4 : 0, pt: showPromotion ? 0 : 4 },
                desktop: { px: 6, pb: showPromotion ? 4 : 0, pt: showPromotion ? 0 : 4 },
                tablet: { px: 6, pb: showPromotion ? 4 : 0, pt: showPromotion ? 0 : 4 },
                ...(forceRowPadding && { px: 4, pb: showPromotion ? 4 : 0, pt: showPromotion ? 0 : 4 }),
              }}
            >
              {promotionInvalidMsg}
            </Typography>
          )}
          <Divider />
        </>
      ) : promotionInvalidMsg ? (
        <>
          <PromotionInvalidItem forcePadding={forceRowPadding}>{promotionInvalidMsg}</PromotionInvalidItem>
          <Divider />
        </>
      ) : null}

      {useRowForCouponWallet ? (
        <>
          <SummaryRow forcePadding={forceRowPadding}>{couponWalletNode}</SummaryRow>
          <Divider />
        </>
      ) : (
        <>
          <Box sx={{ position: 'relative' }}>
            {couponWalletNode}
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Skeleton variant="text" animation="wave" level="h3" sx={{ width: '100%', opacity: 0.9 }} />
              </Box>
            )}
          </Box>
          <Divider />
        </>
      )}

      {showSalesTax && Boolean(taxTotal) && (
        <>
          <SalesTaxItem
            label={labels.salesTax}
            value={formattedPrices.taxTotal}
            loading={loading}
            forcePadding={forceRowPadding}
          />
          <Divider />
        </>
      )}

      <TotalItem
        label={labels.total}
        total={formattedPrices.total}
        totalWithTaxLabel={labels.totalWithTaxLabel}
        totalWithTaxTooltip={labels.totalWithTaxTooltip}
        showTotalWithTax={showTotalWithTax}
        addonDescription={totalAddonDescription}
        loading={loading}
        forcePadding={forceRowPadding}
      />
    </>
  );
});

export default OrderSummaryListCore;
