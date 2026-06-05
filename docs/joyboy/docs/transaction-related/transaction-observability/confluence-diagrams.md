# 交易可观测性图示（Confluence 版）

- 作者：Codex
- 日期：2026-05-25
- 适用范围：`checkout` + `payment`
- 适用场景：Confluence / 飞书文档 / 方案评审页面
- 目标平台：Sentry + Grafana

---

## 一、文档目标

这份文档用于在方案评审、跨团队同步和 incident 复盘时，快速说明交易链路、错误监控流转和整体架构。

建议在 Confluence 中按以下顺序展示：

1. 支付主链路时序图
2. Redirect provider callback 时序图
3. 错误监控流转图
4. 整体架构图

## 二、支付主链路时序图

说明：

- 适用于 `Stripe`、`2C2P`、`PayPal popup`、`Affirm popup`、`GrabPay`、`ZipPay`
- 覆盖从 payment page 到 backend confirm 的完整链路
- 包含 transaction helper、Grafana stack 与 Sentry 的关键上报点
- 不再依赖 Datadog RUM action

```mermaid
sequenceDiagram
  autonumber
  participant User as 用户
  participant PaymentPage as Payment Page
  participant Tx as Transaction Helper
  participant Action as Server Action
  participant Service as Payment Service
  participant Strategy as Provider Strategy
  participant Backend as Payment Backend API
  participant Grafana as Grafana/Loki/Tempo/Prometheus
  participant Sentry as Sentry

  User->>PaymentPage: 选择支付方式 / 点击支付
  PaymentPage->>Tx: payment_method_select
  PaymentPage->>Tx: create_order.started
  PaymentPage->>PaymentPage: createTransactionOrder()
  Note right of PaymentPage: 客户端直接调用，非 Server Action
  PaymentPage-->>PaymentPage: orderId / orderNumber
  PaymentPage->>Tx: create_order.success

  PaymentPage->>Tx: payment_initiate.started
  PaymentPage->>Action: initiatePaymentAction(traceId, attemptId)
  Action->>Service: processPayment(traceId)
  Service->>Strategy: initiatePaymentIntent
  Strategy->>Backend: /payment/initiate + x-trace-id + traceparent
  Backend-->>Strategy: paymentId + action
  Strategy-->>Service: initiate result
  Service-->>Action: action schema
  Action-->>PaymentPage: SDK_CONFIRM / SDK_POPUP / REDIRECT / SUCCESS
  PaymentPage->>Tx: payment_initiate.success

  alt SDK_CONFIRM
    PaymentPage->>Tx: payment_sdk_ready
    PaymentPage->>Tx: payment_sdk_confirm
    PaymentPage->>Action: capturePaymentAction
  else SDK_POPUP
    PaymentPage->>Tx: payment_popup
    PaymentPage->>Action: capturePaymentAction
  else REDIRECT
    PaymentPage->>Tx: payment_redirect
    PaymentPage-->>User: 跳转到第三方支付页
  else SUCCESS
    PaymentPage->>Action: capturePaymentAction
  end

  Action->>Service: capturePayment(traceId)
  Service->>Strategy: capturePayment
  Strategy->>Backend: /payment/confirm + x-trace-id + traceparent
  Backend-->>Strategy: capture result
  Strategy-->>Service: success / failure / processing
  Service-->>Action: capture result

  Tx->>Grafana: metrics + logs + trace attributes

  alt success
    Action-->>PaymentPage: success
    PaymentPage->>Tx: payment_result_render.success
  else failure / processing
    Action-->>PaymentPage: failure / processing
    PaymentPage->>Tx: payment_result_render.failure|processing
    Action->>Sentry: exception / structured failure
  end
```

## 三、Redirect Provider Callback 时序图

说明：

- 当前已落地：`GrabPay`、`ZipPay`
- 后续新增 redirect provider 可以复用同一模式
- callback route 是服务端控制页，不承载用户可见 UI

```mermaid
sequenceDiagram
  autonumber
  participant PaymentPage as Payment Page
  participant Provider as 第三方支付页
  participant Callback as Callback Route
  participant Tx as Transaction Helper
  participant Service as Payment Service
  participant Strategy as Provider Strategy
  participant Backend as Payment Backend API
  participant Grafana as Grafana/Loki/Tempo
  participant Sentry as Sentry

  PaymentPage->>Provider: redirectUrl
  Provider-->>Callback: returnUrl callback
  Callback->>Tx: payment_callback_receive

  alt callback 参数无效
    Callback->>Tx: payment_callback_receive.failure
    Callback-->>PaymentPage: redirect /checkout/payment?paymentStatus=failure
  else callback 参数有效
    Callback->>Service: capturePayment(traceId, orderId, paymentId)
    Service->>Strategy: capturePayment
    Strategy->>Backend: /payment/confirm
    Backend-->>Strategy: success / failure / processing
    Strategy-->>Service: capture result
    Service-->>Callback: capture result

    alt success
      Callback-->>PaymentPage: redirect /checkout/success
    else processing
      Callback-->>PaymentPage: redirect /checkout/payment?paymentStatus=processing
    else failure
      Callback-->>PaymentPage: redirect /checkout/payment?paymentStatus=failure
      Callback->>Sentry: provider_error / system_error
    end
  end

  Tx->>Grafana: logs + metrics + trace attributes
  PaymentPage->>Tx: payment_result_render
```

## 四、错误监控流转图

说明：

- 展示同一个错误如何进入 Sentry、Loki、Prometheus/Mimir、Tempo 和 Grafana Alerting
- 强调“根因看 Sentry，影响面看 Grafana”

```mermaid
flowchart TD
  A[交易事件发生] --> B{事件类型}

  B -->|系统异常| C[Sentry captureTransactionError]
  B -->|业务失败| D[transaction event result=failure]
  B -->|用户可恢复错误| E[transaction event result=cancelled/failure]
  B -->|成功事件| F[transaction event result=success]

  C --> G[Sentry Issue / Trace]
  C --> H[结构化日志]

  D --> H
  E --> H
  F --> H

  H --> I[Loki Logs]
  D --> J[Prometheus / Mimir Metrics]
  E --> J
  F --> J
  D --> K[Tempo Trace]

  I --> L[Grafana Dashboard / Alerting / SLO]
  J --> L
  K --> L
  L --> M[Alert]
  M --> N[Runbook]
  G --> O[Root Cause 分析]
  N --> O
```

## 五、整体架构图

说明：

- 从前端页面、应用层、支付域到 observability 平台的整体关系
- 适合放在方案首页或评审 PPT 中

```mermaid
flowchart LR
  subgraph Client["客户端 / Web App"]
    PaymentPage["Payment Page"]
    SuccessPage["Success Page"]
    GrabPayCallback["GrabPay Callback"]
    ZipPayCallback["ZipPay Callback"]
  end

  subgraph App["应用层"]
    ServerActions["Server Actions<br/>initiatePaymentAction<br/>capturePaymentAction"]
  end

  subgraph Domain["支付域"]
    PaymentService["PaymentService"]
    StrategyFactory["PaymentStrategyFactory"]
    Strategies["Provider Strategies<br/>Stripe / GrabPay / ZipPay / PayPal / Affirm / 2C2P"]
    BackendAPI["Payment Backend API"]
  end

  subgraph Observability["可观测性层"]
    TxObs["transaction-observability"]
    Logger["Structured Logger"]
    Metrics["Metrics Exporter"]
    OTel["OpenTelemetry"]
    SentryNode["Sentry"]
    Loki["Loki"]
    Prometheus["Prometheus / Mimir"]
    Tempo["Tempo"]
    Grafana["Grafana"]
  end

  PaymentPage --> ServerActions
  GrabPayCallback --> PaymentService
  ZipPayCallback --> PaymentService

  ServerActions --> PaymentService
  PaymentService --> StrategyFactory
  StrategyFactory --> Strategies
  Strategies --> BackendAPI

  PaymentPage --> TxObs
  SuccessPage --> TxObs
  GrabPayCallback --> TxObs
  ZipPayCallback --> TxObs
  ServerActions --> TxObs
  PaymentService --> TxObs
  Strategies --> TxObs

  TxObs --> Logger
  TxObs --> Metrics
  TxObs --> OTel
  TxObs --> SentryNode

  Logger --> Loki
  Metrics --> Prometheus
  OTel --> Tempo

  Loki --> Grafana
  Prometheus --> Grafana
  Tempo --> Grafana
  SentryNode --> Grafana
```

## 六、汇报时建议怎么讲

如果你要在 Confluence 页面里讲这套方案，建议按下面顺序：

1. 先用“整体架构图”说明边界和职责。
2. 再用“支付主链路时序图”说明正常流程。
3. 再用“redirect callback 时序图”说明 GrabPay / ZipPay 特殊闭环。
4. 最后用“错误监控流转图”说明为什么 Sentry 和 Grafana 要同时建设。

一句话总结：

> Sentry 回答为什么失败，Grafana 回答影响有多大，以及从哪个日志、trace、dashboard 继续查。

## 七、当前边界说明

1. `GrabPay` 和 `ZipPay` callback 已按图落地。
2. `Affirm` 还没有画 callback 闭环，因为当前仓库里仍存在 `SDK_POPUP` / `REDIRECT` 分叉。
3. `PayPal` 当前更接近 popup 模式，所以没有单独展开 callback controller 图。
4. 前端体验侧 telemetry 不纳入本次交易核心监控验收，后续可作为独立 Web Experience 方案补充。
