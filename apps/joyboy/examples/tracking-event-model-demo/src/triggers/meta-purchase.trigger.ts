import type { MetaCapiClient } from '../platforms/meta-capi';
import { MetaCapiPayloadSchema, OrderPurchasedEventSchema, type OrderPurchasedEvent } from '../schemas';

export interface MetaPurchaseTriggerDeps {
  client: MetaCapiClient;
  now?: () => number;
}

export const trackMetaPurchase = async (event: OrderPurchasedEvent, deps: MetaPurchaseTriggerDeps): Promise<void> => {
  const parsed = OrderPurchasedEventSchema.parse(event);
  const { event_id, order } = parsed;
  const now = deps.now ?? (() => Math.floor(Date.now() / 1000));

  const payload = MetaCapiPayloadSchema.parse({
    event_name: 'Purchase',
    event_id,
    event_time: now(),
    custom_data: {
      value: order.summary.value,
      currency: order.summary.currency,
      order_id: order.id,
      content_ids: order.items.map((it) => it.sku),
      contents: order.items.map((it) => ({
        id: it.sku,
        quantity: it.quantity,
        item_price: it.price,
      })),
    },
  });

  await deps.client.send(payload);
};
