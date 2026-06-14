import type { MetaCapiClient } from '../platforms/meta-capi';
import { AddToCartEventSchema, MetaCapiPayloadSchema, type AddToCartEvent } from '../schemas';

export interface MetaAddToCartTriggerDeps {
  client: MetaCapiClient;
  now?: () => number;
}

export const trackMetaAddToCart = async (event: AddToCartEvent, deps: MetaAddToCartTriggerDeps): Promise<void> => {
  const parsed = AddToCartEventSchema.parse(event);
  const { event_id, item } = parsed;
  const now = deps.now ?? (() => Math.floor(Date.now() / 1000));

  const payload = MetaCapiPayloadSchema.parse({
    event_name: 'AddToCart',
    event_id,
    event_time: now(),
    custom_data: {
      value: round2(item.price * item.quantity),
      currency: item.currency,
      content_ids: [item.sku],
      contents: [
        {
          id: item.sku,
          quantity: item.quantity,
          item_price: item.price,
        },
      ],
    },
  });

  await deps.client.send(payload);
};

const round2 = (n: number) => Math.round(n * 100) / 100;
