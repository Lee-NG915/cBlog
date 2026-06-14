---
status: accepted
version: 1.0.0
owner: lychee27z
last-reviewed: 2026-04-07
related-human-docs:
  - docs/observability/error-handling-flow.md
  - docs/observability/sentry-ownership-rules-setup.md
---

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
  - **Client buckets** (`classifyErrorBucket`): `hydration`, `third_party`, `api_5xx`, `api_timeout`, `js_fatal`, `app_error`, `unclassified`. Priority order: `hydration → third_party → api_5xx → api_timeout → js_fatal → app_error → unclassified` — third_party is checked **before** api_5xx/api_timeout to prevent DynamicYield/third-party 5xx from polluting api_5xx. `app_error` catches explicitly-captured errors (`mechanism.handled=true + type=generic`) that didn't match any earlier bucket.
  - **Server buckets** (`classifyErrorBucketServer`): `upstream_5xx`, `upstream_timeout`, `js_fatal`, `app_error`, `unclassified`. Skips hydration/third_party (browser-only); 5xx → `upstream_5xx` (semantics: our server called an upstream API and got 5xx); timeout/AbortError → `upstream_timeout`. `app_error` covers explicitly-captured server-side degradation paths (same mechanism detection).
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

## 6. Alerts, Dashboards & Error Templates

- **Alerts**: Configure rules by `error_bucket` + `priority`; specify which buckets require critical/high alerts and which can be downgraded to warning or dashboard-only. Current configured rules in Sentry (joyboy-web project): see [`alert-metrics.md`](alert-metrics.md) §5.

- **Dashboards**: Build by bucket / domain / severity dimensions; consistent with Tag conventions.
- **Error templates**: Sentry error template parameters include `error_bucket`, `bucket_confidence`, `domain`, `priority`, `severity`, and business context fields (e.g. `orderId`, `productId`); some are auto-injected by the SDK, others must be passed in `extra` by business code.

---

## 7. Project-Level error_bucket Implementation (Web Client — Browser)

This document covers not only `@castlery/observability` **package capabilities** but also how the joyboy **project layer** writes `error_bucket` to Sentry events, completing the "package capabilities + project monitoring implementation pattern" loop. Sentry experts and integrators can use this to understand when tags are written and the dependency relationship of alerts/dashboards.

- **Package vs project responsibilities**: The package provides the semantics and classification logic for `classifyErrorBucket`, `ERROR_BUCKET`, and `bucket_confidence`; the **project layer** applies this via `clientBeforeSend` — a pure, testable function extracted to `libs/shared/observability/src/lib/sentry/hooks/web/client-before-send.ts`. The thin wrapper in `apps/web/instrumentation-client.ts` injects browser deps (`navigator`, `window`, `logger`) and delegates to `clientBeforeSend`. Tags are written **first**, then ~21 filter rules run.
- **Release name format**: `joyboy-web@${appEnv}@${appVersion}@${gitHash}` (e.g. `joyboy-web@sg-prod@1.2.3@abc1234`). In Sentry release filter, use `release:joyboy-web@<appEnv>@<version>@<gitHash>` — four `@`-separated segments. `appEnv` values follow `{region}-{stage}` pattern: `sg-prod`, `us-prod`, `au-prod`, `ca-prod`, `uk-prod`, `sg-test`, `us-test`, `au-test`, `ca-test`, `uk-test`, `sg-uat`, `us-uat`, etc. To filter all prod regions, use `release:joyboy-web@*-prod@*` (Sentry supports `*` wildcards).
- **Implementation order (must not be reversed)**: At the start of `beforeSend`, extract `message`, `exception`, `frames`, `statusCode` (from `event.contexts?.response?.status_code` or `event.extra?.response?.status`) from `event`/`hint`, call `classifyErrorBucket({ message, errorName, frames, statusCode })`, then **immediately** write the resulting `error_bucket` and `bucket_confidence` into `event.tags`; **then** run ~21 filter rules (numbered 0–18, with 4.5 and 17a as unnumbered variants) that can drop events (return `null`): Klaviyo stack overflow, no-stack, WebView bridge unload, offline/mulberry network errors, non-critical third-party scripts, widget-assets, third-party stack traces, mobile app noise, **AbortError** (dropped by rule #7 — see note below), third-party timeouts, null/undefined/property errors without own code, CORS, specific patterns, ATS, api_static, HeadlessChrome, webkit.messageHandlers, Android JavascriptInterface, mobile browser webkit/stack-overflow.
- **AbortError & api_timeout**: `classifyErrorBucket` classifies `AbortError` as `api_timeout`. `beforeSend` rule #7 attempts to drop AbortError events, but filtering behavior may vary depending on error message content and how the error surfaces. `api_timeout` events in Sentry may include both AbortError-based and other timeout-message-based errors (e.g. `"timed out"`, `"ETIMEDOUT"`).
- **Data flow**: All client-side reports (including business calls to `captureStructuredError`, Redux listener captures) go through the **Sentry client SDK → single `beforeSend`**. Business code only needs to provide context and `extra` (e.g. `domain`, `orderId`, `statusCode`); **there is no need — and it is wrong — to implement a separate bucketing logic in business code or listeners**. The authoritative bucketing and filtering logic is in `hooks/web/client-before-send.ts`; `instrumentation-client.ts` is a thin wrapper that injects browser runtime deps. Unit tests are in `client-before-send.spec.ts`.
- **Alerts & dashboards**: Tiered alerts can use `error_bucket` rules (e.g. `api_5xx`, `js_fatal` as critical/high); dashboards and error templates can rely on the presence and consistency of `error_bucket` and `bucket_confidence` on reported events. When modifying bucketing rules or `beforeSend` order, update this document and related specs synchronously to avoid inconsistency with alert/dashboard assumptions.

---

## 8. Project-Level error_bucket Implementation (Web Server — Node.js)

- **File**: `apps/web/sentry.server.config.ts` — `beforeSend` inside `Sentry.init()`.
- **Applies to**: All errors from Server Actions, API Routes, and any server-side code running in Node.js runtime. Does **not** apply to Edge runtime (middleware).
- **Classifier**: `classifyErrorBucketServer` from `@castlery/observability/server` (`libs/shared/observability/src/lib/sentry/errors/error-bucket.ts`). Pure function, no Node.js-specific dependencies.
- **Bucket priority order**: `upstream_5xx → upstream_timeout → js_fatal → app_error → unclassified`. Skips `hydration` and `third_party` (browser-only concepts). `app_error` fires when `mechanism.handled=true + mechanism.type='generic'` (i.e. explicit `captureStructuredError` call) and no earlier bucket matched.
- **statusCode source**: `(event.contexts?.response as Record<string, unknown>)?.status_code ?? event.extra?.statusCode`. Server Actions and API Routes that attach response status to the event context will be classified correctly.
- **Implementation**:
  ```ts
  beforeSend(event, hint) {
    const error = hint?.originalException;
    const message = event.message ?? (error instanceof Error ? error.message : String(error ?? ''));
    const errorName = (error instanceof Error ? error.name : undefined) ?? event.exception?.values?.[0]?.type;
    const frames = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    const statusCode =
      (event.contexts?.response as Record<string, unknown> | undefined)?.status_code as number | undefined
      ?? (event.extra?.statusCode as number | undefined);
    const mechanism = event.exception?.values?.[0]?.mechanism;
    const isExplicitCapture = mechanism?.handled === true && mechanism?.type === 'generic';
    const { error_bucket, bucket_confidence } = classifyErrorBucketServer({ message, errorName, frames: frames.map(f => ({ filename: f.filename })), statusCode, isExplicitCapture });
    event.tags = { ...event.tags, error_bucket, bucket_confidence };
    return event;
  }
  ```
- **No filter rules**: Unlike the client `beforeSend`, the server version does not run noise-reduction filter rules — all events reaching `beforeSend` are forwarded (filtered upstream by `shouldSendToSentry()` in `captureStructuredError`).
- **Edge runtime gap**: `sentry.edge.config.ts` does **not** have `beforeSend`, so middleware errors arrive in Sentry without `error_bucket` tag and cannot trigger alert rules. This is a known gap.
- **Alert rules that depend on this**: `[Sev-2] Upstream Errors` (`error_bucket:[upstream_5xx,upstream_timeout]`). `app_error` bucket routes through `[Sev-3] Fatal/Error Level` or `[Sev-4] Warning/Log Level Alert` by level — no dedicated rule.

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

See [`references/observability-guide.md`](references/observability-guide.md) for full per-scene code examples.

---

## 11. Advanced & References

- **Log before capture**: `captureStructuredError` internally logs first, then conditionally reports; for advanced scenarios, read the `error-utils` and `beforeSend` logic.
- **Custom domain**: For errors use `createDomainErrorCapture(BUSINESS_DOMAIN.XXX)`, for messages use `createDomainMessageCapture(BUSINESS_DOMAIN.XXX)` to extend domain shortcuts.
- For companion observability specs → see [`alert-metrics.md`](alert-metrics.md), [`sentry-practices.md`](sentry-practices.md), [`logger.md`](logger.md)

---

## See Also (Human-facing docs)

- [`docs/observability/error-handling-flow.md`](../../observability/error-handling-flow.md) — 错误处理流程（中文，面向开发者）
- [`docs/observability/sentry-ownership-rules-setup.md`](../../observability/sentry-ownership-rules-setup.md) — Sentry Dashboard Ownership Rules 配置（运维操作）
