# 交易模块可观测性技术方案

- 作者：Codex
- 日期：2026-05-26
- 适用范围：`checkout` + `payment`
- 目标平台：Sentry + Grafana
- 重要调整：已下线 Datadog Logs / Datadog RUM 集成；Grafana 接管 dashboard、logs query、metrics、traces 与 alerting 入口。
- 相关现状文件：
  - `apps/web/instrumentation-client.ts`
  - `apps/web/instrumentation.js`
  - `apps/web/sentry.server.config.ts`
  - `apps/web/sentry.edge.config.ts`
  - `apps/web/app/layout.tsx`
  - `libs/shared/observability`
  - `docs/checkout-payment-monitoring-design.md`
- 配套文档：
  - `execution-checklist.md`
  - `redirect-provider-callback-design.md`
  - `grafana-dashboard-spec.md`
  - `grafana-alerting-slo-spec.md`
  - `runbook.md`
  - `platform-implementation-plan.md`
  - `diagrams.md`
  - `confluence-diagrams.md`

---

## 1. 背景与目标

交易链路是 Joyboy 最关键的业务闭环。Sentry 已完成平台级初始化，`libs/shared/observability` 已有统一 logger 与错误捕获封装。原方案中 Datadog Logs / Datadog RUM 的职责已迁移到 Grafana 体系：

- Grafana 作为统一观测入口。
- Prometheus / Mimir 承接业务 metrics 与 SLO。
- Loki 承接结构化日志查询。
- Tempo / OpenTelemetry 承接服务端 trace。
- Sentry 继续承接错误聚合、root cause、stack trace 与错误分桶。

本方案的目标不是重新建设一套监控体系，而是在现有 Sentry / `@castlery/observability` 的基础上，为 checkout/payment 交易链路建立统一的事件模型、字段协议和 Grafana 可视化/告警口径，最终实现交易链路全链路可见、快速定位与持续质量保障。

## 2. 设计目标

### 2.1 业务目标

- 让团队能够按阶段观察 checkout 与 payment 的转化漏斗。
- 让故障定位从“人工翻日志”收敛为“按 trace / order / payment 关联检索”。
- 让交易异常能够区分系统故障、业务失败、用户可恢复错误和第三方波动。
- 让告警基于 SLI/SLO，而不是仅依赖单点 exception 数量。
- 发布后 30 分钟内可以判断是否引入交易成功率回归。

### 2.2 技术目标

- 统一字段标准：Sentry、Grafana metrics、Loki logs、Tempo traces 使用一致上下文模型。
- 统一链路关联：同一笔交易至少可以用 `traceId`、`orderId`、`paymentId` 关联。
- 统一分层职责：Sentry 看异常与 root cause，Grafana 看指标、趋势、日志、trace、告警与 SLO。
- 统一采样策略：关键交易链路高采样，失败交易全量保留错误上下文。
- 统一安全边界：禁止上报支付敏感信息与完整 PII。

## 3. 平台职责划分

### 3.1 Sentry 负责什么

Sentry 负责“为什么失败”：

- 代码异常捕获
- 业务错误聚合
- 交易步骤 breadcrumb
- trace 视角的问题定位
- 按 `provider` / `region` / `step` / `release` 检索问题

适合放进 Sentry 的问题：

- `capturePaymentAction` 抛错
- 某支付商 SDK 初始化异常
- 某次发布导致 `create_order` 步骤大量异常
- 服务端某策略在特定市场返回 5xx

### 3.2 Grafana 负责什么

Grafana 负责“影响有多大，以及从哪里继续查”：

- 交易过程 metrics 与转化漏斗
- Loki 结构化日志检索
- Tempo / OpenTelemetry trace 查询
- Dashboard / alert rule / SLO / burn rate
- 跨版本、环境、市场、支付方式的趋势分析

适合放进 Grafana 的问题：

- 某 provider 的支付成功率从 96% 降到 72%
- 某版本上线后 checkout p95 latency 翻倍
- 某市场 `payment_redirect` timeout 升高
- `payment_callback_receive` 未到达导致 redirect provider 卡住

### 3.3 基本原则

- 错误与根因优先进入 Sentry。
- 指标、漏斗、趋势、日志查询与告警优先进入 Grafana。
- 关键业务节点同时写结构化日志与业务 metrics。
- 同一交易链路必须能在 Sentry 与 Grafana 之间互相定位。
- 不再使用 Datadog Logs / Datadog RUM 作为交易监控依赖。

## 4. 交易链路观测模型

### 4.1 标准阶段

交易模块统一拆成以下步骤，所有埋点、日志、错误、指标都必须挂靠到某一个标准阶段：

| step                       | 说明                               |
| -------------------------- | ---------------------------------- |
| `checkout_init`            | 用户进入 checkout 页面             |
| `checkout_info_fetch`      | 拉取 checkout / quote / order info |
| `address_validate`         | 地址与配送信息校验                 |
| `inventory_reserve`        | 库存预占                           |
| `promotion_apply`          | 优惠券 / promotion 计算            |
| `create_order`             | 创建交易订单                       |
| `payment_method_select`    | 用户选择支付方式                   |
| `payment_initiate`         | 创建 payment intent / transaction  |
| `payment_sdk_ready`        | 第三方 SDK 初始化完成              |
| `payment_sdk_confirm`      | SDK confirm / authorize            |
| `payment_redirect`         | 跳转型支付开始                     |
| `payment_popup`            | popup 型支付开始                   |
| `payment_callback_receive` | redirect / webhook / callback 到达 |
| `payment_capture`          | capture / finalize payment         |
| `payment_result_render`    | 成功/失败页渲染                    |

### 4.2 标准结果态

所有交易事件统一使用以下 `result` 枚举：

- `success`
- `failure`
- `timeout`
- `cancelled`
- `processing`
- `retrying`

### 4.3 错误分类

所有异常统一归类到 `errorCategory`：

- `system_error`
- `provider_error`
- `network_error`
- `validation_error`
- `business_rule_error`
- `timeout_error`
- `user_abort`
- `unknown_error`

这样可以避免把库存变化、优惠券失效、用户取消支付，全部误当成 P1 系统故障。

## 5. 统一字段规范

### 5.1 必备字段

| 字段                           | 说明                             |
| ------------------------------ | -------------------------------- |
| `domain`                       | 固定为 `checkout` 或 `payment`   |
| `step`                         | 当前交易阶段                     |
| `result`                       | 当前阶段结果                     |
| `traceId` / `trace_id`         | 单次交易追踪 ID                  |
| `attemptId` / `attempt_id`     | 单次支付尝试 ID                  |
| `orderId` / `order_id`         | 内部订单 ID                      |
| `orderNumber` / `order_number` | 业务订单号                       |
| `paymentId` / `payment_id`     | 支付 ID                          |
| `provider`                     | 支付提供商                       |
| `region`                       | `us` / `sg` / `au` / `uk` / `ca` |
| `locale`                       | 当前 locale                      |
| `env`                          | 环境                             |
| `service`                      | 服务名                           |
| `version`                      | 发布版本                         |
| `release`                      | 发布标识                         |

### 5.2 推荐业务字段

| 字段                | 说明                        |
| ------------------- | --------------------------- |
| `cartId`            | 购物车 ID                   |
| `checkoutTokenHash` | checkout token 的 hash 版本 |
| `currency`          | 币种                        |
| `paymentAmount`     | 支付金额                    |
| `paymentMethodKey`  | 页面支付方式键值            |
| `retryCount`        | 当前重试次数                |
| `httpStatus`        | HTTP 返回码                 |
| `errorCode`         | 业务错误码                  |
| `is3DS`             | 是否进入 3DS                |
| `isRedirectFlow`    | 是否为跳转支付              |
| `isFallbackFlow`    | 是否走降级分支              |

### 5.3 安全边界

禁止直接上报：

- 卡号、CVV、完整账单地址
- 完整邮箱、手机号、姓名
- 原始支付 provider payload
- 完整 checkout token / client secret
- 任何可逆的支付凭证

允许上报：

- ID、枚举、状态码、归类后的错误码
- token 的 hash / 脱敏形式
- 区间化后的金额信息
- 市场、provider、版本、阶段、结果

## 6. 关联模型设计

### 6.1 主关联键

建议按优先级统一以下关联模型：

1. `traceId`
2. `attemptId`
3. `orderId`
4. `paymentId`

### 6.2 关联原则

- 浏览器进入 checkout/payment 时生成 `traceId`。
- 同一 checkout session 内每次支付尝试生成新的 `attemptId`。
- 一旦创建订单成功，把 `orderId` 写入 Sentry scope、structured logs、metrics exemplar 或 trace attributes。
- 一旦创建 payment 成功，把 `paymentId` 写入后续所有事件。
- 前端到 BFF / server action / provider adaptor 必须透传 `traceId`。
- 服务端日志必须保留 `trace_id`，否则无法从错误回到交易全链路。

### 6.3 Header 传播

建议：

- Sentry tracing 使用 `sentry-trace` + `baggage` 透传。
- 内部 API 保留 `x-trace-id` 作为业务可检索字段。
- OpenTelemetry 使用 W3C `traceparent` / `tracestate`，由 collector 或平台层写入 Tempo。
- 日志落盘时写入 `trace_id` / `traceId` 的统一映射，避免 Loki 查询字段分裂。

## 7. Sentry 设计方案

### 7.1 与当前实现对齐

交易可观测性方案默认按以下 Sentry 架构落地：

- 客户端初始化入口：`apps/web/instrumentation-client.ts`。
- 服务端/Edge 初始化入口：`apps/web/instrumentation.js` 中分别调用 `sentry.server.config.ts` 与 `sentry.edge.config.ts` 的 `initSentry()`。
- 客户端事件治理：`instrumentation-client.ts` 的 `beforeSend` 先执行 `classifyErrorBucket`，写入 `error_bucket` / `bucket_confidence`，再执行噪音过滤规则。
- 业务侧错误上报：统一通过 `@castlery/observability` 的 `captureStructuredError` / transaction helper，不直接散写 `Sentry.captureException`。

### 7.2 Scope 与 Tag 规范

所有交易异常在捕获前，统一设置以下 tag / context：

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
- `release`

`@castlery/observability` 已提供交易专用 helper，业务侧统一复用即可：

- `trackTransactionStart` / `trackTransactionSuccess` / `trackTransactionFailure` / `trackTransactionTimeout`
- `captureTransactionError`
- `reportTransactionMessage`
- `addTransactionBreadcrumb`

这些 helper 内部会自动调用 `captureStructuredError` / `captureStructuredMessage` 上报 Sentry，并写入统一 logger；业务侧不需要手动拼 Sentry scope。

### 7.3 Breadcrumb 策略

每个关键步骤只记录高价值 breadcrumb：

- `checkout page entered`
- `payment method selected`
- `order created`
- `payment initiated`
- `3DS started`
- `redirect returned`
- `capture succeeded`

不要把每次输入框变更都写进 breadcrumb，否则 Sentry 会失真。

### 7.4 采样策略

建议采用“基础低采样 + 交易高采样”的规则采样：

- 普通页面：`0.1%` 到 `1%`
- `checkout` / `payment` 页面：`10%`
- 失败交易：`100%`
- 新支付方式上线窗口：临时提高到 `20%` 到 `50%`

建议优先使用 `tracesSampler`，按路由、`domain`、`step`、错误状态动态决策。

## 8. Grafana 设计方案

### 8.1 Transaction Event 出口

交易域不输出 Datadog RUM action。统一使用 transaction observability helper 输出交易事件，由平台侧转换为：

1. Metrics：进入 Prometheus / Mimir。
2. Logs：进入 Loki。
3. Traces：进入 Tempo / OpenTelemetry。
4. Errors：进入 Sentry。

业务 API（`@castlery/observability` 已导出）：

- `trackTransactionStart(context, options?)`
- `trackTransactionSuccess(context, options?)`
- `trackTransactionFailure(context, options?)`
- `trackTransactionTimeout(context, options?)`
- `captureTransactionError(error, context, options?)`
- `reportTransactionMessage(context, options?)`

`options.message` 自定义事件名，`options.fingerprint` 自定义 Sentry 分组，`options.skipSentry` 仅打日志不上报。Logs / Traces 出口由 logger 与 Sentry tracing 自动承接，业务侧无需重复埋点。

### 8.2 Metrics 规范

Grafana 中建议建立以下核心指标：

- `transaction_step_total`
- `transaction_step_duration_seconds`
- `transaction_retry_total`
- `transaction_callback_total`

按以下低基数维度切分：

- `env`
- `service`
- `version`
- `domain`
- `step`
- `result`
- `provider`
- `region`
- `error_category`

不要把 `trace_id`、`order_id`、`payment_id` 作为 metric label；这些字段进入 logs / traces。

### 8.3 Logs 规范

所有服务端交易日志统一输出 JSON，并保证以下 Loki 可检索字段稳定存在：

- `service`
- `env`
- `version`
- `level`
- `message`
- `domain`
- `step`
- `result`
- `provider`
- `region`
- `trace_id`
- `attempt_id`
- `order_id`
- `payment_id`
- `error_code`
- `error_category`

### 8.4 Traces 规范

服务端交易链路建议以 OpenTelemetry / Tempo 关联：

```text
Browser
  -> Server Action
    -> PaymentService
      -> ProviderStrategy
        -> Payment Backend API
```

核心 span attribute：

- `transaction.trace_id`
- `transaction.attempt_id`
- `transaction.order_id`
- `transaction.payment_id`
- `transaction.step`
- `transaction.provider`
- `transaction.region`
- `transaction.result`

### 8.5 推荐 Dashboard

至少落四类 Dashboard：

1. 交易总览 Dashboard
   展示 checkout start、order create success rate、payment success rate、整体 error rate。

2. 支付商 Dashboard
   按 `provider` 看 initiate / capture success rate、timeout rate、p95 latency。

3. 发布回归 Dashboard
   按 `version` 对比成功率、错误率、关键 API latency。

4. 市场运行 Dashboard
   按 `region` 看 provider 表现、失败原因分布、订单转化。

详见 `grafana-dashboard-spec.md`。

### 8.6 SLO 与告警

建议优先建立三个核心 SLO：

1. `Checkout Submit Success Rate`
   目标：30 天窗口 `>= 99.5%`

2. `Payment Initiate Success Rate`
   目标：30 天窗口 `>= 99.0%`

3. `Payment Capture Success Rate`
   目标：30 天窗口 `>= 98.5%`

告警建议采用 Burn Rate + 阈值双轨制：

- Burn Rate 用于发现持续性退化。
- 静态阈值用于发现瞬时大面积故障。

建议示例：

- 5 分钟 `payment_capture_failure_rate > 5%`
- 15 分钟 `payment_initiate_success_rate < 95%`
- 30 天 SLO burn rate 超阈值时通知交易 oncall

详见 `grafana-alerting-slo-spec.md`。

## 9. 埋点与日志落点建议

### 9.1 Client 侧

建议优先覆盖：

- checkout 页面进入
- 地址提交
- 优惠券应用
- 支付方式切换
- submit 按钮点击
- SDK ready / confirm / redirect start / popup start
- 成功页 / 失败页渲染

客户端事件进入 transaction helper，不依赖 Datadog RUM。

### 9.2 Server 侧

建议优先覆盖：

- create order action / API
- initiate payment action
- capture payment action
- callback / webhook adapter
- retry / fallback / rollback 分支
- provider adapter 的异常与耗时

### 9.3 第三方支付适配层

每个 provider 都必须统一输出：

- request start
- request success
- request failure
- timeout
- retry
- final result

不要把 provider 特性埋点散落在页面组件层，应该尽量收敛在 strategy / service 层。

## 10. 推荐落地架构

### 10.1 代码层抽象

业务侧统一通过 `@castlery/observability` 暴露的 transaction helper 调用，不要在组件层直接散写 `Sentry.*` / logger / metrics：

```text
libs/shared/observability
  └── transaction-observability/
      ├── index.ts     # trackTransactionStart/Success/Failure/Timeout、captureTransactionError、reportTransactionMessage
      ├── types.ts     # TransactionDomain / TransactionResult / TransactionErrorCategory / TransactionObservabilityContext
      ├── context.ts   # createTransactionContext / withTransactionResult（注入 env、region、locale、service、version）
      ├── logger.ts    # logTransactionEvent / buildTransactionMessage
      └── sentry.ts    # addTransactionBreadcrumb / captureTransactionException / captureTransactionMessage
```

统一三类 API 入口：

- `trackTransactionStart` / `trackTransactionSuccess` / `trackTransactionFailure` / `trackTransactionTimeout`（阶段事件）
- `captureTransactionError(error, context, options?)`（异常上报）
- `reportTransactionMessage(context, options?)`（业务消息 / 非异常上报）

### 10.2 推荐调用方式

页面层负责：

- 用户动作与前端阶段事件

service / action 层负责：

- 交易结果、耗时、请求上下文、异常捕获

provider strategy 层负责：

- 第三方请求级别的细粒度结果与失败原因

## 11. 分阶段落地计划

### Phase 1：标准建立

- 确定统一字段字典与 `step` 枚举。
- 确定 `traceId` / `attemptId` 生成与透传规则。
- 确定 PII 脱敏规范。
- 确定 Sentry / Grafana 平台分工。

### Phase 2：基础设施封装

- 在 `libs/shared/observability` 增加 transaction helper。
- 接入 Sentry scope/tag helper。
- 接入 Grafana metrics/logs/traces 事件出口。
- 统一 logger 字段映射。

### Phase 3：核心链路接入

- checkout 入口
- create order
- payment initiate
- payment capture
- redirect callback
- success / failure render

### Phase 4：可视化与告警

- 建立 Grafana Dashboard。
- 建立 SLO。
- 建立 Grafana Alerting / Burn Rate Alerts。
- 建立 release regression 观察视图。

### Phase 5：治理与扩展

- provider 逐个补齐。
- 优化噪音过滤。
- 补充 frontend experience telemetry 的独立方案。
- 建立 runbook 与 oncall 归因流程。

## 12. 成功标准

方案落地后，至少应达到：

- 能按 `traceId` 串起一次交易的前端动作、服务端日志、trace 和异常。
- 能按 `provider` / `region` / `version` 快速判断问题影响面。
- `payment_capture` 失败可在 5 分钟内被发现。
- 交易异常能区分系统故障与业务失败，减少无效告警。
- 发布后 30 分钟内可通过 Grafana Dashboard 判断是否出现交易回归。
- 从 Grafana alert 能跳转到对应 dashboard、Loki 查询、Tempo trace 和 Sentry issue search。

## 13. 对当前仓库的具体建议

结合"Datadog Logs / RUM 已下线"的现状，优先做以下几件事：

1. 保留 Sentry 交易高采样与错误分桶。
2. ~~将现有 Datadog transaction helper 迁移为通用 transaction event helper~~（已完成：`libs/shared/observability/src/lib/transaction-observability/` 不再依赖 `@datadog/browser-rum`，统一收敛到 Sentry helper + logger）。
3. 让交易事件同时支持 metrics/logs/traces 输出，而不是绑定 RUM action。
4. 强制服务端交易日志输出 `trace_id`、`service`、`env`、`version`。
5. 为 `create_order`、`payment_initiate`、`payment_capture` 三个步骤建立第一批 Grafana Dashboard 与 Alert。

如果按投入产出比排序，优先级建议是：

1. 统一字段和 trace 透传
2. 核心步骤 transaction event helper
3. Grafana Dashboard / Alerting
4. provider 深化治理

## 14. 参考资料

- Sentry Next.js 配置与 tracing：
  https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/environments/
- Sentry Distributed Tracing / Trace Propagation：
  https://docs.sentry.io/platforms/javascript/guides/nuxt/tracing/trace-propagation/
- Grafana Dashboards：
  https://grafana.com/docs/grafana/latest/dashboards/
- Grafana Alerting：
  https://grafana.com/docs/grafana/latest/alerting/
- Grafana Loki：
  https://grafana.com/docs/loki/latest/
- Grafana Tempo：
  https://grafana.com/docs/tempo/latest/
- Prometheus Recording Rules：
  https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
