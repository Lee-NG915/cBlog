import type { DataLayer } from '../platforms/ga';
import { AddToCartEventSchema, GADataLayerPayloadSchema, type AddToCartEvent } from '../schemas';

export interface GAAddToCartTriggerDeps {
  dataLayer: DataLayer;
}

export const trackGAAddToCart = (event: AddToCartEvent, deps: GAAddToCartTriggerDeps): void => {
  const parsed = AddToCartEventSchema.parse(event);
  const { event_id, item } = parsed;

  const payload = GADataLayerPayloadSchema.parse({
    event: 'add_to_cart',
    event_id,
    ecommerce: {
      currency: item.currency,
      value: round2(item.price * item.quantity),
      items: [
        {
          item_id: item.sku,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        },
      ],
    },
  });

  deps.dataLayer.push(payload);
};

const round2 = (n: number) => Math.round(n * 100) / 100;
