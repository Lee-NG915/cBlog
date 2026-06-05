# 可观测平台迁移指引 - Observability platform migration guide

> 来源: [Confluence - 可观测平台迁移指引](https://castlery.atlassian.net/wiki/spaces/TEC/pages/3542089779/-+Observability+platform+migration+guide)

## 目录

- [背景](#背景)
- [比较](#比较)
- [常用功能](#常用功能)
  - [Log](#log)
  - [Tracing](#tracing)
  - [Monitor](#monitor)
  - [Dashboard](#dashboard)
- [其它参考](#其它参考)
- [问题](#问题)

---

## 背景

可观测平台采用 **Grafana + Loki + Tempo + Prometheus** 的开源方案代替 Datadog，降低使用成本。详细背景可参考：

- [云原生可观测平台 - 9/5000 Cloud-native observability platform](https://castlery.atlassian.net/wiki/spaces/TEC/pages/3037167633/-+9+5000+Cloud-native+observability+platform)
- [云原生日志采集调研](https://castlery.atlassian.net/wiki/spaces/TEC/pages/3331391496)

> 本指引使用的环境为 <https://grafana-ssvc-apse1.cslr.io/>，版本为 **Grafana v10.3.3**。

---

## 比较

### 工作量

| 工作量       | Grafana + Loki + Tempo + Prometheus | Datadog     |
| ------------ | ----------------------------------- | ----------- |
| 接入（开发） | 无                                  | 无          |
| 接入（运维） | 有                                  | 有          |
| 监控配置     | ✅ 统一配置                         | ✅ 统一配置 |

### Log

| Log                | Grafana + Loki                                                                                                                                         | Datadog                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| 日志内容搜索       | ✅ 支持                                                                                                                                                | ✅ 支持                 |
| 日志内容解析为标签 | ✅ 支持 [logfmt](https://grafana.com/docs/loki/latest/query/log_queries/#logfmt)、[json](https://grafana.com/docs/loki/latest/query/log_queries/#json) | ✅ 支持 Datadog 规则    |
| 关联 trace         | ✅ 自动关联 [Derived fields](https://grafana.com/docs/grafana/latest/datasources/loki/configure-loki-data-source/#derived-fields)                      | ✅ 自动关联             |
| 保存时长           | 自定义（当前未限制）                                                                                                                                   | 7 天                    |
| 查询速度           | 最近一天：快（< 150ms）；超过一天会随查询范围增加而变慢（1s ~ 15s）                                                                                    | 最近一周：快（~ 300ms） |
| 更新速度           | 5s ~ 20s                                                                                                                                               | 30s ~ 1m                |

### Tracing

| Tracing                                  | Grafana + Tempo                                                                                                          | Datadog |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------- |
| 根据 trace id 搜索                       | ✅                                                                                                                       | ✅      |
| 根据收集环境标签搜索（如集群名、环境名） | ❌                                                                                                                       | ✅      |
| 跨服务关联                               | ✅                                                                                                                       | ✅      |
| 关联 log                                 | ✅ [Trace to Logs](https://grafana.com/docs/grafana/latest/datasources/tempo/configure-tempo-data-source/#trace-to-logs) | ✅      |

### Monitor

| Monitor         | Grafana + Prometheus + Loki | Datadog |
| --------------- | --------------------------- | ------- |
| 指标告警        | ✅                          | ✅      |
| 日志告警        | ✅                          | ✅      |
| 多指标联合告警  | ✅                          | ✅      |
| 支持接入 AlertX | ✅                          | ✅      |

---

## 常用功能

### Log

示例查询：

```logql
{region=~"sg", app=~"plat-alertx"} |= `` | logfmt | __error__=`` | level=`WARN`
```

[在 Grafana Explore 中打开示例](https://grafana-ssvc-apse1.cslr.io/explore?schemaVersion=1&panes=%7B%22vZu%22:%7B%22datasource%22:%22c19acc55-8044-472d-86b0-989da7bb6402%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bregion%3D~%5C%22sg%5C%22,%20app%3D~%5C%22plat-alertx%5C%22%7D%20%7C%3D%20%60%60%20%7C%20logfmt%20%7C%20__error__%3D%60%60%20%7C%20level%3D%60WARN%60%22,%22queryType%22:%22range%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22c19acc55-8044-472d-86b0-989da7bb6402%22%7D,%22editorMode%22:%22builder%22%7D%5D,%22range%22:%7B%22from%22:%22now-6h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1)

#### Group by 查询

查询语句：

```logql
sum by(level) (count_over_time({container="user-api", environment="sg-test", region="sg"} |= `` | json | __error__=`` [60m]))
```

[在 Grafana Explore 中打开示例](https://grafana-ssvc-apse1.cslr.io/explore?schemaVersion=1&panes=%7B%22vZu%22:%7B%22datasource%22:%22c19acc55-8044-472d-86b0-989da7bb6402%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22sum%20by%28level%29%20%28count_over_time%28%7Bregion%3D~%5C%22sg%5C%22,%20app%3D~%5C%22plat-alertx%5C%22%7D%20%7C%3D%20%60%60%20%7C%20logfmt%20%7C%20__error__%3D%60%60%20%5B24h%5D%29%29%22,%22queryType%22:%22instant%22,%22datasource%22:%7B%22type%22:%22loki%22,%22uid%22:%22c19acc55-8044-472d-86b0-989da7bb6402%22%7D,%22editorMode%22:%22builder%22%7D%5D,%22range%22:%7B%22from%22:%22now-2d%22,%22to%22:%22now%22%7D%7D%7D&orgId=1)

#### Log 关联 trace

日志通过识别其中的 **trace id 字段** 与 Tempo trace 关联。要求：

1. **日志中必须包含 trace id**。
2. 不同的日志格式需通过配置不同的 **trace id 识别规则**，否则无法识别，也无法与 Tempo trace 关联。

如需配置识别规则请联系 **Zero Wang (SZX)**。

### Tracing

#### Trace 关联 Log

Tempo 中的 trace 通过使用 trace id 在 Loki 中搜索来实现日志关联。需满足两个必要条件：

1. 日志中包含 trace id。
2. trace 中至少有一个标签能和 log 的标签匹配。例如 trace 的 `service.name` 和 log 的 `service`。

> **Q: 为什么需要条件 2？只用条件 1 不行吗？**
>
> A: 因为 Loki 中搜索至少需要一个标签条件；其次，不带服务过滤可能会在 Grafana 日志中搜索出相同 trace id 的日志记录。

- trace 中的 `service.name` 由对应服务配置中的 **OpenTelemetry 配置**决定。
- 日志中的 `service` 由**运维配置**。

#### 跨服务 trace

与常见链路监控一样，Tempo 会自动关联相同 id 的 trace。

### Monitor

#### 指标告警

Datadog 中的部分指标都可以在可观测平台直接使用，另一部分名称有变化，需要替换。

**如何判断是否需要替换指标名？**

- 如果你之前用的指标找不到了，则需要替换。
- 分隔符为点 `.` 的指标是 **Datadog 专用指标**，需要替换。
- 分隔符为下划线 `_` 一般是 **Prometheus 指标**，可直接使用。

常用指标和标签统计：[Metrics verifying](https://castlery.atlassian.net/wiki/spaces/TEC/pages/3561979920/Metrics+verifying)

#### 日志告警

可根据日志查询结果配置告警规则。比如：**最近 5 分钟的错误日志的数量大于一定数量时告警**。

#### 查询告警相关的指标或日志

在 Grafana 的告警页面点击 **View in Explore**，打开相同过滤条件的指标或日志查询页面。

#### 多条件联合告警

多个条件联合告警包括：指标 + 指标、指标 + 日志、日志 + 日志……等。

#### 接入 AlertX

> 参考 Grafana v10 与 v11 比较：[Comparing the alerting protocol of Grafana v10 and v11](https://castlery.atlassian.net/wiki/spaces/TEC/pages/3549167631/Comparing+the+alerting+protocol+of+Grafana+v10+and+v11)

### Dashboard

参考示例：

- [go-zero-template](https://grafana-ssvc-apse1.cslr.io/d/II60-LuHz/go-zero-template?orgId=1&refresh=1m)
- [alertx (plat-alertx prod)](https://grafana-ssvc-apse1.cslr.io/d/II60-LuHz2/alertx?orgId=1&var-region=sg&var-env=prod&var-service=plat-alertx&var-log_env=sg-prod&var-cluster=prod-eks-apse1&from=now-7d&to=now)

---

## 其它参考

- [FAQ for Observability platform](https://castlery.atlassian.net/wiki/spaces/TEC/pages/3667361817/FAQ+for+Observalility+platform)

---

## 问题

| #   | 问题                   | 结论                                                                   | 负责人          |
| --- | ---------------------- | ---------------------------------------------------------------------- | --------------- |
| 1   | Java 虚拟机如何接入    | TODO                                                                   | Zero Wang (SZX) |
| 2   | 集群外应用如何接入     | TODO                                                                   | Zero Wang (SZX) |
| 3   | 日志存储 30 天不够     | 日志热存储 30 天，冷存储 180 天                                        | Zero Wang (SZX) |
| 4   | 支持 SQS 链路监控      | 纳入 go-common 需求池，后续迭代：<https://app.clickup.com/t/86euu1ydj> | hao_pi          |
| 5   | 如何验证告警迁移有效性 | 迁移期间，由平台比较新旧来源的告警数量是否一致                         | hao_pi          |
