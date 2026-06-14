/* Core */
// eslint-disable-next-line
import { api, searchApi, dyApi, apiV1, dyCollectApi } from '@castlery/shared-redux-services';
// import { rtkQueryErrorLogger } from '@castlery/shared-redux-core';
import { createLogger } from 'redux-logger';
import { EcEnv } from '@castlery/config';

const loggerMiddleware =
  EcEnv.NODE_ENV !== 'production'
    ? [
        createLogger({
          duration: true,
          timestamp: false,
          collapsed: true,
          colors: {
            title: () => '#139BFE',
            prevState: () => '#1C5FAF',
            action: () => '#149945',
            nextState: () => '#A47104',
            error: () => '#ff0005',
          },
          predicate: () => typeof window !== 'undefined',
        }),
      ]
    : [];

const middleware = [
  ...loggerMiddleware,
  api.middleware,
  apiV1.middleware,
  searchApi.middleware,
  dyApi.middleware,
  dyCollectApi.middleware,
  // rtkQueryErrorLogger,
];
export { middleware };
