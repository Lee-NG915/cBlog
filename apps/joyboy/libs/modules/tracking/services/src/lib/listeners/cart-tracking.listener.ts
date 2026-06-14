import { isAnyOf, Unsubscribe } from '@reduxjs/toolkit';
import { accessInWeb, ProductTypeMapping } from '@castlery/config';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppStartListening } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  addedCartActionSucceededEvent,
  updatedCartQtyActionSucceededEvent,
  removedCartActionSucceededEvent,
  addedSwatchActionSucceededEvent,
  addedGiftActionSucceededEvent,
  cartRefreshButtonClickedEvent,
  cartCheckoutClickedEvent,
  cartOutdatedBannerImpressionEvent,
  cartProductRecommendationImpressionEvent,
  cartServiceGuaranteeImpressionEvent,
  cartServiceGuaranteePolicyClickedEvent,
  cartViewedEvent,
  type CartOutdatedBannerKind,
} from '@castlery/modules-cart-domain';
import type { LineItemSchema } from '@castlery/types';
import { EVENTS_NAMES_MAP } from '../events-name';
import { gaTrack, getEventRandomId } from '../utils';
import { logger } from '@castlery/observability/client';

import {
  EVENT_GA_REMOVE_FROM_CART,
  EVENT_GA_ADD_TO_CART,
  EVENT_GA_REFRESH_CART,
  EVENT_GA_CLICK_CHECKOUT,
  EVENT_GA_OUTDATED_BANNER_IMPRESSION,
  EVENT_GA_VIEW_PRODUCT_RECOMMENDATION,
  EVENT_GA_VIEW_SERVICE_GUARANTEE,
  EVENT_GA_CLICK_SERVICE_GUARANTEE_POLICY,
  EVENT_GA_VIEW_CART,
  EVENT_GA_GWP_ADD_TO_CART,
  EVENT_FB_ADD_TO_CART,
  EVENT_FB_ADD_SWATCH_TO_CART,
  EVENT_PINTEREST_ADD_TO_CART,
  EVENT_PINTEREST_ADD_SWATCH_TO_CART,
  EVENT_DY_ADD_TO_CART_V2,
  EVENT_DY_REMOVE_FROM_CART,
  EVENT_DY_SWATCH_ATC,
  EVENT_KL_ADDED_TO_CART_V2,
} from '../events';

async function dispatchAddToCartTrackingEvents({
  dispatch,
  cartLineItems,
  targetLineItem,
  quantityDifference,
  cartItemTotal,
  customer,
  atcType = 'regular',
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any;
  cartLineItems: LineItemSchema[];
  targetLineItem: LineItemSchema;
  quantityDifference: number;
  cartItemTotal: string;
  customer: {
    userStatus: 'logged-in' | 'logged-out';
    userEmail: string;
    userEmail2: string;
  };
  atcType?: 'regular' | '1click' | 'ai' | 'free_gift';
}) {
  if (!targetLineItem) {
    return;
  }

  const variant = targetLineItem.variant;
  const fbpEventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_ADD_TO_CART);

  await Promise.allSettled([
    // 1. for GA
    dispatch(EVENT_GA_ADD_TO_CART({ targetLineItem, quantityDifference, customer, atcType })),
    // 2. for FB
    dispatch(
      EVENT_FB_ADD_TO_CART({
        eventId: fbpEventId,
        variant: { name: variant.name, sku: variant.sku },
        originalPrice: variant.price,
      })
    ),
    // 3. for Pinterest
    dispatch(
      EVENT_PINTEREST_ADD_TO_CART({
        eventId: fbpEventId,
        variant: { sku: variant.sku, name: variant.name },
        originalPrice: variant.price,
      })
    ),
    // 4. for Dynamic Yield
    dispatch(
      EVENT_DY_ADD_TO_CART_V2({
        cartLineItems,
        targetLineItem,
        targetPrice: Number(targetLineItem.variant.price),
      })
    ),
    // 5. for Klaviyo
    dispatch(
      EVENT_KL_ADDED_TO_CART_V2({
        cartLineItems,
        targetLineItem,
        cartItemTotal,
        quantityDifference,
      })
    ),
  ]);
}

async function dispatchRemoveFromCartTrackingEvents({
  dispatch,
  cartLineItems,
  targetLineItem,
  removedQuantity,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any;
  cartLineItems: LineItemSchema[];
  targetLineItem: LineItemSchema;
  removedQuantity: number;
}) {
  if (!targetLineItem || removedQuantity <= 0) {
    return;
  }

  const trackableCartItems = cartLineItems
    .filter((item) => item.productType !== ProductTypeMapping.SWATCH)
    .map((item) => ({
      variant: { sku: item.variant.sku },
      quantity: item.quantity,
      price: item.variant.price,
    }));

  await Promise.allSettled([
    dispatch(
      EVENT_GA_REMOVE_FROM_CART({
        lineItem: targetLineItem,
        quantityDifference: -removedQuantity,
      })
    ),
    dispatch(
      EVENT_DY_REMOVE_FROM_CART({
        variant: { sku: targetLineItem.variant.sku },
        quantity: removedQuantity,
        cartLineItems: trackableCartItems,
        targetPrice: Number(targetLineItem.variant.price),
      })
    ),
  ]);
}

async function dispatchSwatchTrackingEvents({
  dispatch,
  sku,
  skuName,
  relatedProductId,
  relatedProductSlug,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any;
  sku: string;
  skuName: string;
  relatedProductId?: number;
  relatedProductSlug?: string;
}) {
  if (!sku || !skuName) {
    logger.error('Track swatch add to cart events failed', { error: 'sku or skuName not found' });
    return;
  }

  const eventId = getEventRandomId(EVENTS_NAMES_MAP.FB_CAPI_CUSTOM_SWATCH_ATC);
  const gaParams = {
    event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT,
    'eventDetails.category': 'Ecommerce',
    'eventDetails.action': 'Swatch - add to cart',
    'eventDetails.label': `${sku} | ${skuName}`,
  };

  await Promise.allSettled([
    gaTrack(gaParams),
    dispatch(
      EVENT_FB_ADD_SWATCH_TO_CART({
        eventId,
        variant: { sku, name: skuName },
        swatchRelatedProductId: relatedProductId,
      })
    ),
    dispatch(
      EVENT_PINTEREST_ADD_SWATCH_TO_CART({
        variant: { sku },
        eventId,
      })
    ),
    dispatch(
      EVENT_DY_SWATCH_ATC({
        variant: { sku, name: skuName },
        swatchRelatedProductSlug: relatedProductSlug,
      })
    ),
  ]);
}

/**
 * @description Subscribes to explicit cart-action success events and fans them out to
 * channel-specific tracking triggers.
 */
export function setupCartTrackingListeners(startListening: AppStartListening): Unsubscribe {
  if (!accessInWeb) {
    return () => undefined;
  }

  const subscriptions = [
    startListening({
      matcher: isAnyOf(addedCartActionSucceededEvent, updatedCartQtyActionSucceededEvent),
      effect: async (action, { dispatch }) => {
        if (addedCartActionSucceededEvent.match(action)) {
          const { quantityDifference, atcType, tracking } = action.payload;
          await dispatchAddToCartTrackingEvents({
            dispatch,
            cartLineItems: tracking.cartLineItems,
            targetLineItem: tracking.lineItem,
            quantityDifference,
            cartItemTotal: tracking.cartItemTotal,
            customer: tracking.customer,
            atcType,
          });
          return;
        }

        if (updatedCartQtyActionSucceededEvent.match(action)) {
          const { tracking } = action.payload;
          const diff = tracking.quantityDifference;

          if (diff === 0) return;

          if (diff > 0) {
            await dispatchAddToCartTrackingEvents({
              dispatch,
              cartLineItems: tracking.cartLineItems,
              targetLineItem: tracking.lineItem,
              quantityDifference: diff,
              cartItemTotal: tracking.cartItemTotal,
              customer: tracking.customer,
              atcType: 'regular',
            });
          } else {
            await dispatchRemoveFromCartTrackingEvents({
              dispatch,
              cartLineItems: tracking.cartLineItems,
              targetLineItem: tracking.lineItem,
              removedQuantity: -diff,
            });
          }
        }
      },
    }),
    startListening({
      actionCreator: removedCartActionSucceededEvent,
      effect: async ({ payload }, { dispatch }) => {
        // quantityDifference： 取值区分：在购物车减少商品数量 或者 直接移除商品两种场景
        const targetLineItem = payload.tracking.lineItem;
        const isSwatchOrGift =
          targetLineItem?.productType === ProductTypeMapping.SWATCH ||
          targetLineItem?.isGift ||
          !!targetLineItem?.giftPoolId;
        if (isSwatchOrGift) {
          return;
        }
        await dispatchRemoveFromCartTrackingEvents({
          dispatch,
          cartLineItems: payload.tracking.cartLineItems,
          targetLineItem: payload.tracking.lineItem,
          removedQuantity: payload.tracking.quantityDifference,
        });
      },
    }),
    startListening({
      actionCreator: addedSwatchActionSucceededEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatchSwatchTrackingEvents({
          dispatch,
          sku: payload.sku,
          skuName: payload.skuName,
          relatedProductId: payload.relatedProductId,
          relatedProductSlug: payload.relatedProductSlug,
        });
      },
    }),
    startListening({
      actionCreator: addedGiftActionSucceededEvent,
      effect: async ({ payload }, { dispatch }) => {
        await Promise.allSettled([
          dispatch(
            EVENT_GA_GWP_ADD_TO_CART({
              campaignName: payload.campaignName,
              label: payload.label,
              giftId: payload.giftId,
            })
          ),
          dispatch(
            EVENT_GA_ADD_TO_CART({
              targetLineItem: payload.tracking.lineItem,
              quantityDifference: payload.tracking.quantityDifference,
              customer: payload.tracking.customer,
              atcType: 'free_gift',
            })
          ),
        ]);
      },
    }),
    startListening({
      actionCreator: cartRefreshButtonClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_REFRESH_CART({ label: payload.surface }));
      },
    }),
    startListening({
      actionCreator: cartCheckoutClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_CHECKOUT({ position: payload.position }));
      },
    }),
    startListening({
      actionCreator: cartOutdatedBannerImpressionEvent,
      effect: async ({ payload }, { dispatch }) => {
        const { kind, sku, name } = payload;
        if (!sku || !name) return;
        const label = `${sku} | ${name}`;
        await dispatch(EVENT_GA_OUTDATED_BANNER_IMPRESSION({ kind: kind as CartOutdatedBannerKind, label }));
      },
    }),
    startListening({
      actionCreator: cartProductRecommendationImpressionEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_VIEW_PRODUCT_RECOMMENDATION({ label: payload.label, position: payload.position }));
      },
    }),
    startListening({
      actionCreator: cartServiceGuaranteeImpressionEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_VIEW_SERVICE_GUARANTEE({ position: payload.position }));
      },
    }),
    startListening({
      actionCreator: cartServiceGuaranteePolicyClickedEvent,
      effect: async ({ payload }, { dispatch }) => {
        await dispatch(EVENT_GA_CLICK_SERVICE_GUARANTEE_POLICY({ label: payload.label, position: payload.position }));
      },
    }),
    startListening({
      actionCreator: cartViewedEvent,
      effect: async ({ payload }, { dispatch }) => {
        if (!payload.lineItems?.length) return;
        await dispatch(EVENT_GA_VIEW_CART({ label: payload.surface, lineItems: payload.lineItems }));
      },
    }),
  ];

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
  };
}
