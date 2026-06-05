# 交易可观测性执行清单

- 作者：Codex
- 日期：2026-05-25
- 对应方案：`docs/transaction-related/transaction-observability/README.md`
- 目标平台：Sentry + Grafana

---

## 1. 执行原则

这份清单基于当前仓库现状整理。新方案已经明确：

- 不再使用 Datadog Logs。
- 不再使用 Datadog RUM。
- Sentry 继续负责错误聚合、root cause、错误分桶。
- Grafana 负责 dashboard、Loki logs、Tempo traces、Prometheus/Mimir metrics、alerting、SLO。
- 交易代码不应该绑定某个 vendor 的 RUM API，而应该通过统一 transaction event helper 输出。

当前基础：

- Sentry 已初始化：
  - 客户端：`apps/web/instrumentation-client.ts`
  - 服务端/Edge：`apps/web/instrumentation.js` + `apps/web/sentry.server.config.ts` + `apps/web/sentry.edge.config.ts`
- 统一日志已存在：`libs/shared/observability`
- 支付主链路已经集中在：
  - `libs/modules/payment/actions/src/lib/payment.action.ts`
  - `libs/modules/payment/services/src/lib/payment.service.server.ts`
  - `libs/modules/payment/components/src/lib/payment-wallets/hooks/use-payment-execution.ts`
  - `libs/modules/payment/components/src/lib/payment-wallets/utils/capture-with-retry.ts`

执行重点：

1. 保留统一字段与步骤模型。
2. 将交易观测出口从 Datadog RUM helper 重构为通用 transaction event helper。
3. 把核心交易事件输出到 metrics / logs / traces / Sentry。
4. 建立 Grafana Dashboard / Alert / SLO。

## 2. 当前状态

- [x] 已删除旧版 `transaction-monitoring`
- [x] 已新建 `transaction-observability`
- [x] 已接入 payment action / service / strategy / client 主链路
- [x] 已接入 GrabPay redirect callback 闭环
- [x] 已接入 ZipPay redirect callback 闭环
- [ ] Affirm callback 闭环待确认当前真实支付模式后再接入
- [ ] Datadog RUM helper 需要重构为通用 transaction event helper
- [ ] Grafana Dashboard / Alert / SLO 尚未开始
- [ ] Loki / Tempo / Prometheus 字段验收尚未完成

## 3. P0：标准和基础设施

### 3.1 统一交易字段字典

- [x] 固化 `traceId`、`attemptId`、`orderId`、`paymentId` 的含义和生命周期。
- [x] 统一字段命名，避免同时存在 `environment` / `env`、`release` / `version` 的混乱映射。
- [x] 在交易上下文中补齐字段：
  - `attemptId`
  - `service`
  - `env`
  - `version`
  - `checkoutTokenHash`
  - `httpStatus`
  - `retryCount`
  - `is3DS`
  - `isRedirectFlow`
  - `isFallbackFlow`
- [ ] 明确 Loki parsed field、Prometheus label、Tempo span attribute 的映射规则。

建议修改文件：

- `libs/shared/observability/src/lib/transaction-observability/types.ts`

### 3.2 transaction-observability 模块

- [x] 新建交易可观测性模块，不沿用旧版 `transaction-monitoring` 设计。
- [x] 增加“设置全局 transaction scope / context”的能力。
- [x] 增加 `attemptId` 与 trace 透传支持。
- [x] 增加耗时埋点能力，支持 `durationMs` 统一上报。
- [x] 增加针对业务失败的 `skipSentry` 默认策略入口。
- [ ] 增加 Grafana-oriented 输出抽象：
  - structured logs
  - metrics
  - trace attributes
  - Sentry error

建议文件：

- `libs/shared/observability/src/lib/transaction-observability/index.ts`
- `libs/shared/observability/src/lib/transaction-observability/types.ts`
- `libs/shared/observability/src/lib/transaction-observability/sentry.ts`
- `libs/shared/observability/src/lib/transaction-observability/logger.ts`
- `libs/shared/observability/src/lib/transaction-observability/grafana.ts`

### 3.3 Datadog RUM helper 迁移

当前方案不再把 Datadog RUM 作为交易监控依赖。

- [ ] 盘点现有 `trackTransactionAction`、`trackTransactionError`、`trackTransactionTiming`、`setTransactionRumContext` 使用点。
- [ ] 保留业务层 API 或提供兼容 shim，避免大面积业务改动。
- [ ] 将底层输出迁移为 transaction event：
  - metrics counter / histogram
  - structured logs
  - trace attributes
  - Sentry breadcrumb / error
- [ ] 删除设计层对 `addAction` / `addError` / `addTiming` 的依赖。

建议文件：

- `libs/shared/observability/src/lib/datadog/*`
- `libs/shared/observability/src/lib/transaction-observability/*`

### 3.4 trace 生成和透传规则

- [x] 将 trace 起点前移到 checkout / payment UI 入口。
- [x] 增加 `attemptId`，用于区分同一订单的多次支付尝试。
- [x] 内部 API 保留 `x-trace-id`。
- [x] 保留 Sentry `sentry-trace` / `baggage`。
- [ ] 若接入 OpenTelemetry，补 `traceparent` / `tracestate` 传播。

建议修改文件：

- `libs/modules/payment/actions/src/lib/payment.action.ts`
- `libs/modules/payment/components/src/lib/payment-wallets/hooks/use-payment-execution.ts`

## 4. P1：接入核心交易主链路

### 4.1 Client 侧 checkout / payment 主路径

- [x] `payment_method_select` 埋点接入支付方式切换。
- [x] `create_order` 开始 / 成功 / 失败埋点接入订单创建流程。
- [x] `payment_initiate` 开始 / 成功 / 失败埋点接入支付初始化。
- [x] `payment_sdk_confirm` 埋点接入 Stripe / 2C2P confirm。
- [x] `payment_redirect` 埋点接入 GrabPay / ZipPay / Affirm / PayPal redirect 或 popup 流程。
- [x] `payment_capture` 埋点接入 capture retry 前后状态。
- [x] 成功页 / 失败页渲染时补 `payment_result_render`。
- [ ] 验证这些事件不依赖 Datadog RUM 即可进入 Grafana 数据链路。

### 4.2 Server Action 层

- [x] `initiatePaymentAction` 使用 transaction helper 替换裸 `Sentry.captureException`。
- [x] `initiatePaymentAction` 对成功 / 失败都输出结构化日志与标准字段。
- [x] `capturePaymentAction` 同样补齐 start / success / failure / timeout 埋点。
- [x] 将 provider、orderId、paymentId、traceId、attemptId 统一写入上下文。
- [ ] 验证 Server Action 产出的 logs / metrics / traces 可在 Grafana 关联。

### 4.3 Payment Service 层

- [x] `processPayment()` 内部对以下步骤打点：
  - `payment_initiate`
  - provider `confirmPayment` 前后
  - rollback
- [x] `capturePayment()` 前后记录耗时、provider、结果。
- [x] 对 rollback failure 做 warning 级日志，避免吞掉定位线索。
- [x] 对 `PROCESS_PAYMENT_FAILED`、capture failure 进行 `errorCategory` 分类。

### 4.4 Provider Strategy 层

- [x] 每个 provider 的 `initiatePaymentIntent()` 记录 request start / success / failure / duration。
- [x] 每个 provider 的 `capturePayment()` 记录 request start / success / failure / timeout。
- [x] 将 provider 专有错误码映射到统一 `errorCategory`。
- [x] 标识 action 类型：
  - `SDK_CONFIRM`
  - `REDIRECT`
  - `SDK_POPUP`
  - `SUCCESS`

## 5. P1：Sentry 配置治理

### 5.1 交易链路规则采样

- [x] 将静态低采样改为规则采样。
- [x] checkout / payment 页面、交易相关 server action、capture failure 提高采样率。
- [x] 普通页面维持低采样。
- [x] 失败交易默认全量保留 trace。
- [x] `beforeSend` 先写入 `error_bucket` / `bucket_confidence`，再执行过滤规则。

### 5.2 Scope / Tag 统一

- [x] 在 Sentry capture 前统一设置：
  - `domain`
  - `step`
  - `provider`
  - `region`
  - `result`
  - `errorCategory`
  - `orderId`
  - `paymentId`
  - `traceId`
  - `attemptId`
- [x] 对用户取消、库存失效、coupon 失效等业务失败默认降级处理。

## 6. P1：Grafana 接入与平台配置

### 6.1 Loki Logs 规范化

- [ ] 确认服务端 JSON 日志在 Loki 中能稳定解析 `service`、`env`、`version`。
- [ ] 增加交易字段 parsed fields / labels：
  - `domain`
  - `step`
  - `provider`
  - `region`
  - `result`
  - `error_code`
  - `error_category`
  - `order_id`
  - `payment_id`
  - `trace_id`
- [ ] 保证 logger 输出字段名稳定，避免 camelCase / snake_case 混用。

### 6.2 Prometheus / Mimir Metrics

- [ ] 建立 `transaction_step_total`。
- [ ] 建立 `transaction_step_duration_seconds`。
- [ ] 建立 `transaction_retry_total`。
- [ ] 建立 `transaction_callback_total`。
- [ ] 避免 `trace_id`、`order_id`、`payment_id` 成为 metric label。

### 6.3 Tempo / OpenTelemetry Traces

- [ ] 确认 Server Action → PaymentService → ProviderStrategy → Backend API 可形成 trace。
- [ ] 将 `trace_id`、`attempt_id`、`order_id`、`payment_id` 放入 span attribute。
- [ ] 确认 Grafana 可以从 log line 跳转到 trace。

### 6.4 Grafana 平台侧配置

- [ ] 建立交易总览 Dashboard。
- [ ] 建立 provider Dashboard。
- [ ] 建立 release regression Dashboard。
- [ ] 建立 region 维度 Dashboard。
- [ ] 建立 Alert Rules：
  - `payment_capture_failure_rate`
  - `payment_initiate_failure_rate`
  - `create_order_failure_rate`
  - `provider_timeout_spike`

已补文档规格：

- `grafana-dashboard-spec.md`
- `grafana-alerting-slo-spec.md`
- `platform-implementation-plan.md`
- `diagrams.md`
- `confluence-diagrams.md`

## 7. P2：SLO、告警、Runbook

### 7.1 SLO

- [ ] 定义 `Checkout Submit Success Rate`
- [ ] 定义 `Payment Initiate Success Rate`
- [ ] 定义 `Payment Capture Success Rate`
- [ ] 如 provider 差异较大，拆分 provider 级 SLO

### 7.2 告警

- [ ] 5 分钟失败率阈值告警
- [ ] 15 分钟成功率下降告警
- [ ] 30 天 burn rate 告警
- [ ] 发布窗口加严告警

### 7.3 Runbook

- [x] 明确告警后先看 Grafana 还是 Sentry。
- [x] 明确按 `traceId` 回溯的定位流程。
- [x] 明确 provider 故障与内部故障的分诊规则。
- [ ] 明确需要通知的 owner：checkout、payment、infra、客服。

## 8. P2：验证与验收

### 8.1 本地 / UAT 验证场景

- [ ] 正常支付成功链路
- [ ] create order 失败
- [ ] initiate 失败
- [ ] SDK confirm 失败
- [x] redirect return 失败
- [x] capture timeout + retry
- [ ] 用户取消支付
- [ ] provider unavailable

### 8.2 验收标准

- [ ] 同一笔交易可以通过 `traceId` 在 Sentry、Loki、Tempo、Grafana Dashboard 中检索到。
- [ ] `create_order`、`payment_initiate`、`payment_capture` 三个步骤有稳定成功率指标。
- [ ] 业务失败与系统故障在告警和 issue 中被区分。
- [ ] 发布后 30 分钟内可以从 Grafana Dashboard 看出回归与否。
- [ ] Grafana alert message 带 dashboard、Loki query、Runbook、Sentry search 链接。

## 9. 建议排期

### Sprint 1

- [ ] 完成 Grafana 数据源与字段映射确认
- [ ] 迁移 Datadog RUM helper 为通用 transaction event helper
- [ ] 补 metrics/logs/traces 输出协议
- [ ] 验证 `traceId` 关联 Sentry / Loki / Tempo

### Sprint 2

- [ ] 建立 Grafana Dashboard + Alert Rules
- [ ] 改造 provider strategies 细节缺口
- [ ] 调整 release regression dashboard

### Sprint 3

- [ ] 建立 SLO + burn rate alerts
- [ ] 补 runbook 演练
- [ ] provider 全覆盖
- [ ] UAT 演练和回归验收

## 10. 建议 owner 划分

- FE Checkout / Payment
  - `payment-wallets`、页面状态埋点、支付恢复态

- FE Platform / Shared
  - `libs/shared/observability`、Sentry helper、transaction event helper、logger 字段规范

- Server / Payment Domain
  - server action、payment service、provider strategy

- Infra / SRE
  - Grafana Dashboard、Alert Rules、SLO、Loki/Tempo/Prometheus 数据源、告警路由

## 11. 最小可交付版本

如果需要先做 MVP，我建议只交付下面这批：

- [ ] `create_order`、`payment_initiate`、`payment_capture` 三个步骤的统一 transaction event
- [x] `traceId` 贯穿 client -> action -> service -> strategy
- [x] Sentry 交易高采样
- [ ] Grafana 交易总览 Dashboard
- [ ] 两条核心告警：
  - `payment_capture_failure_rate`
  - `payment_initiate_failure_rate`

这批做完后，已经足够支撑大部分交易故障的发现和初步定位，并且不再依赖 Datadog Logs / Datadog RUM。
