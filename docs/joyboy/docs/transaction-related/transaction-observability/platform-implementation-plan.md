# 平台侧实施任务拆分

- 作者：Codex
- 日期：2026-05-25
- 适用范围：`checkout` + `payment`
- 目标平台：Sentry + Grafana
- 关联文档：
  - `grafana-dashboard-spec.md`
  - `grafana-alerting-slo-spec.md`
  - `runbook.md`
  - `execution-checklist.md`

---

## 1. 目标

这份文档用于把平台侧 observability 工作拆成可执行任务。

本轮重构后的前提：

- 不再使用 Datadog Logs。
- 不再使用 Datadog RUM。
- Grafana 接管 dashboard、logs query、metrics、traces、alerting 与 SLO 入口。
- Sentry 继续负责异常聚合、错误分桶和 root cause。

目标不是重复规格，而是明确：

1. 谁来做
2. 做什么
3. 依赖什么
4. 完成后如何验收

## 2. 推荐执行顺序

建议按下面顺序推进：

1. 先确认 Grafana 数据源与字段可检索性。
2. 再迁移 transaction event helper，避免继续绑定 Datadog RUM。
3. 再建 Dashboard。
4. 再建 Alert Rules。
5. 再建 SLO / Burn Rate。
6. 最后跑一次告警演练和 Runbook 演练。

原因：

- 如果 Loki / Tempo / Prometheus 字段还不可检索，后面的 Dashboard 和 Alert 都会返工。

## 3. 任务拆分

### P0-1 Grafana 数据源与字段校验

- Owner：Infra / SRE
- 协作：FE Platform
- 优先级：P0
- 预估：0.5d

任务内容：

1. 确认交易日志进入 Loki。
2. 确认交易 metrics 进入 Prometheus / Mimir。
3. 确认服务端 trace 进入 Tempo。
4. 确认字段名稳定，没有 camelCase / snake_case 冲突。

必查字段：

- `domain`
- `step`
- `result`
- `provider`
- `region`
- `error_code`
- `error_category`
- `trace_id`
- `attempt_id`
- `order_id`
- `payment_id`
- `version`
- `env`
- `service`

输入：

- 现有结构化日志样本
- transaction metrics 样本
- trace/span 样本

输出：

- Grafana 数据源清单
- Loki label / parsed field 清单
- Prometheus metric / label 清单
- Tempo span attribute 清单
- 缺失字段清单

验收：

1. 用 `trace_id` 能在 Loki 搜到交易日志。
2. 用 `provider` + `step` 能在 Grafana dashboard query 中筛到交易样本。
3. 用同一个 `trace_id` 能从 Loki 跳到 Tempo trace 或关联 Sentry issue search。

### P0-2 Transaction Event Helper 迁移

- Owner：FE Platform / Shared
- 协作：Checkout / Payment Domain
- 优先级：P0
- 预估：1d

任务内容：

1. 将现有 Datadog RUM helper 抽象为通用 transaction event helper。
2. 保留业务 API 名称的稳定性，避免大量业务代码二次返工。
3. 让事件可以输出到 structured logs / metrics / traces / Sentry。
4. 去除设计层面对 Datadog RUM `addAction` / `addError` / `addTiming` 的依赖。

输出：

- helper 迁移方案或代码任务
- 需要替换的 Datadog import 清单

验收：

1. 核心步骤 `create_order`、`payment_initiate`、`payment_capture` 不再依赖 RUM action 才可观测。
2. 同一交易事件能产出 metrics 与结构化日志。

### P0-3 Transaction Overview Dashboard

- Owner：Infra / SRE
- 协作：FE Platform
- 优先级：P0
- 预估：0.5d

任务内容：

1. 建立 `Transaction Overview`。
2. 补 KPI、漏斗、错误分布、时延图。
3. 加 template variables。

最小图表：

1. `create_order_success_rate`
2. `payment_initiate_success_rate`
3. `payment_capture_success_rate`
4. `payment_capture_duration_p95`
5. `payment_capture_failure_by_provider`

输入：

- `grafana-dashboard-spec.md`

输出：

- Grafana Dashboard link

验收：

1. 发布后 30 分钟内能从这个 dashboard 识别回归。

### P0-4 Core Failure Alerts

- Owner：Infra / SRE
- 协作：Payment Domain
- 优先级：P0
- 预估：0.5d

任务内容：

1. 建立 `payment_capture_failure_rate`
2. 建立 `payment_initiate_failure_rate`
3. 建立 `create_order_failure_rate`
4. 建立 `provider_timeout_spike`

输入：

- `grafana-alerting-slo-spec.md`

输出：

- Grafana Alert rule links
- 告警 message 模板

验收：

1. 手工构造低风险测试样本时，alert 能进入预期状态。
2. alert message 中带 `provider`、`region`、`version`。
3. alert message 带 Dashboard、Loki query、Runbook、Sentry search 链接。

### P1-1 Provider Drilldown Dashboard

- Owner：Infra / SRE
- 优先级：P1
- 预估：0.5d

任务内容：

1. 建 `Transaction Provider Drilldown`。
2. 支持 `provider` 切分查看 initiate / capture / timeout / processing。

输出：

- Dashboard link

验收：

1. `GrabPay` 和 `ZipPay` 能单独钻取。
2. 可以看 `payment_callback_receive`。

### P1-2 Release Regression Dashboard

- Owner：Infra / SRE
- 协作：FE Platform
- 优先级：P1
- 预估：0.5d

任务内容：

1. 建 `Transaction Release Regression`。
2. 对比 `current version` / `previous version`。

验收：

1. 发布后能看出 success rate、duration、error count 是否明显变化。

### P1-3 Region Health Dashboard

- Owner：Infra / SRE
- 优先级：P1
- 预估：0.5d

任务内容：

1. 建 `Transaction Region Health`。
2. 按 `region` 看 provider 差异和成功率差异。

验收：

1. 能快速确认是否单 region 异常。

### P1-4 SLO 配置

- Owner：Infra / SRE
- 协作：Checkout / Payment Owner
- 优先级：P1
- 预估：0.5d

任务内容：

1. 建 `Checkout Submit Success Rate`。
2. 建 `Payment Initiate Success Rate`。
3. 建 `Payment Capture Success Rate`。

验收：

1. 30 天 error budget 可见。
2. 有明确 owner。

### P1-5 Burn Rate Alerts

- Owner：Infra / SRE
- 协作：Oncall
- 优先级：P1
- 预估：0.5d

任务内容：

1. 建 `Payment Capture Burn Rate`。
2. 建 `Payment Initiate Burn Rate`。
3. 配置 warning / critical 双阈值。

验收：

1. 告警路由可用。
2. alert message 带 dashboard 和 runbook 链接。

### P1-6 Runbook 演练

- Owner：Payment Domain
- 协作：Checkout FE / Infra
- 优先级：P1
- 预估：0.5d

任务内容：

1. 按 `runbook.md` 跑一次桌面演练。
2. 验证按 `traceId` 能否查到 Loki logs / Tempo trace / Sentry。
3. 验证 provider 故障与内部故障的分诊流程。

输入：

- `runbook.md`

验收：

1. 一次 create_order 故障演练。
2. 一次 payment_capture 故障演练。
3. 一次 redirect provider 演练。

## 4. 建议 Jira / Linear Epic

建议拆成三个 Epic：

1. `OBS-TRX-GRAFANA`

   - Grafana Dashboard / Alert / SLO

2. `OBS-TRX-RUNBOOK`

   - Runbook / 演练 / 告警路由

3. `OBS-TRX-CODE-GAPS`

   - transaction helper migration
   - `Affirm` callback
   - provider 后续扩展

## 5. 当前建议 owner

### Infra / SRE

负责：

1. Grafana 数据源
2. Dashboard
3. Alert Rules
4. SLO
5. Burn Rate
6. 告警路由

### FE Platform

负责：

1. 协助校验 logs / metrics / traces 字段
2. 协助 release / version 维度可用性
3. transaction event helper 迁移

### Payment Domain

负责：

1. 告警语义确认
2. provider drilldown 验证
3. Runbook 演练

## 6. 最小上线包

如果只允许做一轮最小交付，建议先上：

1. `P0-1 Grafana 数据源与字段校验`
2. `P0-2 Transaction Event Helper 迁移`
3. `P0-3 Transaction Overview Dashboard`
4. `P0-4 Core Failure Alerts`

这四项落完后，交易故障已经可以做到：

1. 有统一总览。
2. 有核心失败告警。
3. 有基本的 trace / provider / region 检索能力。
4. 不再依赖 Datadog Logs / Datadog RUM。
