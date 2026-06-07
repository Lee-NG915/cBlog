---
confluence_id: "3971416153"
title: "Observability 系统架构总览"
status: current
parent_id: "3914072196"
depth: 2
domain: observability
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3971416153
local_joyboy_doc: null
blog_post: observability-platform-harness
exported_at: "2026-06-05"
source: "Atlassian MCP — Joyboy subtree (not in 设计文档汇总 batch)"
---

# Observability 系统架构总览

> 本页提供 Joyboy Web 可观测性体系的高层级全景视图，适合新成员快速建立整体认知，或向产品/主管层说明体系设计思路。

## 系统定位

可观测性体系的目标是：**在用户感知之前发现问题，并将正确的信息路由到正确的人**。

体系由三层监控构成：

- **应用错误监控（Sentry）**：JS 错误、Server 异常、API 失败，10 条互斥告警规则
- **流量/性能监控（Datadog）**：PDP/PLP 流量、核心 API 调用量、波动告警、RUM + APM
- **核心链路主动监控（规划中）**：ATC 成功率等核心业务指标

（正文其余部分见博客迁移稿 `observability-platform-harness`）
