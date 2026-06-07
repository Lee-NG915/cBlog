---
confluence_id: "3599499266"
title: "技术方案 - Account Permission/Login 重构"
status: current
parent_id: "2583822375"
depth: 1
domain: product
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/3599499266
local_joyboy_doc: null
blog_post: null
---
---

## 背景与目标

**背景：**
老项目基于 React + React Router，账号体系依赖客户端路由守卫及高阶组件处理登录态。迁移到 Next.js 14.2.15 的 joyboy 架构后，需要把既有登录体验、项目级鉴权、业务重定向能力无缝带入新的 App Router + Edge Middleware 体系。

**业务目标：**

- 复用原有账号中心的核心能力（登录、注册、忘记密码），并对接新页面路由结构。
- 在服务端提前完成权限判定与重定向，缩短首屏闪烁时间，满足 SEO 和安全要求。
- 保持登录后跳转、从业务模块（如 Rewards、Orders）发起的鉴权逻辑一致，避免破坏现有埋点与体验。
- 提供可扩展的中间件与工具层，支撑未来新增账号路由及第三方登录拓展。
---

## C4 视图

### 系统上下文（Context）

下图展示了 Joyboy 登录体系的上下文视图：

```
C4Context
title Joyboy 登录体系 - 上下文视图
Person(user, "终端用户", "访问 Web 站点的会员/游客")
System_Boundary(joyboy, "Joyboy 平台") {
  System(app, "Next.js Web 应用", "App Router + React 服务器组件")
  System(middleware, "Edge Middleware", "Edge Runtime 上的鉴权链路")
}
System_Ext(legacy, "Legacy React App", "历史站点，部分深链仍指向此处")
System_Ext(authSvc, "Account Identity Service", "共享账号中心，提供登录验证与 token")
Rel(user, app, "访问登录页、提交凭证")
Rel(app, middleware, "路由进入前触发鉴权/重定向")
Rel(app, authSvc, "调用登录/刷新接口")
Rel(middleware, authSvc, "校验 cookie、刷新 token")
Rel(legacy, app, "深链跳转，携带 redirectUrl")
```

### 容器拆解（Container）

```
C4Container
title Joyboy 登录体系 - 容器视图
Person(user, "终端用户")
System_Boundary(joyboy, "Joyboy 平台") {
  Container(appRouter, "App Router", "Next.js", "渲染登录、注册、账号页")
  Container(clientSide, "LoginLayoutClient", "React 客户端组件", "埋点 & Redux 初始化")
  Container(edgeChain, "Middleware Chain", "Edge Runtime", "登录态判断、重定向、旧路由兼容")
  Container(toolkit, "Middleware Toolkit", "TypeScript 库", "cookie 管理、路径匹配、state 封装")
}
System_Ext(authSvc, "Account Identity Service")
Rel(user, appRouter, "浏览 /app/.../(auth)/login")
Rel(appRouter, clientSide, "加载 client layout，触发埋点")
Rel(appRouter, edgeChain, "请求命中中间件链")
Rel(edgeChain, toolkit, "调用 cookie / redirect 工具")
Rel(edgeChain, authSvc, "读取登录态 / 刷新 token")
```

### 模块职责（Component）

```
C4Component
title App Router - 登录域组件视图
Container_Boundary(authBoundary, "(auth) 路由组") {
  Component(loginPage, "login/page.tsx", "React 服务器组件", "渲染 UI、解析 redirect、驱动导航")
  Component(loginLayoutClient, "login/layout.client.tsx", "React 客户端组件", "触发 enterApp 埋点")
}
Component(edgeUserAuth, "userAuthMiddleware", "Edge Middleware", "登录态判断、路由白名单")
Component(edgeAccount, "accountMiddleware", "Edge Middleware", "旧路由兼容与区域路由补全")
Component(chainUtil, "chain.ts", "Utility", "中间件组合器")
Component(cookieManager, "createCookieManager", "Utility", "读取/写入 webAccessToken")
Rel(loginPage, loginLayoutClient, "import", "在布局中包含 client 组件")
Rel(loginPage, edgeUserAuth, "受其保护")
Rel(edgeUserAuth, edgeAccount, "组合执行")
Rel(edgeUserAuth, cookieManager, "读取 token")
Rel(chainUtil, edgeUserAuth, "组合")
Rel(chainUtil, edgeAccount, "组合")
```

---

## 端到端流程概览

### 请求流向

```
flowchart LR
  Legacy[Legacy 深链 / 匿名访问]
  Browser[浏览器]
  Middleware[Edge Middleware Chain]
  AppRouter[Next.js App Router]
  Identity[Account Identity Service]
  Rewards[业务页面]

  Legacy -->|redirectUrl| Browser
  Browser --> Middleware
  Middleware -->|校验 cookie| Identity
  Middleware -->|放行或重定向| Browser
  Browser --> AppRouter
  AppRouter -->|登录提交| Identity
  AppRouter --> Rewards
```

### 登录成功时序

```
sequenceDiagram
autonumber
participant U as User
participant B as Browser
participant M as Edge Middleware
participant P as login/page.tsx
participant C as login/layout.client.tsx
participant S as Identity Service

U->>B: 访问 /sg/en/(auth)/login?redirectUrl=...
B->>M: 发起页面请求
M->>M: chain(userAuthMiddleware → accountMiddleware)
M-->>B: 放行请求 (或 redirect)
B->>P: 渲染 RSC 页面
P-->>B: 返回 UI + 表单
activate C
B->>C: 加载 client layout，dispatch enterApp
deactivate C
U->>P: 提交登录凭证
P->>S: 调用登录 API
S-->>P: 返回 access token
P->>B: 调用 router.push / window.location.href
B->>M: 命中中间件，更新 cookie
M-->>B: 根据 redirectUrl 重定向至业务页
```

---

## 关键模块设计

### 页面层

- 登录页位于 `app/[deviceTheme]/[region]/[locale]/(auth)/login/page.tsx`，渲染复用组件 `MainContent`，并开启 `displayLogin` 模式，统一登录 UI。
- 跳转路径由 `useRouter`、`useParams`、`useSearchParams` 决定。若有 `redirectUrl` 参数，优先跳回业务页，支持绝对地址校验，否则按区域前缀转成站内路径。
- 针对奖励业务（`from=rewards/the-castlery-club`），在开启 Yotpo 条件下，直接推送到 `/region/rewards`。
- 其余场景回退到 `/region` 首页。
- 页面根据断点调整 `Container` 间距，维持响应式体验，无需额外服务器端逻辑。
### 客户端副作用层

- `LoginLayoutClient` 是纯客户端组件，仅负责在账号域触发 `enterApp({ page: 'Account' })`，维持 Redux 埋点（如 Datalayer）初始化顺序，与旧项目在 `AccountLayout` 中的行为对齐。
### Edge Middleware 链路

- 所有中间件通过 `chain([userAuthMiddleware, accountMiddleware, ...])` 组合，保证可按需插拔且顺序明确。
- `userAuthMiddleware` 使用 `createCookieManager` 读取统一的 `webAccessToken`，确定 `isAuthenticated` 标记。
- 路由白名单（如 `/login`、`/signup`、`/forgot-password`）在已有登录态时会 302 回区域首页。需要登录的路由（如 `/profile`、`/orders`、`/rewards` 等）缺少登录态时会构造 `redirectUrl`，跳转到区域登录页并携带原始查询串，保持旧站体验。
- 异常会写入 Observability 日志但不中断链路，避免生产阻塞。
### 业务路由控制

- `accountMiddleware` 负责把旧路径 `/account/rewards` 重定向到多区域新路径 `/{region}/account/the-castlery-club`，确保外部收藏的链接仍然可用。
- 中间件依赖 `getRequiredParams`、`createRedirectWithState`，自动补全区域、携带 state，降低页面层负担。
### Cookie 与工具层

- `createCookieManager` 基于 `@castlery/shared-persistence-kit`，统一处理请求/响应实例，避免在多个中间件重复实现解析逻辑。
- 工具层暴露的 `getExtraPathname`、`shouldSkipForPatterns` 等，可在未来扩展更复杂的业务路由或灰度开关。
---

## 重定向与状态保持策略

- 登录页在客户端使用 `router.push` 与 `window.location.href` 结合，确保站内导航仍保留历史记录，跨域回跳可直接刷新登录后的第三方页。
- 中间件侧使用 `createRedirectWithState` 包装 `NextResponse.redirect`，在 Next 14 Edge Runtime 中保留 cookie 写入能力，与老项目 `history.replace` 对齐。
---

## 迁移实施要点

1. - 路由映射：通过 `basePageConfig` 维护登录相关路径，迁移时对照旧站配置完成映射，避免硬编码。
2. - 多区域支持：所有页面与中间件均从 `params.region` 或 `getRequiredParams` 读取区域信息，实现 `/sg`、`/au` 等多区域共用一套逻辑。
3. - 回跳兼容：保留 `redirectUrl` query 的双向编码逻辑，允许旧站传入绝对地址，也能在无 scheme 的场景下自动补全区域路径。
4. - 埋点一致性：在 `layout.client.tsx` 中确保 `enterApp` 在页面装载时触发，避免漏埋点。
5. - 异常监控：`userAuthMiddleware` 捕获异常后打印 `logger.error`，需在 Observability 平台配合设定告警阈值，快速发现迁移阶段的 cookie 兼容问题。
---

## 后续规划

- 封装更细粒度的权限枚举，支持区分「仅会员」「会员+Rewards」等场景。
- 引入统一的登录埋点协议，补齐第三方登录成功后的事件归因。
- 在 `accountMiddleware` 基础上扩展更多旧站路径别名，并结合 `shouldSkipForPatterns` 实现更灵活的灰度控制。