---
name: observability-joyboy
description: Use when integrating observability in the joyboy project — adding Sentry/logger, logging in Next.js with error reporting, Layout + capture setup, Server Action error reporting, error_bucket/tag conventions, project-level error_bucket implementation, instrumentation-client beforeSend, or scene-based observability integration using libs/shared/observability.
version: 0.1.0
---

# Observability (joyboy) — Scene-Based Quick Integration

In the joyboy project, when using `@castlery/observability`, select the entry point and API based on the **current scene** to log and report to Sentry in a single call, routed through unified bucketing and tags into alerts and dashboards.

## Purpose

- Given the user's **current scene** (Layout, Server Action, Client Component, API Route, Middleware, or project-level Sentry config/error_bucket implementation), provide the shortest integration path.
- Clarify which package entry to use (client/server), whether to wrap with `SentryContextProvider`, which business API to call (`captureStructuredError` or `captureXxxError`), and how to fill tag/domain/priority when needed.
- For **project-level monitoring implementation**: explain what `apps/web/instrumentation-client.ts` `beforeSend` actually does — (1) calls `classifyErrorBucket` first to write `event.tags.error_bucket`/`bucket_confidence` (bucket priority: `hydration → third_party → api_5xx → api_timeout → js_fatal → unclassified`); (2) runs ~21 filter rules (numbered 0–18 with 4.5/17a variants) that can drop events — including **AbortError (rule #7, always dropped)**; (3) appends global diagnostic tags: `userAgent`, `onlineStatus`, `hasOwnCode`; (4) appends `browser` context (userAgent, online, language, name). Release format: `joyboy-web@${appEnv}@${appVersion}@${gitHash}` where `appEnv` is `{region}-{stage}` (e.g. `sg-prod`, `us-prod`, `au-prod`, `sg-test`, `us-test`, `sg-uat`). Business code does not need to implement bucketing or these global tags — they are added automatically. Sentry experts need this implementation detail to configure alerts/dashboards/error templates.
- End with a brief summary of "tags/severity visible in Sentry", consistent with the README conventions.

## Workflow

1. **Identify the current scene**
   From user description or code context: Layout injection, RSC `page.tsx` injection, Server Action, Client Component, Redux listener, API Route, Middleware, or "tag/bucket/alert config only".

2. **Select the entry point**

   - RSC `page.tsx` / Server Actions / API Routes: use `@castlery/observability/server` (for pino or server-side tracing).
   - Client Components, Redux listeners, browser logic: use `@castlery/observability/client`.
   - Layout: use `SentryContextProvider` from `@castlery/observability/client` (it is a `'use client'` component); import `PAGE_TYPES`/`BUSINESS_DOMAIN` from `@castlery/observability/server`.
   - Middleware: use only default or client logger and context — no server tracing.

3. **Shortest path per scene**

   - **Layout**: Wrap `children` in `SentryContextProvider` in the route group's `layout.tsx`, passing `pageType` (required) and optionally `domain`, `priority`, `severity` for globally stable context (channel, device, etc.).
   - **RSC Page**: Call `setGlobalSentryContext({ pageType, domain, priority, ... })` at the top of `page.tsx` — the authoritative entry for business context in RSC.
   - **Server Action**: Use `withServerActionInstrumentation(action, { actionName, sentryContext?, sensitiveFields? })`; or call `captureStructuredError` / `captureXxxError` in catch.
   - **Client**: Call `captureStructuredError` or `captureCartError` etc. directly in event handlers or useEffect; use `logger`/`cLog` for non-errors.
   - **Redux listener (client)**: Import `logger/addBreadcrumb/captureStructuredError/isExpectedBusinessError` from `@castlery/observability/client` in the listener middleware effect: log breadcrumb → decide `skipSentry` via `isExpectedBusinessError` → call `captureStructuredError(error, { skipSentry, extra })` with `feature/event/error_bucket` and `domain/pageType/orderId` from global slice.
   - **API Route**: In catch, use `logger.error` + `captureStructuredError` or `captureOrderError` etc., optionally passing explicit `domain`/`priority`.
   - **Middleware**: Use `logger` from `@castlery/observability/server` for logging; do not call tracing APIs (`withServerActionInstrumentation`, `withFetchSpan`) — not supported in Edge runtime.

4. **Explain Sentry-side effects**
   Briefly note the tags this call produces in Sentry (e.g. `domain`, `error_bucket`, `priority`) and severity, consistent with "annotate tag and severity next to examples" in the README.

## Key Conventions (Avoid Misuse)

- **Recommended default**: Use `captureStructuredError` or domain shortcut functions (`capturePaymentError`, `captureOrderError`, etc.) to **log and report in one call**; do not call `logger.error` then bare `captureException` — this risks missed reports or duplicates. **Server Actions must use `withServerActionInstrumentation` wrapper** — do not write bare try/catch Server Actions.
- **Domain shortcut functions** (`capturePaymentError`, `captureCartError`, etc.) are first-gen convenience wrappers built with `createDomainErrorCapture` — currently forward only `domain`, `extra`, `skipSentry`, `severity`. If you need `tags` or `fingerprint`, either call `captureStructuredError` directly, or extend the shortcut by updating `createDomainErrorCapture` to forward additional `SentryContextOptions` fields.
- **Non-errors**: Use `logger.info/warn/debug`; if Sentry tracking is needed (business degradation, payment/order status unexpected, fallback notifications), use `captureStructuredMessage` or domain shortcut functions `sendPaymentMessage`, `sendOrderMessage`, `sendCartMessage`, `sendProductMessage`, `sendUserMessage`, `sendCheckoutMessage`.
  - **`captureStructuredMessage`** accepts full `SentryContextOptions`: `severity`, `extra`, `skipSentry`, `domain`, `priority`, **`tags`** (custom Sentry tags, merged into `scope.setTags`), **`fingerprint`** (issue grouping array, e.g. `['feature-name', culpritId]`).
  - **Domain shortcut functions** (`sendPaymentMessage` etc.) are first-gen wrappers built with `createDomainMessageCapture` — currently forward only `domain`, `extra`, `skipSentry`, `severity`. If you need `tags` or `fingerprint`, either call `captureStructuredMessage` directly, or extend `createDomainMessageCapture` to accept and forward additional `SentryContextOptions` fields.
- **Tracing**: Node server only; Server Actions use `withServerActionInstrumentation`, server-side fetch uses `withFetchSpan`/`createTrackedGet`/`createTrackedPost`; middleware does not support these tracing APIs.
- **`'use client'` on logger utilities**: Never add `'use client'` to logger utility modules (`client-logging.ts`, `unified-logger.ts`). In the Next.js RSC server bundle, `'use client'` module exports become non-callable client references — any server-side call to `captureStructuredError` (e.g. via `wrapClient`/`withFetchSpan`) would throw `TypeError: cLog is not a function`. Runtime environment detection is handled by `isClient()` inside `cLog()`, not by the directive.

## Scene & API Quick Reference

| Scene                             | Entry                                                                | Key API                                                                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout context setup              | client (SentryContextProvider) + server (PAGE_TYPES/BUSINESS_DOMAIN) | `SentryContextProvider` + `pageType` + `domain`                                                                                                                               |
| Server Action                     | server                                                               | `withServerActionInstrumentation` (required), `captureStructuredError` / `captureXxxError` in inner catch                                                                     |
| Client event/error                | client                                                               | `captureStructuredError`, `captureXxxError`, `logger`/`cLog`                                                                                                                  |
| Non-error needing Sentry tracking | server/client                                                        | `captureStructuredMessage`, `sendPaymentMessage` / `sendOrderMessage` / `sendCartMessage` / `sendProductMessage` / `sendUserMessage` / `sendCheckoutMessage`                  |
| API Route                         | server                                                               | `logger` + `captureStructuredError` / `captureOrderError` etc.                                                                                                                |
| Middleware                        | default/client                                                       | logger / breadcrumb only, no server tracing                                                                                                                                   |
| Project-level error_bucket (Web)  | apps/web/instrumentation-client.ts                                   | In `beforeSend`: call `classifyErrorBucket` first to write `event.tags`, then run filters; alerts/dashboards/error templates depend on `error_bucket` and `bucket_confidence` |

## References

- **`references/observability-guide.md`**: Complete usage guide (overview, scene table, main path, tag/bucket, alerts & error template, project-level error_bucket implementation, examples, advanced). Authoritative documentation is kept inside the skill.
- **`references/README-LINK.md`**: Section summaries and navigation links to the guide above.
- **`references/scenes-quick-reference.md`**: Per-scene quick steps and import conventions, Sentry tag/severity notes, and project-level `beforeSend` + `error_bucket` implementation highlights.

When writing or modifying code, consult the README and scenes quick reference first; if the user provides specific files or errors, refer to the implementations under `libs/shared/observability/src` (e.g. `error-capture`, `context-setters`, `error-bucket`) for targeted changes.
