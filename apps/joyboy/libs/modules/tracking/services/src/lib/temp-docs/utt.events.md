# UTT (impact.com) Trigger Event List

> **当前 PRD**: N/A（按 impact.com 官方文档对齐；PRD 补齐后再合并）
>
> **官方开发者文档**:
>
> - [JavaScript Installation](https://integrations.impact.com/impact-brand/docs/javascript-installation)
> - [Consent Mode](https://integrations.impact.com/impact-brand/docs/integrate-consent-mode-on-impactcom)
>
> **前端事件名映射**: `libs/modules/tracking/services/src/lib/events-name/utt-events-name.ts`
>
> **生成规则**：
>
> - UTT 通用约定：所有事件通过 `window.ire(verb, ...args)` 上报（`utils/utt.util.ts` → `trackUtt`）；事件名映射详见 `events-name/utt-events-name.ts`
> - 价格字段（`subTotal`, `orderDiscount`）按 impact.com 官方要求为 `DECIMAL(8,2)`（`number`），不带货币符号
> - 每个事件 Schema 用 **TS type（聚合类型）** 形式描述，并提供 **Example** 真实形态示例
> - email 历史实现使用 SHA-256；impact.com 官方 spec 为 SHA-1，迁移期保留 SHA-256 以避免 device-graph 断档（详见 [docs/utt-impact-migration.md](../../../../../../../docs/utt-impact-migration.md) §5.1）
>
> **字段规约（data team 要求）**：
>
> - 用户 ID key：**UK** 使用 `customerid`（小写）；**其他 market**（US / SG / AU / CA）使用 `customerId`（驼峰）
> - 邮箱 key：**全 market** 统一使用 `customeremail`（小写），值为 SHA-256(email)
> - 双 feature flag：web 用 `UTT_IMPACT`（CA / UK），POS 用 `UTT_IMPACT_POS`（SG / AU / US）；两者共用同一套 trigger / helper / events name

---

## ✅ 前端追踪事件

| #   | 事件名             | 事件 Schema                                | 触发场景                                                                                                  | 关联模块        | 生效渠道 | 备注                                              |
| --- | ------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------- | -------- | ------------------------------------------------- |
| 1   | **UTT Consent**    | [§ Schema: Consent](#schema-consent)       | UTT 装载前先发 `'default'` 状态；CookieYes opt-in/out 切换后发 `'update'`                                 | Privacy / CMP   | Web      | impact.com Consent Mode；唯一类别 `tracking`      |
| 2   | **UTT Identify**   | [§ Schema: Identify](#schema-identify)     | 用户登录/登出/资料变更（`selectedActiveUser` 变化）时触发，把 customerId + SHA-256(email) 透给 impact.com | User            | Web      | impact.com 官方 `identify`                        |
| 3   | **UTT Conversion** | [§ Schema: Conversion](#schema-conversion) | 订单支付成功（`purchasedSucceededEvent` 派发）时由 `tracking.listener.ts` dispatch；上报全单 conversion   | Order / Payment | Web      | impact.com 官方 `trackConversion`；幂等键=orderId |

> **Feature flag**
>
> - Web：`UTT_IMPACT` —— `enabledRegions = [CA, UK]`，挂载点 `apps/web/.../layout.tsx → <UttInitialScript />`
> - POS：`UTT_IMPACT_POS` —— `enabledRegions = [SG, AU, US]`，挂载点 `apps/pos/app/[locale]/layout.tsx → <PosUttInitialScript />`
> - 两者使用独立的 `scriptUrl` + `conversionEventId`，由 `getUTTCdnUrl()` / `getPosUTTCdnUrl()` 分别读取
> - 待数据齐全后再翻转对应 market；详见 `packages/monorepo-features/src/lib/feaures/utt-impact.ts` + `utt-impact-pos.ts`。

### Schemas

#### Schema: Consent

> 数据来源：impact.com [Consent Mode 文档](https://integrations.impact.com/impact-brand/docs/integrate-consent-mode-on-impactcom)；前端实现详见 `helpers/utt.helper.ts` → `buildUTTConsentProperties`；触发器详见 `triggers/utt-events.trigger.ts` → `trackUTTConsentEvent`。

**触发条件**

- **Precondition**：feature flag `UTT_IMPACT` 已启用 + 当前 region 配置了 `scriptUrl`
- **Trigger Step**：
  - UTT 脚本挂载时（`ConsentBridge` 首次 `useEffect`）→ `mode: 'default'`，读取 CookieYes `advertisement` 类别当前状态
  - 后续 CookieYes 发出 `cookieyes_consent_update` 事件 → `mode: 'update'`，使用更新后的 advertisement 状态
- **Expect Result**：`ire('consent', mode, { tracking })` 被调用；SDK 据此切换是否写 cookie / 上报 PII
- **Remark**：必须在首次 `identify` 前完成 `'default'`（官方约束）；React 内 effect 顺序保证：JSX 内 `<ConsentBridge />` 写在 `<IdentifyBridge />` 之前

**TS Schema**

```ts
type UTTConsentTriggerPayloadSchema = {
  mode: 'default' | 'update';
  granted: boolean;
};

type UTTConsentEventPropertiesSchema = {
  tracking: 'granted' | 'denied';
};
```

**Example**

```ts
const examplePayload: UTTConsentTriggerPayloadSchema = {
  mode: 'default',
  granted: true,
};

const exampleProperties: UTTConsentEventPropertiesSchema = {
  tracking: 'granted',
};

// 实际调用形态：
// ire('consent', 'default', { tracking: 'granted' });
```

#### Schema: Identify

> 数据来源：impact.com [JS Installation 文档](https://integrations.impact.com/impact-brand/docs/javascript-installation) → identify section；前端实现详见 `helpers/utt.helper.ts` → `buildUTTIdentifyProperties`；触发器 `triggers/utt-events.trigger.ts` → `trackUTTIdentifyEvent`。

**触发条件**

- **Precondition**：feature flag `UTT_IMPACT` 已启用 + 当前 region 配置了 `scriptUrl`
- **Trigger Step**：`IdentifyBridge` 监听 `selectedActiveUser`，当 `user.id` 或 `user.email` 变化时 dispatch
- **Expect Result**：`ire('identify', { customerId, customerEmail })` 被调用
- **Remark**：未登录时 `customerId === ''`、`customerEmail === ''`（impact.com 文档允许传空字符串）

**TS Schema**

```ts
type UTTIdentifyTriggerPayloadSchema = {
  user: { id?: string; email?: string } | null | undefined;
};

type UTTCustomerIdentity =
  | { customerid: string } // UK
  | { customerId: string }; // US / SG / AU / CA

type UTTIdentifyEventPropertiesSchema = UTTCustomerIdentity & {
  /** SHA-256(email)（未登录为空字符串）🛠️ 历史保留 SHA-256，spec 为 SHA-1，迁移期不切以避免 device-graph 断档 */
  customeremail: string;
};
```

**Example**

```ts
const examplePayload: UTTIdentifyTriggerPayloadSchema = {
  user: { id: 'usr_01HZ...', email: 'abby@castlery.com' },
};

// 非 UK market（US / SG / AU / CA）
const exampleProperties: UTTIdentifyEventPropertiesSchema = {
  customerId: 'usr_01HZ...',
  customeremail: '0b14d501a594442a01c6859541bcb3e8164d183d32937b851835442f69d5c94e',
};

// UK market
const exampleUkProperties: UTTIdentifyEventPropertiesSchema = {
  customerid: 'usr_01HZ...',
  customeremail: '0b14d501a594442a01c6859541bcb3e8164d183d32937b851835442f69d5c94e',
};

// 实际调用形态（非 UK）：
// ire('identify', { customerId: 'usr_...', customeremail: '<sha256>' });
// 实际调用形态（UK）：
// ire('identify', { customerid: 'usr_...', customeremail: '<sha256>' });
```

#### Schema: Conversion

> 数据来源：impact.com [JS Installation 文档](https://integrations.impact.com/impact-brand/docs/javascript-installation) → trackConversion section；前端实现详见 `helpers/utt.helper.ts` → `buildUTTConversionProperties`；触发器 `triggers/utt-events.trigger.ts` → `trackUTTConversionEvent`；调用方 `listeners/tracking.listener.ts` → `purchasedSucceededEvent` listener。

**触发条件**

- **Precondition**：feature flag `UTT_IMPACT` 已启用 + 当前 region 配置了 `scriptUrl` + `conversionEventId !== 0` + 订单含至少 1 个 line item
- **Trigger Step**：success page dispatch `purchasedSucceededEvent({ order })` → listener 通过 `trackedPurchaseOrderIds` Set 去重后，dispatch `trackUTTConversionEvent({ order, user })`
- **Expect Result**：`ire('trackConversion', eventId, properties, { verifySiteDefinitionMatch: true })` 被调用
- **Remark**：与 FB / Pinterest / DY purchase 事件**并行**派发；共用同一去重 Set，同 orderId 只发一次

**TS Schema**

```ts
type UTTConversionTriggerPayloadSchema = {
  order: OrderDataV1;
  user: { id?: string; email?: string } | null | undefined;
};

type UTTConversionItemSchema = {
  /** 该 line item 行合计（= 单价 × 数量），来自 `OrderLineItemV1.amount` */
  subTotal: number;
  /** product type（bundle / configurable / pos service 等），来自 `OrderLineItemV1.productType` */
  category: string;
  /** SKU，与 product feed 一致 */
  sku: string;
  /** 行数量 */
  quantity: number;
  /** 商品名称 */
  name: string;
};

type UTTConversionEventPropertiesSchema = UTTCustomerIdentity & {
  /** 订单号，幂等键，来自 `order.number` */
  orderId: string;
  /** SHA-256(email)（未登录为空） */
  customeremail: string;
  /** 'New' = 首次下单（`order.firstPurchase === true`）；'Existing' = 老客 */
  customerStatus: 'New' | 'Existing';
  /** 货币代码（ISO 4217），来自 `order.summary.currency` */
  currencyCode: string;
  /** 优惠码（若有），来自 `order.summary.coupon.code` */
  orderPromoCode?: string;
  /** 优惠金额（若有），来自 `order.summary.coupon.amount` */
  orderDiscount?: number;
  /** 全单 line items（含 swatch；impact.com 不做 swatch 排除） */
  items: UTTConversionItemSchema[];
};
```

**Example**

```ts
const examplePayload: UTTConversionTriggerPayloadSchema = {
  order: {
    /* ... OrderDataV1 ... */
  } as OrderDataV1,
  user: { id: 'usr_01HZ...', email: 'abby@castlery.com' },
};

const exampleProperties: UTTConversionEventPropertiesSchema = {
  orderId: 'CL-CA-202605-000123',
  customerId: 'usr_01HZ...', // UK 时改为 customerid
  customeremail: '0b14d501...',
  customerStatus: 'New',
  currencyCode: 'CAD',
  orderPromoCode: 'WELCOME10',
  orderDiscount: 50,
  items: [
    {
      subTotal: 2298,
      category: 'configurable',
      sku: 'LILY-3S-CRM-001',
      quantity: 1,
      name: 'Lily 3-Seater Cream Sofa',
    },
  ],
};

// 实际调用形态：
// ire('trackConversion', 41642, properties, { verifySiteDefinitionMatch: true });
```

---

## 触发链路

```
[CookieYes opt-in/out]
   ↓ cookieyes_consent_update event
[useConsent('advertisement')] —— ConsentBridge useEffect
   ↓
[dispatch(trackUTTConsentEvent({ mode, granted }))]
   ↓
[trackUtt('consent', mode, { tracking })]
   ↓
window.ire('consent', mode, { tracking })

────────────────────────────────────────────────────

[user login / logout / profile change]
   ↓ redux state change
[selectedActiveUser] —— IdentifyBridge useEffect
   ↓
[dispatch(trackUTTIdentifyEvent({ user }))]
   ↓
[trackUtt('identify', { customerId, customerEmail })]
   ↓
window.ire('identify', { customerId, customerEmail })

────────────────────────────────────────────────────

[checkout/success page mount with valid order]
   ↓ dispatch
[purchasedSucceededEvent({ order })]
   ↓ tracking.listener
[trackedPurchaseOrderIds dedup] → [dispatch(trackUTTConversionEvent({ order, user }))]
   ↓
[trackUtt('trackConversion', eventId, properties, { verifySiteDefinitionMatch: true })]
   ↓
window.ire('trackConversion', eventId, properties, { verifySiteDefinitionMatch: true })
```

---

## 设计折衷 / 待确定事项

1. **SHA-256 vs SHA-1**：保留 SHA-256，迁移完成 + attribution 数据迁移窗口确定后再切（详见 [docs/utt-impact-migration.md](../../../../../../../docs/utt-impact-migration.md) §5.1）。
2. **`afterInteractive` vs `beforeInteractive`**：当前用 `afterInteractive`。`ensureIreQueue` 装的队列 stub 保证脚本加载前的调用不丢失，不依赖到达时机。
3. **items 是否过滤 swatch**：当前**不过滤**——impact.com partner attribution 关心全单价值，swatch 也算商品交易。如 PM 要求按 FB/Pinterest 口径过滤，需在 `buildUTTConversionProperties` 内加 `productType !== SWATCH` 过滤。
4. **`customerStatus` 来源**：当前用 `order.firstPurchase`（与 FB `EVENT_FB_NEW_CUSTOMER_PURCHASE` 同源）；impact.com 字段值为 `'New' | 'Existing'`，需 PM 侧确认这个语义匹配（"首单" vs "全新注册"）。
5. **`currencyCode` 兜底**：当前 `order.summary?.currency || ''`；impact.com 是否允许空字符串待确认，若不允许则需在 trigger 内 `logUTTWarn` 中止。
6. **`subTotal` 计算口径**：当前优先用 `lineItem.amount`（price × qty 已计算），fallback `salePrice × quantity`；与 DY `Purchase.itemPrice`（单价）不同，impact.com 是**行合计**。
7. **email 大小写**：当前 `sha256(email)` 不做 `.toLowerCase()`，DY signup/login 是 `.toLowerCase()` 后哈希；impact.com 是否区分大小写待确认。
8. **`conversionEventId` 占位**：CA/UK 当前为 0，trigger 会 early-return + log warn；上线前需从 impact.com dashboard 获取真实数值并填入 `utt-impact.ts`。
