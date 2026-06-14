import { describe, expect, it } from 'vitest';
import { createDataLayer } from '../src/platforms/ga';
import { createMetaCapiClient } from '../src/platforms/meta-capi';
import { trackGAPurchase } from '../src/triggers/ga-purchase.trigger';
import { trackMetaPurchase } from '../src/triggers/meta-purchase.trigger';
import type { OrderPurchasedEvent } from '../src/schemas';

const baseEvent: OrderPurchasedEvent = {
  event_id: 'purchase_test',
  order: {
    id: 'ord_abc',
    number: 'US123456',
    summary: { value: 2797, currency: 'USD' },
    items: [
      { sku: 'CHAIR-123', quantity: 2, price: 1299 },
      { sku: 'LAMP-001', quantity: 1, price: 199 },
    ],
  },
};

describe('GA purchase trigger', () => {
  it('produces GA4 purchase payload with transaction_id = order.number', () => {
    const dataLayer = createDataLayer();
    trackGAPurchase(baseEvent, { dataLayer });

    const payload = dataLayer.snapshot()[0];
    expect(payload.event).toBe('purchase');
    expect(payload.ecommerce.transaction_id).toBe('US123456');
    expect(payload.ecommerce.value).toBe(2797);
    expect(payload.ecommerce.items).toHaveLength(2);
  });
});

describe('Meta purchase trigger', () => {
  it('uses order.id as Meta order_id (not order.number)', async () => {
    const client = createMetaCapiClient();
    await trackMetaPurchase(baseEvent, { client, now: () => 1_700_000_000 });

    const payload = client.sent()[0];
    expect(payload.event_name).toBe('Purchase');
    expect(payload.custom_data.order_id).toBe('ord_abc');
    expect(payload.custom_data.content_ids).toEqual(['CHAIR-123', 'LAMP-001']);
    expect(payload.custom_data.contents).toEqual([
      { id: 'CHAIR-123', quantity: 2, item_price: 1299 },
      { id: 'LAMP-001', quantity: 1, item_price: 199 },
    ]);
  });
});
