'use client';
import { useMemo } from 'react';
import { SummarySchema } from '@castlery/types';

export const useCalculateCartSummary = (cartSummary: SummarySchema | null) => {
  const calculateSummary = useMemo(() => {
    // if cartSummary is empty, return undefined
    if (!cartSummary || Object.keys(cartSummary).length <= 0) {
      return {
        itemTotal: undefined,
        warrantyTotal: undefined,
        warrantyOriginalTotal: undefined,
        shipmentTotal: undefined,
        shipmentOriginal: undefined,
        couponTotal: undefined,
        promoTotal: undefined,
        taxTotal: undefined,
        serviceTotal: undefined,
        serviceOriginalTotal: undefined,
        total: undefined,
      };
    }
    let itemTotal = 0;
    let warrantyTotal = 0;
    let warrantyOriginalTotal = 0;
    let shipmentTotal = 0;
    let shipmentOriginal = 0;
    let couponTotal = 0;
    let promoTotal = 0;
    let taxTotal = 0;
    let serviceTotal = 0;
    let serviceOriginalTotal = 0;
    let total = 0;
    itemTotal = cartSummary?.itemTotal ? +cartSummary.itemTotal.actualSubtotal : 0;
    if (cartSummary?.warrantyTotal) {
      warrantyTotal = +cartSummary.warrantyTotal.actualTotal;
      warrantyOriginalTotal = +cartSummary.warrantyTotal.originalTotal;
    }
    if (cartSummary?.shippingFee) {
      shipmentTotal = +cartSummary.shippingFee.actualTotal;
      shipmentOriginal = +cartSummary.shippingFee.shipmentOriginalTotal;
    }
    if (cartSummary?.coupon) {
      couponTotal = +cartSummary.coupon.amount;
    }
    promoTotal = cartSummary?.promotionDetails?.displayPromotionTotal
      ? Math.abs(+cartSummary.promotionDetails.displayPromotionTotal)
      : 0;
    taxTotal = cartSummary?.tax?.additionalTaxTotal ? +cartSummary.tax.additionalTaxTotal : 0;
    if (cartSummary?.serviceAmount?.originalTotal) {
      serviceTotal = +cartSummary.serviceAmount.actualTotal;
      serviceOriginalTotal = +cartSummary.serviceAmount.originalTotal;
    }
    total = cartSummary?.total ? +cartSummary.total : 0;

    return {
      itemTotal,
      warrantyTotal,
      warrantyOriginalTotal,
      shipmentTotal,
      shipmentOriginal,
      couponTotal,
      promoTotal,
      taxTotal,
      serviceTotal,
      serviceOriginalTotal,
      total,
    };
  }, [cartSummary]);

  return calculateSummary;
};
