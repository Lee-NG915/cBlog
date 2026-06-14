'use strict';

const { RuleTester } = require('eslint');
const noBareSentryCapture = require('../rules/no-bare-sentry-capture');
const noSentryInEdge = require('../rules/no-sentry-in-edge');
const noDeprecatedPageTypeSearch = require('../rules/no-deprecated-page-type-search');
const noDoubleReporting = require('../rules/no-double-reporting');
const pageRequiresSentryContext = require('../rules/page-requires-sentry-context');
const layoutRequiresSentryProvider = require('../rules/layout-requires-sentry-provider');

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2022, ecmaFeatures: { jsx: true }, sourceType: 'module' },
});

// ── no-bare-sentry-capture ────────────────────────────────────────────────────
tester.run('no-bare-sentry-capture', noBareSentryCapture, {
  valid: [
    { code: `captureStructuredError(error, { domain: 'USER' })` },
    { code: `Sentry.init({ dsn: 'x' })` },
    {
      // withServerActionInstrumentation on throw path (catch re-throws) — correct
      code: `const action = withServerActionInstrumentation(async (args) => { try { await doWork() } catch(e) { throw e } }, {})`,
    },
    {
      // withServerActionInstrumentation with no try-catch — correct (throw path by default)
      code: `const action = withServerActionInstrumentation(async (args) => { await doWork() }, {})`,
    },
  ],
  invalid: [
    {
      code: `Sentry.captureException(error)`,
      errors: [{ messageId: 'noBareCapture' }],
    },
    {
      code: `try { risky() } catch(e) { Sentry.captureException(e) }`,
      errors: [{ messageId: 'noBareCapture' }],
    },
    {
      // withServerActionInstrumentation wrapping a degradation path (catch returns)
      code: `const action = withServerActionInstrumentation(async (args) => { try { await doWork() } catch(e) { captureStructuredError(e, {}); return {} } }, {})`,
      errors: [{ messageId: 'degradationPathMisuse' }],
    },
  ],
});

// ── no-sentry-in-edge (middleware filename) ───────────────────────────────────
tester.run('no-sentry-in-edge (middleware file)', noSentryInEdge, {
  valid: [
    {
      code: `logger.error('fail', { error })`,
      filename: '/app/middleware.ts',
    },
  ],
  invalid: [
    {
      code: `captureStructuredError(error, { domain: 'USER' })`,
      filename: '/app/middleware.ts',
      errors: [{ messageId: 'noSentryInEdge' }],
    },
    {
      code: `Sentry.captureException(error)`,
      filename: '/app/middleware.tsx',
      errors: [{ messageId: 'noSentryInEdge' }],
    },
    {
      code: `withServerActionInstrumentation('action', handler)`,
      filename: '/app/middleware.ts',
      errors: [{ messageId: 'noSentryInEdge' }],
    },
    {
      code: `withFetchSpan('fetch', handler)`,
      filename: '/app/middleware.ts',
      errors: [{ messageId: 'noSentryInEdge' }],
    },
  ],
});

// ── no-sentry-in-edge (edge runtime export) ───────────────────────────────────
tester.run('no-sentry-in-edge (edge runtime)', noSentryInEdge, {
  valid: [
    {
      code: `export const runtime = 'edge'; logger.error('fail')`,
      filename: '/app/route.ts',
    },
    {
      code: `export const runtime = 'nodejs'; captureStructuredError(e, {})`,
      filename: '/app/route.ts',
    },
  ],
  invalid: [
    {
      code: `export const runtime = 'edge'; captureStructuredError(error, {})`,
      filename: '/app/route.ts',
      errors: [{ messageId: 'noSentryInEdge' }],
    },
    {
      // Sentry.captureException in edge runtime
      code: `export const runtime = 'edge'; Sentry.captureException(error)`,
      filename: '/app/route.ts',
      errors: [{ messageId: 'noSentryInEdge' }],
    },
  ],
});

// ── no-deprecated-page-type-search ────────────────────────────────────────────
tester.run('no-deprecated-page-type-search', noDeprecatedPageTypeSearch, {
  valid: [{ code: `PAGE_TYPES.PLP` }, { code: `PAGE_TYPES.HOME` }],
  invalid: [
    {
      code: `setGlobalSentryContext({ pageType: PAGE_TYPES.SEARCH })`,
      errors: [{ messageId: 'deprecated' }],
    },
  ],
});

// ── no-double-reporting ───────────────────────────────────────────────────────
tester.run('no-double-reporting', noDoubleReporting, {
  valid: [
    { code: `try { f() } catch(e) { logger.error('fail', e) }` },
    { code: `try { f() } catch(e) { Sentry.captureException(e) }` },
    { code: `try { f() } catch(e) { captureStructuredError(e, {}) }` },
  ],
  invalid: [
    {
      // logger.error + Sentry.captureException
      code: `try { f() } catch(e) { logger.error('fail', e); Sentry.captureException(e) }`,
      errors: [{ messageId: 'doubleReporting' }],
    },
    {
      // logger.error + captureStructuredError (captureStructuredError already logs internally)
      code: `try { f() } catch(e) { logger.error('fail', e); captureStructuredError(e, { domain: 'USER' }) }`,
      errors: [{ messageId: 'doubleReporting' }],
    },
  ],
});

// ── page-requires-sentry-context ──────────────────────────────────────────────
tester.run('page-requires-sentry-context', pageRequiresSentryContext, {
  valid: [
    {
      // Server component with setGlobalSentryContext — correct
      code: `export default function Page() { setGlobalSentryContext({ pageType: PAGE_TYPES.HOME, domain: BUSINESS_DOMAIN.CMS }); return <div/> }`,
      filename: '/app/page.tsx',
    },
    {
      // Client component — rule should not apply (gets context from layout provider)
      code: `'use client'; export default function Page() { return <div/> }`,
      filename: '/app/page.tsx',
    },
    {
      // Not a page file — rule should not apply
      code: `export function helper() {}`,
      filename: '/app/helpers.ts',
    },
  ],
  invalid: [
    {
      // Server component missing setGlobalSentryContext — should warn
      code: `export default function Page() { return <div/> }`,
      filename: '/app/page.tsx',
      errors: [{ messageId: 'missingContext' }],
    },
  ],
});

// ── layout-requires-sentry-provider ───────────────────────────────────────────
tester.run('layout-requires-sentry-provider', layoutRequiresSentryProvider, {
  valid: [
    {
      code: `export default function Layout({ children }) { return <SentryContextProvider pageType="home"><main>{children}</main></SentryContextProvider> }`,
      filename: '/app/layout.tsx',
    },
    {
      // Not a layout file — rule should not apply
      code: `export function helper() {}`,
      filename: '/app/helpers.tsx',
    },
    {
      // async layout with setGlobalSentryContext before await (Rule #4 exception) + Provider — correct
      code: `export default async function Layout({ children }) { setGlobalSentryContext({ pageType: 'home' }); const data = await fetch('/api'); return <SentryContextProvider pageType="home"><main>{children}</main></SentryContextProvider> }`,
      filename: '/app/shop/layout.tsx',
    },
  ],
  invalid: [
    {
      code: `export default function Layout({ children }) { return <main>{children}</main> }`,
      filename: '/app/layout.tsx',
      errors: [{ messageId: 'missingProvider' }],
    },
    {
      // layout calls setGlobalSentryContext (async-layout pattern) but still missing Provider
      code: `export default async function Layout({ children }) { setGlobalSentryContext({ pageType: 'home' }); const data = await fetch('/api'); return <main>{children}</main> }`,
      filename: '/app/layout.tsx',
      errors: [{ messageId: 'missingProvider' }],
    },
  ],
});

// ── async-layout-early-context ────────────────────────────────────────────────
const asyncLayoutEarlyContext = require('../rules/async-layout-early-context');

tester.run('async-layout-early-context', asyncLayoutEarlyContext, {
  valid: [
    {
      // Async layout with setGlobalSentryContext before the first await — compliant
      code: `export default async function Layout({ children }) { setGlobalSentryContext({ pageType: 'home', domain: 'CMS' }); const data = await fetch('/api'); return <SentryContextProvider>{children}</SentryContextProvider>; }`,
      filename: '/app/layout.tsx',
    },
    {
      // Sync layout (no async keyword) — rule does not apply
      code: `export default function Layout({ children }) { const x = somePromise(); return <div>{children}</div>; }`,
      filename: '/app/layout.tsx',
    },
    {
      // Async layout with no await at all — rule does not apply
      code: `export default async function Layout({ children }) { return <SentryContextProvider>{children}</SentryContextProvider>; }`,
      filename: '/app/layout.tsx',
    },
    {
      // Async function in a non-layout file — filename does not match, rule does not apply
      code: `export default async function MyComponent() { const data = await fetch('/api'); return <div/> }`,
      filename: '/app/components/my-component.tsx',
    },
  ],
  invalid: [
    {
      // Async layout with await but no setGlobalSentryContext call at all
      code: `export default async function Layout({ children }) { const data = await fetch('/api'); return <SentryContextProvider>{children}</SentryContextProvider>; }`,
      filename: '/app/layout.tsx',
      errors: [{ messageId: 'missingEarlyContext' }],
    },
    {
      // Async layout where setGlobalSentryContext is called AFTER the first await
      code: `export default async function Layout({ children }) { const data = await fetch('/api'); setGlobalSentryContext({ pageType: 'home' }); return <SentryContextProvider>{children}</SentryContextProvider>; }`,
      filename: '/app/layout.tsx',
      errors: [{ messageId: 'missingEarlyContext' }],
    },
  ],
});

// ── no-hardcoded-skip-sentry ──────────────────────────────────────────────────
const noHardcodedSkipSentry = require('../rules/no-hardcoded-skip-sentry');

tester.run('no-hardcoded-skip-sentry', noHardcodedSkipSentry, {
  valid: [
    // predicate helpers — preferred pattern
    { code: `captureStructuredError(error, { domain: 'USER', skipSentry: isUserInputError(error) })` },
    { code: `captureStructuredError(error, { skipSentry: isExpectedBusinessError(error) })` },
    { code: `captureStructuredError(error, { skipSentry: isAuthError(error) })` },
    { code: `captureStructuredError(error, { skipSentry: shouldSkipSentry(error) })` },
    // named boolean constant — acceptable for unconditionally intentional silencing
    // (developer extracted it with an explanatory comment in their code)
    { code: `const skipFbEmailError = true; captureStructuredError(error, { skipSentry: skipFbEmailError })` },
    { code: `const alwaysSkip = true; captureStructuredError(error, { skipSentry: alwaysSkip })` },
    // expression — any non-literal is allowed (ternary, logical, etc.)
    { code: `captureStructuredError(error, { skipSentry: error.status === 422 })` },
    { code: `captureStructuredError(error, { skipSentry: isUserInputError(error) || isAuthError(error) })` },
    // false literal — not the problematic case
    { code: `captureStructuredError(error, { skipSentry: false })` },
    // unrelated property named true
    { code: `const obj = { enabled: true }` },
  ],
  invalid: [
    {
      code: `captureStructuredError(error, { domain: 'USER', skipSentry: true })`,
      errors: [{ messageId: 'noHardcodedSkipSentry' }],
    },
    {
      // nested inside another object
      code: `captureStructuredError(error, { extra: { foo: 'bar' }, skipSentry: true })`,
      errors: [{ messageId: 'noHardcodedSkipSentry' }],
    },
    {
      // string-keyed property
      code: `captureStructuredError(error, { 'skipSentry': true })`,
      errors: [{ messageId: 'noHardcodedSkipSentry' }],
    },
  ],
});

console.log('All observability ESLint rule tests passed ✓');
