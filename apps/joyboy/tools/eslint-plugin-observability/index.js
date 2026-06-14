'use strict';

const noBareSentryCapture = require('./rules/no-bare-sentry-capture');
const noSentryInEdge = require('./rules/no-sentry-in-edge');
const pageRequiresSentryContext = require('./rules/page-requires-sentry-context');
const layoutRequiresSentryProvider = require('./rules/layout-requires-sentry-provider');
const noDeprecatedPageTypeSearch = require('./rules/no-deprecated-page-type-search');
const noDoubleReporting = require('./rules/no-double-reporting');
const asyncLayoutEarlyContext = require('./rules/async-layout-early-context');
const noHardcodedSkipSentry = require('./rules/no-hardcoded-skip-sentry');

module.exports = {
  rules: {
    'no-bare-sentry-capture': noBareSentryCapture,
    'no-sentry-in-edge': noSentryInEdge,
    'page-requires-sentry-context': pageRequiresSentryContext,
    'layout-requires-sentry-provider': layoutRequiresSentryProvider,
    'no-deprecated-page-type-search': noDeprecatedPageTypeSearch,
    'no-double-reporting': noDoubleReporting,
    'async-layout-early-context': asyncLayoutEarlyContext,
    'no-hardcoded-skip-sentry': noHardcodedSkipSentry,
  },
  configs: {
    recommended: {
      plugins: ['observability'],
      rules: {
        'observability/no-bare-sentry-capture': 'warn',
        'observability/no-sentry-in-edge': 'error',
        'observability/no-deprecated-page-type-search': 'error',
        'observability/no-double-reporting': 'error',
        'observability/no-hardcoded-skip-sentry': 'warn',
        // page/layout rules applied via file-pattern overrides in .eslintrc
      },
    },
  },
};
