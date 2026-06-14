# Tracking Services Module

A comprehensive tracking library for managing analytics events across multiple platforms (Google Analytics, Facebook, Pinterest, DY, Klaviyo) in the Castlery e-commerce application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Available Events](#available-events)
- [Usage Examples](#usage-examples)
- [Integration Patterns](#integration-patterns)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Development](#development)

## Overview

The `@castlery/modules-tracking-services` module provides a centralized, Redux-based tracking system that:

- **Multi-Platform Support**: Integrates with GA4, Facebook CAPI, Pinterest CAPI, Dynamic Yield, and Klaviyo
- **Type-Safe**: Full TypeScript support with defined event types
- **Redux Integration**: Uses Redux Toolkit's `createAsyncThunk` for consistent async tracking
- **Modular Architecture**: Organized into triggers, listeners, helpers, and utilities
- **Event Orchestration**: Single tracking call can trigger multiple platform events
- **Server/Client Support**: Works in both server and client environments

### Key Features

✅ **40+ Pre-built Events** covering e-commerce workflows  
✅ **Automatic Multi-Platform Dispatch** (one call triggers GA, FB, Pinterest, etc.)  
✅ **Redux State Integration** (automatic access to user, cart, product state)  
✅ **Event Listeners** for automated tracking based on Redux actions  
✅ **Debug Support** with cookie-based debugging utilities

---

## Architecture

### Directory Structure

```
tracking/services/
├── src/
│   ├── index.ts                    # Public exports
│   └── lib/
│       ├── events/                 # Event constant mappings by channel
│       ├── events-map.ts           # Deprecated compatibility re-export
│       ├── events-name/            # Platform-specific event names
│       │   ├── ga-events-name.ts
│       │   ├── facebook-events-name.ts
│       │   ├── dy-events-name.ts
│       │   ├── klaviyo-events-name.ts
│       │   └── pinterest-events-name.ts
│       ├── helpers/                # Data transformation helpers
│       │   ├── product.helper.ts
│       │   ├── order.helper.ts
│       │   ├── client-user-helper.ts
│       │   └── page-view.helper.ts
│       ├── listeners/              # Redux action listeners
│       │   └── tracking.listener.ts
│       ├── triggers/               # Event trigger implementations
│       │   ├── product-events.trigger.ts
│       │   ├── cart-events.trigger.ts
│       │   ├── checkout.trigger.ts
│       │   ├── page-view.trigger.ts
│       │   ├── dy-events.trigger.ts
│       │   ├── fb-capi-events.trigger.ts
│       │   ├── pinterest-capi-events.trigger.ts
│       │   └── klaviyo-events.trigger.ts
│       └── utils/                  # Platform-specific utilities
│           ├── ga.util.ts
│           ├── facebook.util.ts
│           ├── dy.util.ts
│           ├── pinterest.util.ts
│           └── klaviyo.util.ts
```

### Component Roles

1. **Triggers** (`triggers/`): Redux async thunks that dispatch tracking events
2. **Listeners** (`listeners/`): Redux middleware that auto-tracks based on state changes
3. **Helpers** (`helpers/`): Transform Redux state into tracking payload formats
4. **Utils** (`utils/`): Low-level platform SDK wrappers
5. **Event Names** (`events-name/`): Centralized event name constants per platform

---

## Installation

This module is part of the Nx monorepo. Import it using the Nx path alias:

```typescript
import { EVENT_ADD_TO_CART, EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
```

---

## Quick Start

### Basic Event Tracking

```tsx
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_ADD_TO_CART } from '@castlery/modules-tracking-services';

export function ProductCard({ product }) {
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    // Your business logic
    const result = await addToCart(product);

    // Track the event
    await dispatch(
      EVENT_ADD_TO_CART({
        trackedProduct: {
          id: product.sku,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
        cartLineItems: result.lineItems,
        qtyIncrements: 1,
        itemTotal: result.total,
      })
    );
  };

  return <Button onClick={handleAddToCart}>Add to Cart</Button>;
}
```

### Page View Tracking

```tsx
import { useEffect } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

export function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      EVENT_COMMON_PAGE_VIEW({
        pageName: WEB_PAGE_NAMES.HOME_PAGE,
      })
    );
  }, [dispatch]);

  return <div>Home Page Content</div>;
}
```

---

## Core Concepts

### 1. Event Triggers

Event triggers are Redux async thunks created with `createAsyncThunk`. They:

- Accept event-specific payload
- Access Redux state automatically via `getState()`
- Dispatch to multiple platforms in parallel
- Return success/error messages

**Example Structure:**

```typescript
export const trackAddToCartEvent = createAsyncThunk(
  'tracking/trackAddToCartEvent',
  async (payload, { dispatch, getState, fulfillWithValue }) => {
    const state = getState() as RootState;
    const customer = selectedActiveUser(state);

    // 1. Track to Google Analytics
    gaTrack({ event: 'add_to_cart', ... });

    // 2. Track to Facebook
    await dispatch(trackFacebookAddToCartEvent({ ... }));

    // 3. Track to DY
    await dispatch(trackDYAddToCartEvent({ ... }));

    return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
  }
);
```

### 2. Event Listeners

Listeners automatically trigger tracking based on Redux actions:

```typescript
startListening({
  matcher: isAnyOf(webAddedToCartEvent, webSignedUpEvent),
  effect: async (action, { dispatch }) => {
    // Automatically track when user adds to cart AND signs up
    await dispatch(EVENT_FB_CAPI_CUSTOM_ACT_WITH_SIGNUP());
  },
});
```

**Setup in App:**

```typescript
import { setupTrackingListeners } from '@castlery/modules-tracking-services';

// In your Redux store setup
const unsubscribe = setupTrackingListeners(listenerMiddleware.startListening);
```

### 3. Helpers

Helpers transform Redux state into tracking-ready formats:

```typescript
import { getProductNeedTracking } from '@castlery/modules-tracking-services';

const trackedProduct = getProductNeedTracking({
  product,
  variant,
  quantity: 1,
  order,
});
// Returns: { id, name, price, brand, category, ... }
```

### 4. Platform Utilities

Low-level utilities for each platform:

```typescript
// Google Analytics
gaTrack({ event: 'page_view', page_title: 'Home' });

// Dynamic Yield
dyTrack('Add to Cart', { productId: '123' });

// Facebook CAPI
facebookTrack('AddToCart', { contents: [...] });
```

---

## Available Events

### Product Events

| Event Constant                 | Description                   | Platforms             |
| ------------------------------ | ----------------------------- | --------------------- |
| `EVENT_VIEW_ITEM`              | Product detail view           | GA, FB, Pinterest, DY |
| `EVENT_PDP_IMAGE_IMPRESSION`   | PDP image viewed              | GA                    |
| `EVENT_PDP_DETAILS`            | Product details expanded      | GA                    |
| `EVENT_PDP_CONFIGURATION`      | Product configuration changed | GA                    |
| `EVENT_PDP_PAGE_VIEW`          | Product page view (legacy)    | GA, FB                |
| `EVENT_PLP_PRODUCT_IMPRESSION` | Product listed impression     | GA, DY                |
| `EVENT_PLP_PRODUCT_CLICK`      | Product clicked from list     | GA, DY                |

### Cart Events

| Event Constant           | Description             | Platforms                      |
| ------------------------ | ----------------------- | ------------------------------ |
| `EVENT_ADD_TO_CART`      | Item added to cart      | GA, FB, Pinterest, DY, Klaviyo |
| `EVENT_REMOVE_FROM_CART` | Item removed from cart  | GA                             |
| `EVENT_CART_ACTION`      | Cart page interactions  | GA                             |
| `EVENT_DY_ADD_TO_CART`   | DY-specific add to cart | DY                             |

### Checkout Events

| Event Constant          | Description              | Platforms         |
| ----------------------- | ------------------------ | ----------------- |
| `EVENT_CHECKOUT_ACTION` | Checkout step completion | GA, FB, Pinterest |

### User Events

| Event Constant            | Description             | Platforms       |
| ------------------------- | ----------------------- | --------------- |
| `EVENT_IDENTIFY`          | User identified         | GA, DY, Klaviyo |
| `EVENT_CUSTOMER_IDENTIFY` | Customer identification | GA              |
| `EVENT_DY_SIGNUP`         | User signup             | DY              |
| `EVENT_DY_LOGIN`          | User login              | DY              |

### Page View Events

| Event Constant                        | Description          | Platforms     |
| ------------------------------------- | -------------------- | ------------- |
| `EVENT_COMMON_PAGE_VIEW`              | Generic page view    | GA, Pinterest |
| `EVENT_PAGE_VIEW_AFTER_AUTH_BY_MODAL` | Post-login page view | GA            |

### DY-Specific Events

| Event Constant                                 | Description               |
| ---------------------------------------------- | ------------------------- |
| `EVENT_DY_KEYWORD_SEARCH`                      | Search performed          |
| `EVENT_DY_FILTER_ITEMS`                        | Filters applied           |
| `EVENT_DY_ADD_TO_WISHLIST`                     | Item added to wishlist    |
| `EVENT_DY_PURCHASE`                            | Purchase completed        |
| `EVENT_DY_PROMO_CODE_ENTERED`                  | Promo code applied        |
| `EVENT_DY_NEWSLETTER_SUBSCRIPTION`             | Newsletter signup         |
| `EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT`      | DY recommendation clicked |
| `EVENT_DY_API_CUSTOM_CODE_CAMPAIGN_ENGAGEMENT` | DY campaign interaction   |

### Other Events

| Event Constant                  | Description              | Platforms   |
| ------------------------------- | ------------------------ | ----------- |
| `EVENT_ADD_TO_WISHLIST`         | Add to wishlist          | GA          |
| `EVENT_FORM_SUBMIT`             | Form submission          | GA          |
| `EVENT_NEWSLETTER_SUBSCRIPTION` | Newsletter signup        | GA, Klaviyo |
| `EVENT_SHIPPING_SELECTOR`       | Shipping option selected | GA          |
| `EVENT_GENERAL_LINK_CLICK`      | Generic link click       | GA          |
| `EVENT_STORYBLOK`               | CMS interaction          | GA          |

---

## Usage Examples

### Example 1: Product Listing Page (PLP) Impressions

```tsx
import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PLP_PRODUCT_IMPRESSION } from '@castlery/modules-tracking-services';

export function ProductGrid({ products, variants, pageName }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Track impressions when products are loaded and visible
    const impressionList = products.map((product, index) => ({
      product,
      variant: variants[index],
      page: pageName,
    }));

    dispatch(
      EVENT_PLP_PRODUCT_IMPRESSION({
        list: impressionList,
      })
    );
  }, [dispatch, products, variants, pageName]);

  return (
    <div>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} variant={variants[index]} />
      ))}
    </div>
  );
}
```

### Example 2: Search Tracking

```tsx
import { useState } from 'react';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_DY_KEYWORD_SEARCH } from '@castlery/modules-tracking-services';

export function SearchBar() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    // Perform search
    const results = await searchProducts(query);

    // Track search event
    await dispatch(
      EVENT_DY_KEYWORD_SEARCH({
        keywords: query,
        resultsCount: results.length,
      })
    );
  };

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
    />
  );
}
```

### Example 3: Checkout Flow

Checkout funnel steps follow the declarative event pattern: the UI dispatches
a checkout-domain interaction event, and `checkout-tracking.listener` forwards
it to `EVENT_CHECKOUT_ACTION` (alias of `trackCheckoutActionEvent`). The
trigger payload is a discriminated union by `checkoutStep`, so each step only
accepts its required fields.

```tsx
import { useAppDispatch } from '@castlery/shared-redux-store';
import {
  checkoutShippingAddressStepCompletedEvent,
  checkoutShippingMethodStepCompletedEvent,
  checkoutPaymentMethodSelectedForFunnelEvent,
} from '@castlery/modules-checkout-domain';

export function CheckoutSteps() {
  const dispatch = useAppDispatch();

  // Step 2: shipping address completed
  const onAddressDone = () => dispatch(checkoutShippingAddressStepCompletedEvent());

  // Step 4: shipping method completed — `option` is the GA value (SG =
  // assemblyPreference / non-SG = selectedServiceType), resolved upstream.
  const onMethodDone = (option: string) => dispatch(checkoutShippingMethodStepCompletedEvent({ option }));

  // Step 5: payment method selected for the checkout funnel.
  const onPaymentSelected = (option: string) => dispatch(checkoutPaymentMethodSelectedForFunnelEvent({ option }));

  return (
    <CheckoutWizard onAddressDone={onAddressDone} onMethodDone={onMethodDone} onPaymentSelected={onPaymentSelected} />
  );
}
```

Step 1 (cart → checkout entry) is fired centrally by `tracking.listener` when
it observes the cart-domain `webInitiatedCheckoutEvent`, so UI components do
not dispatch it directly.

### Example 4: User Identification

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { EVENT_IDENTIFY } from '@castlery/modules-tracking-services';
import { selectedActiveUser } from '@castlery/modules-user-domain';

export function UserTracker() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectedActiveUser);

  useEffect(() => {
    if (user) {
      dispatch(
        EVENT_IDENTIFY({
          userId: user.id,
          email: user.email,
          traits: {
            name: user.name,
            phone: user.phone,
          },
        })
      );
    }
  }, [dispatch, user]);

  return null;
}
```

### Example 5: PLP Product Click with DY Tracking

```tsx
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_PLP_PRODUCT_CLICK } from '@castlery/modules-tracking-services';

export function ProductCard({ product, variant, page }) {
  const dispatch = useAppDispatch();

  const handleProductClick = async () => {
    // This event automatically handles:
    // 1. GA tracking for product click
    // 2. DY engagement reporting if product has dyTracking.slotId
    await dispatch(
      EVENT_PLP_PRODUCT_CLICK({
        product, // Must include product.dyTracking.slotId if from DY
        variant,
        page,
      })
    );
  };

  return <Card onClick={handleProductClick}>{/* Product details */}</Card>;
}
```

### Example 6: DY Campaign Engagement

```tsx
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT } from '@castlery/modules-tracking-services';
import { useGetDyCampaignsQuery } from '@castlery/modules-dy-domain';

export function RecommendationCarousel({ campaignName }) {
  const dispatch = useAppDispatch();

  // Fetch DY campaign recommendations
  const campaign = useGetDyCampaignsQuery({
    campaignNames: [campaignName],
  });

  const products = campaign?.currentData?.choices?.[0]?.variations?.[0]?.payload?.data?.slots || [];

  const handleProductClick = (product) => {
    // Report engagement to DY using the slotId from the product
    dispatch(
      EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT({
        slotId: product.slotId,
      })
    );
  };

  return (
    <Carousel>
      {products.map((product) => (
        <ProductCard key={product.sku} product={product.productData} onClick={() => handleProductClick(product)} />
      ))}
    </Carousel>
  );
}
```

---

## Integration Patterns

### Pattern 1: Component-Level Tracking

For UI interactions that need immediate tracking:

```tsx
const handleClick = async () => {
  await businessLogic();
  await dispatch(trackingEvent(payload));
};
```

### Pattern 2: Effect-Based Tracking

For automatic tracking on component mount or state changes:

```tsx
useEffect(() => {
  dispatch(EVENT_COMMON_PAGE_VIEW({ pageName: 'Home' }));
}, []);
```

### Pattern 3: Listener-Based Tracking

For tracking that responds to Redux actions:

```typescript
// In tracking.listener.ts
startListening({
  matcher: isAnyOf(orderCompletedAction),
  effect: async (action, { dispatch }) => {
    await dispatch(EVENT_DY_PURCHASE(action.payload));
  },
});
```

### Pattern 4: Multi-Platform Orchestration

Single trigger dispatches to all platforms:

```typescript
export const trackAddToCartEvent = createAsyncThunk('tracking/trackAddToCartEvent', async (payload, { dispatch }) => {
  // Parallel dispatch to all platforms
  await Promise.all([
    dispatch(trackFacebookAddToCartEvent(payload)),
    dispatch(trackPinterestAddToCartEvent(payload)),
    dispatch(trackDYAddToCartEvent(payload)),
    dispatch(trackKlaviyoAddedToCartEvent(payload)),
  ]);
});
```

---

## Best Practices

### ✅ Do's

1. **Always use `await`** when dispatching tracking events to handle errors
2. **Use helpers** to transform data: `getProductNeedTracking()`, `getPageViewParams()`
3. **Check payload validity** before tracking
4. **Use event constants** from channel files in `events/` instead of hardcoded strings
5. **Track user actions after business logic succeeds**
6. **Use unique eventIds** with `getEventRandomId()` for deduplication

### ❌ Don'ts

1. **Don't block UI** waiting for tracking responses (use fire-and-forget pattern)
2. **Don't track PII** (use hashed emails/phones from user state)
3. **Don't track in SSR** unless necessary (check `typeof window !== 'undefined'`)
4. **Don't duplicate tracking** (check if event already tracked)
5. **Don't track during development** (use debug cookies to control)

### Error Handling

Always wrap tracking in try-catch:

```typescript
try {
  await dispatch(trackingEvent(payload));
} catch (error) {
  logger.error('Tracking failed', { error });
  // Don't fail the user flow due to tracking errors
}
```

### Performance Tips

1. **Debounce rapid-fire events** (e.g., scroll-based impressions)
2. **Use IntersectionObserver** for impression tracking
3. **Batch similar events** when possible
4. **Lazy-load tracking on interaction** for non-critical pages

---

## API Reference

### Event Trigger Signature

All event triggers follow this pattern:

```typescript
createAsyncThunk('tracking/eventName', async (payload: EventPayload, { dispatch, getState, fulfillWithValue }) => {
  // Implementation
  return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
});
```

### Common Payload Types

```typescript
// Product tracking payload
type ProductTrackingPayload = {
  id: string; // SKU
  name: string;
  price: number;
  quantity: number;
  brand?: string;
  category?: string;
  variant?: string;
};

// Page view payload
type PageViewPayload = {
  pageName: string;
  pageVariant?: string;
  pageContent?: string;
  pageProduct?: string;
};

// Cart event payload
type CartEventPayload = {
  trackedProduct: ProductTrackingPayload;
  cartLineItems: LineItem[];
  qtyIncrements: number;
  itemTotal: string;
};

// DY recommendations engagement payload
type DYRecommendationsEngagementPayload = {
  slotId: string; // The slot ID from DY API response
};

// DY custom code campaign engagement payload
type DYCustomCodeCampaignEngagementPayload = {
  engagementType: 'IMP' | 'CLICK';
  decisionId: string;
  variations?: number[];
};
```

### Utility Functions

```typescript
// Get random event ID for deduplication
getEventRandomId(eventName?: string): string;

// Get user city from storage
getUserCity(): string | null;

// Get GA pseudo ID
getGaPerSudoId(): string | null;

// Transform product for tracking
getProductNeedTracking(params: {
  product: Product;
  variant: Variant;
  quantity: number;
  order?: Order;
}): ProductTrackingPayload;

// Get page view parameters
getPageViewParams(params: {
  pathname: string;
  pageName: string;
  pageVariant?: string;
  customer?: User;
  order?: Order;
  product?: Product;
  variant?: Variant;
}): PageViewPayload;
```

---

## Development

### Building

```bash
nx build modules-tracking-services
```

### Running Tests

```bash
nx test modules-tracking-services
```

### Debugging

Enable tracking debug mode using cookies:

```javascript
// In browser console
document.cookie = 'debug_tracking=true';
```

This will log all tracking events to the console.

### Adding New Events

1. **Define event name** in `events-name/{platform}-events-name.ts`
2. **Create trigger** in `triggers/your-event.trigger.ts`
3. **Export event** in the matching channel file under `events/`
4. **Add helper** (if needed) in `helpers/`
5. **Update this README** with the new event

Example:

```typescript
// 1. events-name/ga-events-name.ts
export const GA_NEW_EVENT = 'new_event';

// 2. triggers/new-event.trigger.ts
export const trackNewEvent = createAsyncThunk('tracking/trackNewEvent', async (payload, { getState }) => {
  gaTrack({ event: GA_NEW_EVENT, ...payload });
});

// 3. events/ga.events.ts
export { trackNewEvent as EVENT_NEW_EVENT } from '../triggers/new-event.trigger';
```

---

## Related Modules

- **[@castlery/data-tracking-events](../../../shared/data-tracking-events/)**: Core tracking event types
- **[@castlery/shared-redux-store](../../../shared/redux/)**: Redux store configuration
- **[@castlery/modules-user-domain](../../user/domain/)**: User state management
- **[@castlery/modules-order-domain](../../order/domain/)**: Order/cart state management
- **[@castlery/modules-product-domain](../../product/domain/)**: Product state management

---

## Troubleshooting

### Events not firing

1. Check if tracking is enabled in your environment
2. Verify platform SDKs are loaded (GA, FB pixel, etc.)
3. Check browser console for errors
4. Enable debug mode with `debug_tracking=true` cookie

### Multiple events firing

1. Check for duplicate effect hooks
2. Verify event listeners are not set up multiple times
3. Use `useRef` to track already-fired events

### Wrong data in events

1. Verify Redux state is populated before tracking
2. Check helper functions return expected format
3. Validate payload matches platform requirements

---

## Contributing

When adding new tracking events:

1. Follow existing naming conventions
2. Add TypeScript types for all payloads
3. Include error handling
4. Update documentation
5. Add tests

---

## License

Private - Castlery Internal Use Only
