# 前端 HTTP 错误处理最佳实践

> 面向前端工程师的 HTTP 错误码处理规范，聚焦"该在哪一层处理、怎么处理"两个核心问题。
>
> 配套实现文件：
>
> - 客户端：[`libs/shared/redux/services/src/api.example.ts`](../libs/shared/redux/services/src/api.example.ts)

---

## HTTP 错误码使用规范总览

> **约定：**除下表列出的场景外，其余接口一律使用 HTTP 200 + 业务错误码（或系统错误码）表达失败，由业务层按业务码处理。

| 错误                      | retry.fail？           | 重试？                          | 层级     | 用户提示（示例）                 | 上报？ |
| ------------------------- | ---------------------- | ------------------------------- | -------- | -------------------------------- | ------ |
| **401 Unauthorized**      | ✅（refresh 后不重试） | ❌（refresh 失败后不再重试）    | 基础设施 | 登录失效，引导重新登录           | ⚠️     |
| **403 账号封禁**          | ✅                     | ❌                              | 基础设施 | 展示封禁原因，引导联系客服       | ✅     |
| **404 Not Found（路由）** | ✅                     | ❌                              | 路由层   | 跳转全局 404 页                  | ❌     |
| **404 Not Found（API）**  | ✅                     | ❌                              | 基础设施 | 通用错误提示                     | ✅     |
| **408 Request Timeout**   | ❌                     | ✅（仅幂等请求，最多 1–2 次）   | 基础设施 | 无感重试，必要时提示“请求超时”   | ✅     |
| **429 Too Many Requests** | ❌                     | ✅（遵守 Retry-After 退避重试） | 基础设施 | “操作过于频繁，请稍后再试”       | ✅     |
| **500 Internal Error**    | ❌                     | ✅（≤1 次，幂等请求）           | 基础设施 | 通用兜底提示                     | ✅     |
| **502 Bad Gateway**       | ❌                     | ✅（≤2 次，幂等请求）           | 基础设施 | 通用兜底提示                     | ✅     |
| **503 Unavailable**       | ❌                     | ✅（遵守 Retry-After 或退避）   | 基础设施 | 维护/繁忙提示                    | ✅     |
| **504 Gateway Timeout**   | ❌                     | ✅（≤1 次，幂等请求）           | 基础设施 | 通用兜底提示或“请求超时，请重试” | ✅     |

> 上表为前端基础设施层（RTK Query baseQuery）及路由层处理 HTTP 错误的统一约束；具体实现细节及业务层配合方式见下文各章节。

## 一、前端错误分层模型

所有 HTTP 错误分两层处理，职责边界清晰。

### 1.1 宏观两层模型

```
┌──────────────────────────────────────────────────────────────┐
│                    HTTP 请求（RTK Query）                      │
└────────────────────────────┬─────────────────────────────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │          基础设施层（baseQuery）       │
          │                                      │
         │  职责：与业务无关的通用错误处理          │
         │  伪200 → 统一转为 BizError rejected   │
         │  401   → Token 刷新（Mutex 并发去重）  │
         │  403   → 账号封禁处理                   │
         │  404   → API 路由层 404（接口不存在）   │
         │  408   → 服务端超时（幂等请求可重试）   │
         │  429   → Retry-After 退避重试          │
         │  5xx   → 重试 + 错误上报               │
          │  ERR_NETWORK → 断网检测 + 请求队列     │
          └──────────────────┬──────────────────┘
                             │ 未命中，透传
          ┌──────────────────▼──────────────────┐
          │          业务层（各功能模块）           │
          │                                      │
         │  职责：与业务场景强关联的错误处理        │
         │  400 / 422 → 表单字段 inline 错误      │
         │  409       → 冲突解决策略             │
         │  资源不存在（BizError）→ 空状态 UI     │
         │  BizError  → 按业务行为分组处理        │
          └──────────────────────────────────────┘
```

### 1.2 基础设施层内部 4 层结构（RTK Query）

项目使用 RTK Query，基础设施层内部进一步拆分为 4 层，各自职责单一：

```
rawBaseQuery                       ← 纯 fetchBaseQuery，无任何拦截
  └─ clientBaseQueryWithReAuth     ← 伪200 / 401 Mutex刷新 / 403账号封禁 / 429 Retry-After / 5xx上报
      └─ smartBaseQueryFn          ← retry.fail() 阻止 4xx 进入重试循环
          └─ baseQueryWithRetry    ← RTK retry(): 指数退避 + Jitter + Retry-After
              └─ createApi()
```

**为什么需要 4 层而不是 1 层？**

| 层                          | 职责         | 不能合并的原因                                   |
| --------------------------- | ------------ | ------------------------------------------------ |
| `rawBaseQuery`              | 纯 HTTP      | 在 re-auth 内部复用，避免递归触发拦截            |
| `clientBaseQueryWithReAuth` | 业务无关拦截 | 需要在 retry 外层，401 refresh 不计入重试次数    |
| `smartBaseQueryFn`          | 重试过滤     | `retry.fail()` 必须在传给 `retry()` 的函数里调用 |
| `baseQueryWithRetry`        | 退避策略     | RTK `retry()` 封装，`backoff` 回调在此层         |

**核心原则：**

- 基础设施层只做**与业务无关**的通用处理，不感知具体业务含义
- 业务层处理**与场景强绑定**的错误，不负责通用重试/上报

---

## 二、HTTP 错误码处理清单

### 2xx — 成功（也需要注意）

| 状态码 | 场景                    | 前端处理要点                                                                                     |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------ |
| 200    | 通用成功                | ⚠️ 警惕"伪 200"：body 里用 `code` 区分成功失败的接口，无法被 HTTP 拦截器捕获，需在业务层额外判断 |
| 201    | 资源创建成功            | 关注 `Location` response header，可用于跳转新资源                                                |
| 204    | 无响应体（DELETE 常见） | 不要尝试解析响应体，会报错                                                                       |
| 206    | 分段响应                | Range 请求场景（视频/大文件），浏览器自动处理，前端通常不需干预                                  |

---

### 3xx — 重定向

| 状态码 | 场景       | 前端处理要点                                                                              |
| ------ | ---------- | ----------------------------------------------------------------------------------------- |
| 301    | 永久重定向 | 浏览器自动跟随；影响 SEO，前端无需处理                                                    |
| 302    | 临时重定向 | 服务端 SSO 登录跳转常用；注意 fetch 默认 follow redirect，需按需配置 `redirect: 'manual'` |
| 304    | 缓存未变更 | 浏览器自动处理；前端无需干预                                                              |

---

### 4xx — 客户端错误

> **与后端约定：**401/403/404/408/429 等少数场景使用 HTTP 错误码，其余失败场景统一使用 HTTP 200 + 业务错误码（或系统错误码）。

| 状态码                       | 含义                          | 处理层级   | 最佳实践                                                                                                       |
| ---------------------------- | ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| **400** Bad Request          | 请求参数缺失/格式错误         | 业务层     | 解析 errors 数组 → 映射到表单字段 inline 展示，**不要全局弹窗**                                                |
| **401** Unauthorized         | 未认证（token 失效 / 未登录） | 基础设施层 | 优先尝试 silent token refresh；refresh 失败再跳登录页；并发 401 需队列去重                                     |
| **403** Forbidden            | 账号封禁（黑名单 / 风控拦截） | 基础设施层 | 不重试；清除本地凭证；跳转账号封禁页或展示封禁提示，并可引导联系客服；功能级权限不足改用 200 + 业务错误码 表达 |
| **404** Not Found            | 接口不存在（API 路由层 404）  | 基础设施层 | 不重试；视为配置/路由错误；上报监控 + 展示通用错误提示；资源不存在改用 200 + 业务错误码 表达                   |
| **405** Method Not Allowed   | HTTP 方法错误                 | 基础设施层 | 通常是前端 BUG（GET 用成 POST 等），上报错误监控，不重试                                                       |
| **408** Request Timeout      | 服务端超时断连                | 基础设施层 | 可重试（仅幂等接口），指数退避，最多 2 次                                                                      |
| **409** Conflict             | 资源冲突（并发/乐观锁）       | 业务层     | 不重试；提示用户刷新后重试；需要时展示冲突详情让用户手动解决                                                   |
| **410** Gone                 | 资源已永久删除                | 业务层     | 建议改为 200 + 业务错误码；前端同“资源不存在”组件级处理，可提示"该内容已下架"                                  |
| **413** Payload Too Large    | 请求体过大                    | 业务层     | 不重试；提示用户压缩文件或分批上传                                                                             |
| **422** Unprocessable Entity | 字段格式正确但业务校验失败    | 业务层     | 同 400 处理，解析字段级错误 inline 展示；**422 比 400 语义更精确（推荐 API 设计使用 422 替代 400）**           |
| **429** Too Many Requests    | 请求频率超限                  | 基础设施层 | 解析 `Retry-After` header；按指定时间等待后重试；用户侧展示"稍后重试"，不暴露技术细节                          |

---

### 5xx — 服务端错误

| 状态码                        | 含义           | 处理策略                                | 重试？                                       |
| ----------------------------- | -------------- | --------------------------------------- | -------------------------------------------- |
| **500** Internal Server Error | 服务端未知错误 | 基础设施层兜底提示 + 上报               | ✅ 最多重试 1 次（瞬时错误可能自愈）         |
| **502** Bad Gateway           | 上游服务不可用 | 基础设施层兜底提示 + 上报               | ✅ 退避重试 2 次（常见于部署期间短暂不可用） |
| **503** Service Unavailable   | 服务降级/维护  | 展示维护提示 + 上报；解析 `Retry-After` | ✅ 按 `Retry-After` 等待                     |
| **504** Gateway Timeout       | 上游响应超时   | 基础设施层兜底提示 + 上报               | ✅ 退避重试 1 次                             |

> **重试黄金规则：只重试幂等操作**（GET / PUT / DELETE）。POST 创建类操作即使服务端报错，也可能已执行成功，盲目重试会导致重复下单/支付。POST 的幂等性需服务端通过幂等 key 保证。

---

## 三、基础设施层：核心实现模式（RTK Query）

### 3.1 自动重试：`retry.fail()` + 指数退避

RTK Query 的 `retry()` 默认对所有错误重试，**必须用 `retry.fail()` 主动阻止 4xx 进入重试**。

**退避公式：**

```
waitTime = min(baseDelay × 2^attempt + random(0, jitter), maxDelay)
```

**推荐参数：**

| 参数         | 客户端  | SSR     | 说明                            |
| ------------ | ------- | ------- | ------------------------------- |
| `baseDelay`  | 300ms   | 200ms   | SSR server-to-server 抖动更小   |
| `maxDelay`   | 10s     | 5s      | SSR 不希望阻塞页面渲染太久      |
| `maxRetries` | 3       | 2       | SSR 重试次数保守                |
| `jitter`     | 0~200ms | 0~100ms | 避免惊群效应（Thundering Herd） |

```typescript
// Layer 3: smartBaseQueryFn — 过滤不可重试的错误
const smartBaseQueryFn: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await clientBaseQueryWithReAuth(args, api, extraOptions);

  if (result.error) {
    const status = (result.error as FetchBaseQueryError).status;

    // 4xx（除 408/429）→ 重试无意义，立即终止
    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      retry.fail(result.error);
    }
    // 'PARSING_ERROR' / 'CUSTOM_ERROR' 等字符串状态 → 不重试
    if (typeof status === 'string') {
      retry.fail(result.error);
    }
    // BizError（伪 200 业务码）→ 不重试
    if (isBizError(result.error)) {
      retry.fail(result.error);
    }
  }
  return result;
};

// Layer 4: baseQueryWithRetry — RTK retry 封装，处理退避策略
// pendingRetryAfterMs 由 Layer 2 在收到 429/503 时写入，backoff 消费后清空
let pendingRetryAfterMs: number | null = null;

const baseQueryWithRetry = retry(smartBaseQueryFn, {
  maxRetries: 3,
  backoff: async (attempt) => {
    if (pendingRetryAfterMs !== null) {
      await sleep(pendingRetryAfterMs); // 优先遵守服务端 Retry-After
      pendingRetryAfterMs = null;
    } else {
      const jitter = Math.random() * 200;
      await sleep(Math.min(300 * Math.pow(2, attempt) + jitter, 10_000));
    }
  },
});
```

> **重试黄金规则：只重试幂等操作**（GET / PUT / DELETE）。POST 创建类即使报错也可能已执行，盲目重试会导致重复下单/支付，幂等性须由服务端通过幂等 key 保证。

---

### 3.2 Token 刷新（401）：Mutex 并发去重

**核心难点：N 个请求同时收到 401，必须只发一次 refresh，其余等锁释放后重放。**

使用 `async-mutex` 的 `Mutex` 替代手写 Promise 队列，语义更清晰：

```typescript
// Layer 2: clientBaseQueryWithReAuth（仅展示 401 部分）
const mutex = new Mutex();

// rawBaseQuery 是纯 fetchBaseQuery 实例，专供 re-auth 内部复用（避免递归触发拦截）
const rawBaseQuery = fetchBaseQuery({ baseUrl, prepareHeaders });

if (result.error?.status === 401) {
  const refreshToken = getRefreshToken(); // 从 localStorage / cookie 读取

  if (!refreshToken) {
    clearAccessToken();
    return result; // 透传 401，路由层决定跳转
  }

  if (!mutex.isLocked()) {
    const release = await mutex.acquire(); // 拿锁，其他请求在 waitForUnlock() 处阻塞
    try {
      const refreshResult = await rawBaseQuery(
        { url: '/oauth/token', method: 'POST', body: { grant_type: 'refresh_token', refresh_token: refreshToken } },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        saveTokens(refreshResult.data); // 写入新 token
        result = await rawBaseQuery(args, api, extraOptions); // 重放原请求
      } else {
        clearAllTokens(); // refresh 失败，清除所有凭证
      }
    } finally {
      release(); // 释放锁，排队请求继续执行
    }
  } else {
    await mutex.waitForUnlock(); // 等待正在进行的 refresh 完成
    result = await rawBaseQuery(args, api, extraOptions); // 用新 token 重放
  }
}
```

**决策树：**

```
收到 401
  ├─ 有 refresh_token？
  │    ├─ 是 → mutex 未锁 → 拿锁，发起 refresh
  │    │         ├─ 成功 → saveTokens → 重放原请求 → release
  │    │         └─ 失败 → clearAllTokens → release → 透传 401
  │    │       mutex 已锁（其他请求在 refresh）→ waitForUnlock → 重放
  │    └─ 否 → clearAccessToken → 透传 401（路由层跳登录）
  └─ refresh 接口本身返回 401 → clearAllTokens → 透传 401
```

---

### 3.3 Retry-After 支持（429 / 503）

RTK Query 的 `backoff` 回调拿不到 response headers，通过**模块级变量**中转：

```typescript
// Layer 2 中，收到 429 时提取并存储
if (result.error?.status === 429) {
  const retryAfterHeader = (result.meta as FetchBaseQueryMeta)?.response?.headers.get('retry-after');
  if (retryAfterHeader) {
    pendingRetryAfterMs = Number(retryAfterHeader) * 1000;
  }
}

// Layer 4 backoff 中消费
backoff: async (attempt) => {
  if (pendingRetryAfterMs !== null) {
    await sleep(pendingRetryAfterMs); // 服务端指定的等待时间
    pendingRetryAfterMs = null;
  } else {
    await sleep(calcExponentialBackoff(attempt));
  }
};
```

---

### 3.4 全局错误上报

上报在 **Layer 2** 统一执行，业务层无需关心：

```typescript
// 5xx 上报（附带 traceId 用于关联服务端日志）
if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
  logger.error(`Server error ${result.error.status}`, {
    url: typeof args === 'string' ? args : args.url,
    endpoint: api.endpoint,
    status: result.error.status,
    traceId: (result.meta as FetchBaseQueryMeta)?.response?.headers.get('x-trace-id'),
  });
}
```

> 生产环境**不要** `console.error` 完整 error 对象（含请求体），避免泄漏用户数据。

---

### 3.5 网络断开处理（浏览器层）

RTK Query 的 `ERR_NETWORK` 会自动触发重试，浏览器层另外监听事件做 UI 反馈：

```typescript
window.addEventListener('offline', () => {
  showGlobalBanner('网络已断开，请检查网络连接');
});

window.addEventListener('online', () => {
  hideGlobalBanner();
  // RTK Query 内部会对 ERR_NETWORK 重试，这里可触发手动 refetch
});
```

---

## 四、业务层：各场景处理规范

### 4.1 表单校验错误（400 / 422）

**反模式 ❌：全局弹窗**

```
❌ toast.error("参数错误")   // 用户不知道改哪里
```

**最佳实践 ✅：字段 inline 错误**

```typescript
// 服务端返回字段级错误（RFC 7807 / 常见风格）
// { errors: [{ field: "email", message: "格式不正确" }] }

catch (error) {
  if (error.status === 422) {
    const { errors } = error.data;
    errors.forEach(({ field, message }) => {
      formRef.setFieldError(field, message); // 映射到表单字段
    });
  }
}
```

---

### 4.2 接口不存在 & 资源不存在

> **约定更新：**后端仅在“API 路由层 404（接口不存在）”时返回 HTTP 404；“资源不存在”（如商品/订单已删除）一律使用 HTTP 200 + 业务错误码 表达。

| 场景                        | 判断依据                                           | 处理方式                                       |
| --------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| 页面 URL 不存在             | Router 未匹配任何路由                              | 跳全局 `/404` 页                               |
| API 资源不存在（商品/订单） | 接口返回 200，body 中为资源不存在类业务错误码      | 当前组件展示空状态 UI，不跳转                  |
| 接口路径本身错误            | 接口返回 404（API 路由层 404，可能为 `text/html`） | 上报到监控（前端或网关配置 BUG），展示通用错误 |

---

### 4.3 资源冲突（409）

**不要重试。** 展示有意义的提示：

| 冲突类型         | 提示文案方向                 | 操作引导         |
| ---------------- | ---------------------------- | ---------------- |
| 乐观锁冲突       | "数据已被修改，请刷新后重试" | 提供「刷新」按钮 |
| 重复提交         | "操作已提交，请勿重复操作"   | 禁用提交按钮     |
| 库存冲突（电商） | "库存不足，请调整数量"       | 提供修改数量入口 |

---

### 4.4 账号封禁（403）与功能权限

> **约定更新：**HTTP 403 仅用于账号封禁（黑名单 / 风控拦截）场景；功能级权限不足一律使用 HTTP 200 + 业务错误码（如 `NO_PERMISSION`）表达。

```
403 收到（账号封禁）
  ├─ 清除所有凭证（access_token / refresh_token 等）
  ├─ 上报安全/风控事件（附带账号 ID、封禁原因摘要）
  └─ 展示封禁提示页或弹层，引导用户联系客服

功能级权限不足
  ├─ 接口返回 200 + 业务错误码（如 NO_PERMISSION）
  ├─ 业务层按 BizError 处理，**不清理登录态**
  └─ UI：隐藏入口 或 inline 提示"暂无权限"，避免泄漏权限细节
```

```typescript
// Layer 2 中的 403 处理（clientBaseQueryWithReAuth）—— 仅账号封禁
if (result.error?.status === 403) {
  const errorData = result.error.data as { errors?: unknown[] } | undefined;
  const isAccountBanned = Array.isArray(errorData?.errors) && errorData.errors.length > 0;

  if (isAccountBanned) {
    clearAllTokens(handles);
    reportApiError('Account banned', { errors: errorData?.errors });
  }
  // 无 errors 的 403：视为协议不符合新约定，向后兼容直接透传，交由上游逐步下线
}
```

> **401 vs 403 不要混用：**
>
> - 401 = 身份未验证（我不知道你是谁）→ 尝试 refresh，失败跳登录
> - 403 = 身份已验证但账号被封禁（我知道你是谁，但账号已被禁止使用）→ 不触发 refresh，直接清凭证 + 提示
> - 功能级权限不足（不能做这件事）→ 使用 200 + 业务错误码（如 `NO_PERMISSION`），由业务层按 BizError 处理

---

### 4.5 "伪 200"业务码（非标准但常见）

部分 BFF 接口统一返回 HTTP 200，通过 body 里的 `code` 区分成功失败：

```typescript
// 伪 200 响应体
{ "code": 10702025, "message": "优惠券已失效", "data": null }
```

**RTK Query 处理规范：**

1. 在 **Layer 2** 统一拦截，转换为类型明确的 `BizError`，通过 rejected result 返回
2. 在 **Layer 3** 用 `retry.fail()` 阻止对业务码错误重试
3. 业务层在 `catch` 中用 `isBizError()` 类型守卫区分业务码 vs HTTP 错误
4. 所有业务码在枚举文件中集中定义，禁止 magic number

```typescript
// Layer 2: 伪 200 → BizError（在 clientBaseQueryWithReAuth 中）
if (!result.error && result.data) {
  const { code, message } = result.data as Record<string, unknown>;
  if (typeof code === 'number' && code !== 0) {
    const bizError: BizError = { bizCode: code, message: String(message ?? ''), data: result.data };
    return { error: bizError as unknown as FetchBaseQueryError, meta: result.meta };
  }
}

// Layer 3: BizError 不重试
if (isBizError(result.error)) {
  retry.fail(result.error);
}

// 业务层消费
const { error } = useGetCartQuery();
if (error && isBizError(error)) {
  // 按 bizCode 分组处理：弹窗 / 刷新 / 跳转 / 忽略
  handleBizError(error.bizCode);
}
```

---

## 五、不应做的事（反模式清单）

| 反模式                                | 危害                                 | 正确做法                          |
| ------------------------------------- | ------------------------------------ | --------------------------------- |
| 所有错误弹同一个"操作失败"弹窗        | 用户不知道能否重试、如何解决         | 分层给出具体提示                  |
| 401 直接跳登录页（无 silent refresh） | token 刚过期用户被强制退出，体验极差 | 先尝试 refresh，失败再跳          |
| POST 接口出错后无脑重试               | 重复下单 / 重复支付                  | POST 重试需服务端幂等 key 保障    |
| 无限重试（无次数上限）                | 雪崩效应，加剧服务端压力             | 最多 3 次 + 指数退避              |
| 并发 401 各自独立触发 refresh         | N 个请求打 N 个 refresh 请求         | 队列机制保证只发 1 次             |
| 在 console 打印完整请求/响应体        | 生产环境泄漏用户数据 / token         | 生产只上报 Sentry，不打印敏感字段 |
| 前端自定义业务错误码数值              | 与服务端错误码冲突，维护混乱         | 前端只消费服务端定义的错误码      |
| 用弹窗覆盖表单展示 400/422 错误       | 用户看不到是哪个字段出错             | 字段 inline 展示错误              |
| 忽略 `Retry-After` header             | 违反服务端限流策略，可能被封禁       | 解析 header，按指定时间等待       |

---

## 六、SSR 与客户端的差异（Next.js App Router）

App Router 中的 SSR 以 **Server Components**（RSC）为核心，在服务端直接 `fetch` 数据，与客户端 RTK Query 的错误处理策略有本质差异：

| 能力                  | 客户端（RTK Query）                | Server Components（App Router）              |
| --------------------- | ---------------------------------- | -------------------------------------------- |
| Token 来源            | `localStorage` / `document.cookie` | `cookies()` from `next/headers`（只读）      |
| Token 刷新            | ✅ 刷新后写回 storage              | ✅ 在 Middleware 里刷新并写回 `Set-Cookie`   |
| 401 处理              | silent refresh → 重放请求          | `redirect('/login')` / Middleware 拦截       |
| 403 处理              | 分级处理（封禁 / 功能权限）        | `redirect('/403')` 或降级展示                |
| 重试 5xx              | ✅（maxRetries: 3，指数退避）      | ❌ 不建议（会阻塞渲染，改用 error.tsx 兜底） |
| `window` / `location` | ✅                                 | ❌（会报错）                                 |
| 404 处理              | 局部空状态 UI                      | `notFound()` 触发 `not-found.tsx`            |
| 错误边界              | React Error Boundary               | `error.tsx` / `global-error.tsx`（文件约定） |
| 错误上报              | Sentry browser SDK                 | 结构化日志（`@sentry/nextjs` 服务端集成）    |

### 6.1 基于文件约定的错误处理机制

App Router 通过文件约定实现分层错误边界，错误只向上冒泡到最近的 `error.tsx`：

```
app/
  global-error.tsx     ← 捕获根 layout 级别的错误（含 html/body）
  error.tsx            ← 捕获当前路由段及子路由的运行时错误
  not-found.tsx        ← 404 页面（由 notFound() 触发）
  layout.tsx
  page.tsx
  cart/
    error.tsx          ← 仅捕获 /cart 路由下的错误
    page.tsx           ← Server Component，直接 fetch 数据
```

`error.tsx` 是 React Client Error Boundary 的文件约定形式，**必须是 Client Component**：

```typescript
// app/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <p>出错了，请稍后重试</p>
      <button onClick={reset}>重试</button>
    </div>
  );
}
```

> `error.digest` 是 Next.js 服务端生成的错误指纹，可安全传给监控系统用于关联服务端日志，不含敏感信息。

### 6.2 Server Component 中的错误处理

```typescript
// app/cart/page.tsx
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

export default async function CartPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('access-token')?.value;

  const res = await fetch(`${process.env.API_BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', // 实时数据不缓存
  });

  if (res.status === 401) {
    // Middleware 应已处理大部分 token 刷新
    // 到这里说明 refresh token 也已失效，直接跳登录
    redirect(`/login?redirect=/cart`);
  }

  if (res.status === 403) {
    redirect('/403');
  }

  if (res.status === 404) {
    notFound(); // 触发 not-found.tsx
  }

  if (!res.ok) {
    // 5xx 等其他错误 → throw，由最近的 error.tsx 捕获展示兜底 UI
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return <CartView data={data} />;
}
```

**注意：** `redirect()` 和 `notFound()` 内部通过抛出特殊错误实现，即使写在 `try/catch` 内部，Next.js 也会正确处理，**不会被普通 `catch` 块捕获**。

### 6.3 Middleware 处理 Token 刷新（401 的推荐入口）

Middleware 在页面渲染前执行，是唯一可以安全读取旧 token 并通过 `Set-Cookie` 写回新 token 的地方：

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  // 1. 有有效 access token → 放行
  if (accessToken && isTokenValid(accessToken)) {
    return NextResponse.next();
  }

  // 2. access token 过期但有 refresh token → 尝试刷新
  if (refreshToken) {
    try {
      const res = await fetch(`${process.env.AUTH_API_URL}/oauth/token`, {
        method: 'POST',
        body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const { access_token, refresh_token } = await res.json();
        const response = NextResponse.next();
        // 刷新成功：写回新 token，页面正常渲染
        response.cookies.set('access-token', access_token, { httpOnly: true, secure: true, sameSite: 'lax' });
        response.cookies.set('refresh-token', refresh_token, { httpOnly: true, secure: true, sameSite: 'lax' });
        return response;
      }
    } catch {
      // refresh 请求网络错误，降级到重定向登录
    }
  }

  // 3. 无有效 token → 重定向登录
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/account/:path*'],
};
```

**Token refresh 只在两处做：**

1. **浏览器端**：RTK Query baseQuery 中的 silent refresh（基于 localStorage / storage）
2. **Middleware**：App Router 渲染前的 token 刷新（基于 httpOnly cookie）

Server Component 内部的 `fetch` **不应**再发起 token refresh。若 Server Component 收到 401，说明 Middleware 已无法刷新（refresh token 不存在或彻底失效），直接 `redirect('/login')` 即可。

### 6.4 服务端错误上报

Server Component 中的错误应在抛出前记录结构化日志，**不要使用 Sentry browser SDK**，应使用 `@sentry/nextjs` 的服务端集成或直接输出结构化日志到收集系统（CloudWatch / Datadog 等）：

```typescript
// 服务端 fetch 封装示例
async function serverFetch(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);

  if (!res.ok) {
    // 结构化日志，不含敏感请求体
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'server_fetch_error',
        status: res.status,
        url,
        traceId: res.headers.get('x-trace-id'),
        timestamp: new Date().toISOString(),
      })
    );

    if (res.status === 404) notFound();
    throw new Error(`HTTP ${res.status}`);
  }

  return res;
}
```

---

## 七、业界案例

### GitHub REST API

- 严格区分 401（未认证） vs 403（无权限 / Rate Limit 超额）
- 422 用于字段校验，返回结构化 `errors` 数组
- 所有错误统一包含 `message` + `documentation_url`

```json
{
  "message": "Validation Failed",
  "errors": [{ "resource": "Issue", "field": "title", "code": "missing_field" }],
  "documentation_url": "https://docs.github.com/..."
}
```

---

### Stripe — 多级错误分类

```json
{
  "error": {
    "type": "card_error", // 顶级分类 → 决定处理层级
    "code": "card_declined", // 机器可读码 → 业务层分支
    "decline_code": "insufficient_funds", // 更细粒度子码
    "message": "余额不足", // 用户可见文案
    "param": "card_number" // 出错的字段
  }
}
```

**分层映射：**

- `type = "card_error"` → 业务层，inline 展示卡片错误
- `type = "api_error"` → 基础设施层，通用报错 + 上报
- `type = "invalid_request_error"` → 基础设施层上报（前端 BUG）

---

### Google Cloud API — RFC 7807 风格

```json
{
  "error": {
    "code": 403,
    "status": "PERMISSION_DENIED", // gRPC 状态字符串，机器可读
    "message": "调用者无此权限",
    "details": [
      {
        "@type": "type.googleapis.com/google.rpc.ErrorInfo",
        "reason": "API_KEY_INVALID",
        "domain": "googleapis.com"
      }
    ]
  }
}
```

**设计亮点：**

- `code`（HTTP 数字） + `status`（语义字符串）双重标识，方便不同场景解析
- `details` 数组可扩展任意附加信息
- 机器可读（`reason`）和人类可读（`message`）分离

---

### Netflix — 弹性模式（前端映射）

| 模式                     | 后端定义                   | 前端等效实践                                                             |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------ |
| **Circuit Breaker 熔断** | 失败率超阈值，停止转发请求 | 同一接口连续失败 N 次 → 熔断一段时间，直接返回 fallback 数据，不再发请求 |
| **Fallback 降级**        | 主链路失败时走备用链路     | 推荐接口失败 → 展示静态热销商品；头图接口失败 → 展示默认占位图           |
| **Bulkhead 舱壁隔离**    | 不同服务使用独立线程池     | 核心接口（结账/下单）和边缘接口（推荐/日志）并发请求独立，互不影响       |
| **Timeout 超时截断**     | 每个依赖设置独立超时       | 所有接口设置合理超时（建议核心 5s，非核心 3s），避免用户无限 loading     |

---

## 八、决策速查矩阵

| 错误                  | retry.fail？           | 重试？            | 层级         | 用户提示         | 上报？ |
| --------------------- | ---------------------- | ----------------- | ------------ | ---------------- | ------ |
| ERR_NETWORK           | ❌                     | ✅                | 基础设施     | 全局断网 Banner  | ✅     |
| 400 Bad Request       | ✅                     | ❌                | 业务层       | 字段 inline 错误 | ⚠️     |
| 401 Unauthorized      | ✅（refresh 后不重试） | ❌                | 基础设施     | 无感；失败透传   | ❌     |
| 403 账号封禁          | ✅                     | ❌                | 基础设施     | 展示封禁原因     | ✅     |
| 403 功能权限          | ✅                     | ❌                | 业务层       | inline"无权限"   | ❌     |
| 404（URL 路由）       | ✅                     | ❌                | 路由层       | 跳全局 404 页    | ❌     |
| 404（API 资源）       | ✅                     | ❌                | 业务层       | 局部空状态 UI    | ⚠️     |
| 408 Request Timeout   | ❌                     | ✅（幂等）        | 基础设施     | 无感重试         | ✅     |
| 409 Conflict          | ✅                     | ❌                | 业务层       | 具体冲突说明     | ⚠️     |
| 413 Payload Too Large | ✅                     | ❌                | 业务层       | 提示压缩/分批    | ❌     |
| 422 Unprocessable     | ✅                     | ❌                | 业务层       | 字段 inline 错误 | ⚠️     |
| 429 Too Many Requests | ❌                     | ✅（Retry-After） | 基础设施     | "请稍后重试"     | ✅     |
| 500 Internal Error    | ❌                     | ✅（≤3 次）       | 基础设施     | 通用兜底提示     | ✅     |
| 502 Bad Gateway       | ❌                     | ✅（≤3 次）       | 基础设施     | 通用兜底提示     | ✅     |
| 503 Unavailable       | ❌                     | ✅（Retry-After） | 基础设施     | 维护提示         | ✅     |
| 504 Gateway Timeout   | ❌                     | ✅（≤3 次）       | 基础设施     | 通用兜底提示     | ✅     |
| BizError（伪 200）    | ✅                     | ❌                | 业务层       | 按业务分组       | ⚠️     |
| PARSING_ERROR         | ✅                     | ❌                | 基础设施上报 | 通用提示         | ✅     |

> **说明：**
>
> - `retry.fail？` ✅ = 在 `smartBaseQueryFn` 中调用 `retry.fail()` 阻止 RTK retry 重试
> - 上报 ✅ = 必须上报，⚠️ = 按业务判断，❌ = 正常流程无需上报
> - App Router Server Components 中，401/403 通过 `redirect()` 处理，5xx 通过 `throw` 交由 `error.tsx` 兜底；token 刷新由 Middleware 统一负责

---

## 参考资料

- [RTK Query — retry](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#automatic-retries)
- [async-mutex](https://github.com/DirtyHairy/async-mutex)
- [RFC 7807 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc7807)
- [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Stripe API — Error types](https://stripe.com/docs/error-codes)
- [GitHub REST API — Client errors](https://docs.github.com/en/rest/overview/troubleshooting)
- [Google Cloud — API Errors](https://cloud.google.com/apis/design/errors)
- [AWS — Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Netflix Tech Blog — Fault Tolerance](https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a)
