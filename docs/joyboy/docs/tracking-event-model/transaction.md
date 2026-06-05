## Facebook Purchase（`fbp` → CAPI）触发说明（可用于需求文档）

### 触发时机

- **用户完成支付并进入「结账成功」流程后**，当前订单在 Redux 中为 **`complete`** 状态时，应用会派发 **`EVENT_TRANSACTION`**。
- 在处理该事件、组装 GTM 购买（`transaction`）数据时，会同步调用 **`trackPurchase`**，从而向 Facebook 转化接口发送 **`Purchase`**（以及新客时的 **`NewCustomerPurchase`** 等关联事件）。

### 触发条件（需同时满足）

1. 已进入上述「订单完成」后的埋点流程（成功页等场景下派发 **`EVENT_TRANSACTION`**）。
2. 订单中 **至少存在一件非 Swatch 商品**；若 **仅有 Swatch**，不发送标准 **`Purchase`**（可走 Swatch 相关自定义逻辑，与标准购买分开）。
3. 订单 **不属于** `create_type === 'schedule_delivery'` 时在 `transaction` 中的早退分支（该分支不调用 `trackPurchase`，不发此 **`Purchase`**）。

### 实现说明（便于和工程对齐）

- 前端 **`fbp`** 实际通过 **`fbs`** 调用服务端 **Facebook Conversions API**（非浏览器 `fbq` 像素直发）。
- **`Purchase`** 与 GTM 侧 **`eventId`** 同源生成逻辑，用于与 GTM/去重策略对齐（代码中有与 GTM 一致的注释约定）。

### 非触发 / 边界摘要

| 场景                                                | 是否发送标准 `Purchase`          |
| --------------------------------------------------- | -------------------------------- |
| 订单仅含 Swatch                                     | 否                               |
| `schedule_delivery` 且走对应 `transaction` 早退分支 | 否                               |
| 含普通商品且完成 `EVENT_TRANSACTION` 正常分支       | 是                               |
| 新客且含普通商品                                    | 是（另含 `NewCustomerPurchase`） |

以上内容可直接粘贴进需求说明中的「埋点范围 / 触发时机 / 前置条件」小节，按需删掉「实现说明」即可给纯业务方阅读。
