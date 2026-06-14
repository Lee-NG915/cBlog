# Sentry Practices — Per-Scene Code Examples

## Layout (synchronous, Server Component)

```tsx
// app/[deviceTheme]/[region]/[locale]/(PLP)/layout.tsx
import { SentryContextProvider } from '@castlery/observability/client';
import { PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default function PLPLayout({ children }: { children: React.ReactNode }) {
  return (
    <SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.SEARCH}>
      {children}
    </SentryContextProvider>
  );
}
```

---

## Async Layout (with 500-prone await)

```tsx
// app/[deviceTheme]/[region]/[locale]/(shop-the-look)/shop-the-look/layout.tsx
import { SentryContextProvider } from '@castlery/observability/client';
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN } from '@castlery/observability/server';

export default async function ShopTheLookLayout({ children }: { children: React.ReactNode }) {
  // REQUIRED before first await: if this throws, Sentry captures with correct tags
  setGlobalSentryContext({ pageType: PAGE_TYPES.OTHER, domain: BUSINESS_DOMAIN.CMS });

  const data = await sbApiClient.getSpecificPageWithoutCache(fullSlug); // can throw 500
  return (
    <SentryContextProvider pageType={PAGE_TYPES.OTHER} domain={BUSINESS_DOMAIN.CMS}>
      {/* children */}
    </SentryContextProvider>
  );
}
```

---

## RSC Page — Context Injection

```tsx
// app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx
import { setGlobalSentryContext, PAGE_TYPES, BUSINESS_DOMAIN, logger } from '@castlery/observability/server';

export default async function ProductPage(props: any) {
  // Always call in page.tsx — layout execution order is not guaranteed
  setGlobalSentryContext({ pageType: PAGE_TYPES.PDP, domain: BUSINESS_DOMAIN.PRODUCT });

  // All subsequent Server Actions and fetches in this request inherit these tags
  return /* JSX */;
}
```

---

## Server Action — Throw Path

```ts
// actions/cart.ts
import { withServerActionInstrumentation, BUSINESS_DOMAIN, BusinessSeverity } from '@castlery/observability/server';

export const addToCartAction = withServerActionInstrumentation(
  async (productId: string, quantity: number) => {
    return await addToCart(productId, quantity);
  },
  {
    actionName: 'addToCartAction',
    monitoringContext: { domain: BUSINESS_DOMAIN.CART },
  }
);

// Login — higher severity
export const loginAction = withServerActionInstrumentation(
  async (formData: FormData) => {
    return await loginHandler(formData.get('email') as string, formData.get('password') as string);
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

---

## Server Action — Graceful Degradation (return {} on failure)

```ts
// actions/dy.action.ts
import { captureStructuredError, BusinessSeverity } from '@castlery/observability/server';

export const fetchDyCampaigns = async (options: CampaignsRequestOptions) => {
  try {
    const res = await dyCampaignsFetcher(options, { cookies });
    if (!res.ok) {
      captureStructuredError(new Error(`DY fetch failed: ${res.status}`), {
        // DY is third-party — domain not hardcoded; caller may optionally pass it
        severity: BusinessSeverity.LOW,
        tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
        extra: { status: res.status },
      });
      return {};
    }
    return await res.json();
  } catch (err) {
    captureStructuredError(err as Error, {
      severity: BusinessSeverity.LOW,
      tags: { action_name: 'fetchDyCampaigns', action_type: 'server_action' },
    });
    return {};
  }
};
```

---

## Client Component

```tsx
'use client';
import { captureStructuredError, addBreadcrumb, BUSINESS_DOMAIN } from '@castlery/observability/client';

function AddToCartButton({ sku }: { sku: string }) {
  const handleClick = async () => {
    addBreadcrumb({ message: 'Add to cart clicked', data: { sku } });
    try {
      await addToCart(sku);
    } catch (error) {
      captureStructuredError(error, {
        // domain inherited from global context (set by page.tsx/layout)
        extra: { sku },
      });
    }
  };
  return <button onClick={handleClick}>Add to cart</button>;
}
```

---

## API Route

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

---

## Redux Listener (Client)

```ts
// libs/modules/order/services/src/order.listener.ts
import { captureStructuredError, isExpectedBusinessError, addBreadcrumb } from '@castlery/observability/client';

startListening({
  matcher: mergeOrderErrorEvent,
  effect: async (action) => {
    addBreadcrumb({
      message: 'Merge order failed',
      data: { orderNumber: action.payload?.number },
    });
    captureStructuredError(action.payload || new Error('Merge order failed'), {
      skipSentry: isExpectedBusinessError(action.payload),
      extra: { feature: 'order', event: 'merge_order_failed' },
    });
  },
});
```

---

## Middleware (logger only)

```ts
// middleware.ts
import { logger } from '@castlery/observability/server';

export function middleware(request: NextRequest) {
  logger.info('Middleware request', { path: request.nextUrl.pathname });
  // Do NOT call withServerActionInstrumentation, withFetchSpan, or Sentry.captureException
  // Edge runtime does not support these tracing APIs
  // Middleware is intentionally silent for Sentry reporting
}
```

---

## Non-Error Sentry Tracking (Structured Message)

```ts
import { sendOrderMessage, captureStructuredMessage, BUSINESS_DOMAIN } from '@castlery/observability/server';

// Domain shortcut
sendOrderMessage('Order status transition unexpected', {
  severity: 'warning',
  extra: { orderId: '123', fromStatus: 'confirmed', toStatus: 'failed' },
});

// Full control (when you need tags or fingerprint)
captureStructuredMessage('Payment callback received unknown status', {
  domain: BUSINESS_DOMAIN.PAYMENT,
  severity: 'warning',
  tags: { callback_source: 'stripe' },
  fingerprint: ['payment-callback-unknown', callbackStatus],
  extra: { orderId, callbackStatus },
});
```
