# Observability — Per-Scene Quick Reference

Per-scene integration steps and import conventions for `@castlery/observability` in joyboy. Sentry tag/severity produced by each call type is listed at the end.

---

## Layout — Set Global Context (Server)

- **File**: Route group's `layout.tsx` (e.g. `app/[deviceTheme]/[region]/[locale]/(PLP)/layout.tsx`).
- **Import**: `import { SentryContextProvider } from '@castlery/observability/client';`, `import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';`.
- **Steps**: Wrap `children` with `SentryContextProvider`, pass `pageType={PAGE_TYPES.XXX}` (required) and `domain={BUSINESS_DOMAIN.XXX}`. Always pass both `pageType` and `domain`. Suitable for globally stable information such as channel and device.
- **Sentry effect**: All captures under this route inherit `page_type` and any other set global context; critical business context should still be injected at RSC page level.

---

## RSC Page — Inject Business Context (Server)

- **File**: Business page's `page.tsx` (e.g. `app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx`).
- **Import**: `import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';`.
- **Steps**: Call `setGlobalSentryContext({ pageType, domain, priority, ... })` at the top of `page.tsx` to inject business context for this page; subsequent Server Actions, server-side fetches, and Redux listeners can reuse this context.
- **Sentry effect**: Errors/events on this page carry precise `page_type`/`domain`/`priority` business tags; this is the authoritative entry for business context in RSC mode.

---

## Server Action (Server)

- **Import**: `import { withServerActionInstrumentation, BUSINESS_DOMAIN } from '@castlery/observability/server';`
- **Steps**: **Required**: wrap every Server Action with `withServerActionInstrumentation(action, { actionName, sentryContext: { domain, severity? }, sensitiveFields? })`. Do not write bare try/catch Server Actions — old files not using this wrapper are legacy awaiting migration. Optionally call `captureStructuredError` / `captureXxxError` in an explicit inner catch for additional context.
- **Sentry effect**: Carries `error_bucket`, `domain` (from `sentryContext.domain`), `priority`, etc.; `withServerActionInstrumentation` attaches action span.

---

## Client Component (Client)

- **Import**: `import { captureStructuredError, addBreadcrumb, logger } from '@castlery/observability/client';` (or domain captures like `captureCartError`).
- **Steps**: Call `addBreadcrumb` at key steps to enrich the trace; call `captureStructuredError(error, { extra })` or `captureXxxError(error, { extra })` in event handler or useEffect catch; use `logger.info/warn/debug` or `cLog` for non-errors.
- **Log format**: `cLog()` has two modes — post-hydration browser uses `[timestamp] [LEVEL] msg` with context fields (`service`, `env`, `channel`, etc.); pre-hydration/SSR fallback outputs structured JSON `{"level","time","msg",...obj}`.
- **Sentry effect**: Carries `domain` (from domain API or context), `error_bucket` (computed by classifyErrorBucket), `priority`, etc.
- **Full SentryContextOptions** (applies to all capture APIs — `captureStructuredError`, `captureStructuredMessage`, domain shortcuts): all fields in `SentryContextOptions` are supported end-to-end via `withSentryContext` → `setSentryContext`:
  - `tags?: Record<string, string>` — merged into `scope.setTags`; use for Sentry indexing/filtering (e.g. `{ page, clsRating, viewport }`)
  - `fingerprint?: string[]` — passed to `scope.setFingerprint`; controls Sentry issue grouping (e.g. `['cls-v2', culpritSelector]`)
  - `extra?: Record<string, any>` — PII-filtered, attached as `scope.setExtra` entries
  - `domain`, `severity`, `priority`, `skipSentry`, `pageType`, `userId`, `country`
  - **Migration note**: when replacing bare `Sentry.withScope` calls, always carry over `setTags` → `tags` and `setFingerprint` → `fingerprint` to preserve deduplication and alert filtering. `beforeSend` only adds global `error_bucket`/`bucket_confidence` — it does not set custom tags or fingerprints.

---

## API Route (Server)

- **Import**: `import { logger, captureOrderError } from '@castlery/observability/server';` (or other domain captures).
- **Steps**: In try/catch, optionally call `logger.error(...)` first, then `captureOrderError(error, { extra })` or `captureStructuredError(error, { domain, extra })`; can explicitly pass `domain`/`priority`.
- **Sentry effect**: Carries `domain`, `error_bucket`, `priority`, etc.; if context was not set in layout, pass domain explicitly in the capture options.

---

## Middleware

- **Import**: `import { logger } from '@castlery/observability/server';` for logging in middleware. The restriction is on **tracing APIs** only, not on which logger entry to use.
- **Steps**: Use `logger` for request-related logging or call `addBreadcrumb`; do not call tracing APIs (`withServerActionInstrumentation`, `withFetchSpan`, `createTrackedGet`/`createTrackedPost`) — not supported in Edge runtime.
- **Log format**: Middleware runs without `window`, so `cLog()` always uses the fallback path — output is structured JSON `{"level","time","msg",...obj}`, not prefixed text.
- **Sentry effect**: If capture occurs, tags will still be attached; no guarantee of a complete span tree inside middleware.

---

## Structured Messages (Non-Error Events)

- **Scene**: Business degradation alerts, unexpected payment/order callback status, feature fallback notifications, critical metric anomalies — **non-error** events that still need Sentry tracking.
- **Import**: `import { captureStructuredMessage, sendOrderMessage, sendPaymentMessage } from '@castlery/observability/server';` (or `@castlery/observability/client` for browser).
- **Steps**: Call `captureStructuredMessage(message, context)` or domain shortcuts `sendOrderMessage`, `sendPaymentMessage`, `sendCartMessage`, `sendProductMessage`, `sendUserMessage`, `sendCheckoutMessage(message, options)`.
- **Sentry effect**: Reported as a message with `domain`, `priority`, `severity` (fatal/error/warning/info) and filtered `extra`; not reported in dev by default, controllable via `skipSentry`.
- **Domain shortcut current scope**: `sendPaymentMessage` / `sendOrderMessage` / etc. are first-gen wrappers via `createDomainMessageCapture`, currently forwarding `domain`, `extra`, `skipSentry`, `severity` only. If you need `tags` or `fingerprint`, you have two options: (1) call `captureStructuredMessage` directly; (2) extend `createDomainMessageCapture` to accept and pass through additional `SentryContextOptions` fields — the underlying `captureStructuredMessage` already supports them.
- **Same applies to error shortcuts**: `capturePaymentError` / `captureCartError` / etc. via `createDomainErrorCapture` follow the same pattern and can be extended the same way.

---

## Project-Level error_bucket Implementation (Web Client)

- **File**: `apps/web/instrumentation-client.ts` (Sentry client init and `beforeSend`).
- **What `beforeSend` actually does** (in order):
  1. Calls `classifyErrorBucket` → writes `event.tags.error_bucket` + `event.tags.bucket_confidence` **first**
  2. Runs **~21 filter rules** (numbered 0–18 with 4.5 and 17a variants) that can return `null` to drop events: Klaviyo stack overflow, no-stack, WebView bridge unload, offline/mulberry network errors, non-critical third-party scripts, widget-assets, third-party stack traces, mobile app noise, **AbortError (rule #7 — always dropped)**, third-party timeouts, null/undefined/property errors without own code, CORS, specific patterns, ATS, api_static, HeadlessChrome, webkit.messageHandlers, Android JavascriptInterface, mobile browser noise
  3. For critical third-party errors (DY, Stripe, PayPal) with no own code: keeps them and sets `event.tags.criticalThirdParty = 'yes'`
  4. **Appends global diagnostic tags**: `userAgent`, `onlineStatus` (`'online'`/`'offline'`), `hasOwnCode` (`'yes'`/`'no'`)
  5. **Appends `browser` context**: `userAgent`, `online`, `language`, `name`
- **Release name format**: `joyboy-web@${appEnv}@${appVersion}@${gitHash}` (four `@`-separated segments, e.g. `joyboy-web@sg-prod@1.2.3@abc1234`). In Sentry, filter by `release:joyboy-web@<appEnv>@<version>@<gitHash>`. `appEnv` follows `{region}-{stage}`: `sg-prod`, `us-prod`, `au-prod`, `uk-prod`, `ca-prod` (prod), `sg-test`, `us-test` etc. (test), `sg-uat`, `us-uat` etc. (UAT). To match all prod: `release:joyboy-web@*-prod@*`.
- **Data flow**: All client-side reports go through this `beforeSend`; business code only needs to pass `tags`/`fingerprint`/`extra` — do NOT re-implement bucketing or the global diagnostic tags.
- **Alerts/dashboards/error templates**: Can rely on `error_bucket`, `bucket_confidence`, `userAgent`, `onlineStatus`, `hasOwnCode` being present on every reported event.

---

## Common Sentry Tags & Severity (Quick Reference)

| Source              | Description                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`            | BUSINESS_DOMAIN enum (payment, order, cart, product, user, checkout, etc.); recommended to inject via `setGlobalSentryContext` in RSC page; layout or capture options serve as fallback only.                                                                                                                                                                                                               |
| `priority`          | Business priority (high/medium/low); can be set via `inferPriorityFromDomain` or layout/capture.                                                                                                                                                                                                                                                                                                            |
| `error_bucket`      | ERROR_BUCKET — priority order: `hydration → third_party → api_5xx → api_timeout → js_fatal → unclassified`; written in Web client by calling `classifyErrorBucket` at the **start** of `beforeSend` in `apps/web/instrumentation-client.ts`, before running filters. `AbortError` is classified as `api_timeout`; `beforeSend` rule #7 attempts to filter AbortErrors but filtering is not always complete. |
| `bucket_confidence` | Bucket classification confidence; written into `event.tags` together with `error_bucket` at the start of `beforeSend`.                                                                                                                                                                                                                                                                                      |
| `page_type`         | PAGE_TYPES; injected by `SentryContextProvider`'s `pageType`.                                                                                                                                                                                                                                                                                                                                               |
| severity/level      | api_5xx, js_fatal → error/fatal; third_party, hydration → warning; domain + priority affects business priority.                                                                                                                                                                                                                                                                                             |

Alert rules are recommended to be configured by `error_bucket` + `priority`; dashboards by bucket/domain/severity; error templates can reference the above tags and context business fields.
