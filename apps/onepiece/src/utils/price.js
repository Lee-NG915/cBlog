/**
 * 计算商品划线价
 * @param {*} item
 * @returns
 */
export const calcItemStrikeThroughPrice = (item) => {
  if (!item || Object.keys(item).length === 0) return null;
  // 注意bundle商品划线价计算方式
  return item.product_type === 'bundle'
    ? Array.isArray(item.bundle_line_items)
      ? item.bundle_line_items.reduce(
          (acr, cur) =>
            acr + ((+Number(cur.variant?.list_price) || 0) * (+cur.quantity || 1) || 0) * (item.quantity || 1),
          0
        )
      : 0
    : (+item.variant?.list_price || 0) * (+item.quantity || 1) || null;
};

/**
 *
 * @param order
 */
export const calcShipmentsFee = (order) => {
  const serviceOriginal =
    order.shipments && order.shipments.reduce((acc, shipment) => acc + shipment.service_fee * 1 || 0, 0);
  const shipmentPromo = order.promotions.filter((p) => p.adjustable_type === 'shipment');

  const shipmentsOriginal = +order.shipment_total - serviceOriginal;
  let shipmentsTotal = shipmentsOriginal;
  if (shipmentPromo.length) {
    const shipmentPromoAmount = shipmentPromo.reduce((acc, promotion) => acc + +promotion.amount, 0);
    shipmentsTotal = +order.shipment_total + shipmentPromoAmount - serviceOriginal;
  }
  return {
    shipmentsOriginal,
    shipmentsTotal,
  };
};
