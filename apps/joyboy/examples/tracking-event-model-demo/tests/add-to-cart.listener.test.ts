import { describe, expect, it, vi } from 'vitest';
import { cartItemAddedEvent } from '../src/actions';
import { setupCartTrackingListener } from '../src/listeners/cart-tracking.listener';
import { createDataLayer } from '../src/platforms/ga';
import { createMetaCapiClient } from '../src/platforms/meta-capi';
import type { CartItem } from '../src/types';

const fixtureItem: CartItem = {
  sku: 'CHAIR-123',
  name: 'Linen Sofa',
  price: 1299,
  quantity: 2,
  currency: 'USD',
};

const buildDeps = (overrides: Partial<Parameters<typeof setupCartTrackingListener>[0]> = {}) => {
  const dataLayer = createDataLayer();
  const metaCapi = createMetaCapiClient();
  return {
    dataLayer,
    metaCapi,
    deps: {
      dataLayer,
      metaCapi,
      getConsent: () => ({ marketing: true }),
      generateEventId: () => 'atc_test_id',
      now: () => 1_700_000_000,
      ...overrides,
    },
  };
};

describe('cart-tracking listener · add_to_cart fan-out', () => {
  it('fans out to GA and Meta when marketing consent granted', async () => {
    const { dataLayer, metaCapi, deps } = buildDeps();
    const listener = setupCartTrackingListener(deps);

    await listener(cartItemAddedEvent({ cartId: 'cart_1', item: fixtureItem, source: 'pdp' }));

    expect(dataLayer.snapshot()).toHaveLength(1);
    expect(metaCapi.sent()).toHaveLength(1);
    expect(dataLayer.snapshot()[0].event_id).toBe('atc_test_id');
    expect(metaCapi.sent()[0].event_id).toBe('atc_test_id');
  });

  it('only sends GA when marketing consent is missing', async () => {
    const { dataLayer, metaCapi, deps } = buildDeps({
      getConsent: () => ({ marketing: false }),
    });
    const listener = setupCartTrackingListener(deps);

    await listener(cartItemAddedEvent({ cartId: 'cart_1', item: fixtureItem, source: 'pdp' }));

    expect(dataLayer.snapshot()).toHaveLength(1);
    expect(metaCapi.sent()).toHaveLength(0);
  });

  it('ignores unrelated actions', async () => {
    const { dataLayer, metaCapi, deps } = buildDeps();
    const listener = setupCartTrackingListener(deps);

    await listener({
      type: 'order/purchased',
      payload: { order: { id: 'x', number: 'x', summary: { value: 1, currency: 'USD' }, items: [] } },
    });

    expect(dataLayer.snapshot()).toHaveLength(0);
    expect(metaCapi.sent()).toHaveLength(0);
  });

  it('generates a unique event_id per dispatch', async () => {
    const idGen = vi.fn().mockReturnValueOnce('atc_1').mockReturnValueOnce('atc_2');
    const { dataLayer, deps } = buildDeps({ generateEventId: idGen });
    const listener = setupCartTrackingListener(deps);

    await listener(cartItemAddedEvent({ cartId: 'cart_1', item: fixtureItem, source: 'pdp' }));
    await listener(cartItemAddedEvent({ cartId: 'cart_1', item: fixtureItem, source: 'plp' }));

    expect(dataLayer.snapshot().map((p) => p.event_id)).toEqual(['atc_1', 'atc_2']);
  });
});
