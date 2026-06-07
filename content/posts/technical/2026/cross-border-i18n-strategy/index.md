---
title: 跨境电商 i18n 方案：Next.js + react-i18next 选型与 RSC 兼容
slug: cross-border-i18n-strategy
date: 2026-05-29
updatedAt: 2026-06-05
category: technical
tags:
  - i18n
  - Next.js
  - Internationalization
  - E-commerce
status: draft
excerpt: 复盘多市场电商站的国际化方案：在 App Router + RSC 约束下对比 next-intl 与 react-i18next，处理 CMS 文案、懒加载、SEO 与后端 locale 透传。
---

# 前言

跨境电商前端同时要解决「多语言」和「多市场」两件事——它们相关但不等价。我参与了 i18n 技术方案的选型与落地：在 Next.js App Router 默认 RSC 的前提下，既要支持运营文案的 CMS 配置化，又要保证 SEO、类型安全和 Storybook 组件级分包。

---

## 方案要回答的问题

1. **RSC 兼容**：翻译资源在服务端加载，客户端 hydration 不闪烁
2. **CMS 结合**：运营文案可配置，支持预加载或按路由懒加载
3. **格式化**：日期、货币、复数与 ICU 表达式
4. **类型安全**：编译期能发现缺失 key
5. **SEO**：`hreflang`、canonical、各 locale 的 metadata
6. **后端透传**：API 请求携带 `Accept-Language` / 市场标识

---

## 框架对比

| 维度 | react-i18next | next-intl |
| --- | --- | --- |
| 适用范围 | 通用 React | Next.js 专用 |
| RSC 支持 | 需 next-i18next 配合 | 原生支持 |
| 插件生态 | 丰富 | 较轻量 |
| 懒加载 | 手动配置 | 内置 |
| 类型定义 | 成熟 | 够用 |

**结论**：项目已深度使用 react-i18next 生态（复数、插值、namespace），且需要与现有 Redux/CMS 管线集成，最终采用 **Next.js + react-i18next（next-i18next 扩展）**，而不是整体迁移到 next-intl。

若从零新建纯 Next 项目、国际化需求简单，我会优先评估 next-intl 以降低胶水代码。

---

## 资源组织

```
locales/
├── en-US/
│   ├── common.json
│   ├── checkout.json
│   └── plp.json
├── zh-SG/
└── ...
```

- **按路由懒加载 namespace**：结账页只拉 `checkout`，避免首屏 JSON 过大
- **CMS 文案**：营销页长文案走 Headless CMS，短 UI 标签走 i18n 文件
- **回退链**：`zh-SG` → `en-US`，缺失 key 开发环境报错、生产环境回退

---

## RSC 下的加载时序

```
Request → middleware 解析 locale
       → RSC layout 加载对应 namespace
       → 渲染 HTML（文案已在服务端）
       → 客户端 hydration 复用同一份 i18n 实例
```

关键约束：**不要在 Client Component 里异步 `useTranslation` 后才渲染首屏文案**，否则 SSR/CSR 文本不一致。

---

## 与多市场 ENV 的配合

i18n 管「说什么语言」，ENV 管「在哪个市场卖什么」——两层正交：

- URL 前缀 `[locale]/[region]` 分别驱动翻译与市场配置
- 价格币种由 region 决定，不混进翻译文件
- Feature Flag 可按 region 开关，与文案解耦

---

## 关联阅读

- [多市场 Feature Flag 设计](/posts/multi-market-feature-flag/)（草稿）
- [Next.js Web 架构](/posts/nextjs-web-app-architecture/)（草稿）
