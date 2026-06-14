import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductTypeMapping } from '@castlery/config';
import { EVENTS_NAMES_MAP } from '../events-name';
import {
  buildGACheckoutEcommerce,
  buildGAPurchaseActionField,
  buildGAPurchaseEventDetails,
  buildGAPurchaseTransactionFields,
  getGAPurchaseProductsFromOrder,
  logGACheckoutError,
  logGACheckoutWarn,
} from '../helpers';
import { gaTrack, getEventRandomId } from '../utils';
import type {
  CheckoutTriggerPayloadSchema,
  GACheckoutEventName,
  GACheckoutEventPayloadSchema,
  GAPurchaseEventName,
  GAPurchaseEventPayloadSchema,
  GASwatchPurchaseEventName,
  GASwatchPurchaseEventPayloadSchema,
  PurchaseTriggerPayloadSchema,
  SwatchPurchaseTriggerPayloadSchema,
} from '../entity';

/**
 * Validate the discriminated-union payload. The type system already enforces
 * required fields per step at compile time; this is a runtime guard against
 * malformed dispatches (e.g. dynamic / legacy callers).
 */
function validateCheckoutPayload(payload: CheckoutTriggerPayloadSchema): string | null {
  if (!payload.checkoutStep) {
    return 'checkoutStep not found';
  }
  if (payload.checkoutStep === 1 && !payload.lineItems) {
    return 'step 1 missing lineItems';
  }
  if ((payload.checkoutStep === 4 || payload.checkoutStep === 5) && !payload.option) {
    return `step ${payload.checkoutStep} missing option`;
  }
  return null;
}

/**
 * @description 跟踪 GA checkout 事件（funnel step 1..5）
 * @scenario
 *  - step 1：cart → checkout 入口，由 `tracking.listener` 监听
 *            `webInitiatedCheckoutEvent` 派发
 *  - step 2：address 步骤完成（`checkout-tracking.listener` 监听
 *            `checkoutShippingAddressStepCompletedEvent`）
 *  - step 3：shipping address review（保留，无 caller）
 *  - step 4：shipping method 完成（`checkout-tracking.listener` 监听
 *            `checkoutShippingMethodStepCompletedEvent`，payload 携带 option）
 *  - step 5：payment method 选定（`checkout-tracking.listener` 监听
 *            `checkoutPaymentMethodSelectedForFunnelEvent`，payload 携带 option）
 */
export const trackCheckoutActionEvent = createAsyncThunk(
  'tracking/trackCheckoutActionEvent',
  async (payload: CheckoutTriggerPayloadSchema, { fulfillWithValue }) => {
    const validationError = validateCheckoutPayload(payload);
    if (validationError) {
      logGACheckoutWarn('checkout', validationError);
      return fulfillWithValue({ data: 'fail' });
    }

    // Step 1 only — drop swatch line items and short-circuit when nothing is
    // trackable. Step 2..5 carry no line items.
    if (payload.checkoutStep === 1) {
      const trackedItems = payload.lineItems.filter((item) => !item.is_swatch && !item.isSwatch);
      if (!trackedItems.length) {
        logGACheckoutWarn('checkout', 'no trackable line items found');
        return fulfillWithValue({ data: 'success' });
      }
      payload = { ...payload, lineItems: trackedItems };
    }

    try {
      const eventPayload: GACheckoutEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_CHECKOUT as GACheckoutEventName,
        eventId: payload.eventId,
        ecommerce: buildGACheckoutEcommerce(payload),
      };
      gaTrack(eventPayload);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logGACheckoutError('checkout', error);
      return fulfillWithValue({ data: 'fail' });
    }
  }
);

/**
 * @description 跟踪 GA purchase (transaction) 事件
 * @scenario 订单支付成功后上报，用于 GA enhanced ecommerce purchase 归因与营收分析
 * @see ../entity/ga-events.schema.ts → PurchaseTriggerPayloadSchema / GAPurchaseEventPayloadSchema
 * @see ../helpers/checkout.helper.ts → buildGAPurchase* helpers
 * @see ../temp-docs/ga.events.md §Schema: purchase
 */
export const trackGAPurchaseEvent = createAsyncThunk(
  'tracking/trackGAPurchaseEvent',
  async (payload: PurchaseTriggerPayloadSchema, { fulfillWithValue }) => {
    try {
      // listener 通常已先过滤一次 Swatch；这里再兜底一次，防止误传
      const trackedItems = payload.lineItems.filter((item) => item.productType !== ProductTypeMapping.SWATCH);
      if (!trackedItems.length) {
        // purchase 是关键事件，仍然上报，只记一条 warn 提示数据端排查
        logGACheckoutWarn('purchase', 'no trackable line items found');
      }

      const transactionFields = buildGAPurchaseTransactionFields(payload.source);
      const actionField = buildGAPurchaseActionField(payload.source);
      const eventDetails = buildGAPurchaseEventDetails(payload.source);

      const eventPayload: GAPurchaseEventPayloadSchema = {
        event: EVENTS_NAMES_MAP.GA_PURCHASE as GAPurchaseEventName,
        eventId: getEventRandomId('Purchase'),
        pageContent: payload.pageContent,
        pageProduct: payload.pageProduct,
        pageCountry: payload.pageCountry,
        pageCat: payload.pageCat,
        pageType: payload.pageType,
        userID: payload.userID,
        userStatus: payload.userStatus,
        userType: payload.userType,
        userEmail: payload.userEmail,
        userPhone: payload.userPhone,
        userEmail2: payload.userEmail2,
        zipcode: payload.zipcode,
        currencyCode: payload.currencyCode,
        transactionId: payload.source.id,
        transactionId2: payload.transactionId2,
        ...transactionFields,
        transactionCountry: payload.transactionCountry,
        customerCity: payload.customerCity,
        ecommerce: {
          currencyCode: payload.currencyCode,
          purchase: {
            actionField,
            products: getGAPurchaseProductsFromOrder(trackedItems),
          },
        },
        ...eventDetails,
      };
      gaTrack(eventPayload);
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logGACheckoutError('purchase', error);
      return fulfillWithValue({ data: 'fail' });
    }
  }
);

/**
 * @description 跟踪 GA swatch purchase 事件（per-swatch `trackEvent`）
 * @scenario 订单含 swatch 商品时与 `trackGAPurchaseEvent` 同时触发；
 *           每个 swatch 一条独立 `trackEvent`，category=Ecommerce / action=Swatch / label=`${sku} | ${name}`。
 * @see ../entity/ga-events.schema.ts → SwatchPurchaseTriggerPayloadSchema / GASwatchPurchaseEventPayloadSchema
 */
export const trackGASwatchPurchaseEvent = createAsyncThunk(
  'tracking/trackGASwatchPurchaseEvent',
  async (payload: SwatchPurchaseTriggerPayloadSchema, { fulfillWithValue }) => {
    if (!payload.swatches.length) {
      logGACheckoutWarn('purchase', 'swatch purchase: empty swatches');
      return fulfillWithValue({ data: 'success' });
    }
    try {
      payload.swatches.forEach(({ sku, name }) => {
        const eventPayload: GASwatchPurchaseEventPayloadSchema = {
          event: EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT as GASwatchPurchaseEventName,
          'eventDetails.category': 'Ecommerce',
          'eventDetails.action': 'Swatch',
          'eventDetails.label': `${sku} | ${name}`,
        };
        gaTrack(eventPayload);
      });
      return fulfillWithValue({ data: 'success' });
    } catch (error) {
      logGACheckoutError('purchase', error);
      return fulfillWithValue({ data: 'fail' });
    }
  }
);
