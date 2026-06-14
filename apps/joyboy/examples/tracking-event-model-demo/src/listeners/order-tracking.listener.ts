import type { DomainAction } from '../actions';
import type { ConsentState } from '../types';
import type { DataLayer } from '../platforms/ga';
import type { MetaCapiClient } from '../platforms/meta-capi';
import { trackGAPurchase } from '../triggers/ga-purchase.trigger';
import { trackMetaPurchase } from '../triggers/meta-purchase.trigger';

export interface OrderTrackingDeps {
  dataLayer: DataLayer;
  metaCapi: MetaCapiClient;
  getConsent: () => ConsentState;
  generateEventId: () => string;
  now?: () => number;
}

export const setupOrderTrackingListener = (deps: OrderTrackingDeps) => {
  // Dedupe key 是显式契约：同一 order.id 在 listener 生命周期内只发一次
  const seenOrderIds = new Set<string>();

  return async (action: DomainAction): Promise<void> => {
    if (action.type !== 'order/purchased') return;
    const { order } = action.payload;

    if (seenOrderIds.has(order.id)) return;
    seenOrderIds.add(order.id);

    const event = {
      event_id: deps.generateEventId(),
      order,
    };

    trackGAPurchase(event, { dataLayer: deps.dataLayer });

    if (deps.getConsent().marketing) {
      await trackMetaPurchase(event, { client: deps.metaCapi, now: deps.now });
    }
  };
};
