---
status: accepted
version: 1.0.6
owner: lychee27z
last-reviewed: 2026-04-22
related-human-docs:
  - docs/observability/error-handling-flow.md
  - docs/observability/sentry-issue-routing-guide.md
---

# joyboy Sentry Practices — Instrumentation Guide

This spec covers **how to instrument code** with Sentry in joyboy using `@castlery/observability`. It answers "how do I add error reporting here", "which API should I call", and "why does context need to be set this way".

See [`references/sentry-scenes.md`](references/sentry-scenes.md) for per-scene code examples.

---

## 1. Entry Points

| Entry   | Import path                      | Use when                                                           |
| ------- | -------------------------------- | ------------------------------------------------------------------ |
| client  | `@castlery/observability/client` | Client Components, browser event handlers, Redux listeners         |
| server  | `@castlery/observability/server` | RSC page.tsx, Server Actions, API Routes, Middleware (logger only) |
| default | `@castlery/observability`        | Types only or lightweight browser use                              |

`SentryContextProvider` is a `'use client'` component — always import from `/client`. Import `PAGE_TYPES` and `BUSINESS_DOMAIN` from `/server` in Server Components.

---

## 2. Context Injection: Layout vs page.tsx

Context is what makes every error in Sentry carry `domain`, `page_type`, `priority` tags automatically.

### Layout (synchronous) — `SentryContextProvider`

```tsx
// layout.tsx (Server Component)
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function PLPLayout({ children }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.SEARCH}>
      {children}
    </SentryContextProvider>
  );
}
```

Always pass both `pageType` and `domain`. Do **not** add `setGlobalSentryContext` in synchronous layouts — `SentryContextProvider` calls it internally.

### Async Layout exception — add `setGlobalSentryContext` before `await`

If a layout has `await` operations that can throw a 500, call `setGlobalSentryContext` **before** the first await:

```tsx
export default async function ShopTheLookLayout({ children }) {
  // REQUIRED: if the await below throws 500, isolation scope already has tags
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });

  const data = await sbApiClient.getSpecificPage(slug); // can throw
  return <SentryContextProvider pageType={PAGE_TYPES.OTHER} domain={BUSINESS_DOMAIN.CMS}>{...}</SentryContextProvider>;
}
```

Pure synchronous JSX layouts do **not** need this.

### RSC page.tsx — `setGlobalSentryContext` (authoritative)

**Always call this in page.tsx, even if the parent layout has `SentryContextProvider`.**

Why: Under React concurrent rendering, layout and page RSC execution order is not guaranteed. `setGlobalSentryContext` writes to `getIsolationScope()` — a per-request AsyncLocalStorage scope shared across all RSCs in the same HTTP request. Once page.tsx sets it, all subsequent Server Actions, fetches, and captures in the same request inherit the correct tags.

`SentryContextProvider` in layout writes to the same isolation scope, but may not run before page.tsx starts.

```tsx
// page.tsx (Server Component)
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function ProductPage(props) {
  setGlobalSentryContext({ pageType: PAGE_TYPES.PDP, domain: BUSINESS_DOMAIN.PRODUCT });
  // ... rest of page
}
```

### Layout error boundary behavior

Layout errors bubble to the **parent** segment's `error.tsx` (not same-level). Since `setGlobalSentryContext` is called synchronously before any throw, isolation scope already has the correct tags — Sentry captures with full context.

---

## 3. Core Capture APIs

### captureStructuredError — primary API

Use for all errors that need Sentry reporting. Logs and reports in one call.

```ts
import { captureStructuredError, BUSINESS_DOMAIN, BusinessSeverity } from '@castlery/observability/server';

captureStructuredError(error, {
  domain: BUSINESS_DOMAIN.CART, // override or supplement global context
  severity: BusinessSeverity.MEDIUM, // auto-inferred from domain if omitted
  tags: { action_name: 'addToCart' }, // custom Sentry index tags
  fingerprint: ['cart-add-failed', sku], // issue grouping control
  extra: { productId, quantity }, // PII-filtered automatically
  skipSentry: false, // set true to log-only
});
```

If `domain` is omitted, it's auto-inherited from the current isolation scope (set by `setGlobalSentryContext` or `SentryContextProvider`).

**`severity` and `priority` are auto-inferred from `domain`** if not explicitly set — see [`alert-metrics.md`](alert-metrics.md) for the mapping table.

### withServerActionInstrumentation — Server Actions (throw path)

Wrap the action function. The wrapper catches errors, reports to Sentry with a span, and **always re-throws**.

```ts
import { withServerActionInstrumentation, BUSINESS_DOMAIN } from '@castlery/observability/server';

export const addToCartAction = withServerActionInstrumentation(
  async (productId: string, quantity: number) => {
    return await addToCart(productId, quantity);
  },
  {
    actionName: 'addToCartAction',
    monitoringContext: { domain: BUSINESS_DOMAIN.CART },
    recordSuccess: true, // breadcrumb on success (default: true)
  }
);
```

Use this when the action can throw and the caller handles the error.

### captureStructuredError in catch — graceful degradation path

When an action must return `{}` instead of throwing (callers expect an empty result on failure), use `captureStructuredError` inside the catch block. `withServerActionInstrumentation` always re-throws and cannot be used here.

```ts
export const fetchDyCampaigns = async (options) => {
  try {
    const res = await dyCampaignsFetcher(options);
    if (!res.ok) {
      captureStructuredError(new Error(`DY fetch failed: ${res.status}`), {
        // DY is third-party — domain not hardcoded here; caller may optionally pass it
        severity: BusinessSeverity.LOW,
        tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
        extra: { status: res.status },
      });
      return {};
    }
  } catch (err) {
    captureStructuredError(err as Error, { severity: BusinessSeverity.LOW });
    return {};
  }
};
```

### Domain shortcut functions

Convenience wrappers — good for the common case:

```ts
captureCartError(error, { extra: { cartId, sku } });
captureOrderError(error, { extra: { orderId } });
captureUserError(error, { extra: { action: 'login' } });
capturePaymentError(error, { extra: { transactionId } });
captureProductError(error, { extra: { productId } });
captureCheckoutError(error, { extra: { step } });
```

**Limitation**: first-gen wrappers currently forward `domain`, `extra`, `skipSentry`, `severity` only. If you need `tags` or `fingerprint`, call `captureStructuredError` directly.

---

## 4. addBreadcrumb

Record key steps before a potential error — helps reconstruct the operation path in Sentry.

```ts
import { addBreadcrumb } from '@castlery/observability/client'; // or /server

addBreadcrumb({
  message: 'Add to cart clicked',
  domain: BUSINESS_DOMAIN.CART, // optional, falls back to global context
  level: BusinessSeverity.LOW,
  data: { sku, quantity },
});
```

---

## 5. MonitoringContext Fields

All capture APIs accept `MonitoringContext`:

| Field         | Type                     | Description                                                  |
| ------------- | ------------------------ | ------------------------------------------------------------ |
| `domain`      | `BusinessDomain`         | Business domain — auto-inferred from page context if omitted |
| `pageType`    | `PageType`               | Page type — usually set via SentryContextProvider            |
| `severity`    | `BusinessSeverityLevel`  | Auto-inferred from domain if omitted                         |
| `priority`    | `BusinessPriorityLevel`  | Auto-inferred from domain if omitted                         |
| `tags`        | `Record<string, string>` | Custom Sentry index tags → `scope.setTags`                   |
| `fingerprint` | `string[]`               | Issue grouping → `scope.setFingerprint`                      |
| `extra`       | `Record<string, any>`    | Debug data, PII-filtered automatically                       |
| `skipSentry`  | `boolean`                | Log only, don't report to Sentry                             |
| `userId`      | `string`                 | Anonymous user ID (no email/PII)                             |
| `country`     | `string`                 | Country code                                                 |

**Migration rules — preserve field semantics:**

| Original bare Sentry call                                   | `captureStructuredError` equivalent                              |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `Sentry.withScope(s => { s.setTags({...}); ... })`          | `tags: { ... }`                                                  |
| `Sentry.withScope(s => { s.setFingerprint([...]); ... })`   | `fingerprint: [...]`                                             |
| `Sentry.captureException(e, { tags: {...}, extra: {...} })` | `tags: {...}` + `extra: {...}` — preserve both fields separately |
| `Sentry.captureException(e, { extra: {...} })`              | `extra: {...}`                                                   |

Do NOT flatten `tags` into `extra` when migrating — tags are indexed in Sentry (searchable, filterable in alert rules), extra is debug-only. Merging them silently breaks alert rule filters that depend on those tag values.

---

## 6. beforeSend Implementation

### Client (`apps/web/instrumentation-client.ts`)

Order is important:

1. Call `classifyErrorBucket` → write `event.tags.error_bucket` + `event.tags.bucket_confidence` **first**
2. Compute `isCriticalThirdParty` from `CRITICAL_THIRD_PARTY_PATTERNS` (DY, Algolia, Stripe, PayPal, CASA markers) — this flag bypasses non-critical third-party noise suppression and ensures these errors always reach Sentry
3. Run ~21 filter rules (can return `null` to drop event) — includes AbortError (rule #7), third-party noise, WebView bridge, mobile-specific, etc.; third-party drop rules are skipped when `isCriticalThirdParty` is true
4. Append global diagnostic tags: `userAgent`, `onlineStatus`, `hasOwnCode`
5. Append `browser` context
6. If event matches Casa markers, force `event.tags.domain = casa` for SC team routing

Business code does **not** need to implement bucketing — it's handled here automatically.

### Server (`apps/web/sentry.server.config.ts`)

Calls `classifyErrorBucketServer` → writes `error_bucket` + `bucket_confidence` tags. No filter rules (unlike client). All events that reach `beforeSend` are forwarded.

### Edge runtime (sentry.edge.config.ts)

**No `beforeSend`** — intentionally. Middleware is silent; errors from Edge runtime arrive in Sentry without `error_bucket` tag and cannot trigger alert rules. This is a known, accepted gap — do not add beforeSend to edge config.

---

## 7. withSentryContext

For cases where you need a temporary local scope override (e.g. in a loop processing multiple items):

```ts
import { withSentryContext } from '@castlery/observability/server';

withSentryContext({ domain: BUSINESS_DOMAIN.ORDER, tags: { orderId } }, () => {
  Sentry.captureException(error);
});
```

Uses `withScope` (not `withIsolationScope`) — forks current scope, applies only to captures inside the callback, does not pollute other requests. Do not change this to `withIsolationScope`.

---

## 8. Client Component Pattern (Redux Listener)

```ts
// Redux listener (browser only)
import { captureStructuredError, isExpectedBusinessError, addBreadcrumb } from '@castlery/observability/client';

startListening({
  matcher: mergeOrderErrorEvent,
  effect: async (action) => {
    addBreadcrumb({ message: 'Merge order failed', data: { orderNumber: action.payload?.number } });
    captureStructuredError(action.payload || new Error('Merge order failed'), {
      skipSentry: isExpectedBusinessError(action.payload),
      extra: { feature: 'order', event: 'merge_order_failed' },
    });
  },
});
```

Always use `@castlery/observability/client` in Redux listeners — they run in the browser.

---

## 9. Sentry Auto-Resolve

> See `AGENTS.md` § Sentry Auto-Resolve for the authoritative rules: `fixes ISSUE-ID` in **PR title and PR description only** (keyword `fixes`); do not put `fixes` in commit messages.

---

## References

- [`references/sentry-scenes.md`](references/sentry-scenes.md) — Full code examples for every scene (Layout, RSC page, Server Action, Client, API Route, Middleware)
- Context setters source: `libs/shared/observability/src/lib/sentry/contexts/context-setters.ts`
- Capture source: `libs/shared/observability/src/lib/sentry/capture/capture-error.ts`
- Server action wrapper: `libs/shared/observability/src/lib/sentry/tracing/server-action-wrapper.ts`
- Server config: `apps/web/sentry.server.config.ts`
- For domain/severity/alert definitions → see [`alert-metrics.md`](alert-metrics.md)
- For logger, PII, noise control → see [`logger.md`](logger.md)

---

## See Also (Human-facing docs)

- [`docs/observability/error-handling-flow.md`](../../observability/error-handling-flow.md) — 各场景错误处理流程（中文，面向开发者）
- [`docs/observability/sentry-issue-routing-guide.md`](../../observability/sentry-issue-routing-guide.md) — domain 标签打法教程（中文，面向开发者）
