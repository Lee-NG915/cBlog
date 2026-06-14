import { EcEnv, X_ACCESS_TOKEN } from '@castlery/config';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { needAuthenticated } from './shared-prepare-headers';
import { ExtraArgument } from '@castlery/shared-redux-extra';
import { logger } from '@castlery/observability';
import { X_CHANNEL } from '@castlery/config';

/**
 * search
 */
export const searchApi = createApi({
  /**
   * `reducerPath` is optional and will not be required by most users.
   * This is useful if you have multiple API definitions,
   * e.g. where each has a different domain, with no interaction between endpoints.
   * Otherwise, a single API definition should be used in order to support tag invalidation,
   * among other features
   */
  reducerPath: 'search-castlery',
  baseQuery: fetchBaseQuery({
    baseUrl: EcEnv.NEXT_PUBLIC_API_HOST,
    // eslint-disable-next-line
    prepareHeaders: (headers, { extra, endpoint }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      if (!headers.has(X_ACCESS_TOKEN) && needAuthenticated()) {
        try {
          const { persistenceHandles } = extra as ExtraArgument;
          const token = persistenceHandles?.accessToken?.getItem();
          if (token) {
            headers.set(X_ACCESS_TOKEN, `${token}`);
          }
        } catch (error) {
          logger.error('Failed to set access token in DY request header', { error });
        }
      }

      if (EcEnv.NEXT_PUBLIC_CHANNEL === 'POS') {
        try {
          if (!headers.has(X_CHANNEL)) {
            headers.set(X_CHANNEL, EcEnv.NEXT_PUBLIC_CHANNEL.toLocaleLowerCase());
          }
        } catch (error) {
          logger.error('Failed to set channel in DY request header', { error });
        }
      }

      return headers;
    },
  }),
  /**
   * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
   */
  // baseQuery: baseQueryWithReAuth,
  /**
   * Tag types must be defined in the original API definition
   * for any tags that would be provided by injected endpoints
   */
  // tagTypes: Object.values(tagTypes),
  /**
   * This api has endpoints injected in adjacent files,
   * which is why no endpoints are shown below.
   * If you want all endpoints defined in the same file, they could be included here instead
   */
  endpoints: () => ({}),
});
