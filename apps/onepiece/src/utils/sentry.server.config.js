import { sentryDSN } from 'config';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ignoreErrors } from './sentry';
/**
 * @typedef {import('@sentry/node')} NodeSentry
 */
let NodeSentry;

/**
 * @description: init node sentry
 * @param {NodeSentry} Sentry
 * @param {Object} { app }
 * @returns
 */
export const initNodeSentry = (Sentry, { app }) => {
  if (!sentryDSN || !__APP_ENV__) {
    return;
  }
  NodeSentry = Sentry;
  Sentry.init({
    dsn: sentryDSN,
    release: `${__APP_NAME__}@${__APP_ENV__}@${__APP_VERSION__}`,
    environment: __APP_ENV__,
    // debug: !__APP_ENV__?.includes('prod'),
    normalizeDepth: 3,
    integrations: [
      Sentry.extraErrorDataIntegration(),

      // Add our Profiling integration
      nodeProfilingIntegration(),
    ],
    ignoreErrors,
    tracesSampleRate: 0.001,
    maxBreadcrumbs: 50,
    maxValueLength: 1000,
  });
};
// FIXME 之前人写的 后续思考一下要怎么处理会更好
export const captureNodeException = (level = 'info', context = {}, title = 'Node Exception') => {
  if (!NodeSentry) {
    return;
  }
  NodeSentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setExtras(context);
    scope.setFingerprint([title]);
    NodeSentry.captureMessage(title, 'warning');
  });
};
