# Cart 在 mobile 上进入时 order_id / order_token cookie 被清空

- **日期**: 2026-05-09
- **分支**: `Abby-Wang/CU-86exhvkgb/BUGCAcart-iconcart`
- **影响范围**: CA 站 mobile 端，访客用户从其他页面跳转到 `/cart`
- **影响表现**: 用户原本有效的购物车被静默丢空，购物车页显示 "You have no items in your shopping cart"
- **环境**: ca-prod

## 现象

Mobile 上从其他页面进入 `/cart` 时稳定可复现：

- 请求头里 `order_id` 和 `order_token` 是有值的；
- 响应头里出现 4 条 `Set-Cookie`，把 `order_id` 和 `order_token` 都清空（`Expires=Thu, 01 Jan 1970`，分别带 `Path=/ca` 和 `Path=/`）；
- 客户端拿到响应后这两个 cookie 就没了，购物车显示为空。

Desktop 没有这个问题。手动在 DevTools 里把 `order_id`/`order_token` 写回原值并刷新，购物车数据可以正常返回——说明 cookie 值本身在后端是有效的。

## 根因

定位到 `src/redux/modules/cart.js` 中 `initAndGetCartInfo` 在访客分支的 catch 处理：

```js
// 修复前
if (orderToken && orderId) {
  const loadPromise = dispatch({
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: (client) =>
      client.get(`/checkouts/${orderId}`, {
        header: { 'X-Spree-Order-Token': orderToken },
      }),
  });

  // remove cookie if load failed
  return loadPromise.catch((err) => {
    Cookie.remove('order_id');
    Cookie.remove('order_token');
    throw err;
  });
}
```

SSR 阶段调用 `GET /checkouts/{orderId}`，Grafana 后端日志确认这次调用返回 **HTTP 409 Conflict**——这是一个瞬时冲突错误（订单状态层面的 race / lock），订单本身仍然有效。

但前端 catch 写得太激进：**任何错误**都会无差别清空 `order_id` / `order_token`，再加上 `helpers/Cookie.ts` 的 `remove` 在 SSR 端会同时下发 `Path=/ca` 和 `Path=/` 两条 `Set-Cookie` 清除指令，所以一次 `remove(order_id)+remove(order_token)` 在响应里就是 4 条 `Set-Cookie`，与现场完全吻合。

> 为什么 desktop 不复现：现场只在 mobile 路径上稳定触发后端 409。具体后端层面的 mobile 触发条件由后端排查，本次前端修复**不依赖根因**——即使 409 仍然偶发，前端不再因此丢失用户购物车。

### 为什么 4 条 Set-Cookie 等于这一处 catch

把 `cart.js` 里所有 `Cookie.remove('order_id') + Cookie.remove('order_token')` 出现的位置过了一遍，只有 `initAndGetCartInfo` 访客分支的 catch（修复前 `cart.js:350-354`）这一处是「连续 remove 两个、且后面没有任何 `Cookie.set`」——其他出现位置都会紧跟一条 `Cookie.set('order_id', ...)`，响应里会出现第 5 条 `Set-Cookie`。所以现场 4 条 `Set-Cookie` 唯一对应这一处。

`Checkout/Success.js` 里也有类似的两 remove，但那是客户端 `useEffect`，不会写出 SSR 的 `Set-Cookie`，与现场不相关。

## 修复方案

把"任何错误都清 cookie"改成"只在订单确实对当前用户无效时才清 cookie"：

| 状态码 | 处理 | 原因 |
|---|---|---|
| 401 / 403 / 404 / 410 | **清 cookie** | 订单不存在 / 鉴权失败 / 永久删除：cookie 已脏，再保留只会让用户每次都失败 |
| 409 / 429 / 5xx / 网络错误 | **保留 cookie** | 瞬时错误，订单本身仍有效，下一次重试可以恢复 |

### 改动 1: `src/redux/modules/cart.js`

把访客分支 catch 改成 status 驱动：

```js
// Only clear cookies when the order is definitively invalid for this user.
// Keeping cookies on transient failures (409 conflict, 429, 5xx, network)
// lets the user recover their cart on the next request instead of silently
// losing it. See docs/online-issues for the mobile 409 incident.
return loadPromise.catch((err) => {
  const status = err?.status ?? (Array.isArray(err?.errors) ? err.errors[0]?.code : undefined);
  const isOrderInvalid = status === 401 || status === 403 || status === 404 || status === 410;
  if (isOrderInvalid) {
    Cookie.remove('order_id');
    Cookie.remove('order_token');
  }
  throw err;
});
```

### 改动 2: `src/helpers/ApiClient.ts`

为了让上层 catch 能拿到 HTTP status，把 reject 出去的 body 上挂一个 `status` 字段。

- 409 / 429 已有的特殊 reject 加上 `status`：

  ```ts
  reject({ status: err.status, errors: [{ code: err.status, detail: err.message }] });
  ```

- no-auth 路径（`reject(body)`）改为：

  ```ts
  const rejection =
    body && typeof body === 'object'
      ? Object.assign(body, { status: body.status ?? err?.status })
      : { status: err?.status, message: err?.message };
  reject(rejection);
  ```

这与现有 `AsyncLoad/utils.js` 已经在用 `error.status` 的契约一致，不引入新概念。auth=`strict`/`loose` 的若干 reject 路径不在本次改动范围内（与本 bug 无关，单独 PR 处理）。

### 改动 3: 抽出 `helpers/httpStatus.ts` 与 `helpers/orderCookies.ts`

`[401, 403, 404, 410]` 这组"资源对当前用户已无效"的判定是通用的，`order_id`/`order_token` 这对 cookie 又必须成对操作。把它们就地写在 `cart.js` 里有两个问题：

- 散落多处的 magic number 列表（其它模块如果也要做相同判定就得复制）。
- `Cookie.remove('order_id') + Cookie.remove('order_token')` 在 cart.js 出现 5 处，将来加新 cookie / 新状态码要改多处。

所以新增两个 helper：

```ts
// src/helpers/httpStatus.ts
export const RESOURCE_INVALID_STATUSES = [401, 403, 404, 410] as const;
export function isResourceInvalid(status: number | undefined | null): boolean { /* ... */ }
export function getErrorStatus(err: unknown): number | undefined { /* err.status ?? errors[0].code */ }
```

```ts
// src/helpers/orderCookies.ts
export function clearOrderCookies(): void { /* remove order_id + order_token */ }
export function replaceOrderCookies(newOrderId: string): void { /* clear + set new id */ }
```

然后在 `cart.js` 把所有"清/换 order cookie 对"的 5 处全部替换成调用这两个 helper。访客分支 catch 简化为：

```js
return loadPromise.catch((err) => {
  if (isResourceInvalid(getErrorStatus(err))) {
    clearOrderCookies();
  }
  throw err;
});
```

未来其他模块要做"按 status 决定要不要清域 cookie"的事，可以直接复用这两个 helper。

## 修复前后前端表现对比

下表针对 mobile 上"从其他页面进入 `/cart`、SSR 端 `GET /checkouts/{orderId}` 命中 409"这个具体场景：

| 维度 | 修复前 | 修复后 |
|---|---|---|
| `/cart` SSR 响应 `Set-Cookie` | 4 条：`order_id=` / `order_token=` × `Path=/ca` + `Path=/`（清空指令） | **不下发** order_id / order_token 的 Set-Cookie |
| 浏览器侧 cookie 状态 | `order_id` / `order_token` 被服务端清空 | 保留原值 |
| Cart 页面渲染 | "You have no items in your shopping cart"（空购物车 UI） | 与 SSR fail 前一致：仍显示空购物车 UI（因为 `LOAD_FAIL` → `cart.data: null`），**但购物车 cookie 还在** |
| 用户下次刷新 / 重试 | 即使 409 已恢复，cookie 已丢，购物车仍然是空（必须重新加购才能 mint 新订单） | 409 恢复后，**下一次进入 cart 直接拿回原订单数据** |
| 用户在 cart 页加购 / 离开页面再回来 | 走 `add()` 时检测到无 `order_id`/`order_token` → `dispatch(create())` 创建新订单。**老订单永久丢失** | `add()` 仍持有原 `order_id`/`order_token`，下游 `addToCart` 因 `cart.data: null` 提前 reject 友好提示；用户再刷新页面就能恢复 |
| 401 / 403 / 404 / 410 行为 | 清 cookie | **保持不变**：仍然清 cookie，保留"订单真无效就重置"的旧语义 |
| 5xx / 网络错误 | 清 cookie（一样会丢失有效订单） | 保留 cookie，可在下次重试中恢复 |

> 关键差异是"瞬时错误下不再误删用户购物车"。从单次访问 cart 页的视觉 UI 来看，修复前后用户都会看到一个空购物车（因为 SSR fail → `cart.data: null`）；但**修复前是单向不可恢复的，修复后只是一次失败、下次重试就能拿回**。这才是这次修复的实质价值。

## 验证

- ✅ ESLint：两处改动文件均无 error（剩余 warning 都是文件原有的）。
- ✅ 不会导致客户端崩溃：`cart.data` 设为 `null` 时 Cart 页面所有访问都用 `?.`，UI 走"空购物车"分支；`addToCart` 会因 `!cart.data` 提前 reject 一个友好提示，不会进 API 调用循环。
- ✅ 回归：401/403/404/410 仍然清 cookie，保留原有"订单确实无效就重置"的语义；用户在订单真的失效时仍然可以通过下一次加购触发 `create()` 拿到新订单。

### 复现 / 验证步骤

1. CA 站 mobile，访客身份，确保 cookie 中 `order_id` / `order_token` 指向一个已知会触发后端 409 的订单（或在测试环境构造 409 场景）。
2. 从其他页面跳转进入 `/cart`。
3. 修复前：响应头出现 4 条 `Set-Cookie` 清空 `order_id` / `order_token`，购物车显示为空。
4. 修复后：响应头不再出现这 4 条 `Set-Cookie`，购物车数据正常返回。
5. 同时验证 401/403/404 场景下行为保持一致（订单失效时 cookie 仍被清掉、后续加购可正常 mint 新订单）。

## 后续 follow-up

- **后端**：定位 mobile 路径上 `GET /checkouts/{orderId}` 触发 409 的具体原因（订单状态锁 / store 路由 / 并发修改？）。这是真正的根因。
- **前端可观测性**：当前 `cart.js:350` catch 不上报 Sentry，建议在 catch 里加 `captureException(err, { context: 'cart.initAndGetCartInfo.guest', orderId, status })`，让此后此类失败有 Sentry 数据可追。
- **ApiClient 一致性**：auth=`strict`/`loose` 的 reject 路径同样没有暴露 status，建议在后续 PR 中统一处理（例如抽出 `attachStatus` helper），让所有 API 错误都能被 status-based 的 catch 区分。
- **Datadog APM**：dd-trace 已自动 instrument superagent，下次复现可以在 APM 直接按 `service:onepiece env:ca-prod @http.url:*checkouts*` + `@http.status_code:409` 检索，比 Grafana 后端更易定位。
