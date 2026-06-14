# Castlery.com Core Web Vitals — INP Issue Analysis

> **Date:** 2026-03-23
> **Issue:** INP (Interaction to Next Paint) > 200ms on mobile
> **Affected URLs:** ~5000+, trending upward since 2025-12

---

## Overview

INP measures the time from user interaction (tap, click, keypress) to the next visual update. Google considers INP > 200ms as "needs improvement" and > 500ms as "poor". Our site consistently exceeds 200ms across all major page types on mobile.

### Affected URL Trend

- 2025-12-23: 4,549 URLs
- 2026-01-30: 5,079 URLs (peak)
- 2026-02-07: 3,396 URLs (temporary dip)
- 2026-03-06: 5,167 URLs (new peak)
- 2026-03-21: 5,111 URLs (current)

---

## Affected Pages by Severity

| Page Type           | INP Range | Example URL                                 | Group Population |
| ------------------- | --------- | ------------------------------------------- | ---------------- |
| Furniture Sets      | **487ms** | `/uk/furniture-sets/all-furniture-sets`     | 11               |
| Sale/Clearance      | **431ms** | `/us/sale/furniture-clearance`              | 13               |
| PLP (All Sofas UK)  | **415ms** | `/uk/sofas/all-sofas`                       | 19               |
| Showroom (SG)       | **386ms** | `/sg/showroom`                              | 74               |
| PLP (All Sofas AU)  | **377ms** | `/au/sofas/all-sofas`                       | 34               |
| Armchairs (AU)      | **374ms** | `/au/chairs/armchairs`                      | 21               |
| Homepage (AU)       | **372ms** | `/au`                                       | 25               |
| Collection (Mori)   | **349ms** | `/sg/collections/mori-collection`           | 75               |
| PLP (All Sofas US)  | **338ms** | `/us/sofas/all-sofas`                       | 37               |
| Homepage (SG)       | **338ms** | `/sg`                                       | 114              |
| PDP (Sandy Plates)  | **312ms** | `/sg/products/sandy-dinner-plates-set-of-4` | 941              |
| Homepage (US)       | **276ms** | `/us`                                       | 77               |
| Help Center         | **245ms** | `/au/help-center`                           | 373              |
| PDP (Bradley Table) | **234ms** | `/au/products/bradley-square-coffee-table`  | 993              |

---

## Root Cause Analysis

### P0 — Critical (Fix First, Highest ROI)

#### 1. GTM loaded with `strategy="beforeInteractive"`

**File:** `libs/modules/tracking/components/src/lib/gtm-tag/gtm-tag.tsx`

```tsx
<Script id={`gtm-${id}`} strategy="beforeInteractive" ... />
<Script id={`default-consent-${id}`} strategy="beforeInteractive" ... />
```

**Impact:** All pages. Estimated +50–200ms INP on slow mobile devices.

`strategy="beforeInteractive"` causes GTM to execute synchronously on the main thread before React hydration. Any user tap during or immediately after hydration is blocked by GTM initialization.

**Fix:** Change to `strategy="afterInteractive"`. Push consent defaults to dataLayer using a small inline script before GTM loads.

---

#### 2. `useBreakpoints` registers 5 MediaQuery listeners per call

**File:** `libs/fortress/src/hooks/useBreakpoints/useBreakpoints.ts`

```ts
const xs = useMediaQuery((theme) => theme.breakpoints.between('xs', 'sm'));
const sm = useMediaQuery((theme) => theme.breakpoints.between('sm', 'md'));
const md = useMediaQuery((theme) => theme.breakpoints.between('md', 'lg'));
const lg = useMediaQuery((theme) => theme.breakpoints.between('lg', 'xl'));
const xl = useMediaQuery((theme) => theme.breakpoints.up('xl'));
// desktop, mobile, tablet are derived aliases, not additional useMediaQuery calls
const desktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
```

**Impact:** All pages, worst on PLP. A PLP page with 24 product cards × ~3 sub-components = **360+ active media query listeners** (5 per call).

Every component instance registers its own set of 5 listeners via MUI's `useMediaQuery`. On interaction, React synchronously processes state updates across all subscribed components.

**Fix:** Create a single `BreakpointProvider` at the app root. All components consume breakpoints via `useContext` instead of registering individual listeners.

```tsx
// One provider, one set of listeners
const BreakpointContext = React.createContext<Breakpoints>({...});

export function BreakpointProvider({ children }) {
  const desktop = useMediaQuery(theme => theme.breakpoints.up('md'));
  // ... 5 queries total for the entire app
  return (
    <BreakpointContext.Provider value={{ desktop, ... }}>
      {children}
    </BreakpointContext.Provider>
  );
}

// In components — no new listeners
const { desktop } = useContext(BreakpointContext);
```

---

#### 3. Gladly Chat — setInterval polling on main thread

**Files:**

- `libs/shared/components/src/lib/gladly-box/gladly-inject.tsx`
- `libs/shared/components/src/lib/gladly-box/gladly-box.tsx`

Note: `GladlyInitScript` (config-only inline script) uses `strategy="beforeInteractive"` but it is a trivially small inline script setting `window.gladlyConfig` — low impact. The actual SDK loader (`GladlyLoadScript`) already uses `strategy="afterInteractive"`.

The main concern is the polling pattern in `gladly-box.tsx`:

```tsx
// gladly-box.tsx (simplified — actual code has cleanup and attempt guards)
useEffect(() => {
  let attempts = 0;
  const intervalId = window.setInterval(() => {
    attempts++;
    if (attempts > maxAttempts) {
      window.clearInterval(intervalId);
      return;
    }
    if (window.Gladly && typeof window.Gladly?.show === 'function') {
      window.Gladly.on('sidekick:opened', () => setHide(true));
      window.Gladly.on('sidekick:closed', () => setHide(false));
      window.clearInterval(intervalId);
    }
  }, 1000); // polls every 1s for up to 10s
  return () => window.clearInterval(intervalId); // cleanup on unmount
}, [active]);
```

**Impact:** All pages. The `setInterval` fires every second for up to 10 seconds, competing with user interactions on the main thread. The cleanup function does exist, so no memory leak, but the polling itself adds main-thread work during the critical first-interaction window.

**Fix:** Replace `setInterval` polling with `MutationObserver` or Gladly SDK's own ready callback pattern.

---

### P1 — High Priority (Interaction Handler Fixes)

#### 4. PDP variant click handler awaits network request before UI update

**File:** `libs/modules/product/components/src/lib/web-product-option/web-configurable-product/web-configurable-product.tsx`

The variant swatch click handler awaits an API call before updating the UI (simplified):

```tsx
const clickHandler = async () => {
  try {
    // UI blocks here — no visual feedback until network response arrives
    const res = await getVariantByVariantId(variantId, false).unwrap();
    setCurrentVariant(res);
    dispatch(changeVariant(res));
    if (pageType !== 'pla') {
      window.history.replaceState(null, '', /* computed from res */);
    }
  } catch (e) { ... }
};
```

**Impact:** PDP pages (234–312ms). The INP clock runs from tap to next paint. Awaiting a network response means INP = network latency + render time. On mobile networks: 200–400ms minimum.

Additionally, `cloneDeep` is called inside JSX `.map()` during render:

```tsx
{productData?.option_types?.map((optionType) => {
  const sortOptionType = cloneDeep(optionType); // deep clone on every render
  ...
})}
```

**Fix:** Optimistic UI update — immediately show selected swatch and loading state. Dispatch `changeVariant` with available data synchronously, update with full API response when it arrives. Move `cloneDeep` into `useMemo`.

---

#### 5. ImageGallery forced layout reflow in resize handler

**File:** `libs/modules/product/components/src/lib/image-gallery/image-gallery.tsx`

```tsx
const handleResize = () => {
  const oSlickList = document.querySelector('.slick-list');
  if (oSlickList) {
    setFinalHeight(oSlickList.getBoundingClientRect().width || 660); // forced reflow
    window.setTimeout(() => {
      setFinalHeight(oSlickList.getBoundingClientRect().width || 660); // forced reflow again
    }, 100);
  }
};

useEffect(() => {
  window.addEventListener('resize', handleResize); // no debounce
  return () => window.removeEventListener('resize', handleResize);
}, [galleryRef, galleryList]);
```

**Impact:** PDP pages. `getBoundingClientRect()` forces synchronous layout calculation, called twice. No debounce. Android soft keyboard triggers resize events. The `useEffect` dep array includes `galleryList`, causing listener re-registration on variant change. Additionally, `handleResize` is defined inline without `useCallback`, making the function identity unstable across renders.

**Fix:** Replace with `ResizeObserver` on the `.slick-list` element via a ref (eliminates both the global `document.querySelector` and `getBoundingClientRect`). Use `entry.contentRect.width` from the observer callback. Add debounce (250ms+). Stabilize `handleResize` with `useCallback` or move to the `ResizeObserver` pattern.

---

#### 6. SearchView — ruleContexts array prop creates new reference on every render

**File:** `libs/modules/search/components/src/lib/search-view/search-view-client.tsx`

Note: `dynamicRuleContexts` itself is already memoized with `useMemo`. The remaining issue is the **array literal wrapping** at the JSX call site:

```tsx
// dynamicRuleContexts is already a useMemo result — that part is fine
const dynamicRuleContexts = useMemo(() => ({
  ...ruleContexts,
  currentZipcode: currentZipcodeFromRedux || ruleContexts?.currentZipcode || null,
}), [ruleContexts, currentZipcodeFromRedux]);

// But the array wrapping in JSX creates a new [] on every render:
ruleContexts={dynamicRuleContexts ? [JSON.stringify(dynamicRuleContexts)] : []}
```

**Impact:** PLP and Sale pages (338–431ms). The `[JSON.stringify(...)]` creates a new array reference on every render even when the content is identical, defeating React's referential equality check and causing unnecessary `InstantSearchNext` re-renders.

**Fix:** Memoize the array prop itself:

```tsx
const ruleContextsProp = useMemo(
  () => (dynamicRuleContexts ? [JSON.stringify(dynamicRuleContexts)] : []),
  [dynamicRuleContexts]
);
// In JSX:
ruleContexts = { ruleContextsProp };
```

---

### P2 — Medium Priority

#### 7. SearchInput — 4-step state cascade on every keystroke

**File:** `libs/modules/product/components/src/lib/web-user-bar/components/search-input/search-input.tsx`

5+ `useState` hooks and 6+ `useEffect` hooks with overlapping dependencies. Each keystroke triggers: `setValue` → debounced API call → `setRealSearchResult` → `setSuggestions` → analytics dispatch.

**Fix:** Consolidate into a single `useReducer`. Move suggestion building into `useMemo`.

#### 8. MobileFilter Drawer — transition and useEffect work on open

**File:** `libs/modules/search/components/src/lib/search-view/mobile-fitler.tsx`

Note: MUI Joy's `<Drawer>` pre-renders its children in the DOM at all times (hidden via CSS when closed), so this is **not** a full DOM insertion issue. However, opening the drawer triggers CSS transition animations and any `useEffect` hooks in `FacetsContent` that react to the drawer becoming visible, which still contributes to INP on the "Filter" tap.

**Fix:** Optimize `FacetsContent` effects that fire on visibility change. Consider deferring heavy facet value computations with `startTransition` or `useDeferredValue`.

#### 9. WebAddToCart — setInterval countdown causing re-renders

**File:** `libs/modules/product/components/src/lib/web-add-to-cart/web-add-to-cart.tsx`

```tsx
useEffect(() => {
  if (seconds > 0 && isAddToCartModalOpen) {
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1); // re-render every 1s
    }, 1000);
    return () => clearInterval(timer); // cleanup exists, no leak
  } else {
    setIsAddToCartModalOpen(false);
    setSeconds(5);
  }
}, [seconds, isAddToCartModalOpen]);
```

Note: cleanup (`clearInterval`) is present so there is no timer leak. However, because `seconds` is in the dependency array, this effect re-runs every second (teardown + setup), which is the classic `setInterval` + state anti-pattern. Also defines `LongLeadTimeTitle` as an inline component that gets recreated every render.

**Fix:** Move `LongLeadTimeTitle` outside the parent component. Use recursive `setTimeout` or a stable interval pattern that doesn't re-run the effect on every tick.

#### 10. LocaleLayoutClient — Redux dispatch during render phase

**File:** `apps/web/app/[deviceTheme]/[region]/[locale]/layout.client.tsx`

```tsx
if (!initialized.current) {
  cityInfo && store.dispatch(noticeCityInfoUpdated(cityInfo));
  user && store.dispatch(setUser(user));
  initialized.current = true;
}
```

Dispatching Redux actions during render is a React anti-pattern. Can cause immediate re-render after current render completes.

**Fix:** Move into `useEffect(() => {...}, [])`.

#### 11. Storyblok PageClient — enterApp dispatch not covered by initialized guard

**File:** `apps/web/app/[deviceTheme]/[region]/[locale]/[...rest]/page.client.tsx`

```tsx
const initialized = useRef(false);

// enterApp is in a useEffect without the initialized guard:
useEffect(() => {
  dispatch(enterApp({ page: 'Storyblok' }));
}, [dispatch]);

// DY campaign data IS guarded:
if (!initialized.current) {
  if (dyCampaignsData) { dispatch(setDYCampaignData(...)); }
  initialized.current = true;
}
```

Note: An `initialized` ref guard exists in this component, but it only covers `setDYCampaignData`. The `enterApp` dispatch is in a separate `useEffect` without the guard. Since `dispatch` from `useAppDispatch` is stable, `enterApp` practically fires once — but the pattern is inconsistent with PDP/PLP layouts.

#### 12. Multiple tracking async thunks on every page mount

Every page dispatches 3–5 `createAsyncThunk` calls on mount (`enterApp`, `EVENT_COMMON_PAGE_VIEW`, `EVENT_VIEW_ITEM`, etc.). Each creates Promise + microtask. The `trackCommonPageViewEvent` thunk also calls `sha256` synchronously — expensive on mobile CPUs.

---

## Summary by Page Type

| Page Type                  | Primary INP Driver                                                    | Secondary Issues                                              |
| -------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| **PLP** (338–415ms)        | `useBreakpoints` ×360 listeners, SearchView array ref on every render | MobileFilter transition effects, ProductCard hover re-renders |
| **Homepage** (276–386ms)   | GTM `beforeInteractive`, DY campaigns during render                   | Multiple tracking thunks on mount                             |
| **PDP** (234–312ms)        | Variant click awaits network, ImageGallery forced reflow              | useBreakpoints in gallery, ATC setInterval                    |
| **Collections** (349ms)    | SearchView + useBreakpoints                                           | Storyblok enterApp dispatch                                   |
| **Sale/Clearance** (431ms) | All PLP issues + highest product count                                | Storyblok dispatch without guard                              |
| **Furniture Sets** (487ms) | All PLP issues + complex nested filters                               | Largest product listings                                      |
| **Showroom** (310–386ms)   | Storyblok layout, DY scripts, GTM                                     | Gladly polling active                                         |
| **Help Center** (245ms)    | GTM `beforeInteractive`                                               | Lightest JS — mainly GTM overhead                             |

---

## Recommended Fix Priority

| Priority | Fix                                                        | Effort | Impact            | Pages Affected |
| -------- | ---------------------------------------------------------- | ------ | ----------------- | -------------- |
| **1**    | GTM → `afterInteractive`                                   | Low    | -50~200ms         | All            |
| **2**    | `useBreakpoints` → `BreakpointContext`                     | Medium | -100~200ms on PLP | All (PLP most) |
| **3**    | Gladly → replace `setInterval` polling with ready callback | Low    | -10~50ms          | All            |
| **4**    | PDP variant click → optimistic update                      | Medium | -200~400ms on PDP | PDP            |
| **5**    | ImageGallery → ResizeObserver + debounce                   | Low    | -50~100ms on PDP  | PDP            |
| **6**    | SearchView ruleContexts array prop → useMemo               | Low    | -50~100ms on PLP  | PLP, Sale      |
| **7**    | SearchInput → useReducer                                   | Medium | -30~50ms          | All (header)   |
| **8**    | MobileFilter → optimize effects on open + startTransition  | Medium | -30~80ms          | PLP            |
| **9**    | WebAddToCart → fix setInterval + inline component          | Low    | -20~50ms          | PDP            |
| **10**   | LocaleLayoutClient → move dispatch to useEffect            | Low    | -10~30ms          | All            |

Items 1–3 are configuration/architectural changes with low risk and high ROI. Recommend starting there.

---

## Measurement Plan

Before making changes, instrument existing code to validate hypotheses:

1. Add `performance.mark()` around the variant `clickHandler` in `WebConfigurableProduct`
2. Add `PerformanceObserver` for `event` entries to capture raw INP timings per interaction type
3. Extend existing `web-vitals.tsx` CLS monitoring to also capture INP with raw interaction target
4. Use Chrome DevTools Performance panel on a throttled mobile CPU (4x slowdown) to profile each fix before/after
