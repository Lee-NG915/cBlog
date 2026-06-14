# Payment 支付状态完善：技术方案设计

- **版本**：v1.1（已更新确认问题）
- **日期**：2026-03-09
- **作者**：Abby Wang
- **关联文档**：[payment-refactoring-design.md](../../docs/payment-refactoring-design.md)
- **状态**：🟢 可执行（T1 / T2 / T4 已确认，T3 / T5 完整流程暂缓）

---

## 目录

1. [背景与目标](#1-背景与目标)
2. [支付方式分类](#2-支付方式分类)
3. [T1 — 按钮文案切换](#3-t1--按钮文案切换)
4. [T2 — 支付倒计时](#4-t2--支付倒计时)
5. [T3 — REDIRECT 类回调处理（GrabPay / 2C2P）](#5-t3--redirect-类回调处理grabpay--2c2p)
6. [T4 — SDK 弹窗类（PayPal / Affirm）](#6-t4--sdk-弹窗类paypal--affirm)
7. [T5 — GrabPay Processing 状态](#7-t5--grabpay-processing-状态)
8. [依赖关系与交付顺序](#8-依赖关系与交付顺序)
9. [执行步骤](#9-执行步骤)

---

## 1. 背景与目标

在 Phase 5（精简 `payment-wallets.tsx`）完成后，当前支付流程已覆盖 Stripe 信用卡的完整路径，但以下状态仍缺失：

| 场景                          | 当前状态                      | 本期计划                   |
| ----------------------------- | ----------------------------- | -------------------------- |
| 订单创建后按钮文案切换        | ❌ 未实现                     | ✅ T1，本期实现            |
| 支付倒计时                    | ❌ 未实现                     | ✅ T2，本期实现            |
| GrabPay / 2C2P 回调页处理     | ❌ 空 stub                    | ⏸ T3，市场未开始调试，暂缓 |
| 从回调页失败返回时的弹窗提示  | ❌ 未实现                     | ⏸ T3-C，依赖 T3            |
| PayPal / Affirm SDK 弹窗接入  | ❌ 未接入                     | ✅ T4，本期实现            |
| GrabPay `processing` 状态触发 | ⚠️ 分类逻辑存在，触发路径缺失 | ⏸ T5，依赖 T3-A 完成       |

**目标**：本期完成 T1 / T2 / T4，T3 / T5 留待 GrabPay / 2C2P 市场调试启动后实现。

---

## 2. 支付方式分类

```
Type A — Stripe（Inline Element + SDK_CONFIRM）
  ├── Stripe Online（信用卡）
  └── Stripe Express（Apple Pay / Google Pay / Link Pay）

Type B — 全页跳转（REDIRECT + 独立回调页）⏸ 暂缓
  ├── GrabPay   → 回调至 /checkout/grabpay
  └── 2C2P      → 回调至 /checkout/tctp-payment

Type C — SDK 弹窗（JS SDK + JS Callback，主页不离开）
  ├── PayPal
  └── Affirm
```

> **Type A 已完整实现**，本期聚焦 T1 / T2（通用）+ T4（Type C）。

---

## 3. T1 — 按钮文案切换

### 确认结论

| 阶段                               | 按钮文案                             |
| ---------------------------------- | ------------------------------------ |
| 订单未创建（`orderInfo === null`） | "Place Your Order"                   |
| 订单已创建（`orderInfo !== null`） | "Make Payment (H:MM:SS)"（含倒计时） |

Express Checkout（Apple / Google Pay）使用第三方返回的按钮样式，不受此规则影响。

### 改动范围

- **`payment-wallets.tsx`**：`submitLabel` 改为根据 `orderInfo` + 倒计时动态决定
- **locale 文件**：新增 `makePayment` i18n key

### 实现

```typescript
// payment-wallets.tsx
const submitLabel = orderInfo
  ? `${t('makePayment', { defaultValue: 'Make Payment' })} (${formattedCountdown})`
  : t('placeOrder', { defaultValue: 'Place your order' });
```

---

## 4. T2 — 支付倒计时

### 确认结论

| 问题           | 答案                                                                |
| -------------- | ------------------------------------------------------------------- |
| 时长           | **固定 2 小时**，起始时间取 `order.createdAt`（接口字段）           |
| 页面刷新后     | 从接口取 `createdAt` 重新计算剩余时间（如接口未返回，需 BE 补字段） |
| 展示位置       | 按钮文案内：`"Make Payment (1:59:58)"`                              |
| 倒计时归零行为 | 自动弹出 Order Expired 弹窗（见下方 Modal 配置）                    |

### Order Expired Modal 配置

```
Title:       Order expired
Description: Oops, your order has expired. You can continue shopping
             or re-add items to your cart from the Order History page.

Left Button:  "Continue shopping"  → redirect 首页
Right Button: "View order history" → redirect Order History 页
onClose:      redirect Order History 页（关掉弹窗也跳转）
```

### 实现方案

#### `usePaymentCountdown` hook

```typescript
const DURATION_MS = 2 * 60 * 60 * 1000; // 2h

function usePaymentCountdown(orderCreatedAt: string | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!orderCreatedAt) return;

    const endTime = new Date(orderCreatedAt).getTime() + DURATION_MS;

    const tick = () => {
      const diff = endTime - Date.now();
      setRemainingMs(Math.max(0, diff));
    };

    tick(); // 立即执行一次，避免首帧空白
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [orderCreatedAt]);

  const isExpired = remainingMs !== null && remainingMs === 0;

  return { remainingMs, isExpired };
}
```

#### 时间格式化（H:MM:SS）

```typescript
function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
```

#### `payment-wallets.tsx` 中的接入

```typescript
const { remainingMs, isExpired } = usePaymentCountdown(orderInfo?.createdAt ?? null);

// 归零时弹 Order Expired Modal
useEffect(() => {
  if (isExpired) setShowOrderExpiredModal(true);
}, [isExpired]);

const formattedCountdown = remainingMs !== null ? formatCountdown(remainingMs) : '';
```

#### Order Expired Modal

复用现有 Modal 组件，配置上述文案与跳转逻辑。

### 前置依赖

> ⚠️ **需确认**：`orderInfo` 接口响应是否包含 `createdAt` 字段。若无，需 BE 补充。

---

## 5. T3 — REDIRECT 类回调处理（GrabPay / 2C2P）

> ⏸ **本期暂缓**：GrabPay / 2C2P 市场尚未开始调试，当前保留空 stub + 方案预案，待市场就绪后实现。

### 整体流程（预案）

```
用户点击提交
  → initiatePaymentAction → { action: 'REDIRECT', redirectUrl, returnUrl }
  → window.location.href = redirectUrl（当前已实现）
  → 用户在服务商页面完成 / 放弃 / 失败
  → 服务商跳回回调页，携带结果参数
  → 回调页解析参数 → 调用 capturePaymentAction
        ├── success → redirect /checkout-success?orderId=xxx
        └── failure → redirect /checkout/payment?orderId=xxx
  → payment 页检测 orderId → 查询订单 payments 状态 → 弹窗告知失败原因
```

### T3-A: GrabPay 回调页

**待确认后实现**（Q-T3-A-1 callback URL 参数名 / Q-T3-A-2 paymentId 来源 / Q-T3-A-3 status 字段）。

当前 `/checkout/grabpay/page.tsx` 保持空 stub。

### T3-B: 2C2P 回调页

**待确认后实现**（Q-T3-B-1 callback URL 参数名 / Q-T3-B-2 成功 responseCode / Q-T3-B-3 paymentId 来源）。

当前 `/checkout/tctp-payment/page.tsx` 保持空 stub。

### T3-C: Payment 页失败检测

**依赖 T3-A / T3-B 完成后实现**（需确定 redirect URL 格式）。

预案方案：

```typescript
// payment/page.tsx
const paymentFailed = searchParams.get('paymentFailed') === 'true';
const errorCode     = searchParams.get('errorCode') ?? undefined;
const orderNumber   = searchParams.get('orderNumber') ?? '';

<PaymentWallets
  ...
  initialError={paymentFailed ? { failureCode: errorCode, orderNumber } : undefined}
/>
```

---

## 6. T4 — SDK 弹窗类（PayPal / Affirm）

### T4-A: 架构决策

#### 集成方式（已确认）

| SDK    | 集成方式                                          |
| ------ | ------------------------------------------------- |
| PayPal | `@paypal/react-paypal-js` 的 `PayPalButtons` 组件 |
| Affirm | `affirm.js` 的 `affirm.checkout.open()` API       |

两者均采用**方案 A**：SDK 自身持有触发时机，`initiatePaymentAction` 作为 SDK callback 内的调用。

#### ActionSchema 扩展（FE 规划）

新增 `SDK_POPUP` action 类型，专用于 PayPal / Affirm：

```typescript
// 当前 ActionSchema
type ActionSchema =
  | { action: 'SDK_CONFIRM'; clientSecret: string } // Stripe
  | { action: 'REDIRECT'; redirectUrl: string; returnUrl: string } // GrabPay / 2C2P
  | { action: 'SUCCESS'; orderId: string };

// 扩展后
type ActionSchema =
  | { action: 'SDK_CONFIRM'; clientSecret: string }
  | { action: 'REDIRECT'; redirectUrl: string; returnUrl: string }
  | { action: 'SDK_POPUP'; sdkToken: string } // PayPal orderId / Affirm checkoutToken
  | { action: 'SUCCESS'; orderId: string };
```

**理由**：

- `SDK_CONFIRM` 语义上绑定了 Stripe 的 client secret，不应复用
- `SDK_POPUP` 语义清晰：后端创建第三方 SDK 所需的 token，前端用 token 开启 SDK 弹窗
- `sdkToken` 对 PayPal 是 orderId，对 Affirm 是 checkoutToken，统一字段名，各自组件内部解释

> ⚠️ **需 BE 配合**：`initiatePaymentAction` 对 PayPal / Affirm 返回 `{ action: 'SDK_POPUP', sdkToken: '...' }`。

#### 整体流程

```
PayPal / Affirm Button 渲染（组件挂载时）
  → 用户点击 SDK Button
  → SDK 触发 createOrder / checkout callback
      → 调用 initiatePaymentAction → 返回 { action: 'SDK_POPUP', sdkToken }
      → 把 sdkToken 返回给 SDK
  → SDK 开启弹窗，用户完成支付
  → onApprove / successCb callback fires
      → 调用 capturePaymentAction（含 paypalData / affirmData）
      → success → redirect /checkout-success?orderId=xxx
  → onCancel / onError / cancelCb
      → handlePaymentError → show modal
```

---

### T4-B: PayPal 组件（`PaypalPaymentElement`）

```typescript
// libs/modules/payment/components/paypal-payment-element.tsx

interface PaypalPaymentElementProps {
  paymentInfo: PaymentInfo; // orderId, paymentId, amount, provider 等
  onPaymentError: (error: PaymentError) => void;
  onPaymentSuccess: (result: CaptureResult) => void;
}

export function PaypalPaymentElement({ paymentInfo, onPaymentError, onPaymentSuccess }: PaypalPaymentElementProps) {
  return (
    <PayPalButtons
      createOrder={async () => {
        const result = await initiatePaymentAction({ ...paymentInfo });
        if (result.action !== 'SDK_POPUP') throw new Error('Unexpected action');
        return result.sdkToken; // PayPal orderId
      }}
      onApprove={async (data) => {
        const result = await capturePaymentAction({
          paypalData: { orderId: data.orderID, payerId: data.payerID },
          ...paymentInfo,
        });
        onPaymentSuccess(result);
      }}
      onCancel={() => {
        // 用户主动取消，不弹错误 modal，静默处理
      }}
      onError={(err) => {
        onPaymentError({ failureCode: 'PAYPAL_ERROR', message: String(err) });
      }}
    />
  );
}
```

**依赖**：

- `PayPalScriptProvider`（确认 `payments-provider/paypal-provider.tsx` 是否可复用）
- BE 支持 PayPal initiate 返回 `SDK_POPUP`

---

### T4-C: Affirm 组件（`AffirmPaymentElement`）

```typescript
// libs/modules/payment/components/affirm-payment-element.tsx

interface AffirmPaymentElementProps {
  paymentInfo: PaymentInfo;
  onPaymentError: (error: PaymentError) => void;
  onPaymentSuccess: (result: CaptureResult) => void;
}

export function AffirmPaymentElement({ paymentInfo, onPaymentError, onPaymentSuccess }: AffirmPaymentElementProps) {
  const handleClick = async () => {
    const result = await initiatePaymentAction({ ...paymentInfo });
    if (result.action !== 'SDK_POPUP') {
      onPaymentError({ failureCode: 'AFFIRM_INIT_ERROR' });
      return;
    }

    affirm.checkout.open(
      { checkout_token: result.sdkToken },
      async ({ checkout_token }: { checkout_token: string }) => {
        // successCb
        const captureResult = await capturePaymentAction({
          affirmData: { checkoutToken: checkout_token },
          ...paymentInfo,
        });
        onPaymentSuccess(captureResult);
      },
      () => {
        // cancelCb — 用户主动关闭，静默处理
      }
    );
  };

  return <button onClick={handleClick}>Pay with Affirm</button>;
}
```

**依赖**：

- `<Script src="https://cdn1.affirm.com/js/v2/affirm.js">` 加载（在 `_app` 或 provider 层）
- BE 支持 Affirm initiate 返回 `SDK_POPUP`

---

### T4-D: `payment-wallets.tsx` 适配

当 `activeProvider` 为 PayPal / Affirm 时，`payment-wallets.tsx` 不需要统一 submit handler，而是渲染对应的 SDK 组件：

```typescript
// payment-wallets.tsx
const renderPaymentElement = () => {
  if (isStripeProvider(activeProvider)) {
    return <StripePaymentElement ref={stripeConfirmHandlerRef} ... />;
  }
  if (activeProvider === 'PAYPAL') {
    return (
      <PaypalPaymentElement
        paymentInfo={paymentInfo}
        onPaymentError={handlePaymentError}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }
  if (activeProvider === 'AFFIRM') {
    return (
      <AffirmPaymentElement
        paymentInfo={paymentInfo}
        onPaymentError={handlePaymentError}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }
};
```

PayPal / Affirm 场景下，原有的 submit 按钮不渲染（SDK 自带触发入口）。

---

## 7. T5 — GrabPay Processing 状态

> ⏸ **完整流程依赖 T3-A 完成**，但以下内容本期可先行实现。

### 确认结论

| 问题                    | 答案                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| GrabPay 交易状态        | `PENDING` / `COMPLETED` / `FAILED` / `CANCELLED`                                                          |
| `PENDING` 对应前端状态  | `paymentPending`                                                                                          |
| paymentPending 用户文案 | "Your payment is being processed. You'll be able to check the payment status in your order history soon." |

### 本期可先行的工作

1. **更新 `classifyPaymentError`**：补充 `'PENDING'` → `paymentPending` 映射（当前仅有 `'processing'` → `paymentPending`）
2. **确认 / 新增 i18n key** `paymentPending` 文案

### 完整流程（待 T3-A 完成后接入）

```
capturePaymentAction 返回 failure（errorCode = 'PENDING'）
  → T3-A redirect /checkout/payment?paymentFailed=true&errorCode=PENDING&orderNumber=yyy
  → T3-C 检测 → handlePaymentError({ failureCode: 'PENDING' })
  → classifyPaymentError → 'paymentPending'
  → 展示 paymentPending 文案
```

---

## 8. 依赖关系与交付顺序

```
T1（按钮文案）
  └── 独立，最快交付

T2（倒计时）
  └── 依赖：orderInfo API 返回 createdAt 字段（需 BE 确认）

T4-A（ActionSchema 扩展）
  └── 需 BE 配合新增 SDK_POPUP 返回类型

T4-B PayPal（PaypalPaymentElement）
  └── 依赖：T4-A（BE 支持 SDK_POPUP）

T4-C Affirm（AffirmPaymentElement）
  └── 依赖：T4-A（BE 支持 SDK_POPUP）

T4-D（payment-wallets.tsx 扩展）
  └── 依赖：T4-B / T4-C 组件完成

T5-partial（classifyPaymentError 更新 + i18n）
  └── 独立，可随时实现

──── 以下暂缓 ────

T3-A（GrabPay 回调页）
  └── 依赖：GrabPay 市场调试启动 + BE 确认 callback 参数

T3-B（2C2P 回调页）
  └── 依赖：2C2P 市场调试启动 + BE 确认 callback 参数

T3-C（payment 页失败检测）
  └── 依赖：T3-A / T3-B 完成

T5-full（GrabPay processing 完整流程）
  └── 依赖：T3-A 完成
```

---

## 9. 执行步骤

### Step 1 — T1：按钮文案切换（无外部依赖）

**文件**：`payment-wallets.tsx`、locale 文件

- [ ] locale 文件新增 `makePayment` key（各语言）
- [ ] `payment-wallets.tsx`：`submitLabel` 改为动态计算（`orderInfo ? makePayment : placeOrder`）
- [ ] 确保 Express Checkout 不受影响（不渲染该按钮）

---

### Step 2 — T2：倒计时（需先确认 BE 字段）

**前置**：确认 `orderInfo` 接口是否返回 `createdAt` 字段，若无则提 BE 需求。

**文件**：新建 `use-payment-countdown.ts`、`payment-wallets.tsx`、locale / modal 相关

- [ ] 新建 `usePaymentCountdown(orderCreatedAt: string | null)` hook
- [ ] 新建 `formatCountdown(ms: number): string` 工具函数
- [ ] `payment-wallets.tsx`：接入 hook，`submitLabel` 拼接倒计时字符串
- [ ] `payment-wallets.tsx`：`isExpired` 触发 Order Expired Modal
- [ ] 实现 Order Expired Modal 组件，配置文案与跳转逻辑
- [ ] locale 文件新增相关 i18n key（title / description / button 文案）

---

### Step 3 — T4-A：ActionSchema 扩展（需 BE 配合）

**文件**：`libs/modules/payment/types.ts`（或 ActionSchema 定义处）、BE 接口

- [ ] FE：`ActionSchema` 新增 `{ action: 'SDK_POPUP'; sdkToken: string }`
- [ ] FE：`payment-wallets.tsx` 或 `initiatePaymentAction` handler 新增对 `SDK_POPUP` 的处理分支
- [ ] BE：PayPal initiate 返回 `{ action: 'SDK_POPUP', sdkToken: '<paypal-order-id>' }`
- [ ] BE：Affirm initiate 返回 `{ action: 'SDK_POPUP', sdkToken: '<affirm-checkout-token>' }`

---

### Step 4 — T4-B：PayPal 组件（依赖 Step 3）

**文件**：新建 `paypal-payment-element.tsx`

- [ ] 确认 `payments-provider/paypal-provider.tsx` 是否可复用，或需新增 Provider 层
- [ ] 实现 `PaypalPaymentElement` 组件
  - [ ] `createOrder` callback → `initiatePaymentAction` → 返回 `sdkToken`
  - [ ] `onApprove` → `capturePaymentAction({ paypalData })` → `onPaymentSuccess`
  - [ ] `onCancel` → 静默处理
  - [ ] `onError` → `onPaymentError`

---

### Step 5 — T4-C：Affirm 组件（依赖 Step 3）

**文件**：新建 `affirm-payment-element.tsx`

- [ ] 确认 Affirm.js Script 加载位置（`_app` / provider 层）
- [ ] 实现 `AffirmPaymentElement` 组件
  - [ ] click handler → `initiatePaymentAction` → 获取 `sdkToken`
  - [ ] `affirm.checkout.open(config, successCb, cancelCb)`
  - [ ] `successCb` → `capturePaymentAction({ affirmData })` → `onPaymentSuccess`
  - [ ] `cancelCb` → 静默处理
  - [ ] 失败 → `onPaymentError`

---

### Step 6 — T4-D：`payment-wallets.tsx` 适配（依赖 Step 4 / 5）

**文件**：`payment-wallets.tsx`

- [ ] 按 `activeProvider` 条件渲染 PayPal / Affirm 组件
- [ ] PayPal / Affirm 场景下隐藏原有 submit 按钮
- [ ] `handlePaymentSuccess` / `handlePaymentError` 作为 props 传入各 SDK 组件

---

### Step 7 — T5-partial：GrabPay Processing 分类更新（可随时）

**文件**：`classify-payment-error.ts`（或同等文件）、locale 文件

- [ ] `classifyPaymentError`：补充 `'PENDING'` → `'paymentPending'` 映射
- [ ] locale 文件新增 / 确认 `paymentPending` 文案：
  > "Your payment is being processed. You'll be able to check the payment status in your order history soon."

---

### 暂缓步骤（T3 / T5-full，待市场调试启动）

- [ ] T3-A: 实现 `/checkout/grabpay/page.tsx` 回调逻辑（待 BE 提供 callback 参数文档）
- [ ] T3-B: 实现 `/checkout/tctp-payment/page.tsx` 回调逻辑（同上）
- [ ] T3-C: `payment/page.tsx` 检测 paymentFailed 参数，触发 `handlePaymentError`
- [ ] T5-full: GrabPay PENDING 状态完整流程接入

---

> **建议并行推进**：Step 1（T1）立即开始 → Step 2（T2）确认 BE 字段后启动 → Step 3（T4-A）与 BE 对齐后同步推进 Step 4~6 → Step 7 随时插入。
