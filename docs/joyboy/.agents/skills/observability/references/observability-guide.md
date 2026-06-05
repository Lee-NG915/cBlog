# @castlery/observability Usage Guide

Unified observability layer for the joyboy project: **Logger + Sentry** combination — one call logs and reports, routed through unified bucketing and tags into alerts and dashboards.

---

## 1. Overview & Capabilities

- **One line**: `@castlery/observability` provides unified error capture, structured messages, context management, error bucketing & filtering, and (server-side) tracing. All Sentry events reported through this package go through the pipeline: capture → bucket & tag → filter → downstream consumption (alerts, dashboards, error templates).
- **Core capabilities**:
  - **Unified error capture**: `captureStructuredError` and domain shortcuts (`capturePaymentError`, `captureOrderError`, `captureCartError`, `captureProductError`, `captureUserError`, `captureCheckoutError`) — logs and reports to Sentry simultaneously, with automatic context injection, PII filtering, and severity/priority inference.
  - **Structured messages**: `captureStructuredMessage` and domain shortcuts `sendPaymentMessage`, `sendOrderMessage`, `sendCartMessage`, `sendProductMessage`, `sendUserMessage`, `sendCheckoutMessage` (or `createDomainMessageCapture(domain)` for custom) — for **non-error** events that need Sentry tracking (business degradation, unexpected payment callback status, feature fallback, etc.); also logs and optionally reports, supports `severity`, `extra`, `skipSentry`.
  - **Context management**: `SentryContextProvider` (set once in Layout), `setGlobalSentryContext`, `withSentryContext` — ensures stable tag injection.
  - **Error bucketing & filtering**: `ERROR_BUCKET`, `classifyErrorBucket`, `shouldSendToSentry`, `filterPII`, `domainSpecificFilters` — supports alerts and dashboards.
  - **Server-side tracing**: `withServerActionInstrumentation`, `withFetchSpan`, `createTrackedGet`/`createTrackedPost` (use only from `@castlery/observability/server`).

---

## 2. Business / Technical Scenes

| Scene                             | Description                                                                   | Recommended API                                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payment/checkout failure          | Payment, checkout flow errors                                                 | `capturePaymentError`, `captureCheckoutError`                                                                                                                  |
| Order anomaly                     | Order creation, status update failures                                        | `captureOrderError`                                                                                                                                            |
| Add to cart / Cart                | Cart interface errors                                                         | `captureCartError`                                                                                                                                             |
| User/login                        | Login, registration, auth failures                                            | `captureUserError`                                                                                                                                             |
| Product/search                    | Product detail, search, CMS errors                                            | `captureProductError`                                                                                                                                          |
| General error needing reporting   | Not belonging to above domains                                                | `captureStructuredError` + explicit `domain`                                                                                                                   |
| Non-error, log only               | Business events, debug info                                                   | `logger.info/warn/debug`                                                                                                                                       |
| Non-error needing Sentry tracking | Business degradation, unexpected payment/order status, fallback notifications | `captureStructuredMessage` or `sendPaymentMessage` / `sendOrderMessage` / `sendCartMessage` / `sendProductMessage` / `sendUserMessage` / `sendCheckoutMessage` |
| Server-side tracing               | Server Action, server-side fetch                                              | `withServerActionInstrumentation`, `withFetchSpan` / `createTrackedGet` / `createTrackedPost`                                                                  |

- **Technical scenes**: Next.js App Router (RSC, Server Actions, Client Components, Middleware), API Routes, server-side fetch, frontend interactions and hydration errors.

---

## 3. Entry Points & Runtime Environments

| Entry   | Package Path                     | Applicable Scene                                                                                                                                                                               |
| ------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default | `@castlery/observability`        | Lightweight logger (console) + types + Sentry capabilities (no pino, no server-specific tracing)                                                                                               |
| client  | `@castlery/observability/client` | Client Components, browser logic; `'use client'` safe                                                                                                                                          |
| server  | `@castlery/observability/server` | RSC/Server Actions/API Routes/Middleware (logger); includes pino and server-side tracing. Note: `SentryContextProvider` is NOT exported from this entry — import it from `/client` or default. |

- **Middleware**: Use only logger and context capabilities — **do not** use server-side tracing (runtime environment limitation).

---

## 4. Logger + Sentry Combination in Next.js (Main Path)

**Recommended three steps (entry varies slightly by scene):**

1. **Set business context at the appropriate entry**

   - For traditional SSR/CSR pages, wrap `layout.tsx` with `SentryContextProvider`, passing `pageType` (required) and optionally `domain`, `priority`, `severity` to provide stable default context for the route.
   - For **Next.js RSC pages** (e.g. PDP and other key business pages), **call `setGlobalSentryContext` in the corresponding `page.tsx` to inject business context** — do not rely on layout:
     - Layout and page execute in parallel under RSC; context set in layout may not be available in some server-side logic;
     - Page-level injection ensures Server Actions, server-side fetches, and Redux listeners can reuse the same `pageType/domain/priority`.

2. **Call capture or domain API in business code**
   Call `captureStructuredError(error, { extra })` or `capturePaymentError(error, { extra })` directly in Server Actions, API routes, or Client event handlers — **one call logs and reports simultaneously**.

3. **Non-errors**
   Use `logger.info/warn/debug` or `captureStructuredMessage` / `sendXxxMessage`.

**Mount points per layer:**

- **Layout**: `SentryContextProvider` wraps `children`, sets `pageType` and other globally stable context (channel, device, etc.); suitable for static information that does not depend on RSC execution order.
- **RSC Page (page.tsx)**: Use `setGlobalSentryContext({ pageType, domain, priority, ... })` to inject context tightly coupled to the business page (PDP/Checkout/Order, etc.); this is the **authoritative entry** for business context under RSC.
- **Server Action**: Use `withServerActionInstrumentation(action, { actionName, sentryContext?, sensitiveFields? })`; handles errors and capture internally.
- **Client**: Directly call `captureStructuredError` or `captureXxxError`, `logger`/`cLog`; use `withSentryContext` for local context if needed.
- **API Route**: Use `@castlery/observability/server`'s `logger` + `captureStructuredError` in catch; can explicitly pass `domain`/`priority`.

**Tracing**: Node server only; Server Actions use `withServerActionInstrumentation` for span attachment; server-side fetch uses `withFetchSpan`/`createTrackedGet`/`createTrackedPost`; middleware does not support these tracing APIs.

**Breadcrumb**: Call `addBreadcrumb` at key steps to enrich the trace and help reconstruct the operation path in Sentry.

**Client logger output formats**: `cLog()` uses two modes depending on runtime:

- **Hydrated browser** (`initLogger()`): human-readable `[timestamp] [LEVEL] msg` format, enriched with `addClientContext` fields (`service`, `env`, `country`, `channel`, `version`).
- **SSR / pre-hydration fallback** (`getConsoleFallback()`): structured JSON `{"level","time","msg",...obj}` — server-log-compatible format, no extra context fields. This path runs when `window` is undefined (SSR, Middleware, or early boot).
  When debugging, expect JSON output in server-side logs and human-readable output in the browser console post-hydration.

> **⚠️ `'use client'` pitfall**: `client-logging.ts` intentionally does **NOT** have a `'use client'` directive. In Next.js RSC server bundle compilation, `'use client'` module exports are replaced with client references (non-callable proxy objects). If `client-logging.ts` had `'use client'`, any server-side code path that transitively calls `captureStructuredError` → `unified-logger` → `cLog()` would throw `TypeError: cLog is not a function`. The `isClient()` guard inside `cLog()` already handles server vs client behavior at runtime — no directive needed. **Never add `'use client'` to logger utility modules that are imported by server code paths.**

---

## 5. Tag & Bucket Conventions

- **Required tags** (aligned with Sentry Ownership rules): `domain`, `priority`, `error_bucket`.
- **Prohibited**: PII in tags or extra; use `filterPII` and `domainSpecificFilters` to ensure compliance.
- **Bucketing (ERROR_BUCKET)**: `hydration`, `third_party`, `api_5xx`, `api_timeout`, `js_fatal`, `unclassified`; computed by `classifyErrorBucket` in `beforeSend` and written into tags. Priority order: `hydration → third_party → api_5xx → api_timeout → js_fatal → unclassified` — third_party is checked **before** api_5xx/api_timeout to prevent DynamicYield/third-party 5xx from polluting api_5xx. The actual tag-writing location and order for the Web client is described in **§7 Project-Level error_bucket Implementation**.
- **Severity vs bucket**: `api_5xx`/`js_fatal` → error/fatal; `third_party`/`hydration` → warning; domain + priority handles business priority.

---

### Domain Priority & Sentry Level Mapping

From `libs/shared/observability/src/lib/sentry/contexts/priorities.ts`:

| domain    | priority | severity (Sentry level) | Notes                               |
| --------- | -------- | ----------------------- | ----------------------------------- |
| payment   | high     | fatal                   | Core business                       |
| checkout  | high     | fatal                   | Core business                       |
| user      | high     | fatal                   | Login/register — affects conversion |
| order     | high     | error                   | Post-purchase experience            |
| cart      | medium   | warning                 | Conversion funnel                   |
| product   | medium   | warning                 | PDP/PLP covered by Sev-1 alert      |
| search    | medium   | warning                 |                                     |
| promotion | medium   | warning                 |                                     |
| wishlist  | low      | warning                 |                                     |
| cms       | low      | warning                 |                                     |

These map to Sentry levels: `fatal` → level:fatal, `error` → level:error, `warning` → level:warning. Alert rules using `level:fatal` / `level:error` rely on this mapping.

---

## 6. Alerts, Dashboards & Error Templates

- **Alerts**: Configure rules by `error_bucket` + `priority`; specify which buckets require critical/high alerts and which can be downgraded to warning or dashboard-only.
- **Dashboards**: Build by bucket / domain / severity dimensions; consistent with Tag conventions.
- **Error templates**: Sentry error template parameters include `error_bucket`, `bucket_confidence`, `domain`, `priority`, `severity`, and business context fields (e.g. `orderId`, `productId`); some are auto-injected by the SDK, others must be passed in `extra` by business code.

---

## 7. Project-Level error_bucket Implementation (Web Client)

This document covers not only `@castlery/observability` **package capabilities** but also how the joyboy **project layer** writes `error_bucket` to Sentry events, completing the "package capabilities + project monitoring implementation pattern" loop. Sentry experts and integrators can use this to understand when tags are written and the dependency relationship of alerts/dashboards.

- **Package vs project responsibilities**: The package provides the semantics and classification logic for `classifyErrorBucket`, `ERROR_BUCKET`, and `bucket_confidence`; the **project layer** applies this in the Web client's single entry point — `apps/web/instrumentation-client.ts` `beforeSend` — writing tags **first**, then running filters for all events reported via the Sentry client.
- **Release name format**: `joyboy-web@${appEnv}@${appVersion}@${gitHash}` (e.g. `joyboy-web@sg-prod@1.2.3@abc1234`). In Sentry release filter, use `release:joyboy-web@<appEnv>@<version>@<gitHash>` — four `@`-separated segments. `appEnv` values follow `{region}-{stage}` pattern: `sg-prod`, `us-prod`, `au-prod`, `ca-prod`, `uk-prod`, `sg-test`, `us-test`, `au-test`, `ca-test`, `uk-test`, `sg-uat`, `us-uat`, etc. To filter all prod regions, use `release:joyboy-web@*-prod@*` (Sentry supports `*` wildcards).
- **Implementation order (must not be reversed)**: At the start of `beforeSend`, extract `message`, `exception`, `frames`, `statusCode` (from `event.contexts?.response?.status_code` or `event.extra?.response?.status`) from `event`/`hint`, call `classifyErrorBucket({ message, errorName, frames, statusCode })`, then **immediately** write the resulting `error_bucket` and `bucket_confidence` into `event.tags`; **then** run ~21 filter rules (numbered 0–18, with 4.5 and 17a as unnumbered variants) that can drop events (return `null`): Klaviyo stack overflow, no-stack, WebView bridge unload, offline/mulberry network errors, non-critical third-party scripts, widget-assets, third-party stack traces, mobile app noise, **AbortError** (dropped by rule #7 — see note below), third-party timeouts, null/undefined/property errors without own code, CORS, specific patterns, ATS, api_static, HeadlessChrome, webkit.messageHandlers, Android JavascriptInterface, mobile browser webkit/stack-overflow.
- **AbortError & api_timeout**: `classifyErrorBucket` classifies `AbortError` as `api_timeout`. `beforeSend` rule #7 attempts to drop AbortError events, but filtering behavior may vary depending on error message content and how the error surfaces. `api_timeout` events in Sentry may include both AbortError-based and other timeout-message-based errors (e.g. `"timed out"`, `"ETIMEDOUT"`).
- **Data flow**: All client-side reports (including business calls to `captureStructuredError`, Redux listener captures) go through the **Sentry client SDK → single `beforeSend`**. Business code only needs to provide context and `extra` (e.g. `domain`, `orderId`, `statusCode`); **there is no need — and it is wrong — to implement a separate bucketing logic in business code or listeners**. The authoritative bucketing implementation is in `instrumentation-client.ts` alone.
- **Alerts & dashboards**: Tiered alerts can use `error_bucket` rules (e.g. `api_5xx`, `js_fatal` as critical/high); dashboards and error templates can rely on the presence and consistency of `error_bucket` and `bucket_confidence` on reported events. When modifying bucketing rules or `beforeSend` order, update this document and the skill synchronously to avoid inconsistency with alert/dashboard assumptions.

---

## 8. Noise Control & Compliance

- **Whether to report**: `shouldSendToSentry()`, `skipSentry` option, and `domainSpecificFilters` (e.g. `isUserInputError`, `isExpectedBusinessError`, `isAuthError`, `isUserPaymentError`, `shouldSkipSentry`).
  - **`isUserInputError` precision**: For HTTP 400, returns `true` **only when the error message matches one of four regex-based categories**. For HTTP 422, always returns `true` (validation failure). **Do not assume all 400s are silently skipped** — unrecognized 400 messages are still reported to Sentry as potential bugs.
    - **Credential errors**: `(incorrect|invalid|wrong|bad)` + `(password|username|credentials)` in any order — covers `"Incorrect username or password"`, `"Invalid credentials"`, etc.
    - **Account existence errors**: `already taken/exists/registered`, `email not found`, `user not found`, `account not found`, etc.
    - **Format errors**: `invalid email`, `password is too short`, `does not match`, `unconfirmed email`, etc.
    - **Token errors**: `token is invalid`, `token has expired`, `reset token`
    - **Adding new cases**: extend the relevant regex in `isUserInputError` (`error-utils.ts`). Do not add one-off strings — group into the appropriate category regex.
- **PII**: `filterPII` recursively sanitizes `extra` and similar fields before reporting using **exact field name matching** (case-insensitive), not regex patterns. This avoids false positives — fields like `isEmailVerified`, `hasEmail`, and `mobileTheme` are not filtered. Only fields in the explicit allowlist (e.g. `email`, `password`, `token`, `phone`) are redacted as `[Filtered]` or `[PII Filtered]`.

---

## 9. Implementation Examples (By Scene)

### Layout — Mount SentryContextProvider (Server)

```tsx
// app/[deviceTheme]/[region]/[locale]/(PLP)/layout.tsx
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function PLPLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.PRODUCT}>
      {children}
    </SentryContextProvider>
  );
}
```

_After this layer is set, all captures under this route carry `page_type` and other tags._

### RSC Page — Inject Context (Server)

```tsx
// app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function ProductPage(props: any) {
  setGlobalSentryContext({
    pageType: PAGE_TYPES.PDP,
    domain: BUSINESS_DOMAIN.PRODUCT,
  });

  // Server Actions / data fetching / RSC logic below inherit the above context
  return /* JSX */;
}
```

_In RSC mode, inject business context in `page.tsx`; layout only holds the UI shell and globally static information._

### Server Action (Server)

```ts
// actions/cart.ts — mandatory pattern for all Server Actions
import { withServerActionInstrumentation, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const addToCartAction = withServerActionInstrumentation(
  async (productId: string, quantity: number) => {
    return await addToCart(productId, quantity);
  },
  {
    actionName: 'addToCartAction',
    sentryContext: {
      domain: BUSINESS_DOMAIN.CART,
    },
  }
);

// Login example with higher severity
export const loginAction = withServerActionInstrumentation(
  async (formData: FormData) => {
    const email = formData.get('email') as string;
    return await loginHandler(email, formData.get('password') as string);
  },
  {
    actionName: 'loginAction',
    sentryContext: {
      domain: BUSINESS_DOMAIN.USER,
      severity: 'fatal',
    },
  }
);
```

_`withServerActionInstrumentation` is **required** for all Server Actions — do not write bare try/catch Server Actions. Old action files without this wrapper are legacy awaiting migration. Sentry carries `error_bucket`, `domain`, `priority`, etc._

### Client Component (Client)

```tsx
'use client';
import { captureStructuredError, addBreadcrumb } from '@castlery/observability/client';

function AddToCartButton({ sku }: { sku: string }) {
  const handleClick = async () => {
    addBreadcrumb({ message: 'Add to cart clicked', data: { sku } });
    try {
      await addToCart(sku);
    } catch (error) {
      captureStructuredError(error, { extra: { sku } });
    }
  };
  return <button onClick={handleClick}>Add to cart</button>;
}
```

_Sentry carries `domain` (from context), `error_bucket` (computed by classifyErrorBucket), etc._

### API Route (Server)

```ts
// app/api/orders/route.ts
import { logger, captureOrderError } from '@castlery/observability/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ...
  } catch (error) {
    logger.error('Order API failed', { error });
    captureOrderError(error, { extra: { path: req.url } });
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

_Sentry carries `domain: order`, `error_bucket`, `priority`, etc._

### Structured Messages (Non-Error Events)

When **non-exception** important events need to be sent to Sentry (for trend analysis and alerts), use `captureStructuredMessage` or domain shortcuts `sendXxxMessage` — do not use `captureStructuredError`.

```ts
import { sendOrderMessage, sendPaymentMessage } from '@castlery/observability/server';

sendOrderMessage('Order status transition: confirmed -> shipped', {
  severity: 'info',
  extra: { orderId: '123', previousStatus: 'confirmed' },
});

sendPaymentMessage('Payment callback received unexpected status: pending', {
  severity: 'warning',
  extra: { orderId: '123', callbackStatus: 'pending' },
});
```

_Shares the same context (domain, priority, severity) and PII filtering as error capture; not reported in dev by default, controllable via `skipSentry`._

### Redux Toolkit Listener (Client)

```ts
// libs/modules/order/services/src/order.listener.ts (example)
import { captureStructuredError, isExpectedBusinessError, addBreadcrumb, logger } from '@castlery/observability/client';

startListening({
  matcher: mergeOrderErrorEvent,
  effect: async (action, { extra }) => {
    const error: any = action.payload;

    addBreadcrumb({
      message: 'Merge order failed',
      data: { orderNumber: action.payload?.number },
    });

    captureStructuredError(error || new Error('Merge order failed'), {
      skipSentry: isExpectedBusinessError(error),
      extra: {
        feature: 'order',
        event: 'merge_order_failed',
      },
    });
  },
});
```

_Redux listeners run in the browser only; always use `@castlery/observability/client` and reuse `domain/pageType/orderId` context from `page.tsx` or the global slice to ensure full consistency with page/Server Action `error_bucket/domain/priority`._

---

## 10. Advanced & References

- **Log before capture**: `captureStructuredError` internally logs first, then conditionally reports; for advanced scenarios, read the `error-utils` and `beforeSend` logic.
- **Custom domain**: For errors use `createDomainErrorCapture(BUSINESS_DOMAIN.XXX)`, for messages use `createDomainMessageCapture(BUSINESS_DOMAIN.XXX)` to extend domain shortcuts.
- **Documentation**: See repo's `docs/observability/` (e.g. error-handling-flow, sentry-ownership-rules-setup) and Sentry project configuration and error template docs.

---

_Complete usage documentation is kept inside the observability skill to unify the integration approach and the alert/dashboard/error template contract._
