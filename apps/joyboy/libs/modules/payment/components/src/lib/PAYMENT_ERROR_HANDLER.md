# Payment Error Handler

统一处理 Web 端支付流程中来自多种来源（3rd-party SDK、内部 API、本地校验）的错误，并以一致的 Modal 模板呈现给用户。

---

## 目录

- [背景与设计原则](#背景与设计原则)
- [架构总览](#架构总览)
- [错误分类器 classifyPaymentError](#错误分类器-classifypayerror)
- [统一入口 Hook usePaymentErrorHandler](#统一入口-hook-usepayementerrorhandler)
- [i18n 文案结构](#i18n-文案结构)
- [错误展示模板](#错误展示模板)
- [接入新支付方式](#接入新支付方式)
- [常见错误 category 速查](#常见错误-category-速查)

---

## 背景与设计原则

### 为什么不用 Listener？

POS 端通过 Redux Listener (`PaymentProcessFailedEvent`) 捕获支付错误，因为其错误全部来自内部 Redux API action。

Web 端不适合此方案，原因如下：

| 维度     | POS（Listener 适用）   | Web（Hook 方案）                       |
| -------- | ---------------------- | -------------------------------------- |
| 错误来源 | 仅内部 Redux action    | 3rd-party SDK + 内部 API + 本地校验    |
| 错误触发 | `matchRejected` 可捕获 | SDK 以函数返回值形式传递，不经过 Redux |
| 上下文   | Action payload 自带    | 需组件级 `orderNumber` 等上下文        |
| 分类需求 | 简单按错误码路由       | 需跨 provider 统一映射到 i18n key      |

### 设计原则

1. **单一职责**：分类器（`classifyPaymentError`）与展示层（`usePaymentErrorHandler`）严格分离
2. **统一收敛**：所有出错路径只调用 `handlePaymentError`，不直接调用 `setPaymentError`
3. **纯函数可测**：`classifyPaymentError` 无任何副作用，可独立单元测试
4. **i18n 驱动**：description 文案从 `paymentProcessingError.<category>` 取，`failureCode` / `failureInfo` 展示原始值

---

## 架构总览

```
支付错误来源（多路）
  ├── 3rd-party SDK 返回的 IPaymentProcessingError（Stripe / PayPal / AfterPay 等）
  ├── 内部 API 失败（initializePayment / confirmPayment → httpStatus）
  └── 本地校验失败（未选支付方式 / TAU check 等）
            │
            ▼
  ┌─────────────────────────────────────┐
  │  classifyPaymentError(error)        │
  │  libs/.../utils/classify-payment-  │
  │  error.ts                           │
  │                                     │
  │  failureCode / httpStatus           │
  │    → PaymentErrorCategory          │
  └────────────────┬────────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────────┐
  │  usePaymentErrorHandler(           │
  │    setPaymentError                 │
  │  )                                  │
  │  libs/.../hooks/                   │
  │  usePaymentErrorHandler.ts          │
  │                                     │
  │  t(`paymentProcessingError.        │
  │     ${category}`)                  │
  │    → description                   │
  └────────────────┬────────────────────┘
                   │  setPaymentError({ displayType: 'modal', ... })
                   ▼
  ┌─────────────────────────────────────┐
  │  PaymentErrorModal                  │
  │  (payment-wallets.tsx useEffect)   │
  │                                     │
  │  title        ← i18n fixed          │
  │  description  ← i18n by category   │
  │  Order number ← orderNumber        │
  │  Failure code ← failureCode (raw)  │
  │  Failure info ← failureInfo (raw)  │
  └─────────────────────────────────────┘
```

---

## 错误分类器 classifyPaymentError

**路径**：`libs/modules/payment/components/src/lib/payment-wallets/utils/classify-payment-error.ts`

### 接口

```typescript
function classifyPaymentError(error: Partial<IPlaceOrderError>): PaymentErrorCategory;
```

### 分类优先级

```
1. code === 'processing'              → paymentPending
2. CANCELED_OR_EXPIRED_CODES          → canceledOrExpired
3. httpStatus 4xx                     → clientError
4. httpStatus 5xx                     → serverError
5. Stripe decline code groups         → 对应 category
6. 兜底                               → genericPaymentError
```

### IPlaceOrderError 字段说明

| 字段           | 类型      | 说明                                                |
| -------------- | --------- | --------------------------------------------------- |
| `errorMessage` | `string`  | 人类可读的错误描述（来自 SDK 或 API）               |
| `failureCode`  | `string?` | SDK 原始错误码，如 `card_declined`、`user_canceled` |
| `failureInfo`  | `string?` | SDK 原始错误详情文本                                |
| `httpStatus`   | `number?` | 内部 API 响应的 HTTP 状态码（用于区分 4xx/5xx）     |

> **httpStatus 的传递**：`placeOrderCommand` 在调用 `initializePayment` / `confirmPayment` 失败时，
> 会从 RTK Query 的 error payload 中提取 `status` 字段并设置到 `IPlaceOrderError.httpStatus`。

---

## 统一入口 Hook usePaymentErrorHandler

**路径**：`libs/modules/payment/components/src/lib/hooks/usePaymentErrorHandler.ts`

### 接口

```typescript
function usePaymentErrorHandler(setPaymentError: (error: PaymentError) => void): {
  handlePaymentError: (error: Partial<IPlaceOrderError>, context: { orderNumber: string }) => void;
};
```

### 使用方式

```tsx
// payment-wallets.tsx（或任何需要支付错误处理的容器）

const { handlePaymentError } = usePaymentErrorHandler(setPaymentError);

// ✅ 统一调用入口（替代直接调用 setPaymentError）
handlePaymentError(
  { failureCode: 'card_declined', errorMessage: 'Your card was declined.' },
  { orderNumber: orderInfo.number }
);
```

### 处理流程

```
handlePaymentError(error, { orderNumber })
  ├── classifyPaymentError(error)              → category
  ├── t(`paymentProcessingError.${category}`) → description
  └── setPaymentError({
        displayType: 'modal',
        message: description,        // i18n 文案
        orderNumber,
        failureCode: error.failureCode,
        failureInfo: error.failureInfo ?? error.errorMessage,
      })
```

---

## i18n 文案结构

**文件**：`packages/monorepo-i18n/src/lib/locales/error/en-CA.json`

```json
{
  "paymentProcessingError": {
    "title": "Oops, looks like your payment didn't go through.",
    "paymentPending": "...",
    "canceledOrExpired": "...",
    "clientError": "...",
    "serverError": "...",
    "integrationError": "...",
    "authorizationError": "...",
    "accountSetupError": "...",
    "cardDeclinedError": "...",
    "invalidDetailsError": "...",
    "amountMismatchError": "...",
    "securityError": "...",
    "bankAccountError": "...",
    "chargeError": "...",
    "invoiceError": "...",
    "regionOrCurrencyError": "...",
    "unsupportedMethodError": "...",
    "billingAddressError": "...",
    "genericPaymentError": "..."
  }
}
```

> `title` 固定不变，始终展示在 Modal 顶部。
> `failureCode` / `failureInfo` 为来自 SDK / API 的原始值，不经过 i18n 翻译，直接展示供用户排查或联系客服。
> 未分类的错误码（落入 `genericPaymentError` 兜底）同样会展示原始 `failure_code` / `failure_info`，便于排查 BFF 新增/未覆盖的错误码。

---

## 错误展示模板

```
┌────────────────────────────────────────────────┐
│ ⚠  Oops, looks like your payment didn't        │  ← paymentProcessingError.title（固定）
│    go through.                             [×] │
│                                                │
│  Order number:  #24242424                      │  ← orderNumber
│  Your payment session has expired or been      │  ← paymentProcessingError.<category>
│  canceled. You can retry the payment from      │    （由 classifyPaymentError 决定）
│  your order history.                           │
│                                                │
│  Failure code:  user_canceled                  │  ← failureCode（SDK 原始值）
│  Failure info:  The user has requested         │  ← failureInfo（SDK 原始值）
│                 to cancel the transaction.     │
│                                                │
│  [              OKAY              ]            │
└────────────────────────────────────────────────┘
```

**组件**：`PaymentErrorPopupDetail`（`libs/modules/payment/components/src/lib/payment-wallets/components/payment-error-popup-detail.tsx`）

**触发时机**：`payment-wallets.tsx` 中监听 `paymentState.error` 变化的 `useEffect`，当 `displayType === 'modal'` 时弹出。

---

## 接入新支付方式

当引入新的支付 provider（如 Klarna、Nets 等），只需在 `classify-payment-error.ts` 中将其错误码加入对应的 Set：

```typescript
// classify-payment-error.ts

const CANCELED_OR_EXPIRED_CODES = new Set([
  // 已有 Stripe codes...
  'klarna_session_expired', // 新增 Klarna 的 session 过期码
]);

const CARD_DECLINED_CODES = new Set([
  // 已有 Stripe codes...
  'nets_card_declined', // 新增 Nets 的卡拒绝码
]);
```

其他层（Hook、Modal、i18n）**无需改动**。

---

## 常见错误 category 速查

| category                 | 典型触发场景             | 对应 Stripe decline codes（举例）               |
| ------------------------ | ------------------------ | ----------------------------------------------- |
| `paymentPending`         | 支付仍在异步处理中       | `processing`                                    |
| `canceledOrExpired`      | 用户主动取消 / 会话超时  | `user_canceled`, `payment_intent_canceled`      |
| `clientError`            | 内部 API 返回 4xx        | HTTP 400–499                                    |
| `serverError`            | 内部服务端异常           | HTTP 500–599                                    |
| `cardDeclinedError`      | 卡被拒绝（余额不足等）   | `card_declined`, `insufficient_funds`           |
| `authorizationError`     | 系统无法授权该支付       | `authentication_required`, `not_permitted`      |
| `invalidDetailsError`    | 卡号/有效期/CVV 填写有误 | `invalid_cvc`, `incorrect_number`               |
| `amountMismatchError`    | 金额异常                 | `invalid_amount`, `amount_too_large`            |
| `bankAccountError`       | 银行账户问题             | `bank_account_declined`, `no_account`           |
| `securityError`          | 安全/合规限制            | `fraudulent`, `security_violation`              |
| `regionOrCurrencyError`  | 地区或货币不支持         | `country_unsupported`, `currency_not_supported` |
| `unsupportedMethodError` | 支付方式已不可用         | `payment_method_not_available`                  |
| `billingAddressError`    | 税务或账单地址信息有误   | —（来自内部 API 业务错误）                      |
| `genericPaymentError`    | 无法归类的兜底错误       | 所有未匹配项                                    |
