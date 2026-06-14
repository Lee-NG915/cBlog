import { EcEnv } from '@castlery/config';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { getCookie, setCookie, deleteCookie, getCookies, hasCookie } from 'cookies-next';
import type { Context } from 'next-redux-wrapper';

export const makeExtraArgument = (context?: Context) => {
  return {
    country: EcEnv.NEXT_PUBLIC_COUNTRY,
    cookies: {
      getCookie,
      setCookie,
      deleteCookie,
      getCookies,
      hasCookie,
    },
    persistenceHandles: makePersistenceHandles(),
    context,
    auth: 'strict' || 'loose' || 'basic',
    // router,
  };
};

export type ExtraArgument = ReturnType<typeof makeExtraArgument>;
