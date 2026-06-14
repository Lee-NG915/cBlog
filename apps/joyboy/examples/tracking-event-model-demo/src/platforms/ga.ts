import type { GADataLayerPayload } from '../schemas';

export interface DataLayer {
  push: (payload: GADataLayerPayload) => void;
}

export const createDataLayer = (): DataLayer & { snapshot: () => GADataLayerPayload[] } => {
  const buffer: GADataLayerPayload[] = [];
  return {
    push: (payload) => {
      buffer.push(payload);
    },
    snapshot: () => [...buffer],
  };
};
