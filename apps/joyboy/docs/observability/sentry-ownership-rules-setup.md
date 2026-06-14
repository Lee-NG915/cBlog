# Sentry Issue Ownership Rules 配置指南

> **面向 Sentry 管理员的 Dashboard 操作手册。** 本文档仅涵盖 Dashboard 配置步骤。  
> Confluence 原始页面：[SOP: Sentry Ownership Rules 配置](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914006635)  
> 代码侧的 error_bucket / domain 打标规则见
> [`docs/ai-specs/observability/alert-metrics.md`](../ai-specs/observability/alert-metrics.md)。

## 概述

Sentry 的 Issue Ownership Rules 允许你根据错误的特征（如标签、路径、模块）自动将 Issue 分配给特定的人或团队。

我们的代码会自动为错误添加 `domain`、`priority`、`error_bucket` 标签，然后在 Sentry Dashboard 中配置 Ownership Rules 来自动分配给负责人。

## 工作流程

```
错误发生
  ↓
captureStructuredError 设置 domain 标签，enrichContext 推断 priority
  ↓
beforeSend 执行 classifyErrorBucket（设置 error_bucket 标签）
  ↓
Sentry 接收事件
  ↓
Ownership Rules 匹配
  ↓
自动分配给负责人
  ↓
发送通知
```

## 代码中添加的标签

### 1. domain 标签

标识错误来自哪个业务域（调用 `captureStructuredError` 时显式传入）：

- `domain: payment` - 支付处理
- `domain: checkout` - 结账流程
- `domain: cart` - 购物车操作
- `domain: product` - 产品相关
- `domain: user` - 用户/认证
- `domain: order` - 订单处理
- `domain: search` - 搜索查询
- `domain: cms` - CMS 内容获取
- `domain: wishlist` - 心愿单
- `domain: promotion` - 促销活动

### 2. priority 标签

由 `enrichContext` 根据 domain 自动推断：

- `priority: high` - 高优先级（payment、checkout、user、order）
- `priority: medium` - 中优先级（cart、product、search、promotion）
- `priority: low` - 低优先级（wishlist、cms）

### 3. error_bucket 标签

由 `classifyErrorBucket` 在 `beforeSend` 中自动推断：

- `error_bucket: js_fatal` - TypeError / ReferenceError 等 JS 致命错误
- `error_bucket: api_5xx` - HTTP 5xx 服务端错误
- `error_bucket: api_timeout` - 请求超时（AbortError / ETIMEDOUT）
- `error_bucket: third_party` - 第三方脚本错误（GTM、Klaviyo 等）
- `error_bucket: hydration` - React Hydration 错误
- `error_bucket: unclassified` - 无法分类的错误

## 在 Sentry Dashboard 中配置 Ownership Rules

### 步骤 1: 进入 Project Settings

1. 登录 Sentry Dashboard
2. 选择你的项目（如 `joyboy-web`）
3. 点击左侧菜单的 **Settings** → **Issue Owners**

### 步骤 2: 创建 Ownership Rules

Sentry 支持多种规则语法：

#### 语法 1: 基于标签（推荐）

```
# 支付相关错误分配给 Alice
tags.domain:payment alice@example.com
tags.domain:checkout alice@example.com

# 购物车相关错误分配给 Bob
tags.domain:cart bob@example.com

# 产品相关错误分配给 Charlie
tags.domain:product charlie@example.com

# 用户/认证相关错误分配给 David
tags.domain:user david@example.com

# CMS 相关错误分配给 Eve
tags.domain:cms eve@example.com

# 搜索相关错误分配给 Frank
tags.domain:search frank@example.com

# 基础设施错误
tags.error_bucket:api_5xx infra@example.com
tags.error_bucket:api_timeout infra@example.com
tags.error_bucket:third_party platform@example.com
```

#### 语法 2: 基于路径（代码所有权）

```
# libs/modules/product 目录下的错误分配给 Charlie
path:libs/modules/product/* charlie@example.com

# libs/modules/user 目录下的错误分配给 David
path:libs/modules/user/* david@example.com

# apps/web/app 目录下的错误分配给前端团队
path:apps/web/app/* frontend-team@example.com
```

#### 语法 3: 基于 URL（页面所有权）

```
# PDP 页面错误分配给产品团队
url:*/products/* charlie@example.com

# 购物车页面错误分配给购物车团队
url:*/cart* bob@example.com

# Checkout 页面错误分配给支付团队
url:*/checkout* alice@example.com
```

#### 语法 4: 组合规则

```
# 高优先级的支付错误分配给 Alice 和她的经理
tags.domain:payment tags.priority:high alice@example.com manager@example.com

# API 超时错误分配给基础设施团队
tags.error_bucket:api_timeout infra-team@example.com

# 第三方服务错误分配给平台团队
tags.error_bucket:third_party platform-team@example.com
```

### 步骤 3: 完整配置示例

在 Sentry Dashboard 的 Issue Owners 页面中，添加以下规则：

```
# ============================================================================
# 业务域所有权规则（基于代码中的 domain 标签）
# ============================================================================

# 支付相关错误 - Alice Wang
tags.domain:payment alice.wang@castlery.com
tags.domain:checkout alice.wang@castlery.com

# 购物车相关错误 - Bob Chen
tags.domain:cart bob.chen@castlery.com

# 产品相关错误 - Charlie Li
tags.domain:product charlie.li@castlery.com

# 用户/认证相关错误 - David Zhang
tags.domain:user david.zhang@castlery.com

# CMS 相关错误 - Eve Liu
tags.domain:cms eve.liu@castlery.com

# 搜索相关错误 - Frank Wu
tags.domain:search frank.wu@castlery.com

# 订单相关错误 - Grace Huang
tags.domain:order grace.huang@castlery.com

# ============================================================================
# 代码路径所有权规则（基于文件路径）
# ============================================================================

# Product 模块代码
path:libs/modules/product/* charlie.li@castlery.com

# User 模块代码
path:libs/modules/user/* david.zhang@castlery.com

# Cart 模块代码
path:libs/modules/cart/* bob.chen@castlery.com

# Payment 模块代码
path:libs/modules/payment/* alice.wang@castlery.com

# CMS 模块代码
path:libs/modules/cms/* eve.liu@castlery.com

# Search 模块代码
path:libs/modules/search/* frank.wu@castlery.com

# ============================================================================
# 页面所有权规则（基于 URL）
# ============================================================================

# PDP 页面
url:*/products/* charlie.li@castlery.com

# 购物车页面
url:*/cart* bob.chen@castlery.com

# Checkout 页面
url:*/checkout* alice.wang@castlery.com

# 账户页面
url:*/account* david.zhang@castlery.com

# ============================================================================
# error_bucket 所有权规则
# ============================================================================

# API 5xx 错误 - 基础设施团队
tags.error_bucket:api_5xx infra@castlery.com

# API 超时错误 - 基础设施团队
tags.error_bucket:api_timeout infra@castlery.com

# 第三方服务错误 - 平台团队
tags.error_bucket:third_party platform@castlery.com

# ============================================================================
# 高优先级错误规则（多人通知）
# ============================================================================

# 高优先级支付错误 - 通知 Alice 和她的经理
tags.domain:payment tags.priority:high alice.wang@castlery.com manager@castlery.com
tags.domain:checkout tags.priority:high alice.wang@castlery.com manager@castlery.com

# 高优先级用户错误 - 通知 David 和安全团队
tags.domain:user tags.priority:high david.zhang@castlery.com security@castlery.com

# ============================================================================
# 默认规则（放在最后）
# ============================================================================

# 未分类错误 - 平台团队
* platform@castlery.com
```

### 步骤 4: 测试 Ownership Rules

1. **触发测试错误**：

   ```typescript
   import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

   // 测试支付相关错误
   captureStructuredError(new Error('Test payment error'), {
     domain: BUSINESS_DOMAIN.PAYMENT,
     extra: { test: 'ownership-rules' },
   });
   ```

2. **检查 Sentry Dashboard**：

   - 找到测试错误
   - 查看 **Assignee** 字段，应该自动分配给对应的人
   - 检查该人是否收到通知邮件

3. **调试规则**：
   - 如果没有自动分配，检查规则语法
   - 确保邮箱地址正确
   - 确保用户已加入 Sentry 项目

## Ownership Rules 语法参考

### 基本语法

```
<matcher> <owner1> [owner2] [owner3]
```

### Matcher 类型

| Matcher              | 说明                 | 示例                          |
| -------------------- | -------------------- | ----------------------------- |
| `path:`              | 匹配文件路径         | `path:libs/modules/product/*` |
| `tags.<key>:<value>` | 匹配标签             | `tags.domain:payment`         |
| `url:`               | 匹配 URL 路径        | `url:*/checkout*`             |
| `*`                  | 匹配所有（默认规则） | `* platform@example.com`      |

### 通配符

- `*` - 匹配任意字符
- `**` - 匹配任意路径段

### 示例

```
# 精确匹配
path:libs/modules/product/domain/src/api/product.api.ts owner@example.com

# 目录匹配
path:libs/modules/product/* owner@example.com

# 递归匹配
path:libs/modules/** owner@example.com

# URL 匹配
url:*/products/* owner@example.com
url:*/cart owner@example.com

# 标签匹配
tags.domain:payment owner@example.com
tags.priority:high owner@example.com

# 组合匹配
tags.domain:payment tags.priority:high owner1@example.com owner2@example.com
```

## 通知配置

### 步骤 1: 配置个人通知设置

1. 点击右上角头像 → **User Settings**
2. 选择 **Notifications**
3. 配置通知方式：
   - Email（邮件）
   - Slack（推荐）
   - PagerDuty（紧急情况）

### 步骤 2: 配置 Slack 集成

1. 在 Project Settings 中选择 **Integrations** → **Slack**
2. 连接 Slack workspace
3. 配置 Alert Rules：
   - 高优先级错误 → 发送到 `#alerts-critical`
   - 中优先级错误 → 发送到 `#alerts-medium`
   - 低优先级错误 → 发送到 `#alerts-low`

### 步骤 3: 配置 Alert Rules

在 **Alerts** → **Create Alert** 中创建规则：

```
Alert Name: High Priority Payment Errors
Conditions:
  - tags.domain equals payment
  - tags.priority equals high
Actions:
  - Send notification to #alerts-critical
  - Assign to alice.wang@castlery.com
```

## 最佳实践

### 1. 规则优先级

规则按从上到下的顺序匹配，**第一个匹配的规则生效**。建议顺序：

1. 高优先级组合规则（如 `tags.domain:payment tags.priority:high`）
2. 业务域特定规则（如 `tags.domain:payment`）
3. 路径规则（如 `path:libs/modules/product/*`）
4. URL 规则（如 `url:*/checkout*`）
5. 默认规则（如 `*`）

### 2. 避免规则冲突

```
# ❌ 错误：规则冲突
tags.domain:payment alice@example.com
tags.domain:payment bob@example.com  # 永远不会匹配

# ✅ 正确：多人通知
tags.domain:payment alice@example.com bob@example.com
```

### 3. 使用团队邮箱

```
# 推荐：使用团队邮箱
tags.domain:payment payment-team@example.com

# 而不是：
tags.domain:payment alice@example.com bob@example.com charlie@example.com
```

### 4. 定期审查规则

建议每月审查一次：

- 检查未分配的错误
- 更新离职人员的规则
- 调整规则优先级

## 常见问题

### Q: 错误没有自动分配怎么办？

A: 检查以下几点：

1. 规则语法是否正确
2. 标签是否正确添加（在 Sentry 中查看 Tags）
3. 用户邮箱是否正确
4. 用户是否已加入项目

### Q: 如何分配给多个人？

A: 在规则中列出多个邮箱：

```
tags.domain:payment alice@example.com bob@example.com
```

### Q: 如何临时禁用某个规则？

A: 在规则前添加 `#` 注释：

```
# tags.domain:payment alice@example.com
```

### Q: 规则更新后多久生效？

A: 立即生效，新的错误会使用新规则。

### Q: 如何测试规则？

A: 使用 `captureStructuredError` 触发测试错误，然后在 Sentry 中检查分配情况。

## 相关文档

- [Sentry Issue Routing Guide](./sentry-issue-routing-guide.md)
- [Sentry 官方文档 - Issue Owners](https://docs.sentry.io/product/error-monitoring/issue-owners/)
- [Sentry 官方文档 - Alerts](https://docs.sentry.io/product/alerts/)
