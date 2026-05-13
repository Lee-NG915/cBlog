# cBlog 重构方案

## 结论

当前部署目标仍然是 GitHub Pages，因此主站不采用运行时 SSR，也不设计传统后端服务。最佳方案是：

- 主站：Next.js App Router + Static Export，构建期生成静态 HTML。
- 页面模式：SSG 为主，少量客户端组件只负责主题切换、搜索、交互动画等增强体验。
- 内容源：仓库内 Markdown/MDX 文件，构建期读取并生成文章、分类、归档和统计数据。
- UI：Tailwind CSS 作为样式基础；组件库选 shadcn/ui 的代码式组件体系，底层可按需引入 Radix UI。
- 部署：GitHub Actions 构建 `out/`，通过 GitHub Pages 发布。

这不是前后端分离的运行时架构，而是“内容/管理/展示分离”的静态站点架构。对于 GitHub Pages，这是成本、可维护性、SEO 和稳定性最均衡的选择。

参考依据：

- GitHub Pages 官方定义为静态站点托管服务，会发布 HTML、CSS、JavaScript 等静态文件。
- Next.js static export 会在 `next build` 时为每个路由生成 HTML，并输出到 `out/`。
- Next.js static export 不支持需要 Node.js 服务器或请求期动态逻辑的功能，例如 Server Actions、默认图片优化、ISR、依赖 Request 的 Route Handler 等。

## SSR / CSR / SSG 对比

| 模式 | GitHub Pages 可用性 | 适合度 | 说明 |
| --- | --- | --- | --- |
| SSR | 不适合 | 低 | GitHub Pages 只托管静态文件，无法在请求时运行 Node 服务。 |
| CSR | 可用 | 中 | 可以部署纯前端应用，但文章 SEO、首屏内容和归档可抓取性较弱。 |
| SSG | 可用 | 高 | 构建时生成静态 HTML，适合博客、分类、归档、RSS 和站点地图。 |

主站采用 SSG。管理后台二期可以使用 CSR，因为后台不需要 SEO，且交互复杂度更高。

## 技术选型

| 模块 | 选型 | 原因 |
| --- | --- | --- |
| 框架 | Next.js App Router static export | 当前仓库已经使用 Next，迁移成本低；静态导出适配 GitHub Pages。 |
| 语言 | TypeScript | 内容模型、构建脚本和后台逻辑需要类型约束。 |
| 样式 | Tailwind CSS | 当前已接入，适合快速构建稳定的 PC 端布局。 |
| 组件 | shadcn/ui + Radix UI | 组件源码归项目管理，适合长期定制；后台表单、弹窗、菜单、Tabs 体验成熟。 |
| 内容 | Markdown/MDX + frontmatter | 易迁移、可 Git 管理、适合技术博客和学习日志。 |
| Markdown 解析 | gray-matter + remark/rehype | 当前已接入，可逐步扩展代码高亮、目录、脚注等能力。 |
| 数据分析 | 静态内容统计 + GA4/Umami/Plausible | Pages 不能安全保存密钥，流量分析需要外部服务或只做公开统计。 |
| 部署 | GitHub Actions + GitHub Pages | 当前已具备基础工作流。 |

## 内容模型

文章分类先固定为：

- `technical` -> 工程札记
- `learning` -> 产品观察
- `life` -> 生活手记

Frontmatter 建议字段：

```yaml
---
title: 文章标题
date: 2026-05-11
updatedAt: 2026-05-11
category: technical
tags:
  - Next.js
  - GitHub Pages
excerpt: 摘要
status: published
coverImage: /images/example.jpg
---
```

`status: draft` 的文章不进入生产构建。分类配置在 `lib/site.ts`，路由和 frontmatter 一律使用 ASCII 分类 slug，中文只用于页面展示。文件建议按文章包组织：`content/posts/<category-slug>/<year>/<post-slug>/index.md`，详细规则见 [content-structure.md](./content-structure.md)。

## 一期范围

1. 保留 Next.js static export，修正 GitHub Pages 所需基础配置。
2. 明确 PC 端布局，不再投入移动端交互。
3. 建立文章元数据模型、分类模型、统计数据。
4. 迁移现有文章到新分类。
5. 优化首页、分类页、文章详情页的信息架构。
6. 保证 `pnpm run build` 可以生成 `out/` 静态产物。

## 二期后台边界

GitHub Pages 不能直接承载安全后端，所以后台有三种可选实现：

| 方案 | 推荐度 | 说明 |
| --- | --- | --- |
| 本地管理后台 | 高 | 在本地运行，直接读写 Markdown，发布时提交 Git。最安全、最简单。 |
| 静态后台 + 用户 GitHub Token | 中 | 后台部署到 Pages，用户手动输入 fine-grained token 后调用 GitHub API。实现简单，但密钥体验要谨慎设计。 |
| 静态后台 + OAuth 服务 | 中 | 后台仍在 Pages，认证走外部 OAuth 服务或自建轻量函数。体验最好，但引入额外服务。 |

二期建议优先做“本地管理后台 + 静态预览”。如果之后希望完全在线编辑，再接 GitHub OAuth 或 CMS 服务。
