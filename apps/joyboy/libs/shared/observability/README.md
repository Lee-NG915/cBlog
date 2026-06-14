# @castlery/observability

Structured logging, Sentry error reporting, tracing, and context management for Castlery Next.js apps.

---

## Entry Points

| Entry   | Import path                      | Use when                                                  |
| ------- | -------------------------------- | --------------------------------------------------------- |
| default | `@castlery/observability`        | Lightweight logger + types, no pino, no tracing           |
| client  | `@castlery/observability/client` | Client Components, Redux listeners, browser logic         |
| server  | `@castlery/observability/server` | RSC, Server Actions, API Routes, Middleware (logger only) |

> **Note:** `SentryContextProvider` is a `'use client'` component — import from `/client`, **not** `/server`.

---

## Scene Quick Reference

### Layout

```tsx
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

// Wrap children; always pass both pageType and domain
<SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.PRODUCT}>
  {children}
</SentryContextProvider>;
```

### RSC Page

```ts
import { logger, setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

setGlobalSentryContext({ pageType: PAGE_TYPES.PDP, domain: BUSINESS_DOMAIN.PRODUCT });
```

### Server Action (mandatory wrapper)

```ts
import { withServerActionInstrumentation, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const myAction = withServerActionInstrumentation(
  async (arg: string) => {
    /* ... */
  },
  { actionName: 'myAction', sentryContext: { domain: BUSINESS_DOMAIN.CART } }
);
```

### Client Component

```tsx
import { captureStructuredError, addBreadcrumb } from '@castlery/observability/client';

addBreadcrumb({ message: 'Button clicked', data: { sku } });
// in catch:
captureStructuredError(error, { extra: { sku } });
```

### API Route

```ts
import { logger, captureOrderError } from '@castlery/observability/server';

// in catch:
logger.error('Order API failed', { error });
captureOrderError(error, { extra: { path: req.url } });
```

### Middleware

```ts
import { logger } from '@castlery/observability/server';
// logger OK; no tracing APIs in Edge runtime
```

### Redux Listener

```ts
import { captureStructuredError, isExpectedBusinessError, addBreadcrumb } from '@castlery/observability/client';

captureStructuredError(error, { skipSentry: isExpectedBusinessError(error) });
```

---

## Key Conventions

- **Server Actions**: `withServerActionInstrumentation` is **required** — do not write bare try/catch actions
- **Error capture**: use `captureStructuredError` or domain shortcuts (`capturePaymentError`, `captureOrderError`, etc.) — one call logs + reports; do not use bare `Sentry.captureException`
- **Non-errors needing Sentry**: use `captureStructuredMessage` / `sendXxxMessage`
- **Tracing**: `withFetchSpan` / `createTrackedGet` / `createTrackedPost` — server only; not supported in Middleware (Edge runtime)
- **PII**: `filterPII` and `domainSpecificFilters` applied automatically; do not pass raw PII in `extra`

---

## API Reference

### Error capture

`captureStructuredError`, `capturePaymentError`, `captureOrderError`, `captureCartError`, `captureProductError`, `captureUserError`, `captureCheckoutError`, `createDomainErrorCapture`

### Message capture

`captureStructuredMessage`, `sendPaymentMessage`, `sendOrderMessage`, `sendCartMessage`, `sendProductMessage`, `sendUserMessage`, `sendCheckoutMessage`, `createDomainMessageCapture`

### Context

`SentryContextProvider`, `setGlobalSentryContext`, `setSentryContext`, `withSentryContext`, `addBreadcrumb`, `setUserContext`, `clearUserContext`

### Tracing

`withServerActionInstrumentation`, `withFetchSpan`, `createTrackedGet`, `createTrackedPost`

### Filtering / bucketing

`shouldSendToSentry`, `isExpectedBusinessError`, `isAuthError`, `isUserPaymentError`, `filterPII`, `domainSpecificFilters`, `classifyErrorBucket`

### Constants

`BUSINESS_DOMAIN`, `PAGE_TYPES`, `ERROR_BUCKET`

---

## Further Reading

- Full usage guide: [`docs/ai-specs/observability/references/observability-guide.md`](../../../docs/ai-specs/observability/references/observability-guide.md)
- Next.js error flow: [`docs/observability/error-handling-flow.md`](../../../docs/observability/error-handling-flow.md)
- Sentry ownership setup: [`docs/observability/sentry-ownership-rules-setup.md`](../../../docs/observability/sentry-ownership-rules-setup.md)
