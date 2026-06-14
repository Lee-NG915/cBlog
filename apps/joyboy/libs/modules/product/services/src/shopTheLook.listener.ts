/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AppStartListening } from '@castlery/shared-redux-store';
import { Unsubscribe, isAnyOf, isAllOf } from '@reduxjs/toolkit';
import { getLookVariantEvent, setShopTheLookVariantData } from '@castlery/modules-product-domain';
/**
 * Subscribes counter listeners and returns a `teardown` function.
 * @example
 * ```ts
 * useEffect(() => {
 *   const unsubscribe = setupCounterListeners();
 *   return unsubscribe;
 * }, []);
 * ```
 */
export function setupShopTheLookListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    startListening({
      matcher: getLookVariantEvent,
      effect: async (action, { dispatch, getState }) => {
        const { payload } = action;
        dispatch(setShopTheLookVariantData(payload));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
