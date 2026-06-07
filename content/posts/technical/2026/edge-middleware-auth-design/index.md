---
title: Next.js Edge Middleware 登录鉴权：从客户端守卫迁到服务端预判
slug: edge-middleware-auth-design
date: 2026-06-02
updatedAt: 2026-06-05
category: technical
tags:
  - Next.js
  - Auth
  - Middleware
  - Security
status: draft
excerpt: 复盘账号体系从 React Router 客户端守卫迁移到 App Router + Edge Middleware：C4 分层、cookie/token 刷新、Legacy 深链兼容与登录后回跳。
---

# 前言

Legacy 电商站用 React Router + HOC 做登录守卫——用户先看到页面骨架，再被 `useEffect` 踢到登录页，首屏闪烁明显，SEO 也不友好。我主导了账号体系向 Next.js App Router 的迁移：**在 Edge Middleware 完成鉴权预判**，服务端渲染前就决定跳转，同时保持登录后回跳、埋点初始化和第三方登录回调的行为一致。

---

## 目标

1. 复用账号中心能力（登录、注册、找回密码），对接新路由结构
2. **服务端完成权限判定**，缩短白屏/闪烁，满足爬虫与安全要求
3. 保持 `redirectUrl`、业务模块发起的鉴权逻辑不变
4. 中间件链可扩展，支撑未来 OAuth 与多区域路由

---

## 架构分层（C4 简化）

```
用户 → Edge Middleware Chain → App Router (RSC)
              ↓                      ↓
        Account Identity Svc    LoginLayoutClient（埋点）
```

| 组件 | 职责 |
| --- | --- |
| `userAuthMiddleware` | 读 cookie、判断登录态、白名单放行 |
| `accountMiddleware` | Legacy 路径映射、region 补全 |
| `chain.ts` | 中间件组合，顺序执行 |
| `login/page.tsx` (RSC) | 渲染登录 UI、解析 redirect |
| `login/layout.client.tsx` | 客户端埋点、Redux 初始化 |

---

## 请求流

```
浏览器请求 /account/orders
    → Middleware 读 webAccessToken
    → 无 token → 302 /login?redirectUrl=...
    → 有 token 但过期 → 调刷新接口 → 成功写 cookie / 失败清 cookie
    → 通过 → App Router 渲染订单页
```

**对比客户端守卫**：Middleware 在 HTML 生成前执行，未授权用户不会收到受保护页面的 RSC payload。

---

## Legacy 深链兼容

历史站点部分 URL 仍被书签/邮件引用。`accountMiddleware` 维护映射表：

- 旧路径 → 新 App Router 路径
- 自动补全缺失的 region 前缀
- 保留 query（如 UTM、redirectUrl）

避免「迁移后登录链接全部失效」的客服风暴。

---

## Cookie 与 Token 策略

- Access token 放 httpOnly cookie，客户端 JS 不直接读
- Middleware 与 Server Action 共用 `createCookieManager` 工具，读写一致
- 刷新失败统一清凭证 + 跳转登录，不在业务页各自 catch 401

这与 [HTTP 错误分层](/posts/http-error-handling-strategy/) 的基础设施层策略对齐。

---

## 踩坑

1. **Edge Runtime 限制**：Middleware 不能调某些 Node API，刷新逻辑要保持轻量
2. **埋点时机**：`enterApp` 必须在 Client Layout 触发，不能放在 Middleware
3. **RSC 重定向**：服务端组件内 `redirect()` 与 Middleware 302 不要重复判断

---

## 关联阅读

- [Next.js Web 架构](/posts/nextjs-web-app-architecture/)（草稿）
- [HTTP 错误处理策略](/posts/http-error-handling-strategy/)
