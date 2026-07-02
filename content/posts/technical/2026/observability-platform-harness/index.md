---
title: 前端可观测性平台：Sentry 分桶 + ESLint 规则 + Harness 八组件范式
slug: observability-platform-harness
date: 2026-03-23
updatedAt: 2023-06-24
category: technical
tags:
  - Observability
  - Sentry
  - ESLint
  - Platform Engineering
status: published
excerpt: 复盘电商 Web 可观测性体系建设：三层监控分工、error_bucket 分桶路由、ESLint 静态门禁与 Harness 八组件范式，把「报错能找对人」做成工程能力。
---

# 前言

单点接入 Sentry 不难，难的是**多人协作时告警不失控**。我参与搭建了 Web 端的可观测性平台——目标不是堆工具，而是：**在用户感知前发现问题，并把正确信息路由给正确的人**。

这篇与 [交易链路可观测性](/posts/transaction-observability-tech-plan/) 互补：那篇讲结账漏斗 15 阶段模型，这篇讲**平台级监控分层与合规门禁**。

---

## 阅读主线

这篇对应 Sentry 分桶、Datadog 边界、Ownership 路由、Runbook 和 AI 修复进入 PR 的治理思路。重点是平台层负责标准化采集、分类和路由，业务层只传递上下文；AI 的角色是生成可 review 的修复建议，不是自动上线。

## 三层监控分工

| 层       | 工具       | 覆盖                               |
| -------- | ---------- | ---------------------------------- |
| 应用错误 | Sentry     | JS / Server / API 异常             |
| 流量性能 | APM / RUM  | 核心页面流量、API 量、响应时间突变 |
| 核心链路 | 自定义指标 | 加购成功率等主动上报               |

**互斥告警设计**：页面稳定性告警与通用错误级别告警互斥，避免同一 issue 触发多条 Oncall。

---

## 错误生命周期

```text
captureStructuredError(error, { domain: CART })
  → enrichContext()      # 注入 page_type、priority
  → beforeSend()         # classifyErrorBucket
  → Sentry（带 domain · page_type · error_bucket）
  → 按严重级别路由 → Runbook
```

`error_bucket` 是第三方错误的单一分类来源——支付、地图、推荐 SDK 的噪声进独立桶，不污染核心业务告警。这是我推动分桶的核心原因：Oncall 打开 Sentry 时，第一眼应看到「是不是我们的代码」，而不是被第三方脚本淹没。

---

## Harness 八组件范式

把可观测性当成**可演进产品**来建，而不是一次性接入任务：

| #            | 组件                 | 回答的问题                     |
| ------------ | -------------------- | ------------------------------ |
| 1 Spec       | 正确长什么样？       | 权威规范文档                   |
| 2 Static     | 编写时能发现吗？     | 自定义 ESLint 插件             |
| 3 Dynamic    | 运行时能验证吗？     | beforeSend 单测 + E2E 标签断言 |
| 4 Gate       | 合并前能拦住吗？     | lint-staged + CI gate          |
| 5 Feedback   | 正确的人收到反馈吗？ | IDE 红线 + PR comment          |
| 6 Evaluation | 合规率多少？         | coverage scan + baseline       |
| 7 Knowledge  | 新人能维护吗？       | 规范索引 + 贡献指南            |
| 8 Evolution  | 规则怎么安全改？     | Change Protocol + 版本 bump    |

我按三期落地：先 Spec + Static + Gate（能拦住错误写法），再补 Knowledge（新人能接手），最后 Dynamic + Evaluation（能量化合规率）。

**原则**：AI 和 Prompt 不能替代门禁——Hard Rules 必须下沉到 ESLint 和 CI。

---

## 平台层 vs 业务层

| 层级   | 本文（平台）             | 交易可观测性文（业务）    |
| ------ | ------------------------ | ------------------------- |
| 关注点 | 分桶、告警路由、编码规范 | traceId 贯穿 15 阶段、SLO |
| 受众   | 全体前端                 | 结账 / 支付模块           |
| 价值   | 报错能找对人             | 单笔交易能串起来          |

两层叠加，才能从「有监控」升级到「能回答业务问题」。

---

## 我的思考

### 为什么不从零自建 APM

工具已经有了，缺的是**共同语言和门禁**。在 Sentry + Grafana 之上建语义层和 ESLint 规则，投入产出比远高于换一个全新平台。

### Edge Runtime 的观测边界

Edge Middleware 有运行时限制，部分上报能力不可用。我的处理是：Middleware 只做鉴权预判，业务埋点和错误上报放在 App Router 层——观测点和执行边界对齐，而不是强行在 Edge 打补丁。

---

## 关联阅读

- [交易链路可观测性](/posts/transaction-observability-tech-plan/)
- [HTTP 错误处理策略](/posts/http-error-handling-strategy/)
- [工程实践札记索引](/posts/engineering-practice-hub/)
