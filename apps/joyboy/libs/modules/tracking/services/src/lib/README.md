# Tracking Service Internal Documentation

> **Note**: For complete documentation, see the [main README](../../../README.md) in the module root.

## Architecture Overview

This directory contains the internal implementation of the tracking service module.

### Directory Structure

```
lib/
├── events/                 # Public event constant exports by channel
├── events-map.ts           # Deprecated compatibility re-export
├── events-name/            # Platform-specific event name constants
├── helpers/                # Data transformation helpers
├── listeners/              # Redux middleware listeners
├── triggers/               # Event trigger implementations
└── utils/                  # Platform SDK wrappers
```

## Implementation Guidelines

### Adding a New Event Trigger

1. **Choose the appropriate trigger file** based on event category:

   - `product-events.trigger.ts` - Product interactions
   - `cart-events.trigger.ts` - Cart operations
   - `checkout.trigger.ts` - Checkout flow
   - `page-view.trigger.ts` - Page navigation
   - `dy-events.trigger.ts` - DY-specific events
   - `fb-capi-events.trigger.ts` - Facebook CAPI events
   - `klaviyo-events.trigger.ts` - Klaviyo events

2. **Create the async thunk**:

```typescript
export const trackNewEvent = createAsyncThunk(
  'tracking/trackNewEvent',
  async (payload: YourPayloadType, { dispatch, getState, fulfillWithValue }) => {
    // Validate payload
    if (!payload.requiredField) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }

    try {
      const state = getState() as RootState;
      const customer = selectedActiveUser(state);
      const eventId = getEventRandomId('NewEvent');

      // 1. Track to primary platform (usually GA)
      gaTrack({
        event: EVENTS_NAMES_MAP.GA_NEW_EVENT,
        eventId,
        ...transformedPayload,
      });

      // 2. Track to other platforms
      await dispatch(trackFacebookNewEvent({ eventId, ...payload }));
      await dispatch(trackDYNewEvent({ ...payload }));

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackNewEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
```

3. **Export in the matching channel file under `events/`**:

```typescript
export { trackNewEvent as EVENT_NEW_EVENT } from '../triggers/new-event.trigger';
```

### Helper Functions

Helpers transform Redux state into tracking-ready formats. Add new helpers to the appropriate file:

- `product.helper.ts` - Product data transformation
- `order.helper.ts` - Order/cart data transformation
- `client-user-helper.ts` - User data formatting
- `page-view.helper.ts` - Page view data assembly

**Example Helper**:

```typescript
export function getProductNeedTracking({
  product,
  variant,
  quantity,
  order,
}: {
  product: Product;
  variant: Variant;
  quantity: number;
  order?: Order;
}) {
  return {
    id: variant.sku,
    name: product.name,
    price: getOriginalAmount(Number(variant.price)),
    quantity,
    brand: 'Castlery',
    category: product.taxons?.[0]?.name || '',
    // ... more fields
  };
}
```

### Platform Utilities

Low-level utilities wrap platform SDKs. Add platform-specific logic to:

- `ga.util.ts` - Google Analytics
- `facebook.util.ts` - Facebook Pixel/CAPI
- `dy.util.ts` - Dynamic Yield
- `klaviyo.util.ts` - Klaviyo
- `pinterest.util.ts` - Pinterest

**Example Utility**:

```typescript
// ga.util.ts
export function gaTrack(params: Record<string, any>) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(params);

  if (isDebugMode()) {
    console.log('[GA Track]', params);
  }
}
```

### Event Listeners

Add Redux action listeners to `listeners/tracking.listener.ts` for automatic tracking:

```typescript
export function setupTrackingListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    // Listen for specific Redux actions
    startListening({
      matcher: isAnyOf(orderCompletedAction, orderUpdatedAction),
      effect: async (action, { dispatch }) => {
        await dispatch(EVENT_DY_PURCHASE(action.payload));
      },
    }),

    // Add more listeners here
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
```

## Code Standards

### TypeScript Types

Always define payload types:

```typescript
type AddToCartPayload = {
  trackedProduct: ReturnType<typeof getProductNeedTracking>;
  cartLineItems: LineItem[];
  qtyIncrements: number;
  itemTotal: string;
  atcType?: 'regular' | '1click';
};

export const trackAddToCartEvent = createAsyncThunk(
  'tracking/trackAddToCartEvent',
  async (payload: AddToCartPayload, thunkAPI) => {
    // Implementation
  }
);
```

### Error Handling

Always include try-catch and logging:

```typescript
try {
  // Tracking logic
  return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
} catch (error) {
  logger.error('trackEvent failed', { error, payload });
  return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
}
```

### Async Patterns

Use `await` for cross-platform dependencies:

```typescript
// Sequential (when order matters)
const eventId = getEventRandomId();
gaTrack({ eventId, ... });
await dispatch(trackFacebookEvent({ eventId, ... })); // Uses same eventId

// Parallel (when independent)
await Promise.all([
  dispatch(trackDYEvent({ ... })),
  dispatch(trackKlaviyoEvent({ ... }))
]);
```

## Testing Checklist

When implementing new tracking:

- [ ] Payload validation
- [ ] Redux state access
- [ ] Multi-platform dispatch
- [ ] Error handling
- [ ] Event ID generation (for deduplication)
- [ ] SSR safety check (`typeof window !== 'undefined'`)
- [ ] Debug logging
- [ ] TypeScript types
- [ ] Export in the matching channel file under `events/`
- [ ] Documentation updated

## Quick Usage Example

```tsx
import { EVENT_DY_KEYWORD_SEARCH } from '@castlery/modules-tracking-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

export function SearchComponent() {
  const dispatch = useAppDispatch();

  const handleSearch = async (keywords: string) => {
    // Business logic
    const results = await searchProducts(keywords);

    // Tracking
    await dispatch(
      EVENT_DY_KEYWORD_SEARCH({
        keywords,
        resultsCount: results.length,
      })
    );
  };

  return <SearchInput onSearch={handleSearch} />;
}
```

## Common Patterns

### Pattern: Product Event with Multi-Platform Support

```typescript
export const trackProductEvent = createAsyncThunk(
  'tracking/trackProductEvent',
  async (payload, { dispatch, getState }) => {
    const state = getState() as RootState;
    const product = selectProduct(state);
    const eventId = getEventRandomId();

    // 1. GA (synchronous)
    gaTrack({ event: 'product_view', eventId, ...payload });

    // 2. Other platforms (async, parallel)
    await Promise.all([
      dispatch(trackFacebookProductEvent({ eventId, product })),
      dispatch(trackPinterestProductEvent({ eventId, product })),
      dispatch(trackDYProductEvent({ product })),
    ]);
  }
);
```

### Pattern: Conditional Tracking by Region

```typescript
import { accessInAU, accessInUS } from '@castlery/config';

if (accessInAU) {
  // Australia-specific tracking
  await dispatch(trackAustraliaEvent());
}

if (accessInUS) {
  // US-specific tracking
  await dispatch(trackUSEvent());
}
```

### Pattern: Deduplication with Event IDs

```typescript
const eventId = getEventRandomId('AddToCart');

// Both use the same eventId for deduplication
gaTrack({ event: 'add_to_cart', eventId, ... });
facebookTrack('AddToCart', { eventID: eventId, ... });
```

## Debugging

### Enable Debug Mode

```javascript
// Browser console
document.cookie = 'debug_tracking=true';
```

### Debug Utilities

```typescript
import { isDebugMode } from '../utils/debug-cookie.util';

if (isDebugMode()) {
  console.log('[Tracking Debug]', payload);
}
```

## Related Files

- **Main Documentation**: `../../../README.md`
- **Event Names Index**: `./events-name/index.ts`
- **Triggers Index**: `./triggers/index.ts`
- **Helpers Index**: `./helpers/index.ts`
- **Utils Index**: `./utils/index.ts`
