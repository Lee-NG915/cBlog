# Pinterest CAPI Trigger Activity Feed - Event List

> **当前 PRD**: N/A（Pinterest CAPI 当前没有 PRD；本文档基于前端代码反向梳理）
>
> **官方开发者文档**: [Pinterest Conversion Management - Standard Events](https://developers.pinterest.com/docs/conversions/conversion-management/#standard-conversion-events) / [Pinterest Custom Events](https://developers.pinterest.com/docs/conversions/custom-events/)
>
> **前端事件名映射**: `libs/modules/tracking/services/src/lib/events-name/pinterest-events-name.ts`
>
> **生成规则**：
>
> - 本文档以 `libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` 为准反推事件与字段
> - 下方 Schema 仅描述 trigger 层组装并最终透传到 Pinterest CAPI 的 `custom_data`；`event_name`、`event_id`、`event_time`、`event_source_url`、`action_source`、`user_data` 由 `pinterestConversionTrack` / `getPinterestCapiEventData` 统一生成或透传
> - 🆕 表示新接入的事件（本次 Order / Checkout 模块接入）；🛠️ 有修改的字段；💵 价格字段（含市场货币）
> - `currency` 统一来自 `INTL_CURRENCY`
> - 每个事件用 **TS Schema (聚合类型)** + **Example** 描述
> - 全部事件统一受 `advertisement` + `analytics` 两个 consent category gate 控制（见 `pinterestConversionTrack`）

---

## 公共字段（由 `getPinterestCapiEventData` 统一注入）

无论哪一个 trigger，最终发送到 Pinterest CAPI 的载荷都包含以下顶层字段，**不在各事件 Schema 中重复列出**：

```ts
type PinterestCapiCommonPayload = {
  /** Pinterest 事件名，trigger 层透传：标准事件 = `page_visit | add_to_cart | signup | checkout`；所有 custom event 统一为 `custom` */
  event_name: string;
  /** 用于服务端 / 浏览器双侧去重，trigger 层透传 payload.eventId */
  event_id: string;
  /** 服务端注入：Math.floor(Date.now() / 1000)（秒级 unix 时间戳） */
  event_time: number;
  /** 服务端注入：window.location.href */
  event_source_url: string;
  /** Hardcoded 'web'，区分 Web / 服务端 / App 来源 */
  action_source: 'web';
  /** 用户身份增强匹配字段，全部 sha256 哈希后传输；详见下方 user_data 子结构 */
  user_data: {
    /** 当前用户 IP，来自 getUserCity().ip_address；未哈希 */
    client_ip_address?: string;
    /** navigator.userAgent，未哈希 */
    client_user_agent?: string;
    /** 城市，sha256 哈希后包成单元素数组 */
    ct?: [string];
    /** 州/省 region code，sha256 哈希 */
    st?: [string];
    /** 邮编 */
    zp?: [string];
    /** 国家 country code */
    country?: [string];
    /** GA 伪 ID（gaPerSudoId.slice(6)）的 sha256 哈希；用于跨域归因 */
    external_id?: [string];
  };
  /** 各事件特有字段，详见下方各事件 Schema */
  custom_data: Record<string, unknown>;
};
```

> ⚠️ `getPinterestCapiEventData` 会**重新过滤** `custom_data`，只保留 `value / currency / content_ids / contents / num_items / order_id / search_string`。trigger 层组装的 `content_name` **不会最终上报** —— 详见 [Open Questions §1](#待确定事项-open-questions)。

---

## ✅ 前端追踪事件

> 事件名映射详见 `libs/modules/tracking/services/src/lib/events-name/pinterest-events-name.ts`。
> 每个事件的 Schema 以 TS type + Example 形式呈现在下方 [Schemas](#schemas) 小节。

| #   | 事件名                                | 事件 Schema                                                                  | 触发场景                                                          | 关联模块            | 生效渠道 | 备注                                                                                |
| --- | ------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------- | -------- | ----------------------------------------------------------------------------------- |
| 1   | **page_visit**                        | [§ Schema: page_visit](#schema-page_visit)                                   | 用户进入 PDP 页面时触发，上报商品浏览行为用于 Pinterest 广告归因  | Product / PDP       | Web      | 标准事件；Schema 来源于 trigger 代码                                                |
| 2   | **add_to_cart**                       | [§ Schema: add_to_cart](#schema-add_to_cart)                                 | 用户在 PDP 点击 Add to Cart 成功后触发                            | Cart / Product      | Web      | 标准事件；Schema 来源于 trigger 代码                                                |
| 3   | **add_to_wishlist**                   | [§ Schema: add_to_wishlist](#schema-add_to_wishlist)                         | 用户在 PDP 点击 Add to Wishlist 后触发                            | Wishlist / Product  | Web      | Custom event（`event_name='custom'`）；Schema 来源于 trigger                        |
| 4   | **add_swatch_to_cart**                | [§ Schema: add_swatch_to_cart](#schema-add_swatch_to_cart)                   | 用户点击 Add Swatch to Cart 成功后触发                            | Swatch / Product    | Web      | Custom event；Schema 来源于 trigger                                                 |
| 5   | **signup**                            | [§ Schema: signup](#schema-signup)                                           | 用户完成账号注册，或通过 Footer 完成邮件订阅后触发                | User / Subscription | Web      | 标准事件；两个 trigger 共用同一标准事件名，靠 `content_name` 区分                   |
| 6   | 🆕 **initiate_checkout** **[NEW]**    | [§ Schema: initiate_checkout](#schema-initiate_checkout)                     | 用户从购物车进入 checkout 页面时触发                              | Checkout / Cart     | Web      | Custom event；Schema 来源于 trigger                                                 |
| 7   | 🆕 **add_payment_info** **[NEW]**     | [§ Schema: add_payment_info](#schema-add_payment_info)                       | 用户在 checkout 页面完成支付方式录入（`captureWithRetry` 成功后） | Checkout / Payment  | Web      | Custom event；Schema 来源于 trigger                                                 |
| 8   | 🆕 **checkout (purchase)** **[NEW]**  | [§ Schema: checkout](#schema-checkout)                                       | 订单支付成功后，在 order confirmation 页面触发                    | Order / Payment     | Web      | 标准事件；Pinterest 标准事件名为 `checkout`（不是 `purchase`），Schema 来源于代码 |
| 9   | 🆕 **swatch_purchase** **[NEW]**      | [§ Schema: swatch_purchase](#schema-swatch_purchase)                         | 订单支付成功后，仅当订单包含 swatch 商品时触发                    | Order / Swatch      | Web      | Custom event；Schema 来源于 trigger                                                 |
| 10  | 🆕 **new_customer_purchase** **[NEW]** | [§ Schema: new_customer_purchase](#schema-new_customer_purchase)             | 订单支付成功后，仅当用户为新客时触发                              | Order / User        | Web      | Custom event；Schema 来源于 trigger                                                 |

### Schemas

#### Schema: page_visit

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestPageVisitEvent`
>
> Trigger 校验必填：`payload.eventId && payload.originalPrice && payload.variant`

**TS Schema**

```ts
/** page_visit 事件 custom_data（聚合类型，所有字段 inline） */
type PageVisitEventParameters = {
  /** 商品价格，来自 payload.originalPrice；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品名称，来自 payload.variant.name；trigger 组装但 util 层会过滤掉（不会最终上报） */
  content_name: string;
  /** 商品 SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: PageVisitEventParameters = {
  value: '1299.00',
  currency: 'SGD',
  content_name: 'Jonathan Leather Extended Sofa',
  content_ids: ['JONA-ES-CHBK-001'],
};
```

#### Schema: add_to_cart

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestAddToCartEvent`
>
> Trigger 校验必填：`payload.variant && payload.eventId && payload.originalPrice`

**TS Schema**

```ts
/** add_to_cart 事件 custom_data（聚合类型，所有字段 inline） */
type AddToCartEventParameters = {
  /** 商品价格，来自 payload.originalPrice；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品名称，来自 payload.variant.name；trigger 组装但 util 层会过滤掉 */
  content_name: string;
  /** 商品 SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: AddToCartEventParameters = {
  value: '1299.00',
  currency: 'SGD',
  content_name: 'Jonathan Leather Extended Sofa',
  content_ids: ['JONA-ES-CHBK-001'],
};
```

#### Schema: add_to_wishlist

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestAddToWishlistEvent`
>
> Trigger 校验必填：`payload.variant && payload.eventId`
>
> 上报时 `event_name` = `'custom'`

**TS Schema**

```ts
/** add_to_wishlist 事件 custom_data（聚合类型，所有字段 inline） */
type AddToWishlistEventParameters = {
  /** 商品价格，来自 payload.variant.price（string）；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品名称，来自 payload.variant.name；trigger 组装但 util 层会过滤掉 */
  content_name: string;
  /** 商品 SKU 列表，当前仅包含 payload.variant.sku；必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: AddToWishlistEventParameters = {
  value: '1299.00',
  currency: 'SGD',
  content_name: 'Jonathan Leather Extended Sofa',
  content_ids: ['JONA-ES-CHBK-001'],
};
```

#### Schema: add_swatch_to_cart

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestAddSwatchToCartEvent`
>
> Trigger 校验必填：`payload.eventId && payload.variant`
>
> 上报时 `event_name` = `'custom'`

**TS Schema**

```ts
/** add_swatch_to_cart 事件 custom_data（聚合类型，仅 1 个字段） */
type AddSwatchToCartEventParameters = {
  /** Swatch SKU 列表，单元素数组：[payload.variant.sku]；必填 */
  content_ids: string[];
};
```

**Example**

```ts
const example: AddSwatchToCartEventParameters = {
  content_ids: ['SWATCH-BCL-FAB-001'],
};
```

#### Schema: signup

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestSignupEvent` / `trackPinterestNewsletterSubscriptionEvent`
>
> Trigger 校验必填：`payload.eventId`
>
> 两个 trigger 共用同一 `event_name = 'signup'`（Pinterest 标准事件），靠 `content_name` 区分来源

**TS Schema**

```ts
/** signup 事件 custom_data（聚合类型，所有字段 inline） */
type SignupEventParameters = {
  /** 注册/订阅价值，代码中固定为 0.0；必填 💵 */
  value: 0;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 触发来源：账号注册 = `'Sign Up'`；Footer 邮件订阅 = `'Subscription Footer'`；trigger 组装但 util 层会过滤掉 */
  content_name: 'Sign Up' | 'Subscription Footer';
};
```

**Example**

```ts
const signUpExample: SignupEventParameters = {
  value: 0,
  currency: 'SGD',
  content_name: 'Sign Up',
};

const newsletterExample: SignupEventParameters = {
  value: 0,
  currency: 'SGD',
  content_name: 'Subscription Footer',
};
```

#### Schema: initiate_checkout

> 🆕 **新接入事件（Checkout 模块）**
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestInitiateCheckoutEvent`
>
> Trigger 校验必填：`eventId && value && numItems && variants`
>
> 上报时 `event_name` = `'custom'`

**TS Schema**

```ts
/** initiate_checkout 事件 custom_data（聚合类型，所有字段 inline） */
type InitiateCheckoutEventParameters = {
  /** 购物车商品总价，代码中由 +payload.value 转为 number；必填 💵 */
  value: number;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品数量，来自 payload.numItems；必填 */
  num_items: number;
  /** 商品 SKU 列表，从 payload.variants[].sku 提取；必填 */
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

#### Schema: add_payment_info

> 🆕 **新接入事件（Checkout 模块）**
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestAddPaymentInfoEvent`
>
> Trigger 校验必填：`payload.eventId && payload.value && payload.contentIds?.length`
>
> 上报时 `event_name` = `'custom'`

**TS Schema**

```ts
/** add_payment_info 事件 custom_data（聚合类型，所有字段 inline） */
type AddPaymentInfoEventParameters = {
  /** 支付金额，来自 payload.value；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品 SKU / content id 列表，来自 payload.contentIds；必填且长度 > 0 */
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

#### Schema: checkout

> 🆕 **新接入事件（Order 模块）**
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestPurchaseEvent`
>
> Trigger 校验必填：`payload.eventId && payload.value && payload.orderId`
>
> 上报时 `event_name` = `'checkout'`（来自 `PINTEREST_CAPI_PURCHASE`，Pinterest 标准事件名）

**TS Schema**

```ts
/** checkout 事件 custom_data（聚合类型，所有字段 inline） */
type CheckoutEventParameters = {
  /** 订单金额，来自 payload.value；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品 SKU / content id 列表，来自 payload.contentIds */
  content_ids: string[];
  /** 订单号，来自 payload.orderId；必填 */
  order_id: string;
  /** 订单 line items，来自 payload.contents（仅 quantity + item_price，不含 product id；util 层会做一次 .map 重组保持同样字段） */
  contents: Array<{
    /** 该 line item 的数量 */
    quantity: number;
    /** 该 line item 的单价 💵 */
    item_price: string;
  }>;
};
```

**Example**

```ts
const example: CheckoutEventParameters = {
  value: '2598.00',
  currency: 'SGD',
  content_ids: ['JONA-ES-CHBK-001', 'HUDS-TB-OAK-002'],
  order_id: 'SG-10001234',
  contents: [
    { quantity: 1, item_price: '1299.00' },
    { quantity: 1, item_price: '1299.00' },
  ],
};
```

#### Schema: swatch_purchase

> 🆕 **新接入事件（Order 模块）**
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestSwatchPurchaseEvent`
>
> Trigger 校验必填：`payload.eventId && payload.swatchSkus?.length`
>
> 上报时 `event_name` = `'custom'`

**TS Schema**

```ts
/** swatch_purchase 事件 custom_data（聚合类型，仅 1 个字段） */
type SwatchPurchaseEventParameters = {
  /** Swatch SKU 列表，来自 payload.swatchSkus；必填且长度 > 0 */
  content_ids: string[];
};
```

**Example**

```ts
const example: SwatchPurchaseEventParameters = {
  content_ids: ['SWATCH-BCL-FAB-001', 'SWATCH-ASH-FAB-002'],
};
```

#### Schema: new_customer_purchase

> 🆕 **新接入事件（Order 模块）**
>
> 数据来源：`libs/modules/tracking/services/src/lib/triggers/pinterest-capi-events.trigger.ts` → `trackPinterestNewCustomerPurchaseEvent`
>
> Trigger 校验必填：`payload.eventId && payload.value && payload.orderId`
>
> 上报时 `event_name` = `'custom'`

**TS Schema**

```ts
/** new_customer_purchase 事件 custom_data（聚合类型，所有字段 inline） */
type NewCustomerPurchaseEventParameters = {
  /** 新客订单金额，来自 payload.value；必填 💵 */
  value: string;
  /** 市场币种，来自 INTL_CURRENCY；必填 */
  currency: string;
  /** 商品 SKU / content id 列表，来自 payload.contentIds */
  content_ids: string[];
  /** 订单号，来自 payload.orderId；必填 */
  order_id: string;
  /** 订单 line items，来自 payload.contents（含 product id；util 层 .map 时仅保留 quantity + item_price，id 字段被丢弃） */
  contents: Array<{
    /** 该 line item 的产品 id（trigger 层组装但 util 层 map 时被丢弃） */
    id: string;
    /** 该 line item 的数量 */
    quantity: number;
    /** 该 line item 的单价 💵 */
    item_price: string;
  }>;
};
```

**Example**

```ts
const example: NewCustomerPurchaseEventParameters = {
  value: '2598.00',
  currency: 'SGD',
  content_ids: ['JONA-ES-CHBK-001', 'HUDS-TB-OAK-002'],
  order_id: 'SG-10001234',
  contents: [
    { id: '12345', quantity: 1, item_price: '1299.00' },
    { id: '67890', quantity: 1, item_price: '1299.00' },
  ],
};
```

---

## ⚠️ 待确认事件

该列表中事件，为前端事件名映射中已注册但当前 trigger 代码未发现上报实现，请人工确认。

| #   | 事件名               | PRD 触发场景概述 | 关联模块 | 备注                                                                                                              |
| --- | -------------------- | ---------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | **lead**             | N/A              | TBD      | `PINTEREST_CAPI_LEAD = 'lead'` 已注册，但未找到对应 trigger；events-name.ts 注释 `to be confirmed`               |

---

## 🚫 已废弃事件

| #   | 事件名 | 状态 | 备注                                                                  |
| --- | ------ | ---- | --------------------------------------------------------------------- |
| N/A | N/A    | N/A  | 当前无 PRD，代码中未发现明确标记为废弃的 Pinterest CAPI 事件          |

---

## 待确定事项 (Open Questions)

1. **`content_name` 字段丢失**：`buildPinterestProductCustomData` / `buildPinterestWishlistCustomData` / `buildPinterestRegistrationCustomData` 在 trigger 层组装了 `content_name`，但 `getPinterestCapiEventData` 重组 `reCustomData` 时**未保留** `content_name` 字段。需要确认：
   - 是 util 层漏掉了字段（bug），还是 Pinterest CAPI 不需要该字段（设计如此）？
   - 若是 bug：`signup` 的来源区分（Sign Up / Subscription Footer）会完全丢失。
2. **Custom event 无法区分**：所有 5 个 Order/Checkout 模块的 [NEW] 事件 + `add_to_wishlist` + `add_swatch_to_cart` 共用 `event_name='custom'`。Pinterest 端如何区分这 7 个不同的 custom event 类型？是否需要在 `custom_data` 中加 `event_category` / `custom_event_name` 字段，或者依赖 `event_id` 命名约定？
3. **`content_ids` 语义**：参考 fb-capi 的 Open Question — 当前传 SKU 数组；Pinterest 官方推荐 `product_id`（catalog feed 中的商品 ID）。需 PM / 广告团队确认 catalog feed 维度对齐方式。
4. **金额字段类型不一致**：`checkout / add_payment_info / new_customer_purchase` 中 `value: string`；`initiate_checkout` 中由 `+payload.value` 转为 `number`；`signup` 固定为 `0` (number)。util 层会统一回 string（`customData.value ? \`${customData.value}\` : undefined`），但 Pinterest 官方文档要求 `value: string` 还是 `number`？需对齐。
5. **`new_customer_purchase` 的 `contents[].id` 丢失**：trigger 层 `payload.contents` 含 `id: string`，但 `getPinterestCapiEventData` 的 `.map` 仅保留 `item_price + quantity`，product id 被丢弃。需确认是否需要保留。
6. **`swatch_purchase` 缺 value/currency**：`buildPinterestSwatchCustomData` 仅输出 `content_ids`，Pinterest custom event 是否需要 `value` / `currency` 字段做归因？swatch 是否收费 / 是否计入广告价值？
7. **`PINTEREST_CAPI_PURCHASE` 事件名**：常量值为 `'checkout'` 而非 `'purchase'`。Pinterest 标准事件名是 `checkout`（用于"加入支付页面"含义）—— 当前用作真实订单完成事件是否对齐 Pinterest 官方语义？需对齐 PM / 广告团队。
8. **`event_id` 去重粒度**：Pinterest CAPI 支持 client-side pixel + server-side CAPI 双侧去重，要求 `event_id` 一致。当前架构是否同时上报 client pixel？若仅有 CAPI，则 `event_id` 仅用于服务端幂等。
9. **`user_data.em` 字段缺失**：`getPinterestUserData` 中 email 字段被注释（`// em: data.user_data.em && ...`）。Pinterest 推荐 user_data 含 sha256(email) 用于 enhanced match，是否后续接入？
10. **`signup` 事件命中 Pinterest 标准事件**：Pinterest 官方文档中 `signup` 是标准事件名，常用于 Lead generation。当前 Footer Newsletter 也归到 `signup` 是否合理（vs `lead`）？需 PM 对齐。
