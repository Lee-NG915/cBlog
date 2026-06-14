import type { MetaCapiPayload } from '../schemas';

export interface MetaCapiClient {
  send: (payload: MetaCapiPayload) => Promise<void>;
}

export const createMetaCapiClient = (): MetaCapiClient & {
  sent: () => MetaCapiPayload[];
} => {
  const buffer: MetaCapiPayload[] = [];
  return {
    send: async (payload) => {
      buffer.push(payload);
    },
    sent: () => [...buffer],
  };
};
