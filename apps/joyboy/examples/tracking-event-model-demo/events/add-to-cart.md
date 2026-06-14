# `add_to_cart`

> 商业事件：客户成功将一个可售商品 variant 加入购物车。

## 1. Event Summary

| Field               | Value                 |
| ------------------- | --------------------- |
| Business event name | `add_to_cart`         |
| Event status        | `active`              |
| Event category      | `cart`                |
| Owner               | Cart squad + tracking |
| First introduced    | 2026-05-25            |
| Related ticket      | DEMO-001              |

## 2. Business Definition

### Purpose

用于支撑加购转化漏斗、retargeting 人群包、产品热度报表。

### User action

客户在商详 / 列表 / 推荐位等场景点击 "Add to cart"，cart 服务确认 variant 可售并写入 cart 成功后发出。

### Trigger Timing

| Question                                | Answer                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| When does it fire?                      | `cartItemAddedEvent` 由 cart 应用层在 `addItemCommand` 返回 success 之后 dispatch。 |
| What confirms success?                  | Cart domain 返回更新后的 `cartId` 与 `lineItem`。                                   |
| Should failed attempts emit?            | No——加购失败（库存不足、网络错误）不发出本事件。                                    |
| Can it fire more than once per session? | Yes，每次加购一次。                                                                 |
| Dedupe key                              | 每次事件生成独立 `event_id`（不需要跨次去重）。                                     |

### Non-goals

- 不代表"用户浏览商品"（那是 `product_viewed`）。
- 不代表"加 swatch"（swatch 走 `swatch_added_to_cart`，本 demo 不展开）。

## 3. Event Boundary

| Field             | Value                                          |
| ----------------- | ---------------------------------------------- |
| Primary source    | Frontend domain action (`cartItemAddedEvent`)  |
| Source event      | `cartItemAddedEvent({ cartId, item, source })` |
| Emitting layer    | Cart application service                       |
| Deduplication key | 每事件独立 `event_id`                          |

**边界规则：**

- 只在 cart 真实写入成功之后发出。
- UI 层点击 "Add" 按钮**不直接** dispatch，必须等 cart command 成功。
- 服务端如果也有加购入口（如导入收藏夹），需要单独 dispatch，并复用同一 business event。

## 4. Payload Schema

业务事件（domain payload）：

| Property        | Type     | Required | Source            | Example                          | Notes                                          |
| --------------- | -------- | -------- | ----------------- | -------------------------------- | ---------------------------------------------- |
| `event_id`      | `string` | yes      | listener 生成     | `atc_01J...`                     | 同一事件在 GA 与 Meta 间共享，便于跨平台 debug |
| `cart_id`       | `string` | yes      | cart command 返回 | `cart_abc`                       |                                                |
| `item.sku`      | `string` | yes      | line item         | `CHAIR-123`                      | 业务 SKU，不用展示名                           |
| `item.name`     | `string` | yes      | line item         | `Linen Sofa`                     |                                                |
| `item.price`    | `number` | yes      | line item         | `1299`                           | **单位：主单位（元/USD），含税方式见币种约定** |
| `item.quantity` | `number` | yes      | line item         | `1`                              |                                                |
| `item.currency` | `string` | yes      | market config     | `USD`                            | ISO 4217                                       |
| `source`        | `enum`   | yes      | UI dispatch       | `pdp` / `plp` / `recommendation` | UI 上下文                                      |

## 5. Destination Mapping

| Destination | Destination event | Sent from                         | Required fields                                                                                                                        | Notes                                          |
| ----------- | ----------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| GA4         | `add_to_cart`     | client dataLayer                  | `event`, `event_id`, `ecommerce.currency`, `ecommerce.value`, `ecommerce.items[]`                                                      | GA4 ecommerce 格式，`value = price * quantity` |
| Meta CAPI   | `AddToCart`       | server-side（demo 用 fetch mock） | `event_name`, `event_id`, `event_time`, `custom_data.value`, `custom_data.currency`, `custom_data.content_ids`, `custom_data.contents` | `event_id` 与 GA 共享，便于 Meta dedupe        |

### Destination Transforms

| Destination | Source property          | Destination property        | Transformation                        |
| ----------- | ------------------------ | --------------------------- | ------------------------------------- |
| GA4         | `item.sku`               | `ecommerce.items[].item_id` | rename                                |
| GA4         | `item.price * quantity`  | `ecommerce.value`           | calculate                             |
| Meta        | `item.sku`               | `custom_data.content_ids[]` | wrap into array                       |
| Meta        | `(item.price, quantity)` | `custom_data.contents[]`    | shape: `{ id, quantity, item_price }` |

## 6. Privacy / Consent

| Question          | Answer                                                   |
| ----------------- | -------------------------------------------------------- |
| Contains PII?     | No                                                       |
| Consent required? | 仅 marketing cookie consent；若未授予则只发 GA 不发 Meta |
| Hashing required? | N/A                                                      |

## 7. Implementation References (Demo)

| Area          | Reference                                                                                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain action | [`src/actions.ts`](../src/actions.ts) — `cartItemAddedEvent`                                                                                                |
| Schema        | [`src/schemas.ts`](../src/schemas.ts) — `AddToCartEventSchema`                                                                                              |
| Listener      | [`src/listeners/cart-tracking.listener.ts`](../src/listeners/cart-tracking.listener.ts)                                                                     |
| GA trigger    | [`src/triggers/ga-add-to-cart.trigger.ts`](../src/triggers/ga-add-to-cart.trigger.ts)                                                                       |
| Meta trigger  | [`src/triggers/meta-add-to-cart.trigger.ts`](../src/triggers/meta-add-to-cart.trigger.ts)                                                                   |
| Tests         | [`tests/add-to-cart.listener.test.ts`](../tests/add-to-cart.listener.test.ts) · [`tests/add-to-cart.trigger.test.ts`](../tests/add-to-cart.trigger.test.ts) |

## 8. QA Checklist

- [ ] cart command 失败时**不**发出事件
- [ ] swatch 添加**不**走本事件
- [ ] `value` 等于 `price * quantity`
- [ ] GA 与 Meta 收到相同 `event_id`
- [ ] 未授权 marketing consent 时只有 GA，没有 Meta 网络请求

## 9. Open Questions

- 多 variant 一次加购是否合并为一个事件？当前 demo 假设每次加购一个 line item。
