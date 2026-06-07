---
confluence_id: "3936616449"
title: "Transaction Observability Tech Plan"
status: current
parent_id: "2583822375"
depth: 1
domain: transaction
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3936616449
local_joyboy_doc: "docs/joyboy/docs/transaction-related/transaction-observability/README.md"
blog_post: null
---
## 1. 背景

交易链路是 Joyboy 核心的业务闭环。Sentry 和 Datadog 已完成平台级初始化，具备坚实的可观测性基础。本方案将在此基础上，为 checkout/payment 交易链路建立统一的事件模型与标准观测协议，带来以下收益：

- 支持按交易 ID 串联前后端上下文，将故障定位从人工翻日志升级为精准定向查询
- 清晰区分系统故障、业务失败与第三方支付商波动，实现快速精准分诊
- 建立基于成功率的告警体系，从事后感知升级为实时预警
- 发布后 30 分钟内即可判断是否引入交易回归，显著缩短问题暴露窗口
本方案目标不是重建监控体系，而是在现有基础上建立统一的交易观测模型，最终实现交易链路的全链路可见、快速定位与持续质量保障。

## 2. 方案目标

| 目标 | 描述 |
| 链路串联 | 同一笔交易可用 `traceId`、`orderId`、`paymentId` 在 Sentry、Datadog Logs、Datadog RUM 中相互定位 |
| 问题分层 | 系统故障、业务失败、用户可恢复错误、第三方波动四类问题有明确分诊路径 |
| 成功率告警 | 核心步骤（下单、支付发起、支付捕获）有基于成功率的 Monitor 和 SLO |
| 发布回归感知 | 发布后 30 分钟内可通过 Dashboard 判断交易成功率是否下降 |
| Provider 钻取 | 可按支付商、市场、版本下钻查看故障影响面 |


## 3. 整体架构

### 3.1 架构分层图

```
flowchart LR
  subgraph UI["客户端 / Web App"]
    PP["Payment Page"]
    SP["Success Page"]
    GP["GrabPay Callback"]
    ZP["ZipPay Callback"]
    DD["DatadogInit / RUM"]
  end

  subgraph App["应用层"]
    ACT["Server Actions\ninitiatePaymentAction\ncapturePaymentAction"]
  end

  subgraph Domain["支付域"]
    PSV["PaymentService"]
    STF["PaymentStrategyFactory"]
    STR["Provider Strategies\nStripe / GrabPay / ZipPay / PayPal / Affirm / 2C2P"]
    API["Payment Backend API"]
  end

  subgraph Obs["可观测性层（第三方平台）"]
    TO["transaction-observability"]
    LOG["Structured Logger"]
    SEN["Sentry"]
    DDR["Datadog RUM / Logs / Dashboards / Monitors"]
    DAPM["Datadog APM"]
  end

  PP --> ACT
  SP --> DD
  GP --> PSV
  ZP --> PSV
  PP --> DD
  ACT --> PSV
  PSV --> STF
  STF --> STR
  STR --> API
  ACT -.-> DAPM
  API -.-> DAPM
  PP --> TO
  SP --> TO
  GP --> TO
  ZP --> TO
  ACT --> TO
  PSV --> TO
  STR --> TO
  TO --> LOG
  TO --> SEN
  TO --> DDR
  DD --> DDR
  LOG --> DDR

  classDef serverAction fill:#e67e22,color:#fff,stroke:#ca6f1e
  classDef backendApi fill:#2471a3,color:#fff,stroke:#1a5276
  classDef thirdParty fill:#6c3483,color:#fff,stroke:#5b2c6f
  class ACT serverAction
  class API backendApi
  class SEN,DDR,DAPM thirdParty
```

### 3.2 架构说明

| 层级 | 组件 | 职责 |
| 客户端 | Payment Page、Callback Pages | 用户操作、RUM 事件上报 |
| 应用层 | Server Actions（橙色） | 业务入口，透传 traceId，上报服务端日志与 Sentry |
| 支付域 | PaymentService + Strategies | 支付逻辑，Provider 适配，结构化日志 |
| 后端 API | Payment Backend API（蓝色） | 内部后端，接收 trace headers，Datadog APM 自动采集 span |
| 可观测性层 | transaction-observability（紫色） | 统一封装，屏蔽直接调用 Sentry / Datadog |


## 4. 支付链路阶段模型

方案将支付主链路统一拆分为 15 个标准阶段，所有埋点、日志、告警均挂靠到某一标准阶段：

| 阶段 | 说明 | 执行侧 |
| `checkout_init` | 进入 checkout 页面 | 客户端 |
| `checkout_info_fetch` | 拉取 checkout / quote 信息 | 客户端 |
| `address_validate` | 地址校验 | 客户端 |
| `inventory_reserve` | 库存预占 | 服务端 |
| `promotion_apply` | 优惠券 / 促销计算 | 服务端 |
| `create_order` | 创建交易订单 | **客户端直接调用（非 Server Action）** |
| `payment_method_select` | 用户选择支付方式 | 客户端 |
| `payment_initiate` | 创建 payment intent | Server Action → 支付域 |
| `payment_sdk_ready` | 第三方 SDK 初始化完成 | 客户端 |
| `payment_sdk_confirm` | SDK confirm / authorize | 客户端 + Server Action |
| `payment_redirect` | 跳转型支付开始 | 客户端 |
| `payment_popup` | Popup 型支付开始 | 客户端 |
| `payment_callback_receive` | Redirect callback 到达 | Callback Route（服务端） |
| `payment_capture` | Capture / finalize payment | Server Action → 支付域 |
| `payment_result_render` | 成功 / 失败页渲染 | 客户端 |


### 支付主链路时序图（简化版）

```
sequenceDiagram
  autonumber
  participant U as 用户
  participant P as Payment Page
  participant R as Datadog RUM
  participant DAPM as Datadog APM
  participant A as Server Action
  participant S as PaymentService
  participant BE as Payment Backend API
  participant SE as Sentry

  U->>P: 选择支付方式 / 点击支付

  rect rgb(220, 255, 220)
    Note over P: create_order — 客户端直接调用
    P->>R: create_order.started
    P->>P: createTransactionOrder()
    P-->>P: orderId / orderNumber
    P->>R: create_order.success
  end

  P->>A: initiatePaymentAction(traceId, attemptId, orderId, provider)

  rect rgb(220, 230, 255)
    Note over A,BE: Datadog APM 服务端追踪（span: initiatePaymentAction）
    A->>S: processPayment(traceId)
    S->>BE: /payment/initiate + x-datadog-trace-id + sentry-trace
    BE--)DAPM: span 上报（APM agent 自动采集）
    BE-->>S: paymentId + action
    S-->>A: action schema
  end

  A-->>P: SDK_CONFIRM / SDK_POPUP / REDIRECT / SUCCESS

  rect rgb(220, 230, 255)
    Note over A,BE: Datadog APM 服务端追踪（span: capturePaymentAction）
    A->>S: capturePayment(traceId)
    S->>BE: /payment/confirm + x-datadog-trace-id + sentry-trace
    BE--)DAPM: span 上报
    BE-->>S: success / failure / processing
    S-->>A: capture result
  end

  alt capture success
    A-->>P: success
    P->>R: payment_result_render.success
  else capture failure
    A-->>P: error
    P->>R: payment_result_render.failure
    A->>SE: captureTransactionError
  end
```

## 5. 平台职责分工

### 5.1 分工原则

> **Sentry** 看「为什么失败」，**Datadog** 看「影响有多大」。

| 问题类型 | 优先平台 | 典型场景 |
| 代码异常 / Root Cause | Sentry | payment capture 抛错、SDK 初始化失败 |
| 业务成功率下降 | Datadog | 某 provider 成功率从 96% 降至 72% |
| 发布回归 | Datadog | 某版本上线后 p95 latency 翻倍 |
| 跨版本趋势分析 | Datadog | 多版本成功率对比 |
| 服务端调用链追踪 | Datadog APM | Server Action → PaymentService → Backend 全链路 span |


### 5.2 三平台协作关系

```
flowchart TD
  E[交易事件发生] --> T{事件类型}

  T -->|系统异常| A[Sentry captureTransactionError]
  T -->|业务失败| B[结构化日志 + Datadog Logs]
  T -->|用户可恢复错误| C[Datadog RUM addError]
  T -->|正常成功| D[Datadog RUM addAction/addTiming]
  T -->|服务端调用链| F[Datadog APM 自动采集 span]

  A --> G[Sentry Issue / Trace → Root Cause 分析]
  B --> H[Datadog Logs → Monitors / SLO]
  C --> H
  D --> H
  F --> H

  H --> I[Alert → Runbook → 归因]
```

## 6. 统一追踪与字段模型

### 6.1 关联键体系

| 关联键 | 生成时机 | 用途 |
| `traceId` | 进入 payment 页面时生成 | 串联一次交易的所有前后端事件 |
| `attemptId` | 每次发起支付时生成 | 区分同一订单的多次支付尝试 |
| `orderId` | 下单成功后写入 | 关联订单与支付 |
| `paymentId` | payment initiate 成功后写入 | 关联 initiate / capture / callback |


### 6.2 Header 传播链路

```
Browser (traceId + sentry-trace + baggage)
  → Server Action (x-trace-id + x-datadog-trace-id + sentry-trace + baggage)
    → Payment Backend API
      → Datadog APM (span 自动关联)
      → Sentry Trace (sentry-trace 关联)
```

### 6.3 必备上报字段

| 字段 | 说明 |
| `domain` | `checkout` 或 `payment` |
| `step` | 当前交易阶段 |
| `result` | `success` / `failure` / `timeout` / `processing` / `cancelled` |
| `provider` | 支付商 |
| `region` | 市场 |
| `traceId` / `attemptId` / `orderId` / `paymentId` | 关联键 |
| `env` / `service` / `version` | Datadog 统一标签 |
| `errorCategory` | 错误分类（`system_error` / `provider_error` / `timeout_error` 等） |


## 7. 告警与 SLO 体系

### 7.1 核心 SLO

| SLO 名称 | 定义 | 目标 |
| **Checkout Submit Success Rate** | `create_order result:success` / `create_order all` | >= 99.5% / 30d |
| **Payment Initiate Success Rate** | `payment_initiate result:success` / `payment_initiate all` | >= 99.0% / 30d |
| **Payment Capture Success Rate** | `payment_capture result:success` / `payment_capture all` | >= 98.5% / 30d |


### 7.2 核心 Monitors

| Monitor | 触发条件 | 告警级别 |
| `payment_capture_failure_rate` | 5 分钟 failure rate > 8% | Critical |
| `payment_capture_failure_rate` | 5 分钟 failure rate > 5% | Warning |
| `payment_initiate_failure_rate` | 5 分钟 failure rate > 5% | Critical |
| `create_order_failure_rate` | 5 分钟 failure rate > 2% | Warning |
| `provider_timeout_spike` | 15 分钟 timeout rate > 3% | Warning |


### 7.3 Burn Rate Alert（以 Payment Capture 为例）

| 级别 | 短窗口（1h） | 长窗口（6h） |
| Critical | burn rate > 14 | burn rate > 7 |
| Warning | burn rate > 6 | burn rate > 3 |


### 7.4 推荐 Dashboard 体系

| Dashboard | 用途 |
| Transaction Overview | 整体 KPI、漏斗趋势、错误分布、延迟 |
| Transaction Provider Drilldown | 按支付商查 initiate / capture / timeout |
| Transaction Release Regression | 版本对比，发布后 30 分钟判断回归 |
| Transaction Region Health | 按市场看 provider 差异与成功率 |


## 8. Redirect Provider 特殊闭环

**GrabPay**、**ZipPay** 采用 redirect 跳转模式，需要独立的 callback route 处理返回后的 capture 流程。

```
sequenceDiagram
  autonumber
  participant P as Payment Page
  participant PR as 第三方支付页
  participant CB as Callback Route
  participant S as PaymentService
  participant BE as Payment Backend API
  participant R as Datadog RUM/Logs
  participant SE as Sentry

  P->>PR: redirectUrl（含 traceId / orderId / paymentId）
  PR-->>CB: returnUrl callback
  CB->>R: payment_callback_receive

  alt callback 参数有效
    CB->>S: capturePayment(traceId, orderId, paymentId)
    S->>BE: /payment/confirm + x-datadog-trace-id + sentry-trace
    BE-->>S: success / failure / processing
    S-->>CB: capture result

    alt success
      CB-->>P: redirect /checkout/success
    else processing
      CB-->>P: redirect /checkout/payment?paymentStatus=processing
    else failure
      CB-->>P: redirect /checkout/payment?paymentStatus=failure
      CB->>SE: provider_error / system_error
    end
  end

  P->>R: payment_result_render
```

**当前落地情况：**

- GrabPay callback route — 已落地
- ZipPay callback route — 已落地
- Affirm callback route — 待确认（当前仓库存在 SDK_POPUP / REDIRECT 分叉，需先对齐支付模式）
## 9. 落地现状

### 已完成

| 模块 | 状态 |
| 删除旧版 transaction-monitoring，新建 transaction-observability | ✅ 完成 |
| 统一交易字段字典（types.ts） | ✅ 完成 |
| Sentry 交易 helper（captureTransactionError、setTransactionScope） | ✅ 完成 |
| Datadog RUM helper（trackTransactionAction、trackTransactionError、trackTransactionTiming） | ✅ 完成 |
| traceId / attemptId 生成与透传（前端 → Server Action → Service → Strategy） | ✅ 完成 |
| Sentry 规则采样（交易链路高采样，失败全量保留） | ✅ 完成 |
| payment action / service / strategy 主链路接入 | ✅ 完成 |
| payment_method_select、payment_initiate、payment_capture、payment_result_render 埋点 | ✅ 完成 |
| GrabPay redirect callback 闭环 | ✅ 完成 |
| ZipPay redirect callback 闭环 | ✅ 完成 |
| DatadogInit 挂载至 root layout | ✅ 完成 |


### 进行中 / 待完成

| 模块 | 状态 |
| Datadog Dashboard 建立 | ⬜ 未开始 |
| Datadog Monitors 配置 | ⬜ 未开始 |
| SLO 配置 | ⬜ 未开始 |
| Burn Rate Alert 配置 | ⬜ 未开始 |
| Affirm callback route 闭环 | 🔶 待确认支付模式 |
| UAT 验证（traceId 关联 Sentry / Logs / RUM） | 🔶 待完成 |
| Runbook 演练 | 🔶 待完成 |


## 10. 待完成事项

### P0（平台侧，由 Infra / SRE 主导）

1. - 确认 Datadog 中以下字段已可检索（Facet 校验）：`trace_id`、`step`、`result`、`provider`、`region`、`error_category`、`order_id`、`payment_id`
2. - 建立 **Transaction Overview** Dashboard（KPI + 漏斗 + 错误分布 + 延迟）
3. - 建立 3 条核心 Monitor：`payment_capture_failure_rate`、`payment_initiate_failure_rate`、`create_order_failure_rate`
### P1（平台侧 + 业务侧协作）

1. - 建立 Provider Drilldown、Release Regression、Region Health Dashboard
2. - 配置 Payment Capture 与 Payment Initiate SLO
3. - 配置 Burn Rate Alert（双窗口 warning / critical）
4. - Affirm callback route 确认并接入
### P2（完善与演练）

1. - UAT 场景全覆盖验证（下单失败、支付失败、redirect 失败、超时重试）
2. - Runbook 桌面演练（按 traceId 回溯、provider 故障分诊）
3. - Session Replay 采样策略优化
## 11. 实施细节文档索引

| 文档 | 内容 |
| [README.md](https://github.com/castlery/joyboy/blob/abby/transaction-observability/docs/transaction-related/transaction-observability/README.md) | 完整技术方案，含设计目标、字段规范、Sentry / Datadog 设计 |
| [diagrams.md](https://github.com/castlery/joyboy/blob/abby/transaction-observability/docs/transaction-related/transaction-observability/diagrams.md) | 带颜色标注的支付链路时序图、错误监控流转图、整体架构图 |
| [datadog-dashboard-spec.md](https://github.com/castlery/joyboy/blob/abby/transaction-observability/docs/transaction-related/transaction-observability/datadog-dashboard-spec.md) | Dashboard 结构、指标口径、查询建议 |
| [monitors-slo-spec.md](https://github.com/castlery/joyboy/blob/abby/transaction-observability/docs/transaction-related/transaction-observability/monitors-slo-spec.md) | Monitor 阈值、SLI 定义、Burn Rate Alert 配置 |
| [runbook.md](https://github.com/castlery/joyboy/blob/abby/transaction-observability/docs/transaction-related/transaction-observability/runbook.md) | 告警排查路径、traceId 回溯、provider 故障分诊 |
| [platform-implementation-plan.md](https://github.com/castlery/joyboy/blob/abby/transaction-observability/docs/transaction-related/transaction-observability/platform-implementation-plan.md) | 平台侧任务拆分、owner 分工、建议执行顺序 |


## 12. TODOS

1. Datadog RUM部分功能未开启，所以需要更新设计，不再依赖RUM