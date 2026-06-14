import { describe, expect, it } from 'vitest';
import { createDataLayer } from '../src/platforms/ga';
import { createMetaCapiClient } from '../src/platforms/meta-capi';
import { trackGAAddToCart } from '../src/triggers/ga-add-to-cart.trigger';
import { trackMetaAddToCart } from '../src/triggers/meta-add-to-cart.trigger';
import type { AddToCartEvent } from '../src/schemas';

const baseEvent: AddToCartEvent = {
  event_id: 'atc_test',
  cart_id: 'cart_1',
  source: 'pdp',
  item: {
    sku: 'CHAIR-123',
    name: 'Linen Sofa',
    price: 1299,
    quantity: 2,
    currency: 'USD',
  },
};

describe('GA add_to_cart trigger', () => {
  it('produces GA4 ecommerce payload with value = price * quantity', () => {
    const dataLayer = createDataLayer();
    trackGAAddToCart(baseEvent, { dataLayer });

    expect(dataLayer.snapshot()[0]).toEqual({
      event: 'add_to_cart',
      event_id: 'atc_test',
      ecommerce: {
        currency: 'USD',
        value: 2598,
        items: [{ item_id: 'CHAIR-123', item_name: 'Linen Sofa', price: 1299, quantity: 2 }],
      },
    });
  });

  it('throws when required field is missing (schema enforcement)', () => {
    const dataLayer = createDataLayer();
    const bad = { ...baseEvent, event_id: '' };
    expect(() => trackGAAddToCart(bad, { dataLayer })).toThrow();
    expect(dataLayer.snapshot()).toHaveLength(0);
  });
});

describe('Meta add_to_cart trigger', () => {
  it('produces Meta CAPI payload sharing event_id with GA', async () => {
    const client = createMetaCapiClient();
    await trackMetaAddToCart(baseEvent, { client, now: () => 1_700_000_000 });

    expect(client.sent()[0]).toEqual({
      event_name: 'AddToCart',
      event_id: 'atc_test',
      event_time: 1_700_000_000,
      custom_data: {
        value: 2598,
        currency: 'USD',
        content_ids: ['CHAIR-123'],
        contents: [{ id: 'CHAIR-123', quantity: 2, item_price: 1299 }],
      },
    });
  });
});
