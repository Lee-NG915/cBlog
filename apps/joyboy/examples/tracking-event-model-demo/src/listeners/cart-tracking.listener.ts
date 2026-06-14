import type { DomainAction } from '../actions';
import type { ConsentState } from '../types';
import type { DataLayer } from '../platforms/ga';
import type { MetaCapiClient } from '../platforms/meta-capi';
import { trackGAAddToCart } from '../triggers/ga-add-to-cart.trigger';
import { trackMetaAddToCart } from '../triggers/meta-add-to-cart.trigger';

export interface CartTrackingDeps {
  dataLayer: DataLayer;
  metaCapi: MetaCapiClient;
  getConsent: () => ConsentState;
  generateEventId: () => string;
  now?: () => number;
}

export const setupCartTrackingListener = (deps: CartTrackingDeps) => {
  return async (action: DomainAction): Promise<void> => {
    if (action.type !== 'cart/itemAdded') return;

    const { cartId, item, source } = action.payload;
    const event = {
      event_id: deps.generateEventId(),
      cart_id: cartId,
      source,
      item,
    };

    trackGAAddToCart(event, { dataLayer: deps.dataLayer });

    if (deps.getConsent().marketing) {
      await trackMetaAddToCart(event, { client: deps.metaCapi, now: deps.now });
    }
  };
};
