import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/sentry-envelope';

// These tests require production build/runtime because Sentry SDK is disabled in dev.
//
// CRITICAL: build must use E2E_LOCAL_ASSETS=1 — without it, assetPrefix points to the CDN
// (static.castlery.sg) which is inaccessible locally. The main-app chunk (containing
// instrumentation-client / Sentry SDK) fails to load and every envelope assertion times out.
//
// CRITICAL: `NEXT_PUBLIC_SENTRY_DSN` and `NEXT_PUBLIC_APPLICATION_ENV` must be inlined at **build** time
// (Next replaces `process.env.NEXT_PUBLIC_*` in the client bundle). If your bundle has no DSN string,
// `instrumentation-client` exits early and **no envelope is ever sent** — tests will time out.
// Ensure `apps/web/.env.production` contains those vars (or CI `init-env` generated the file), then:
//   E2E_LOCAL_ASSETS=1 pnpm web:build
//   NODE_ENV=production npx next start apps/web -p 3000   # or standalone server from dist
//   PW_SKIP_WEBSERVER=1 BASE_URL=http://localhost:3000 pnpm exec playwright test --config=apps/web-e2e/playwright.config.ts --project=sentry-tags
//
// Public routes use /{region}/… only; locale/deviceTheme are resolved by middleware (cookies, Accept-Language, UA).
const REGION_PREFIX = '/sg';
const PDP_PATH = `${REGION_PREFIX}/products/owen-chaise-sectional-sofa`;
const ACCOUNT_PATH = `${REGION_PREFIX}/account`;
const E2E_LOGIN_EMAIL = process.env.E2E_LOGIN_EMAIL || '';
const E2E_LOGIN_PASSWORD = process.env.E2E_LOGIN_PASSWORD || '';

/** Full `load` can hang on third-party beacons; `domcontentloaded` is enough for HTML + script tags. */
const gotoOpts = { waitUntil: 'domcontentloaded' as const, timeout: 60_000 };

/** instrumentation-client (Sentry.init) ships in the main-app chunk; wait for it before asserting on envelopes. */
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

/**
 * beforeSend requires a parseable stack frame under `/_next/` (see client-before-send.ts).
 * Use a real chunk URL from the document so Sentry gets frames and does not drop the event pre-flight.
 */
async function triggerError(page: Page, marker: string) {
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
    ({ msg, path }) => {
      setTimeout(() => {
        const error = new Error(msg);
        const origin = window.location.origin;
        error.stack = `Error: ${msg}\n    at sentryTagTest (${origin}${path}:1:1)`;
        throw error;
      }, 0);
    },
    { msg: marker, path: chunkPath }
  );
  // Let the macrotask run before we await the envelope.
  await new Promise((r) => setTimeout(r, 500));
}

async function loginIfNeeded(page: Page) {
  const url = page.url();
  if (!url.includes('login') && !url.includes('auth')) {
    return;
  }

  if (!E2E_LOGIN_EMAIL || !E2E_LOGIN_PASSWORD) {
    throw new Error('Redirected to login, but E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD are not provided.');
  }

  const emailLoginEntry = page
    .locator(
      'button:has-text("Continue with Email"), button:has-text("Continue with email"), button:has-text("Email"), button:has-text("Email login"), button:has-text("Sign in with email"), a:has-text("Continue with Email"), a:has-text("Sign in with email")'
    )
    .first();
  if (await emailLoginEntry.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailLoginEntry.click();
  }

  const emailInput = page
    .locator(
      'input[type="email"], input[name="email"], input[autocomplete="email"], input[placeholder*="Email"], input[placeholder*="email"]'
    )
    .first();
  const passwordInput = page
    .locator(
      'input[type="password"], input[name="password"], input[autocomplete="current-password"], input[placeholder*="Password"], input[placeholder*="password"]'
    )
    .first();

  await emailInput.waitFor({ state: 'visible', timeout: 20_000 });
  await emailInput.click();
  await emailInput.fill(E2E_LOGIN_EMAIL);
  await passwordInput.click();
  await passwordInput.fill(E2E_LOGIN_PASSWORD);

  // Some login forms rerender after password input and may clear email value.
  const emailValueAfterFill = await emailInput.inputValue().catch(() => '');
  if (emailValueAfterFill.trim() !== E2E_LOGIN_EMAIL) {
    await emailInput.click();
    await emailInput.fill(E2E_LOGIN_EMAIL);
  }

  // Submit by form button first (more stable than Enter on some forms).
  const loginFormSubmit = passwordInput
    .locator('xpath=ancestor::form[1]')
    .locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("LOG IN"), button:has-text("Login")'
    )
    .first();

  const loginResponsePromise = page
    .waitForResponse(
      (resp) =>
        resp.request().method() === 'POST' &&
        (resp.url().includes('/oauth/token') || resp.url().includes('/login') || resp.url().includes('/auth')),
      { timeout: 15_000 }
    )
    .catch(() => null);

  if (await loginFormSubmit.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginFormSubmit.click({ timeout: 10_000 });
  } else {
    await passwordInput.press('Enter');
  }
  const loginResponse = await loginResponsePromise;

  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  await page
    .waitForURL((url) => !url.href.includes('login') && !url.href.includes('auth'), { timeout: 10_000 })
    .catch(() => undefined);

  if (page.url().includes('login') || page.url().includes('auth')) {
    const loginErrorText =
      (await page
        .locator(
          'text=/do not match|invalid|incorrect|wrong|failed|error|not match|unable to login|try again|email and password/i'
        )
        .first()
        .textContent()
        .catch(() => null)) ?? 'unknown';
    const loginStatus = loginResponse ? loginResponse.status() : 'no-login-response-captured';
    throw new Error(`Login did not exit auth page. status=${loginStatus}; errorText=${String(loginErrorText).trim()}`);
  }
}

test.describe('Sentry tag verification — core pages', () => {
  test.describe.configure({ timeout: 60_000 });

  test.use({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  test.beforeEach(async ({ sentry }) => {
    sentry.clear();
  });

  test('PDP: page_type=pdp, domain=product', async ({ page, sentry }) => {
    const response = await gotoWhenMainAppReady(page, PDP_PATH);
    if (response && response.status() === 404) {
      test.skip(true, 'Product slug not found — skip PDP tag test');
    }

    const marker = 'E2E_SENTRY_TAG_PDP';
    await triggerError(page, marker);
    const envelope = await sentry.waitForEnvelope({ messageIncludes: marker });

    expect(envelope.tags.page_type).toBe('pdp');
    expect(envelope.tags.domain).toBe('product');
    expect(envelope.tags.error_bucket).toBeDefined();
  });

  test('PLP/Search: page_type=plp, domain=search', async ({ page, sentry }) => {
    await gotoWhenMainAppReady(page, `${REGION_PREFIX}/search?q=sofa`);

    const marker = 'E2E_SENTRY_TAG_SEARCH';
    await triggerError(page, marker);
    const envelope = await sentry.waitForEnvelope({ messageIncludes: marker });

    expect(envelope.tags.page_type).toBe('plp');
    expect(envelope.tags.domain).toBe('search');
  });

  test('Home: page_type=home, domain=cms', async ({ page, sentry }) => {
    await gotoWhenMainAppReady(page, `${REGION_PREFIX}/home`);
    let envelope = null as Awaited<ReturnType<typeof sentry.waitForEnvelope>> | null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const marker = `E2E_SENTRY_TAG_HOME_${attempt}`;
      await triggerError(page, marker);
      envelope = await sentry.waitForEnvelope({ messageIncludes: marker });
      if (envelope.tags.page_type === 'home' && envelope.tags.domain === 'cms') {
        break;
      }
      await page.waitForTimeout(1200);
    }

    if (!envelope) {
      throw new Error('Home test failed to capture any Sentry envelope.');
    }

    expect(envelope.tags.page_type).toBe('home');
    expect(envelope.tags.domain).toBe('cms');
  });

  test('Account: page_type=account, domain=user', async ({ page, sentry }) => {
    await gotoWhenMainAppReady(page, ACCOUNT_PATH);

    // If redirected to login, sign in and navigate back to account.
    if (page.url().includes('login') || page.url().includes('auth')) {
      await loginIfNeeded(page);
      // loginIfNeeded waits for URL to leave auth — now go to account page.
      await gotoWhenMainAppReady(page, ACCOUNT_PATH);
    }

    await page.waitForURL((url) => url.href.includes(ACCOUNT_PATH), { timeout: 20_000 });

    const marker = 'E2E_SENTRY_TAG_ACCOUNT';
    await triggerError(page, marker);
    const envelope = await sentry.waitForEnvelope({ messageIncludes: marker });

    expect(envelope.tags.page_type).toBe('account');
    expect(envelope.tags.domain).toBe('user');
  });

  test.skip('Cart: page_type=cart, domain=cart', async ({ page, sentry }) => {
    await gotoWhenMainAppReady(page, `${REGION_PREFIX}/cart`);

    const marker = 'E2E_SENTRY_TAG_CART';
    await triggerError(page, marker);
    const envelope = await sentry.waitForEnvelope({ messageIncludes: marker });

    expect(envelope.tags.page_type).toBe('cart');
    expect(envelope.tags.domain).toBe('cart');
  });
});
