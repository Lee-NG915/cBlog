import { describe, expect, it, vi } from 'vitest';
import { orderPurchasedEvent } from '../src/actions';
import { setupOrderTrackingListener } from '../src/listeners/order-tracking.listener';
import { createDataLayer } from '../src/platforms/ga';
import { createMetaCapiClient } from '../src/platforms/meta-capi';
import type { Order } from '../src/types';

const fixtureOrder: Order = {
  id: 'ord_abc',
  number: 'US123456',
  summary: { value: 2598, currency: 'USD' },
  items: [
    { sku: 'CHAIR-123', quantity: 2, price: 1299 },
    { sku: 'LAMP-001', quantity: 1, price: 199 },
  ],
};

const buildDeps = (overrides: Partial<Parameters<typeof setupOrderTrackingListener>[0]> = {}) => {
  const dataLayer = createDataLayer();
  const metaCapi = createMetaCapiClient();
  return {
    dataLayer,
    metaCapi,
    deps: {
      dataLayer,
      metaCapi,
      getConsent: () => ({ marketing: true }),
      generateEventId: () => 'purchase_test',
      now: () => 1_700_000_000,
      ...overrides,
    },
  };
};

describe('order-tracking listener · order_purchased', () => {
  it('fans out to GA and Meta with shared event_id', async () => {
    const { dataLayer, metaCapi, deps } = buildDeps();
    const listener = setupOrderTrackingListener(deps);

    await listener(orderPurchasedEvent({ order: fixtureOrder }));

    expect(dataLayer.snapshot()).toHaveLength(1);
    expect(metaCapi.sent()).toHaveLength(1);
    expect(dataLayer.snapshot()[0].event_id).toBe('purchase_test');
    expect(metaCapi.sent()[0].event_id).toBe('purchase_test');
  });

  it('dedupes by order.id within the listener lifetime', async () => {
    const idGen = vi.fn().mockReturnValueOnce('purchase_1').mockReturnValueOnce('purchase_2');
    const { dataLayer, metaCapi, deps } = buildDeps({ generateEventId: idGen });
    const listener = setupOrderTrackingListener(deps);

    await listener(orderPurchasedEvent({ order: fixtureOrder }));
    await listener(orderPurchasedEvent({ order: fixtureOrder }));

    expect(dataLayer.snapshot()).toHaveLength(1);
    expect(metaCapi.sent()).toHaveLength(1);
    expect(idGen).toHaveBeenCalledTimes(1);
  });

  it('allows a different order.id to dispatch a separate event', async () => {
    const { dataLayer, deps } = buildDeps();
    const listener = setupOrderTrackingListener(deps);

    await listener(orderPurchasedEvent({ order: fixtureOrder }));
    await listener(orderPurchasedEvent({ order: { ...fixtureOrder, id: 'ord_def', number: 'US999' } }));

    expect(dataLayer.snapshot()).toHaveLength(2);
  });

  it('only sends GA when marketing consent is missing', async () => {
    const { dataLayer, metaCapi, deps } = buildDeps({ getConsent: () => ({ marketing: false }) });
    const listener = setupOrderTrackingListener(deps);

    await listener(orderPurchasedEvent({ order: fixtureOrder }));

    expect(dataLayer.snapshot()).toHaveLength(1);
    expect(metaCapi.sent()).toHaveLength(0);
  });
});
