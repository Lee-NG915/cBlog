import type { Order } from '@castlery/types';
import currency from 'currency.js';

export const calcSummary = (order: Order | null) => {
  if (!order) {
    return {
      total: 0,
      itemTotal: 0,
      additionalTaxTotal: 0,
      serviceOriginal: 0,
      serviceTotal: 0,
      servicePromo: 0,
      shipmentTotal: 0,
      shipmentOriginal: 0,
      promoTotal: 0,
    };
  }

  const coupon = order.coupon ? Math.abs(+order.coupon.amount) : 0; // campaign 优惠排除 coupon amount

  // promotion 总价需要减掉 gift 的价格
  const promotionGiftTotal = order.promotions
    .filter((promotion) => promotion.adjustable_type === 'gift')
    .reduce((result, promotion) => result + Math.abs(Number(promotion.amount)), 0);

  // manual_discount_total是pos里面手动改价的金额
  const manualDiscountTotal = order.line_items.reduce(
    (result, item) => result + (Number(item.manual_discount_total) || 0),
    0
  );
  const orderGiftTotal = order.line_items
    .filter((item) => !!item.gift_id)
    .reduce((result, item) => result + (Number(item.amount) || 0), 0);

  const itemTotal = +order.item_total + manualDiscountTotal - orderGiftTotal;
  const additionalTaxTotal = +order.additional_tax_total; // us have tax
  let promoTotal =
    Math.abs(Number((Number(order.adjustment_total) - additionalTaxTotal).toFixed(2))) - coupon + manualDiscountTotal;

  const serviceOriginal = Array.isArray(order.shipments)
    ? order.shipments.reduce((acc, shipment) => acc + +shipment.service_fee || 0, 0)
    : 0;
  const servicePromo = order.promotions
    .filter((promotion) => promotion.adjustable_type === 'shipment_service_fee')
    .reduce((acc, promotion) => acc + Math.abs(Number(promotion.amount)) || 0, 0);
  const serviceTotal = serviceOriginal - servicePromo; // service 现价 = 原价 - 优惠

  const shipmentPromoTotal = order.promotions
    .filter((p) => p.adjustable_type === 'shipment')
    .reduce((acc, promotion) => acc + Math.abs(Number(promotion.amount)), 0);

  const shipmentOriginal = +order.shipment_total - serviceOriginal;
  const shipmentTotal = shipmentPromoTotal ? shipmentOriginal - shipmentPromoTotal : shipmentOriginal;

  promoTotal = promoTotal - servicePromo - promotionGiftTotal - shipmentPromoTotal;

  const total = +order.total;
  return {
    total,
    itemTotal,
    additionalTaxTotal,
    serviceOriginal,
    serviceTotal,
    servicePromo,
    shipmentTotal,
    shipmentOriginal,
    promoTotal,
  };
};
export const format = (num: number, decimal = 0) => {
  try {
    return (+num)
      .toFixed(decimal)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      .replace(/\.0+$/, '');
  } catch (error) {
    // console.error(error);
    return '0';
  }
};

export const toPrice = (num: number, zeroToFree = false) => {
  try {
    num = +num;
    if (Number.isNaN(num)) return '';
    if (num === 0) {
      if (zeroToFree) {
        return 'Free';
      } else {
        return '$0';
      }
    }
    return currency(num, {
      symbol: '$',
      separator: ',',
      decimal: '.',
      precision: 2,
    }).format();
  } catch (error) {
    return '';
  }
};
