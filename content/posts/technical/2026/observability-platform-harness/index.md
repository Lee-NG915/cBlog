---
title: 前端可观测性平台：Sentry 分桶 + ESLint 规则 + Harness 八组件范式
slug: observability-platform-harness
date: 2026-06-03
updatedAt: 2026-06-05
category: technical
tags:
  - Observability
  - Sentry
  - ESLint
  - Platform Engineering
status: draft
excerpt: 复盘电商 Web 可观测性体系建设：三层监控分工、error_bucket 分桶路由、ESLint 静态门禁与 Harness 八组件范式，把「报错能找对人」做成工程能力。
---

# 前言

单点接入 Sentry 不难，难的是**上百人协作时告警不失控**。我参与搭建了 Web 端的可观测性平台——目标不是堆工具，而是：**在用户感知前发现问题，并把正确信息路由给正确的人**。这篇与 [交易链路可观测性](/posts/transaction-observability-tech-plan/) 互补：那篇讲结账漏斗 15 阶段模型，这篇讲**平台级监控分层与合规门禁**。

---

## 三层监控

| 层 | 工具 | 覆盖 |
| --- | --- | --- |
| 应用错误 | Sentry | JS/Server/API 异常，10 条互斥告警规则 |
| 流量性能 | APM/RUM | PDP/PLP 流量、API 量、响应时间突变 |
| 核心链路（规划） | 自定义指标 | ATC 成功率等主动上报 |

**互斥告警设计**：Sev-1 页面稳定性（PDP/PLP/Cart）与 Sev-3 错误级别告警互斥，避免同一 issue 触发多条 Oncall。

---

## 错误生命周期

```
captureStructuredError(error, { domain: CART })
  → enrichContext()      # 注入 page_type、priority
  → beforeSend()         # classifyErrorBucket
  → Sentry（带 domain · page_type · error_bucket）
  → Sev-1/2/3/4 路由 → Runbook
```

`error_bucket` 是第三方域名的单一分类来源——支付、地图、推荐 SDK 的噪声错误进独立桶，不污染核心业务告警。

---

## Harness 八组件范式（v2.2）

把可观测性当成**可演进产品**来建：

| # | 组件 | 回答的问题 |
| --- | --- | --- |
| 1 Spec | 正确长什么样？ | 权威规范文档 |
| 2 Static | 编写时能发现吗？ | 自定义 ESLint 插件（8 条 AST 规则） |
| 3 Dynamic | 运行时能验证吗？ | beforeSend 单测 + E2E 标签断言 |
| 4 Gate | 合并前能拦住吗？ | lint-staged + CI gate |
| 5 Feedback | 正确的人收到反馈吗？ | IDE 红线 + PR comment |
| 6 Evaluation | 合规率多少？ | coverage scan + baseline |
| 7 Knowledge | 新人能维护吗？ | AGENTS 规范 + INDEX |
| 8 Evolution | 规则怎么安全改？ | Change Protocol + 版本 bump |

分三期落地：Phase 1 Spec+Static+Gate → Phase 2 Knowledge → Phase 3 Dynamic+Evaluation。

---

## 覆盖边界

| 区域 | 错误监控 | 说明 |
| --- | --- | --- |
| Web App | ✅ | 双重覆盖 |
| Checkout/Payment | 重构中 | 流量监控兜底 |
| Edge Middleware | 永久静默 | Edge 不允许上报 Sentry |
| POS | 独立体系 | 不在 Web 范围 |

---

## 与交易可观测性的关系

- **平台层**（本文）：分桶、告警路由、编码规范、合规门禁
- **业务层**（交易文）：traceId 贯穿结账 15 阶段、SLO 定义

两层叠加，面试时可以讲清「平台能力」和「业务落地」的分工。

---

## 关联阅读

- [交易链路可观测性](/posts/transaction-observability-tech-plan/)
- [HTTP 错误处理策略](/posts/http-error-handling-strategy/)
