import { EcEnv, INTL_CURRENCY } from '@castlery/config';
import { logger } from '@castlery/observability/client';
import sha256 from 'crypto-js/sha256';
import encHex from 'crypto-js/enc-hex';
import type { OrderDataV1, OrderLineItemV1, User } from '@castlery/types';
import type {
  CheckoutEcommerceCheckoutSchema,
  CheckoutEcommerceSchema,
  CheckoutStep,
  CheckoutTriggerPayloadSchema,
  GAEccProductSchema,
  GAPurchaseActionFieldSchema,
  GAPurchaseSourceSchema,
  PurchaseTriggerPayloadSchema,
} from '../entity';
import { findBrand, getApproximateTax, getBreadcrumbNames, getOriginalAmount } from './product.helper';
import { getGAEccFormattedProducts, getItemsTotalExclTax } from './product.helper.v2';

export type GACheckoutLogEvent = 'checkout' | 'purchase';

const GA_CHECKOUT_LOG_PREFIX = '[Tracking][GA]';

export const logGACheckoutWarn = (event: GACheckoutLogEvent, reason: string, extra?: Record<string, unknown>): void => {
  logger.warn(`${GA_CHECKOUT_LOG_PREFIX} ${event}: ${reason}`, extra);
};

export const logGACheckoutError = (
  event: GACheckoutLogEvent,
  error: unknown,
  extra?: Record<string, unknown>
): void => {
  logger.error(`${GA_CHECKOUT_LOG_PREFIX} ${event}:`, {
    error,
    ...extra,
  });
};

/**
 * Build the `ecommerce` block for a GA `checkout` step. The discriminated
 * union payload guarantees each step's required fields are present at the
 * type level; this helper just projects them onto the GA shape.
 *
 * Step 1 carries `products` + `value`; step 4/5 carry `option`; step 2/3
 * carry neither.
 */
export const buildGACheckoutEcommerce = (payload: CheckoutTriggerPayloadSchema): CheckoutEcommerceSchema => {
  const step: CheckoutStep = payload.checkoutStep;
  const extras: Partial<CheckoutEcommerceCheckoutSchema> =
    step === 1
      ? {
          products: getGAEccFormattedProducts(payload.lineItems),
          value: getItemsTotalExclTax(payload.lineItems),
        }
      : {};
  const option = step === 4 || step === 5 ? payload.option : null;

  return {
    currencyCode: INTL_CURRENCY!,
    checkout: {
      actionField: { step, option },
      ...extras,
    },
  };
};

// ============================================================================
// GA Purchase (transaction) field calculators
//
// 业务口径以 data team 截图为准，参见 ../temp-docs/ga.events.md §Schema: purchase。
// Source schema 解耦于 OrderDataV1，调用方负责把订单数据投影成 GAPurchaseSourceSchema。
//
// @see ../triggers/checkout.trigger.ts → trackGAPurchaseEvent
// ============================================================================

const toNumber = (value: number | string): number => Number(value) || 0;

/** 多个 promotion 拼接分隔符 —— 与 data team 对齐口径前先用逗号占位。 */
const PROMO_JOIN_SEPARATOR = ',';

/**
 * 计算 GA purchase 事件的 `approximateTax`（估算税额）。
 *
 * - US / CA: 实际 additional tax，直接返回 `taxTotal.toFixed(2)`
 * - AU / SG / UK: 按市场税率从「不含税净额」估算 → `getApproximateTax(amount)`
 *
 * ✍️ 后续会改成后端计算，前端口径作为过渡。
 *
 * @param amount   不含税净额（= `transactionTotal`，即已扣运费 + 服务费）
 * @param taxTotal 实际税额合计（`tax_total`）
 */
export const getGAPurchaseApproximateTax = ({ amount, taxTotal }: { amount: number; taxTotal: number }): string => {
  const country = EcEnv.NEXT_PUBLIC_COUNTRY;
  if (country === 'US' || country === 'CA') {
    return taxTotal.toFixed(2);
  }
  return getApproximateTax(amount);
};

interface GAPurchaseDerivedValues {
  totalNum: number;
  shippingNum: number;
  serviceFeeNum: number;
  transactionTotal: number;
  approximateTax: string;
  transactionTotalNet: number;
  transactionTotalNetActualTax: number;
  shippingPlusService: number;
  promoNames: string;
  couponCode: string;
}

export const deriveGAPurchaseValues = (src: GAPurchaseSourceSchema): GAPurchaseDerivedValues => {
  const totalNum = toNumber(src.total);
  const shippingNum = toNumber(src.shippingListPrice);
  const serviceFeeNum = toNumber(src.serviceFee);
  const transactionTotal = Math.max(totalNum - shippingNum - serviceFeeNum, 0);
  const approximateTax = getGAPurchaseApproximateTax({ amount: transactionTotal, taxTotal: src.taxTotal });
  const transactionTotalNet = Math.max(transactionTotal - toNumber(approximateTax), 0);
  const transactionTotalNetActualTax = Math.max(transactionTotal - src.taxTotal, 0);
  const shippingPlusService = shippingNum + serviceFeeNum;
  const promoNames =
    src.promotions
      ?.map((p) => p.promotionName)
      .filter(Boolean)
      .join(PROMO_JOIN_SEPARATOR) ?? '';
  const couponCode = src.coupon?.code ?? '';

  return {
    totalNum,
    shippingNum,
    serviceFeeNum,
    transactionTotal,
    approximateTax,
    transactionTotalNet,
    transactionTotalNetActualTax,
    shippingPlusService,
    promoNames,
    couponCode,
  };
};

/**
 * 计算 GA purchase 事件的顶层 `transactionXxx` 字段。
 *
 * 业务口径（截图）：
 * - `transactionTotalsh`            = 订单总额（含税含运费 + 服务费）
 * - `transactionTotal`              = max(total − 运费 − 服务费, 0)
 * - `transactionTotalNet`           = max(transactionTotal − 估算税额, 0)
 * - `transactionTotalNetActualTax`  = max(transactionTotal − 实际税额, 0)
 * - `transactionDiscount`           = |discount|（取绝对值）
 * - `transactionPromo`              = 所有 promotion 的 name，多个用 `,` 拼接
 * - `transactionShipping`           = 运费销售价 + 服务费销售价（非折后）
 */
export const buildGAPurchaseTransactionFields = (src: GAPurchaseSourceSchema) => {
  const d = deriveGAPurchaseValues(src);
  return {
    transactionTotalsh: d.totalNum.toFixed(2),
    transactionTotal: d.transactionTotal.toFixed(2),
    transactionTotalNet: d.transactionTotalNet.toFixed(2),
    transactionTotalNetActualTax: d.transactionTotalNetActualTax.toFixed(2),
    transactionDiscount: Math.abs(toNumber(src.discount)).toFixed(2),
    transactionCoupon: d.couponCode,
    transactionPromo: d.promoNames,
    transactionTax: d.approximateTax,
    transactionActualTax: src.taxTotal.toFixed(2),
    transactionShipping: d.shippingPlusService.toFixed(2),
  };
};

/**
 * 计算 GA purchase 事件 `ecommerce.purchase.actionField`。
 *
 * 业务口径（截图）：各字段与顶层 `transactionXxx` 同源
 * - `revenue`  = `transactionTotalNet`
 * - `shipping` = `transactionShipping`（运费 + 服务费销售价）
 * - `tax`      = `transactionTax`（估算税额）
 */
export const buildGAPurchaseActionField = (src: GAPurchaseSourceSchema): GAPurchaseActionFieldSchema => {
  const d = deriveGAPurchaseValues(src);
  return {
    id: src.id,
    revenue: d.transactionTotalNet.toFixed(2),
    shipping: d.shippingPlusService.toFixed(2),
    tax: d.approximateTax,
    coupon: d.couponCode,
  };
};

/**
 * 计算 GA purchase 事件的 `eventDetails.position` 字段（新增）—— 订单绑定的销售姓名。
 */
export const buildGAPurchaseEventDetails = (src: GAPurchaseSourceSchema): { 'eventDetails.position': string } => ({
  'eventDetails.position': src.salesName ?? '',
});

// ============================================================================
// GA Purchase trigger payload assembly（listener / caller side）
// ============================================================================

/**
 * 从 `OrderLineItemV1[]`（order 域）投影为 GA ecommerce products。
 *
 * 计算骨架与 `getGAEccFormattedProduct`（cart 域 `LineItemSchema[]`）一致：
 * 调用相同的 primitive helpers（`getBreadcrumbNames` / `findBrand` /
 * `getOriginalAmount` / `calcWeeks`）以保证字段口径一致。
 *
 * Order 域当前不携带 `productTaxons` / `stockStatus` / `leadTime`，因此：
 * - `category` / `brand` / `dimension1` 走 `getBreadcrumbNames([])` /
 *   `findBrand([])` 的默认分支（空字符串 / `'No Brand'`）
 * - `dimension2` / `dimension4` 暂为空字符串
 *
 * TODO: 数据端确认 order 域是否需要补 taxon / stockStatus / leadTime 字段。
 */
export const getGAPurchaseProductsFromOrder = (lineItems: OrderLineItemV1[]): GAEccProductSchema[] =>
  lineItems.map((item) => {
    const originalPrice = getOriginalAmount(item.salePrice);
    const originalDiscountAmount = getOriginalAmount(Number(item.originalPrice) - Number(item.salePrice));
    const isSale = +originalDiscountAmount > 0;
    const [pageName, subPageName] = getBreadcrumbNames([]);
    const brand = findBrand([]);
    return {
      id: item.sku,
      // 与 `getGAEccFormattedProduct` 一致：用 variant 名（含 material 等选项的全名），
      // 对应 OrderLineItemV1 的 `listName`（`productName` 仅 SPU 名）
      name: item.listName,
      price: originalPrice,
      category: subPageName,
      brand,
      dimension1: pageName,
      dimension2: 'IN_STOCK', // hard code, has confirmed by PM and BE, it will be always in stock when the order is created
      dimension3: isSale ? 'sale' : 'full',
      dimension4: '', // todo: waiting PM and BE to confirm the value
      quantity: item.quantity,
      metric1: isSale ? originalDiscountAmount : '',
    };
  });

const hashOrEmpty = (value: string | undefined | null): string => (value ? encHex.stringify(sha256(value)) : '');

/**
 * 投影 `(order, user)` 为 `PurchaseTriggerPayloadSchema`。
 *
 * - `pageContent` 固定 `'checkout-confirm'`；`pageCat` / `pageType` 固定 `'checkout'`；
 *   `pageProduct` 固定 `'other'`（与 md example 一致）
 * - user 未登录时 `userStatus='logged-out'` / `userType='guest'`
 * - `source.discount` 仅取 `displayPromotionTotal`（不含 coupon 折扣，已与业务对齐）
 * - `source.salesName` 当前 OrderDataV1 无对应字段，留空
 *
 * @see ../temp-docs/ga.events.md §Schema: purchase
 */
/**
 * 把 `OrderDataV1` 投影为 `GAPurchaseSourceSchema`。
 *
 * 抽离的目的：让 GA Purchase 与 Impact UTT Conversion 等下游事件共享同一份
 * 订单金额取数口径（`deriveGAPurchaseValues` 单点收敛），避免各事件重复实现。
 *
 * @see deriveGAPurchaseValues / buildGAPurchaseTransactionFields
 * @see ../../helpers/utt.helper.ts → buildUTTConversionProperties
 */
export const buildGAPurchaseSourceFromOrder = (order: OrderDataV1): GAPurchaseSourceSchema => {
  const summary = order.summary;
  const tax = summary.tax;
  const taxTotal = (Number(tax?.additionalTaxTotal) || 0) + (Number(tax?.includedTaxTotal) || 0);
  const promotionTotal = (+summary.promotionDetails?.displayPromotionTotal || 0) + (+summary.coupon?.amount || 0);

  return {
    id: order.number,
    total: summary.total,
    shippingListPrice: +summary.shippingFee?.sellingTotal || 0,
    serviceFee: +summary.serviceAmount?.sellingTotal || 0,
    taxTotal,
    discount: promotionTotal,
    coupon: summary.coupon ? { code: summary.coupon.code } : undefined,
    promotions: summary.promotionDetails?.promotions?.map((p) => ({ promotionName: p.promotionName })) ?? [],
    salesName: order.salesName ?? '',
  };
};

export const buildGAPurchaseTriggerPayload = ({
  order,
  user,
  lineItems,
}: {
  order: OrderDataV1;
  user: User | null | undefined;
  /** 已过滤 Swatch 的 line items（listener 通常已先过滤一次） */
  lineItems: OrderLineItemV1[];
}): PurchaseTriggerPayloadSchema => {
  const summary = order.summary;
  const source = buildGAPurchaseSourceFromOrder(order);

  const userEmail = user?.emailHashed ?? hashOrEmpty(user?.email);
  const userPhone = user?.phoneHashed ?? hashOrEmpty(user?.phone);

  return {
    pageContent: 'checkout-confirm',
    pageProduct: 'other',
    pageCountry: EcEnv.NEXT_PUBLIC_COUNTRY,
    pageCat: 'checkout',
    pageType: 'checkout',
    userID: user?.id ?? '',
    userStatus: user ? 'logged-in' : 'logged-out',
    userType: user ? 'member' : 'guest',
    userEmail,
    userPhone,
    userEmail2: user?.email ?? '',
    zipcode: order.shipAddress?.zipcode ?? '',
    currencyCode: summary.currency,
    transactionId2: order.referenceNumber ?? '',
    transactionCountry: EcEnv.NEXT_PUBLIC_COUNTRY,
    customerCity: order.shipAddress?.city ?? '',
    source,
    lineItems,
  };
};
