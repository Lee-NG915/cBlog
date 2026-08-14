# cBlog

基于 Next.js Static Export 的个人博客 monorepo：博客前台 + 本地内容管理平台 + 轻量数据库（SQLite），部署目标是 GitHub Pages。

## 仓库结构

```text
apps/web/              博客前台（Next.js 静态导出，产物 apps/web/out/）
apps/admin/            内容管理平台（仅本地运行，localhost:3001）
packages/core/         共享核心：数据库 schema/仓储、内容读写、Markdown 渲染管道
content/posts/         文章 md 源文件（<分类>/<年份>/<slug>/index.md，图片在同目录 assets/）
content/collections/   专栏文档（rightCapital、addx-ai 等）
data/blog.db           SQLite 数据库（元数据与状态的唯一真源，随仓库提交）
docs/refactor/         重构 PRD / 技术设计 / 测试计划 / 进度与性能报告
scripts/               仓库级工具（构建产物等价校验等）
```

## 数据模型

- **数据库为真源**：文章/专栏的标题、日期、标签、摘要、分类、状态存 `data/blog.db`；md 文件承载正文。
- **frontmatter 自包含**：管理端每次保存会把元数据回写进 md 的 frontmatter，文件可脱离数据库迁移；手改文件后执行 `pnpm content:import`（文件优先）重建数据库。
- **状态机**：`draft`（dev 可见）→ `published`（生产可见）→ `archived`（全隐藏，文件保留）。

## 常用命令

```bash
pnpm install            # 安装全部工作区依赖
pnpm dev:web            # 博客前台 http://localhost:3000（dev 显示草稿）
pnpm dev:admin          # 管理平台 http://localhost:3001
pnpm build              # 漂移检测 + 生产构建（产物 apps/web/out/）
pnpm preview            # 本地预览构建产物 http://localhost:4173
pnpm test               # core 单元测试
pnpm content:import     # 从 md 全量导入/重建数据库（幂等，文件优先）
pnpm content:check      # frontmatter 与数据库漂移检测（仅告警）
```

产物等价校验（重构防回归工具，可继续用于大改动前后对比）：

```bash
node scripts/parity-snapshot.mjs snapshot apps/web/out /tmp/snap-a
node scripts/parity-snapshot.mjs compare /tmp/snap-a /tmp/snap-b
```

## 管理平台（apps/admin）

仅本地使用、无鉴权。能力：

- 文章：列表筛选（状态/分类/关键词）、新建（自动脚手架）、Markdown 编辑器 + 实时预览（含 Mermaid）、元数据编辑、状态流转、软删除（移入 `content/.trash/`）
- 图片：编辑器内粘贴/拖拽自动保存到文章 `assets/` 目录并插入相对引用
- 分类：新建即建目录，前台动态路由零代码生效；有文章的分类不可删除
- 专栏：新建专栏（slug 即一级路由，保留字校验）、文档管理与拖拽排序（排序回写 frontmatter）
- 发布：一键 git 提交推送（白名单仅 `content/`、`data/`），触发 GitHub Actions 部署

## 部署

push 到 `main` 后 GitHub Actions 自动构建发布 GitHub Pages（`.github/workflows/deploy.yml`）。构建时直接读取仓库内 `data/blog.db`，无需任何外部服务或 secret。

## 文档

- **[内容工作流手册](./CONTENT_GUIDE.md)** —— 写作、图片、状态、同步、发布的完整流程（日常必读）
- [重构 PRD](./docs/refactor/01-prd.md) · [技术设计](./docs/refactor/02-technical-design.md) · [测试计划](./docs/refactor/03-test-plan.md)
- [实施进度与偏差记录](./docs/refactor/PROGRESS.md) · [性能报告](./docs/refactor/perf-report.md)
