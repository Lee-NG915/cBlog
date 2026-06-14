import type { AppStartListening, RootState } from '@castlery/shared-redux-store';
import { Unsubscribe } from '@reduxjs/toolkit';
import { EcEnv, enableBranch } from '@castlery/config';
import {
  EnterAppEvent,
  logout,
  // salesRepLoggedInEvent
} from '@castlery/modules-user-domain';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import {
  getRetailById,
  selectedRetailId,
  setRetail,
  getStockLocationsByRetailId,
} from '@castlery/modules-retails-domain';
import { logger } from '@castlery/observability/client';
// import { ReadonlyURLSearchParams } from 'next/navigation';
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
export function setupRetailsListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'POS' && [
      /**
       * 把 localStorage 中的 retailId 更新到 store 中
       */
      startListening({
        actionCreator: EnterAppEvent,
        effect: async (action, { dispatch, extra, getState }) => {
          const rootState = getState() as RootState;
          let retailId = selectedRetailId(rootState);
          if (retailId) return;
          const { persistenceHandles } = extra as ExtraArgument;
          retailId = Number(persistenceHandles.retailId.getItem());
          if (!retailId && enableBranch) {
            logger.error('Retail ID not found in storage, forcing logout', { retailId });
            await dispatch(logout({}));
            return;
          }

          if (enableBranch) {
            const { data } = await dispatch(getRetailById.initiate(retailId));
            if (!data) return;
            dispatch(setRetail(data));
          }
        },
      }),
      startListening({
        matcher: getStockLocationsByRetailId.matchFulfilled,
        effect: async (action, { extra }) => {
          const { persistenceHandles } = extra as ExtraArgument;
          const filteredStockLocations = action.payload.filter((item) => item.id);
          for (const stockLocation of filteredStockLocations) {
            if (stockLocation.location_type === 'stock') {
              persistenceHandles.retailStockLocationType.setItem(stockLocation.id);
            } else if (stockLocation.location_type === 'display') {
              persistenceHandles.retailDisplayLocationType.setItem(stockLocation.id);
            }
          }
        },
      }),
    ]) ||
      []),

    ...((EcEnv.NEXT_PUBLIC_CHANNEL === 'WEB' && []) || []),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
