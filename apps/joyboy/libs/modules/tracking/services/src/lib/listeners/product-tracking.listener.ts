import { Unsubscribe } from '@reduxjs/toolkit';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { guardsmanWarrantyInteractionEvent } from '@castlery/modules-product-domain';
import { EVENT_GUARDSMAN_WARRANTY } from '../events';

/** [Guardsman 埋点] PDP 侧 insurance interaction → GA guardsman_warranty */
export function setupProductTrackingListeners(startListening: AppStartListening): Unsubscribe {
  return startListening({
    actionCreator: guardsmanWarrantyInteractionEvent,
    effect: async ({ payload }, { dispatch }) => {
      await dispatch(EVENT_GUARDSMAN_WARRANTY(payload));
    },
  });
}
