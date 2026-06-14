import { logger } from '@castlery/observability/client';

export const Log = {
  err: (message: string) => {
    logger.error('[Data Tracking]', { message });
  },
  log: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DT Log][Info:]▶︎▶︎▶︎', message);
    }
  },
};

export const throwErr = {
  empty: (field: string, eventName: string) => {
    throw new Error(`[DT Error][Not Expected] => ${field} is not expected to be empty in ${eventName}.`);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  invalid: (field: string, eventName: string) => {},
};
