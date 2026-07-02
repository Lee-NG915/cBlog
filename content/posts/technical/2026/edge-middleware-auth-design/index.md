---
title: Next.js Edge Middleware 登录鉴权：从客户端守卫迁到服务端预判
slug: edge-middleware-auth-design
date: 2026-06-23
updatedAt: 2026-06-24
category: technical
tags:
  - Next.js
  - Auth
  - Middleware
  - Security
status: published
excerpt: 复盘账号体系从 React Router 客户端守卫迁移到 App Router + Edge Middleware：cookie/token 刷新、Legacy 深链兼容与登录后回跳。
---

# 前言

Legacy 电商站用 React Router + HOC 做登录守卫——用户先看到页面骨架，再被 `useEffect` 踢到登录页，首屏闪烁明显，SEO 也不友好。我主导了账号体系向 Next.js App Router 的迁移：**在 Edge Middleware 完成鉴权预判**，服务端渲染前就决定跳转，同时保持登录后回跳、埋点初始化和第三方登录回调的行为一致。

---

## 阅读主线

这篇对应认证鉴权、cookie/token、刷新策略、CORS/安全基础和 App Router 服务端边界。阅读时先看为什么客户端守卫会闪屏，再看 Middleware 能做鉴权预判但不适合做重业务逻辑；token 刷新、登录回跳和第三方回调要保持幂等和可观测。

## 目标

1. 复用账号中心能力（登录、注册、找回密码），对接新路由结构
2. **服务端完成权限判定**，缩短白屏/闪烁，满足爬虫与安全要求
3. 保持 `redirectUrl`、业务模块发起的鉴权逻辑不变
4. 中间件链可扩展，支撑未来 OAuth 与多区域路由

---

## 请求流

```text
浏览器请求 /account/orders
    → Middleware 读 accessToken cookie
    → 无 token → 302 /login?redirectUrl=...
    → 有 token 但过期 → 调刷新接口 → 成功写 cookie / 失败清 cookie
    → 通过 → App Router 渲染订单页
```

**对比客户端守卫**：Middleware 在 HTML 生成前执行，未授权用户不会收到受保护页面的 RSC payload。

中间件拆成链式执行，而不是一个大函数：

| 环节 | 职责 |
| --- | --- |
| 鉴权中间件 | 读 cookie、判断登录态、白名单放行 |
| 路径兼容中间件 | Legacy 路径映射、region 前缀补全 |
| 组合入口 | 按顺序串联，便于独立测试和扩展 |

---

## Legacy 深链兼容

历史站点部分 URL 仍被书签/邮件引用。路径兼容中间件维护映射表：

- 旧路径 → 新 App Router 路径
- 自动补全缺失的 region 前缀
- 保留 query（如 UTM、redirectUrl）

避免「迁移后登录链接全部失效」的客服风暴。这也是 [迁移节奏设计](/posts/ecommerce-migration-plan/) 里每批上线必须验深链的原因。

---

## Cookie 与 Token 策略

- Access token 放 httpOnly cookie，客户端 JS 不直接读
- Middleware 与 Server Action 共用 cookie 读写工具，避免两处逻辑漂移
- 刷新失败统一清凭证 + 跳转登录，不在业务页各自 catch 401

这与 [HTTP 错误分层](/posts/http-error-handling-strategy/) 的基础设施层策略对齐——401 是横切关注点，不该散落在每个页面。

---

## 踩坑

1. **Edge Runtime 限制**：Middleware 不能调某些 Node API，刷新逻辑要保持轻量
2. **埋点时机**：应用进入事件必须在 Client Layout 触发，不能放在 Middleware
3. **RSC 重定向**：服务端组件内 `redirect()` 与 Middleware 302 不要重复判断

---

## 关联阅读

- [企业级电商前端平台架构重构](/posts/ecommerce-architecture-redesign/)
- [大型电商前端迁移节奏](/posts/ecommerce-migration-plan/)
- [HTTP 错误处理策略](/posts/http-error-handling-strategy/)
