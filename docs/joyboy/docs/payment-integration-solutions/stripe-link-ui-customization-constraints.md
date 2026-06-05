# Stripe Link UI 定制限制说明

**日期：** 2026-04-16  
**模块：** `libs/modules/payment/components/src/lib/stripe/stripe-payment-element/`  
**相关人员：** FE、UI 设计师

---

## 背景

Stripe PaymentElement 集成了 Link 快捷支付功能。当用户已登录 Link 账号时，Stripe 会在卡号输入框区域自动展示一个已保存支付方式的组件（白色圆角容器，内含已绑卡列表）。

设计要求该组件背景色与页面主题色一致（`#F6F3E7`），但经过技术调研，发现存在以下限制。

---

## 问题详情

### Link 组件的渲染机制

Stripe Link 的已登录用户卡片容器（`cookied-payment-details-widget`）由 Stripe.js 注入，渲染在独立的 **iframe** 中，不属于宿主页面 DOM。

这意味着：

- 无法通过宿主页面 CSS 直接覆盖样式
- Stripe 的 Appearance API 对该容器**没有提供官方定制入口**

### Stripe Appearance API 限制

Stripe 的 [`appearance` 配置](https://docs.stripe.com/elements/appearance-api) 仅支持白名单内的类名选择器，以下尝试均**无效**：

| 尝试的方式                                            | 结果                                                  |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `colorBackground: '#F6F3E7'` variable                 | 影响输入框，不影响 Link 容器                          |
| `colorSurface` variable                               | Stripe API 不存在该变量                               |
| `.Block` rule                                         | 作用于 promotion code 区域，不覆盖 Link 容器          |
| `[data-testid="cookied-payment-details-widget"]` rule | Stripe 不支持任意 data-testid 选择器                  |
| `#link-branded-root` ID 选择器                        | Stripe 不支持 ID 选择器                               |
| `.p-LinkDefaultButton`、`.p-LinkAutofillPrompt`       | `.p-` 开头为 Stripe 内部私有类，appearance API 不允许 |
| 后代选择器（`.FadeWrapper`、`.PaymentMethod` 等）     | Stripe 不支持嵌套/后代选择器                          |
| `var(--colorBackground)` 在 rules 中引用              | rules 值不支持 CSS 变量引用                           |
| `@media` query in rules                               | 不支持                                                |

---

## 当前已实现的定制

以下配置**有效**，已应用于生产代码：

```ts
appearance: {
  theme: 'stripe',
  variables: {
    colorPrimary: '#212121',
    colorBackground: '#F6F3E7',   // 输入框、tab 背景
    colorText: '#212121',
    colorDanger: '#65000B',
    fontFamily: 'Aime',
    spacingUnit: '4px',
    borderRadius: '0px',
  },
  rules: {
    '.Input': { backgroundColor: '#F6F3E7', border: '1px solid #212121' },
    '.Button--primary': { backgroundColor: '#212121', borderRadius: '0px' },
    '.Button--primary:hover': { backgroundColor: '#3a3a3a' },
    // Link 邮箱/OTP 输入框
    '.Input[data-elements-stable-field-name="email"]': { backgroundColor: '#F6F3E7' },
    '.Input[data-elements-stable-field-name="oneTimeCode"]': { backgroundColor: '#F6F3E7' },
  },
}
```

**无法定制的部分：**

- Link 已登录用户的卡片列表容器（白色圆角框）
- Link 品牌 logo 颜色（Stripe 品牌绿 `#00d924`）

---

## 解决方案选项

### 方案一：接受现有样式（推荐短期）

保持 Link 组件的 Stripe 默认样式（白色容器 + 绿色品牌色），不做额外修改。

**优点：** 零开发成本，符合 Stripe 品牌规范  
**缺点：** 与页面主题色有视觉差异

---

### 方案二：禁用 Link（最简单）

```ts
// payment-element-form.tsx
wallets: {
  applePay: 'never',
  googlePay: 'never',
  link: 'never',
}
```

**优点：** 彻底消除白色容器问题  
**缺点：** 用户失去 Link 一键支付能力，影响已有 Link 用户的转化率

---

### 方案三：向 Stripe 反馈（长期）

通过 Stripe Support 提交定制需求，请求开放 Link 容器背景色的 appearance 配置。

> **注意：** `CardElement` 已被 Stripe 官方废弃，Stripe 主动建议迁移至 `PaymentElement`，不应作为备选方案。

---

## 建议

与 UI 设计师对齐以下问题：

1. **是否接受白色 Link 容器**：Stripe 官方不提供覆盖能力，白色容器是 Stripe 的品牌设计
2. **若不接受**：优先考虑方案二（禁用 Link），评估对已有 Link 用户的业务影响
3. **若 Link 对转化率重要**：考虑方案三（CardElement 重构），排进技术债规划

---

## 参考

- [Stripe Appearance API](https://docs.stripe.com/elements/appearance-api)
- [Stripe Link Integration](https://docs.stripe.com/payments/link/add-link-elements-integration)
- [Stripe PaymentElement Layout](https://docs.stripe.com/payments/payment-element#layout)
