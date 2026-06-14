// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
import { isAnyOf, Unsubscribe } from '@reduxjs/toolkit';
import type { OrderDataV1, OrderLineItemV1 } from '@castlery/types';
import { ProductTypeMapping, accessInAU, accessInWeb } from '@castlery/config';
import { ExtraArgument } from '@castlery/shared-redux-extra';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { purchasedSucceededEvent, webAddedToCartEvent } from '@castlery/modules-order-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { webSignedUpEvent, selectedActiveUser } from '@castlery/modules-user-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { webPaymentCapturedEvent } from '@castlery/modules-payment-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { webInitiatedCheckoutEvent, selectCartLineItems, selectCartSummary } from '@castlery/modules-cart-domain';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { cartIconClickedEvent } from '@castlery/modules-product-domain';
import {
  EVENT_DY_PURCHASE,
  EVENT_DY_SWATCH_PURCHASE,
  EVENT_FB_ADD_PAYMENT_INFO,
  EVENT_FB_CAPI_CUSTOM_ACT_WITH_SIGNUP,
  EVENT_FB_INITIATE_CHECKOUT,
  EVENT_FB_NEW_CUSTOMER_PURCHASE,
  EVENT_FB_PURCHASE,
  EVENT_FB_SWATCH_PURCHASE,
  EVENT_GA_CHECKOUT,
  EVENT_GA_CLICK_CART_ICON,
  EVENT_GA_PURCHASE,
  EVENT_GA_SWATCH_PURCHASE,
  EVENT_KL_STARTED_CHECKOUT,
  EVENT_PINTEREST_ADD_PAYMENT_INFO,
  EVENT_PINTEREST_INITIATE_CHECKOUT,
  EVENT_PINTEREST_PURCHASE,
  EVENT_PINTEREST_SWATCH_PURCHASE,
  EVENT_IMPACT_UTT_TRACK_CONVERSION,
} from '../events';
import { buildGAPurchaseTriggerPayload } from '../helpers';
import { getEventRandomId } from '../utils';
import { EVENTS_NAMES_MAP } from '../events-name';

const trackedPurchaseOrderIds = new Set<string>();

const getOrderLineItems = (order: OrderDataV1): OrderLineItemV1[] =>
  order.shipments.flatMap((shipment) => shipment.lineItems);

const getProductLineItems = (lineItems: OrderLineItemV1[]): OrderLineItemV1[] =>
  lineItems.filter((lineItem) => lineItem.productType !== ProductTypeMapping.SWATCH);

const getSwatchLineItems = (lineItems: OrderLineItemV1[]): OrderLineItemV1[] =>
  lineItems.filter((lineItem) => lineItem.productType === ProductTypeMapping.SWATCH);

const getContentIds = (lineItems: OrderLineItemV1[]): string[] =>
  lineItems.map((lineItem) => lineItem.sku).filter(Boolean);

const toDYPurchaseOrder = (order: OrderDataV1, lineItems: OrderLineItemV1[]) => ({
  line_items: lineItems.map((lineItem) => ({
    is_swatch: lineItem.productType === ProductTypeMapping.SWATCH,
    quantity: lineItem.quantity,
    variant: {
      sku: lineItem.sku,
      price: lineItem.salePrice,
    },
  })),
  item_count: lineItems.reduce((total, lineItem) => total + lineItem.quantity, 0),
  number: order.number,
  total: Number(order.summary.total),
  currency: order.summary.currency,
});

export function setupTrackingListeners(startListening: AppStartListening): Unsubscribe {
  const subscriptions = [
    ...(accessInWeb
      ? [
          startListening({
            actionCreator: webInitiatedCheckoutEvent,
            effect: async (_, { dispatch, getState }) => {
              const rootState = getState();
              const cartLineItems = selectCartLineItems(rootState);
              const cartSummary = selectCartSummary(rootState);
              const itemTotal = cartSummary?.itemTotal?.actualSubtotal ?? '';
              const itemsCount = cartLineItems.reduce((acc, item) => acc + item.quantity, 0);
              const eventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_INITIATE_CHECKOUT);

              await Promise.allSettled([
                // 1. track ga checkout event
                dispatch(EVENT_GA_CHECKOUT({ eventId, checkoutStep: 1, lineItems: cartLineItems, itemTotal })),
                // 1. track facebook initiate checkout event
                dispatch(
                  EVENT_FB_INITIATE_CHECKOUT({ eventId, itemTotal, numItems: itemsCount, lineItems: cartLineItems })
                ),
                //2. track pinterest initiate checkout event
                dispatch(
                  EVENT_PINTEREST_INITIATE_CHECKOUT({
                    eventId,
                    value: itemTotal,
                    numItems: itemsCount,
                    variants: cartLineItems.map((item) => ({ sku: item.variant.sku })),
                  })
                ),
                //3. track klaviyo started checkout event
                dispatch(EVENT_KL_STARTED_CHECKOUT({ itemTotal, lineItems: cartLineItems })),
              ]);
            },
          }),
          startListening({
            actionCreator: cartIconClickedEvent,
            effect: async (_, { dispatch }) => {
              await dispatch(EVENT_GA_CLICK_CART_ICON());
            },
          }),
          startListening({
            actionCreator: webPaymentCapturedEvent,
            effect: async (action, { dispatch, getState }) => {
              const rootState = getState();
              const cartLineItems = selectCartLineItems(rootState);
              const contentIds = cartLineItems.map((item) => item.variant.sku).filter(Boolean);

              if (!contentIds.length) return;

              const eventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_ADD_PAYMENT_INFO);
              const { value } = action.payload;

              await Promise.allSettled([
                dispatch(EVENT_FB_ADD_PAYMENT_INFO({ eventId, value, contentIds })),
                dispatch(EVENT_PINTEREST_ADD_PAYMENT_INFO({ eventId, value, contentIds })),
              ]);
            },
          }),
          startListening({
            actionCreator: purchasedSucceededEvent,
            effect: async (action, { dispatch, getState }) => {
              const { order } = action.payload;
              if (trackedPurchaseOrderIds.has(order.id)) return;

              trackedPurchaseOrderIds.add(order.id);
              const user = selectedActiveUser(getState());
              const lineItems = getOrderLineItems(order);
              const productLineItems = getProductLineItems(lineItems);
              const swatchLineItems = getSwatchLineItems(lineItems);
              const contentIds = getContentIds(productLineItems);
              const swatchSkus = getContentIds(swatchLineItems);
              const purchaseEventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_PURCHASE);
              const swatchPurchaseEventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_SWATCH_PURCHASE);
              const value = order.summary.total;
              const orderId = order.number;
              const isFirstPurchase = order.firstPurchase;

              const contents = productLineItems.map((lineItem) => ({
                id: lineItem.sku,
                quantity: lineItem.quantity,
                item_price: lineItem.salePrice,
              }));
              const purchaseEvents = contentIds.length
                ? [
                    dispatch(
                      EVENT_FB_PURCHASE({
                        eventId: purchaseEventId,
                        value,
                        orderId,
                        contentIds,
                        contents,
                        contentType: 'product',
                      })
                    ),
                    dispatch(
                      EVENT_PINTEREST_PURCHASE({
                        eventId: purchaseEventId,
                        value,
                        orderId,
                        contentIds,
                        contents,
                      })
                    ),
                    dispatch(EVENT_DY_PURCHASE({ order: toDYPurchaseOrder(order, lineItems) })),
                    dispatch(EVENT_IMPACT_UTT_TRACK_CONVERSION({ order, user })),
                    dispatch(
                      EVENT_GA_PURCHASE(buildGAPurchaseTriggerPayload({ order, user, lineItems: productLineItems }))
                    ),
                  ]
                : [];
              const swatchPurchaseEvents = swatchSkus.length
                ? [
                    dispatch(EVENT_FB_SWATCH_PURCHASE({ eventId: swatchPurchaseEventId, swatchSkus })),
                    dispatch(EVENT_PINTEREST_SWATCH_PURCHASE({ eventId: swatchPurchaseEventId, swatchSkus })),
                    dispatch(
                      EVENT_DY_SWATCH_PURCHASE({
                        swatches: swatchSkus.map((sku) => ({ variant: { sku } })),
                      })
                    ),
                    dispatch(
                      EVENT_GA_SWATCH_PURCHASE({
                        swatches: swatchLineItems.map((item) => ({ sku: item.sku, name: item.listName })),
                      })
                    ),
                  ]
                : [];

              const newCustomerPurchaseEvents =
                isFirstPurchase && contentIds.length
                  ? [
                      dispatch(
                        EVENT_FB_NEW_CUSTOMER_PURCHASE({
                          eventId: purchaseEventId,
                          value,
                          orderId,
                          contentIds,
                          contents,
                        })
                      ),
                      // dispatch(
                      //   EVENT_PINTEREST_NEW_CUSTOMER_PURCHASE({
                      //     eventId: purchaseEventId,
                      //     value,
                      //     orderId,
                      //     contentIds,
                      //     contents,
                      //   })
                      // ),
                    ]
                  : [];

              await Promise.allSettled([...purchaseEvents, ...swatchPurchaseEvents, ...newCustomerPurchaseEvents]);
            },
          }),
        ]
      : []),
    startListening({
      matcher: isAnyOf(webAddedToCartEvent, webSignedUpEvent),
      effect: async (action, { dispatch, extra }) => {
        // only track in AU, click up ticket:https://app.clickup.com/t/86eud6n2w
        if (!accessInAU) return;
        const ATC_PREFIX = 'A_';
        const SIGNUP_PREFIX = 'S_';
        const prefix =
          (action as any)?.['meta']?.['arg']?.['endpointName'] === 'addToOrder' ? ATC_PREFIX : SIGNUP_PREFIX;
        // check if the atc and signup are in the same day，if so, track the event
        const { persistenceHandles } = extra as ExtraArgument;
        const atcSignupTimestamp = persistenceHandles.atcSignupTimestamp.getItem();
        const now = Date.now();
        const currentTimestamp = prefix + now.toString();
        // 如果本地记录不存在或者重复操作，则记录timestamp
        if (!atcSignupTimestamp || atcSignupTimestamp?.startsWith(prefix)) {
          // 更新timestamp
          persistenceHandles.atcSignupTimestamp.setItem(currentTimestamp);
          return;
        }
        const timestamp = atcSignupTimestamp.split('_').pop();
        const localTimestamp = Number(timestamp);
        if (now - localTimestamp < 24 * 60 * 60 * 1000) {
          await dispatch(EVENT_FB_CAPI_CUSTOM_ACT_WITH_SIGNUP());
          persistenceHandles.atcSignupTimestamp.removeItem();
        }
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
