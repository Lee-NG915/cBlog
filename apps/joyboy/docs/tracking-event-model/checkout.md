# Checkout Events Book

> Scope: checkout-related events currently orchestrated by `libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts`.

## Flow Overview

```text
Cart checkout button
  -> dispatch webInitiatedCheckoutEvent
  -> tracking listener reads cart state
  -> dispatch GA checkout step 1
  -> dispatch Meta InitiateCheckout
  -> dispatch Pinterest initiate checkout custom event
  -> dispatch Klaviyo Started Checkout

Payment capture succeeds
  -> dispatch webPaymentCapturedEvent
  -> tracking listener reads cart state
  -> dispatch Meta AddPaymentInfo
  -> dispatch Pinterest add payment info custom event

Purchase succeeds
  -> dispatch purchasedSucceededEvent
  -> tracking listener reads order payload
  -> dedupe by order.id in memory
  -> dispatch product purchase events
  -> dispatch swatch purchase events
  -> dispatch new-customer purchase events when firstPurchase is true
```

## Event Inventory

| Business event | Current source action | Current destination fan-out | Primary owner | Status |
| --- | --- | --- | --- | --- |
| `checkout_initiated` | `webInitiatedCheckoutEvent` | GA `checkout`, Meta `InitiateCheckout`, Pinterest custom event, Klaviyo `Started Checkout` | Checkout/cart + tracking | Active, timing needs sign-off |
| `payment_info_added` | `webPaymentCapturedEvent` | Meta `AddPaymentInfo`, Pinterest custom event | Payment + tracking | Active |
| `order_purchased` | `purchasedSucceededEvent` | Meta `Purchase`, Pinterest `Purchase`, DY `Purchase` | Order/payment + tracking | Active |
| `swatch_order_purchased` | `purchasedSucceededEvent` | Meta custom swatch purchase, Pinterest custom event, DY custom swatch purchase | Order/payment + tracking | Active |
| `new_customer_order_purchased` | `purchasedSucceededEvent` where `order.firstPurchase` | Meta custom new customer purchase | Order/payment + tracking | Active |

## `checkout_initiated`

### Business Definition

Customer chooses to enter checkout from cart after client-side pre-checks pass: logged in, required campaign gift handled, and customized item confirmation handled when relevant.

Current implementation detail: `WebCheckoutButton` dispatches `webInitiatedCheckoutEvent()` before `initCheckoutCommand()` succeeds and before navigation to the checkout shipping address page. This means the current event represents checkout intent, not guaranteed checkout initialization success.

Design recommendation: choose one of these two contracts and align code/docs/tests:

| Option | Meaning | Code direction | Analytics implication |
| --- | --- | --- | --- |
| Keep as intent | User passed UI pre-checks and attempted checkout | Rename/document business event as `checkout_initiated` or `checkout_intent_submitted` | Funnel may include init failures. |
| Track success | Checkout initialization succeeded and user is about to enter checkout | Dispatch a new `checkoutStartedEvent` after `initCheckoutCommand()` succeeds | Funnel start is stricter and easier to QA against route transition. |

### Trigger Timing

| Question | Current answer |
| --- | --- |
| When does it fire? | Immediately before `initCheckoutCommand()` in `WebCheckoutButton.handleCheckout`. |
| What confirms success? | UI pre-checks only. Checkout initialization success is not currently required. |
| Should failed checkout init attempts emit? | Yes, under current implementation. This needs PM/analytics sign-off. |
| Can it fire more than once? | Yes, each checkout attempt can fire. |
| Dedupe key | Shared generated `eventId` for GA, Meta, and Pinterest fan-out. Klaviyo currently has no explicit event id. |

### Source and Implementation

| Area | Reference |
| --- | --- |
| Component source | [web-checkout-button.tsx](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/composite/components/src/lib/web-checkout-button/web-checkout-button.tsx) |
| Domain action | `webInitiatedCheckoutEvent` in [initiated-checkout.event.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/cart/domain/src/lib/events/initiated-checkout.event.ts) |
| Listener | `setupTrackingListeners` in [tracking.listener.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts) |
| GA trigger | `trackCheckoutActionEvent` in [checkout.trigger.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/triggers/checkout.trigger.ts) |
| Meta trigger | `trackFacebookInitiateCheckoutEvent` in [fb-capi-events.trigger.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts) |
| Pinterest trigger | `trackPinterestInitiateCheckoutEvent` in [pinterest-capi-events.trigger.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts) |
| Klaviyo trigger | `trackKlaviyoStartedCheckoutEvent` in [klaviyo-events.trigger.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/triggers/klaviyo-events.trigger.ts) |

### Business Schema

| Property | Type | Required | Source | Example | PII / Sensitive | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `eventId` | `string` | Yes | `getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_INITIATE_CHECKOUT)` | `InitiateCheckout_...` | No | Shared by GA, Meta, Pinterest in current listener. |
| `checkoutStep` | `number` | Yes for GA | Listener constant | `1` | No | GA step 1 means enter checkout. |
| `lineItems` | `LineItemSchema[]` | Yes | `selectCartLineItems(rootState)` | `[{ variant: { sku }, quantity }]` | No | Swatch items are filtered by GA/Klaviyo helpers where applicable. |
| `itemTotal` / `value` | `string` | Yes | `selectCartSummary(rootState).itemTotal.actualSubtotal` | `1299.00` | No | Document whether tax-inclusive and discount-inclusive per market before using in reporting. |
| `numItems` | `number` | Meta/Pinterest | Sum of cart line item quantities | `3` | No | Includes all cart line items in current listener, including swatch/gift unless selectors exclude them. |
| `variants` | `{ sku: string }[]` | Pinterest | `cartLineItems.map(item.variant.sku)` | `[{ sku: "CHAIR-123" }]` | No | Pinterest receives SKU array through custom data builder. |

### Destination Mapping

| Destination | Event name | Sent from | Required fields | Transformation / notes |
| --- | --- | --- | --- | --- |
| GA | `checkout` | Client dataLayer | `event`, `eventId`, `ecommerce.currencyCode`, `ecommerce.checkout.actionField.step` | Step 1 includes `products` and `value`; swatch items are filtered before `buildGACheckoutEcommerce`. |
| Meta CAPI | `InitiateCheckout` | Client dispatch to conversion service | `eventName`, `eventId`, `customData.value`, `currency`, `num_items`, `content_ids` | `content_ids` are derived from line item SKUs via helper. |
| Pinterest CAPI | Custom event | Client dispatch to conversion service | `eventName`, `eventId`, `customData.value`, `currency`, `num_items`, `content_ids` | Current trigger uses `PINTEREST_CAPI_CUSTOM_EVENT` for initiate checkout. |
| Klaviyo | `Started Checkout` | Client Klaviyo SDK | `$value`, `Items[]` | Items are transformed through `buildKlaviyoItemV2` and only trackable line items are included. |

### Non-Trigger Cases

- User is not logged in and is redirected to checkout account page.
- User needs to choose campaign gift and has not skipped or selected.
- User has customized items and has not confirmed the popup.
- `lineItems` is missing in trigger payload.
- GA does not send products when all line items are swatches.

### Automated Checks

| Level | Check |
| --- | --- |
| Listener unit | Dispatching `webInitiatedCheckoutEvent` with cart state fans out to `EVENT_GA_CHECKOUT`, `EVENT_FB_INITIATE_CHECKOUT`, `EVENT_PINTEREST_INITIATE_CHECKOUT`, and `EVENT_KL_STARTED_CHECKOUT`. |
| Trigger unit | GA checkout trigger ignores missing `checkoutStep` or `lineItems`, filters swatches, and sends step-1 ecommerce payload with `products` and `value`. |
| E2E | Clicking checkout after all pre-checks captures GA `checkout` step 1 in `window.dataLayer` and verifies Meta/Pinterest conversion requests if test environment supports them. |
| Contract regression | Fixture cart with product + swatch proves product events include product SKU and swatch handling matches documented behavior. |

## `payment_info_added`

### Business Definition

Payment was captured successfully by the payment execution flow, and the system has enough cart context to report add-payment-info to conversion platforms.

### Trigger Timing

| Question | Current answer |
| --- | --- |
| When does it fire? | After payment capture succeeds in wallet/payment execution flow. |
| What confirms success? | `webPaymentCapturedEvent({ value })` is dispatched by payment components after capture success. |
| Should failed attempts emit? | No. |
| Can it fire more than once? | It can if payment capture flow dispatches multiple success actions; no explicit listener dedupe exists. |
| Dedupe key | Shared generated `eventId` for Meta and Pinterest add-payment-info. |

### Business Schema

| Property | Type | Required | Source | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| `eventId` | `string` | Yes | `getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_ADD_PAYMENT_INFO)` | `AddPaymentInfo_...` | Shared by Meta and Pinterest. |
| `value` | `string` | Yes | `action.payload.value` | `1299.00` | Generated from payment amount. Confirm total/subtotal semantics with analytics. |
| `contentIds` | `string[]` | Yes | Current cart line item SKUs | `["CHAIR-123"]` | Listener returns early when no SKU exists. |

### Destination Mapping

| Destination | Event name | Required fields | Notes |
| --- | --- | --- | --- |
| Meta CAPI | `AddPaymentInfo` | `eventId`, `value`, `currency`, `content_ids` | Current trigger rejects empty `contentIds`. |
| Pinterest CAPI | Custom event | `eventId`, `value`, `currency`, `content_ids` | Current trigger uses `PINTEREST_CAPI_CUSTOM_EVENT`. |

### Automated Checks

- Listener unit: `webPaymentCapturedEvent({ value })` with cart SKUs dispatches Meta and Pinterest events.
- Listener unit: empty SKU list dispatches no payment-info tracking.
- Trigger unit: missing `eventId`, `value`, or `contentIds` returns tracking error and does not call conversion utility.

## `order_purchased`

### Business Definition

An order purchase succeeded. Product purchase events are sent only when the order contains at least one non-swatch line item.

### Trigger Timing

| Question | Current answer |
| --- | --- |
| When does it fire? | When `purchasedSucceededEvent` is dispatched with an order payload. |
| What confirms success? | Order domain emits purchase succeeded event. |
| Should failed attempts emit? | No. |
| Can it fire more than once? | Listener dedupes by `order.id` within the current browser runtime. |
| Dedupe key | `order.id` in listener; platform `eventId` for Meta/Pinterest purchase. |

### Business Schema

| Property | Type | Required | Source | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| `order.id` | `string` | Yes | `action.payload.order.id` | `ord_123` | Used for in-memory dedupe. |
| `order.number` / `orderId` | `string` | Yes | `order.number` | `US123456` | Sent as destination order id / unique transaction id. |
| `value` | `string` | Yes | `order.summary.total` | `1299.00` | Confirm tax, shipping, discount semantics with analytics. |
| `contentIds` | `string[]` | Yes when product items exist | Non-swatch order line item SKUs | `["CHAIR-123"]` | Empty means standard product purchase is skipped. |
| `contents` | `{ id: string; quantity: number; item_price: string }[]` | Yes for Meta | Product line items | `{ id, quantity, item_price }` | Pinterest currently receives a contents array without `id` in schema. |
| `currency` | `string` | Yes | Destination helper/config | `USD` | DY receives `order.summary.currency`. |

### Destination Mapping

| Destination | Event name | Required fields | Notes |
| --- | --- | --- | --- |
| Meta CAPI | `Purchase` | `eventId`, `value`, `orderId`, `contentIds`, `contents`, `contentType` | `contentType` is hard-coded to `product`. |
| Pinterest CAPI | `Purchase` | `eventId`, `value`, `orderId`, `contentIds`, `contents` | Current schema notes `contents` does not include `id`. |
| DY | `Purchase` | `uniqueTransactionId`, `value`, `currency`, `cart` | Listener builds legacy DY order shape through `toDYPurchaseOrder`. |

### Non-Trigger Cases

- Same `order.id` was already tracked in the current runtime.
- Order has no non-swatch product line items.
- Destination trigger receives missing `eventId`, `value`, or `orderId`.

### Automated Checks

- Listener unit: product order dispatches Meta Purchase, Pinterest Purchase, and DY Purchase exactly once per `order.id`.
- Listener unit: duplicate `purchasedSucceededEvent` for same `order.id` dispatches no second purchase.
- Listener unit: swatch-only order does not dispatch product purchase events.
- Trigger unit: destination purchase custom data matches stable order fixture.

## `swatch_order_purchased`

### Business Definition

An order purchase succeeded and contains at least one swatch line item. Swatch purchase is tracked separately from standard product purchase.

### Business Schema

| Property | Type | Required | Source | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| `eventId` | `string` | Yes for Meta/Pinterest | `getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_SWATCH_PURCHASE)` | `SwatchPurchase_...` | Shared by Meta and Pinterest swatch events. |
| `swatchSkus` | `string[]` | Yes | Swatch line item SKUs | `["FABRIC-001"]` | Empty means swatch purchase events are skipped. |
| `swatches` | `{ variant: { sku: string } }[]` | Yes for DY | Swatch line item SKUs | `[{ variant: { sku } }]` | DY custom event payload shape. |

### Destination Mapping

| Destination | Event name | Required fields | Notes |
| --- | --- | --- | --- |
| Meta CAPI | Custom swatch purchase | `eventId`, `swatchSkus` | Custom data includes `content_category: Swatch` and `content_type: swatch`. |
| Pinterest CAPI | Custom event | `eventId`, `swatchSkus` | Confirm whether value/currency should be added for paid swatches. |
| DY | Custom swatch purchase | `swatches[].variant.sku` | Property naming must match DY custom event setup. |

## `new_customer_order_purchased`

### Business Definition

An order purchase succeeded, contains product line items, and `order.firstPurchase` is true.

### Destination Mapping

| Destination | Event name | Required fields | Notes |
| --- | --- | --- | --- |
| Meta CAPI | Custom new customer purchase | `eventId`, `value`, `orderId`, `contentIds`, `contents` | Reuses the standard purchase event id in current listener. |

Pinterest new-customer purchase code exists but is not dispatched in the current listener.

## Open Decisions

| Decision | Why it matters | Recommended owner |
| --- | --- | --- |
| Is checkout step 1 an intent event or a successful checkout-start event? | Funnel accuracy and QA expectation differ. | PM + analytics + checkout dev |
| Should `itemTotal`, `value`, and `order.summary.total` be tax-inclusive and discount-inclusive? | ROAS and funnel value reports depend on consistent money semantics. | Analytics + finance/reporting |
| Should `numItems` include swatches and gifts for checkout initiated? | Platform optimization may expect sellable products only. | Analytics + marketing |
| Should Klaviyo receive a shared event id for checkout started? | Helps cross-channel debugging and dedupe if supported. | CRM + tracking dev |
| Should Pinterest new-customer purchase be enabled or intentionally deprecated? | Code exists but listener currently comments out the dispatch. | Marketing + analytics |

## QA Acceptance Checklist

- [ ] Each business event has one source action and clear trigger timing.
- [ ] PM signs off whether checkout initiated means intent or success.
- [ ] QA fixtures include product-only, swatch-only, mixed product/swatch, and first-purchase orders.
- [ ] Automated listener tests cover fan-out and non-trigger cases.
- [ ] Automated trigger tests cover missing required fields and transformed destination payloads.
- [ ] E2E smoke verifies checkout entry and purchase flows emit expected public events in a test environment.
