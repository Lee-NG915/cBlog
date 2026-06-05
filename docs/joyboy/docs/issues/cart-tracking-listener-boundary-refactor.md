---
issue_status: done
date: 2026-05-14
scope: cart tracking listener boundary refactor
markets: SG, CA, AU, US, UK
---

# Cart Tracking Listener Boundary Refactor

## Goal

Move cart tracking orchestration to a stable event boundary: cart domain defines success event contracts, cart services commands publish events with tracking context, and tracking services listeners only consume event payloads without re-reading cart snapshots.

## Market impact

This is a shared web tracking flow change and affects SG, CA, AU, US, and UK. No locale changes are required.

## Current problem

`setupCartTrackingListeners` currently subscribes to cart success events, then calls `getCartData.initiate()` to read the refreshed cart snapshot and look up the target line item. That keeps tracking outside cart services, but the tracking listener still depends on cart refresh timing and cart snapshot lookup rules.

The stable boundary should be:

```txt
cart UI / caller
  -> cart service command
  -> cart API mutation
  -> cart service command refreshes cart snapshot
  -> cart-domain success event with tracking context
  -> tracking-services listener consumes event payload
  -> channel tracking fan-out
```

## Target dependency direction

```txt
cart components -> cart services -> cart domain
tracking services -> cart domain
app -> cart services + tracking services
```

Avoid:

```txt
cart services -> tracking services
tracking services -> cart services
```

## Files to modify

1. `libs/modules/cart/domain/src/lib/events/cart-action-succeeded.event.ts`

   - Add reusable cart tracking context types.
   - Add `tracking` context to add/update/remove success payloads.

2. `libs/modules/cart/services/src/lib/cart.helper.ts`

   - Add helper to refresh cart snapshot and build tracking context.
   - Update `addToCartCommandV2` and `batchAddToCartCommand` to publish success events with tracking context.
   - Add commands for web qty/remove actions so components do not publish tracking contracts directly.

3. `libs/modules/cart/components/src/lib/web-qty-actions/web-qty-actions.tsx`

   - Replace direct RTK mutation + success event dispatch with cart service command dispatch.

4. `libs/modules/cart/components/src/lib/web-remove-action/web-remove-action.tsx`

   - Replace direct RTK mutation + success event dispatch with cart service command dispatch.

5. `libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts`

   - Remove `getCartData` dependency and `readRefreshedCart`.
   - Consume `action.payload.tracking` directly.

6. Package export files if needed:
   - `libs/modules/cart/services/src/index.ts`
   - `libs/modules/cart/domain/src/index.ts`
   - `libs/modules/tracking/services/src/index.ts`

## Event contract design

```ts
export interface CartTrackingContextPayload {
  lineItem: LineItemSchema;
  cartLineItems: LineItemSchema[];
  cartItemTotal: string;
}
```

For add and quantity update events:

```ts
tracking: CartTrackingContextPayload;
```

For remove events, the removed item may no longer exist in the refreshed cart snapshot, so the command must carry the original `lineItem` into the success event. The same `tracking.lineItem` should point to that removed item.

Swatch events remain lightweight because swatch tracking already derives its related product context from product state and pathname.

## Runtime sequence

### Regular add to cart

```txt
UI dispatches addToCartCommandV2
  -> addLineItemToCart mutation succeeds
  -> command refreshes cart snapshot
  -> command finds target line item by variantId
  -> command dispatches addedCartActionSuccessedEvent({ ..., tracking })
  -> tracking listener fans out GA / FB / Pinterest / DY / Klaviyo
```

### Batch add to cart

```txt
UI dispatches batchAddToCartCommand
  -> batchAddLineItemToCart mutation succeeds
  -> command refreshes cart snapshot
  -> command dispatches one addedCartActionSuccessedEvent per successful requested item
  -> tracking listener fans out per item
```

### Quantity update

```txt
UI dispatches updateCartQtyCommand
  -> updateCartItemQty mutation succeeds
  -> command refreshes cart snapshot
  -> command dispatches updatedCartQtyActionSuccessedEvent({ ..., tracking })
  -> tracking listener maps positive diff to add_to_cart and negative diff to remove_from_cart
```

If the updated quantity removes the line item from the cart, the command should fall back to the previous line item passed from the UI.

### Remove

```txt
UI dispatches removeCartItemCommand
  -> removeCartItem mutation succeeds
  -> command dispatches removedCartActionSuccessedEvent({ lineItem, tracking })
  -> tracking listener dispatches remove_from_cart tracking
```

## Execution steps

1. Update cart-domain event payload contracts.
2. Add cart service helpers/commands for tracking context publishing.
3. Migrate web qty/remove components to commands.
4. Refactor tracking listener to consume event payload only.
5. Run caller grep and available validation commands.

## Acceptance criteria

- `setupCartTrackingListeners` does not import or call `getCartData`.
- `setupCartTrackingListeners` does not lookup target line items from a fetched cart snapshot.
- Cart components do not directly dispatch cart tracking success events for qty/remove.
- `addToCartCommandV2`, `batchAddToCartCommand`, qty command, and remove command publish typed success events.
- Existing tracking trigger payload fields and event names are preserved.
- Formatting passes for changed files.
- Available test/build commands are run; existing blockers are documented.

## Change list and execution status

### Completed in this refactor

| Status | File                                                                           | Change                                                                                                                                                   | Impact                                                                                            |
| ------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Done   | `docs/issues/cart-tracking-listener-boundary-refactor.md`                      | Added design notes, runtime sequence, acceptance criteria, and this execution tracker.                                                                   | Documentation only.                                                                               |
| Done   | `libs/modules/cart/domain/src/lib/events/cart-action-succeeded.event.ts`       | Added `CartTrackingContextPayload`; added customer and swatch related-product context to success event payload contracts.                                | Contract change for all publishers/subscribers of these cart success events.                      |
| Done   | `libs/modules/cart/services/src/lib/cart.helper.ts`                            | Added cart snapshot/context helpers; updated `addToCartCommandV2` and `batchAddToCartCommand`; added `updateCartQtyCommand` and `removeCartItemCommand`. | Cart services now own success event publishing and pass stable tracking context.                  |
| Done   | `libs/modules/cart/components/src/lib/web-qty-actions/web-qty-actions.tsx`     | Replaced direct `useUpdateCartItemQtyMutation` + `updatedCartQtyActionSuccessedEvent` dispatch with `updateCartQtyCommand`.                              | Web quantity updates now go through cart services command.                                        |
| Done   | `libs/modules/cart/components/src/lib/web-remove-action/web-remove-action.tsx` | Replaced direct `useRemoveCartItemMutation` + `removedCartActionSuccessedEvent` dispatch with `removeCartItemCommand`.                                   | Web remove actions now go through cart services command.                                          |
| Done   | `libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts`   | Moved listener to tracking services; removed `getCartData` / `readRefreshedCart` / target lookup; directly fans out to GA/FB/Pinterest/DY/Klaviyo.       | Tracking listener no longer depends on cart snapshot refresh timing or legacy composite triggers. |
| Done   | `apps/web/app/[deviceTheme]/[region]/layout.client.tsx`                        | Registers `setupCartTrackingListeners` from tracking services alongside cart/tracking listeners.                                                         | Web app composition root owns cross-module listener setup.                                        |
| Done   | `libs/modules/tracking/services/src/index.ts`                                  | Exports `setupCartTrackingListeners`.                                                                                                                    | Makes the tracking-owned cart tracking listener available to the app layer.                       |
| Done   | `libs/modules/cart/services/src/index.ts`                                      | Removes the old cart-owned cart tracking listener export.                                                                                                | Prevents cart services from exposing tracking orchestration.                                      |
| Done   | `libs/modules/cart/services/src/lib/cart.listener.ts`                          | Leaves cart listener focused on cart refresh/UI side effects and documents that tracking is handled by tracking services.                                | Separates cart business side effects from tracking fan-out.                                       |

### Related tracking cleanup already present in this working tree

These changes are part of the broader tracking refactor currently in the working tree, but are not required by the cart listener boundary contract itself.

| Status                 | File                                                                                                                 | Change                                                                    | Impact                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Done                   | `libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts`                                          | Refactored FB CAPI trigger to use schema/helper builders.                 | Keeps FB CAPI payload construction centralized.                                         |
| Done                   | `libs/modules/tracking/services/src/lib/entity/fb-capi-events.schema.ts`                                             | Added FB CAPI trigger/custom data schemas.                                | Type-only tracking schema addition.                                                     |
| Done                   | `libs/modules/tracking/services/src/lib/helpers/facebook.helper.ts`                                                  | Added FB CAPI builders/log helpers.                                       | Helper-only tracking addition.                                                          |
| Done                   | `libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts`                                   | Refactored Pinterest trigger to use schema/helper builders.               | Keeps Pinterest CAPI payload construction centralized.                                  |
| Done                   | `libs/modules/tracking/services/src/lib/entity/pinterest-capi-events.schema.ts`                                      | Added Pinterest CAPI schemas.                                             | Type-only tracking schema addition.                                                     |
| Done                   | `libs/modules/tracking/services/src/lib/helpers/pinterest.helper.ts`                                                 | Added Pinterest helper builders.                                          | Helper-only tracking addition.                                                          |
| Done                   | `libs/modules/tracking/services/src/lib/helpers/index.ts` / `libs/modules/tracking/services/src/lib/entity/index.ts` | Exported new tracking helper/schema files.                                | Makes new tracking schema/helpers available through existing barrels.                   |
| Not in boundary commit | `libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts`                                             | Legacy composite trigger remains outside the listener boundary follow-up. | The cart tracking listener must not call this composite trigger for add/swatch fan-out. |
| Done                   | `libs/modules/tracking/services/src/lib/events-map.ts`                                                               | Removed obsolete cart tracking event map exports.                         | Reduces legacy event alias surface.                                                     |

## Impact scope

### Markets

| Market | Affected | Notes                          |
| ------ | -------- | ------------------------------ |
| SG     | Yes      | Shared web cart tracking flow. |
| CA     | Yes      | Shared web cart tracking flow. |
| AU     | Yes      | Shared web cart tracking flow. |
| US     | Yes      | Shared web cart tracking flow. |
| UK     | Yes      | Shared web cart tracking flow. |

No locale files are touched.

### Runtime flows

| Flow                   | Impact                                 | Expected behavior after refactor                                                                                                         |
| ---------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Regular add to cart    | Yes                                    | `addToCartCommandV2` refreshes cart snapshot, publishes add success event with `tracking`, listener fans out GA/FB/Pinterest/DY/Klaviyo. |
| Batch add to cart      | Yes                                    | `batchAddToCartCommand` refreshes cart snapshot once, publishes one add success event per successful item with `tracking`.               |
| Cart quantity increase | Yes                                    | `WebQtyActions` calls `updateCartQtyCommand`; listener maps positive diff to add-to-cart tracking using `tracking`.                      |
| Cart quantity decrease | Yes                                    | `WebQtyActions` calls `updateCartQtyCommand`; listener maps negative diff to remove-from-cart tracking using `tracking.lineItem`.        |
| Cart item remove       | Yes                                    | `WebRemoveAction` calls `removeCartItemCommand`; listener dispatches remove tracking using the removed item carried by `tracking`.       |
| Swatch add to cart     | Yes                                    | Swatch success event carries SKU/name and optional related product context; listener directly fans out GA/FB/Pinterest/DY.               |
| POS cart actions       | No direct web tracking listener impact | `setupCartTrackingListeners` is web-gated with `accessInWeb`. POS components still use existing POS mutations.                           |

### Dependency boundary

After the refactor:

```txt
cart components -> cart services -> cart domain
tracking services -> cart domain
app -> cart services + tracking services
```

The tracking-owned listener no longer imports `getCartData` or performs cart snapshot lookup. It also does not call the legacy comprehensive add-to-cart or swatch composite triggers; fan-out is explicit in the listener.

### Dependency boundary issue and resolution

Direct fan-out initially exposed a lint/circular-boundary risk if the listener reused legacy composite triggers or imported user/order state through `cart-events.trigger.ts`. The chosen resolution is:

- keep cart snapshot and user/customer tracking context generation in `cart-services`, where cart/user state dependencies already belong;
- carry that context through typed `cart-domain` success events;
- let `tracking-services` listener consume the event payload and call channel-specific tracking triggers directly;
- avoid routing back through legacy composite triggers such as `trackAddedToCartEventV2` or `trackAddSwatchEvent`.

## Verification status

| Status            | Check                                                                                                                                                                                                                                                                                                                                                                                                                                     | Result                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| Passed            | `pnpm prettier --check docs/issues/cart-tracking-listener-boundary-refactor.md libs/modules/cart/domain/src/lib/events/cart-action-succeeded.event.ts libs/modules/cart/services/src/lib/cart.helper.ts libs/modules/cart/components/src/lib/web-qty-actions/web-qty-actions.tsx libs/modules/cart/components/src/lib/web-remove-action/web-remove-action.tsx libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts` | All matched files use Prettier style.                                                                                                                                                              |
| Passed            | `git diff --check` for the boundary refactor files                                                                                                                                                                                                                                                                                                                                                                                        | No whitespace errors.                                                                                                                                                                              |
| Passed            | `rg "getCartData                                                                                                                                                                                                                                                                                                                                                                                                                          | readRefreshedCart                                                                                                                                                                                  | lineItems\\.find                          | ProductTypeMapping" libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts` | No matches. |
| Passed            | `rg "trackAddedToCartEventV2                                                                                                                                                                                                                                                                                                                                                                                                              | trackAddSwatchEvent" libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts`                                                                                                   | No matches; listener uses direct fan-out. |
| Passed            | `pnpm eslint libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts libs/modules/cart/domain/src/lib/events/cart-action-succeeded.event.ts libs/modules/cart/services/src/lib/cart.helper.ts`                                                                                                                                                                                                                         | No lint errors for targeted boundary files.                                                                                                                                                        |
| Passed            | `pnpm nx test modules-tracking-services`                                                                                                                                                                                                                                                                                                                                                                                                  | Target ran successfully; no tests found.                                                                                                                                                           |
| Passed            | `pnpm nx test modules-cart-services`                                                                                                                                                                                                                                                                                                                                                                                                      | Target ran successfully; no tests found.                                                                                                                                                           |
| Passed            | `pnpm nx test modules-cart-domain`                                                                                                                                                                                                                                                                                                                                                                                                        | Target ran successfully; no tests found.                                                                                                                                                           |
| Blocked           | `pnpm nx test modules-cart-components`                                                                                                                                                                                                                                                                                                                                                                                                    | Project has no `test` target.                                                                                                                                                                      |
| Blocked           | `pnpm nx build modules-tracking-services`                                                                                                                                                                                                                                                                                                                                                                                                 | Existing Nx circular dependency: `modules-tracking-services -> modules-tracking-domain -> shared-redux-services -> shared-services -> modules-product-domain -> shared-redux-services`.            |
| Blocked           | `pnpm nx build modules-cart-services`                                                                                                                                                                                                                                                                                                                                                                                                     | Existing Nx circular dependency: `modules-cart-services -> modules-user-domain -> shared-redux-services -> shared-services -> modules-product-domain -> shared-redux-services`.                    |
| Partially checked | `pnpm tsc -p ... --noEmit --module esnext` with filtered output                                                                                                                                                                                                                                                                                                                                                                           | Tracking listener related errors are clear; cart services full check still reports pre-existing `cart.helper.ts` type errors around bundle options, gift casts, and `transferCartItems` overloads. |

## Remaining follow-ups

- Browser-test web cart golden paths by market or selected market: add to cart, batch add, quantity increase, quantity decrease, remove, swatch add.
- Decide whether to rename `Successed` events to `Succeeded` with compatibility aliases in a separate cleanup.
- Resolve existing Nx circular dependency and cart helper type errors separately so build/typecheck can become reliable gates.
