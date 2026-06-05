# Grafana Dashboard 配置规格

- 作者：Codex
- 日期：2026-05-25
- 适用范围：`checkout` + `payment`
- 对应方案：`README.md`

---

## 1. 目标

这份文档定义 Grafana 平台侧应该建立的 Dashboard 结构、指标口径和推荐图表。

目标是让团队在 5 分钟内回答下面几个问题：

1. 交易链路现在是否异常。
2. 异常发生在哪个步骤。
3. 是哪个 provider / region / release 受影响。
4. 是转化下降、超时上升，还是明确错误飙升。

## 2. 数据源假设

Grafana 本身是展示与告警入口，交易监控的数据建议来自：

| 数据类型 | 推荐来源 | 用途 |
| --- | --- | --- |
| Metrics | Prometheus / Mimir | 成功率、失败率、耗时、重试、SLO |
| Logs | Loki | 按 `trace_id` / `order_id` / `payment_id` 回溯结构化日志 |
| Traces | Tempo / OpenTelemetry Collector | Server Action → Payment Service → Provider / Backend API 调用链 |
| Errors | Sentry | Root cause、stack trace、错误分桶与异常聚合 |

> 本方案不再使用 Datadog Logs / Datadog RUM。客户端关键交易事件应进入统一 transaction event helper，再转换为 metrics/logs/traces，而不是依赖 RUM action。

## 3. 通用过滤维度

所有 Dashboard 都应该支持以下 variables：

- `env`
- `service`
- `version`
- `region`
- `provider`
- `step`
- `result`

推荐默认值：

- `env=prod`
- `service=joyboy-web`
- `version=All`
- `region=All`
- `provider=All`

## 4. 交易总览 Dashboard

建议名称：

- `Transaction Overview`

推荐分区：

### 4.1 顶部 KPI

1. `create_order_success_rate`
   口径：`create_order result=success / create_order all`

2. `payment_initiate_success_rate`
   口径：`payment_initiate result=success / payment_initiate all`

3. `payment_capture_success_rate`
   口径：`payment_capture result=success / payment_capture all`

4. `payment_processing_rate`
   口径：`payment_capture result=processing / payment_capture all`

5. `payment_timeout_rate`
   口径：`payment_capture result=timeout / payment_capture all`

### 4.2 漏斗趋势

1. `create_order -> payment_initiate -> payment_capture -> payment_result_render.success`
2. 按 15 分钟 bucket 展示。
3. 支持 `provider` 和 `region` 下钻。

### 4.3 错误分布

1. `payment_capture.failure by provider`
2. `payment_initiate.failure by provider`
3. `error_category by step`
4. `error_code top N`

### 4.4 延迟与重试

1. `create_order duration p50 / p95`
2. `payment_initiate duration p50 / p95`
3. `payment_capture duration p50 / p95`
4. `payment_capture retry_count distribution`

### 4.5 用户结果信号

1. `payment_result_render.failure count`
2. `payment_result_render.processing count`
3. `client_step_error by provider`
4. `redirect_callback_missing by provider`

说明：

- 不再使用 RUM error / rage click 作为交易核心验收指标。
- 如果未来需要体验侧指标，应作为独立 Web Experience milestone，通过 OpenTelemetry Browser 或其他前端 telemetry 单独设计。

## 5. Provider Dashboard

建议名称：

- `Transaction Provider Drilldown`

按 `provider` 过滤展示：

1. `initiate request volume`
2. `capture request volume`
3. `success / failure / processing / timeout rate`
4. `duration p95`
5. `top error_code`
6. `top region`
7. `top release version`

重点图表：

1. `payment_capture failure rate by provider`
2. `payment_capture duration p95 by provider`
3. `payment_callback_receive count by provider`
4. `payment_result_render.failure count by provider`

## 6. Release Regression Dashboard

建议名称：

- `Transaction Release Regression`

用途：

- 对比 `current version` 和 `previous version`
- 看发布后 30 分钟内是否出现交易回归

推荐图表：

1. `payment_capture_success_rate by version`
2. `payment_initiate_success_rate by version`
3. `payment_capture duration p95 by version`
4. `payment error count by version`
5. `Sentry issue count tagged step:payment_* by version`

## 7. Region Dashboard

建议名称：

- `Transaction Region Health`

推荐图表：

1. `payment_capture_success_rate by region`
2. `payment_initiate_success_rate by region`
3. `payment_capture timeout_rate by region`
4. `provider split by region`
5. `payment_result_render.failure by region`

这个 Dashboard 主要用于判断：

- 是否只有某个市场异常
- 是否是 region-specific provider 波动
- 是否和 local release / infra 变更相关

## 8. 查询口径建议

优先使用统一 labels / fields：

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

推荐事件来源：

1. Prometheus / Mimir metrics：成功率、失败率、耗时、重试、SLO。
2. Loki structured logs：按交易 ID 回溯事件细节。
3. Tempo traces：服务端调用链和 provider/backend latency。
4. Sentry：异常堆栈、issue 聚合、错误分桶。

如果同一图表有多个数据源，建议遵循：

1. 成功率和错误率优先用 metrics。
2. 交易事件详情优先用 structured logs。
3. 延迟优先用 histogram metric 或 trace span duration。
4. root cause 优先跳转 Sentry。

## 9. Dashboard 最小交付

如果本期只做 MVP，先建这四个：

1. `Transaction Overview`
2. `Transaction Provider Drilldown`
3. `Transaction Release Regression`
4. `Transaction Region Health`

其中必须先落的图表只有：

1. `payment_capture_success_rate`
2. `payment_initiate_success_rate`
3. `create_order_success_rate`
4. `payment_capture_duration_p95`
5. `payment_capture_failure_by_provider`
