# Sentry Issue 自动标记指南

> **面向开发者的操作指南。** 本文档解释 domain 标签打法和 Dashboard 配置。  
> Confluence 原始页面：[SOP: Sentry Issue 自动标记指南](https://castlery.atlassian.net/wiki/spaces/EC/pages/3913416809)  
> 完整架构决策与硬规则（AI Agent 权威来源）：
> [`docs/ai-specs/observability/alert-metrics.md`](../ai-specs/observability/alert-metrics.md) ·
> [`docs/ai-specs/observability/sentry-practices.md`](../ai-specs/observability/sentry-practices.md)  
> 两者若有冲突，以 ai-specs 为准。

本文档说明代码中如何为错误添加 `domain` 标签，以及这些标签如何用于 Sentry Dashboard 的自动分配。

## 概述

我们通过以下机制为 Sentry 错误打标签：

1. **domain** - 调用 `captureStructuredError`（或 domain 快捷函数）时显式传入，标识错误所属业务域
2. **priority / severity** - 由 `enrichContext` 根据 domain 自动推断，无需手动设置
3. **error_bucket** - 由 `classifyErrorBucket` 在 `beforeSend` 中自动推断，用于错误分类

这些标签会被 **Sentry Dashboard 的 Issue Ownership Rules** 使用，自动将错误分配给负责人。

> **重要**：错误的自动分配（分配给谁）是在 Sentry Dashboard 中配置的，不是在代码中。详见 [Sentry Ownership Rules 配置指南](./sentry-ownership-rules-setup.md)。

## 工作流程

```
错误发生
  ↓
captureStructuredError(error, { domain: BUSINESS_DOMAIN.PAYMENT })
  ↓
enrichContext 自动推断 severity/priority（基于 domain）
  ↓
beforeSend 执行 classifyErrorBucket（设置 error_bucket 标签）
  ↓
Sentry 接收事件（携带 domain、priority、error_bucket 标签）
  ↓
Ownership Rules 匹配 domain 标签
  ↓
自动分配给负责人
```

## Domain 标签值

`BUSINESS_DOMAIN` 常量定义了所有合法的 domain 值，`enrichContext` 会根据 domain 自动推断 priority 和 severity：

| 常量                        | 标签值      | 自动推断 priority | 自动推断 severity | Sentry level |
| --------------------------- | ----------- | ----------------- | ----------------- | ------------ |
| `BUSINESS_DOMAIN.PAYMENT`   | `payment`   | high              | critical          | fatal        |
| `BUSINESS_DOMAIN.CHECKOUT`  | `checkout`  | high              | critical          | fatal        |
| `BUSINESS_DOMAIN.USER`      | `user`      | high              | critical          | fatal        |
| `BUSINESS_DOMAIN.ORDER`     | `order`     | high              | high              | error        |
| `BUSINESS_DOMAIN.CART`      | `cart`      | medium            | medium            | warning      |
| `BUSINESS_DOMAIN.PRODUCT`   | `product`   | medium            | medium            | warning      |
| `BUSINESS_DOMAIN.SEARCH`    | `search`    | medium            | medium            | warning      |
| `BUSINESS_DOMAIN.PROMOTION` | `promotion` | medium            | medium            | warning      |
| `BUSINESS_DOMAIN.CMS`       | `cms`       | low               | low               | log          |

> **说明**：`severity` 使用 `BusinessSeverity` 常量（`critical/high/medium/low`），通过 `SEVERITY_TO_SENTRY_LEVEL` 映射为 Sentry 原生 level（`fatal/error/warning/log`）。`priority` 存储在 Sentry 自定义 `business` context 中，用于 Dashboard 过滤，不等同于 Sentry 原生 Issue Priority（后者由 event level 自动推断）。

## 各业务域的标记方式

### 1. 支付相关错误 (domain: payment)

**代码中如何标记：**

```typescript
import { capturePaymentError } from '@castlery/observability/server';

capturePaymentError(error, {
  extra: { orderId: '123', paymentMethod: 'credit_card' },
});
```

**自动推断的标签：** `domain: payment` · `priority: high` · `severity: critical` · `level: fatal`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:payment alice.wang@castlery.com
```

### 2. 结账相关错误 (domain: checkout)

**代码中如何标记：**

```typescript
import { captureCheckoutError } from '@castlery/observability/server';

captureCheckoutError(error, { extra: { cartTotal: 399.99, itemCount: 3 } });
```

**自动推断的标签：** `domain: checkout` · `priority: high` · `severity: critical` · `level: fatal`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:checkout alice.wang@castlery.com
```

### 3. 购物车相关错误 (domain: cart)

**代码中如何标记：**

```typescript
import { captureCartError } from '@castlery/observability/server';

captureCartError(error, { extra: { productId: '456', quantity: 2 } });
```

**自动推断的标签：** `domain: cart` · `priority: medium` · `severity: medium` · `level: warning`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:cart bob.chen@castlery.com
```

### 4. 产品相关错误 (domain: product)

**代码中如何标记：**

```typescript
import { captureProductError } from '@castlery/observability/server';

captureProductError(error, { extra: { productId: '789', productSku: 'SKU-123' } });
```

**自动推断的标签：** `domain: product` · `priority: medium` · `severity: medium` · `level: warning`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:product charlie.li@castlery.com
path:libs/modules/product/* charlie.li@castlery.com
```

### 5. 用户/认证相关错误 (domain: user)

**代码中如何标记：**

```typescript
import { captureUserError } from '@castlery/observability/server';

captureUserError(error, { extra: { userId: 'user_123' } });
```

**自动推断的标签：** `domain: user` · `priority: high` · `severity: critical` · `level: fatal`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:user david.zhang@castlery.com
path:libs/modules/user/* david.zhang@castlery.com
```

### 6. 订单相关错误 (domain: order)

**代码中如何标记：**

```typescript
import { captureOrderError } from '@castlery/observability/server';

captureOrderError(error, { extra: { orderId: '123', orderStatus: 'pending' } });
```

**自动推断的标签：** `domain: order` · `priority: high` · `severity: high` · `level: error`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:order grace.huang@castlery.com
path:libs/modules/order/* grace.huang@castlery.com
```

### 7. CMS 相关错误 (domain: cms)

**代码中如何标记：**

```typescript
import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

captureStructuredError(error, { domain: BUSINESS_DOMAIN.CMS });
```

**自动推断的标签：** `domain: cms` · `priority: low` · `severity: low` · `level: log`

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:cms eve.liu@castlery.com
path:libs/modules/cms/* eve.liu@castlery.com
```

### 8. 搜索相关错误 (domain: search)

**代码中如何标记：**

```typescript
import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

captureStructuredError(error, { domain: BUSINESS_DOMAIN.SEARCH });
```

**自动推断的标签：** `domain: search` · `priority: medium` · `severity: medium` · `level: warning`

> **注意**：整个 PLP 模块（categories、collections、sales、search 结果页）均归属 `BUSINESS_DOMAIN.SEARCH`，由 `libs/modules/search` 驱动。

**在 Sentry Dashboard 中配置分配：**

```
tags.domain:search frank.wu@castlery.com
path:libs/modules/search/* frank.wu@castlery.com
```

### 9. error_bucket 分类（beforeSend 自动推断）

`classifyErrorBucket` 在 `beforeSend` 中按以下规则自动设置 `error_bucket` 标签，无需手动设置：

| error_bucket   | 触发条件                                              |
| -------------- | ----------------------------------------------------- |
| `hydration`    | React Hydration failed 相关消息                       |
| `api_5xx`      | HTTP 5xx 状态码或错误消息                             |
| `api_timeout`  | AbortError / timeout / ETIMEDOUT                      |
| `third_party`  | stack frame 来自第三方脚本（GTM、Klaviyo 等）         |
| `js_fatal`     | TypeError / ReferenceError / RangeError / SyntaxError |
| `unclassified` | 不满足以上条件                                        |

**在 Sentry Dashboard 中配置分配：**

```
tags.error_bucket:api_5xx infra@castlery.com
tags.error_bucket:api_timeout infra@castlery.com
tags.error_bucket:third_party platform@castlery.com
```

## 如何在 Sentry Dashboard 中配置自动分配

详细步骤请参考：[Sentry Ownership Rules 配置指南](./sentry-ownership-rules-setup.md)

### 快速示例

在 Sentry Dashboard 的 **Settings** → **Issue Owners** 中添加规则：

```
# 基于 domain 标签分配
tags.domain:payment alice.wang@castlery.com
tags.domain:checkout alice.wang@castlery.com
tags.domain:cart bob.chen@castlery.com
tags.domain:product charlie.li@castlery.com
tags.domain:user david.zhang@castlery.com
tags.domain:cms eve.liu@castlery.com
tags.domain:search frank.wu@castlery.com
tags.domain:order grace.huang@castlery.com

# 基于代码路径分配
path:libs/modules/product/* charlie.li@castlery.com
path:libs/modules/user/* david.zhang@castlery.com
path:libs/modules/cart/* bob.chen@castlery.com

# 基于 error_bucket 分配
tags.error_bucket:api_5xx infra@castlery.com
tags.error_bucket:api_timeout infra@castlery.com
tags.error_bucket:third_party platform@castlery.com

# 高优先级错误多人通知
tags.domain:payment tags.priority:high alice.wang@castlery.com manager@castlery.com

# 默认规则（放在最后）
* platform@castlery.com
```

## 如何测试标记

### 1. 触发测试错误

```typescript
import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

captureStructuredError(new Error('Test payment error'), {
  domain: BUSINESS_DOMAIN.PAYMENT,
  extra: { test: 'payment-tagging' },
});
```

### 2. 在 Sentry Dashboard 中验证

1. 打开 Sentry Dashboard
2. 找到测试错误
3. 检查 **Tags** 标签页，确认以下标签：
   - `domain`: 应该是 `payment`
   - `priority`: 应该是 `high`
4. 检查 **Assignee** 字段，应该自动分配给配置的负责人

## 如何添加新的业务域

**无需修改 `beforeSend` 或任何配置文件**，domain 通过调用 `captureStructuredError` 时显式传入。

### 1. 使用已有的 BUSINESS_DOMAIN 常量

```typescript
import { captureOrderError, captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

// 使用 domain 快捷函数
captureOrderError(error, { extra: { orderId: '123' } });

// 或通用函数
captureStructuredError(error, { domain: BUSINESS_DOMAIN.ORDER });
// priority 和 severity 自动推断，无需手动设置
```

### 2. 如需添加全新的业务域

在 `libs/shared/observability/src/lib/sentry/contexts/domains.ts` 中添加新常量，并在 `libs/shared/observability/src/lib/sentry/contexts/priorities.ts` 中配置对应的 `DOMAIN_SEVERITY` 和 `DOMAIN_PRIORITY`。

### 3. 在 Sentry Dashboard 中配置分配

```
tags.domain:order grace.huang@castlery.com
path:libs/modules/order/* grace.huang@castlery.com
```

## 标签总结

| 标签           | 可能的值                                                              | 来源                                             |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| `domain`       | payment, checkout, cart, product, user, order, cms, search, promotion | 调用 `captureStructuredError` 时显式传入         |
| `priority`     | high, medium, low                                                     | `enrichContext` 根据 domain 自动推断             |
| `error_bucket` | js_fatal, api_5xx, api_timeout, third_party, hydration, unclassified  | `classifyErrorBucket` 在 `beforeSend` 中自动推断 |

## 相关文档

- [Sentry Ownership Rules 配置指南](./sentry-ownership-rules-setup.md) - 详细说明如何在 Sentry Dashboard 中配置自动分配
- [Next.js 错误处理流程](./error-handling-flow.md)
