import { Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  productShippingZipcodeSelectorClickedEvent,
  productShippingZipcodeSelectorSubmittedEvent,
} from '@castlery/modules-product-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  quickshipZipcodeSelectorClickedEvent,
  quickshipZipcodeSelectorSubmittedEvent,
} from '@castlery/modules-search-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  cartShippingZipcodeSelectorClickedEvent,
  cartShippingZipcodeSelectorSubmittedEvent,
  type CartShippingZipcodeSelectorSource,
} from '@castlery/modules-cart-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  checkoutShippingZipcodeSelectorClickedEvent,
  checkoutShippingZipcodeSelectorSubmittedEvent,
} from '@castlery/modules-checkout-domain';
import { EVENT_SHIPPING_SELECTOR } from '../events';
import type { ShippingSelectorLabel } from '../entity/ga-events.schema';

/**
 * Cart-side source enum → GA `label`. The cart domain payload narrows to the
 * exact set of GA labels that originate from cart surfaces.
 */
const CART_SOURCE_TO_LABEL: Record<CartShippingZipcodeSelectorSource, ShippingSelectorLabel> = {
  Fullcart: 'Fullcart',
  Minicart: 'Minicart',
  Fullcart_banner: 'Fullcart_banner',
  Minicart_banner: 'Minicart_banner',
};

/**
 * @description Subscribes to per-domain shipping-zipcode-selector interaction events
 * (product / search / cart / checkout) and fans them out to the GA
 * `zipcode_shipping_calculator` trigger with the correct action+label mapping.
 *
 * Mapping rules:
 * - PDP click    → action=click_default_zipcode,    label=PDP
 * - PDP submit   → action=click_submit_zipcode,     label=PDP
 * - PLP click    → action=click_default_zipcode,    label=Quickship
 * - PLP submit   → action=click_submit_zipcode,     label=Quickship
 * - Cart click   → action=click_shipping_calculator, label=<cart source>
 * - Cart submit  → action=submit_shipping_calculator, label=<cart source>
 * - Cko click    → action=click_shipping_calculator, label=Ordersummary
 * - Cko submit   → action=submit_shipping_calculator, label=Ordersummary
 */
export function setupShippingTrackingListeners(startListening: AppStartListening): Unsubscribe {
  if (!accessInWeb) {
    return () => undefined;
  }

  const subscriptions = [
    // ===== Product / PDP =====
    startListening({
      actionCreator: productShippingZipcodeSelectorClickedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_default_zipcode', label: 'PDP' }));
      },
    }),
    startListening({
      actionCreator: productShippingZipcodeSelectorSubmittedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_submit_zipcode', label: 'PDP' }));
      },
    }),

    // ===== Search / PLP Quickship =====
    startListening({
      actionCreator: quickshipZipcodeSelectorClickedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_default_zipcode', label: 'Quickship' }));
      },
    }),
    startListening({
      actionCreator: quickshipZipcodeSelectorSubmittedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_submit_zipcode', label: 'Quickship' }));
      },
    }),

    // ===== Cart =====
    startListening({
      actionCreator: cartShippingZipcodeSelectorClickedEvent,
      effect: async (action, { dispatch }) => {
        const label = CART_SOURCE_TO_LABEL[action.payload.source];
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_shipping_calculator', label }));
      },
    }),
    startListening({
      actionCreator: cartShippingZipcodeSelectorSubmittedEvent,
      effect: async (action, { dispatch }) => {
        const label = CART_SOURCE_TO_LABEL[action.payload.source];
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'submit_shipping_calculator', label }));
      },
    }),

    // ===== Checkout =====
    startListening({
      actionCreator: checkoutShippingZipcodeSelectorClickedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'click_shipping_calculator', label: 'Ordersummary' }));
      },
    }),
    startListening({
      actionCreator: checkoutShippingZipcodeSelectorSubmittedEvent,
      effect: async (_, { dispatch }) => {
        await dispatch(EVENT_SHIPPING_SELECTOR({ action: 'submit_shipping_calculator', label: 'Ordersummary' }));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
