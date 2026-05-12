# cBlog

基于 Next.js Static Export 的个人博客项目，部署目标是 GitHub Pages。当前重构方向只考虑 PC 端访问，内容包括技术博客、学习日志、生活随记。

## 技术方向

- Next.js App Router + TypeScript
- 静态站点生成（SSG），构建产物输出到 `out/`
- Tailwind CSS 构建 PC 端界面
- Markdown + frontmatter 管理文章内容
- GitHub Actions 自动部署到 GitHub Pages

详细重构决策见 [docs/refactor-plan.md](./docs/refactor-plan.md)。

## 本地开发

```bash
pnpm install
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 构建与预览

```bash
pnpm run build
pnpm run preview
```

构建产物会生成到 `out/`。`public/.nojekyll` 会随构建进入产物，保证 GitHub Pages 正常服务 `_next` 静态资源。

## 内容目录

文章按分类、年份和文章 slug 组织：

```text
content/posts/<category-slug>/<year>/<post-slug>/index.md
```

推荐 frontmatter：

```yaml
---
title: 文章标题
slug: article-slug
date: 2026-05-11
updatedAt: 2026-05-11
category: 技术博客
tags:
  - Next.js
  - GitHub Pages
excerpt: 文章摘要
status: published
coverImage: /images/example.jpg
---
```

固定分类：

- `technical` -> 技术博客
- `learning` -> 学习日志
- `life` -> 生活随记

`status: draft` 的文章不会进入公开页面。

详细内容结构见 [docs/content-structure.md](./docs/content-structure.md)。

## 部署

仓库已配置 `.github/workflows/deploy.yml`。推送到 `main` 后，GitHub Actions 会执行：

1. 安装 pnpm 依赖
2. 按仓库名设置 `BASE_PATH`
3. 执行 `pnpm run build`
4. 上传 `out/` 到 GitHub Pages

GitHub 仓库的 Pages Source 需要选择 `GitHub Actions`。

## 项目结构

```text
app/                  Next.js App Router 页面
components/           PC 端展示组件
content/posts/        Markdown 文章
docs/content-structure.md 内容文件结构规范
docs/refactor-plan.md 重构方案与分期边界
lib/posts.ts          文章读取、分类、统计逻辑
lib/site.ts           站点配置与固定分类
public/               静态资源
```
