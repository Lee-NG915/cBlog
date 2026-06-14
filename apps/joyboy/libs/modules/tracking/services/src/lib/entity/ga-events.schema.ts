import type { LineItemSchema, OrderLineItemV1 } from '@castlery/types';

/**
 * Schema for the GA `checkout` event payload that is pushed to the
 * GTM dataLayer via `gaTrack` from `triggers/checkout.trigger.ts`.
 *
 * Source of truth for the `params` object built inside
 * `trackCheckoutActionEvent` before it is forwarded to GA.
 *
 *   gaTrack({
 *     event: 'checkout',
 *     eventId: 'checkout_...',
 *     ecommerce: {
 *       currencyCode: 'SGD' | 'USD' | ...,
 *       checkout: { actionField, products?, value? },
 *     },
 *   });
 *
 * @see ../triggers/checkout.trigger.ts
 * @see ../helpers/product.helper.ts (getProductNeedTracking)
 */

/**
 * GA event name for the checkout step events.
 * Mirrors `EVENTS_NAMES_MAP.GA_CHECKOUT`.
 */
export type GACheckoutEventName = 'checkout';

/**
 * Allowed checkout funnel steps tracked by `trackCheckoutActionEvent`.
 *
 * - 1: enter checkout (carries `products` + `value`)
 * - 2: shipping address step completed
 * - 3: shipping address review (reserved — no caller today)
 * - 4: shipping method completed (carries `actionField.option`)
 * - 5: payment method selected (carries `actionField.option`)
 */
export type CheckoutStep = 1 | 2 | 3 | 4 | 5;

/**
 * Step 1 — entered checkout. Carries cart line items + subtotal so
 * `buildGACheckoutEcommerce` can populate `products` + `value`.
 */
export interface CheckoutStep1TriggerPayload {
  checkoutStep: 1;
  eventId: string;
  lineItems: LineItemSchema[];
  itemTotal: string;
}

/** Step 2 — shipping address step completed. */
export interface CheckoutStep2TriggerPayload {
  checkoutStep: 2;
  eventId: string;
}

/** Step 3 — shipping address review. Reserved; no caller today. */
export interface CheckoutStep3TriggerPayload {
  checkoutStep: 3;
  eventId: string;
}

/**
 * Step 4 — shipping method completed. `option` is the final GA value,
 * resolved upstream by the dispatcher:
 *   - SG: assembly preference slug
 *   - non-SG: selected shipping service type
 */
export interface CheckoutStep4TriggerPayload {
  checkoutStep: 4;
  eventId: string;
  option: string;
}

/** Step 5 — payment method selected. `option` is the payment method id. */
export interface CheckoutStep5TriggerPayload {
  checkoutStep: 5;
  eventId: string;
  option: string;
}

/**
 * Input payload accepted by `trackCheckoutActionEvent`. Discriminated union
 * by `checkoutStep` so each step receives only the fields it needs and the
 * trigger / helper can narrow exhaustively.
 *
 * @see ../triggers/checkout.trigger.ts
 */
export type CheckoutTriggerPayloadSchema =
  | CheckoutStep1TriggerPayload
  | CheckoutStep2TriggerPayload
  | CheckoutStep3TriggerPayload
  | CheckoutStep4TriggerPayload
  | CheckoutStep5TriggerPayload;

/**
 * `actionField` describes the funnel step plus a context-dependent option.
 *
 * `option` semantics by step:
 * - step 4 (SG):  assembly preference slug
 * - step 4 (non-SG): selected shipping service type
 * - step 5: payment method id
 * - other steps: null
 */
export interface CheckoutActionFieldSchema {
  step: CheckoutStep;
  option: string | null;
}

/**
 * GA Enhanced Ecommerce product line item in `ecommerce.*.products[]`
 * (checkout, add, remove). Serialized to the GTM dataLayer via `gaTrack`.
 *
 * GA Enhanced Ecommerce 商品行，位于 `ecommerce.*.products[]`（checkout / add / remove），
 * 经 `gaTrack` 序列化至 GTM dataLayer。
 *
 * @see ../helpers/product.helper.ts (`getProductNeedTracking`)
 * @see ../helpers/product.helper.v2.ts (`getGAEccFormattedProduct`)
 */
export interface GAEccProductSchema {
  /** Variant SKU. / 变体 SKU。 */
  id: string;
  /** Variant display name. / 变体展示名称。 */
  name: string;
  /** Unit price excluding tax; market tax divisor applied via `getOriginalAmount`.
   * 不含税单价；经 `getOriginalAmount` 按市场税率折算。
   */
  price: string;
  /** Level-2 taxon name (sub-category). / 二级分类（taxon level 2）名称。 */
  category: string;
  /** Collection name from taxons (`Collections` ancestor); defaults to `'No Brand'`.
   * 从 taxon 解析的系列名（`Collections` 祖先节点）；缺省为 `'No Brand'`。
   */
  brand: string;
  /** Level-1 taxon name (primary category). Mapped to GA custom dimension 1.
   * 一级分类（taxon level 1）名称；对应 GA 自定义维度 1。
   */
  dimension1: string;
  /** Stock status: `IN_STOCK` | `OUT_OF_STOCK` | `IN_STOCK_SOON`. Mapped to GA custom dimension 2. / 库存状态；对应 GA 自定义维度 2。 */
  dimension2: string;
  /** Pricing state: `'sale'` when `listPrice > price`, otherwise `'full'`. Mapped to GA custom dimension 3.
   * 定价状态：有折扣为 `'sale'`，否则 `'full'`；对应 GA 自定义维度 3。
   */
  dimension3: 'sale' | 'full';
  /** Delivery lead-time bucket (e.g. `0-1 weeks`) or `'Long Time'` when out of stock. Mapped to GA custom dimension 4.
   * 交期区间（如 `0-1 weeks`），缺货时为 `'Long Time'`；对应 GA 自定义维度 4。
   */
  dimension4: string;
  /** Absolute unit count: line-item quantity at checkout, or `|quantityDifference|` for cart add/remove.
   * 绝对数量：checkout时，为line item 数量，加购/减购是为 `|quantity difference|`，正数为加购，负数为减购。
   */
  quantity: number;
  /** Per-unit discount excluding tax when on sale; empty string otherwise. Mapped to GA custom metric 1.
   * 促销时为单位不含税折扣额，否则为空字符串；对应 GA 自定义指标 1。
   */
  metric1: string;
  /** Optional line revenue delta (`quantity difference × unit price` excl. tax) for cart add/remove only. Mapped to GA custom metric 2.
   * 可选；仅加购/减购时写入行金额变动（`quantity difference × 不含税单价`）, 正数为加购，负数为减购；对应 GA 自定义指标 2。
   */
  metric2?: string;
}

/**
 * Inner `ecommerce.checkout` block.
 * `products` and `value` are only populated on step 1 (enter checkout).
 */
export interface CheckoutEcommerceCheckoutSchema {
  actionField: CheckoutActionFieldSchema;
  products?: GAEccProductSchema[];
  value?: string;
}

/**
 * Full `ecommerce` block of the GA checkout event.
 */
export interface CheckoutEcommerceSchema {
  /** ISO 4217 currency code from `EcEnv.NEXT_PUBLIC_CURRENCY`. */
  currencyCode: string;
  checkout: CheckoutEcommerceCheckoutSchema;
}

/**
 * Top-level payload pushed to the GTM dataLayer for a checkout step event.
 * This is the shape consumed by `gaTrack(params)`.
 */
export interface GACheckoutEventPayloadSchema {
  event: GACheckoutEventName;
  /** Unique event id generated by `getEventRandomId('checkout')`. */
  eventId: string;
  ecommerce: CheckoutEcommerceSchema;
}

// ============================================================================
// GA Purchase (transaction) event
//
// Schema for the GA `transaction` event payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/checkout.trigger.ts` → `trackGAPurchaseEvent`.
//
//   gaTrack({
//     event: 'transaction',
//     eventId: 'Purchase_...',
//     ...transactionFields,
//     ecommerce: { currencyCode, purchase: { actionField, products } },
//   });
//
// 字段含义待补充。
// @see ../triggers/checkout.trigger.ts → trackGAPurchaseEvent
// @see ../temp-docs/ga.events.md §Purchase
// ============================================================================

/**
 * GA event name for the purchase event. Mirrors `EVENTS_NAMES_MAP.GA_PURCHASE`.
 */
export type GAPurchaseEventName = 'transaction';

/**
 * `actionField` inside `ecommerce.purchase`.
 */
export interface GAPurchaseActionFieldSchema {
  /** */
  id: string;
  /** */
  revenue: string;
  /** */
  shipping: string;
  /** */
  tax: string;
  /** */
  coupon: string;
}

/**
 * Inner `ecommerce.purchase` block. `products` reuses `GAEccProductSchema`
 * (same shape as the checkout step-1 product list, built by
 * `getGAEccFormattedProducts`).
 */
export interface GAPurchaseEcommercePurchaseSchema {
  actionField: GAPurchaseActionFieldSchema;
  products: GAEccProductSchema[];
}

/**
 * Full `ecommerce` block of the GA purchase event.
 */
export interface GAPurchaseEcommerceSchema {
  /** */
  currencyCode: string;
  purchase: GAPurchaseEcommercePurchaseSchema;
}

/**
 * Source order data consumed by GA purchase field calculators
 * (`buildGAPurchaseTransactionFields` / `buildGAPurchaseActionField` /
 * `buildGAPurchaseEventDetails`). Caller projects an order onto this shape.
 *
 * 金额字段允许 `number | string`，统一在 helper 内 `Number()` 化。
 */
export interface GAPurchaseSourceSchema {
  /** 订单号（R-prefix），对应 `transactionId` / `actionField.id` */
  id: string;
  /** 订单总额（含税 + 含运费 + 含服务费） */
  total: number | string;
  /** 运费销售价（非折后） */
  shippingListPrice: number | string;
  /** 服务费销售价（非折后） */
  serviceFee: number | string;
  /** 实际税额合计（`tax_total`，含 excl/incl 税） */
  taxTotal: number;
  /** 订单总优惠额（含 coupon 与 Campaign）；helper 内取绝对值输出 */
  discount: number | string;
  /** 订单应用的 coupon；无则不传 */
  coupon?: { code: string };
  /** 订单应用的 promotions；无或空数组 → `transactionPromo` 为空字符串 */
  promotions?: { promotionName: string }[];
  /** 订单绑定的销售姓名；用于 `eventDetails.position` */
  salesName?: string;
}

/**
 * Input payload accepted by `trackGAPurchaseEvent`. Caller passes page /
 * user / order-meta context plus raw `source` order data and `lineItems`;
 * the trigger derives all `transactionXxx` fields, the ecommerce block and
 * `eventDetails.position` via helpers, then fills in `event` + `eventId`.
 *
 * @see ../helpers/checkout.helper.ts (buildGAPurchase* helpers)
 * @see ../temp-docs/ga.events.md §Schema: purchase
 */
export interface PurchaseTriggerPayloadSchema {
  // —— Page context ——
  /** 固定为 `checkout-confirm` */
  pageContent: string;
  pageProduct: string;
  pageCountry: string;
  pageCat: string;
  pageType: string;

  // —— User ——
  userID: number | string;
  userStatus: string;
  /** hashed */
  userEmail: string;
  /** hashed */
  userPhone: string;
  /** plain email */
  userEmail2: string;
  userType: string;
  zipcode: string;

  // —— Order meta（不可派生的订单元数据）——
  /** 币种：`USD` / `SGD` / `AUD` / `GBP` / `CAD`，顶层与 `ecommerce.currencyCode` 共用 */
  currencyCode: string;
  /** reference number（与 `source.id` 不同） */
  transactionId2: string;
  /** 当前国家 */
  transactionCountry: string;
  /** 订单城市 */
  customerCity: string;

  /**
   * 源订单数据，trigger 内派生 `transactionXxx` / `actionField` /
   * `eventDetails.position`。顶层 `transactionId` 复用 `source.id`。
   */
  source: GAPurchaseSourceSchema;

  /**
   * Order 域的 line items（来自 `order.shipments[].lineItems`）；
   * trigger 内部过滤 Swatch 后再生成 `products[]`。
   */
  lineItems: OrderLineItemV1[];
}

/**
 * Top-level payload pushed to the GTM dataLayer for the purchase event.
 * Shape consumed by `gaTrack(params)` — mirrors `Schema: purchase` in
 * `temp-docs/ga.events.md` exactly.
 */
export interface GAPurchaseEventPayloadSchema {
  /** 固定为 `transaction` */
  event: GAPurchaseEventName;
  /** Unique event id generated by `getEventRandomId('Purchase')`. */
  eventId: string;

  // —— Page context ——
  pageContent: string;
  pageProduct: string;
  pageCountry: string;
  pageCat: string;
  pageType: string;

  // —— User ——
  userID: number | string;
  userStatus: string;
  userType: string;
  userEmail: string;
  userPhone: string;
  userEmail2: string;
  zipcode: string;

  // —— Currency / order id ——
  currencyCode: string;
  /** order number — same as `source.id` */
  transactionId: string;
  /** reference number */
  transactionId2: string;

  // —— Derived from source（buildGAPurchaseTransactionFields）——
  /** 订单总额，含税含运费（用户支付金额） */
  transactionTotalsh: string;
  /** `max(total - shipping - serviceFee, 0)` */
  transactionTotal: string;
  /** `max(transactionTotal - 估算税额, 0)` */
  transactionTotalNet: string;
  /** `max(transactionTotal - 实际税额, 0)` */
  transactionTotalNetActualTax: string;
  /** 订单总优惠额，取绝对值 */
  transactionDiscount: string;
  /** coupon code，无则为空 */
  transactionCoupon: string;
  /** promotion names，多个用 `,` 拼接，无则为空 */
  transactionPromo: string;
  /** 估算税额 ✍️ 后续会改成后端计算 */
  transactionTax: string;
  /** 实际税额（`tax_total`） */
  transactionActualTax: string;
  /** 运费 + 服务费销售价（非折后） */
  transactionShipping: string;

  transactionCountry: string;
  customerCity: string;

  ecommerce: GAPurchaseEcommerceSchema;

  /** 订单绑定的销售姓名；未绑定时为空字符串 */
  'eventDetails.position': string;
}

// ============================================================================
// GA Swatch Purchase (trackEvent) event
//
// Per-swatch `trackEvent` 上报，与 GA purchase 同时触发（订单中含 swatch 商品时）。
// 由 `triggers/checkout.trigger.ts` → `trackGASwatchPurchaseEvent` 派发。
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'Ecommerce',
//     'eventDetails.action': 'Swatch',
//     'eventDetails.label': `${sku} | ${name}`,
//   });
// ============================================================================

export type GASwatchPurchaseEventName = 'trackEvent';
export type GASwatchPurchaseCategory = 'Ecommerce';
export type GASwatchPurchaseAction = 'Swatch';

/** 单条 swatch line item 投影（trigger 接收数组） */
export interface SwatchPurchaseItemSchema {
  sku: string;
  /** 变体名（含 material 等选项），对应 OrderLineItemV1.listName */
  name: string;
}

/** `trackGASwatchPurchaseEvent` 输入：batch swatches，trigger 内逐条 push */
export interface SwatchPurchaseTriggerPayloadSchema {
  swatches: SwatchPurchaseItemSchema[];
}

/** 单条 swatch event 最终推到 dataLayer 的结构 */
export interface GASwatchPurchaseEventPayloadSchema {
  event: GASwatchPurchaseEventName;
  'eventDetails.category': GASwatchPurchaseCategory;
  'eventDetails.action': GASwatchPurchaseAction;
  'eventDetails.label': string;
}

export type GAClickPaymentMethodEventName = 'trackEvent';
export type GAClickPaymentMethodCategory = 'pay' | 'repay';
export type GAClickPaymentMethodAction = 'click_payment_method';

export interface ClickPaymentMethodTriggerPayloadSchema {
  category: GAClickPaymentMethodCategory;
  label: string;
}

export interface GAClickPaymentMethodEventPayloadSchema {
  event: GAClickPaymentMethodEventName;
  'eventDetails.category': GAClickPaymentMethodCategory;
  'eventDetails.action': GAClickPaymentMethodAction;
  'eventDetails.label': string;
}

// ============================================================================
// GA Shipping Selector (zipcode_shipping_calculator) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/shipping-events.trigger.ts` → `trackShippingSelectorEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'zipcode_shipping_calculator',
//     'eventDetails.action': '<ShippingSelectorAction>',
//     'eventDetails.label': '<ShippingSelectorLabel>',
//   });
//
// Drivers (UI 入口) dispatch per-domain interaction events; the
// `shipping-tracking.listener` aggregates and maps them onto this trigger.
//
// @see ../triggers/shipping-events.trigger.ts → trackShippingSelectorEvent
// @see ../listeners/shipping-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Shipping Selector
// ============================================================================

/**
 * GA event name for the shipping-selector event. Uses the generic
 * `trackEvent` channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GAShippingSelectorEventName = 'trackEvent';

/**
 * GA `eventDetails.category` value for the shipping-selector event.
 */
export type GAShippingSelectorCategory = 'zipcode_shipping_calculator';

/**
 * `eventDetails.action` enum — distinguishes click vs submit and
 * default-zipcode (PDP/PLP entry) vs shipping-calculator (cart/checkout entry).
 *
 * - `click_default_zipcode`: user clicked the inline zipcode link (PDP/PLP)
 * - `click_submit_zipcode`: user submitted zipcode in the PDP/PLP shipping-location modal
 * - `click_shipping_calculator`: user opened the shipping calculator modal (cart/checkout)
 * - `submit_shipping_calculator`: user submitted zipcode in the cart/checkout shipping calculator modal
 */
export type ShippingSelectorAction =
  | 'click_default_zipcode'
  | 'click_submit_zipcode'
  | 'click_shipping_calculator'
  | 'submit_shipping_calculator';

/**
 * `eventDetails.label` enum — identifies the surface where the
 * interaction originated. The `_banner` variants flag the cart promotion-hint
 * banner entry (distinct from the cart action button entry).
 */
export type ShippingSelectorLabel =
  | 'PDP'
  | 'PLA'
  | 'Quickship'
  | 'Fullcart'
  | 'Minicart'
  | 'Fullcart_banner'
  | 'Minicart_banner'
  | 'Ordersummary';

/**
 * Input payload accepted by `trackShippingSelectorEvent`.
 *
 * Both `action` and `label` are required — the trigger no longer derives a
 * default label from page context; callers (the tracking listener) must
 * supply the label explicitly based on the originating UI surface.
 */
export interface ShippingSelectorTriggerPayloadSchema {
  action: ShippingSelectorAction;
  label: ShippingSelectorLabel;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the shipping-selector
 * event. Shape consumed by `gaTrack(params)`. Field names use the dotted
 * GTM convention (`'eventDetails.category'`) and are quoted in TS.
 */
export interface GAShippingSelectorEventPayloadSchema {
  event: GAShippingSelectorEventName;
  'eventDetails.category': GAShippingSelectorCategory;
  'eventDetails.action': ShippingSelectorAction;
  'eventDetails.label': ShippingSelectorLabel;
}

// ============================================================================
// GA Refresh Cart (refresh_cart) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/cart-events.trigger.ts` → `trackRefreshCartEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'refresh_cart',
//     'eventDetails.label': '<RefreshCartLabel>',
//   });
//
// Driver: cart `<CartRefreshButton>` onClick dispatches the cart-domain
// interaction event; `cart-tracking.listener` forwards it to this trigger.
//
// @see ../triggers/cart-events.trigger.ts → trackRefreshCartEvent
// @see ../listeners/cart-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Refresh Cart
// ============================================================================

/**
 * GA event name for the refresh-cart event. Uses the generic `trackEvent`
 * channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GARefreshCartEventName = 'trackEvent';

/**
 * GA `eventDetails.category` value for the refresh-cart event.
 */
export type GARefreshCartCategory = 'refresh_cart';

/**
 * `eventDetails.label` enum — identifies the cart surface where the user
 * clicked the refresh button.
 *
 * - `miniCart` — refresh button inside the mini cart panel
 * - `fullCart` — refresh button on the full cart page
 */
export type RefreshCartLabel = 'miniCart' | 'fullCart';

/**
 * Input payload accepted by `trackRefreshCartEvent`. `label` is supplied by
 * the listener directly from the cart-domain interaction event's `surface`
 * field — the trigger does not read any page context.
 */
export interface RefreshCartTriggerPayloadSchema {
  label: RefreshCartLabel;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the refresh-cart event.
 * Shape consumed by `gaTrack(params)`.
 */
export interface GARefreshCartEventPayloadSchema {
  event: GARefreshCartEventName;
  'eventDetails.category': GARefreshCartCategory;
  'eventDetails.label': RefreshCartLabel;
}

// ============================================================================
// GA Click Cart Icon (click_cart_icon) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/cart-events.trigger.ts` →
// `trackGAClickCartIconEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'click_cart_icon',
//   });
//
// Driver: website navigation cart icon click. The UI dispatches the product-
// domain `cartIconClickedEvent`; the web tracking listener forwards it here.
//
// @see ../triggers/cart-events.trigger.ts → trackGAClickCartIconEvent
// @see ../listeners/tracking.listener.ts
// @see ../temp-docs/ga.events.md §Click Cart Icon
// ============================================================================

export type GAClickCartIconEventName = 'trackEvent';

export type GAClickCartIconCategory = 'click_cart_icon';

export interface GAClickCartIconEventPayloadSchema {
  event: GAClickCartIconEventName;
  'eventDetails.category': GAClickCartIconCategory;
}

export type GAClickCheckoutEventName = 'trackEvent';
export type GAClickCheckoutCategory = 'cart_summary';
export type GAClickCheckoutAction = 'click_checkout';
export type ClickCheckoutTriggerPosition = 'miniCart' | 'fullCart';
export type GAClickCheckoutPosition = 'mini_cart' | 'full_cart';

export interface ClickCheckoutTriggerPayloadSchema {
  position: ClickCheckoutTriggerPosition;
}

export interface GAClickCheckoutEventPayloadSchema {
  event: GAClickCheckoutEventName;
  'eventDetails.category': GAClickCheckoutCategory;
  'eventDetails.action': GAClickCheckoutAction;
  'eventDetails.position': GAClickCheckoutPosition;
}

export type GAViewProductRecommendationEventName = 'trackEvent';
export type GAViewProductRecommendationCategory = 'cart_recommendation';
export type GAViewProductRecommendationAction = 'view_product_recommendation';
export type ViewProductRecommendationTriggerPosition = 'miniCart' | 'fullCart' | 'others';
export type GAViewProductRecommendationPosition = 'mini_cart' | 'full_cart' | 'others';

export interface ViewProductRecommendationTriggerPayloadSchema {
  label: string;
  position: ViewProductRecommendationTriggerPosition;
}

export interface GAViewProductRecommendationEventPayloadSchema {
  event: GAViewProductRecommendationEventName;
  'eventDetails.category': GAViewProductRecommendationCategory;
  'eventDetails.action': GAViewProductRecommendationAction;
  'eventDetails.label': string;
  'eventDetails.position': GAViewProductRecommendationPosition;
}

// ============================================================================
// GA Outdated Banner Impression (price_change / out_of_stock) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/ga-impression-events.trigger.ts` →
// `trackGAOutdatedBannerImpressionEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'price_change_banner_impression' | 'out_stock_banner_impression',
//     'eventDetails.label': '<sku> | <variant name>',
//   });
//
// Driver: `WebCartItem` renders `<OutDatedNotice />` when `isItemOutdated(item)`
// returns true, then dispatches the cart-domain `cartOutdatedBannerImpressionEvent`
// from a `useEffect`. `cart-tracking.listener` aggregates it and maps the
// `kind` to the corresponding GA category.
//
// @see ../triggers/ga-impression-events.trigger.ts → trackGAOutdatedBannerImpressionEvent
// @see ../listeners/cart-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Outdated Banner Impression
// ============================================================================

/**
 * GA event name for the outdated-banner impression event. Uses the generic
 * `trackEvent` channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GAOutdatedBannerImpressionEventName = 'trackEvent';

/**
 * Kind enum carried by the cart-domain interaction event. Maps 1:1 to the GA
 * `eventDetails.category` value via `OUTDATED_BANNER_CATEGORY_BY_KIND`.
 *
 * - `price_change`: cart item's price is outdated (variant list/sell price changed)
 * - `out_of_stock`: cart item is out of stock or region-outdated
 */
export type OutdatedBannerKind = 'price_change' | 'out_of_stock';

/**
 * GA `eventDetails.category` values for the two banner variants. The category
 * string is the only field that distinguishes the two impressions on the GA
 * side; the legacy event names (`EVENT_PRICE_CHANGED_BANNER_IMPRESSION` /
 * `EVENT_OUT_OF_STOCK_BANNER_IMPRESSION`) are not propagated.
 */
export type GAOutdatedBannerCategory = 'price_change_banner_impression' | 'out_stock_banner_impression';

/**
 * Input payload accepted by `trackGAOutdatedBannerImpressionEvent`. The
 * listener is responsible for resolving the dynamic `label` (typically
 * `${sku} | ${variant.name}`) from the source line item.
 */
export interface OutdatedBannerImpressionTriggerPayloadSchema {
  kind: OutdatedBannerKind;
  label: string;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the outdated-banner
 * impression event. Shape consumed by `gaTrack(params)`.
 */
export interface GAOutdatedBannerImpressionEventPayloadSchema {
  event: GAOutdatedBannerImpressionEventName;
  'eventDetails.category': GAOutdatedBannerCategory;
  'eventDetails.label': string;
}

// ============================================================================
// GA Applied Coupon (add_coupon) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/coupon-events.trigger.ts` →
// `trackGAAppliedCouponEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'cart_coupon' | 'checkout_shipping_address' | ...,
//     'eventDetails.action': 'add_coupon',
//     'eventDetails.label': '<coupon code>',
//   });
//
// Driver: successful apply-coupon command from cart or checkout. The UI/service
// command supplies the category in the promotion-domain
// `appliedCouponActionSucceededEvent`; the tracking trigger does not read route
// state.
//
// @see ../triggers/coupon-events.trigger.ts → trackGAAppliedCouponEvent
// @see ../listeners/promotion-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Applied Coupon
// ============================================================================

/**
 * GA event name for the applied-coupon event. Uses the generic `trackEvent`
 * channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GAAppliedCouponEventName = 'trackEvent';

/**
 * GA `eventDetails.category` values for successfully applying a coupon.
 */
export type GAAppliedCouponCategory =
  | 'cart_coupon'
  | 'checkout_shipping_address'
  | 'checkout_shipping_method'
  | 'checkout_payment';

/**
 * GA `eventDetails.action` value for the applied-coupon event.
 */
export type GAAppliedCouponAction = 'add_coupon';

/**
 * Input payload accepted by `trackGAAppliedCouponEvent`.
 */
export interface AppliedCouponTriggerPayloadSchema {
  /** Coupon code that was successfully applied. */
  couponCode: string;
  /** Surface-specific GA category supplied by the promotion-domain event. */
  category: GAAppliedCouponCategory;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the applied-coupon event.
 * Shape consumed by `gaTrack(params)`.
 */
export interface GAAppliedCouponEventPayloadSchema {
  event: GAAppliedCouponEventName;
  'eventDetails.category': GAAppliedCouponCategory;
  'eventDetails.action': GAAppliedCouponAction;
  'eventDetails.label': string;
}

// ============================================================================
// GA Click Redeemable Voucher (coupon_wallet_dropdown_list) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/coupon-events.trigger.ts` →
// `trackClickRedeemableVoucherEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'coupon_wallet_dropdown_list',
//     'eventDetails.action': 'click_redeemable_voucher',
//     'eventDetails.label': '<credits cost>',
//   });
//
// Driver: any surface that renders `<CouponWalletAutocomplete>` (full cart /
// mini cart / checkout-shipping-address / checkout-shipping-method /
// checkout-payment). The dropdown CREDITS row click dispatches the
// promotion-domain `redeemableVoucherClickedEvent`; the promotion-tracking
// listener forwards it here.
//
// @see ../triggers/coupon-events.trigger.ts → trackClickRedeemableVoucherEvent
// @see ../listeners/promotion-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Click Redeemable Voucher
// ============================================================================

/**
 * GA event name for the click-redeemable-voucher event. Uses the generic
 * `trackEvent` channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GAClickRedeemableVoucherEventName = 'trackEvent';

/**
 * GA `eventDetails.category` value for the click-redeemable-voucher event.
 */
export type GAClickRedeemableVoucherCategory = 'coupon_wallet_dropdown_list';

/**
 * GA `eventDetails.action` value for the click-redeemable-voucher event.
 */
export type GAClickRedeemableVoucherAction = 'click_redeemable_voucher';

/**
 * Input payload accepted by `trackClickRedeemableVoucherEvent`. `label` is the
 * credits cost shown on the dropdown row, supplied verbatim by the promotion-
 * domain interaction event payload — the trigger does not read any UI state.
 */
export interface ClickRedeemableVoucherTriggerPayloadSchema {
  /** Credits cost displayed on the dropdown row (`CouponWalletOption.cost`), stringified. */
  label: string;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the click-redeemable-voucher
 * event. Shape consumed by `gaTrack(params)`.
 */
export interface GAClickRedeemableVoucherEventPayloadSchema {
  event: GAClickRedeemableVoucherEventName;
  'eventDetails.category': GAClickRedeemableVoucherCategory;
  'eventDetails.action': GAClickRedeemableVoucherAction;
  'eventDetails.label': string;
}

// ============================================================================
// GA Campaign Progress Bar Link Click (campaign_progress_bar_link_click) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/coupon-events.trigger.ts` →
// `trackGACampaignProgressBarLinkClickEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'campaign_progress_bar_link_click',
//     'eventDetails.action': '<campaign name>',
//     'eventDetails.method': '<discount label>',
//   });
//
// Driver: the progress-bar link in promotion-domain price-break hints. The UI
// dispatches `campaignProgressBarLinkClickedEvent`; the promotion-tracking
// listener forwards it here.
//
// @see ../triggers/coupon-events.trigger.ts → trackGACampaignProgressBarLinkClickEvent
// @see ../listeners/promotion-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Campaign Progress Bar Link Click
// ============================================================================

/**
 * GA event name for the campaign-progress-bar-link-click event. Uses the
 * generic `trackEvent` channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GACampaignProgressBarLinkClickEventName = 'trackEvent';

/**
 * GA `eventDetails.category` value for the campaign-progress-bar-link-click event.
 */
export type GACampaignProgressBarLinkClickCategory = 'campaign_progress_bar_link_click';

/**
 * Input payload accepted by `trackGACampaignProgressBarLinkClickEvent`.
 */
export interface CampaignProgressBarLinkClickTriggerPayloadSchema {
  /** Campaign name displayed in the progress-bar link text. */
  campaignName: string;
  /** Current discount label displayed in the progress bar, e.g. `$20 off`. */
  discount: string;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the campaign-progress-bar
 * link-click event. Shape consumed by `gaTrack(params)`.
 */
export interface GACampaignProgressBarLinkClickEventPayloadSchema {
  event: GACampaignProgressBarLinkClickEventName;
  'eventDetails.category': GACampaignProgressBarLinkClickCategory;
  'eventDetails.action': string;
  'eventDetails.method': string;
}

// ============================================================================
// GA Choose Free Gift (choose_free_gift) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/coupon-events.trigger.ts` →
// `trackGAChooseFreeGiftEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'choose_free_gift',
//     'eventDetails.label': '<miniCart | fullCart>',
//   });
//
// Driver: the Choose your gift entry in cart / mini-cart promotion hints. The
// UI dispatches `chooseFreeGiftClickedEvent`; the promotion-tracking listener
// forwards it here.
//
// @see ../triggers/coupon-events.trigger.ts → trackGAChooseFreeGiftEvent
// @see ../listeners/promotion-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Choose Free Gift
// ============================================================================

export type GAChooseFreeGiftEventName = 'trackEvent';

export type GAChooseFreeGiftCategory = 'choose_free_gift';

export type GAChooseFreeGiftLabel = 'miniCart' | 'fullCart';

export interface ChooseFreeGiftTriggerPayloadSchema {
  /** Cart surface that rendered the Choose your gift entry. */
  label: GAChooseFreeGiftLabel;
}

export interface GAChooseFreeGiftEventPayloadSchema {
  event: GAChooseFreeGiftEventName;
  'eventDetails.category': GAChooseFreeGiftCategory;
  'eventDetails.label': GAChooseFreeGiftLabel;
}

// ============================================================================
// GA GWP Add To Cart (gwp_add_to_cart) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/coupon-events.trigger.ts` →
// `trackGAGwpAddToCartEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'gwp_add_to_cart',
//     'eventDetails.action': 'cart_event',
//     'eventDetails.label': '<miniCart | fullCart>',
//     'eventDetails.gift_id': '<gift sku>',
//   });
//
// Driver: successful free-gift add-to-cart. Cart services dispatch
// `addedGiftActionSucceededEvent`; the cart-tracking listener forwards it here
// and also triggers the global add_to_cart event with `atc_type=free_gift`.
//
// @see ../triggers/coupon-events.trigger.ts → trackGAGwpAddToCartEvent
// @see ../listeners/cart-tracking.listener.ts
// @see ../temp-docs/ga.events.md §GWP Add To Cart
// ============================================================================

export type GAGwpAddToCartEventName = 'trackEvent';

export type GAGwpAddToCartCategory = 'gwp_add_to_cart';

export type GAGwpAddToCartLabel = 'miniCart' | 'fullCart';

export interface GwpAddToCartTriggerPayloadSchema {
  /** Fixed campaign action from the legacy GWP trigger. */
  campaignName: string;
  /** Surface label. */
  label: GAGwpAddToCartLabel;
  /** Gift sku, falling back to variant id when sku is unavailable. */
  giftId: string;
}

export interface GAGwpAddToCartEventPayloadSchema {
  event: GAGwpAddToCartEventName;
  'eventDetails.category': GAGwpAddToCartCategory;
  'eventDetails.action': string;
  'eventDetails.label': GAGwpAddToCartLabel;
  'eventDetails.gift_id': string;
}

// ============================================================================
// GA Click Place Order (click_place_order) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/payment-events.trigger.ts` →
// `trackGAClickPlaceOrderEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.action': 'click_place_order',
//     'eventDetails.category': '<provider>',      // e.g. 'stripe-online'
//     'eventDetails.label': 'checkout_place_order' | 'checkout_retry_payment' | 'order_retry_payment',
//   });
//
// Driver: every payment submit path in `<PaymentWallets />` — hard-coded
// submit button (Stripe / GrabPay / 2C2P), PayPal/Affirm SDK `onInitiate`,
// and Express checkout `placeOrderHandler`. Fires on click, before any API
// call, with no dedup.
//
// @see ../triggers/payment-events.trigger.ts → trackGAClickPlaceOrderEvent
// @see ../listeners/payment-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Click Place Order
// ============================================================================

export type GAClickPlaceOrderEventName = 'trackEvent';
export type GAClickPlaceOrderAction = 'click_place_order';

/**
 * `eventDetails.label` enum — identifies the checkout surface / retry context.
 *
 * - `checkout_place_order`   First payment attempt from checkout flow
 * - `checkout_retry_payment` Retry initiated from the checkout page
 * - `order_retry_payment`    Retry initiated from the order history page
 */
export type GAClickPlaceOrderLabel = 'checkout_place_order' | 'checkout_retry_payment' | 'order_retry_payment';

/**
 * Input payload accepted by `trackGAClickPlaceOrderEvent`. `category` is the
 * payment method provider; `label` encodes the checkout surface / retry context.
 */
export interface ClickPlaceOrderTriggerPayloadSchema {
  /** Payment method provider, e.g. `'stripe-online'`. */
  category: string;
  label: GAClickPlaceOrderLabel;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the click-place-order
 * event. Shape consumed by `gaTrack(params)`.
 */
export interface GAClickPlaceOrderEventPayloadSchema {
  event: GAClickPlaceOrderEventName;
  'eventDetails.action': GAClickPlaceOrderAction;
  'eventDetails.category': string;
  'eventDetails.label': GAClickPlaceOrderLabel;
}

// ============================================================================
// GA View Service Guarantee (cart_service) impression event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/ga-impression-events.trigger.ts` →
// `trackGAViewServiceGuaranteeEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'cart_service',
//     'eventDetails.action': 'view_service_guarantee',
//     'eventDetails.position': 'miniCart' | 'fullCart',
//   });
//
// Driver: cart surfaces render the shared `<ServiceGurantee />` section. The
// cart-side wrapper (`<CartServiceGuaranteeImpression />`) uses
// `useInViewDelayedCallback` (≥1s dwell) with a `hasFired` ref so the
// impression is reported at most once per mount. The wrapper dispatches the
// cart-domain `cartServiceGuaranteeImpressionEvent`; `cart-tracking.listener`
// forwards it here.
//
// @see ../triggers/ga-impression-events.trigger.ts → trackGAViewServiceGuaranteeEvent
// @see ../listeners/cart-tracking.listener.ts
// @see ../temp-docs/ga.events.md §View Service Guarantee
// ============================================================================

/**
 * GA event name for the view-service-guarantee impression event. Uses the
 * generic `trackEvent` channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GAViewServiceGuaranteeEventName = 'trackEvent';

/**
 * GA `eventDetails.category` value for the view-service-guarantee event.
 */
export type GAViewServiceGuaranteeCategory = 'cart_service';

/**
 * GA `eventDetails.action` value for the view-service-guarantee event.
 */
export type GAViewServiceGuaranteeAction = 'view_service_guarantee';

/**
 * `eventDetails.position` enum — identifies the cart surface that hosts the
 * service-guarantee section.
 *
 * - `miniCart` — service-guarantee inside the mini cart drawer (reserved;
 *   no UI entry today, kept so the listener can fan out when added)
 * - `fullCart` — service-guarantee on the full cart page
 */
export type ViewServiceGuaranteePosition = 'miniCart' | 'fullCart';

/**
 * Input payload accepted by `trackGAViewServiceGuaranteeEvent`. `position`
 * is supplied verbatim by the cart-domain interaction event — the trigger
 * does not read any UI state.
 */
export interface ViewServiceGuaranteeTriggerPayloadSchema {
  position: ViewServiceGuaranteePosition;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the view-service-guarantee
 * event. Shape consumed by `gaTrack(params)`.
 */
export interface GAViewServiceGuaranteeEventPayloadSchema {
  event: GAViewServiceGuaranteeEventName;
  'eventDetails.category': GAViewServiceGuaranteeCategory;
  'eventDetails.action': GAViewServiceGuaranteeAction;
  'eventDetails.position': ViewServiceGuaranteePosition;
}

// ============================================================================
// GA Click Service Guarantee Policy (cart_service) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/ga-impression-events.trigger.ts` →
// `trackGAClickServiceGuaranteePolicyEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'cart_service',
//     'eventDetails.action': 'click_service_guarantee_policy',
//     'eventDetails.label': 'Eco delivery',
//     'eventDetails.position': 'full_cart',
//   });
//
// Driver: cart surfaces render the shared `<ServiceGurantee />` section through
// `<CartServiceGuaranteeImpression />`. The wrapper dispatches the cart-domain
// `cartServiceGuaranteePolicyClickedEvent` whenever a policy / T&Cs link inside
// a service-guarantee card is clicked; the card title is carried as `label`.
//
// @see ../triggers/ga-impression-events.trigger.ts → trackGAClickServiceGuaranteePolicyEvent
// @see ../listeners/cart-tracking.listener.ts
// @see ../temp-docs/ga.events.md §Click Service Guarantee Policy
// ============================================================================

/**
 * GA event name for the service-guarantee policy click event. Uses the generic
 * `trackEvent` channel — mirrors `EVENTS_NAMES_MAP.GA_CUSTOM_TRACK_EVENT`.
 */
export type GAClickServiceGuaranteePolicyEventName = 'trackEvent';

/**
 * GA `eventDetails.category` value for the service-guarantee policy click event.
 */
export type GAClickServiceGuaranteePolicyCategory = 'cart_service';

/**
 * GA `eventDetails.action` value for the service-guarantee policy click event.
 */
export type GAClickServiceGuaranteePolicyAction = 'click_service_guarantee_policy';

/**
 * Cart-domain source position accepted by the trigger before it is normalized
 * to the GA snake_case value.
 */
export type ClickServiceGuaranteePolicyTriggerPosition = 'miniCart' | 'fullCart';

/**
 * GA `eventDetails.position` enum for the service-guarantee policy click event.
 */
export type GAClickServiceGuaranteePolicyPosition = 'mini_cart' | 'full_cart';

/**
 * Input payload accepted by `trackGAClickServiceGuaranteePolicyEvent`. `label`
 * is the clicked service-guarantee card title.
 */
export interface ClickServiceGuaranteePolicyTriggerPayloadSchema {
  label: string;
  position: ClickServiceGuaranteePolicyTriggerPosition;
}

/**
 * Top-level payload pushed to the GTM dataLayer for the service-guarantee
 * policy click event. Shape consumed by `gaTrack(params)`.
 */
export interface GAClickServiceGuaranteePolicyEventPayloadSchema {
  event: GAClickServiceGuaranteePolicyEventName;
  'eventDetails.category': GAClickServiceGuaranteePolicyCategory;
  'eventDetails.action': GAClickServiceGuaranteePolicyAction;
  'eventDetails.label': string;
  'eventDetails.position': GAClickServiceGuaranteePolicyPosition;
}

// ============================================================================
// Order Component PRD - Event Tracking (New Format)
//
// 第一表 6 events: pending_payment_order_view / pending_payment_order_click /
// order_tracking_link_click / canceled_order_view / add_to_cart (from
// canceled-order ATC button) / canceled_order_click.
//
// 所有 6 个事件 dataLayer payload 仅承载 PRD "Extra Parameter" 列字段，Default
// Parameter (page_type) 由 GTM 全局上报；不写 position（PRD 未列出）。
//
// @see ../triggers/order-events.trigger.ts
// @see ../listeners/order-tracking.listener.ts
// @see ../temp-docs/ga.events.md
// ============================================================================

// ============================================================================
// GA Add To Cart (add_to_cart) event from canceled-order ATC reorder button
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'add_to_cart',
//     'eventDetails.page_component': 'canceled_order',
//     'eventDetails.label': 'add_to_cart',
//     'eventDetails.action': 'click',
//   });
//
// Driver: `<OrderHistoryAtcButton />` dispatches `orderHistoryAtcClickedEvent`
// on every "Add to cart" reorder click for cancelled orders. Web + POS.
// 与 PDP/Cart 的标准 add_to_cart 共用 category，按 PRD 约定。
// ============================================================================

export type GAClickAtcEventName = 'trackEvent';

export interface GAClickAtcEventPayloadSchema {
  event: GAClickAtcEventName;
  'eventDetails.category': 'add_to_cart';
  'eventDetails.page_component': 'canceled_order';
  'eventDetails.label': 'add_to_cart';
  'eventDetails.action': 'click';
}

// ============================================================================
// GA Pending Payment Order Click (pending_payment_order_click) event
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'pending_payment_order_click',
//     'eventDetails.page_component': 'pending_payment_order',
//     'eventDetails.label': 'pay',
//     'eventDetails.action': 'click',
//     'eventDetails.tag': 'remaining_payment_time',
//     'eventDetails.tag_value': '<countdown>',  // e.g. '01:09:09'
//   });
//
// Driver: `<WebOrderHistoryCountDown />` dispatches `orderHistoryPayClickedEvent`
// on every Pay click. Web + POS. Fires per click.
// ============================================================================

export type GAClickPayOrderHistoryEventName = 'trackEvent';

export interface ClickPayOrderHistoryTriggerPayloadSchema {
  /** Remaining payment countdown string, forwarded as `eventDetails.tag_value`. */
  remainingTime: string;
}

export interface GAClickPayOrderHistoryEventPayloadSchema {
  event: GAClickPayOrderHistoryEventName;
  'eventDetails.category': 'pending_payment_order_click';
  'eventDetails.page_component': 'pending_payment_order';
  'eventDetails.label': 'pay';
  'eventDetails.action': 'click';
  'eventDetails.tag': 'remaining_payment_time';
  'eventDetails.tag_value': string;
}

// ============================================================================
// GA Canceled Order Click (canceled_order_click) event for cancel-order button
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'canceled_order_click',
//     'eventDetails.page_component': 'canceled_order',
//     'eventDetails.label': 'cancel_order',
//     'eventDetails.action': 'click',
//   });
//
// Driver: `<OrderHistoryCancelOrderBtn />` dispatches
// `orderHistoryCancelOrderClickedEvent`. POS only.
//
// Note: PRD 表格 page_component 写为 `pending_payment_order`（笔误），
// 已与 PM 对齐改为 `canceled_order`。
// ============================================================================

export type GAClickCancelOrderEventName = 'trackEvent';

export interface GAClickCancelOrderEventPayloadSchema {
  event: GAClickCancelOrderEventName;
  'eventDetails.category': 'canceled_order_click';
  'eventDetails.page_component': 'canceled_order';
  'eventDetails.label': 'cancel_order';
  'eventDetails.action': 'click';
}

// ============================================================================
// GA Canceled Order View (canceled_order_view) impression event
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'canceled_order_view',
//     'eventDetails.page_component': 'canceled_order',
//     'eventDetails.action': 'impression',
//   });
//
// Driver: `<WebOrderInfoOverviewV1 />` renders canceled-order overview block;
// list 端 `useFirstInViewWithDelay` (≥1s dwell, once per mount)，details 端
// `useEffect` 挂载即派发。`order-tracking.listener` `accessInWeb` 守卫使 POS
// silently drop。
// ============================================================================

export type GAViewCanceledOrderEventName = 'trackEvent';

export interface GAViewCanceledOrderEventPayloadSchema {
  event: GAViewCanceledOrderEventName;
  'eventDetails.category': 'canceled_order_view';
  'eventDetails.page_component': 'canceled_order';
  'eventDetails.action': 'impression';
}

// ============================================================================
// GA Pending Payment Order View (pending_payment_order_view) impression event
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'pending_payment_order_view',
//     'eventDetails.page_component': 'pending_payment_order',
//     'eventDetails.action': 'impression',
//   });
//
// Driver: `<WebOrderInfoOverviewV1 />` renders pending-payment overview block;
// list 端 `useFirstInViewWithDelay` (≥1s)，details 端 `useEffect`，每个 mount
// 一次。`accessInWeb` 守卫使 POS silently drop。
// ============================================================================

export type GAViewPendingPaymentOrderEventName = 'trackEvent';

export interface GAViewPendingPaymentOrderEventPayloadSchema {
  event: GAViewPendingPaymentOrderEventName;
  'eventDetails.category': 'pending_payment_order_view';
  'eventDetails.page_component': 'pending_payment_order';
  'eventDetails.action': 'impression';
}

// ============================================================================
// GA Order Tracking Link Click (order_tracking_link_click) event
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'order_tracking_link_click',
//     'eventDetails.page_component': 'tracking_link',
//     'eventDetails.label': 'tracking_link',
//     'eventDetails.action': 'click',
//   });
//
// Driver: `<OrderShipmentStateV1 />` "Track Shipping" link onClick dispatches
// `orderTrackingLinkClickedEvent`. Web only. Fires per click.
// ============================================================================

export type GAOrderTrackingLinkClickEventName = 'trackEvent';

export interface GAOrderTrackingLinkClickEventPayloadSchema {
  event: GAOrderTrackingLinkClickEventName;
  'eventDetails.category': 'order_tracking_link_click';
  'eventDetails.page_component': 'tracking_link';
  'eventDetails.label': 'tracking_link';
  'eventDetails.action': 'click';
}

// ============================================================================
// GA View Cart (view_cart) event
//
// Schema for the GA generic `trackEvent` payload pushed to the GTM dataLayer
// via `gaTrack` from `triggers/cart-events.trigger.ts` → `trackViewCartEvent`.
//
//   gaTrack({
//     event: 'trackEvent',
//     'eventDetails.category': 'view_cart',
//     'eventDetails.label': 'miniCart' | 'fullCart',
//     ecommerce: {
//       currencyCode: INTL_CURRENCY,
//       cart: { products: GAEccProductSchema[] },
//     },
//   });
//
// Driver: fullCart — `PageClient` (apps/web .../cart/page.client.tsx) dispatches
// `cartViewedEvent({ surface: 'fullCart', lineItems })` once per mount when
// cart line items first become non-empty.
// miniCart — `WebMiniCart` (libs/modules/composite/components/.../web-mini-cart)
// dispatches `cartViewedEvent({ surface: 'miniCart', lineItems })` on the drawer's
// first open per mount when line items are non-empty.
// The listener guards against empty line items as a final safety net.
//
// @see ../triggers/cart-events.trigger.ts → trackViewCartEvent
// @see ../listeners/cart-tracking.listener.ts
// @see ../temp-docs/ga.events.md §View Cart
// ============================================================================

export type GAViewCartEventName = 'trackEvent';
export type GAViewCartCategory = 'view_cart';
export type ViewCartLabel = 'miniCart' | 'fullCart';

export interface ViewCartTriggerPayloadSchema {
  label: ViewCartLabel;
  lineItems: LineItemSchema[];
}

export interface GAViewCartEcommerceCartSchema {
  products: GAEccProductSchema[];
}

export interface GAViewCartEcommerceSchema {
  /** ISO 4217 currency code from `INTL_CURRENCY`. */
  currencyCode: string;
  cart: GAViewCartEcommerceCartSchema;
}

export interface GAViewCartEventPayloadSchema {
  event: GAViewCartEventName;
  'eventDetails.category': GAViewCartCategory;
  'eventDetails.label': ViewCartLabel;
  ecommerce: GAViewCartEcommerceSchema;
}

// ============================================================================
// Guardsman Warranty (trackEvent)
// ============================================================================
//
// Driver: PDP — `guardsmanWarrantyInteractionEvent` → product-tracking.listener
// 仅实现 Mulberry 已落地的 action（select / add on PDP）；Cart popup 类 action 不实现
// @see ../triggers/guardsman-warranty-events.trigger.ts → trackGuardsmanWarrantyEvent
// @see ../temp-docs/ga.events.md § Guardsman Warranty
// ============================================================================

export type GAGuardsmanWarrantyEventName = 'trackEvent';
export type GAGuardsmanWarrantyCategory = 'guardsman_warranty';

export type GuardsmanWarrantyGaAction =
  | 'select_extended_warranty'
  | 'add_extended_warranty'
  | 'extended_warranty_faq';

export type GuardsmanWarrantyGaPosition = 'pdp';

export interface GuardsmanWarrantyTriggerPayloadSchema {
  action: GuardsmanWarrantyGaAction;
  label?: string;
  sku: string;
  skuName: string;
  position?: GuardsmanWarrantyGaPosition;
  price?: number | string;
}

export interface GAGuardsmanWarrantyEventPayloadSchema {
  event: GAGuardsmanWarrantyEventName;
  'eventDetails.category': GAGuardsmanWarrantyCategory;
  'eventDetails.action': GuardsmanWarrantyGaAction;
  'eventDetails.label': string;
  'eventDetails.sku_id': string;
  'eventDetails.sku_name': string;
  'eventDetails.position': string;
  'eventDetails.price': string | number;
}
