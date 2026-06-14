# Facebook CAPI Trigger Activity Feed - Event List

> **当前 PRD**: N/A（Facebook CAPI 当前没有 PRD；本文档基于前端代码反向梳理）
>
> **官方开发者文档**: [Meta Pixel Standard Events](https://developers.facebook.com/docs/meta-pixel/reference#standard-events) / [Meta Pixel Custom Events](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking#custom-events)
>
> **前端事件名映射**: `libs/modules/tracking/services/src/lib/events-name/facebook-events-name.ts`
>
> **生成规则**：
>
> - 本文档以 `libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` 为准反推事件与字段
> - 下方 Schema 仅描述传入 `fbConversionTrack` 的 `customData`；`event_id`、`event_name`、`event_time`、`event_source_url`、`action_source`、`user_data` 由 `fbConversionTrack` / `getFbCapiEventData` 统一生成或透传
> - 🛠️ 有修改的字段；🆕 新增字段；💵 价格字段（含市场货币符号或订单金额）
> - `currency` 统一来自 `INTL_CURRENCY`
> - 每个事件用 **TS Schema (聚合类型)** + **Example** 描述

---

## ✅ 前端追踪事件

> 事件名映射详见 `libs/modules/tracking/services/src/lib/events-name/facebook-events-name.ts`。
> 每个事件的 Schema 以 TS type + Example 形式呈现在下方 [Schemas](#schemas) 小节。

| #   | 事件名                            | 事件 Schema                                                                      | 触发场景                                                          | 关联模块            | 生效渠道 | 备注                                |
| --- | --------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------- | -------- | ----------------------------------- |
| 1   | **ViewContent**                   | [§ Schema: ViewContent](#schema-viewcontent)                                     | 用户进入 PDP 页面时触发，上报商品浏览行为用于 FB 广告归因与再营销 | Product / PDP       | Web      | Schema 来源于 trigger 代码          |
| 2   | **AddToCart**                     | [§ Schema: AddToCart](#schema-addtocart)                                         | 用户在 PDP 或购物车相关入口点击 Add to Cart 成功后触发            | Cart / Product      | Web      | Schema 来源于 trigger 代码          |
| 3   | **SwatchATC**                     | [§ Schema: SwatchATC](#schema-swatchatc)                                         | 用户点击 Add Swatch to Cart 成功后触发                            | Swatch / Product    | Web      | Custom event；Schema 来源于 trigger |
| 4   | **AddToWishlist**                 | [§ Schema: AddToWishlist](#schema-addtowishlist)                                 | 用户在 PDP 点击 Add to Wishlist 后触发                            | Wishlist / Product  | Web      | Schema 来源于 trigger 代码          |
| 5   | **Product_page_view_more_than_3** | [§ Schema: Product_page_view_more_than_3](#schema-product_page_view_more_than_3) | 用户同一 session 浏览第 3 个 PDP 时触发                           | Product / PDP       | Web      | Custom event；受 feature flag 控制  |
| 6   | **CompleteRegistration**          | [§ Schema: CompleteRegistration](#schema-completeregistration)                   | 用户完成账号注册，或通过 Footer 完成邮件订阅后触发                | User / Subscription | Web      | 两个 trigger 共用同一标准事件名     |
| 7   | **AtcWithSignup**                 | [§ Schema: AtcWithSignup](#schema-atcwithsignup)                                 | 用户完成注册后执行首次业务操作（如加购、收藏）时触发              | User / Cart         | Web      | Custom event；Schema 来源于 trigger |
| 8   | **InitiateCheckout**              | [§ Schema: InitiateCheckout](#schema-initiatecheckout)                           | 用户从购物车进入 checkout 页面时触发                              | Checkout / Cart     | Web      | Schema 来源于 trigger 代码          |
| 9   | **AddPaymentInfo**                | [§ Schema: AddPaymentInfo](#schema-addpaymentinfo)                               | 用户在 checkout 页面选择并提交支付方式时触发                      | Checkout / Payment  | Web      | Schema 来源于 trigger 代码          |
| 10  | **Purchase**                      | [§ Schema: Purchase](#schema-purchase)                                           | 订单支付成功后，在 order confirmation 页面触发                    | Order / Payment     | Web      | Schema 来源于 trigger 代码          |
| 11  | **SwatchPurchase**                | [§ Schema: SwatchPurchase](#schema-swatchpurchase)                               | 订单支付成功后，仅当订单包含 swatch 商品时触发                    | Order / Swatch      | Web      | Custom event；Schema 来源于 trigger |
| 12  | **NewCustomerPurchase**           | [§ Schema: NewCustomerPurchase](#schema-newcustomerpurchase)                     | 订单支付成功后，仅当用户为新客时触发                              | Order / User        | Web      | Custom event；Schema 来源于 trigger |

### Schemas

#### Schema: ViewContent

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookViewContentEvent`

**TS Schema**

```ts
/** ViewContent 事件 custom_data（聚合类型，所有字段 inline） */
type ViewContentEventParameters = {
  /** 商品价格，来自 payload.originalPrice；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品名称，来自 payload.variant.name；必填 */
  content_name: string;
  /** 商品 SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
  /** 内容类型，代码中固定为 `product`；必填 */
  content_type: 'product';
};
```

**Example**

```ts
const example: ViewContentEventParameters = {
  value: '1299.00',
  currency: 'SGD',
  content_name: 'Jonathan Leather Extended Sofa',
  content_ids: ['JONA-ES-CHBK-001'],
  content_type: 'product',
};
```

#### Schema: AddToCart

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookAddToCartEvent`

**TS Schema**

```ts
/** AddToCart 事件 custom_data（聚合类型，所有字段 inline） */
type AddToCartEventParameters = {
  /** 商品价格，来自 payload.originalPrice；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品名称，来自 payload.variant.name；必填 */
  content_name: string;
  /** 商品 SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
  /** 内容类型，代码中固定为 `product`；必填 */
  content_type: 'product';
};
```

**Example**

```ts
const example: AddToCartEventParameters = {
  value: '1299.00',
  currency: 'SGD',
  content_name: 'Jonathan Leather Extended Sofa',
  content_ids: ['JONA-ES-CHBK-001'],
  content_type: 'product',
};
```

#### Schema: SwatchATC

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookAddSwatchToCartEvent`

**TS Schema**

```ts
/** SwatchATC 事件 custom_data（聚合类型，所有字段 inline） */
type SwatchATCEventParameters = {
  /** 内容分类，代码中固定为 `Swatch`；必填 */
  content_category: 'Swatch';
  /** Swatch SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
  /** Swatch 名称，来自 payload.variant.name；必填 */
  content_name: string;
  /** Swatch 关联商品 ID，来自 payload.swatchRelatedProductId；必填 */
  related_product_id: number;
};
```

**Example**

```ts
const example: SwatchATCEventParameters = {
  content_category: 'Swatch',
  content_ids: ['SWATCH-BCL-FAB-001'],
  content_name: 'Beach Linen Fabric Swatch',
  related_product_id: 123456,
};
```

#### Schema: AddToWishlist

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookAddToWishlistEvent`

**TS Schema**

```ts
/** AddToWishlist 事件 custom_data（聚合类型，所有字段 inline） */
type AddToWishlistEventParameters = {
  /** 商品价格，代码中由 +payload.variant.price 转为 number；必填 💵 */
  value: number;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品名称，来自 payload.variant.name；必填 */
  content_name: string;
  /** 商品 SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: AddToWishlistEventParameters = {
  value: 1299,
  currency: 'SGD',
  content_name: 'Jonathan Leather Extended Sofa',
  content_ids: ['JONA-ES-CHBK-001'],
};
```

#### Schema: Product_page_view_more_than_3

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookProductViewMoreThan3Event`

**TS Schema**

```ts
/** Product_page_view_more_than_3 事件 custom_data（代码中为空对象） */
type ProductPageViewMoreThan3EventParameters = Record<string, never>;
```

**Example**

```ts
const example: ProductPageViewMoreThan3EventParameters = {};
```

#### Schema: CompleteRegistration

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookCompleteRegistrationEvent` / `trackFacebookNewsletterSubscriptionEvent`

**TS Schema**

```ts
/** CompleteRegistration 事件 custom_data（聚合类型，所有字段 inline） */
type CompleteRegistrationEventParameters = {
  /** 注册/订阅价值，代码中固定为 0.0；必填 💵 */
  value: 0;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 触发来源：账号注册为 `Sign Up`；Footer 邮件订阅为 `Subscription Footer`；必填 */
  content_name: 'Sign Up' | 'Subscription Footer';
};
```

**Example**

```ts
const signUpExample: CompleteRegistrationEventParameters = {
  value: 0,
  currency: 'SGD',
  content_name: 'Sign Up',
};

const newsletterExample: CompleteRegistrationEventParameters = {
  value: 0,
  currency: 'SGD',
  content_name: 'Subscription Footer',
};
```

#### Schema: AtcWithSignup

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookActWithSignupEvent`

**TS Schema**

```ts
/** AtcWithSignup 事件 custom_data（代码中为空对象） */
type AtcWithSignupEventParameters = Record<string, never>;
```

**Example**

```ts
const example: AtcWithSignupEventParameters = {};
```

#### Schema: InitiateCheckout

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookInitiateCheckoutEvent`

**TS Schema**

```ts
/** InitiateCheckout 事件 custom_data（聚合类型，所有字段 inline） */
type InitiateCheckoutEventParameters = {
  /** 购物车商品总价，代码中由 +payload.itemTotal 转为 number；必填 💵 */
  value: number;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品数量，代码中取 payload.lineItems.length；必填 */
  num_items: number;
  /** 商品 SKU 列表，代码中从 lineItems[].variant.sku 提取；必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: InitiateCheckoutEventParameters = {
  value: 2598,
  currency: 'SGD',
  num_items: 2,
  content_ids: ['JONA-ES-CHBK-001', 'HUDS-TB-OAK-002'],
};
```

#### Schema: AddPaymentInfo

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookAddPaymentInfoEvent`

**TS Schema**

```ts
/** AddPaymentInfo 事件 custom_data（聚合类型，所有字段 inline） */
type AddPaymentInfoEventParameters = {
  /** 支付金额，来自 payload.value；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品 SKU / content id 列表，来自 payload.contentIds；当前代码未校验必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: AddPaymentInfoEventParameters = {
  value: '2598.00',
  currency: 'SGD',
  content_ids: ['JONA-ES-CHBK-001', 'HUDS-TB-OAK-002'],
};
```

#### Schema: Purchase

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookPurchaseEvent`

**TS Schema**

```ts
/** Purchase 事件 custom_data（聚合类型，所有字段 inline） */
type PurchaseEventParameters = {
  /** 订单金额，来自 payload.value；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 订单号，来自 payload.orderId；必填 */
  order_id: string;
  /** 商品 SKU / content id 列表，来自 payload.contentIds；当前代码未校验必填 */
  content_ids: string[];
  /** 商品数量，来自 payload.numItems；当前代码未校验必填 */
  num_items: number;
};
```

**Example**

```ts
const example: PurchaseEventParameters = {
  value: '2598.00',
  currency: 'SGD',
  order_id: 'SG-10001234',
  content_ids: ['JONA-ES-CHBK-001', 'HUDS-TB-OAK-002'],
  num_items: 2,
};
```

#### Schema: SwatchPurchase

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookSwatchPurchaseEvent`

**TS Schema**

```ts
/** SwatchPurchase 事件 custom_data（聚合类型，所有字段 inline） */
type SwatchPurchaseEventParameters = {
  /** Swatch SKU 列表，来自 payload.swatchSkus；必填且长度需大于 0 */
  content_ids: string[];
};
```

**Example**

```ts
const example: SwatchPurchaseEventParameters = {
  content_ids: ['SWATCH-BCL-FAB-001', 'SWATCH-ASH-FAB-002'],
};
```

#### Schema: NewCustomerPurchase

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts` → `trackFacebookNewCustomerPurchaseEvent`

**TS Schema**

```ts
/** NewCustomerPurchase 事件 custom_data（聚合类型，所有字段 inline） */
type NewCustomerPurchaseEventParameters = {
  /** 新客订单金额，来自 payload.value；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 订单号，来自 payload.orderId；必填 */
  order_id: string;
};
```

**Example**

```ts
const example: NewCustomerPurchaseEventParameters = {
  value: '2598.00',
  currency: 'SGD',
  order_id: 'SG-10001234',
};
```

## ⚠️ 待确认事件

该列表中事件，为前端事件名映射中已注册但当前 trigger 代码未发现上报实现，请人工确认。

| #   | 事件名          | PRD 触发场景概述 | 关联模块           | 备注                                                                                        |
| --- | --------------- | ---------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| 1   | **EventSignUp** | N/A              | User / Appointment | `FB_CAPI_CUSTOM_EVENT_SIGNUP` 已注册；注释为 `when track Appointment`，但未找到对应 trigger |

## 🚫 已废弃事件

| #   | 事件名 | 状态 | 备注                                                        |
| --- | ------ | ---- | ----------------------------------------------------------- |
| N/A | N/A    | N/A  | 当前无 PRD，代码中未发现明确标记为废弃的 Facebook CAPI 事件 |

## 待确定事项 (Open Questions)

1. **InitiateCheckout payload 类型**：`trackFacebookInitiateCheckoutEvent` 的 payload 将 `lineItems` 标为 `number`，但运行时使用 `Array.isArray(lineItems)`、`lineItems.map(...)`、`lineItems.length`，应确认类型是否应为 `LineItemSchema[]`。
2. **content_ids 语义**：`InitiateCheckout`、`Purchase` 注释中均标记需确认传 SKU 数组还是 product ID 数组；当前代码传/预期传 SKU 或上游 `contentIds`。
3. **金额字段类型不一致**：`ViewContent`、`AddToCart`、`AddPaymentInfo`、`Purchase`、`NewCustomerPurchase` 使用 string；`AddToWishlist`、`InitiateCheckout` 转为 number。需确认 Meta CAPI 接口和后端接收层是否要求统一 number。
4. **AddPaymentInfo value 来源**：代码注释标记需确认传 cart total 还是 order total；当前仅透传 payload.value。
5. **Purchase order_id / content_type**：代码注释标记需确认后端 CAPI 映射字段名是否一致，以及是否需要补充 `content_type: 'product'`。
6. **SwatchPurchase 金额字段**：代码注释标记需确认是否需要上报 `value` / `currency`；当前仅上报 `content_ids`。
7. **NewCustomerPurchase value 来源**：代码注释标记需确认传 order total 还是 subtotal；当前仅透传 payload.value。
8. **EventSignUp 实现缺失**：`FB_CAPI_CUSTOM_EVENT_SIGNUP` 已注册但未找到 trigger；需确认是否仍需要 Appointment Sign Up 相关 CAPI 事件。
