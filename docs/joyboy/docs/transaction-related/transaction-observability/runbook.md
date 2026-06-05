# 交易可观测性 Runbook

- 作者：Codex
- 日期：2026-05-25
- 适用范围：`checkout` + `payment`
- 目标平台：Sentry + Grafana

---

## 1. 告警进入后先做什么

先看 Grafana，再看 Sentry。

原因：

1. Grafana 先回答影响面有多大。
2. Sentry 再回答具体为什么失败。

推荐顺序：

1. 打开 `Transaction Overview`。
2. 确认异常步骤是 `create_order`、`payment_initiate` 还是 `payment_capture`。
3. 看是否集中在某个 `provider` / `region` / `version`。
4. 从 Grafana 进入 Loki 查结构化日志，或进入 Tempo 查 trace。
5. 再进入 Sentry 查具体 exception / issue / stack trace。

## 2. 标准排查路径

### 2.1 create_order 异常

先看：

1. `create_order_failure_rate`
2. `create_order duration p95`
3. 是否伴随 client step error 上升

再查：

1. Loki `{step="create_order"}` 或 `trace_id=<traceId>`
2. Sentry `step:create_order`
3. 是否是 validation / network / server error
4. 是否集中在某个 region / release

### 2.2 payment_initiate 异常

先看：

1. `payment_initiate_failure_rate`
2. `top provider`
3. `top error_code`

再查：

1. Loki `{step="payment_initiate"}`
2. Tempo 中 Server Action → PaymentService → ProviderStrategy span
3. Sentry `step:payment_initiate`
4. 是否只影响某个 provider

### 2.3 payment_capture 异常

先看：

1. `payment_capture_failure_rate`
2. `payment_capture timeout_rate`
3. `payment_capture processing_rate`
4. `payment_result_render.failure`

再查：

1. Loki `{step="payment_capture"}`
2. Tempo 中 capture 相关 span duration / error
3. Sentry `step:payment_capture`
4. `provider_error` 还是 `system_error`
5. redirect callback 是否正常到达

## 3. 如何按 traceId 回溯

如果告警或客服给到：

- `traceId`
- `orderId`
- `paymentId`

排查顺序：

1. Loki 搜 `trace_id="<traceId>"`。
2. Grafana/Tempo 搜对应 trace。
3. Sentry 搜 tag `traceId:<traceId>`。
4. 对照：
   - `step`
   - `provider`
   - `result`
   - `error_code`

如果只有 `orderId`：

1. 先在 Loki 查 `order_id="<orderId>"`。
2. 找到对应 `trace_id`。
3. 再回到 Tempo 和 Sentry 继续查。

如果只有 `orderNumber`：

1. 先通过订单系统或日志找到 `order_id`。
2. 再用 `order_id -> trace_id` 回溯。

## 4. provider 故障与内部故障如何分诊

### 4.1 更像 provider 故障

特征：

1. 只影响某一个 provider。
2. `provider_error`、`timeout_error` 明显上升。
3. `payment_callback_receive` 或 `payment_capture` 异常集中。
4. 前端和服务端没有明显发布变更。

动作：

1. 标记为 provider incident。
2. 通知 payment owner。
3. 联系 provider support。
4. 评估是否需要临时隐藏该支付方式。

### 4.2 更像内部故障

特征：

1. 多个 provider 同时受影响。
2. `create_order` 和 `payment_initiate` 同时异常。
3. 与特定 `version` 明显相关。
4. Sentry 中有统一 stack trace。

动作：

1. 标记为 internal incident。
2. 通知 checkout / payment / infra owner。
3. 必要时回滚最近版本。

## 5. redirect provider 专项排查

适用：

1. `GrabPay`
2. `ZipPay`
3. 后续新增 redirect provider

步骤：

1. 先看 `payment_redirect` 是否发出。
2. 再看 `payment_callback_receive` 是否收到。
3. 再看 `payment_capture` 是否成功。
4. 最后看 `payment_result_render` 是否落到 success / failure / processing。

判断逻辑：

1. 有 redirect、无 callback

   - 更像 provider 回跳异常或 returnUrl 配置问题。

2. 有 callback、capture 失败

   - 更像 provider confirm/capture 或内部 confirm API 问题。

3. capture 成功、页面仍失败

   - 更像 payment page 恢复态或 success redirect 问题。

## 6. 用户反馈与客服协同

当客服反馈支付失败时，优先收集：

1. 下单时间
2. 市场 / 站点
3. 支付方式
4. `orderNumber`
5. 截图中的错误提示

如果能拿到 `orderNumber`，优先转成 `orderId -> traceId` 后再查日志、trace 与 Sentry。

## 7. Owner 分工

### Checkout FE

负责：

1. payment page 恢复态
2. client transaction event
3. 页面错误提示与回退流程

### Payment Domain

负责：

1. action / service / strategy
2. provider adapter
3. callback controller

### Platform / Shared

负责：

1. observability helper
2. logger 字段规范
3. Sentry / Grafana-oriented transaction event helper

### Infra / SRE

负责：

1. Grafana Dashboard
2. Grafana Alert Rules
3. SLO
4. Loki / Tempo / Prometheus 数据源
5. 告警路由

## 8. 结束条件

只有满足下面条件，incident 才能关闭：

1. 失败率恢复到阈值内。
2. root cause 已明确。
3. 是否需要补代码或平台配置已确定 owner。
4. 文档和 runbook 已更新。
