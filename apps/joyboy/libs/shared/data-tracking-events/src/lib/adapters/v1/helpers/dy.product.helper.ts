import { type Order } from '../entities';

export const findItemFromOrder = (itemId: string, order: Order) => {
  const target = order.line_items.find((item) => item.variant.sku === itemId);
  if (!target) {
    throw new Error(`Item with id ${itemId} not found in order`);
  }
  return {
    value: Number(target.amount) * target.quantity,
    quantity: target.quantity,
    currency: order.currency,
    productId: target.variant.sku,
  };
};

export const formatCart = (order: Order) => {
  return (
    order?.line_items?.map((item) => ({
      productId: item.variant.sku,
      quantity: item.quantity,
      itemPrice: Number(item.amount),
    })) || []
  );
};
