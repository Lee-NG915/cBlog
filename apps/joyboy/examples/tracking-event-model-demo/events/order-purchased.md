# `order_purchased`

> 商业事件：订单支付成功并完成创建，可用于上报 GA Purchase 与 Meta Purchase。

## 1. Event Summary

| Field               | Value                          |
| ------------------- | ------------------------------ |
| Business event name | `order_purchased`              |
| Event status        | `active`                       |
| Event category      | `order`                        |
| Owner               | Order/payment squad + tracking |
| First introduced    | 2026-05-25                     |
| Related ticket      | DEMO-002                       |

## 2. Business Definition

### Purpose

转化漏斗终点；ROAS、归因、首单复购、人群包训练等下游依赖该事件的准确性与唯一性。

### User action

支付通道（Stripe / PayPal / GrabPay 等）回调成功，order domain 完成 order 创建并落库。

### Trigger Timing

| Question                     | Answer                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------- |
| When does it fire?           | `orderPurchasedEvent({ order })` 由 order domain 在 order 落库成功后 dispatch。 |
| What confirms success?       | `order.status === 'created'` 且 `order.id` 已生成。                             |
| Should failed payments emit? | No。                                                                            |
| Can it fire more than once?  | 同一 `order.id` 在 listener 内存中**去重**——同次浏览会话中只发一次。            |
| Dedupe key                   | `order.id`（listener 层）+ `event_id`（destination 层）                         |

### Non-goals

- 不代表"支付成功"，那是 `payment_captured`，时序更早。
- 不代表"swatch 订单完成"——swatch 走 `swatch_order_purchased`，本 demo 不展开。

## 3. Event Boundary

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| Primary source    | Order domain (`orderPurchasedEvent`) |
| Source event      | `orderPurchasedEvent({ order })`     |
| Emitting layer    | Order domain → Redux store           |
| Deduplication key | `order.id`                           |

**边界规则：**

- 一个 `order.id` 在 listener 实例生命周期内最多发一次（用 `Set<string>` 记忆）。
- 服务端（如 webhook 重放）若也会触发，需要把 dedupe 同步到一个跨实例 store（redis / dynamodb），本 demo 简化为单实例。
- 退款、订单取消不复用本事件。

## 4. Payload Schema

| Property                 | Type     | Required | Source           | Example           | Notes                                           |
| ------------------------ | -------- | -------- | ---------------- | ----------------- | ----------------------------------------------- |
| `event_id`               | `string` | yes      | listener 生成    | `purchase_01J...` | GA 与 Meta 共享                                 |
| `order.id`               | `string` | yes      | order domain     | `ord_abc`         | listener dedupe key                             |
| `order.number`           | `string` | yes      | order domain     | `US123456`        | 用户可见单号，destination 用作 `transaction_id` |
| `order.value`            | `number` | yes      | order summary    | `2598`            | **税后、扣折扣后总额**，主单位                  |
| `order.currency`         | `string` | yes      | order summary    | `USD`             |                                                 |
| `order.items[].sku`      | `string` | yes      | order line items | `CHAIR-123`       | 非 swatch line items                            |
| `order.items[].quantity` | `number` | yes      | order line items | `2`               |                                                 |
| `order.items[].price`    | `number` | yes      | order line items | `1299`            | 单价主单位                                      |

## 5. Destination Mapping

| Destination | Destination event | Sent from                      | Required fields                                                                                                                                                | Notes                           |
| ----------- | ----------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| GA4         | `purchase`        | client dataLayer               | `event`, `event_id`, `ecommerce.transaction_id`, `ecommerce.currency`, `ecommerce.value`, `ecommerce.items[]`                                                  | `transaction_id = order.number` |
| Meta CAPI   | `Purchase`        | server-side（demo fetch mock） | `event_name`, `event_id`, `event_time`, `custom_data.value`, `custom_data.currency`, `custom_data.order_id`, `custom_data.content_ids`, `custom_data.contents` | Meta dedupe 以 `event_id` 为准  |

### Destination Transforms

| Destination | Source              | Destination                 | Transformation                            |
| ----------- | ------------------- | --------------------------- | ----------------------------------------- |
| GA4         | `order.number`      | `ecommerce.transaction_id`  | rename                                    |
| GA4         | `order.value`       | `ecommerce.value`           | passthrough                               |
| Meta        | `order.id`          | `custom_data.order_id`      | rename，注意是内部 id 而非 `order.number` |
| Meta        | `order.items[].sku` | `custom_data.content_ids[]` | map to array                              |

## 6. Privacy / Consent

| Question          | Answer                                             |
| ----------------- | -------------------------------------------------- |
| Contains PII?     | No（demo 不上报 email/phone；生产可附 hash email） |
| Consent required? | 仅 marketing consent；未授予则只发 GA 不发 Meta    |

## 7. Implementation References (Demo)

| Area          | Reference                                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain action | [`src/actions.ts`](../src/actions.ts) — `orderPurchasedEvent`                                                                                                               |
| Schema        | [`src/schemas.ts`](../src/schemas.ts) — `OrderPurchasedEventSchema`                                                                                                         |
| Listener      | [`src/listeners/order-tracking.listener.ts`](../src/listeners/order-tracking.listener.ts)                                                                                   |
| GA trigger    | [`src/triggers/ga-purchase.trigger.ts`](../src/triggers/ga-purchase.trigger.ts)                                                                                             |
| Meta trigger  | [`src/triggers/meta-purchase.trigger.ts`](../src/triggers/meta-purchase.trigger.ts)                                                                                         |
| Tests         | [`tests/order-purchased.listener.test.ts`](../tests/order-purchased.listener.test.ts) · [`tests/order-purchased.trigger.test.ts`](../tests/order-purchased.trigger.test.ts) |

## 8. QA Checklist

- [ ] 同一 `order.id` 第二次 dispatch **不**再次上报
- [ ] 仅含 swatch 的订单**不**触发本事件（demo 简化：所有 item 都视为非 swatch）
- [ ] `value` 与 order summary 一致（不要用 line items 自己求和——口径会偏）
- [ ] GA 与 Meta 收到相同 `event_id`
- [ ] consent 缺失时不发 Meta

## 9. Open Questions

- 是否需要为 server-side webhook 回放建立跨实例 dedupe（redis）？
- Meta `order_id` 取 `order.id` 还是 `order.number`？当前 demo 选 `order.id`（内部稳定 id）。
