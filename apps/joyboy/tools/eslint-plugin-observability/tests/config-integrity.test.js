'use strict';

/**
 * Config integrity test — verifies that .eslintrc.json contains the required
 * checkout/payment/cart blocked-path override with all 4 Sentry API selectors.
 *
 * Purpose: prevents accidental removal of Hard Rule #9 enforcement.
 * Run: node tools/eslint-plugin-observability/tests/config-integrity.test.js
 */

const fs = require('fs');
const path = require('path');

const ESLINTRC_PATH = path.resolve(__dirname, '../../../apps/web/.eslintrc.json');

const BLOCKED_PATHS = [
  '**/checkout/**/*.ts',
  '**/checkout/**/*.tsx',
  '**/payment/**/*.ts',
  '**/payment/**/*.tsx',
  '**/cart/**/*.ts',
  '**/cart/**/*.tsx',
];

const REQUIRED_SELECTORS = [
  "CallExpression[callee.name='captureStructuredError']",
  "CallExpression[callee.name='withServerActionInstrumentation']",
  "CallExpression[callee.name='setGlobalSentryContext']",
  "CallExpression[callee.object.name='Sentry'][callee.property.name='captureException']",
];

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  [OK]   ${message}`);
  }
}

const raw = fs.readFileSync(ESLINTRC_PATH, 'utf8');
const config = JSON.parse(raw);

const blockedOverride = config.overrides?.find(
  (o) => Array.isArray(o.files) && BLOCKED_PATHS.every((p) => o.files.includes(p))
);

assert(!!blockedOverride, `checkout/payment/cart blocked-path override exists in apps/web/.eslintrc.json`);

if (blockedOverride) {
  const noRestrictedSyntax = blockedOverride.rules?.['no-restricted-syntax'];
  assert(
    Array.isArray(noRestrictedSyntax) && noRestrictedSyntax[0] === 'warn',
    `no-restricted-syntax is set to warn in blocked-path override`
  );

  const restrictedSelectors = Array.isArray(noRestrictedSyntax)
    ? noRestrictedSyntax.slice(1).map((entry) => entry.selector)
    : [];

  for (const selector of REQUIRED_SELECTORS) {
    assert(restrictedSelectors.includes(selector), `Blocked selector present: ${selector}`);
  }
}

if (process.exitCode !== 1) {
  console.log('\nAll config integrity checks passed ✓');
}
