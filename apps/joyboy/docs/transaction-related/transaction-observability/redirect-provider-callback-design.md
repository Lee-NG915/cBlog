# Redirect Provider Callback 设计稿

- 作者：Codex
- 日期：2026-03-23
- 适用范围：`GrabPay`、`ZipPay`、`Affirm`（Affirm callback 闭环待确认支付模式后接入）
- 目标：为 redirect 型支付建立稳定闭环，同时满足”失败后回到 payment 页面”的产品要求

---

## 目录

- [1. 设计结论](#1-设计结论)
  - [1.1 是否需要统一 callback route](#11-是否需要统一-callback-route)
  - [1.2 哪些支付模式需要 callback route](#12-哪些支付模式需要-callback-route)
  - [1.3 callback route 应该是页面还是服务端路由](#13-callback-route-应该是页面还是服务端路由)
- [2. 业务目标](#2-业务目标)
- [3. 推荐链路](#3-推荐链路)
  - [3.1 Affirm / GrabPay 正常链路](#31-affirm--grabpay-正常链路)
  - [3.2 失败与处理中链路](#32-失败与处理中链路)
- [4. 路由设计](#4-路由设计)
  - [4.1 Provider-specific callback routes](#41-provider-specific-callback-routes)
  - [4.2 回跳后的最终页面](#42-回跳后的最终页面)
- [5. callback route 的职责边界](#5-callback-route-的职责边界)
- [6. search params 协议](#6-search-params-协议)
  - [6.1 为什么使用 search params](#61-为什么使用-search-params)
  - [6.2 最小必要字段](#62-最小必要字段)
  - [6.3 示例](#63-示例)
  - [6.4 不建议放入 URL 的字段](#64-不建议放入-url-的字段)
- [7. payment 页面恢复态设计](#7-payment-页面恢复态设计)
  - [7.1 payment 页面收到 search params 后不能直接信任](#71-payment-页面收到-search-params-后不能直接信任)
  - [7.2 payment 页面状态机](#72-payment-页面状态机)
  - [7.3 建议 UI 表现](#73-建议-ui-表现)
- [8. callback route 的伪代码](#8-callback-route-的伪代码)
  - [8.1 GrabPay callback route](#81-grabpay-callback-route)
  - [8.2 Affirm callback route](#82-affirm-callback-route)
- [9. returnUrl 设计](#9-returnurl-设计)
  - [9.1 当前问题](#91-当前问题)
  - [9.2 建议](#92-建议)
- [10. observability 事件落点](#10-observability-事件落点)
  - [10.1 Redirect provider 链路](#101-redirect-provider-链路)
  - [10.2 事件含义](#102-事件含义)
  - [10.3 与 SDK 模式的区别](#103-与-sdk-模式的区别)
- [11. 推荐实施顺序](#11-推荐实施顺序)
- [12. 最终建议](#12-最终建议)

---

## 1. 设计结论

### 1.1 是否需要统一 callback route

不需要。

当前建议是：

- `Affirm` 使用独立 callback route
- `GrabPay` 使用独立 callback route
- 后续新增 redirect provider 时，继续按 provider 扩展
- 处理协议统一，但路由不强制统一

推荐路由示例：

- `/checkout/payment/callback/affirm`
- `/checkout/payment/callback/grabpay`

### 1.2 哪些支付模式需要 callback route

只有 `REDIRECT` 模式需要 callback route。

| 支付行为模式  | 是否需要 callback route | 原因                                     |
| ------------- | ----------------------- | ---------------------------------------- |
| `REDIRECT`    | 需要                    | 用户离开站点，到第三方页面后再回跳       |
| `SDK_CONFIRM` | 不需要                  | 用户停留当前页面，结果在当前页面完成闭环 |
| `SDK_POPUP`   | 通常不需要              | popup 结果通过 JS callback 回到当前页面  |

因此：

- `Affirm + GrabPay` 需要 callback route
- `Stripe / 2C2P` 不需要
- popup 型 PayPal / Affirm popup 不需要

### 1.3 callback route 应该是页面还是服务端路由

应该优先做成服务端控制路由，而不是用户可见页面。

原因：

- 避免“一闪而过的空页面”
- callback route 的职责是接收第三方回跳、执行 capture、然后 redirect
- 用户体验上的承接面仍然是 payment 页面或 success 页面

推荐优先级：

1. `route.ts`
2. server page + `redirect()`
3. 不建议 client page + server action

---

## 2. 业务目标

本设计要满足以下业务要求：

1. `Affirm` / `GrabPay` 有固定 callback page。
2. 支付失败后，用户不应该落到 success 页面。
3. 支付失败或 processing 后，应回到 payment 页面。
4. payment 页面进入后要重新校验支付状态，再决定停下、继续 redirect 或跳 success。
5. observability 需要准确区分：
   - 用户是否已经从第三方回跳
   - 回跳后 capture 是否成功
   - 用户最终看到的是 success 还是 payment 恢复页

---

## 3. 推荐链路

### 3.1 Affirm / GrabPay 正常链路

```text
Payment Page
  -> initiatePaymentAction
  -> ActionSchema = REDIRECT
  -> Redirect to Provider
  -> Provider callback route
  -> capturePaymentAction
  -> Redirect to success page or payment page
```

### 3.2 失败与处理中链路

```text
Provider callback route
  -> capturePaymentAction
  -> failure / processing
  -> redirect back to payment page with search params
  -> payment page verifies latest payment status
  -> stays on payment or redirects elsewhere
```

---

## 4. 路由设计

### 4.1 Provider-specific callback routes

建议新增：

- `apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/payment/callback/affirm/route.ts`
- `apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/payment/callback/grabpay/route.ts`

不建议先做一个统一的：

- `/checkout/payment/callback?provider=...`

原因：

- `Affirm` 和 `GrabPay` 的回调参数结构不同
- provider-specific route 更符合第三方协议和后续扩展
- 逻辑隔离更清楚

### 4.2 回跳后的最终页面

建议保留：

- success 页面：`/checkout/success`
- payment 页面：`/checkout/payment`

本阶段不强制新增独立 failure / processing 页面，因为你已经明确希望失败后回到 payment。

因此 redirect 规则为：

- `capture success` -> `/checkout/success`
- `capture failure` -> `/checkout/payment`
- `capture processing` -> `/checkout/payment`

---

## 5. callback route 的职责边界

callback route 只做四件事：

1. 解析第三方回跳参数
2. 还原交易上下文
3. 调用 `capturePaymentAction`
4. redirect 到最终页面

callback route 不负责：

- 展示文案
- 展示 loading
- 展示错误页面
- 承担 payment 业务恢复 UI

这些都属于 payment 页面或 success 页面职责。

---

## 6. search params 协议

### 6.1 为什么使用 search params

因为 callback route 是一次服务端回跳控制，回到 payment 页后需要带最小上下文，让 payment 页面可以恢复状态。

这里的 `query` 和 `search params` 可以视为同一类东西。

### 6.2 最小必要字段

建议 payment 页只接收以下字段：

- `orderId`
- `orderNumber`
- `paymentStatus`
- `provider`
- `paymentId`
- `traceId`
- `errorCode`

其中：

- `paymentStatus` 取值：`failure` / `processing`
- `success` 一般不回 payment 页面

### 6.3 示例

#### GrabPay failure

```text
/sg/checkout/payment?orderId=123&orderNumber=SO123&paymentStatus=failure&provider=grabpay&paymentId=pay_001&traceId=trace_abc&errorCode=CAPTURE_FAILED
```

#### GrabPay processing

```text
/sg/checkout/payment?orderId=123&orderNumber=SO123&paymentStatus=processing&provider=grabpay&paymentId=pay_001&traceId=trace_abc
```

#### Affirm failure

```text
/us/checkout/payment?orderId=456&orderNumber=SO456&paymentStatus=failure&provider=affirm&paymentId=pay_002&traceId=trace_xyz&errorCode=AUTH_DECLINED
```

### 6.4 不建议放入 URL 的字段

禁止放入：

- provider 原始 payload
- token / client secret
- 用户敏感信息
- 可逆的支付凭证

---

## 7. payment 页面恢复态设计

### 7.1 payment 页面收到 search params 后不能直接信任

payment 页面应把 search params 当成“恢复提示”，而不是最终真相。

正确流程：

1. 读取 `useSearchParams()`
2. 解析 `paymentStatus` / `provider` / `paymentId` / `traceId` / `errorCode`
3. 调用后端接口重新校验当前 payment / order 的真实状态
4. 根据校验结果决定 UI

### 7.2 payment 页面状态机

#### 输入：`paymentStatus=failure`

payment 页面进入后：

1. 查询最新 payment 状态
2. 如果后端返回 `success`
   -> 直接 redirect success
3. 如果后端返回 `processing`
   -> 停在 payment，展示 processing 提示
4. 如果后端返回 `failure`
   -> 停在 payment，展示错误并允许 retry / 切支付方式

#### 输入：`paymentStatus=processing`

payment 页面进入后：

1. 查询最新 payment 状态
2. 如果后端返回 `success`
   -> redirect success
3. 如果仍 `processing`
   -> 停在 payment，展示 processing 状态
4. 如果变成 `failure`
   -> 停在 payment，展示失败状态

### 7.3 建议 UI 表现

- `failure`

  - inline error 或 modal
  - 默认带 provider 信息
  - 允许 retry
  - 允许切换支付方式

- `processing`
  - 显示处理中提示
  - 可提示“请稍后刷新或查看订单”
  - 可选：短轮询一次或有限次轮询

---

## 8. callback route 的伪代码

### 8.1 GrabPay callback route

```ts
export async function GET(req: NextRequest, context: RouteContext) {
  const query = req.nextUrl.searchParams;

  const transaction = parseGrabPayCallback(query);

  const captureResult = await capturePaymentAction({
    orderId: transaction.orderId,
    orderNumber: transaction.orderNumber,
    paymentId: transaction.paymentId,
    provider: PaymentMethodProviderEnum.GRABPAY,
    traceId: transaction.traceId,
    grabPayData: transaction.grabPayData,
  });

  if (captureResult.success) {
    return redirect(buildSuccessUrl(transaction));
  }

  if (captureResult.errorCode === 'processing') {
    return redirect(buildPaymentResumeUrl(transaction, 'processing', captureResult.errorCode));
  }

  return redirect(buildPaymentResumeUrl(transaction, 'failure', captureResult.errorCode));
}
```

### 8.2 Affirm callback route

```ts
export async function GET(req: NextRequest, context: RouteContext) {
  const query = req.nextUrl.searchParams;

  const transaction = parseAffirmCallback(query);

  const captureResult = await capturePaymentAction({
    orderId: transaction.orderId,
    orderNumber: transaction.orderNumber,
    paymentId: transaction.paymentId,
    provider: PaymentMethodProviderEnum.AFFIRM,
    traceId: transaction.traceId,
    affirmData: transaction.affirmData,
  });

  if (captureResult.success) {
    return redirect(buildSuccessUrl(transaction));
  }

  if (captureResult.errorCode === 'processing') {
    return redirect(buildPaymentResumeUrl(transaction, 'processing', captureResult.errorCode));
  }

  return redirect(buildPaymentResumeUrl(transaction, 'failure', captureResult.errorCode));
}
```

---

## 9. returnUrl 设计

### 9.1 当前问题

目前 strategy 中的 `returnUrl` 仍然回落到 checkout success 页面，这会造成：

- callback 与 success 混用
- 失败时无法优雅回 payment
- observability 事件混淆

### 9.2 建议

`AffirmStrategy` 和 `GrabPayStrategy` 需要把 `returnUrl` 改成 callback route。

推荐 returnUrl 附带：

- `orderId`
- `orderNumber`
- `paymentId`
- `traceId`

例如：

```text
/checkout/payment/callback/grabpay?orderId=...&orderNumber=...&paymentId=...&traceId=...
```

provider 不一定要在 query 里传，因为 route 本身已表明 provider。

---

## 10. observability 事件落点

### 10.1 Redirect provider 链路

`Affirm + GrabPay` 建议事件顺序：

1. `payment_redirect`
2. `payment_callback_receive`
3. `payment_capture`
4. `payment_result_render`

### 10.2 事件含义

- `payment_redirect`
  用户已经离开站点进入第三方支付页

- `payment_callback_receive`
  第三方已经成功回跳到站点

- `payment_capture`
  交易闭环确认阶段

- `payment_result_render`
  用户最终看到的页面结果

### 10.3 与 SDK 模式的区别

`SDK_CONFIRM` / `SDK_POPUP` 不需要 `payment_callback_receive`。

这些模式的事件顺序应是：

- `payment_sdk_ready`
- `payment_sdk_confirm` 或 `payment_popup`
- `payment_capture`
- `payment_result_render`

---

## 11. 推荐实施顺序

### Phase 1

- 新增 `GrabPay` callback route
- 定义 payment resume search params 协议
- payment 页面支持恢复态和二次校验

### Phase 2

- 新增 `Affirm` callback route
- 复用相同恢复态模型
- 复用相同 observability 事件模型

### Phase 3

- 如果未来新增 redirect provider
- 继续按 provider 新增 callback route
- 共用同一套 helper、search params 协议和 observability 规范

---

## 12. 最终建议

这件事的关键不是“要不要 callback route”，而是：

- redirect provider 必须有 callback route
- callback route 不应该成为用户可见页面
- 失败后的承接面必须是 payment 页面
- payment 页面必须具备恢复态和状态二次校验能力

因此当前最合理的落地方案是：

1. `Affirm + GrabPay` 使用独立 callback route
2. callback route 仅做 capture + redirect
3. `failure / processing` 统一回 payment 页面
4. payment 页面用 search params 恢复状态，再用后端校验决定最终行为
