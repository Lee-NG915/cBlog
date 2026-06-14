# PaymentWallets 重构分析

## 现状

`payment-wallets.tsx` 当前 **942 行**，单文件承担了多类职责，维护成本高。

### 责任分布

| 职责                                             | 当前位置   | 大致行数 |
| ------------------------------------------------ | ---------- | -------- |
| Order 生命周期（创建 / 查询 / 写 session）       | 组件内     | ~80 行   |
| Payment pipeline（initiate / confirm / capture） | 组件内     | ~200 行  |
| 各支付方式 submit handler                        | 组件内     | ~100 行  |
| Error 状态 + 弹窗触发                            | 组件内     | ~80 行   |
| 支付方式选择 & 可见性计算                        | 组件内     | ~80 行   |
| 倒计时 & 过期弹窗                                | 组件内     | ~40 行   |
| Refs（8 个）                                     | 散落组件内 | —        |
| 渲染（expressSlot / sdkSlot / submitSection）    | 组件内     | ~100 行  |

---

## 优化方向：Hook 下沉 + 薄组件

将业务逻辑下沉到 3 个专职 hook，组件只负责「连线 + 渲染」，目标组件体积压缩到 ~150 行。

```
PaymentWallets (组件，~150 行)
  ├── useOrderLifecycle          ← Order 创建 / 恢复 / pending 检查
  ├── usePaymentExecution        ← pipeline: initiate / confirm / capture
  └── usePaymentMethodSelection  ← 方法列表、选中状态、isXxxSelected 标志位

hooks/ (已有，继续复用)
  ├── usePaymentErrorHandler
  ├── usePaymentErrorMessages
  └── usePaymentCountdown
```

---

## Hook 职责说明

### `useOrderLifecycle`

**管理状态**

- `orderInfo` — 当前订单信息（id / referenceNumber / number / paymentExpiredAt）
- `orderPaymentsHasPending` — 支付记录状态（`null` 未检查 / `true` 无记录或有 PENDING / `false` 已有终态支付）
- `lastPaymentIdRef` — 上次失败支付 ID，用于 cleanup

**行为**

- mount 时查询 existing payments，非 PENDING 则 redirect 到 order history
- 从 `paymentDataSource`（orderCheckout source）恢复 orderInfo
- `saveNewOrder` — 创建成功后写 React state + sessionStorage

**输出**

```ts
{
  orderInfo,
  orderPaymentsHasPending,
  lastPaymentIdRef,
  saveNewOrder,
}
```

---

### `usePaymentExecution`

**依赖**：`useOrderLifecycle` 输出 + `activeProvider` + `paymentAmount`

**行为**

- `buildOrderAndInitiate` — 公共前置流程：创建订单（若无）→ 清理 stale payment → initiate
- `runPaymentPipeline` — Stripe / GrabPay / 2C2P / Express 的支付流程（SDK_CONFIRM / REDIRECT / SUCCESS → capture）
- `prepareSdkPayment` — SDK_POPUP 前置流程（PayPal / Affirm）
- `handleCaptureResult` — capture 结果统一处理
- 各方式 submit handler：`onStripeCardSubmit`, `onGrabPaySubmit`, `onTwoCTwoPSubmit`, `onExpressCheckoutSubmit`, `onPaypalCapture`, `onAffirmCapture`, `onSdkError`

**管理 Refs**

- `stripeSubmitHandlerRef`
- `stripeConfirmHandlerRef`
- `twoCTwoPConfirmHandlerRef`

**输出**

```ts
{
  onStripeCardSubmit,
  onGrabPaySubmit,
  onTwoCTwoPSubmit,
  onExpressCheckoutSubmit,
  onPaypalCapture,
  onAffirmCapture,
  onSdkError,
  stripeSubmitHandlerRef,
  stripeConfirmHandlerRef,
  twoCTwoPConfirmHandlerRef,
}
```

---

### `usePaymentMethodSelection`

**管理状态**

- `selectedPaymentMethod`
- `availableExpressMethods`（Stripe Express 实际可用方法）

**行为**

- 计算 `defaultSelectedMethod`（优先 `defaultSelectedKey`，fallback STRIPE_ONLINE）
- mount 后异步 fallback（configs 加载完成后补设默认选中）
- 计算 `visibleMethods`（过滤掉不可用的 Express 方法）
- 派生 `is*Selected` 标志位

**输出**

```ts
{
  selectedPaymentMethod,
  visibleMethods,
  isStripeSelected,
  isPaypalSelected,
  isAffirmSelected,
  isGrabPaySelected,
  isTwoCTwoPSelected,
  isExpressMethodSelected,
  activeProvider,
  stripePublicKey,
  paypalClientId,
  availableExpressMethods,
  handleSelectPaymentMethod,
  onExpressMethodsDetected,
}
```

---

## 设计决策记录

**Q1. `orderPaymentsHasPending` 语义**
仅用于 UI 显示控制（切换按钮文案 `Make Payment` vs `Place your order`），无需区分「无记录」和「有 PENDING」两种情况，保持现有三态逻辑。

**Q2. 过期弹窗双路径 → 合并**

- Path A（前端倒计时到 0）和 Path B（后端返回 `orderExpired` 错误）弹窗内容相同。
- 优化方向：Path A 触发时统一转换为 `setPaymentError({ category: 'orderExpired', ... })`，由 error modal `useEffect` 统一消费，消除重复逻辑。

**Q3. `tauCheckHandler` = 隐私政策勾选检测**
TAU 是用户隐私政策 checked 状态检测，逻辑简单，无需独立 hook。`prepareCheckHandler` 保留为轻量包装，在 `usePaymentExecution` 中接收 `tauCheckHandler` 作为参数传入。

**Q4. `saveNewOrder` sessionStorage 写入差异**

- checkout flow：`createOrder` 成功后主动写入 sessionStorage
- orderCheckout flow：从 `paymentDataSource` 恢复，不写入

两条路径差异由业务模型决定，保留现有行为，`useOrderLifecycle` 内部维护两套恢复逻辑。
