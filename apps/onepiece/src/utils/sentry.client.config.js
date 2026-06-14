import * as Router from 'react-router';
import { isProd, sentryDSN } from 'config';
import { ignoreErrors } from './sentry';

/**
 * @typedef {import('@sentry/react')} ReactSentry
 */

let SentryUniversal;

/**
 *
 * @param {ReactSentry} Sentry
 * @param {Object} { routes }
 * @returns
 */
export const initClientSentry = (Sentry, { routes }) => {
  if (!sentryDSN || !__APP_ENV__) {
    return;
  }
  SentryUniversal = Sentry;
  Sentry.init({
    dsn: sentryDSN,
    // debug: !__APP_ENV__?.includes('prod'),
    release: `${__APP_NAME__}@${__APP_ENV__}@${__APP_VERSION__}`,
    environment: __APP_ENV__,
    integrations: [
      // See docs for support of different versions of variation of react router
      // https://docs.sentry.io/platforms/javascript/guides/react/features/react-router/#react-router-v3
      Sentry.reactRouterV3BrowserTracingIntegration({
        history: Router.browserHistory,
        // Must be Plain Routes.
        routes: Router.createRoutes(routes),
        match: Router.match,
      }),

      // FIXME 现在是自动的，但是实际上我们有很多报错，但是并不会影响用户，对这些错误进行录屏是没用的
      // 后期可以修改一下 调研一下用手动的方式 来录屏 https://docs.sentry.io/platforms/javascript/guides/react/session-replay/understanding-sessions/#manually-add-replay-integration
      // Sentry.replayIntegration({
      // https://docs.sentry.io/platforms/javascript/guides/react/session-replay/understanding-sessions/#ignore-certain-errors-for-error-sampling
      // beforeErrorSampling: (error) => error.message?.includes('drop me'),
      // }),
      // Sentry.extraErrorDataIntegration(),
      // Sentry.browserTracingIntegration({
      //   tracingOrigins: [__APIHOST__],
      // }),

      // Sentry.httpClientIntegration({
      //   failedRequestTargets: [__APIHOST__],
      // }),
      // sendDefaultPii: true,

      // https://sentry.io/answers/load-failed-javascript/#how-to-fix-load-failed-errors
      // Sentry.captureConsoleIntegration({
      //   levels: 'error',
      // }),

      Sentry.moduleMetadataIntegration(),

      // https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-thirdpartyerrorfilterintegration
      Sentry.thirdPartyErrorFilterIntegration({
        // Specify the application keys that you specified in the Sentry bundler plugin
        filterKeys: [__APP_NAME__],

        // Defines how to handle errors that contain third party stack frames.
        // Possible values are:
        // - 'drop-error-if-contains-third-party-frames'
        // - 'drop-error-if-exclusively-contains-third-party-frames'
        // - 'apply-tag-if-contains-third-party-frames'
        // - 'apply-tag-if-exclusively-contains-third-party-frames'
        behaviour: 'drop-error-if-contains-third-party-frames',
      }),
    ],

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.001,
    replaysOnErrorSampleRate: 0.01,
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/httpclient/#failedrequesttargets
    // This option is required for capturing headers and cookies.
    normalizeDepth: 3,

    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/sampling/#configuring-the-transaction-sample-rate
    // tracesSampleRate: 1.0,
    tracesSampler: ({ name, attributes, location }) => {
      // if (!__APP_ENV__?.includes('prod')) return 1;
      // https://develop.sentry.dev/sdk/telemetry/traces/span-operations/#browser
      if (attributes?.op === 'pageload') {
        return 0.001;
      }
      return 0;
    },

    // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
    tracePropagationTargets: ['localhost', new RegExp(`^${__APIHOST__}`)],

    ignoreErrors,
    denyUrls: [
      // https://x.clarity.ms/collect
      /clarity\.ms/i,

      // https://asia.creativecdn.com/tags/v2?type=json
      /creativecdn\.com/i,

      // https://ct.pinterest.com/v3/?tid=261244
      /pinterest\.com/i,

      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
      // Casa customer service SDK/runtime reports to its own Sentry project.
      /crxcase-cdn/i,
      /customer-service-sdk/i,
      /cx-sdk/i,
    ],
    // TODO 展示先只展示 castlery 的错误，未来可以考虑展示其他的
    allowUrls: [/castlery/i],
  });
};

export const captureException = (err, context) => {
  if (!SentryUniversal) {
    return;
  }
  if (err && err.errors && err.errors[0]) {
    SentryUniversal.withScope((scope) => {
      const error = err.errors[0];
      scope.setExtras({
        order_number: context.orderNumber,
        parameters: context.parameters,
        error: err,
      });
      scope.setFingerprint([error.title, error.code]);
      SentryUniversal.captureMessage(error.title);
    });
  }
};

/**
 * @description: capture error from source
 */
export const captureSourceError = (Sentry) => {
  document.body.addEventListener(
    'error',
    (event) => {
      if (!event.target) return;
      // only capture in prod
      if (event.target.tagName === 'IMG' && isProd) {
        if (event.target.src && event.target.src.match(/https:\/\/res\.cloudinary\.com\/castlery/)) {
          Sentry.captureMessage(`Failed to load image: ${event.target.src}`, 'warning');
        }
      } else if (event.target.tagName === 'LINK') {
        Sentry.captureMessage(`Failed to load css: ${event.target.href}`, 'warning');
      } else if (event.target.tagName === 'SCRIPT') {
        Sentry.captureMessage(`Failed to load script: ${event.target.src}`, 'warning');
      }
    },
    true // useCapture - necessary for resource loading errors
  );
};
