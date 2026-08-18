# 开发协作

改**代码**看本文。写**文章**看 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)。仓库总览看 [README.md](./README.md)。

这是个人站点仓库，没有对外贡献流程。下面约束的是：**怎么在本机改前台 / 管理端 / 核心包，同时不把生产从 v1 文件链路误切走。**

## 本地开发

```bash
pnpm install
pnpm dev:web              # http://localhost:3000
pnpm dev:admin            # http://127.0.0.1:3001（强制 loopback）
pnpm test                 # packages/core 单测，不连外部库
pnpm --filter @cblog/admin test
pnpm --filter @cblog/web test
pnpm build                # content:check + 生产静态构建
```

包管理器只用 pnpm。工作区：`apps/*`、`packages/*`。

## 包边界

| 包 | 可以依赖 | 不要做 |
|---|---|---|
| `packages/core` | Node 标准库、drizzle、sqlite/pg 驱动、remark | 不要依赖 Next、React、Admin UI |
| `apps/web` | `@cblog/core`、页面与展示组件 | 页面不要直接 `fs.readFile` 或 `getDb()`；走 `lib/content` |
| `apps/admin` | `@cblog/core`、本机 git、可选 postgres/S3 | 生产默认不要开启公网监听；postgres 模式才走 OAuth |

Web 的内容入口是 `apps/web/lib/content/index.ts`：按 `WEB_CONTENT_SOURCE` 条件加载 `filesystem` 或 `api`。api 模式不得把 `better-sqlite3` 打进 bundle。

Admin 的内容入口是 `apps/admin/lib/content-service/index.ts`：按 `ADMIN_STORAGE` 选择 filesystem 或 postgres。进程内单例，换模式必须重启。

共享 Markdown 渲染在 `@cblog/core/markdown`，前台构建和管理端预览必须走同一管道。

## 生产不变性（改代码时的红线）

当前公开流量仍是 v1。除非你正在按 [切流 runbook](./docs/deployment/07-cutover-runbook.md) 执行维护窗口，否则：

- 不要把 `.env` / GitHub vars 的生产默认改成 `ADMIN_STORAGE=postgres` 或 `WEB_CONTENT_SOURCE=api`
- 不要删除 filesystem ContentService、`apps/admin/lib/git.ts`、Web filesystem adapter、SQLite 或 `simple-git`
- 不要让 `GIT_PUBLISH_ENABLED` 在生产变 `false`
- `runtime-isr` 必须显式 `WEB_RUNTIME_REPLICAS=1`；未做共享 Cache Handler 前禁止多副本
- `WEB_RENDER_MODE` 与 `PUBLICATION_DRIVER` 组合不合法时，构建必须直接失败，禁止静默降级

合法组合：

| `WEB_RENDER_MODE` | 允许的 `PUBLICATION_DRIVER` |
|---|---|
| `static-export`（生产） | `github-dispatch`、`generic-build-hook` |
| `runtime-isr` | `revalidation-webhook` |

## 内容与代码分开提交

管理端发布白名单只有 `content/` 和 `data/`。代码改动请单独分支、单独 PR / 提交，不要和文章发布混在一次 push 里。

手改了 Markdown 的 frontmatter 或增删了文件后，先 `pnpm content:import` 再提交 `data/blog.db`，否则生产构建只能看到漂移告警，新文章不会出现。

## 测试怎么选

| 你改了什么 | 至少跑 |
|---|---|
| core 领域 / SQLite 导入 | `pnpm test` |
| Admin UI 或 git 发布 | `pnpm --filter @cblog/admin test` |
| 前台页面 / 内容适配 | `pnpm --filter @cblog/web test` 以及 `pnpm build` |
| Postgres 仓储 | `pnpm test:postgres`（需本地测试库） |
| 迁移 / 备份门禁 | `pnpm test:cutover`；完整演练 `pnpm cutover:drill` |
| 双 profile 页面路由 | `pnpm profile:build` |

默认 `pnpm test` **不会**连 Postgres。集成测试必须显式 URL，并拒绝非本地地址上的 schema reset。

## 文档放哪

- 日常写作：改 [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)
- 架构与命令：改 [README.md](./README.md)
- v1 重构结论：`docs/refactor/`
- v2 方案与切流：`docs/deployment/`
- 已完成阶段的复盘：`docs/implementation-journal/`

实施日志按阶段追加，不要回写已经冻结的 v1 结论。
