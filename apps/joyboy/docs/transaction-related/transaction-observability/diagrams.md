# 支付可观测性图示

- 作者：Codex
- 日期：2026-05-25
- 适用范围：`checkout` + `payment`
- 目标平台：Sentry + Grafana

---

## 图例

| 标记 | 含义 |
| --- | --- |
| `[SA]` | Next.js Server Action（内部服务端） |
| `[BE]` | Payment Backend API（内部后端） |
| `[OBS]` | 可观测性平台（Sentry / Grafana / Loki / Tempo / Prometheus） |
| 无标记 | 客户端页面 / 内部 Domain Service |

## 1. 支付主链路时序图

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant P as Payment Page
  participant T as Transaction Helper
  participant A as [SA] Server Action
  participant S as Payment Service
  participant ST as Provider Strategy
  participant BE as [BE] Payment Backend API
  participant G as [OBS] Grafana Stack
  participant SE as [OBS] Sentry

  U->>P: 选择 payment method / 点击支付
  P->>T: payment_method_select

  rect rgb(220, 255, 255)
    Note over P: createTransactionOrder — 客户端直接调用（非 Server Action）
    P->>T: create_order.started
    P->>P: createTransactionOrder()
    P-->>P: orderId / orderNumber
    P->>T: create_order.success
  end

  P->>T: payment_initiate.started
  P->>A: initiatePaymentAction(traceId, attemptId, orderId, provider)

  rect rgb(220, 230, 255)
    Note over A,BE: OpenTelemetry / Tempo 服务端追踪范围
    A->>S: processPayment(traceId)
    S->>ST: initiatePaymentIntent
    ST->>BE: /payment/initiate + x-trace-id + traceparent + sentry-trace + baggage
    BE-->>ST: paymentId + action
    ST-->>S: initiate result
    S-->>A: action schema
  end

  A-->>P: SDK_CONFIRM / SDK_POPUP / REDIRECT / SUCCESS
  P->>T: payment_initiate.success

  alt SDK_CONFIRM
    P->>T: payment_sdk_ready
    P->>T: payment_sdk_confirm.started
    P->>P: SDK confirm
    P->>A: capturePaymentAction(traceId, paymentId)
  else SDK_POPUP
    P->>T: payment_popup
    P->>P: popup callback
    P->>A: capturePaymentAction(traceId, paymentId)
  else SUCCESS
    P->>A: capturePaymentAction(traceId, paymentId)
  else REDIRECT
    P->>T: payment_redirect
    P-->>U: redirect to provider
  end

  rect rgb(220, 230, 255)
    Note over A,BE: OpenTelemetry / Tempo 服务端追踪范围
    A->>S: capturePayment(traceId)
    S->>ST: capturePayment
    ST->>BE: /payment/confirm + x-trace-id + traceparent + sentry-trace + baggage
    BE-->>ST: capture result
    ST-->>S: success / failure / processing
    S-->>A: capture result
  end

  T->>G: metrics + logs + traces

  alt capture success
    A-->>P: success
    P->>T: payment_result_render.success
  else capture failure or processing
    A-->>P: error / processing
    P->>T: payment_result_render.failure|processing
    A->>SE: capture exception or structured business failure
  end
```

## 2. Redirect Provider Callback 时序图

适用：

1. `GrabPay`
2. `ZipPay`
3. 后续新增 redirect provider

```mermaid
sequenceDiagram
  autonumber
  participant P as Payment Page
  participant PR as Provider Site
  participant CB as Callback Route
  participant T as Transaction Helper
  participant S as Payment Service
  participant ST as Provider Strategy
  participant BE as [BE] Payment Backend API
  participant G as [OBS] Grafana Stack
  participant SE as [OBS] Sentry

  P->>PR: redirectUrl
  Note over P,PR: URL 带 orderId / paymentId / traceId / provider

  PR-->>CB: returnUrl callback
  CB->>T: payment_callback_receive

  alt callback params invalid
    CB->>T: payment_callback_receive.failure
    CB-->>P: redirect back to /checkout/payment?paymentStatus=failure
  else callback params valid
    rect rgb(220, 230, 255)
      Note over CB,BE: OpenTelemetry / Tempo callback capture trace
      CB->>S: capturePayment(traceId, orderId, paymentId)
      S->>ST: capturePayment
      ST->>BE: /payment/confirm + x-trace-id + traceparent + sentry-trace + baggage
      BE-->>ST: success / failure / processing
      ST-->>S: capture result
      S-->>CB: capture result
    end

    alt success
      CB-->>P: redirect /checkout/success
    else processing
      CB-->>P: redirect /checkout/payment?paymentStatus=processing
    else failure
      CB-->>P: redirect /checkout/payment?paymentStatus=failure
      CB->>SE: provider_error / system_error
    end
  end

  CB->>G: logs + metrics + trace attributes
  P->>T: payment_result_render
```

## 3. 错误监控流转图

```mermaid
flowchart TD
  A[交易事件发生] --> B{事件类型}

  B -->|系统异常| C[Sentry captureTransactionError]
  B -->|业务失败| D[transaction event skipSentry?]
  B -->|用户可恢复错误| E[transaction event result=failure]
  B -->|正常成功| F[transaction event result=success]

  C --> G[Sentry Issue / Trace]
  C --> H[结构化日志]

  D --> H
  E --> H
  F --> H

  H --> I[Loki Logs]
  D --> J[Prometheus / Mimir Metrics]
  E --> J
  F --> J
  D --> O[Tempo Trace]

  I --> K[Grafana Dashboard / Alerting / SLO]
  J --> K
  O --> K
  G --> L[Root Cause 分析]
  K --> M[Alert]
  M --> N[Runbook]
  N --> L

  classDef sentry fill:#6c3483,color:#fff,stroke:#5b2c6f
  classDef grafana fill:#f46800,color:#fff,stroke:#c95a00
  classDef internal fill:#2471a3,color:#fff,stroke:#1a5276

  class C,G sentry
  class I,J,K,M,O grafana
  class D,E,F,H,L,N internal
```

## 4. 整体架构图

```mermaid
flowchart LR
  subgraph UI[Client / Web App]
    PP[Payment Page]
    SP[Success Page]
    GP[GrabPay Callback Page]
    ZP[ZipPay Callback Page]
  end

  subgraph App[Application Layer]
    ACT["[SA] Server Actions\ninitiatePaymentAction\ncapturePaymentAction"]
  end

  subgraph Domain[Payment Domain]
    PSV[PaymentService]
    STF[PaymentStrategyFactory]
    STR[Provider Strategies\nStripe / GrabPay / ZipPay / PayPal / Affirm / 2C2P]
    API["[BE] Payment Backend API"]
  end

  subgraph Obs[Observability Layer]
    TO[transaction-observability]
    LOG[Structured Logger]
    MET[Metrics Exporter]
    OTEL[OpenTelemetry]
    SEN[Sentry]
    LOKI[Loki]
    PROM[Prometheus / Mimir]
    TEMPO[Tempo]
    GRA[Grafana]
  end

  PP --> ACT
  GP --> PSV
  ZP --> PSV

  ACT --> PSV
  PSV --> STF
  STF --> STR
  STR --> API

  PP --> TO
  SP --> TO
  GP --> TO
  ZP --> TO
  ACT --> TO
  PSV --> TO
  STR --> TO

  TO --> LOG
  TO --> MET
  TO --> OTEL
  TO --> SEN

  LOG --> LOKI
  MET --> PROM
  OTEL --> TEMPO

  LOKI --> GRA
  PROM --> GRA
  TEMPO --> GRA
  SEN --> GRA

  classDef serverAction fill:#e67e22,color:#fff,stroke:#ca6f1e
  classDef backendApi fill:#2471a3,color:#fff,stroke:#1a5276
  classDef thirdParty fill:#6c3483,color:#fff,stroke:#5b2c6f
  classDef grafana fill:#f46800,color:#fff,stroke:#c95a00

  class ACT serverAction
  class API backendApi
  class SEN thirdParty
  class GRA,LOKI,PROM,TEMPO grafana
```

## 5. 图示说明

1. `createTransactionOrder` 为客户端直接调用（非 Server Action）。
2. `[SA]` Server Action 仅负责 `initiatePaymentAction` 和 `capturePaymentAction`，不包含下单逻辑。
3. `[BE]` Payment Backend API 接收含 `x-trace-id`、`traceparent`、`sentry-trace`、`baggage` 的请求头。
4. Grafana stack 负责影响面、趋势、日志查询、trace 查询、alerting 和 SLO。
5. Sentry 负责异常聚合、root cause、stack trace 和错误分桶。
6. `Affirm` 当前故意没有画 callback route 闭环，因为仓库现状仍存在 `SDK_POPUP` 与 strategy `REDIRECT` 分叉。
7. `PayPal` 也没有单独展开 callback route，因为当前前端实际用法偏 `SDK_POPUP`。
8. 当前已真实落地的 redirect callback 只有：
   - `GrabPay`
   - `ZipPay`
