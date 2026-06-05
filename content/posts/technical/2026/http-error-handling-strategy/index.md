---
title: 电商前端 HTTP 错误处理：基础设施层与业务层怎么分工
slug: http-error-handling-strategy
date: 2026-07-03
updatedAt: 2026-07-10
category: technical
tags:
  - Error Handling
  - RTK Query
  - Frontend
  - API
status: published
excerpt: 复盘电商前端的 HTTP 错误分层策略：基础设施层统一处理 401/429/5xx 和重试，业务层处理表单校验和场景化反馈，避免「所有 catch 都 toast 一下」。
---

# 前言

这篇文章是我对电商前端 HTTP 错误处理策略的复盘。

早期项目里最常见的写法是：每个 API 调用各自 `try/catch`，失败就 `toast.error('Something went wrong')`。能跑，但上线后问题很快暴露——401 并发刷新打爆 token 接口、POST 支付被盲目重试导致重复下单、422 表单错误弹全局 Modal 把用户填的内容挡掉。

我推动把错误处理拆成**基础设施层**和**业务层**，用 RTK Query 的 baseQuery 链统一兜底，业务模块只处理和自己场景绑定的错误。这篇笔记讲分层模型、各状态码怎么处理、以及我为什么把 baseQuery 拆成四层。

---

## 核心约定：大部分失败走「伪 200」

和后端约定：除少数场景外，业务失败用 **HTTP 200 + 业务错误码** 表达，而不是滥用 4xx。

| 少数走真实 HTTP 码 | 原因 |
| --- | --- |
| 401 | 认证失效，需要基础设施层统一 refresh |
| 403 | 账号封禁，需要清凭证 + 跳转 |
| 404（API 路由） | 接口配置错误，应上报 |
| 408 / 429 | 超时和限流，需要退避重试 |
| 5xx | 服务端异常，需要重试 + 上报 |

其余库存不足、地址无效、优惠券失效等，走 200 + `BizError`，由业务层按场景展示。

这个约定的好处是：基础设施层拦截器可以专注处理「和 HTTP 协议相关」的问题，业务层专注「和用户操作相关」的反馈。

---

## 两层宏观模型

```text
HTTP 请求（RTK Query）
        │
        ▼
┌─────────────────────────────┐
│     基础设施层（baseQuery）    │
│  401 refresh / 403 封禁       │
│  429 退避 / 5xx 重试上报      │
│  伪 200 → 转 BizError         │
│  断网检测 / 请求队列           │
└─────────────┬───────────────┘
              │ 未命中，透传
              ▼
┌─────────────────────────────┐
│     业务层（各功能模块）       │
│  400/422 → 表单 inline 错误   │
│  409 → 冲突解决策略           │
│  BizError → 按业务码分组处理   │
└─────────────────────────────┘
```

**原则：基础设施层不感知业务含义；业务层不负责通用重试和 token 刷新。**

---

## 为什么 baseQuery 要拆四层

看起来一层拦截器就能搞定，但我拆成了四层，每层职责不可合并：

```text
rawBaseQuery                    ← 纯 fetch，无拦截
  └─ clientBaseQueryWithReAuth  ← 伪200 / 401 / 403 / 429 / 5xx
      └─ smartBaseQueryFn       ← retry.fail() 过滤不可重试错误
          └─ baseQueryWithRetry ← 指数退避 + Jitter + Retry-After
              └─ createApi()
```

| 层 | 职责 | 不能合并的原因 |
| --- | --- | --- |
| `rawBaseQuery` | 纯 HTTP | re-auth 内部复用，避免递归触发拦截 |
| `clientBaseQueryWithReAuth` | 通用拦截 | 必须在 retry 外层，401 refresh 不计入重试次数 |
| `smartBaseQueryFn` | 重试过滤 | `retry.fail()` 必须在传给 `retry()` 的函数里调用 |
| `baseQueryWithRetry` | 退避策略 | RTK `retry()` 封装 |

如果合成一层，最常见的问题是：401 refresh 被算进重试次数，或者 422 表单错误被重试三次后弹了三次 toast。

---

## 各状态码怎么处理

### 基础设施层

| 状态码 | 策略 | 用户反馈 |
| --- | --- | --- |
| 401 | Mutex 去重 + silent refresh，失败清凭证 | 引导重新登录 |
| 403 | 不重试，清凭证 | 封禁说明 + 联系客服 |
| 404（API） | 不重试，上报 | 通用错误提示 |
| 408 | 幂等请求可重试 1-2 次 | 必要时提示超时 |
| 429 | 解析 `Retry-After` 退避 | 「操作过于频繁」 |
| 5xx | 幂等请求有限重试 + 上报 | 通用兜底提示 |
| 断网 | 检测 + 请求队列 | 离线提示或静默等待 |

### 业务层

| 状态码 / 类型 | 策略 | 用户反馈 |
| --- | --- | --- |
| 400 / 422 | 解析 `errors[]` 映射字段 | **表单 inline 错误，不要全局弹窗** |
| 409 | 不重试 | 提示刷新或展示冲突详情 |
| BizError（伪 200） | 按业务码分组 | 场景化：toast / inline / 空状态 / 跳转 |

### 重试黄金规则

**只重试幂等操作**（GET / PUT / DELETE）。POST 创建类即使返回 500，服务端也可能已经执行成功——支付和下单尤其不能盲目重试，幂等性要由服务端 idempotency key 保证。

退避公式：`wait = min(baseDelay × 2^attempt + jitter, maxDelay)`，加 jitter 避免惊群。

---

## 401 并发刷新：Mutex 而不是手写队列

多个请求同时收到 401 时，必须只发一次 refresh，其余等待后重放。我用 `async-mutex` 实现：

```text
收到 401
  ├─ 无 refresh_token → 清凭证，透传
  ├─ mutex 未锁 → 拿锁 → refresh → 成功则重放原请求 → 释放锁
  └─ mutex 已锁 → waitForUnlock() → 用新 token 重放
```

refresh 内部用 `rawBaseQuery` 而不是外层带拦截的 baseQuery——否则 refresh 请求自己会触发 401 拦截，形成递归。

---

## 业务层：BizError 分组处理

伪 200 返回的业务错误，我按「用户可恢复性」分组，而不是按错误码数字分组：

| 分组 | 示例 | UI 策略 | 是否上报 |
| --- | --- | --- | --- |
| 用户可修复 | 地址无效、优惠券不可用 | inline 或场景 toast | 否 |
| 需刷新重试 | 库存变化、价格变动 | 提示刷新页面 | 可选 |
| 阻断流程 | 风控拦截、区域限制 | 明确说明 + 引导 | 是 |
| 系统异常 | 未知业务码 | 兜底提示 | 是 |

同一错误码在不同页面的 UI 可以不同（结账页和商品页的「库存不足」交互不一样），但**错误码语义和 Sentry tag 必须全局一致**——这和埋点契约是同一套思路。

---

## 和可观测性的衔接

基础设施层上报的错误带 `error_bucket` 标签（`api_5xx`、`api_timeout` 等），业务层的预期错误（用户输错地址）走 `isExpectedBusinessError` 跳过 Sentry。

分层之后，on-call 看到的 Sentry issue 信噪比明显改善——不再是一堆「优惠券已过期」的业务提示混在 500 错误里。

---

## 踩坑记录

### 1. 伪 200 被拦截器遗漏

早期只在 HTTP status 层面拦截，body 里 `code !== 0` 的成功响应直接透传，业务层每个 endpoint 各自判断。后来在基础设施层统一转 `BizError rejected`，业务层才能用 `isBizError()` 一致处理。

### 2. POST 重试导致重复支付

一次 502 后自动重试 POST `/payment/confirm`，用户卡被扣两次。之后 smartBaseQueryFn 对非幂等 POST 直接 `retry.fail()`，除非服务端返回了幂等 key 头。

### 3. 422 弹全局 Modal

地址表单的邮编错误弹了全屏错误框，用户刚填的地址全被挡住。改为字段级 inline 之后，客诉明显下降。

---

## 总结

HTTP 错误处理的关键不是「catch 住」，而是**在正确的层做正确的事**：

1. 基础设施层：协议级错误（认证、限流、服务端异常）
2. 业务层：场景级错误（表单、库存、优惠券）
3. baseQuery 四层拆分：让 refresh 和 retry 不互相干扰
4. 重试克制：幂等才重试，支付和下单尤其谨慎

如果你正在用 RTK Query 搭电商前端，建议先画一张「这个 status 码在哪层处理」的表贴在团队 wiki 里——比写十个 `try/catch` 有用得多。

---

## 关联阅读

- [工程实践札记索引](/posts/engineering-practice-hub/)
- [交易链路可观测性建设](/posts/transaction-observability-tech-plan/)
- [埋点事件契约](/posts/tracking-events-book-contract/)
