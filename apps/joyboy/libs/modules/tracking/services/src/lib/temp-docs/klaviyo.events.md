# Klaviyo Trigger Activity Feed - Event List

> **当前 PRD**: [https://castlery.atlassian.net/wiki/spaces/PM/pages/3719364730/Klaviyo+trigger+activity+feed](https://castlery.atlassian.net/wiki/spaces/PM/pages/3719364730/Klaviyo+trigger+activity+feed)
>
> **官方开发者文档**: [https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration#started-checkout](https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration#started-checkout)
>
> **前端事件名映射**: `libs/modules/tracking/services/src/lib/events-name/klaviyo-events-name.ts`
>
> **生成规则**：
>
> - 「前端已追踪事件」汇总了 `KLAVIYO_EVENTS_NAME` 中**所有**事件，包括当前 PRD 涉及的事件，以及来源于其他 PRD 的事件
> - 当前 PRD 中存在但**不在** `KLAVIYO_EVENTS_NAME` 的事件归入"待确认事件"
> - 🛠️ "有修改的字段"；🆕 "新增字段，多用于用户细分分析"；💵 价格字段默认带当前市场货币符号
> - 通用字段（`$value`、`$event_id`、user info 等）按现有内容上报；表格只列各 trigger 特有字段
> - 订单相关 `$event_id = order number`
> - `$value = [trigger name] Value` 字段值（例：Added to Cart 中 `$value = Added to Cart Value`）
> - 每个事件的 Schema 用 **TS interface** 形式描述（字段注释含 PRD 说明 + 🛠️/🆕 标记），并提供一个 **Example** 真实形态示例对象

---

## ✅ 前端追踪事件

> 事件名映射详见 `libs/modules/tracking/services/src/lib/events-name/klaviyo-events-name.ts`。
> 每个事件的 Schema 以 TS interface + Example 形式呈现在下方 [Schemas](#schemas) 小节。

| #   | 事件名                    | 事件 Schema                                                      | 触发场景                                                                                                       | 关联模块                  | 生效渠道 | 备注 |
| --- | ------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | -------- | ---- |
| 1   | **Added to Cart**         | [§ Schema: Added to Cart](#schema-added-to-cart)                 | 用户加车后，针对购物车中**每个可售卖**的商品上报（排除 SKU/SPU disable 与当前 channel unavailable 的商品）     | Cart / Product            | Web      |      |
| 2   | **Started Checkout**      | [§ Schema: Started Checkout](#schema-started-checkout)           | 用户发起结算时，针对购物车中**每个可售卖**的商品上报（排除 SKU/SPU disable 与当前 channel unavailable 的商品） | Checkout / Cart           | Web      |      |
| 3   | **identify**              | [§ Schema: identify](#schema-identify)                           | 用户身份识别上报（登录 / 注册 / 用户信息变更）                                                                 | User / Identity           | All      |      |
| 4   | **Viewed Product**        | [§ Schema: Viewed Product](#schema-viewed-product)               | 用户进入 PDP 浏览商品时上报                                                                                    | Product / PDP             | Web      |      |
| 5   | **Recently Viewed Items** | [§ Schema: Recently Viewed Items](#schema-recently-viewed-items) | 浏览 PDP 时同步上报浏览过的商品（受 feature flag `trackKlaviyoRecentlyViewedItems` 控制），用于个性化推荐      | Product / Personalization | Web      |      |

### Schemas

#### Schema: Added to Cart

**TS Schema**

```ts
/** Added to Cart 事件参数（聚合类型，所有字段 inline） */
type AddedToCartEventParameters = {
  /** Klaviyo 标准字段。值 = `Added to Cart Value`，即购物车商品总价（含刚加车的商品） 💵 */
  $value: string;
  /** 加车后购物车商品列表（每个可售卖商品一条） */
  Items: Array<{
    /** SPU 名称 */
    ProductName: string;
    /** 商品数量 */
    Quantity: number;
    /** 商品图片，取 img list 中的 mini */
    ImageURL: string;
    /** 商品 PDP url */
    ProductURL: string;
    /** 商品单价（含原价 + 销售价） 🛠️ 更新字段名称 */
    UnitPrice: {
      /** 原价（划线价）；无划线价时为 null 💵 */
      OriginalPrice: string | null;
      /** 销售价 💵 */
      SalesPrice: string;
    };
    /** Line item 价格 = 销售价单价 × 数量 🛠️ 更新字段名称 💵 */
    RowTotal: string;
    /** SKU code */
    SKU: string;
    /** 商品后台类目 🛠️ 更新字段名称 */
    Categories: string[];
    /** Collection Name，用于用户细分分析 🆕 */
    CollectionName: string;
    /** Option type + Option value 🆕 */
    OptionsText: string[];
  }>;
};
```

**Example**

```ts
const example: AddedToCartEventParameters = {
  $value: '$2,298.00',
  Items: [
    {
      ProductName: 'Lily Sofa',
      Quantity: 1,
      ImageURL: 'https://cdn.castlery.com/.../mini.jpg',
      ProductURL: 'https://www.castlery.com/sg/products/lily-sofa',
      UnitPrice: {
        OriginalPrice: null, // 无划线价时为 null
        SalesPrice: '$2,298.00',
      },
      RowTotal: '$2,298.00',
      SKU: 'LILY-3S-CRM-001',
      Categories: ['Living Room Sets', 'Living Room Sets'],
      CollectionName: 'Dawson Collection',
      OptionsText: ['Size: 160cm', 'Color: blue'],
    },
  ],
};
```

#### Schema: Started Checkout

**TS Schema**

```ts
/** Started Checkout 事件参数（聚合类型，所有字段 inline） */
type StartedCheckoutEventParameters = {
  /** Klaviyo 标准字段。值 = `Started Checkout Value`，即发起结算时商品总价格 💵 */
  $value: string;
  /** 结算时购物车商品列表（每个可售卖商品一条） */
  Items: Array<{
    /** SPU 名称 */
    ProductName: string;
    /** 商品数量 */
    Quantity: number;
    /** 商品图片，取 img list 中的 mini */
    ImageURL: string;
    /** 商品 PDP url */
    ProductURL: string;
    /** 商品单价（含原价 + 销售价） 🛠️ 更新字段名称 */
    UnitPrice: {
      /** 原价（划线价）；无划线价时为 null 💵 */
      OriginalPrice: string | null;
      /** 销售价 💵 */
      SalesPrice: string;
    };
    /** Line item 价格 = 单价 × 数量 🛠️ 更新字段名称 💵 */
    RowTotal: string;
    /** SKU code */
    SKU: string;
    /** 商品后台类目 🛠️ 更新字段名称 */
    Categories: string[];
    /** 已有商品的 Collection Name，用于用户细分分析 🆕 */
    CollectionName: string;
    /** 已有商品的 option type + option value 🆕 */
    OptionsText: string[];
  }>;
};
```

**Example**

```ts
const example: StartedCheckoutEventParameters = {
  $value: '$2,298.00',
  Items: [
    {
      ProductName: 'Lily Sofa',
      Quantity: 1,
      ImageURL: 'https://cdn.castlery.com/.../mini.jpg',
      ProductURL: 'https://www.castlery.com/sg/products/lily-sofa',
      UnitPrice: {
        OriginalPrice: null,
        SalesPrice: '$2,298.00',
      },
      RowTotal: '$2,298.00',
      SKU: 'LILY-3S-CRM-001',
      Categories: ['Living Room Sets'],
      CollectionName: 'Dawson Collection',
      OptionsText: ['Size: 160cm', 'Color: blue'],
    },
  ],
};
```

#### Schema: identify

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/klaviyo-events.trigger.ts` → `trackKlaviyoIdentifyEvent`

**TS Schema**

```ts
/** Klaviyo Identify 事件参数（聚合类型；Klaviyo 内置标准字段） */
type IdentifyEventParameters = {
  /** 用户邮箱（必填，空值时上报会被中止并记 logger.warn） */
  $email: string;
  /** 用户 First Name */
  $first_name: string;
  /** 用户 Last Name */
  $last_name: string;
};
```

**Example**

```ts
const example: IdentifyEventParameters = {
  $email: 'user@example.com',
  $first_name: 'John',
  $last_name: 'Smith',
};
```

#### Schema: Viewed Product

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/klaviyo-events.trigger.ts` → `trackKlaviyoViewedProductEvent`

**TS Schema**

```ts
/** Viewed Product 事件参数（聚合类型，所有字段 inline） */
type ViewedProductEventParameters = {
  /** variant.product_name，SPU 名称 */
  ProductName: string;
  /** variant.id */
  ProductID: string | number;
  /** variant.sku */
  SKU: string;
  /** 由 product.taxons 经 getBreadcrumbNames 取面包屑 [pageName, subPageName] */
  Categories: string[];
  /** getProductImageUrl(variant.images) 商品主图 */
  ImageURL: string;
  /** getProductUrl(variant, product.slug) PDP URL */
  URL: string;
  /** 硬编码 'Castlery' */
  Brand: string;
  /** +variant.price 销售价（数字，非字符串） */
  Price: number;
  /** +variant.list_price 原价 / 划线价（数字） */
  CompareAtPrice: number;
};
```

**Example**

```ts
const example: ViewedProductEventParameters = {
  ProductName: 'Lily Sofa',
  ProductID: 12345,
  SKU: 'LILY-3S-CRM-001',
  Categories: ['Living Room', 'Sofas'],
  ImageURL: 'https://cdn.castlery.com/.../mini.jpg',
  URL: 'https://www.castlery.com/sg/products/lily-sofa',
  Brand: 'Castlery',
  Price: 2298,
  CompareAtPrice: 2498,
};
```

#### Schema: Recently Viewed Items

> 数据来源：`libs/modules/tracking/services/src/lib/triggers/klaviyo-events.trigger.ts` → `trackKlaviyoViewedProductEvent`（在 Viewed Product 之后，受 feature flag `trackKlaviyoRecentlyViewedItems` 控制是否触发）

**TS Schema**

```ts
/** Recently Viewed Items 事件参数（聚合类型，所有字段 inline） */
type RecentlyViewedItemsEventParameters = {
  /** 商品名（取自 Viewed Product 的 ProductName） */
  Title: string;
  /** 商品 ID（取自 Viewed Product 的 ProductID） */
  ItemId: string | number;
  /** 面包屑分类（同 Viewed Product 的 Categories） */
  Categories: string[];
  /** 商品图 ⚠️ 注意大小写：`ImageUrl` ≠ Viewed Product 的 `ImageURL` */
  ImageUrl: string;
  /** PDP URL ⚠️ 注意大小写：`Url` ≠ Viewed Product 的 `URL` */
  Url: string;
  /** Klaviyo Recently Viewed Items 标准嵌套对象 */
  Metadata: {
    /** 硬编码 'Castlery' */
    Brand: string;
    /** 销售价（数字） */
    Price: number;
    /** 原价 / 划线价（数字） */
    CompareAtPrice: number;
  };
};
```

**Example**

```ts
const example: RecentlyViewedItemsEventParameters = {
  Title: 'Lily Sofa',
  ItemId: 12345,
  Categories: ['Living Room', 'Sofas'],
  ImageUrl: 'https://cdn.castlery.com/.../mini.jpg',
  Url: 'https://www.castlery.com/sg/products/lily-sofa',
  Metadata: {
    Brand: 'Castlery',
    Price: 2298,
    CompareAtPrice: 2498,
  },
};
```

---

## ⚠️ 待确认事件

- 说明：该列表中事件，为 PRD 中定义事件，上报场景不在前端，请人工确认

| #   | 事件名                         | PRD 触发场景概述                                                                   | 关联模块                   | 备注               |
| --- | ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------- | ------------------ |
| 1   | **Cart Transferred**           | O2O（Online-to-Offline / Offline-to-Online）操作完成后，针对 O2O 所有商品上报      | Cart / O2O / Sales         | N/A                |
| 2   | **Strike Off Price Update**    | 购物车可售商品里所有降价的商品                                                     | Cart / Product / Pricing   | N/A                |
| 3   | **Placed Order**               | 订单支付完成时上报订单信息+商品；Cowboy 点击 Resend / Resend Internally 可再次触发 | Order / Payment / Checkout | N/A                |
| 4   | **Cancelled Order**            | 订单被取消时上报                                                                   | Order                      | N/A                |
| 5   | **Fulfilled Order**            | 订单送达（fulfilled）时上报                                                        | Order / Fulfillment        | N/A                |
| 6   | **Stripe Payment Link**        | 发送 Stripe Payment Link 时上报                                                    | Payment / Order            | N/A                |
| 7   | **Quotation Email**            | 发送 Quotation Email（报价单）时上报，含订单信息+商品+quotation 信息               | Order / Quotation          | N/A                |
| 8   | **Ordered Product**            | 订单中**每个**商品分别上报一条数据                                                 | Order / Product            | N/A                |
| 9   | **Swatch Order Reminder**      | PRD 字段表为空（"-"）                                                              | Product / Swatch           | ⚠️ PRD schema 缺失 |
| 10  | **Review Invitation**          | 本次评价邀请中需评价的所有商品（= shipment 中的商品）                              | Review / Order / Shipment  | N/A                |
| 11  | **Review Invitation Reminder** | 评价邀请提醒（schema 同 Review Invitation）                                        | Review / Order / Shipment  | N/A                |

---

## 🚫 已废弃事件（PRD 明确无需上报）

| #   | 事件名                       | 状态   | 备注                                                                     |
| --- | ---------------------------- | ------ | ------------------------------------------------------------------------ |
| 1   | Visited Payment Page         | 已废弃 | PRD 原文："这两个触发废弃，不需要上报，请忽略此表，无需上报了。留作记录" |
| 2   | Visited Shipping Method Page | 已废弃 | 同上                                                                     |

---

## 本次 Trigger 重构修改清单

> 对应文件：
>
> - `libs/modules/tracking/services/src/lib/entity/klaviyo-events.schema.ts`
> - `libs/modules/tracking/services/src/lib/utils/klaviyo.util.ts`
> - `libs/modules/tracking/services/src/lib/triggers/klaviyo-events.trigger.ts`

1. 在 entity 文件中显式定义 Klaviyo 事件 schema：`KlaviyoIdentifyEventSchema`、`KlaviyoViewedProductEventSchema`、`KlaviyoRecentlyViewedItemsEventSchema`、`KlaviyoAddedToCartEventSchema`、`KlaviyoStartedCheckoutEventSchema`、`KlaviyoProductItemEventSchema`。
2. 在 entity 文件中显式定义 trigger payload schema：`KlaviyoIdentifyTriggerPayloadSchema`、`KlaviyoAddedToCartTriggerPayloadSchema`、`KlaviyoAddedToCartTriggerPayloadSchemaV2`、`KlaviyoStartedCheckoutTriggerPayloadSchema`。
3. `Added to Cart` / `Started Checkout` 事件 payload 收敛为当前 PRD 文档结构：`$value` + `Items`。旧实现里的 `ItemNames`、`CheckoutURL`、`AddedItem*`、顶层 `Categories` 未继续上报。
4. `Items` 字段统一映射为 PRD 新字段：`UnitPrice.OriginalPrice`、`UnitPrice.SalesPrice`、`RowTotal`、`Categories`、`CollectionName`、`OptionsText`。
5. 价格字段统一通过当前市场货币符号格式化为字符串；无划线价时 `UnitPrice.OriginalPrice = null`。
6. 新旧购物车 LineItem 分别通过独立 mapper 兼容：旧结构使用 snake_case 字段，新结构使用 camelCase 字段。
7. `Added to Cart` / `Started Checkout` 过滤不可追踪商品：排除 disabled、inactive、deleted、region/channel unavailable 的 line item；若无可追踪商品则中止上报并记录 warn。
8. `Viewed Product` / `Recently Viewed Items` 也使用显式事件 schema，并过滤空分类值，避免上报 `['Living Room', '']` 这类空分类。
9. `trackKlaviyoAddedToCartEventV2` 标记为 ORP only；Klaviyo trigger 日志统一为 `[Tracking][Klaviyo] <event>` + 结构化字段格式。
10. Klaviyo 金额格式化、line item mapper、可追踪商品过滤、日志 helper 迁移到 `utils/klaviyo.util.ts`，trigger 只保留事件编排和上报。

---

## 待确定事项 (Open Questions)

1. **生效渠道（Web / POS / All）** — PRD 未对 trigger 维度明确生效渠道，本表基于业务上下文推断（Cart/Checkout 类默认 Web，Order/Review 类含 `OrderChannel` 字段标记 All），需开发人员复核。
2. `**bcc_email` vs `SalesEmail`\*\* — PRD 标注两字段重复但 `bcc_email` "暂时不改动名称，涉及的地方有点多"，需评估后续是否统一。
3. `Viewed Product` **/** `Recently Viewed Items` **缺失对应 PRD** — 这两个事件已在代码中实现但未关联 PRD 文档，需 PM 确认上报字段是否仍为最新要求，或补充 PRD，或根据官方文档补充。
4. `Added to Cart` / `Started Checkout` 旧实现中的 `ItemNames`、`CheckoutURL`、`AddedItem*`、顶层 `Categories` 已按当前 PRD schema 移除；需 PM / Klaviyo 配置侧确认现有 flow、segment 或模板没有依赖这些旧字段。
5. `CollectionName` 当前通过 taxon 中 `ancestors[0] === 'Collections'` 的一级分类推断；若 PRD 对 Collection Name 有更明确的来源字段，需要替换为指定数据源。
6. `OptionsText` 当前由 option type name + option value name 拼接（例：`Size: 160cm`）；若 Klaviyo 侧希望使用 `presentation` 文案，需要确认后调整。
