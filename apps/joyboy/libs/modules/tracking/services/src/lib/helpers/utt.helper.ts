import { EcEnv } from '@castlery/config';
import { featureManager } from '@castlery/monorepo-features';
import { logger } from '@castlery/observability';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import type { OrderDataV1, OrderLineItemV1 } from '@castlery/types';
import type {
  UTTConsentEventPropertiesSchema,
  UTTConsentTriggerPayloadSchema,
  UTTConversionEventPropertiesSchema,
  UTTConversionItemSchema,
  UTTConversionTriggerPayloadSchema,
  UTTIdentifyEventPropertiesSchema,
  UTTIdentifyTriggerPayloadSchema,
} from '../entity';
import { buildGAPurchaseSourceFromOrder, buildGAPurchaseTransactionFields } from './checkout.helper';

const UTT_LOG_PREFIX = '[Tracking][LOG] Impact';

export type UTTLogEvent = 'consent' | 'identify' | 'track_conversion' | 'utt_script';

export const logUTTInfo = (event: UTTLogEvent, message: string, extra?: Record<string, unknown>): void => {
  logger.info(`${UTT_LOG_PREFIX} ${event}: ${message}`, extra);
};

export const logUTTWarn = (event: UTTLogEvent, reason: string, extra?: Record<string, unknown>): void => {
  logger.warn(`${UTT_LOG_PREFIX} ${event}: ${reason}`, extra);
};

export const logUTTError = (event: UTTLogEvent, error: unknown, extra?: Record<string, unknown>): void => {
  logger.error(`${UTT_LOG_PREFIX} ${event}:`, { error, ...extra });
};

// ============ feature flag / config getters ============

const getCurrentRegion = (): string => EcEnv.NEXT_PUBLIC_COUNTRY.toUpperCase();

const readPayload = (
  featureName: typeof featureManager.featureName.UTT_IMPACT | typeof featureManager.featureName.UTT_IMPACT_POS
) => {
  if (!featureManager.isFeatureEnabled(featureName)) return null;
  return featureManager.getFeatureFlagPayload(featureName) ?? null;
};

// Web (CA / UK)

export const isUttEnabled = (): boolean => featureManager.isFeatureEnabled(featureManager.featureName.UTT_IMPACT);

export const getUTTCdnUrl = (): string => readPayload(featureManager.featureName.UTT_IMPACT)?.['scriptUrl'] || '';

export const getUTTConversionEventId = (): number =>
  Number(readPayload(featureManager.featureName.UTT_IMPACT)?.['conversionEventId']) || 0;

// POS (SG / AU / US)

export const isPosUttEnabled = (): boolean =>
  featureManager.isFeatureEnabled(featureManager.featureName.UTT_IMPACT_POS);

export const getPosUTTCdnUrl = (): string =>
  readPayload(featureManager.featureName.UTT_IMPACT_POS)?.['scriptUrl'] || '';

export const getPosUTTConversionEventId = (): number =>
  Number(readPayload(featureManager.featureName.UTT_IMPACT_POS)?.['conversionEventId']) || 0;

// ============ payload builders ============

// impact.com docs spec SHA-1, but historical implementation uses SHA-256.
// Keeping SHA-256 to avoid a device-graph attribution gap on existing users;
// revisit during a planned cutover.
const hashEmail = (email: string | undefined): string => (email ? encHex.stringify(sha256(email)) : '');

const toCustomerId = (id: string | number | undefined): string => (id == null ? '' : String(id));

// data team 规约：UK 用 customerid（小写），其他 market 用 customerId（驼峰）
const buildCustomerIdentity = (id: string | number | undefined) => {
  const customerId = toCustomerId(id);
  return getCurrentRegion() === 'UK' ? ({ customerid: customerId } as const) : ({ customerId } as const);
};

// data team 规约：
//   UK 用 orderid（小写），取 order.number（R 开头）
//   CA 用 orderId（驼峰），取 order.number（R 开头）
//   US / SG / AU 用 orderId（驼峰），取 order.referenceNumber
const buildOrderIdentity = (order: OrderDataV1) => {
  const region = getCurrentRegion();
  if (region === 'UK') return { orderid: order.number || '' } as const;
  if (region === 'CA') return { orderId: order.number || '' } as const;
  return { orderId: order.referenceNumber || '' } as const;
};

const toImpactItems = (lineItems: OrderLineItemV1[]): UTTConversionItemSchema[] =>
  lineItems.map((lineItem) => ({
    subTotal: Number(lineItem.amount) || Number(lineItem.salePrice) * lineItem.quantity || 0,
    category: lineItem.productType || '',
    sku: lineItem.sku,
    quantity: lineItem.quantity,
    name: lineItem.listName,
  }));

export const buildUTTConsentProperties = (
  payload: UTTConsentTriggerPayloadSchema
): UTTConsentEventPropertiesSchema => ({
  tracking: payload.granted ? 'granted' : 'denied',
});

export const buildUTTIdentifyProperties = (
  payload: UTTIdentifyTriggerPayloadSchema
): UTTIdentifyEventPropertiesSchema => ({
  ...buildCustomerIdentity(payload.user?.id),
  customeremail: hashEmail(payload.user?.email),
});

export const buildUTTConversionProperties = (
  payload: UTTConversionTriggerPayloadSchema
): UTTConversionEventPropertiesSchema | null => {
  const { order, user } = payload;
  const lineItems = order.shipments.flatMap((shipment) => shipment.lineItems);
  if (!lineItems.length) return null;

  // 金额口径与 GA Purchase 单点收敛：共用 buildGAPurchaseSourceFromOrder → buildGAPurchaseTransactionFields，
  // 避免 shipping / tax / discount 等字段在多个事件中各自实现导致漂移。
  const source = buildGAPurchaseSourceFromOrder(order);
  const tx = buildGAPurchaseTransactionFields(source);

  return {
    ...buildCustomerIdentity(user?.id),
    ...buildOrderIdentity(order),
    customeremail: hashEmail(user?.email),
    customerStatus: order.firstPurchase ? 'true' : 'false',
    currencyCode: order.summary?.currency || '',
    orderPromoCode: tx.transactionCoupon,
    Note: tx.transactionPromo,
    orderDiscount: tx.transactionDiscount,
    orderShipping: tx.transactionShipping,
    orderTax: tx.transactionTax,
    customerCity: order.shipAddress?.city || '',
    items: toImpactItems(lineItems),
  };
};
