#!/usr/bin/env node
/**
 * Generates a temporary Playwright test that verifies Sentry tags on a specific page
 * after /alert-harness applies a fix. The generated file is placed in
 * apps/web-e2e/src/sentry/generated/ (gitignored) and picked up automatically by the
 * sentry-tags Playwright project. Delete the generated/ dir after verification.
 *
 * Usage:
 *   node scripts/e2e/sentry/generate-fix-test.mjs \
 *     --fixes '[{"url":"/sg/products/owen-chaise-sectional-sofa","pageType":"pdp","domain":"product","label":"pdp_layout_fix"}]' \
 *     [--output apps/web-e2e/src/sentry/generated/fix-verification.spec.ts]
 *
 * Each fix object:
 *   url                — page path WITHOUT the region/market prefix, taken from the Sentry issue's
 *                        `transaction` tag with the leading region segment stripped.
 *                        E.g. Sentry transaction "/sg/products/foo" → url "/products/foo".
 *                        The generated test prepends REGION_PREFIX (env var, default "/sg") at
 *                        runtime so the test works across markets without being rebuilt.
 *   fallbackUrl        — (optional) stable path (also WITHOUT region prefix) used when `url` returns
 *                        404 locally. If the Sentry transaction page doesn't exist in the local build
 *                        (e.g. a specific product slug), supply a stable equivalent:
 *                        "/search?q=sofa" for PLP context, "/home" for CMS, or
 *                        "/products/owen-chaise-sectional-sofa" for PDP.
 *                        The test tries `url` first; on 404 it retries with fallbackUrl.
 *   pageType           — expected page_type value (e.g. "pdp", "plp", "home", "sale", "cms")
 *   domain             — expected domain value (e.g. "product", "search", "promotion")
 *   label              — short identifier used in test name and marker (no spaces, alphanumeric + - _)
 *   errorBucket        — (optional) expected error_bucket value after fix (e.g. "third_party",
 *                        "js_fatal"). When provided, the test asserts the specific bucket instead of
 *                        just asserting it is defined. Use for message-pattern classification fixes
 *                        (THIRD_PARTY_PATTERNS additions, api_5xx, api_timeout). Do NOT use for
 *                        DOM exception / untraced-frame fixes — those cannot be reproduced via E2E.
 *   errorMessageSuffix — (optional) text appended to the synthetic error marker as ": <suffix>".
 *                        Embeds the issue's error pattern so classifyErrorBucket exercises the new
 *                        code path. E.g. "Failed to fetch (gladly.com)" or "Upstream API returned 502".
 *                        Only effective when the classification reads from the error message.
 *   errorConstructor   — (optional) "TypeError" | "Error" (default "Error"). Use "TypeError" when
 *                        the fix specifically targets js_fatal classification for TypeErrors.
 *
 * Cleanup:
 *   rm -rf apps/web-e2e/src/sentry/generated/
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    fixes: { type: 'string' },
    output: { type: 'string', default: 'apps/web-e2e/src/sentry/generated/fix-verification.spec.ts' },
  },
  allowPositionals: false,
});

if (!values.fixes) {
  console.error('[generate-fix-test] --fixes is required');
  process.exit(1);
}

let fixes;
try {
  fixes = JSON.parse(values.fixes);
} catch (e) {
  console.error('[generate-fix-test] --fixes must be valid JSON:', e.message);
  process.exit(1);
}

if (!Array.isArray(fixes) || fixes.length === 0) {
  console.error('[generate-fix-test] --fixes must be a non-empty array');
  process.exit(1);
}

const VALID_CONSTRUCTORS = new Set(['Error', 'TypeError']);

for (const fix of fixes) {
  if (!fix.url || !fix.pageType || !fix.domain || !fix.label) {
    console.error('[generate-fix-test] each fix must have: url, pageType, domain, label');
    process.exit(1);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(fix.label)) {
    console.error(`[generate-fix-test] label must match /^[a-zA-Z0-9_-]+$/: "${fix.label}"`);
    process.exit(1);
  }
  if (fix.fallbackUrl !== undefined && typeof fix.fallbackUrl !== 'string') {
    console.error(`[generate-fix-test] fallbackUrl must be a string: "${fix.label}"`);
    process.exit(1);
  }
  if (fix.errorBucket !== undefined && typeof fix.errorBucket !== 'string') {
    console.error(`[generate-fix-test] errorBucket must be a string: "${fix.label}"`);
    process.exit(1);
  }
  if (fix.errorMessageSuffix !== undefined && typeof fix.errorMessageSuffix !== 'string') {
    console.error(`[generate-fix-test] errorMessageSuffix must be a string: "${fix.label}"`);
    process.exit(1);
  }
  if (fix.errorConstructor !== undefined && !VALID_CONSTRUCTORS.has(fix.errorConstructor)) {
    console.error(`[generate-fix-test] errorConstructor must be "Error" or "TypeError": "${fix.label}"`);
    process.exit(1);
  }
  if (fix.errorName !== undefined && typeof fix.errorName !== 'string') {
    console.error(`[generate-fix-test] errorName must be a string: "${fix.label}"`);
    process.exit(1);
  }
}

/** Escape a value for safe interpolation into a single-quoted JS string literal. */
function escapeStr(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function generateTestContent(fixes) {
  const testBlocks = fixes
    .map(
      ({ url, fallbackUrl, pageType, domain, label, errorBucket, errorMessageSuffix, errorConstructor, errorName }) => {
        const safeUrl = escapeStr(url);
        const safeFallbackUrl = fallbackUrl ? escapeStr(fallbackUrl) : '';
        const safePageType = escapeStr(pageType);
        const safeDomain = escapeStr(domain);
        const safeErrorBucket = errorBucket ? escapeStr(errorBucket) : '';
        const safeErrorMessageSuffix = errorMessageSuffix ? escapeStr(errorMessageSuffix) : '';
        const safeErrorConstructor = escapeStr(errorConstructor || 'Error');
        const safeErrorName = errorName ? escapeStr(errorName) : '';
        const markerPrefix = `FIX_VERIFY_${label.toUpperCase()}_`;

        const testTitle = errorBucket
          ? `fix-verify: ${label} → page_type=${pageType}, domain=${domain}, error_bucket=${errorBucket}`
          : `fix-verify: ${label} → page_type=${pageType}, domain=${domain}`;

        // Navigation block: try primary url, fall back when 404.
        const navBlock = safeFallbackUrl
          ? `
    const regionPrefix = process.env.REGION_PREFIX || '/sg';
    let targetPath = regionPrefix + '${safeUrl}';
    let response = await page.goto(targetPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await mainAppLoaded;
    if (response && response.status() === 404) {
      // Primary URL not found locally — retry with fallback path.
      sentry.clear();
      const fallbackMainAppLoaded = page.waitForResponse(
        (r) => r.url().includes('/_next/static/chunks/') && r.url().includes('main-app') && r.status() === 200,
        { timeout: 60_000 }
      );
      targetPath = regionPrefix + '${safeFallbackUrl}';
      response = await page.goto(targetPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await fallbackMainAppLoaded;
    }
    if (response && response.status() === 404) {
      test.skip(true, \`Both primary ('${safeUrl}') and fallback ('${safeFallbackUrl}') returned 404.\`);
      return;
    }`
          : `
    const regionPrefix = process.env.REGION_PREFIX || '/sg';
    const targetPath = regionPrefix + '${safeUrl}';
    const response = await page.goto(targetPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await mainAppLoaded;
    if (response && response.status() === 404) {
      test.skip(true, \`Page not found (\${targetPath}) — add a fallbackUrl to avoid this skip.\`);
      return;
    }`;

        // Error message: append suffix so classifyErrorBucket exercises the fixed code path.
        const errorMessageLine = safeErrorMessageSuffix
          ? `const errorMessage = marker + ': ' + '${safeErrorMessageSuffix}';`
          : `const errorMessage = marker;`;

        // error_bucket assertion: specific value or toBeDefined.
        const bucketAssertion = safeErrorBucket
          ? `expect(envelope.tags.error_bucket, 'error_bucket tag').toBe('${safeErrorBucket}');`
          : `expect(envelope.tags.error_bucket, 'error_bucket tag').toBeDefined();`;

        return `
  test('${testTitle}', async ({ page, sentry }) => {
    sentry.clear();

    const mainAppLoaded = page.waitForResponse(
      (r) => r.url().includes('/_next/static/chunks/') && r.url().includes('main-app') && r.status() === 200,
      { timeout: 60_000 }
    );
${navBlock}

    // Allow React hydration and setGlobalSentryContext to run.
    await page.waitForTimeout(1500);

    const chunkPath = await page.evaluate(() => {
      const scripts = [...document.querySelectorAll('script[src*="/_next/static/chunks/"]')];
      const sameOrigin = scripts.find((s) => {
        try { return new URL(s.src, window.location.href).origin === window.location.origin; }
        catch { return false; }
      });
      const el = sameOrigin ?? scripts[0];
      if (!el?.src) return '/_next/static/chunks/main-app.js';
      try { return new URL(el.src, window.location.href).pathname; }
      catch { return '/_next/static/chunks/main-app.js'; }
    });

    const marker = '${markerPrefix}' + Date.now();
    ${errorMessageLine}
    await page.evaluate(({ msg, path, ctor, name }) => {
      setTimeout(() => {
        const error = ctor === 'TypeError' ? new TypeError(msg) : new Error(msg);
        if (name) error.name = name;
        const prefix = name || (ctor === 'TypeError' ? 'TypeError' : 'Error');
        error.stack = prefix + ': ' + msg + '\\n    at fixVerify (' + window.location.origin + path + ':1:1)';
        throw error;
      }, 0);
    }, { msg: errorMessage, path: chunkPath, ctor: '${safeErrorConstructor}', name: '${safeErrorName}' });

    await new Promise((r) => setTimeout(r, 500));

    const envelope = await sentry.waitForEnvelope({ messageIncludes: marker });

    expect(envelope.tags.page_type, 'page_type tag').toBe('${safePageType}');
    expect(envelope.tags.domain, 'domain tag').toBe('${safeDomain}');
    ${bucketAssertion}
  });`;
      }
    )
    .join('\n');

  return `/**
 * AUTO-GENERATED by scripts/e2e/sentry/generate-fix-test.mjs
 * Verifies Sentry tags on pages fixed by /alert-harness.
 * DELETE this file after verification: rm -rf apps/web-e2e/src/sentry/generated/
 *
 * Generated: ${new Date().toISOString()}
 */

import { test, expect } from '../fixtures/sentry-envelope';

test.describe('fix-verification — /alert-harness targeted tag checks', () => {
  test.describe.configure({ timeout: 90_000 });

  test.use({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
${testBlocks}
});
`;
}

const output = values.output;
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, generateTestContent(fixes), 'utf8');

console.log(`[generate-fix-test] generated ${output}`);
console.log(`[generate-fix-test] ${fixes.length} fix verification(s):`);
for (const { label, url, fallbackUrl, pageType, domain, errorBucket, errorMessageSuffix, errorConstructor, errorName } of fixes) {
  const extras = [
    fallbackUrl ? `fallback=${fallbackUrl}` : null,
    errorBucket ? `error_bucket=${errorBucket}` : null,
    errorMessageSuffix ? `suffix="${errorMessageSuffix}"` : null,
    errorName ? `errorName=${errorName}` : null,
    errorConstructor && errorConstructor !== 'Error' ? `ctor=${errorConstructor}` : null,
  ].filter(Boolean).join(', ');
  console.log(`  • ${label}: {REGION_PREFIX}${url} → page_type=${pageType}, domain=${domain}${extras ? ` [${extras}]` : ''}`);
}
console.log(`[generate-fix-test] cleanup after run: rm -rf apps/web-e2e/src/sentry/generated/`);
