# FY26 Milestone: Transaction Observability Upgrade

- 适用范围：`checkout` + `payment`
- 目标平台：**Sentry + Grafana / Loki / Tempo / Prometheus**
- 配套规格：[`grafana-alerting-slo-spec.md`](./grafana-alerting-slo-spec.md)、[`grafana-dashboard-spec.md`](./grafana-dashboard-spec.md)、[`grafana-guide.md`](./grafana-guide.md)

---

## English Version

### Value

Transaction observability today is split across Datadog Logs / RUM and ad-hoc logs. There is no SLO, no dedicated payment alert, no consistent way to follow a single transaction across systems. This milestone closes that gap by piggybacking on the company-wide migration to the open-source observability stack.

Concretely, this milestone delivers:

1. **Cost & alignment** — Datadog Logs/RUM is removed for transaction monitoring; we land on the company-standard Grafana + Loki + Tempo + Prometheus stack ([migration guide](./grafana-guide.md)).
2. **Cross-system trace-back** — a single `traceId` links Sentry issues ↔ Loki logs ↔ Tempo traces ↔ Grafana panels. Debugging shifts from "grep logs" to "follow the id".
3. **Defined reliability targets** — three core steps (`create_order`, `payment_initiate`, `payment_capture`) get explicit 30-day SLOs and dual-window burn-rate alerts.
4. **Faster detection** — failure-spike alerts fire within 5 minutes; release regressions surface within 30 minutes via version-tagged metrics.
5. **Impact slicing** — provider / region / version are first-class metric labels, so on-call can identify the blast radius without searching traces.

### Scope

**In scope**

- Server-side transaction events for `checkout` + `payment` in `apps/web`.
- Metrics, logs, traces emitted via `libs/shared/observability`.
- Grafana dashboards, alerts, and SLOs for the six standard transaction steps.
- AlertX routing for the four core alerts.

**Out of scope**

- Datadog RUM and any client-side user-experience metrics (rage click, web vitals). To be handled separately as a Web Experience milestone if needed.
- Mobile app observability.
- Non-transaction services.

### Key Deliverables

#### 1. Transaction event model — 6 steps

`create_order` · `payment_initiate` · `payment_capture` · `payment_redirect` · `payment_callback_receive` · `payment_result_render`

#### 2. Correlation fields (carried on every event)

`traceId` · `attemptId` · `orderId` · `paymentId`

> Field alignment requirement: every transaction log emits `traceId`; OpenTelemetry `service.name` must match the Loki `service` label, otherwise Tempo → Loki correlation breaks (see [grafana-guide § Trace 关联 Log](./grafana-guide.md#trace-关联-log)).

#### 3. Prometheus metrics (4 series, Prometheus-style names)

| Metric                              | Type      | Labels                                                                          |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `transaction_step_total`            | Counter   | `env, service, version, domain, step, result, provider, region, error_category` |
| `transaction_step_duration_seconds` | Histogram | `env, service, version, domain, step, provider, region`                         |
| `transaction_retry_total`           | Counter   | `env, service, version, step, provider, region`                                 |
| `transaction_callback_total`        | Counter   | `env, service, version, provider, region, result`                               |

> `order_id` / `payment_id` / `trace_id` are **never** metric labels — they live in Loki structured logs and Tempo span attributes.

#### 4. SLO targets (30-day window)

| Step                           | SLI numerator / denominator | Target                                                       |
| ------------------------------ | --------------------------- | ------------------------------------------------------------ |
| `create_order`                 | `result=success` / all      | **99.5%**                                                    |
| `payment_initiate`             | `result=success` / all      | **99.0%**                                                    |
| `payment_capture`              | `result=success` / all      | **98.5%**                                                    |
| `payment_capture` per provider | by `provider` label         | covers `stripe-online`, `grabpay`, `zippay`, `paypal-online` |

#### 5. Core alerts (4) — 5-minute evaluation, min volume = 20

| Alert                             | Warning | Critical | Cut by                        |
| --------------------------------- | ------- | -------- | ----------------------------- |
| `create_order_failure_rate`       | > 2%    | —        | overall                       |
| `payment_initiate_failure_rate`   | > 3%    | > 5%     | overall, `provider`           |
| `payment_capture_failure_rate`    | > 5%    | > 8%     | overall, `provider`, `region` |
| `provider_timeout_spike` (15 min) | > 3%    | —        | `provider`, `region`          |

Plus burn-rate alerts (dual 1h / 6h window) on `payment_capture` and `payment_initiate` SLOs.

#### 6. Release-window stricter thresholds (30 min after major release)

- `payment_capture_failure_rate > 3%`
- `payment_initiate_failure_rate > 2%`
- `payment_capture` p95 latency > 24h baseline × 1.5

#### 7. Grafana dashboards (4)

`Transaction Overview` · `Provider Drilldown` · `Release Regression` · `Region Health`

Each supports filter variables: `env, service, version, region, provider, step, result`.

#### 8. AlertX integration

All four alerts routed via AlertX (Grafana v10 alerting protocol). Alert payload contains: `env`, `version`, `region`, `provider`, current value, dashboard link, Loki query, runbook link, Sentry search link.

#### 9. Runbook + UAT

Single end-to-end UAT: trace one failed payment from Sentry issue → Tempo trace → Loki logs → Grafana panel using `traceId`.

### Acceptance Criteria

- [ ] All 6 transaction steps emit metrics + structured logs with the 4 correlation fields.
- [ ] One sample failed transaction can be followed across Sentry, Loki, Tempo, Grafana using `traceId` alone.
- [ ] 3 SLOs (`create_order` 99.5%, `payment_initiate` 99.0%, `payment_capture` 98.5%) are configured in Grafana with 30-day window.
- [ ] 4 core alerts fire within 5 minutes of threshold breach in staging fault-injection test.
- [ ] 4 alerts deliver to AlertX with the required payload fields.
- [ ] All 4 dashboards published and accessible to checkout/payment owners and on-call.
- [ ] Release regression: in a synthetic version-A vs version-B comparison, the Release Regression dashboard shows divergence within 30 minutes.
- [ ] Impact slicing by `provider`, `region`, `version` works via metric/log labels (not Tempo search — Tempo does not support env-label search).
- [ ] Datadog Logs / RUM are removed from transaction monitoring code paths; no new Datadog metrics added.

---

## 中文版本

### 价值

当前交易可观测能力散落在 Datadog Logs / RUM 与 ad-hoc 日志中：没有 SLO、没有专属告警、也没有统一的方式跨系统追一笔交易。本 milestone 借公司整体迁移开源可观测栈的契机，把这个缺口补上。

具体交付价值：

1. **成本 + 对齐** —— 交易监控不再依赖 Datadog Logs/RUM，回归公司统一的 Grafana + Loki + Tempo + Prometheus 栈（参考 [迁移指引](./grafana-guide.md)）。
2. **跨系统回溯** —— 一个 `traceId` 串起 Sentry issue ↔ Loki 日志 ↔ Tempo trace ↔ Grafana 面板，排障从「翻日志」收敛为「按 id 跟踪」。
3. **明确的可靠性目标** —— `create_order`、`payment_initiate`、`payment_capture` 三个核心步骤具备 30 天 SLO 和双窗口 burn rate 告警。
4. **更快的发现** —— 失败率突增 5 分钟内告警；版本标签让发布回归 30 分钟内可见。
5. **影响面切分** —— provider / region / version 作为指标标签，on-call 不需要搜 trace 就能判断影响范围。

### 范围

**包含**

- `apps/web` 的 `checkout` + `payment` 服务端交易事件。
- 通过 `libs/shared/observability` 输出 metrics / logs / traces。
- 六个标准事件的 Grafana dashboard、告警、SLO。
- 四条核心告警接入 AlertX。

**不包含**

- Datadog RUM 与所有客户端体验指标（rage click、web vitals）。如有需要单独立项 Web Experience milestone。
- 移动端可观测。
- 非交易类服务。

### 关键交付

#### 1. 交易事件模型 —— 6 个步骤

`create_order` · `payment_initiate` · `payment_capture` · `payment_redirect` · `payment_callback_receive` · `payment_result_render`

#### 2. 关联字段（每个事件都带）

`traceId` · `attemptId` · `orderId` · `paymentId`

> 字段对齐要求：交易日志必须输出 `traceId`；OpenTelemetry `service.name` 必须与 Loki `service` 标签一致，否则 Tempo → Loki 关联会断（详见 [grafana-guide § Trace 关联 Log](./grafana-guide.md#trace-关联-log)）。

#### 3. Prometheus 指标（4 条，Prometheus 命名风格）

| Metric                              | 类型      | Labels                                                                          |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `transaction_step_total`            | Counter   | `env, service, version, domain, step, result, provider, region, error_category` |
| `transaction_step_duration_seconds` | Histogram | `env, service, version, domain, step, provider, region`                         |
| `transaction_retry_total`           | Counter   | `env, service, version, step, provider, region`                                 |
| `transaction_callback_total`        | Counter   | `env, service, version, provider, region, result`                               |

> `order_id` / `payment_id` / `trace_id` **不能**作为 metric label，仅出现在 Loki structured logs 和 Tempo span attributes。

#### 4. SLO 目标（30 天窗口）

| 步骤                          | SLI 口径               | 目标                                                       |
| ----------------------------- | ---------------------- | ---------------------------------------------------------- |
| `create_order`                | `result=success` / all | **99.5%**                                                  |
| `payment_initiate`            | `result=success` / all | **99.0%**                                                  |
| `payment_capture`             | `result=success` / all | **98.5%**                                                  |
| `payment_capture` 按 provider | 拆 `provider` 标签     | 覆盖 `stripe-online`、`grabpay`、`zippay`、`paypal-online` |

#### 5. 核心告警（4 条）—— 5 分钟窗口，最小样本量 20

| 告警                                | Warning | Critical | 切分维度                      |
| ----------------------------------- | ------- | -------- | ----------------------------- |
| `create_order_failure_rate`         | > 2%    | —        | overall                       |
| `payment_initiate_failure_rate`     | > 3%    | > 5%     | overall、`provider`           |
| `payment_capture_failure_rate`      | > 5%    | > 8%     | overall、`provider`、`region` |
| `provider_timeout_spike`（15 分钟） | > 3%    | —        | `provider`、`region`          |

另加 `payment_capture` 和 `payment_initiate` 的双窗口（1h / 6h）burn rate 告警。

#### 6. 发布窗口加严阈值（major release 后 30 分钟）

- `payment_capture_failure_rate > 3%`
- `payment_initiate_failure_rate > 2%`
- `payment_capture` p95 延迟 > 过去 24h 基线 × 1.5

#### 7. Grafana dashboards（4 个）

`Transaction Overview` · `Provider Drilldown` · `Release Regression` · `Region Health`

均支持过滤变量：`env, service, version, region, provider, step, result`。

#### 8. AlertX 接入

四条告警全部走 AlertX（Grafana v10 告警协议）。告警 payload 包含：`env`、`version`、`region`、`provider`、当前值、dashboard 链接、Loki 查询、runbook 链接、Sentry 搜索链接。

#### 9. Runbook 与 UAT

端到端 UAT 用例：仅凭一个 `traceId`，把一笔失败支付从 Sentry issue → Tempo trace → Loki 日志 → Grafana 面板追完。

### 验收标准

- [ ] 6 个交易步骤都输出 metric + 结构化日志，且都带 4 个关联字段。
- [ ] 抽样的一笔失败交易，仅靠 `traceId` 可在 Sentry、Loki、Tempo、Grafana 之间走通。
- [ ] 3 条 SLO（`create_order` 99.5%、`payment_initiate` 99.0%、`payment_capture` 98.5%）在 Grafana 配置好，窗口为 30 天。
- [ ] 4 条核心告警在 staging 故障注入测试中 5 分钟内触发。
- [ ] 4 条告警均能投递到 AlertX，且 payload 字段齐全。
- [ ] 4 个 dashboard 上线，checkout/payment owners 与 on-call 都能访问。
- [ ] Release 回归：在合成的 version-A vs version-B 对比中，Release Regression dashboard 30 分钟内出现分化曲线。
- [ ] provider / region / version 影响面通过 metric / log 标签判断（不依赖 Tempo 搜索 —— Tempo 不支持按环境标签搜 trace）。
- [ ] 交易监控代码路径中 Datadog Logs / RUM 已移除；不再新增 Datadog 指标。

---

## 简介版（One-pager）

### 目标

完成基于 **Sentry + Grafana** 的 checkout/payment 交易链路端到端可观测性方案与落地。Sentry 负责错误聚合与 root cause，Grafana + Loki + Tempo + Prometheus 负责指标、日志、trace、dashboard 与告警入口；不再依赖 Datadog Logs / RUM。

### 关键交付

#### 1. 交易事件模型

- 建立 6 个标准事件：`create_order`、`payment_initiate`、`payment_capture`、`payment_redirect`、`payment_callback_receive`、`payment_result_render`
- 统一关联字段：`traceId`、`attemptId`、`orderId`、`paymentId`，全链路传递
- 字段对齐：日志必须带 `traceId`；OpenTelemetry `service.name` 与 Loki `service` 标签一致 → 保证 `traceId` 在 Sentry、Loki、Tempo、Grafana 之间能回溯同一笔交易

#### 2. Prometheus 指标（4 条）

| Metric                              | 类型      | 用途                                    |
| ----------------------------------- | --------- | --------------------------------------- |
| `transaction_step_total`            | Counter   | 各步骤成功率 / 失败率 / 超时率底座      |
| `transaction_step_duration_seconds` | Histogram | 各步骤 p50 / p95 / p99 延迟             |
| `transaction_retry_total`           | Counter   | 重试次数（按 step / provider / region） |
| `transaction_callback_total`        | Counter   | 第三方回调统计（按 provider / result）  |

统一 labels：`env, service, version, domain, step, result, provider, region, error_category`；`traceId` / `orderId` / `paymentId` **只**进 Loki 与 Tempo span attribute，**不**作为 metric label（避免高基数）。

#### 3. SLO 目标（30 天窗口）

| 步骤               | SLI 口径               | 目标      |
| ------------------ | ---------------------- | --------- |
| `create_order`     | `result=success` / all | **99.5%** |
| `payment_initiate` | `result=success` / all | **99.0%** |
| `payment_capture`  | `result=success` / all | **98.5%** |

配套：`payment_capture` 和 `payment_initiate` 加双窗口 burn rate 告警（短窗口 1h、长窗口 6h），并按 `provider` 拆分覆盖 `stripe-online`、`grabpay`、`zippay`、`paypal-online`。

#### 4. Grafana Dashboards（4 个）

`Transaction Overview`、`Provider Drilldown`、`Release Regression`、`Region Health`，均支持过滤变量：`env, service, version, region, provider, step, result`。

#### 5. 核心告警（4 条，5 分钟评估窗口、最小样本量 20，全部通过 AlertX）

| 告警                                    | Warning | Critical | 切分维度                      |
| --------------------------------------- | ------- | -------- | ----------------------------- |
| `create_order_failure_rate`             | > 2%    | —        | overall                       |
| `payment_initiate_failure_rate`         | > 3%    | > 5%     | overall、`provider`           |
| `payment_capture_failure_rate`          | > 5%    | > 8%     | overall、`provider`、`region` |
| `provider_timeout_spike`（15 分钟窗口） | > 3%    | —        | `provider`、`region`          |

**发布加严**：major release 后 30 分钟内启用更严阈值 — `payment_capture > 3%`、`payment_initiate > 2%`、`payment_capture` p95 > 24h 基线 × 1.5。告警 message 含 `env / version / region / provider`、当前值、dashboard 链接、Loki 查询、runbook 与 Sentry 搜索链接。
