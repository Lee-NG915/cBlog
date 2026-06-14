import type { DataLayer } from '../platforms/ga';
import { GADataLayerPayloadSchema, OrderPurchasedEventSchema, type OrderPurchasedEvent } from '../schemas';

export interface GAPurchaseTriggerDeps {
  dataLayer: DataLayer;
}

export const trackGAPurchase = (event: OrderPurchasedEvent, deps: GAPurchaseTriggerDeps): void => {
  const parsed = OrderPurchasedEventSchema.parse(event);
  const { event_id, order } = parsed;

  const payload = GADataLayerPayloadSchema.parse({
    event: 'purchase',
    event_id,
    ecommerce: {
      currency: order.summary.currency,
      value: order.summary.value,
      transaction_id: order.number,
      items: order.items.map((it) => ({
        item_id: it.sku,
        price: it.price,
        quantity: it.quantity,
      })),
    },
  });

  deps.dataLayer.push(payload);
};
