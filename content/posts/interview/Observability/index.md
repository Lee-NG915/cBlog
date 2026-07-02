---
title: Observability 整理
slug: Observability
date: 2026-04-09T17:11:00+08:00
category: notes
tags:
  - Sentry 监控
status: draft
excerpt:
---

以下是对 [Observability 文档库](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914072196/Observability) 及其 **17 个子文档** 的提炼，已整理成可直接用于**项目记录**和**技术复盘**的表达方式。

---

## 一、30 秒快速概述（技术复盘开场）

> 我在 Castlery Joyboy 多区域电商前端项目中，参与/使用了一套完整的 **Observability 工程体系**。核心目标是：**在用户感知之前发现问题，并把正确的信息路由给正确的人**。
>
> 体系分三层：**Sentry** 负责应用错误（10 条互斥告警）、**Datadog** 负责流量/指标（补 checkout/payment/cart 重构盲区）、未来规划 **ATC 等业务指标主动监控**。
>
> 技术上自研 `@castlery/observability` 包，统一 `captureStructuredError` 上报，自动打 `domain / priority / error_bucket / page_type` 标签，驱动告警、Ownership 自动分配和 Runbook 响应。并用 **Harness 工程范式**（Spec → ESLint → E2E → CI Gate → 覆盖率评估 → AI 自动修复）把规范从文档落到代码和流程。

---

## 二、体系全景（技术复盘「介绍一下这套系统」）

### 1. 三层监控架构

| 层级      | 工具            | 职责                                                  | 状态      |
| --------- | --------------- | ----------------------------------------------------- | --------- |
| 应用错误  | Sentry          | JS 错误、Server Action、API 失败、Hydration、主动上报 | ✅ 已上线 |
| 流量/指标 | Datadog RUM+APM | PDP/PLP 流量、核心 API 调用量波动                     | ✅ 已接入 |
| 业务链路  | Sentry 手动上报 | ATC 成功率等                                          | 🔲 规划中 |

**边界决策（可体现架构思维）：**

- Middleware / Edge **永久不上报 Sentry**（每次请求都过，噪音+成本高）
- checkout / payment / cart **尚未迁入 Joyboy**，Sentry 无覆盖，**Datadog 兜底**
- Casa SDK 错误在 `beforeSend` **直接 drop**（Casa 自有 Sentry 项目）

### 2. 核心数据流

```
captureStructuredError(error, { domain })
  → enrichContext()        // 自动推断 priority / severity
  → beforeSend()           // classifyErrorBucket → error_bucket
  → Sentry 事件           // domain · page_type · error_bucket · priority
  → 10 条互斥告警         // Sev-1~4 → Slack/Teams → Runbook
  → Ownership Rules        // 自动 assign 负责人
```

### 3. 包架构（`@castlery/observability`）

```
monitoring/     ← 平台无关业务抽象（BUSINESS_DOMAIN、PAGE_TYPES）
sentry/         ← Sentry 适配层
  capture/ · contexts/ · errors/error-bucket.ts · tracing/
  hooks/web/client-before-send.ts
  components/SentryContextProvider
```

**三端入口：**

- `@castlery/observability` — 类型/轻量
- `@castlery/observability/client` — `cLog()`、Client Component
- `@castlery/observability/server` — `sLog()` pino、RSC/Server Action

---

## 三、10 条互斥告警（技术复盘重点）

**设计原则：** 每条规则用 `!page_type:*` / `!domain:*` / `!error_bucket:*` 排除更高优先级范围 → **同一 issue 只触发一条告警，避免告警风暴**。

| Sev | 告警                   | 核心条件                                    | 阈值           |
| --- | ---------------------- | ------------------------------------------- | -------------- |
| 1   | PDP Issues             | `page_type:pdp !third_party !unclassified`  | >20/5min       |
| 1   | PLP Issues             | `page_type:plp !third_party !unclassified`  | >20/5min       |
| 1   | CART Alert             | `page_type:cart !third_party !unclassified` | >20/5min       |
| 2   | Account/User           | `domain:user` 排除上层                      | >20/15min      |
| 2   | Order                  | `domain:order` 排除上层                     | >20/15min      |
| 2   | API Errors             | `api_5xx OR api_timeout` 排除上层           | >20/15min      |
| 2   | Upstream Errors        | `upstream_5xx OR upstream_timeout` 排除上层 | >20/15min      |
| 3   | Fatal/Error Level      | `level:fatal OR error` 排除上层             | >30/15min      |
| 4   | Warning/Log            | 排除上层 + `!unclassified`                  | new issue only |
| 4   | Unclassified New Issue | `error_bucket:unclassified`                 | new issue only |

**关键区分（技术复盘补充）：**

- `api_5xx/timeout` = **浏览器 fetch** 失败
- `upstream_5xx/timeout` = **服务端**调上游失败
- `app_error` = `captureStructuredError` 主动上报（mechanism 标识），无专属告警，按 level 路由到 Sev-3/4

---

## 四、标签体系（三标签技术复盘题）

| 标签           | 谁设置             | 作用                           |
| -------------- | ------------------ | ------------------------------ |
| `domain`       | 开发者显式传入     | 业务归属、推断 priority        |
| `priority`     | enrichContext 自动 | high/medium/low → Sentry level |
| `error_bucket` | beforeSend 自动    | 驱动哪条告警规则               |

**Client 分桶优先级：** hydration → third_party → api_5xx → api_timeout → js_fatal → app_error → unclassified

**Hard Rules（10 条，AGENTS.md 强制）：**

1. Middleware/Edge 禁止 Sentry capture
2. 每个 `page.tsx` 必须 `setGlobalSentryContext`
3. Layout 用 `SentryContextProvider`，不直接调 setGlobal
4. Async layout 有 await 时，await 前先 setGlobal
5. Server Action 两路径：throw → `withServerActionInstrumentation`；降级 return {} → `captureStructuredError`
6. 禁止裸 `Sentry.captureException`
7. DY actions 不硬编码 domain
8. 禁用 `PAGE_TYPES.SEARCH`（用 PLP + domain:search）
9. checkout/payment/cart 暂不插桩
10. `error-bucket.ts` 是第三方域名唯一来源

---

## 五、Harness 工程范式（差异化亮点）

这是文档体系中最适合写进项目记录的**工程治理**故事：

| 组件       | 实现                                             | 作用         |
| ---------- | ------------------------------------------------ | ------------ |
| Spec       | `docs/ai-specs/observability/`                   | 权威规范     |
| Static     | `eslint-plugin-observability` 8 条规则           | 编写时拦截   |
| Dynamic    | beforeSend 单测 + Playwright E2E 5 页面 tag 验证 | 运行时验证   |
| Gate       | lint-staged + CI + CODEOWNERS                    | 合并前阻断   |
| Feedback   | IDE 红线 + PR comment                            | 开发者反馈   |
| Evaluation | `coverage-scan.sh` + baseline.json               | 量化合规率   |
| Knowledge  | AGENTS.md + Confluence SOP                       | 可维护性     |
| Evolution  | CONTRIBUTING checklist                           | 规则安全演进 |

**ESLint 8 条规则：** no-bare-sentry-capture、no-sentry-in-edge、page-requires-sentry-context、layout-requires-sentry-provider、async-layout-early-context、no-deprecated-page-type-search、no-double-reporting、no-hardcoded-skip-sentry

**AI 自动化闭环：**

- `/alert-harness fix --with-pr`：拉 Sentry issues → 修复 → E2E → PR + ClickUp
- 每周一 Local Routine：`sentry-biz-fix`（业务错误）/ `sentry-baseline-fix`（合规问题）
- n8n 周报：Teams 摘要 + ClickUp 详细列表（New/Resolved/Noise/MTTR/Backlog）

---

## 六、子文档速查表

| 文档                                                                                          | 核心内容                                                                                 |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Observability 根节点](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914072196)        | 索引页：架构、10 告警、包结构、命令                                                      |
| [系统架构总览](https://castlery.atlassian.net/wiki/spaces/EC/pages/3971416153)                | 全景图、Harness 8 组件、覆盖边界                                                         |
| [Next.js 错误处理 SOP](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914236033)        | SSR/Client/Server Action/API Route 处理路径                                              |
| [Issue 自动标记 SOP](https://castlery.atlassian.net/wiki/spaces/EC/pages/3913416809)          | domain/priority/error_bucket 详解                                                        |
| [Ownership Rules SOP](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914006635)         | Sentry 自动分配规则配置                                                                  |
| [告警覆盖率 & TODO](https://castlery.atlassian.net/wiki/spaces/EC/pages/3926523907)           | Gap 已全部关闭、page_type 覆盖矩阵                                                       |
| [ESLint 规则 v2.2](https://castlery.atlassian.net/wiki/spaces/EC/pages/3945922636)            | 8 条 AST 规则、版本演进                                                                  |
| [Sentry E2E 本地抓取](https://castlery.atlassian.net/wiki/spaces/EC/pages/3966697512)         | mock ingest + 5 页面 tag 验证                                                            |
| [告警处理 & 周报 SOP](https://castlery.atlassian.net/wiki/spaces/EC/pages/4040327195)         | Archive/PR fixes/ClickUp 三条路径                                                        |
| [AI 自动修复周任务](https://castlery.atlassian.net/wiki/spaces/EC/pages/4063592499)           | biz-fix / baseline-fix routine 配置                                                      |
| [前端 Observability 体系分享](https://castlery.atlassian.net/wiki/spaces/EC/pages/4036886531) | 48min 内部分享稿（架构+实践+Harness）                                                    |
| **9 个 Runbook**                                                                              | Sev-1 Cart / Sev-2 API·Upstream·Account·Order / Sev-3 Fatal / Sev-4 Warning·Unclassified |

**Runbook 通用结构：** 告警概述 → Triage 视图 → 根因分类 → 影响范围（region/domain/release）→ 处置决策树 → 升级路径

---

## 七、项目记录 Bullet 模板（按参与深度选用）

### 架构/平台建设向

- 参与 Joyboy 多区域电商前端 **Observability 体系**建设：自研 `@castlery/observability` 包，统一结构化错误上报，实现 `domain → priority → error_bucket` 自动标签链路
- 设计 **10 条互斥 Sentry 告警规则**（Sev-1~4），通过 page_type/domain/error_bucket 分层排除，避免同一 issue 重复告警
- 落地 **Harness 工程范式**：ESLint 8 条静态规则 + Playwright E2E tag 验证 + CI Gate + 覆盖率 baseline，将 Observability 规范从文档自动化到 PR 合并前

### 开发实践向

- 制定 Next.js App Router **错误处理规范**：RSC 用 `setGlobalSentryContext`、Layout 用 `SentryContextProvider`、Server Action 双路径（throw/降级）
- 实现 client/server 双端 **error_bucket 自动分类**（hydration/third_party/api_5xx/upstream_5xx/app_error 等），驱动告警路由和 Ownership 自动分配
- 搭建 Sentry E2E 本地验证链路（mock ingest + envelope 拦截），覆盖 PDP/PLP/Home/Account 等 5 核心页面 tag 合规

### 运维/治理向

- 建立 Sentry 告警 **闭环 SOP**：Archive 噪音 / PR `fixes ISSUE-ID` 快速修复 / ClickUp 排期，配合 n8n 每周一自动周报（MTTR/Noise Rate/Backlog 追踪）
- 引入 **AI 自动修复** Local Routine（alert-harness + 周任务），自动分析 live Sentry issues、修复代码、创建 PR 并关联 ClickUp

---

## 八、技术复盘问题速记

**Q：为什么 Middleware 不上报 Sentry？**  
A：Edge 每次请求都经过，上报会产生大量噪音和高成本；架构上永久静默，仅 stdout logger，流量监控靠 Datadog。

**Q：page.tsx 和 layout 都要设 context，为什么？**  
A：RSC concurrent rendering 下 layout 和 page 在独立 async context 执行，顺序不保证；page.tsx 必须独立调用 `setGlobalSentryContext` 写入 isolation scope。

**Q：Server Action 为什么有两条路径？**  
A：throw 路径用 `withServerActionInstrumentation`（会 re-throw）；降级路径必须 return {}，不能用 instrumentation（会强制 re-throw），改用 `captureStructuredError`。

**Q：互斥告警怎么设计？**  
A：高 Sev 规则先匹配 page_type/domain；低 Sev 规则用 `!page_type:pdp` 等排除已被上层覆盖的范围，保证一条 issue 只进一条告警。

**Q：unclassified 告警的意义？**  
A：兜底 bucket，每个新 unclassified issue 都是更新 `error-bucket.ts` 分类规则的信号，防止第三方脚本/新错误模式成为盲区。

**Q：怎么验证 Observability 改动没破坏 tag？**  
A：本地跑 `pnpm e2e:sentry-tags:server-capture`，mock ingest 抓 client+server envelope，看 combined 简表的 page_type/domain/error_bucket。

**Q：Sentry 和 Datadog 怎么分工？**  
A：Sentry = 错误发生时告警；Datadog = 流量/指标异常（如 AddToCart 调用量骤降），互补覆盖 checkout/payment/cart 等 Sentry 暂未覆盖模块。

---

## 九、一句话项目描述（放项目记录项目经历开头）

> 负责/参与 Castlery Joyboy 前端 **Observability 工程体系**：基于 Sentry + Datadog 三层监控，自研结构化错误上报 SDK，设计 10 条互斥告警 + 9 套 Runbook + Ownership 自动路由；并通过 ESLint 插件、E2E tag 验证、CI Gate 和 AI 自动修复 Routine 实现规范的全链路自动化治理。

---

如果你希望进一步个性化，我可以根据你实际参与的 PR/模块（例如 INP 分析、首屏时序、Fortress 优化等）把上述 bullets 改成**只写你亲手做过**的版本，避免技术复盘被展开时不一致。
