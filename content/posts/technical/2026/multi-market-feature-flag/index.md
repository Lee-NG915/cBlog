---
title: 多市场电商 Feature Flag：三层特性模型与 DDD 适配层
slug: multi-market-feature-flag
date: 2026-05-24
updatedAt: 2026-06-03
category: technical
tags:
  - Feature Flag
  - DDD
  - Multi-market
  - Architecture
status: draft
excerpt: 复盘跨境电商 Monorepo 的多市场特性管理：业务特性、市场差异、动态开关三层模型，以及 DomainFeatureService 如何避免领域层被基础设施污染。
---

# 前言

多市场电商最容易失控的点是：**把市场差异写成满屏 if-else**。我参与了功能特性管理体系的设计，把特性分成三层，并用 DDD 边界约束 Feature Flag 的引用方式——领域层只认识「能力接口」，不认识「开关实现」。

---

## 三层特性模型

| 层级           | 变更频率 | 示例                        | 管理方式            |
| -------------- | -------- | --------------------------- | ------------------- |
| 业务功能特性   | 低       | 订单计价、库存扣减          | 领域模型本身        |
| 市场差异化特性 | 中       | 税率、支付方式、物流规则    | 策略模式 + 市场工厂 |
| 动态功能开关   | 高       | 新 UI 灰度、A/B、第三方服务 | Feature Flag 平台   |

**关键决策**：只有后两类需要额外治理；核心业务特性应沉淀在领域层，不额外挂开关。

---

## 分层落位

```
领域层
 ├── MarketStrategy（US / EU / SG / CA …）
 ├── MarketFactory
 └── DomainFeatureService  ← 统一 Feature API

基础设施层
 └── featureManager / monorepo-features
```

**DomainFeatureService** 是适配层：领域模块通过它查询「当前市场是否启用某能力」，内部再调 Feature Flag 实现。避免 `order/domain` 直接 import 基础设施包——那是 DDD 的大忌。

---

## Feature Flag 适用场景

- 新功能灰度发布（按市场、按百分比）
- A/B 实验与第三方服务切换
- 紧急降级（支付渠道故障时切备用）

**不适用**：核心业务规则（「满减怎么算」）——那应该进 MarketStrategy，而不是开关。

---

## Monorepo 复用

Feature Flag 包放在基础设施层，Web/POS/BFF(Backend-for-Frontend 中间层) 共享。市场策略实现放在各 `modules/*/domain`，新增市场 = 新 Strategy 类 + 配置，而不是复制整站。

---

## 关联阅读

- [跨境电商 i18n 方案](/posts/cross-border-i18n-strategy/)（草稿）
- [企业级电商架构重构](/posts/ecommerce-architecture-redesign/)
