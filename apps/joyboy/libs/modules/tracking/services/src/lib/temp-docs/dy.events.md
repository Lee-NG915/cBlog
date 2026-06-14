# DY Trigger Activity Feed - Event List

> **当前 PRD**: N/A（暂无 PRD，按 DY 官方开发者文档对齐；PRD 补齐后再合并）
>
> **官方开发者文档**: [https://dy.dev/docs/add-to-cart](https://dy.dev/docs/add-to-cart)
>
> **前端事件名映射**: `libs/modules/tracking/services/src/lib/events-name/dy-events-name.ts`
>
> **生成规则**：
>
> - 「前端追踪事件」表已收敛的事件：**Add to Cart**、**Purchase**、**Remove from Cart**、**Promo Code Entered**（均对齐 DY 官方），以及 **Swatch Purchase**、**Swatch ATC**（Castlery 自定义事件，从代码反推 Schema）；其余事件待官方/PRD 文档补充后再纳入，**暂列入「待确认事件」**
> - 🛠️ "有修改的字段"；🆕 "新增字段"；💵 价格字段
> - DY 通用约定：所有事件通过 `window.DY.API('event', { name, properties })` 上报（`utils/dy.util.ts` → `trackDy`）；事件名映射详见 `events-name/dy-events-name.ts`
> - 价格字段（`value`、`itemPrice`）按 DY 官方要求为 **Float**（`number`），dollars.cents 格式，不带货币符号；货币用 `currency` 字段单独传
> - 每个事件的 Schema 用 **TS interface（聚合类型）** 形式描述，并提供一个 **Example** 真实形态示例对象

---

## ✅ 前端追踪事件

> 事件名映射详见 `libs/modules/tracking/services/src/lib/events-name/dy-events-name.ts`。
> 每个事件的 Schema 以 TS interface + Example 形式呈现在下方 [Schemas](#schemas) 小节。

| #   | 事件名                 | 事件 Schema                                                | 触发场景                                                                                                                | 关联模块             | 生效渠道 | 备注                                                           |
| --- | ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------- | -------- | -------------------------------------------------------------- |
| 1   | **Add to Cart**        | [§ Schema: Add to Cart](#schema-add-to-cart)               | 用户点击 PDP/PLP/Cart 等入口加车成功后触发；上报本次加车明细 + 加车后完整购物车状态（Swatch 排除）                      | Cart / Product       | Web      | DY 官方 `add-to-cart-v1`，无版本差异                           |
| 2   | **Purchase**           | [§ Schema: Purchase](#schema-purchase)                     | 订单支付成功，order confirmation 页面触发，上报全单数据（Swatch 排除），用于 DY 购买归因 + 推荐优化                     | Order / Payment      | Web      | DY 官方 `purchase-v1`；`uniqueTransactionId` ≤ 64 chars        |
| 3   | **Remove from Cart**   | [§ Schema: Remove from Cart](#schema-remove-from-cart)     | 用户在购物车页面移除商品后触发，上报被移除商品 + 剩余购物车（官方对 Reconnect 类活动建议必报）                          | Cart                 | Web      | DY 官方 `remove-from-cart-v1`；本轮已重构但仓库**暂无 caller** |
| 4   | **Swatch Purchase**    | [§ Schema: Swatch Purchase](#schema-swatch-purchase)       | 订单支付成功（订单中包含 ≥ 1 个 Swatch 商品）时触发，上报本单中所有 Swatch SKU；仅 Swatch 商品参与，普通商品走 Purchase | Order / Swatch       | Web      | **DY 自定义事件**（无官方文档），Schema 从代码反推             |
| 5   | **Swatch ATC**         | [§ Schema: Swatch ATC](#schema-swatch-atc)                 | 用户把 **Swatch 商品**加入购物车时触发；与普通 Add to Cart **互斥**（加 Swatch 时不上报 ATC）                           | Cart / Swatch        | Web      | **DY 自定义事件**（无官方文档），Schema 从代码反推             |
| 6   | **Promo Code Entered** | [§ Schema: Promo Code Entered](#schema-promo-code-entered) | 用户在 cart / checkout 页 apply coupon **成功**时触发；上报实际生效的优惠码                                             | Checkout / Promotion | Web      | DY 官方 `enter-promo-code-v1`；**本轮修复 2 处官方对齐 bug**   |

### Schemas

#### Schema: Add to Cart

> 数据来源：DY 官方文档 [`add-to-cart-v1`](https://dy.dev/docs/add-to-cart)；前端实现详见 `libs/modules/tracking/services/src/lib/helpers/dy.helper.ts` → `buildDYAddToCartProperties` / `buildDYAddToCartPropertiesV2`。

**TS Schema**

```ts
/** DY Add to Cart 事件参数（聚合类型，所有字段 inline） */
type DYAddToCartEventParameters = {
  /** DY 标准字段，固定值 'add-to-cart-v1'（官方目前唯一版本） */
  dyType: 'add-to-cart-v1';
  /** 本次加车的商品总价（**仅新加入商品**，= 单价 × 数量），Float，dollars.cents 💵 */
  value: number;
  /** 当前市场货币代码（多市场必填），如 'USD' / 'SGD' / 'AUD' / 'CAD' / 'GBP'，取自 `INTL_CURRENCY` */
  currency: string;
  /** 本次加车的目标 SKU，与 product feed 中的 SKU 一致 */
  productId: string;
  /** 本次加车的目标数量 */
  quantity: number;
  /** 加车后完整购物车状态（Swatch 排除），按加入顺序排列 */
  cart: Array<{
    /** SKU code，与 product feed 一致 */
    productId: string;
    /** 该 line item 数量 */
    quantity: number;
    /** 该 line item 单价（销售价），Float，dollars.cents 🛠️ 由 string 改为 number 💵 */
    itemPrice: number;
  }>;
};
```

**Example**

```ts
const example: DYAddToCartEventParameters = {
  dyType: 'add-to-cart-v1',
  value: 2298, // 1 × $2,298.00
  currency: 'SGD',
  productId: 'LILY-3S-CRM-001',
  quantity: 1,
  cart: [
    {
      productId: 'LILY-3S-CRM-001',
      quantity: 1,
      itemPrice: 2298,
    },
    {
      productId: 'PILLOW-VLT-002',
      quantity: 2,
      itemPrice: 49.95,
    },
  ],
};
```

#### Schema: Purchase

> 数据来源：DY 官方文档 [`purchase-v1`](https://dy.dev/docs/purchase)；前端实现详见 `libs/modules/tracking/services/src/lib/helpers/dy.helper.ts` → `buildDYPurchaseProperties`；调用方 `libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts` → `toDYPurchaseOrder`（Swatch 商品在 listener 层混合传入，由 builder 内部过滤）。

**TS Schema**

```ts
/** DY Purchase 事件参数（聚合类型，所有字段 inline） */
type DYPurchaseEventParameters = {
  /** DY 标准字段，固定值 'purchase-v1' */
  dyType: 'purchase-v1';
  /** 订单全单总金额（含税、运费等，**与 ATC 仅本次加车的口径不同**），Float，dollars.cents 💵 */
  value: number;
  /** 当前市场货币代码（多市场必填），来自 `order.summary.currency` */
  currency: string;
  /** 订单号，DY 用作幂等键；官方约束 **≤ 64 字符** 的 string 🛠️ 由 `DYValue` 收紧为 `string` */
  uniqueTransactionId: string;
  /** 全单 line items（Swatch 排除），按加入顺序 */
  cart: Array<{
    /** SKU code，与 product feed 一致 */
    productId: string;
    /** 该 line item 数量 */
    quantity: number;
    /** 该 line item 单价，Float，dollars.cents 🛠️ 由 string 改为 number 💵 */
    itemPrice: number;
  }>;
};
```

**Example**

```ts
const example: DYPurchaseEventParameters = {
  dyType: 'purchase-v1',
  value: 2347.95, // 全单总金额
  currency: 'SGD',
  uniqueTransactionId: 'CL-SG-202605-000123',
  cart: [
    {
      productId: 'LILY-3S-CRM-001',
      quantity: 1,
      itemPrice: 2298,
    },
    {
      productId: 'PILLOW-VLT-002',
      quantity: 1,
      itemPrice: 49.95,
    },
  ],
};
```

#### Schema: Remove from Cart

> 数据来源：DY 官方文档 [`remove-from-cart-v1`](https://dy.dev/docs/remove-from-cart)；前端实现详见 `libs/modules/tracking/services/src/lib/helpers/dy.helper.ts` → `buildDYRemoveFromCartProperties`。
> ⚠️ 当前 trigger `trackDYRemoveFromCartEvent` **仓库内暂无 dispatch 调用方**，schema/builder 已对齐官方；接入时需保证调用方传入 `targetPrice`（被移除商品单价）。

**TS Schema**

```ts
/** DY Remove from Cart 事件参数（聚合类型，所有字段 inline） */
type DYRemoveFromCartEventParameters = {
  /** DY 标准字段，固定值 'remove-from-cart-v1' */
  dyType: 'remove-from-cart-v1';
  /** **被移除商品**的总金额（= 单价 × 移除数量，不含购物车剩余商品），Float 💵 🆕 之前缺失，本轮新增 */
  value: number;
  /** 当前市场货币代码 🆕 之前缺失，本轮新增（多市场必填） */
  currency: string;
  /** 被移除商品的 SKU */
  productId: string;
  /** 被移除商品的数量（移除多少件，非剩余数量） */
  quantity: number;
  /** 移除后的购物车状态（不含被移除商品），按加入顺序 */
  cart: Array<{
    /** SKU code */
    productId: string;
    /** 该 line item 剩余数量 */
    quantity: number;
    /** 该 line item 单价，Float 🛠️ 由 string 改为 number 💵 */
    itemPrice: number;
  }>;
};
```

**Example**

```ts
const example: DYRemoveFromCartEventParameters = {
  dyType: 'remove-from-cart-v1',
  value: 49.95, // 1 × $49.95
  currency: 'SGD',
  productId: 'PILLOW-VLT-002',
  quantity: 1,
  cart: [
    {
      productId: 'LILY-3S-CRM-001',
      quantity: 1,
      itemPrice: 2298,
    },
  ],
};
```

#### Schema: Swatch Purchase

> 数据来源：**Castlery 自定义事件，DY 官方无对应文档**；Schema 从代码反推：`libs/modules/tracking/services/src/lib/helpers/dy.helper.ts` → `buildDYSwatchPurchaseProperties`、`entity/dy-events.schema.ts` → `DYSwatchPurchaseEventPropertiesSchema`；调用方 `libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts:168-173`。

**触发条件**

- **Precondition**：订单中包含 ≥ 1 个 Swatch 商品（`productType === ProductTypeMapping.SWATCH`）
- **Trigger Step**：用户完成下单（`purchasedSucceededEvent` 派发）；按 `swatchSkus.length` 守护，无 Swatch 商品时不上报
- **Expect Result**：DY API 收到 `event` 调用，`name: 'Swatch Purchase'`，properties 含 `'Swatch SKUs'` 字段
- **Remark**：与普通 Purchase 事件**并行**派发；普通商品走 `Purchase`，Swatch 商品走 `Swatch Purchase`

**TS Schema**

```ts
/** DY Swatch Purchase 事件参数（聚合类型，Castlery 自定义事件，非 DY 官方标准） */
type DYSwatchPurchaseEventParameters = {
  /** 本单中所有 Swatch 商品的 SKU，以英文逗号 + 空格 `', '` 拼接为单一 string */
  'Swatch SKUs': string;
};
```

**Example**

```ts
const example: DYSwatchPurchaseEventParameters = {
  'Swatch SKUs': 'SWATCH-LILY-CRM-001, SWATCH-PILLOW-VLT-002, SWATCH-DAWSON-OAK-003',
};

// DY API 调用形态：
// dy('event', {
//   name: 'Swatch Purchase',
//   properties: { 'Swatch SKUs': '<上面 string>' },
// });
```

#### Schema: Swatch ATC

> 数据来源：**Castlery 自定义事件，DY 官方无对应文档**；Schema 从代码反推：`libs/modules/tracking/services/src/lib/helpers/dy.helper.ts` → `buildDYSwatchAddToCartProperties`、`entity/dy-events.schema.ts` → `DYSwatchAddToCartEventPropertiesSchema` + `DYSwatchAddToCartTriggerPayloadSchema`；调用方 `libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts:97-146` → `dispatchSwatchTrackingEvents`。

**触发条件 & 互斥说明**

- **Precondition**：用户加入购物车的商品 `productType === ProductTypeMapping.SWATCH`（即"小样/色卡"商品）
- **Trigger**：cart slice 派发 `addedSwatchActionSucceededEvent`（**与普通商品的 `addedCartActionSucceededEvent` 是两条独立 redux action**）→ `cart-tracking.listener.ts` 命中 swatch 监听 → `dispatchSwatchTrackingEvents` 同时触发 GA Custom Event、FB Swatch ATC、Pinterest Swatch ATC、DY Swatch ATC
- ⚠️ **与普通 Add to Cart 完全互斥**：
  - 加 Swatch 商品 → 仅触发 `Swatch ATC`，**不会**触发 `Add to Cart`（`addedCartActionSucceededEvent` 不被派发）
  - 加普通商品 → 仅触发 `Add to Cart`，**不会**触发 `Swatch ATC`
  - 互斥由 cart slice 在派发层（按 `productType` 选择派发哪个 action）实现，listener 内不需要二次判断
- **Expect Result**：DY API 收到 `event` 调用，`name: 'Swatch ATC'`，properties 含 3 个字段

**TS Schema**

```ts
/** DY Swatch ATC 事件参数（聚合类型，Castlery 自定义事件，非 DY 官方标准） */
type DYSwatchATCEventParameters = {
  /** Swatch variant 名称（`variant.name`） */
  'Swatch Name': string;
  /** Swatch SKU（`variant.sku`） */
  'Swatch SKU': string;
  /**
   * Swatch 关联的"母商品" slug（`swatchRelatedProduct.slug`）。
   * 缺失时上报空字符串 `''`（builder 内 `?? ''` 兜底），便于 BI / DY 后台 segment 统一字符串处理
   */
  'Related Product': string;
};
```

**Example**

```ts
const example: DYSwatchATCEventParameters = {
  'Swatch Name': 'Lily Cream Velvet Swatch',
  'Swatch SKU': 'SWATCH-LILY-CRM-001',
  'Related Product': 'lily-sofa', // 对应 PDP 上 PDP 路径 `/products/lily-sofa`
};

// DY API 调用形态：
// dy('event', {
//   name: 'Swatch ATC',
//   properties: {
//     'Swatch Name': 'Lily Cream Velvet Swatch',
//     'Swatch SKU': 'SWATCH-LILY-CRM-001',
//     'Related Product': 'lily-sofa',
//   },
// });
```

#### Schema: Promo Code Entered

> 数据来源：DY 官方文档 [`enter-promo-code-v1`](https://dy.dev/docs/promo)；前端实现详见 `libs/modules/tracking/services/src/lib/helpers/dy.helper.ts` → `buildDYPromoCodeEnteredProperties`；调用方 `libs/modules/tracking/services/src/lib/triggers/coupon-events.trigger.ts:39` → `trackAppliedCouponUnifiedEvent`。

**触发条件**

- **Precondition**：用户在 cart / checkout 任意阶段输入优惠码，且后端校验通过、优惠成功 apply
- **Trigger**：caller `trackAppliedCouponUnifiedEvent` 在 apply coupon 成功的回调里 dispatch `trackDYPromoCodeEnteredEvent({ promoCode })`（caller 内已守护 `couponCode` 非空 + `typeof window !== 'undefined'`）
- **Expect Result**：DY API 收到 `event` 调用，`name: 'Promo Code Entered'`，properties = `{ dyType: 'enter-promo-code-v1', code: '<生效的优惠码>' }`
- **Remark**：仅在 apply 成功时上报；输入但校验失败 / 用户主动移除等场景**不上报**此事件

**TS Schema**

```ts
/** DY Promo Code Entered 事件参数（聚合类型，对齐官方 enter-promo-code-v1） */
type DYPromoCodeEnteredEventParameters = {
  /**
   * DY 标准字段，固定值 'enter-promo-code-v1'
   * 🛠️ 本轮修复：旧实现误写为 `'promo-code-entered-v1'`（与官方不匹配，DY 后台无法识别）
   */
  dyType: 'enter-promo-code-v1';
  /**
   * 用户输入并成功 apply 的优惠码
   * 🛠️ 本轮修复：旧实现字段名为 `promoCode`（与官方 `code` 不匹配）；
   * trigger payload 字段仍为 `promoCode`（保持 caller 不动），builder 内部映射为 `code` 输出
   */
  code: string;
};
```

**Example**

```ts
const example: DYPromoCodeEnteredEventParameters = {
  dyType: 'enter-promo-code-v1',
  code: 'WELCOME10',
};

// DY API 调用形态：
// dy('event', {
//   name: 'Promo Code Entered',
//   properties: { dyType: 'enter-promo-code-v1', code: 'WELCOME10' },
// });
```

---

## ⚠️ 待确认事件

> 说明：以下事件已在 `events-name/dy-events-name.ts` 注册并存在前端实现，但**官方开发者文档暂未对齐**；待逐个补充 DY 官方文档后再纳入「前端追踪事件」并完善 Schema。

| #   | 事件名                      | 当前实现入口                                            | 关联模块           | 备注                             |
| --- | --------------------------- | ------------------------------------------------------- | ------------------ | -------------------------------- |
| 1   | **Add to Wishlist**         | `buildDYAddToWishlistProperties`                        | Product / Wishlist | 待官方文档对齐                   |
| 2   | **Newsletter Subscription** | `buildDYNewsletterSubscriptionProperties`               | User / Marketing   | 待 brand refresh + 官方文档对齐  |
| 3   | **Keyword Search**          | `buildDYKeywordSearchProperties`                        | Search             | 待 brand refresh + 官方文档对齐  |
| 4   | **Filter Items**            | `buildDYFilterItemsProperties`                          | Search / PLP       | 待官方文档对齐                   |
| 5   | **Login**                   | `buildDYUserIdentificationProperties('login-v1', ...)`  | User               | 待 login refactor + 官方文档对齐 |
| 6   | **Signup**                  | `buildDYUserIdentificationProperties('signup-v1', ...)` | User               | 待 login refactor + 官方文档对齐 |

---

## 🚫 已废弃事件（PRD 明确无需上报）

| #   | 事件名 | 状态 | 备注 |
| --- | ------ | ---- | ---- |
| -   | -      | -    | 暂无 |

---

## 本次 Trigger 重构修改清单

> 对应文件：
>
> - `libs/modules/tracking/services/src/lib/entity/dy-events.schema.ts`
> - `libs/modules/tracking/services/src/lib/utils/dy.util.ts`
> - `libs/modules/tracking/services/src/lib/helpers/dy.helper.ts`
> - `libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts`（ATC V1 调用方）
> - `libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts`（ATC V2 调用方）
> - `libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts`（Purchase 调用方；本轮无代码改动，已通过 schema 类型收紧间接验证字段）

### Round 1 — Add to Cart（已完成）

1. **对齐 DY 官方 `add-to-cart-v1`**：`value` 由可选 `DYValue` 改为**必填 `number`**；`itemPrice` 由 `DYValue` 改为 `number`；其余字段（`dyType` / `currency` / `productId` / `quantity` / `cart`）字段名保持不变。
2. **新增 `DYAddToCartItemSchema`**（`itemPrice: number`）作为 ATC `cart[]` 元素类型。
3. **`value` 计算口径**：`value = targetPrice × targetQuantity`（仅本次加车商品，不含购物车原有商品），与官方 "Total monetary value of items added (not entire cart)" 一致。
4. **`targetPrice` 由外部传入**：在 `DYAddToCartTriggerPayloadSchema` / `DYAddToCartTriggerPayloadSchemaV2` 中新增 `targetPrice: number` 字段，调用方（cart-events.trigger / cart-tracking.listener）负责取数 + `Number()` 转换并传入。
5. **`dy.util.ts` 新增 ATC 专用工具函数**：`toDYPrice`（number 化 + finite 兜底）、`buildDYAddToCartItem`（V1，老 `DYLegacyLineItemSchema` 入参）、`buildDYAddToCartItemV2`（V2，`LineItemSchema` 入参）。
6. **`dy.helper.ts` 中 ATC builder 精简**：`buildDYAddToCartProperties` / `buildDYAddToCartPropertiesV2` 改用 util 中的 mapper，并按 `targetPrice × quantity` 写入 `value`；Swatch 过滤逻辑保留（V1 看 `is_swatch`，V2 看 `productType !== SWATCH`）。

### Round 2 — Purchase（已完成）

1. **对齐 DY 官方 `purchase-v1`**：`value` 由 `DYValue` 改为 `number`；`uniqueTransactionId` 由 `DYValue` 改为 `string`，并在 builder 内通过 `String(order.number).slice(0, 64)` 强制截断到官方上限。
2. **新增 `DYPurchaseCartItemSchema`**（`itemPrice: number`）作为 Purchase `cart[]` 元素类型；按事件粒度独立 schema（不与 ATC 复用），便于后续支持官方可选 `size` 字段。
3. **收紧 `DYPurchaseOrderSchema`**：`number: DYValue → string`，`total: DYValue → number`，由调用方（`toDYPurchaseOrder`）负责类型正确（OrderDataV1 字段类型已天然匹配，无需改动 listener 代码）。
4. **新增 `dy.util.ts → buildDYPurchaseCartItem`** mapper：消费 `DYLegacyLineItemSchema`，输出 `itemPrice: number`（经 `toDYPrice` 兜底）。
5. Swatch 过滤口径不变（`is_swatch`）。

### Round 3 — Remove from Cart（已完成，**仓库无 caller**）

1. **对齐 DY 官方 `remove-from-cart-v1`**：
   - 🆕 **新增 `value: number`**（官方必填，原实现完全缺失）= `targetPrice × quantity`
   - 🆕 **新增 `currency: string`**（多市场必填，原实现完全缺失）来自 `INTL_CURRENCY`
   - `itemPrice` 由 string 改为 number
2. **新增 `DYRemoveFromCartCartItemSchema`**（`itemPrice: number`）按事件粒度独立 schema。
3. **`DYRemoveFromCartTriggerPayloadSchema` 新增 `targetPrice: number`**：被移除商品单价，由外部传入；调用方接入时需保证传入。
4. **新增 `dy.util.ts → buildDYRemoveFromCartCartItem`** mapper：注意入参 `price` 在 line item 顶层（非 `variant.price`），与 ATC/Purchase 结构不同。
5. 仓库内 `trackDYRemoveFromCartEvent` **暂无 dispatch 调用方**；本轮仅完成 schema/builder 重构，业务接入由后续 Cart 移除场景开发任务负责。

### Round 4 — Swatch Purchase（仅文档，无代码改动）

1. **事件性质**：Castlery 自定义事件，DY 官方文档无对应规范；Schema 从代码反推（`buildDYSwatchPurchaseProperties` + `DYSwatchPurchaseEventPropertiesSchema`）。
2. **payload 形态**：单字段 `'Swatch SKUs': string`（注意带空格的字段名，与 BI / DY 后台配置一致），值 = 本单所有 Swatch SKU 的逗号空格 `, ` 拼接。
3. **触发链路**：`tracking.listener.ts:118` → `purchasedSucceededEvent` → 取 `swatchLineItems` → `swatchSkus.length > 0` 时与 Purchase 并行 dispatch `EVENT_DY_SWATCH_PURCHASE`。
4. **未改动**：schema / builder / trigger / listener / events-name 一律保持现状；本轮仅完成文档化（移至 ✅ 表 + 加 Schema 小节 + 触发条件说明）。

### Round 5 — Swatch ATC（仅文档，无代码改动）

1. **事件性质**：Castlery 自定义事件，DY 官方文档无对应规范；Schema 从代码反推（`buildDYSwatchAddToCartProperties` + `DYSwatchAddToCartEventPropertiesSchema` + `DYSwatchAddToCartTriggerPayloadSchema`）。
2. **payload 形态**：3 个带空格的字段名 —— `'Swatch Name'` / `'Swatch SKU'` / `'Related Product'`；`Related Product` 缺失时由 builder 兜底为 `''`。
3. **触发链路**：cart slice 在 swatch 入参时派发独立的 `addedSwatchActionSucceededEvent`（**非** `addedCartActionSucceededEvent`）→ `cart-tracking.listener.ts:217-228` 命中 → `dispatchSwatchTrackingEvents`（97-146 行）并行触发 GA Custom / FB / Pinterest / DY Swatch ATC。
4. **互斥说明**：Swatch ATC 与普通 Add to Cart **不会同时触发**——cart slice 在派发层按 `productType` 选择派发哪一个 redux action，listener 层完全不重叠；这是文档需要明确给到 BI / 数据团队的关键点。
5. **未改动**：schema / builder / trigger / listener / events-name / cart slice 一律保持现状；本轮仅完成文档化。

### Round 6 — Promo Code Entered（修 2 处官方对齐 bug + 文档）

1. **修复 `dyType`**：旧值 `'promo-code-entered-v1'` ❌ → 官方值 `'enter-promo-code-v1'` ✅。旧值与 DY 后台无法识别（影响所有依赖该事件的 segment / Reconnect 类活动）。
2. **修复字段名**：event 输出 `promoCode` ❌ → `code` ✅，对齐 DY 官方 schema。
3. **保持最小爆炸半径**：`DYPromoCodeEnteredTriggerPayloadSchema.promoCode` 字段名**不变**（trigger 内部命名，与官方无关）；builder 内部把 `payload.promoCode` 映射为 event 输出的 `code`；caller `coupon-events.trigger.ts:39` **零改动**。
4. **触发链路**：`trackAppliedCouponUnifiedEvent` 在 apply coupon 成功路径中（caller 内已守护 `couponCode` 非空 + `typeof window !== 'undefined'`）dispatch `trackDYPromoCodeEnteredEvent({ promoCode: couponCode })`；失败路径返回 `TRACKING_ERROR`，**不上报**。
5. **改动文件**：`entity/dy-events.schema.ts`（schema 字段名 + dyType 字面量）、`helpers/dy.helper.ts`（builder 映射）；**未改 caller、trigger 入口、events-name**。

### 清理

1. **删除**：`buildDYCartItem`（旧的 string-typed mapper）、`DYCartItemSchema.itemPrice = DYValue` 的实际使用。`DYCartItemSchema` 类型本身**保留并 `@deprecated`**，仅为兼容历史外部消费。

---

## 待确定事项 (Open Questions)

1. **DY 官方建议 `cart` 中 `itemPrice` 使用销售价（含折扣后）还是原价（划线价）？** —— 当前实现使用 `variant.price`（销售价）/ Purchase 使用 `OrderLineItemV1.salePrice`，与 Klaviyo `SalesPrice` 一致；官方文档仅写 "Price per unit"，需 PM/DY 侧确认。
2. **多 SKU 同时加车场景**：当前 V1/V2 trigger 均按"单 SKU 一次加车"的模型设计（`targetLineItem` / `payload.variant` 单数），如未来支持 bundle 或 multi-SKU ATC，需要扩展 `targetPrice` 为数组或改为 `value` 直接由外部传入。
3. **`currency` 兜底**：当前 V1 / RemoveFromCart 使用 `INTL_CURRENCY ?? ''` 兜底；DY 官方对多市场要求 `currency` 必填，是否需要在 `INTL_CURRENCY` 为空时直接中止上报并 `logger.warn`？
4. **Swatch 过滤口径不一致**：V1 用 `is_swatch`，V2 用 `productType !== ProductTypeMapping.SWATCH`，Purchase 也用 `is_swatch`（listener 层把 `productType === SWATCH` 映射为 `is_swatch: true`），是否需要在 util 中统一一个 `isTrackableForDY` 判定函数？
5. **`name` 字段**：DY 官方 ATC / Purchase 允许传可选 `name`（human-readable label），当前未上报，是否需要补？
6. **`itemPrice` / `value` 精度**：DY 官方说明 "rounded to nearest 0.01；< 0.005 round down"，当前实现直接 `Number(price)` 或 `targetPrice × quantity`，未做显式 round；价格字段是否需要在 util 层统一 round 到 2 位小数？
7. **Purchase `uniqueTransactionId` 截断**：当前用 `String(order.number).slice(0, 64)` 兜底；Castlery 订单号长度上限是多少？是否会出现 > 64 字符导致截断后重复的极端场景？建议 PM 侧确认订单号生成规则。
8. **Purchase `value` 口径（全单 vs 仅商品金额）**：DY 官方 `value` 描述为 "the total cart purchased"，未明确是否含税/运费；当前实现使用 `order.summary.total`（含税运），如 DY 期望"仅商品小计"则需改用 `order.summary.subtotal` 或类似字段。
9. **Remove from Cart caller 接入**：仓库内目前无 caller dispatch `EVENT_DY_REMOVE_FROM_CART`，schema 已重构完毕；待 Cart 移除业务接入时，调用方需传入 `targetPrice`（被移除商品单价）；接入位置建议在 cart slice 的 `removedCartActionSucceededEvent` listener。
