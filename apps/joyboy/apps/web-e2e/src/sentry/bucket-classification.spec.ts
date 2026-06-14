/**
 * Sentry bucket classification E2E tests.
 *
 * Suite 1 — Client bucket classification + drop + interactive journey
 *   Single test: navigates to PLP once, runs all three bucket assertions, then
 *   continues to PDP in the same page (no redundant goto).
 *   Server upstream test: hits the /api/e2e route directly.
 *
 * Suite 2 — Server upstream classification
 *   Requires: SENTRY_E2E_ENABLED=1 + SENTRY_SERVER_ENVELOPES_OUTPUT
 *   (set automatically by pnpm e2e:sentry-tags:server-capture).
 *
 * These tests require a production build + standalone server. See tag-verification.spec.ts
 * for setup instructions.
 */

import type { Page } from '@playwright/test';
import fs from 'node:fs';
import { test, expect } from './fixtures/sentry-envelope';

const REGION_PREFIX = '/sg';
const PLP_PATH = `${REGION_PREFIX}/search?q=sofa`;
const PDP_PATH = `${REGION_PREFIX}/products/owen-chaise-sectional-sofa`;
/** Full `load` can hang on third-party beacons; `domcontentloaded` is enough for HTML + script tags. */
const gotoOpts = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

async function gotoWhenMainAppReady(page: Page, path: string) {
  const mainAppLoaded = page.waitForResponse(
    (r) => r.url().includes('/_next/static/chunks/') && r.url().includes('main-app') && r.status() === 200,
    { timeout: 60_000 }
  );

  const response = await page.goto(path, gotoOpts);
  await mainAppLoaded;

  // Allow React to finish hydration and call setGlobalSentryContext before errors are triggered.
  await page.waitForTimeout(1500);

  return response;
}

/** Throws a typed error from a /_next/ frame so beforeSend passes it through. */
async function triggerTypedError(page: Page, errorConstructor: 'TypeError' | 'Error', message: string) {
  const chunkPath = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[src*="/_next/static/chunks/"]')] as HTMLScriptElement[];
    const sameOrigin = scripts.find((s) => {
      try {
        return new URL(s.src, window.location.href).origin === window.location.origin;
      } catch {
        return false;
      }
    });
    const el = sameOrigin ?? scripts[0];
    if (!el?.src) return '/_next/static/chunks/main-app.js';
    try {
      return new URL(el.src, window.location.href).pathname;
    } catch {
      return '/_next/static/chunks/main-app.js';
    }
  });

  await page.evaluate(
    ({ ctor, msg, path }) => {
      setTimeout(() => {
        const error = ctor === 'TypeError' ? new TypeError(msg) : new Error(msg);
        const origin = window.location.origin;
        error.stack = `${ctor}: ${msg}\n    at sentryBucketTest (${origin}${path}:1:1)`;
        throw error;
      }, 0);
    },
    { ctor: errorConstructor, msg: message, path: chunkPath }
  );
  await new Promise((r) => setTimeout(r, 500));
}

/**
 * Throws an error with ONLY a third-party CDN frame (no /_next/).
 * clientBeforeSend drops it: hasOwnCode=false → returns null → no HTTP POST.
 */
async function triggerThirdPartyOnlyError(page: Page, message: string) {
  await page.evaluate(
    ({ msg }) => {
      setTimeout(() => {
        const error = new Error(msg);
        error.stack = `Error: ${msg}\n    at <anonymous> (https://cdn.third-party-analytics.example.com/tracker.js:1:1)`;
        throw error;
      }, 0);
    },
    { msg: message }
  );
  await new Promise((r) => setTimeout(r, 500));
}

// ---------------------------------------------------------------------------
// Suite 1: Client classification + drop + interactive journey
// Single test — one PLP navigation, then continues to PDP without re-navigating.
// ---------------------------------------------------------------------------
test.describe('Sentry E2E — client classification & user journey', () => {
  test.describe.configure({ timeout: 120_000 });

  test.use({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  test.beforeEach(async ({ sentry }) => {
    sentry.clear();
  });

  // One test, one PLP goto — bucket classification → journey to PDP on the same page.
  test('PLP bucket classification (js_fatal / api_5xx / third-party drop) then journey to PDP', async ({
    page,
    sentry,
  }) => {
    // ── Phase 1: PLP ─────────────────────────────────────────────────────────
    await gotoWhenMainAppReady(page, PLP_PATH);

    // 1a: TypeError → js_fatal
    const jsFatalMarker = `E2E_BUCKET_JSFATAL_${Date.now()}`;
    await triggerTypedError(page, 'TypeError', jsFatalMarker);
    const jsFatalEnvelope = await sentry.waitForEnvelope({ messageIncludes: jsFatalMarker });
    expect(jsFatalEnvelope.tags.error_bucket).toBe('js_fatal');
    expect(jsFatalEnvelope.tags.bucket_confidence).toBe('medium');
    expect(jsFatalEnvelope.tags.page_type).toBe('plp');

    sentry.clear();

    // 1b: Error with 502 → api_5xx
    const api5xxMarker = `E2E_BUCKET_API5XX_${Date.now()}`;
    await triggerTypedError(page, 'Error', `Upstream API returned 502 — ${api5xxMarker}`);
    const api5xxEnvelope = await sentry.waitForEnvelope({ messageIncludes: api5xxMarker });
    expect(api5xxEnvelope.tags.error_bucket).toBe('api_5xx');
    expect(api5xxEnvelope.tags.bucket_confidence).toBe('high');
    expect(api5xxEnvelope.tags.page_type).toBe('plp');

    sentry.clear();

    // 1c: Pure third-party CDN error → dropped (no envelope)
    const thirdPartyMarker = `E2E_THIRD_PARTY_DROP_${Date.now()}`;
    await triggerThirdPartyOnlyError(page, thirdPartyMarker);
    await expect(sentry.waitForEnvelope({ timeout: 5_000, messageIncludes: thirdPartyMarker })).rejects.toThrow(
      'Timed out waiting for Sentry envelope'
    );

    sentry.clear();

    // 1d: Verify PLP context via journey marker (reuses current page — no extra goto)
    const plpMarker = `E2E_JOURNEY_PLP_${Date.now()}`;
    await triggerTypedError(page, 'Error', plpMarker);
    const plpEnvelope = await sentry.waitForEnvelope({ messageIncludes: plpMarker });
    expect(plpEnvelope.tags.page_type).toBe('plp');
    expect(plpEnvelope.tags.domain).toBe('search');

    sentry.clear();

    // ── Phase 2: PDP (journey — verify Sentry context updates on navigation) ──
    await gotoWhenMainAppReady(page, PDP_PATH);

    const pdpMarker = `E2E_JOURNEY_PDP_${Date.now()}`;
    await triggerTypedError(page, 'Error', pdpMarker);
    const pdpEnvelope = await sentry.waitForEnvelope({ messageIncludes: pdpMarker });
    expect(pdpEnvelope.tags.page_type).toBe('pdp');
    expect(pdpEnvelope.tags.domain).toBe('product');
    expect(pdpEnvelope.tags.error_bucket).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Server upstream classification (requires server capture mode)
// ---------------------------------------------------------------------------
test.describe('Sentry server upstream classification', () => {
  const SERVER_ENVELOPES_PATH = process.env.SENTRY_SERVER_ENVELOPES_OUTPUT || '';
  const E2E_ENABLED = !!process.env.SENTRY_E2E_ENABLED;

  test.describe.configure({ timeout: 30_000 });

  test('Server upstream 5xx error → error_bucket: upstream_5xx in server envelope', async ({ page }) => {
    if (!SERVER_ENVELOPES_PATH || !E2E_ENABLED) {
      test.skip(true, 'Server envelope capture not enabled — run via: pnpm e2e:sentry-tags:server-capture');
    }

    const marker = `E2E_SERVER_UPSTREAM_${Date.now()}`;

    const response = await page.goto(`/api/e2e/sentry-upstream-test?marker=${encodeURIComponent(marker)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
    expect(response?.status()).toBe(200);

    await page.waitForTimeout(1_000);

    const rawLines = fs.readFileSync(SERVER_ENVELOPES_PATH, 'utf8').split('\n').filter(Boolean);

    const matchingItems = rawLines.flatMap((line) => {
      let record: { envelope?: { items?: Array<{ header?: { type?: string }; payload?: Record<string, unknown> }> } };
      try {
        record = JSON.parse(line);
      } catch {
        return [];
      }
      const items = record?.envelope?.items ?? [];
      return items.filter((item) => {
        const payload = item?.payload;
        if (!payload || typeof payload !== 'object') return false;
        const msg =
          (payload['message'] as string | undefined) ??
          (payload['exception'] as { values?: Array<{ value?: string }> } | undefined)?.values?.[0]?.value ??
          '';
        return msg.includes(marker);
      });
    });

    expect(
      matchingItems.length,
      `Expected at least one server envelope item containing marker "${marker}"`
    ).toBeGreaterThan(0);

    const item = matchingItems[0];
    const tags = (item.payload as { tags?: Record<string, string> })?.tags ?? {};
    expect(tags['error_bucket']).toBe('upstream_5xx');
    expect(tags['bucket_confidence']).toBe('high');
  });
});
