# Payment Error 提示待完善清单

> 参考 PRD：[Pop-ups Texts / Texts updated in Checkout Refactoring](https://castlery.atlassian.net/wiki/spaces/PM/pages/3113779298)
> 整理日期：2026-04-17

---

## 🔴 P0 — i18n 缺失（线上会显示 raw key）

### 1. `orderNumber` / `failureCode` / `failureInfo` 标签缺失（非 CA 市场）

`PaymentErrorPopupDetail` 组件依赖以下 key，但只有 `en-CA.json` 有定义，其余市场缺失：

```json
// checkoutPayment.paymentWallets.errors
"orderNumber": "Order number",
"failureCode": "Failure code",
"failureInfo": "Failure info"
```

**影响文件**：`payment-error-popup-detail.tsx:43,59,66`

**需要补充的文件**：

- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-US.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-SG.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-AU.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-GB.json`

---

### 2. `10703025`（Order amount invalid）i18n 完全缺失

PRD Row 3 定义：

- 文案：`"Oops, something went wrong with your order amount. Please refresh the page or contact customer service for help."`
- 按钮：`Back to cart` → 跳转 Cart 页
- Error code：`10703025`（`ErrOrderTotalIsLessThanZero`，已在 `ec-error-codes.ts:177`）

当前所有市场的 `error/en-*.json` 的 `transactionApiError` 下均**无此 key**。

**需要在以下所有文件补充**：

```json
// transactionApiError
"10703025": {
  "title": "Order amount invalid",
  "description": "Oops, something went wrong with your order amount. Please refresh the page or contact customer service for help.",
  "confirm": "Back to cart"
}
```

文件清单：

- `packages/monorepo-i18n/src/lib/locales/error/en-US.json`
- `packages/monorepo-i18n/src/lib/locales/error/en-SG.json`
- `packages/monorepo-i18n/src/lib/locales/error/en-AU.json`
- `packages/monorepo-i18n/src/lib/locales/error/en-GB.json`
- `packages/monorepo-i18n/src/lib/locales/error/en-CA.json`

---

## 🟡 P1 — 逻辑问题

### 3. `billingAddressError` 是死代码

**现状**：

- `paymentProcessingError.billingAddressError` i18n key 存在（文案："Oops, your tax or address details isn't quite right..."）
- `classifyPaymentError` 的所有分支中**没有任何一处 return `'billingAddressError'`**
- Stripe 的 billing address 相关 code（`incorrect_zip`, `address_zip_fail`）目前归入 `INVALID_DETAILS_CODES` → `invalidDetailsError`

**位置**：

- `payment-wallets/utils/classify-payment-error.ts`（无 billingAddress 分支）
- `packages/monorepo-i18n/src/lib/locales/error/en-*.json`（`paymentProcessingError.billingAddressError` 死 key）

**修复方案（二选一）**：

Option A（推荐，精确提示）：从 `INVALID_DETAILS_CODES` 中移出 `incorrect_zip`, `address_zip_fail`，新建：

```ts
const BILLING_ADDRESS_CODES = new Set(['incorrect_zip', 'address_zip_fail']);
// 在分类逻辑中加入
if (BILLING_ADDRESS_CODES.has(code)) return 'billingAddressError';
```

Option B（简化）：删除 `billingAddressError` i18n key 及 `PaymentErrorCategory` 中该类型，让这类错误 fallback 到 `invalidDetailsError`。

> ⚠️ 执行前确认 PRD 截断部分是否有对应文案定义

---

### 4. 通用支付失败 Modal 按钮行为与文案不一致

**现状**：`serverError`, `integrationError`, `clientError` 等 category 的 i18n 文案都引导用户去 order history 重试，但 modal 只有 `"Okay"` 按钮，点击后 `clearPaymentError()` → 停留在支付页。

**位置**：`payment-wallets.tsx:276-291`（通用 modal 分支）

```tsx
// 当前实现
modal.warning({
  ...
  onClose: clearPaymentError,
  showCancelBtn: false,
  confirmText: 'Okay',
});
```

**修复方向**：根据 PRD 确认哪些 category 需要什么 action，可参考：

- `orderExpired` / `orderCanceled` 已有专属路由跳转逻辑作为参考
- 可在 `PaymentErrorModal` type 上增加 `confirmAction?: 'stay' | 'orderHistory' | 'cart'` 字段

> ⚠️ 执行前需要先确认 PRD 后半段（payment processing failure 部分）的各场景 button 定义

---

## 🟡 P1 — Typo

### 5. en-CA.json 中 `10702035.description` 有多余 `T`

**位置**：`packages/monorepo-i18n/src/lib/locales/error/en-CA.json:222`

```json
// 当前（错误）
"description": "TYour checkout session has expired..."

// 应改为
"description": "Your checkout session has expired..."
```

---

## 🟢 P2 — Sentence Case（品牌规范）

### 6. `orderCanceled.title` 需改为 sentence case

PRD 备注：「根据品牌要求，弹窗标题改成 sentence case（只有标题更新，按钮全大写不变）」

```json
// 当前
"title": "Order Canceled"

// 应改为
"title": "Order canceled"
```

**需要修改的文件**：

- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-US.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-SG.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-AU.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-GB.json`
- `packages/monorepo-i18n/src/lib/locales/modules/checkout/en-CA.json`

---

## 📋 待确认项

PRD 响应在 Row 11（Promotion changed）处截断，以下内容需人工确认：

- [ ] PRD 后半段是否有 payment processing failure 专属文案（Stripe 失败 / PayPal / GrabPay 等不同支付方式的差异化提示）
- [ ] `billingAddressError` 在 PRD 中是否有对应 copy 定义
- [ ] 各 error category 对应的 modal button action（用于修复问题 4）

---

## 变动文件汇总

| 优先级 | 文件                                                  | 改动类型                                        |
| ------ | ----------------------------------------------------- | ----------------------------------------------- |
| P0     | `locales/modules/checkout/en-{US,SG,AU,GB}.json`      | 补 `errors.orderNumber/failureCode/failureInfo` |
| P0     | `locales/error/en-*.json`（全部 5 个市场）            | 补 `transactionApiError.10703025`               |
| P1     | `payment-wallets/utils/classify-payment-error.ts`     | 修复 `billingAddressError` 可达性               |
| P1     | `locales/error/en-*.json`                             | 同步删除或保留 `billingAddressError` key        |
| P1     | `payment-wallets/payment-wallets.tsx`                 | 通用 modal 按 category 设置 action button       |
| P1     | `locales/error/en-CA.json`                            | 修 typo（TYour → Your）                         |
| P2     | `locales/modules/checkout/en-*.json`（全部 5 个市场） | `orderCanceled.title` sentence case             |
