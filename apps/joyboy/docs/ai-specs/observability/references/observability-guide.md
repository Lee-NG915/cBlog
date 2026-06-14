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
   - For **Next.js RSC pages**, **call `setGlobalSentryContext` in `page.tsx` independently** — do not rely on layout alone:
     - Layout and page RSCs execute in independent async contexts under React concurrent rendering; the execution order is not guaranteed — the page may start before layout completes its synchronous code;
     - `setGlobalSentryContext` writes tags to `getIsolationScope()` (per-request, shared via AsyncLocalStorage across all RSCs in the same HTTP request), not `getCurrentScope()` (per-async-context, isolated). This means once page.tsx calls it, all subsequent captures (Server Actions, fetches, listeners) in the same request will inherit the correct tags;
     - Page-level injection is the **authoritative entry** for business context — it ensures `pageType/domain/priority` are set regardless of layout execution timing.
   - **Async layout exception**: If a layout has `await` operations that can throw a 500 (e.g. calling a CMS/API before returning JSX), add `setGlobalSentryContext` at the top of that layout function, **before** the `await`. This ensures that if the async operation fails, the error captured has the correct tags. Example: `(shop-the-look)/shop-the-look/layout.tsx`. Pure JSX synchronous layouts do not need this.
   - **Layout error handling note**: Layout errors bubble to the **parent** segment's `error.tsx` (not the same-level one), because the same-level `error.tsx` is a child of the layout itself. If a layout throws, `setGlobalSentryContext` called in its function body before the throw will still have written tags to isolation scope, so Sentry will capture with context.

2. **Call capture or domain API in business code**
   Call `captureStructuredError(error, { extra })` or `capturePaymentError(error, { extra })` directly in Server Actions, API routes, or Client event handlers — **one call logs and reports simultaneously**.

3. **Non-errors**
   Use `logger.info/warn/debug` or `captureStructuredMessage` / `sendXxxMessage`.

**Mount points per layer:**

- **Layout**: `SentryContextProvider` wraps `children`, sets `pageType` and globally stable context (channel, device, etc.). On SSR, `SentryContextProvider` calls `setGlobalSentryContext` synchronously in its render body — but since layout and page RSC execution order is not guaranteed, **page.tsx must still call `setGlobalSentryContext` independently**. Async layouts with real 500-prone `await` operations should also call `setGlobalSentryContext` at the top of the function body, before the first `await`.
- **RSC Page (page.tsx)**: Use `setGlobalSentryContext({ pageType, domain, priority, ... })` at the top of the page function. This is the **authoritative entry** for business context under RSC — required regardless of whether a parent layout has `SentryContextProvider`.
- **Server Action**: Use `withServerActionInstrumentation(action, { actionName, monitoringContext?, recordSuccess?, context? })`; handles errors and capture internally. For actions requiring graceful degradation (return `{}` instead of throw), use `captureStructuredError` in catch.
- **Client**: Directly call `captureStructuredError` or `captureXxxError`, `logger`/`cLog`; use `withSentryContext` for local context if needed.
- **API Route**: Use `@castlery/observability/server`'s `logger` + `captureStructuredError` in catch; can explicitly pass `domain`/`priority`.

**`withSentryContext` scope behavior**: `withSentryContext` uses `withScope` (not `withIsolationScope`). `withScope` forks the current scope — tags set inside the callback apply only to explicit captures within that scope and take precedence over isolation scope tags (current scope > isolation scope > global scope). This means callers can still override tags set by `setGlobalSentryContext`. **Do not change to `withIsolationScope`** — the Sentry SDK docs explicitly warn that `withIsolationScope` does not fork in environments without async context strategy (e.g., browser), which would cause unexpected cross-request tag pollution. Since `withSentryContext` is client/server universal, `withScope` is the safe choice.

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
- **Bucketing (ERROR_BUCKET)**: Two sets of buckets exist — client-side and server-side:
  - **Client buckets** (`classifyErrorBucket`): `hydration`, `third_party`, `api_5xx`, `api_timeout`, `js_fatal`, `app_error`, `unclassified`. Priority order: `hydration → third_party → api_5xx → api_timeout → js_fatal → app_error → unclassified` — third_party is checked **before** api_5xx/api_timeout to prevent DynamicYield/third-party 5xx from polluting api_5xx. `app_error` catches explicitly-captured errors (`mechanism.handled=true + type=generic`).
  - **Server buckets** (`classifyErrorBucketServer`): `upstream_5xx`, `upstream_timeout`, `js_fatal`, `app_error`, `unclassified`. Skips hydration/third_party (browser-only); 5xx → `upstream_5xx` (semantics: our server called an upstream API and got 5xx); timeout/AbortError → `upstream_timeout`. `app_error` covers server-side graceful degradation paths that explicitly call `captureStructuredError`.
  - The actual tag-writing location is described in **§7 (client)** and **§8 (server)**.
- **Severity vs bucket**: `api_5xx`/`upstream_5xx`/`js_fatal` → error/fatal; `third_party`/`hydration` → warning; `upstream_timeout`/`api_timeout` → error; domain + priority handles business priority.

---

### Domain Priority & Sentry Level Mapping

From `libs/shared/observability/src/lib/sentry/contexts/priorities.ts`:

| domain    | priority | severity (Sentry level) | Notes                                                                    |
| --------- | -------- | ----------------------- | ------------------------------------------------------------------------ |
| payment   | high     | fatal                   | Core business                                                            |
| checkout  | high     | fatal                   | Core business                                                            |
| user      | high     | fatal                   | Login/register — affects conversion; covered by Sev-2 Account/User Alert |
| order     | high     | error                   | Post-purchase experience; covered by Sev-2 Order Alert                   |
| cart      | medium   | warning                 | Conversion funnel; covered by Sev-1 CART Alert                           |
| product   | medium   | warning                 | PDP/PLP covered by Sev-1 alert                                           |
| search    | medium   | warning                 | `/search` 页使用 `page_type:plp`（`domain:search`），纳入 Sev-1 PLP 告警 |
| promotion | medium   | warning                 | 当前无页面使用此 domain，暂无专属告警                                    |
| cms       | low      | log                     | blog/help-center 等低优先级内容，无告警（可接受）                        |

These map to Sentry levels: `fatal` → level:fatal, `error` → level:error, `warning` → level:warning. Alert rules using `level:fatal` / `level:error` rely on this mapping.

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

- **Alerts**: Configure rules by `error_bucket` + `priority`; specify which buckets require critical/high alerts and which can be downgraded to warning or dashboard-only. Current configured rules in Sentry (joyboy-web project):

  | 告警名                          | 条件                                                                                                                                                                                                                                      | 阈值                   | 备注                                                             |
  | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------- |
  | [Sev-1] PDP Issues              | `page_type:pdp !error_bucket:third_party !error_bucket:unclassified`                                                                                                                                                                      | new issue OR >20/5min  |                                                                  |
  | [Sev-1] PLP Issues              | `page_type:plp !error_bucket:third_party !error_bucket:unclassified`                                                                                                                                                                      | new issue OR >20/5min  | 含 `/search`（`domain:search`，2026-03-18 纳入）                 |
  | [Sev-1] CART Alert              | `page_type:cart !error_bucket:third_party !error_bucket:unclassified`                                                                                                                                                                     | new issue OR >20/5min  |                                                                  |
  | [Sev-2] Account/User Alert      | `domain:user !page_type:pdp !page_type:plp !page_type:cart !error_bucket:third_party !error_bucket:unclassified`                                                                                                                          | new issue OR >20/15min | domain 优先级高于 bucket，user 的 api_5xx 也走此规则             |
  | [Sev-2] Order Alert             | `domain:order !page_type:pdp !page_type:plp !page_type:cart !error_bucket:third_party !error_bucket:unclassified`                                                                                                                         | new issue OR >20/15min |                                                                  |
  | [Sev-2] API Errors              | `error_bucket:[api_5xx,api_timeout] !bucket_confidence:low !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order`                                                                                                      | new issue OR >20/15min | 合并 api_5xx + api_timeout                                       |
  | [Sev-2] Upstream Errors         | `error_bucket:[upstream_5xx,upstream_timeout] !bucket_confidence:low !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order`                                                                                            | new issue OR >20/15min | 合并 upstream_5xx + upstream_timeout                             |
  | [Sev-3] Fatal/Error Level       | `level:[fatal,error] !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order !error_bucket:api_5xx !error_bucket:api_timeout !error_bucket:upstream_5xx !error_bucket:upstream_timeout !error_bucket:unclassified`       | new issue OR >30/15min | 漏网的 fatal/error，排除所有上层                                 |
  | [Sev-4] Warning/Log Level Alert | `!level:fatal !level:error !error_bucket:unclassified !page_type:pdp !page_type:plp !page_type:cart !domain:user !domain:order !error_bucket:api_5xx !error_bucket:api_timeout !error_bucket:upstream_5xx !error_bucket:upstream_timeout` | new issue ONLY         | `!level:fatal !level:error` 负向兜底，非 fatal/error 全覆盖      |
  | [Sev-4] Unclassified New Issue  | `error_bucket:unclassified`                                                                                                                                                                                                               | new issue ONLY         | `error_bucket` 的一个 value，与 api_5xx 等完全平级，分类盲区专用 |

- **Dashboards**: Build by bucket / domain / severity dimensions; consistent with Tag conventions.
- **Error templates**: Sentry error template parameters include `error_bucket`, `bucket_confidence`, `domain`, `priority`, `severity`, and business context fields (e.g. `orderId`, `productId`); some are auto-injected by the SDK, others must be passed in `extra` by business code.

---

## 7. Project-Level error_bucket Implementation (Web Client — Browser)

> Authoritative source: `docs/ai-specs/observability/package-architecture.md` § 7.
> This section is not duplicated here — see the spec for implementation details, data flow, and alert/dashboard dependencies.

---

## 8. Project-Level error_bucket Implementation (Web Server — Node.js)

> Authoritative source: `docs/ai-specs/observability/package-architecture.md` § 8.
> This section is not duplicated here — see the spec for implementation details, data flow, and alert/dashboard dependencies.

---

## 9. Noise Control & Compliance

- **Whether to report**: `shouldSendToSentry()`, `skipSentry` option, and `domainSpecificFilters` (e.g. `isUserInputError`, `isExpectedBusinessError`, `isAuthError`, `isUserPaymentError`, `shouldSkipSentry`).
  - **`isUserInputError` precision**: For HTTP 400, returns `true` **only when the error message matches one of four regex-based categories**. For HTTP 422, always returns `true` (validation failure). **Do not assume all 400s are silently skipped** — unrecognized 400 messages are still reported to Sentry as potential bugs.
    - **Credential errors**: `(incorrect|invalid|wrong|bad)` + `(password|username|credentials)` in any order — covers `"Incorrect username or password"`, `"Invalid credentials"`, etc.
    - **Account existence errors**: `already taken/exists/registered`, `email not found`, `user not found`, `account not found`, etc.
    - **Format errors**: `invalid email`, `password is too short`, `does not match`, `unconfirmed email`, etc.
    - **Token errors**: `token is invalid`, `token has expired`, `reset token`
    - **Adding new cases**: extend the relevant regex in `isUserInputError` (`error-utils.ts`). Do not add one-off strings — group into the appropriate category regex.
- **PII**: `filterPII` recursively sanitizes `extra` and similar fields before reporting using **exact field name matching** (case-insensitive), not regex patterns. This avoids false positives — fields like `isEmailVerified`, `hasEmail`, and `mobileTheme` are not filtered. Only fields in the explicit allowlist (e.g. `email`, `password`, `token`, `phone`) are redacted as `[Filtered]` or `[PII Filtered]`.

---

## 10. Implementation Examples (By Scene)

### Layout — Mount SentryContextProvider (Server)

```tsx
// app/[deviceTheme]/[region]/[locale]/(PLP)/layout.tsx
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function PLPLayout({ children }: { children: React.ReactNode }) {
  // NOTE: Do NOT add setGlobalSentryContext here for synchronous layouts.
  // SentryContextProvider calls it internally in its render body, but page.tsx
  // must still call it independently (RSC execution order is not guaranteed).
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.PRODUCT}>
      {children}
    </SentryContextProvider>
  );
}
```

### Async Layout — Add setGlobalSentryContext Before Await (Server)

```tsx
// app/[deviceTheme]/[region]/[locale]/(shop-the-look)/shop-the-look/layout.tsx
import { SentryContextProvider } from '@castlery/observability/client';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function ShopTheLookLayout({ children }: { children: React.ReactNode }) {
  // REQUIRED: call before any await — if the API call below throws a 500,
  // isolation scope already has correct tags so Sentry captures with context.
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });

  const data = await sbApiClient.getSpecificPageWithoutCache(fullSlug); // can throw 500
  return (
    <SentryContextProvider pageType={PAGE_TYPES.OTHER} domain={BUSINESS_DOMAIN.CMS}>
      {/* ... */}
    </SentryContextProvider>
  );
}
```

_Only needed for async layouts with real 500-prone `await` operations. Pure JSX synchronous layouts do not need `setGlobalSentryContext`._

### RSC Page — Inject Context (Server)

```tsx
// app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function ProductPage(props: any) {
  // REQUIRED even if parent layout has SentryContextProvider.
  // Layout and page RSC execution order is not guaranteed — page may start
  // before layout's setGlobalSentryContext call runs. Page must set its own.
  setGlobalSentryContext({
    pageType: PAGE_TYPES.PDP,
    domain: BUSINESS_DOMAIN.PRODUCT,
  });

  // Server Actions / data fetching / RSC logic below inherit the above context
  return /* JSX */;
}
```

_`setGlobalSentryContext` writes to `getIsolationScope()` — shared per-request via AsyncLocalStorage across all RSCs in the same HTTP request. Once called, all subsequent captures in the same request inherit these tags._

### Server Action (Server)

```ts
// actions/cart.ts — use withServerActionInstrumentation when the action throws on failure
import { withServerActionInstrumentation, BUSINESS_DOMAIN, BusinessSeverity } from '@castlery/observability/server';

export const addToCartAction = withServerActionInstrumentation(
  async (productId: string, quantity: number) => {
    return await addToCart(productId, quantity);
  },
  {
    actionName: 'addToCartAction',
    monitoringContext: {
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
    monitoringContext: {
      domain: BUSINESS_DOMAIN.USER,
      severity: BusinessSeverity.CRITICAL,
    },
  }
);
```

```ts
// actions/dy.action.ts — use captureStructuredError when the action must gracefully degrade (return {} instead of throw)
import { captureStructuredError, BUSINESS_DOMAIN, BusinessSeverity } from '@castlery/observability/server';

export const fetchDyCampaigns = async (options: CampaignsRequestOptions) => {
  try {
    const res = await dyCampaignsFetcher(options, { cookies });
    if (!res.ok) {
      captureStructuredError(new Error(`DY campaigns fetch failed with status ${res.status}`), {
        domain: BUSINESS_DOMAIN.CMS,
        severity: BusinessSeverity.LOW,
        tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
        extra: { status: res.status },
      });
      return {};
    }
    // ...
  } catch (err) {
    captureStructuredError(err as Error, {
      domain: BUSINESS_DOMAIN.CMS,
      severity: BusinessSeverity.LOW,
      tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
    });
    return {};
  }
};
```

_`withServerActionInstrumentation` is preferred for actions that throw. For actions requiring graceful degradation (callers expect `{}` on failure), use `captureStructuredError` in catch — `withServerActionInstrumentation` always re-throws. Old action files without either pattern are legacy awaiting migration. Sentry carries `error_bucket`, `domain`, `priority`, etc._

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

## 11. Advanced & References

- **Log before capture**: `captureStructuredError` internally logs first, then conditionally reports; for advanced scenarios, read the `error-utils` and `beforeSend` logic.
- **Custom domain**: For errors use `createDomainErrorCapture(BUSINESS_DOMAIN.XXX)`, for messages use `createDomainMessageCapture(BUSINESS_DOMAIN.XXX)` to extend domain shortcuts.
- **Documentation**: See repo's `docs/observability/` (e.g. error-handling-flow, sentry-ownership-rules-setup) and Sentry project configuration and error template docs.

---

_Complete usage documentation is kept inside the observability skill to unify the integration approach and the alert/dashboard/error template contract._
