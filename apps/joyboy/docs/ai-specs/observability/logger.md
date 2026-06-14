---
status: accepted
version: 1.0.0
owner: lychee27z
last-reviewed: 2026-04-07
related-human-docs:
  - docs/observability/error-handling-flow.md
---

# joyboy Logger — Usage Guide

This spec covers the **logger layer** of `@castlery/observability` in the joyboy project: when to log vs report, how to log correctly across runtimes, and how to control noise and PII.

---

## 1. Entry Points

| Entry   | Import Path                      | When to use                                                            |
| ------- | -------------------------------- | ---------------------------------------------------------------------- |
| default | `@castlery/observability`        | Types + lightweight browser console logger; no pino, no server tracing |
| client  | `@castlery/observability/client` | Client Components, browser event handlers, Redux listeners             |
| server  | `@castlery/observability/server` | RSC, Server Actions, API Routes, Middleware                            |

- **Middleware**: Use `@castlery/observability/server` for logger access. Middleware runs in Edge runtime — tracing APIs (`withServerActionInstrumentation`, `withFetchSpan`) are not available here, but logger is fine.

---

## 2. Logger API

```ts
import { logger } from '@castlery/observability/server'; // or /client

logger.debug('message', { ...details });  // dev tracing only
logger.info('message', { ...details });   // business events, flow tracking
logger.warn('message', { ...details });   // degraded states, soft failures
logger.error('message', { error, ... });  // errors — prefer captureStructuredError for Sentry reporting
```

**Rule**: Do NOT call `logger.error` + bare `Sentry.captureException` separately — use `captureStructuredError` instead. It logs and reports in one call, avoiding duplicates or missed reports.

---

## 3. cLog — Client Logger

`cLog()` is the browser-side logger wrapper. It has two runtime modes:

| Mode                         | When                      | Format                                                                                                          |
| ---------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Post-hydration browser       | After `initLogger()` runs | `[2026-03-25T10:00:00Z] [INFO] message` with context fields (`service`, `env`, `country`, `channel`, `version`) |
| SSR / pre-hydration fallback | `window` is undefined     | Structured JSON `{"level":"info","time":1234,"msg":"...","service":"..."}`                                      |

When debugging: expect JSON in server-side logs and readable prefixed text in browser console.

---

## 4. ⚠️ Critical: Never Add `'use client'` to Logger Modules

`client-logging.ts` and `unified-logger.ts` intentionally have **no `'use client'` directive**.

**Why**: In Next.js RSC server bundle, `'use client'` module exports become non-callable client reference proxies. Any server code path that calls `captureStructuredError` → `unified-logger` → `cLog()` would throw `TypeError: cLog is not a function`.

The `isClient()` guard inside `cLog()` handles server-vs-browser behavior at runtime — no directive needed.

**Never add `'use client'` to logger utility modules that are imported by server code paths.**

---

## 5. Non-Error Events: When to Use captureStructuredMessage

Use `captureStructuredMessage` / `sendXxxMessage` for **non-exception** events that still need Sentry tracking:

- Business degradation (fallback activated, partial failure)
- Unexpected payment/order callback status
- Feature flags triggered unexpectedly

```ts
import { sendOrderMessage, sendPaymentMessage, captureStructuredMessage } from '@castlery/observability/server';

// Domain shortcut
sendOrderMessage('Order status transition unexpected: confirmed -> failed', {
  severity: 'warning',
  extra: { orderId: '123', previousStatus: 'confirmed' },
});

// Full control (supports tags, fingerprint)
captureStructuredMessage('Payment callback status unknown', {
  domain: BUSINESS_DOMAIN.PAYMENT,
  severity: 'warning',
  tags: { callback_source: 'stripe' },
  fingerprint: ['payment-callback-unknown', callbackStatus],
  extra: { orderId, callbackStatus },
});
```

**Domain shortcuts** (`sendPaymentMessage`, `sendOrderMessage`, `sendCartMessage`, `sendProductMessage`, `sendUserMessage`, `sendCheckoutMessage`): first-gen wrappers, currently forward `domain`, `extra`, `skipSentry`, `severity` only. If you need `tags` or `fingerprint`, use `captureStructuredMessage` directly.

---

## 6. Noise Control

### skipSentry

Pass `skipSentry: true` to log without reporting to Sentry:

```ts
captureStructuredError(error, {
  skipSentry: isExpectedBusinessError(error),
  extra: { feature: 'order-merge' },
});
```

### isExpectedBusinessError

Checks if an error is a known, expected business condition (user-facing, not a bug). Returns `true` for things like "item out of stock", "session expired". Use it to decide `skipSentry`.

### isUserInputError

For 400/422 responses — returns `true` only for specific user-input error patterns:

- Credential errors: `"Incorrect password"`, `"Invalid credentials"` etc.
- Account existence: `"email already taken"`, `"user not found"` etc.
- Format errors: `"invalid email"`, `"password too short"` etc.
- Token errors: `"token has expired"`, `"token is invalid"` etc.
- HTTP 422: always `true` (validation failure)

**Important**: Not all 400s are skipped. Unrecognized 400 messages still report to Sentry as potential bugs. To add new skip cases, extend the relevant regex in `isUserInputError` in `error-utils.ts` — group into appropriate category, do not add one-off strings.

### shouldSendToSentry

Returns `false` in development environment. Called internally by `captureStructuredError` — you don't usually need to call this directly.

---

## 7. PII Filtering

`filterPII` recursively sanitizes `extra` before reporting. It uses **exact field name matching** (case-insensitive), not regex — this avoids false positives.

Fields redacted as `[Filtered]` include: `email`, `password`, `token`, `phone` and their common variants.

Fields NOT filtered (correct behavior): `isEmailVerified`, `hasEmail`, `mobileTheme` — partial matches are intentionally safe.

The filter runs automatically inside `captureStructuredError`. Business code does not need to call it manually.

---

## 8. Additional References

- Logger source: `libs/shared/observability/src/lib/logger/`
- Error utils (isExpectedBusinessError, isUserInputError, filterPII): `libs/shared/observability/src/lib/sentry/errors/error-utils.ts`
- For Sentry context injection and capture APIs → see [`sentry-practices.md`](sentry-practices.md)
- For alert rules and domain/severity definitions → see [`alert-metrics.md`](alert-metrics.md)

---

## See Also (Human-facing docs)

- [`docs/observability/error-handling-flow.md`](../../observability/error-handling-flow.md) — 各场景错误处理流程（中文，面向开发者）
