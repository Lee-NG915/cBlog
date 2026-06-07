---
title: Next.js App Router 电商 Web 架构：RSC、路由分层与 Server Action 边界
slug: nextjs-web-app-architecture
date: 2026-05-27
updatedAt: 2026-06-04
category: technical
tags:
  - Next.js
  - App Router
  - RSC
  - Architecture
  - E-commerce
status: draft
excerpt: 复盘跨境电商 Web 端在 Next.js 14 App Router 上的目录分层：locale/region 路由、RSC 与 Client Component 切分、Server Action 数据层，以及 DDD 模块在 Monorepo 中的落位。
---

# 前言

Legacy 电商站点从 React Router CSR 迁到 Next.js App Router 时，最难的不是「把 page 搬过来」，而是重新定义**渲染边界**和**路由语义**。我负责梳理并落地了 Web 端的 App Router 架构——在多市场（locale + region）、多页面类型（投放页、结账、账户）并存的场景下，让 RSC 负责数据与 SEO，Client Component 只承载交互，Server Action 收口服务端 IO。

---

## 路由分层模型

采用 `[locale]/[region]/...` 双层前缀，把「语言」和「市场」解耦：

```
app/
├── [locale]/
│   └── [region]/
│       ├── (marketing)/     # 投放页分组
│       ├── (shop)/          # 商品链路
│       ├── (auth)/          # 登录注册
│       ├── layout.tsx       # 市场级服务端布局
│       └── client-layout.tsx # Provider 注入（客户端）
├── api/                     # Route Handlers
├── middleware.ts            # 鉴权、区域跳转
└── i18n/                    # 语言配置
```

**设计原则**：

- Route Group `(...)` 只影响布局组织，不出现在 URL
- 每个叶子路由标配 `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` / `metadata`
- 市场级 `client-layout` 统一挂载 Redux、主题、埋点初始化，避免每个页面重复 Provider

---

## RSC 与 Client Component 切分

| 放服务端 (RSC) | 放客户端 (CC) |
| --- | --- |
| 首屏数据 fetch、SEO metadata | 表单交互、动画、即时搜索 |
| 价格/库存等服务端可信数据 | Redux 订阅、浏览器 API |
| 静态结构、骨架屏边界 | 第三方 SDK（支付、地图） |

默认 `app/` 下均为 Server Component。只有文件顶部 `'use client'` 才进入客户端 bundle——这条纪律直接决定了包体积和 FCP。

### 三种渲染策略

按路由段选择：

1. **静态渲染（默认）** — 不变内容、法务页
2. **动态渲染** — 强个性化、实时库存敏感页
3. **ISR** — CMS 投放页、营销 PLP（配合 Redis 共享缓存）

---

## 数据层：Server Action + 领域模块

Monorepo 内按 DDD 切分 `modules/`：

```
modules/
└── catalog/
    ├── domain/       # 实体、业务规则
    ├── services/     # 用例编排
    └── actions/      # Server Action 入口
shared/
└── auth/             # 会话、token 刷新
```

**Server Action** 作为 BFF 薄层：校验输入 → 调 domain service → 返回序列化 DTO。不在 Action 里写 UI 逻辑，也不把 fetch 散落在 Client Component 的 `useEffect` 里。

**Redux** 保留给客户端跨页状态（购物车草稿、结账步骤），服务端首屏数据通过 RSC props 注入，避免「双份数据源」。

---

## 鉴权与中间件

登录态在 **Edge Middleware** 预判：

- 未登录访问账户页 → 302 到登录，携带 `redirectUrl`
- 已登录访问登录页 → 回跳业务页
- Legacy 深链兼容 → 中间件链第二段做路径映射

这比客户端 `useEffect` 守卫更早执行，消除首屏闪烁，也有利于 SEO（爬虫拿到正确重定向）。

---

## 工程收益

- **包体积**：RSC 把重型依赖留在服务端，客户端只下载交互切片
- **SEO**：metadata 与结构化数据在服务端生成，不依赖客户端 hydration
- **可测试性**：domain 层与 Next 路由解耦，单测不启动完整 App
- **多市场扩展**：新增 region 主要是配置 + 布局差异，不必复制路由树

---

## 关联阅读

- [企业级电商前端平台架构重构](/posts/ecommerce-architecture-redesign/)
- [Edge Middleware 登录鉴权设计](/posts/edge-middleware-auth-design/)（草稿）
- [ISR + Redis 共享缓存](/posts/nextjs-isr-redis-shared-cache/)
