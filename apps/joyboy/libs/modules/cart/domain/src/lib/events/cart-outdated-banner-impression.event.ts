import { createAction } from '@reduxjs/toolkit';

/**
 * @description Discriminator for the two outdated-banner variants rendered by
 * `<OutDatedNotice />`. Mirrors `OutdatedBannerKind` on the tracking side but
 * stays decoupled — the listener performs the mapping.
 *
 * - `price_change`: the line item's price is outdated
 * - `out_of_stock`: the line item is out of stock (or region-outdated)
 */
export type CartOutdatedBannerKind = 'price_change' | 'out_of_stock';

export interface CartOutdatedBannerImpressionPayload {
  kind: CartOutdatedBannerKind;
  /** Variant SKU of the line item showing the banner. */
  sku: string;
  /** Variant display name of the line item showing the banner. */
  name: string;
}

/**
 * @description The cart-item outdated banner became visible (mount, or the
 *              banner variant flipped between price-change and out-of-stock).
 *              Driven by `WebCartItem`'s `useEffect`; consumed by
 *              `cart-tracking.listener` and mapped to the GA trigger.
 */
export const cartOutdatedBannerImpressionEvent = createAction<CartOutdatedBannerImpressionPayload>(
  'cart/outdatedBannerImpression'
);
