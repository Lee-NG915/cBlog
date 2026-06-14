# Grafana Alerting 与 SLO 配置规格

- 作者：Codex
- 日期：2026-05-25
- 适用范围：`checkout` + `payment`

---

## 1. 目标

这份文档定义 Grafana Alerting、Prometheus recording rules、SLO 和 burn rate alert 的推荐口径。

原则：

1. 先监控成功率和超时率，不只盯 exception 数量。
2. 先监控 `create_order`、`payment_initiate`、`payment_capture`。
3. provider 差异大时，拆 provider 级 alert。
4. Grafana 负责影响面、趋势和告警；Sentry 负责 root cause 和异常聚合。

## 2. 指标命名建议

推荐统一导出以下 metrics：

| Metric | 类型 | Labels |
| --- | --- | --- |
| `transaction_step_total` | Counter | `env`, `service`, `version`, `domain`, `step`, `result`, `provider`, `region`, `error_category` |
| `transaction_step_duration_seconds` | Histogram | `env`, `service`, `version`, `domain`, `step`, `provider`, `region` |
| `transaction_retry_total` | Counter | `env`, `service`, `version`, `step`, `provider`, `region` |
| `transaction_callback_total` | Counter | `env`, `service`, `version`, `provider`, `region`, `result` |

说明：

- `order_id`、`payment_id`、`trace_id` 不能作为 metric label，避免高基数。
- 这些 ID 应进入 Loki structured logs 与 Tempo span attributes。

## 3. 核心 SLI

### 3.1 Checkout Submit Success Rate

定义：

- 分子：`step=create_order, result=success`
- 分母：`step=create_order`

目标建议：

- `99.5% / 30d`

### 3.2 Payment Initiate Success Rate

定义：

- 分子：`step=payment_initiate, result=success`
- 分母：`step=payment_initiate`

目标建议：

- `99.0% / 30d`

### 3.3 Payment Capture Success Rate

定义：

- 分子：`step=payment_capture, result=success`
- 分母：`step=payment_capture`

目标建议：

- `98.5% / 30d`

### 3.4 Provider Capture Success Rate

定义：

- 按 `provider` 拆分 `payment_capture`

建议先覆盖：

1. `stripe-online`
2. `grabpay`
3. `zippay`
4. `paypal-online`

## 4. 推荐 Alert Rules

### 4.1 payment_capture_failure_rate

建议阈值：

1. 5 分钟 failure rate > `5%`
2. 且 5 分钟总量 > `20`

推荐维度：

- overall
- by `provider`
- by `region`

告警级别：

- `critical`: > `8%`
- `warning`: > `5%`

### 4.2 payment_initiate_failure_rate

建议阈值：

1. 5 分钟 initiate failure rate > `3%`
2. 且 volume > `20`

告警级别：

- `critical`: > `5%`
- `warning`: > `3%`

### 4.3 create_order_failure_rate

建议阈值：

1. 5 分钟 create_order failure rate > `2%`
2. 且 volume > `20`

### 4.4 provider_timeout_spike

定义：

- `step=payment_capture, result=timeout`

建议阈值：

1. 15 分钟 timeout rate > `3%`
2. 按 `provider` 和 `region` 切分

### 4.5 processing_stuck_spike

定义：

- `step=payment_capture, result=processing`

建议阈值：

1. 15 分钟 processing rate 连续高于基线 2 倍

## 5. PromQL 口径示例

### 5.1 Payment Capture Failure Rate

```promql
sum by (provider, region, version) (
  rate(transaction_step_total{step="payment_capture",result=~"failure|timeout"}[5m])
)
/
sum by (provider, region, version) (
  rate(transaction_step_total{step="payment_capture"}[5m])
)
```

### 5.2 Payment Capture p95

```promql
histogram_quantile(
  0.95,
  sum by (le, provider, region, version) (
    rate(transaction_step_duration_seconds_bucket{step="payment_capture"}[5m])
  )
)
```

### 5.3 Create Order Success Rate

```promql
sum(rate(transaction_step_total{step="create_order",result="success"}[5m]))
/
sum(rate(transaction_step_total{step="create_order"}[5m]))
```

## 6. Burn Rate Alerts

### 6.1 Payment Capture SLO Burn Rate

基于：

- `Payment Capture Success Rate`

建议双窗口：

1. 短窗口：`1h`
2. 长窗口：`6h`

建议策略：

1. `critical`

   - 短窗口 burn rate > `14`
   - 长窗口 burn rate > `7`

2. `warning`
   - 短窗口 burn rate > `6`
   - 长窗口 burn rate > `3`

### 6.2 Payment Initiate SLO Burn Rate

同上，但阈值可稍微宽松：

1. `critical`

   - `1h > 12`
   - `6h > 6`

2. `warning`
   - `1h > 5`
   - `6h > 2.5`

## 7. 发布窗口加严告警

建议在 major release 后 30 分钟内启用更严格阈值：

1. `payment_capture_failure_rate > 3%`
2. `payment_initiate_failure_rate > 2%`
3. `payment_capture_duration_p95` 高于过去 24 小时基线 50%

这类 alert 应附带：

- `version`
- `release`
- `region`
- `provider`

## 8. 告警路由建议

### P1 级

触发条件：

- `payment_capture_failure_rate critical`
- `Payment Capture Burn Rate critical`

通知：

1. payment owner
2. checkout owner
3. oncall / infra

### P2 级

触发条件：

- `payment_initiate_failure_rate warning`
- `provider_timeout_spike`

通知：

1. payment owner
2. checkout owner

## 9. Alert message 模板

推荐最小信息：

1. `env`
2. `version`
3. `region`
4. `provider`
5. 当前失败率 / 超时率
6. Grafana dashboard link
7. Loki trace/order log query
8. Runbook link
9. Sentry issue search link

模板示例：

```text
[Transaction Alert] payment_capture_failure_rate is above threshold

env: {{ $labels.env }}
region: {{ $labels.region }}
provider: {{ $labels.provider }}
version: {{ $labels.version }}
current_value: {{ $values.A.Value }}

Check:
- Dashboard: <transaction-overview-link>
- Provider Drilldown: <provider-dashboard-link>
- Logs: {service="joyboy-web", step="payment_capture", provider="{{ $labels.provider }}"}
- Runbook: docs/transaction-related/transaction-observability/runbook.md
- Sentry: <sentry-search-link>
```

## 10. 最小交付

如果本期只做最小版本，先建：

1. `payment_capture_failure_rate`
2. `payment_initiate_failure_rate`
3. `create_order_failure_rate`
4. `Payment Capture Success Rate` SLO
5. `Payment Initiate Success Rate` SLO
