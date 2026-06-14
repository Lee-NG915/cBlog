# Web Checkout SPL / Payment 需求拆分与前端技术方案

- 作者：Abby Wang
- 日期：2026-04-24
- 状态：In Progress（Phase 1 & 2 已完成，Phase 3 待执行）

## 1. 输入来源与说明

### 1.1 需求来源

已通过 Confluence MCP 读取两份需求文档全文：

1. **EC - 订单 SPL 技术方案** (`https://castlery.atlassian.net/wiki/spaces/EC/pages/3984720111/SPL`)

   核心内容：

   - 背景：SPL 订单支付时间较晚，订单过期导致库存失效无法支付；目标是在 SPL 支付时重检并重新锁定库存。
   - 新增 API：`POST /api/v1/order/recheck-inventory-reserve`（前端调用，参数：`orderId + token`）
   - 修改 API：`GET /api/v1/order/detail`（增加 `token` 参数，支持未登录查询）
   - 整体流程：POS 创建 SPL → 后端将 **Castlery 自站中转页链接**发送给用户 → 用户点击链接进入中转页 → 中转页检查订单状态并重锁库存 → 跳转 Stripe Payment Link → 支付成功跳转订单完成页
   - 中转页链接规则：`{domain}/{market}/order/spl?bizToken=...&bizID=...`（test: `www-test.castlery.com`，prod: `www.castlery.com`）
   - Token 设计：JWT，payload 含 `orderId + userId + guestToken`，用于无登录态下的订单鉴权

2. **PM - POS Checkout（包含 Payment）** (`https://castlery.atlassian.net/wiki/spaces/PM/pages/2954691078/POS+Checkout+Payment`)

   关键章节：第 8 节「Stripe Payment Link 的特殊处理」：

   - **中转页**无需身份认证，任何人均可为此订单支付
   - 中转页逻辑（按优先级）：
     1. 订单状态非 Pending Payment → 弹窗 "Payment link expired"，跳转首页
     2. Stripe link 未过期 + 库存锁定未过期 → 直接跳转 Stripe Payment Link
     3. Stripe link 未过期 + 库存锁定已过期 → 调用 `recheck-inventory-reserve` 重锁
        - 成功 → 跳转 Stripe Payment Link
        - 失败 → 弹窗 "Item no longer available" + 自动取消订单，跳转首页
   - 额外拦截：订单距过期 ≤ 2 分钟时，弹窗 "Order expiring soon" 拦截支付
   - 支付成功后：若订单状态正常流转 → 跳转订单完成页；若订单已取消/已被支付 → 跳转通用错误页

### 1.2 本次分析的实际边界

已通过 Confluence MCP 读取两份需求文档全文。本文基于以下确认事实输出：

1. **Web 侧核心任务是新建 SPL 中转页**（`/{market}/order/spl`），而非在现有 checkout 流程中新增 SPL 支付选项。
2. 后端 API 已在 EC 技术方案中明确定义，前端调用合约清晰。
3. 中转页无需用户认证，通过 JWT `bizToken` 做订单归属校验。
4. 现有 checkout 支付流程（`payment/page.tsx`）**不需要改动** SPL 相关逻辑，POS 侧 SPL 选择与发送由 POS 前端独立处理。
5. `/checkout/success` 需要支持通过 JWT token 查询未登录用户的订单信息，因为 SPL 客户可能未登录。

## 2. 相关代码现状

### 2.1 Web checkout 路由与页面职责

核心入口：

- `apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/layout.tsx`
- `apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/layout.client.tsx`
- `apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/payment/page.tsx`
- `apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/payment/page.client.tsx`

当前职责划分：

1. `layout.client.tsx` 负责 checkout token 权限校验、step 进入埋点、checkout layout 渲染。
2. `payment/page.tsx` 负责 page-level wrapper 与 `orderId / resumeParams` 透传。
3. `payment/page.client.tsx` 负责：
   - 从 searchParams 或 persistence 解析有效 `orderId`
   - 决定拉取 `getCheckoutInfo` 还是 `getOrderCheckoutDetail`
   - `preInventoryReserve`
   - resume 支付状态处理
   - 成功时跳转 `/checkout/success`
4. 真实支付 UI 与行为已经下沉到 `libs/modules/composite/components` 与 `libs/modules/payment/components`。

### 2.2 Web payment 当前架构

核心文件：

- `libs/shared/components/src/hooks/useGetPaymentDataSource.tsx`
- `libs/modules/composite/components/src/lib/payment-main-content/payment-main-content.tsx`
- `libs/modules/payment/components/src/lib/payment-wallets/payment-wallets.tsx`
- `libs/modules/payment/components/src/lib/payment-wallets/hooks/use-payment-method-selection.ts`
- `libs/modules/payment/components/src/lib/payment-wallets/hooks/use-payment-execution.ts`
- `libs/modules/payment/actions/src/lib/payment.action.ts`
- `libs/modules/payment/infrastructure/src/lib/strategies/stripe.strategy.ts`

当前 Web 支付链路已经具备这些能力：

1. 统一 checkout 数据源，兼容 `checkoutSession` 与 `orderCheckout`。
2. 统一 payment orchestration：
   - 创建订单
   - initiate payment
   - 根据 `ActionSchema` 决定 `SDK_CONFIRM / REDIRECT / SDK_POPUP / SUCCESS`
   - capture payment
3. 已支持多支付方式：
   - Stripe card / express
   - PayPal
   - GrabPay
   - ZipPay callback
   - Affirm
   - 2C2P 预留接口，但 Web 页面 `tctp-payment/page.tsx` 仍是 placeholder
4. 已具备支付结果恢复能力：
   - `paymentStatus=failure|processing`
   - 根据订单 payment state 做 success / processing / failure 分流
5. 已接入 observability：
   - `payment_callback_receive`
   - `payment_result_render`
   - `payment_method_select`
   - `payment_initiate`
   - `payment_capture`

### 2.3 POS 侧已存在的 SPL 规则

核心文件：

- `libs/modules/checkout/components/src/lib/pos-payment-method-group/pos-payment-method-group.tsx`
- `libs/modules/checkout/components/src/lib/payments/add-payments/add-payments-v1.tsx`
- `libs/modules/payment/domain/src/lib/api/payment.api.ts`
- `libs/modules/payment/services/src/lib/payment.helper.ts`

从代码里可以确认，POS 已经实现了 `stripe-payment-link` 的业务规则：

1. `stripe-payment-link` 是独立 provider，不等同于 Web 现有的 `stripe-link-pay`。
2. SPL 金额必须等于整单金额，输入框不可编辑。
3. 当存在非 SPL 支付记录时，SPL 不允许再被选择。
4. 当订单已有 SPL 记录时，进入锁定重发模式：
   - 支付方式固定为 SPL
   - 再次点击 Send 直接走 resend
5. SPL 有两类发送限制：
   - 本地时间 `23:30 - 00:00` 不允许发 link
   - `reservationExpiredAt` 距当前小于等于 2 分钟时不允许发 link
6. POS 存在专门的 resend API：
   - `PUT /api/v1/pos/order/payment/resend-stripe-link`
7. POS 在“已存在 SPL 待支付记录”的情况下，不把该 pending 记录当成已支付金额，以避免重发场景金额变成 0。

### 2.4 当前 Web 与目标能力之间的差距

基于确认后的需求范围，当前 Web 缺少的能力：

1. **SPL 中转页缺失**：没有 `/{market}/order/spl` 页面及对应路由。
2. **`recheck-inventory-reserve` 调用缺失**：没有调用该新 API 的逻辑，也没有对应的 BFF server action 封装。
3. **无 token 订单查询支持**：`/checkout/success` 当前只支持登录态下的订单查询，SPL 未登录客户无法正常查看订单完成页。
4. **中转页错误弹窗缺失**：”Payment link expired”、”Item no longer available”、”Order expiring soon” 三类错误弹窗均未实现。
5. **无 token 路由访问缺失**：Next.js 路由层没有对 `bizToken` + `bizID` URL 参数的处理逻辑。

注：现有 checkout 支付流程（`payment-wallets` / `use-payment-execution` 等）**无需**为此需求做改动。

## 3. 需求拆分

以下拆分基于已确认的 Confluence 需求文档。

### 3.1 需求包 A：SPL 中转页（新建页面）

目标：

- 新建 Web 页面 `/{market}/order/spl`，作为用户点击 SPL 邮件链接后的落地页。

子需求：

1. 路由支持 `bizToken`（JWT）+ `bizID`（orderId）URL 参数解析。
2. 页面无需用户登录，通过 `bizToken` 做订单鉴权。
3. 进入页面时调用 `recheck-inventory-reserve`，根据返回结果决定后续流程。
4. 成功时自动跳转 Stripe Payment Link（`redirectUrl` 由后端返回）。

### 3.2 需求包 B：库存重检 API 集成

目标：

- 在 order domain 层新增 RTK Query mutation，供中转页 Client Component 调用。

子需求：

1. 在 `order.api.v1.ts` 新增 `recheckInventoryReserve` mutation，调用 `POST /api/v1/order/recheck-inventory-reserve`。
2. 处理后端错误码：
   - `ErrSPLOrderStatusCheckFailed (10703027)`：订单状态异常
   - `ErrSPLOrderInventoryReserveFailed (10703028)`：库存重锁失败
3. 成功时返回 Stripe Payment Link URL（`redirectUrl`）。

### 3.3 需求包 C：中转页错误状态处理

目标：

- 中转页能正确呈现所有错误场景，并引导用户做出正确操作。

子需求：

1. 订单非 Pending Payment → 弹窗 “Payment link expired”，确认后跳转首页。
2. 库存重锁失败 → 弹窗 “Item no longer available”，确认后跳转首页。
3. 订单距过期 ≤ 2 分钟 → 弹窗 “Order expiring soon”，拦截支付。
4. 加载中状态（等待 API 响应）：骨架屏或 spinner，防止用户重复点击。

### 3.4 需求包 D：订单完成页支持未登录访问

目标：

- SPL 客户在 Stripe 完成支付后被重定向到 `/checkout/success`，能正常查看订单信息，即使未登录。

子需求：

1. `/checkout/success` 支持接收 `token` URL 参数。
2. 在无 session 时通过 `GET /api/v1/order/detail?orderId=xxx&token=xxx` 获取订单详情。
3. 若订单已取消/已被他人支付，跳转至通用错误页，展示文案 “Oops, your order was canceled during the payment process. Please contact us for refund.”

### 3.5 需求包 E：可观测性与测试

目标：

- 中转页成为可追踪、可回归的独立模块。

子需求：

1. 增加页面进入、库存重检成功/失败、弹窗触发等关键埋点。
2. 单元测试覆盖 `recheckInventoryReserveAction` 的各种返回场景。
3. 组件测试覆盖三类错误弹窗的渲染与跳转行为。
4. E2E 覆盖：正常跳转 Stripe、库存重锁失败弹窗、订单过期弹窗、完成页 token 访问。

## 4. 前端技术设计

## 4.1 设计原则

1. **新建独立中转页**，不修改现有 checkout 支付流程。
2. 中转页职责单一：检查库存 → 跳 Stripe，不承载任何 checkout 步骤逻辑。
3. 通过 JWT `bizToken` 替代登录态，实现无登录的订单鉴权。
4. 错误状态优先处理，所有弹窗操作后均跳回首页（用户侧无重试路径）。

## 4.2 新增路由与文件

```
apps/web/app/[deviceTheme]/[region]/[locale]/(order)/order/spl/
  ├── page.tsx          # Server Component：解析 URL 参数，透传给 Client
  └── page.client.tsx   # Client Component：调用 API，处理状态与跳转
```

中转页 URL 格式（由后端在邮件中生成并发送）：

```
{domain}/{market}/order/spl?bizToken=<JWT>&bizID=<orderId>
```

## 4.3 页面数据流

```
URL params: bizToken + bizID
  ↓
page.tsx (Server Component)
  → 透传 bizToken + bizID 给 page.client.tsx
  ↓
page.client.tsx (Client Component, useEffect on mount)
  → 调用 useRecheckInventoryReserveMutation()（RTK Query mutation）
  → 成功：window.location.replace(redirectUrl)  // 跳 Stripe Payment Link
  → 失败（订单状态异常）：展示 “Payment link expired” 弹窗
  → 失败（库存重锁失败）：展示 “Item no longer available” 弹窗
  → 订单距过期 ≤ 2 分钟：展示 “Order expiring soon” 弹窗（前端 guard）
```

## 4.4 RTK Mutation 设计

改动文件：

```
libs/modules/order/domain/src/api/order.api.v1.ts
```

遵循项目已有 `preInventoryReserve`（`checkout-session.api.ts`）和 `createTransactionOrder`（`order.api.v1.ts`）的实现模式，新增 `recheckInventoryReserve` mutation：

```ts
// 入参（传给 mutation trigger 函数）
interface RecheckInventoryReserveInput {
  orderId: string;
  token: string; // JWT bizToken
}

// 后端成功响应 data 字段
interface RecheckInventoryReserveSuccessData {
  redirectUrl: string; // Stripe Payment Link URL
}

// 用法（Client Component 中）
const [recheckInventoryReserve] = useRecheckInventoryReserveMutation();
const result = await recheckInventoryReserve({ orderId, token });
```

错误处理：`transformResponse` 抛出 `Error(JSON.stringify(response))` 与其他 v1 API 保持一致，由 Client Component 的 `catch` 块通过 `response.code` 区分错误码，映射到前端 errorCode。

后端错误码映射：

| 后端错误码                                   | 前端 errorCode             | 展示弹窗                   |
| -------------------------------------------- | -------------------------- | -------------------------- |
| `10703027` ErrSPLOrderStatusCheckFailed      | `ORDER_STATUS_INVALID`     | “Payment link expired”     |
| `10703028` ErrSPLOrderInventoryReserveFailed | `INVENTORY_RESERVE_FAILED` | “Item no longer available” |
| 其他                                         | `UNKNOWN`                  | 通用错误提示               |

## 4.5 错误弹窗设计

### 4.5.1 Payment link expired

```
Title:    Payment link expired
Subtitle: Oops, this payment link has expired or your order is no longer valid.
Button:   Okay
Action:   关闭弹窗 → 跳转首页（window.location.href = '/'）
```

触发条件：`errorCode === 'ORDER_STATUS_INVALID'`

### 4.5.2 Item no longer available

```
Title:    Item no longer available
Subtitle: Oops, one or more items in your order are no longer available.
          Your order has been cancelled.
Button:   Okay
Action:   关闭弹窗 → 跳转首页
```

触发条件：`errorCode === 'INVENTORY_RESERVE_FAILED'`

### 4.5.3 Order expiring soon（前端 guard）

```
Title:    Order expiring soon
Subtitle: This order is about to expire and is no longer eligible for Stripe Payment Link.
Button:   Ok
Action:   关闭弹窗（停留在中转页，用户无法重试）
```

触发条件：`recheckInventoryReserveAction` 调用前，前端检测 `reservationExpiredAt - now <= 2 * 60 * 1000`（需后端在 `recheck` 响应中返回 `reservationExpiredAt` 或前端通过其他接口获取）

> 注：此场景后端也会拦截，前端 guard 只是提前反馈，不是唯一保障。

## 4.6 订单完成页（/checkout/success）改造

改动文件：

```
apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/success/page.tsx
apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/success/page.client.tsx
```

改动内容：

1. `page.tsx` 接收并透传 `token` searchParam。
2. `page.client.tsx` 在无 session 时，通过 `token` 参数调用 `GET /api/v1/order/detail?orderId=xxx&token=xxx`（修改后的接口已支持）。
3. 若 `token` 存在但订单查询返回异常（订单已取消/支付失败），展示通用错误提示：
   > “Oops, your order was canceled during the payment process. Please [contact us](/contact-us) for refund.”

## 4.7 代码新增/改动清单

| 类型 | 文件路径                                            | 说明                                        |
| ---- | --------------------------------------------------- | ------------------------------------------- |
| 新增 | `apps/web/app/.../order/spl/page.tsx`               | SPL 中转页 Server Component                 |
| 新增 | `apps/web/app/.../order/spl/page.client.tsx`        | SPL 中转页 Client Component                 |
| 改动 | `libs/modules/order/domain/src/api/order.api.v1.ts` | 新增 `recheckInventoryReserve` RTK mutation |
| 改动 | `apps/web/app/.../checkout/success/page.tsx`        | 接收 token searchParam                      |
| 改动 | `apps/web/app/.../checkout/success/page.client.tsx` | 无 session 时用 token 查询订单              |

现有 checkout 支付流程文件（`use-payment-execution.ts`、`payment-wallets.tsx` 等）**无需改动**。

## 5. 建议实施拆分

### ✅ Phase 1：中转页 + API 集成（已完成）

交付项：

1. ✅ SPL 中转页路由及页面骨架（`page.tsx` + `page.client.tsx`）。
   - 新建 `apps/web/app/[deviceTheme]/[region]/[locale]/(order)/order/spl/page.tsx`
   - 新建 `apps/web/app/[deviceTheme]/[region]/[locale]/(order)/order/spl/page.client.tsx`
2. ✅ `recheckInventoryReserve` RTK mutation 实现（`order.api.v1.ts`）。
3. ✅ 成功跳转 Stripe Payment Link 闭环（`window.location.replace(redirectUrl)`）。

### ✅ Phase 2：错误状态 + 完成页改造（已完成）

交付项：

1. ✅ 三类错误弹窗（Payment link expired / Item no longer available / 未知错误），均使用 `useNiceModal`。
   > 注：Order expiring soon 弹窗依赖 `reservationExpiredAt` 数据来源，待与后端确认后补充（见第 7 节）。
2. ✅ `/checkout/success` 支持 `token` URL 参数查询订单（无 session 时通过 `token` 鉴权）。
3. ✅ 订单取消 / 支付失败时（有 token 参数）展示 "order was canceled" 错误文案，不跳转 order history。

### ⬜ Phase 3：观测与回归（待执行）

交付项：

1. ⬜ 中转页关键埋点（进入、库存重检成功/失败、弹窗触发）。
2. ⬜ `recheckInventoryReserve` mutation 单测（成功、`10703027`、`10703028`、网络异常）。
3. ⬜ 弹窗组件测试（三类弹窗渲染与跳转行为）。
4. ⬜ Playwright E2E（正常跳转 Stripe、各类异常弹窗、完成页 token 访问）。

## 6. 测试建议

### 6.1 单元测试

覆盖：

1. `recheckInventoryReserveAction`：成功、`10703027`、`10703028`、网络异常等场景。
2. `reservationExpiredAt` 前端 2 分钟 guard 逻辑。
3. JWT `bizToken` 解析（如前端需要解析 payload 展示数据）。

### 6.2 组件测试

覆盖：

1. 正常加载状态（loading spinner / skeleton）。
2. "Payment link expired" 弹窗渲染与点击后跳转首页。
3. "Item no longer available" 弹窗渲染与点击后跳转首页。
4. "Order expiring soon" 弹窗渲染（不跳转）。
5. `/checkout/success` 在有 `token` 参数时使用 token 查询订单，无 session 也能展示完成页。

### 6.3 E2E

覆盖：

1. 正常场景：通过 `bizToken` + `bizID` 访问中转页，成功跳转 Stripe Payment Link。
2. 订单过期场景：`recheck` 返回 `10703027`，弹窗出现，点击 OK 跳首页。
3. 库存失败场景：`recheck` 返回 `10703028`，弹窗出现，点击 OK 跳首页。
4. Stripe 支付完成后，带 `token` 访问 `/checkout/success`，展示完成页（未登录）。
5. 现有 checkout 支付流程（Stripe card / PayPal / GrabPay）不受中转页改动影响。

## 7. 风险与待确认项

以下项需在开发启动前与后端对齐：

1. **`recheck-inventory-reserve` 成功响应结构**：确认后端是否在 success 响应中返回 `redirectUrl`（Stripe Payment Link）和 `reservationExpiredAt`，前端需依赖这两个字段。
2. **`bizToken` JWT 解析需求**：中转页是否需要从 `bizToken` 解析出订单信息展示（如订单金额、商品名），还是只用于 API 鉴权。
3. **2 分钟 guard 的数据来源**：前端 guard 需要知道 `reservationExpiredAt`，确认此字段是从 `recheck` 响应中取，还是需要单独调用 `GET /api/v1/order/detail`。
4. **`/checkout/success` 的 Stripe 回调 URL**：Stripe 完成支付后重定向到 `/checkout/success?orderId=xxx`，确认后端生成的 redirect URL 是否会带 `token` 参数，或前端需要从其他途径传递 token。
5. **通用错误页路由**：支付后订单取消/异常场景是跳至已有的通用错误页还是新建页面。

## 8. 结论

基于已确认的 Confluence 需求，前端落地路径是：

1. **新建 SPL 中转页**（`/{market}/order/spl`）作为独立页面，不修改现有 checkout 支付流程；
2. 通过 JWT `bizToken` 实现无登录态的订单鉴权与库存重检；
3. 对 `/checkout/success` 做最小改动，支持 token 参数访问以覆盖未登录 SPL 用户；
4. 错误状态优先保障，三类弹窗均清晰引导用户结束流程。

这条路径对现有 Web checkout 的侵入最小，且完全基于后端已定义的 API 合约，交付风险可控。

## 9. 后续需求变更承接建议

### 9.1 中转页规则变更

适用场景：2 分钟阈值调整、新增支付前置校验、新增错误类型。

建议做法：

1. 前端 guard 逻辑统一收口到 `page.client.tsx` 的 `checkSplEligibility` 工具函数，不散落在组件内。
2. 新增错误码映射统一维护在 server action 文件的 `ERROR_CODE_MAP` 常量中。
3. 所有规则变更都补单元测试。

### 9.2 中转页交互变更

适用场景：新增订单摘要展示、支持用户修改收件邮箱、新增倒计时提示。

建议做法：

1. 中转页 `page.client.tsx` 保持轻量，新增复杂 UI 抽出独立子组件（如 `SplOrderSummary`、`SplPaymentGuard`）。
2. 如需展示订单信息，通过 `GET /api/v1/order/detail?orderId=xxx&token=xxx` 获取，不新增数据入口。

### 9.3 完成页能力扩展

适用场景：SPL 支付成功后需要展示更丰富的订单确认信息（物流、发票等）。

建议做法：

1. 复用现有 checkout success 页的组件，只需确保 token 查询路径正常工作。
2. 不为 SPL 单独新建成功页，保持复用以避免维护两套逻辑。

### 9.4 变更时的重点回归面

每次后续变更都至少回归以下场景：

1. 现有 checkout 支付流程（Stripe card / PayPal / GrabPay / Affirm）不受影响。
2. 带 session 的普通用户访问 `/checkout/success` 不受 token 参数影响。
3. 中转页三类错误弹窗的触发条件没有被意外破坏。
4. SPL token 到期后的链接访问仍能展示正确错误态。
