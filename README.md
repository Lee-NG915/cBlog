# cBlog Monorepo

基于 Next.js Static Export 的个人博客项目，部署目标是 GitHub Pages。当前重构方向只考虑 PC 端访问，内容包括技术博客、学习日志、生活随记。

当前仓库已经扩展为一个本地优先的 monorepo：

- 根目录：公开博客站点（`@cblog/blog`）
- `apps/backend`：本地模拟面试后端，读取博客内容和私有代码源做追问与总结
- `apps/joyboy`：从本机工作树同步进来的 `joyboy` 代码副本，用于本地索引
- `apps/onepiece`：从本机工作树同步进来的 `onepiece` 代码副本，用于本地索引

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

### 本地模拟面试

先准备后端环境变量：

```bash
cp apps/backend/.env.example apps/backend/.env.local
```

至少填写：

```bash
OPENAI_API_KEY=...
```

如果你需要把本机 `joyboy` / `onepiece` 工作树重新同步进当前仓库：

```bash
pnpm run sync:workspace-sources
```

启动博客和本地面试后端：

```bash
pnpm run dev:local
```

此时博客本地导航会出现 `/interview` 路由，用于结合博客、`joyboy`、`onepiece` 与目标 JD 进行模拟面试。

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
category: technical
tags:
  - Next.js
  - GitHub Pages
excerpt: 文章摘要
status: published
coverImage: /images/example.jpg
---
```

固定分类在 `lib/site.ts` 配置。文章 frontmatter 的 `category` 必须填写 ASCII slug，页面展示名由配置决定：

- `technical` -> 工程札记
- `learning` -> 学习记录
- `life` -> 生活手记

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
app/                      Next.js App Router 页面
components/               博客前端组件
content/posts/            Markdown 文章
apps/backend/             本地模拟面试后端
apps/joyboy/              本地同步的 joyboy 工作树
apps/onepiece/            本地同步的 onepiece 工作树
docs/content-structure.md 内容文件结构规范
docs/refactor-plan.md     重构方案与分期边界
lib/posts.ts              文章读取、分类、统计逻辑
lib/site.ts               站点配置与固定分类
public/                   静态资源
```
