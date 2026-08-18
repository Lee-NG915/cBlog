# cBlog 部署态 v2 开发方案

- 版本：v0.3（2026-08-17）
- 关联文档：[技术方案](./01-technical-design.md) · [测试方案](./03-test-plan.md)
- 实施原则：每阶段可验证、可回退；最终不保留数据库与 Markdown 同步双写

## 1. 交付范围

本方案把现有“本地 Admin + SQLite/Markdown + GitHub Pages”迁移为：

- 部署后的单用户 Admin 与 Content API；
- PostgreSQL 唯一内容源；
- 对象存储资产；
- Next.js 静态预生成；可配置 GitHub Pages/静态托管全量构建或 Node Runtime On-demand ISR；
- Outbox 驱动的可靠发布通知；
- 数据库备份和 Markdown 离线导出。

不在本轮实施中顺带重做 UI、编辑器或 Markdown 渲染器。现有审查发现的公网鉴权、资产路径读取、未保存离开等问题，应分别作为安全/交互前置项处理，但不能扩大为无关页面改版。

## 2. 实施约束

1. 保持所有现有公开 URL 和 status 语义。
2. `feat/refector` 上采用小提交分阶段实现，不在一个提交同时切存储、部署和缓存。
3. Schema 迁移采用 expand → migrate → switch → contract，切换前后至少一个应用版本向后兼容。
4. 迁移期允许“文件源只读 + API 源影子校验”，不允许两个写入方并存。
5. 生产密钥、OAuth secret、数据库 URL 和对象存储凭证不得进入仓库。
6. 所有 ISR 测试在 production build 上执行；Static profile 另跑真实 export artifact 测试，二者不能相互替代。

## 3. 目标代码边界

```text
apps/admin/
  app/api/v1/public/...          # published-only Content API
  app/api/v1/admin/...           # authenticated mutation API
  lib/auth/                      # Auth.js GitHub session + immutable user ID allowlist
  lib/outbox/                    # claim/deliver/retry

apps/web/
  app/api/revalidate/route.ts    # HMAC webhook
  lib/content-api/               # typed fetch client and cache tags
  lib/revalidation/              # domain event -> allowed tags/paths

packages/publication/
  src/drivers/                   # GitHub dispatch / generic build hook / ISR webhook
  src/config.ts                  # profile 组合校验

packages/core/
  src/domain/                    # entity, status machine, errors
  src/db/postgres/               # Drizzle schema/client/migrations
  src/repo/                      # repository interfaces + Postgres impl
  src/markdown/                  # existing renderer, no DB/fs dependency
  src/events/                    # publication event schema

scripts/
  migrate-content-to-postgres.*
  verify-content-migration.*
  export-markdown-backup.*
```

把领域规则、Markdown 渲染和发布事件 schema 放入 core；把 HTTP、鉴权、Next cache API 留在各自 app。Web 不依赖 PostgreSQL driver 或 Admin 写仓储。

## 4. 分阶段计划

### Phase 0：决策冻结与安全基线（1–2 人日）

任务：

- 冻结双部署 profile：默认保留 GitHub Pages static-export，并实现可切换的 runtime-isr；确认数据库、对象存储、GitHub OAuth、域名/basePath 和 worker 形态。
- 建立 `.env.example`，列出变量名和用途，不包含真实值。
- 为 Admin 加鉴权边界设计；部署前关闭未认证的管理 API。
- 修复/移除现有 `/api/assets` 任意内容文件读取能力。
- 补齐 Admin 路由未保存离开保护，避免部署后更高概率丢稿。

退出标准：

- 技术方案对实现默认值、双 profile 和待生产切换时填写的平台值有明确边界。
- SEC-004 自动化通过；E2E-206 在 Phase 0 记录真实浏览器人工证据，Phase 3 建立 Playwright 后纳入回归。
- 无鉴权的 Admin 只允许绑定 loopback；Phase 3 AUTH P0 通过前禁止部署或公网暴露。

### Phase 1：领域与 PostgreSQL 仓储（3–5 人日）

任务：

- 将 SQLite 专属 schema 与通用领域类型拆开。
- 新增 PostgreSQL Drizzle schema：正文、版本、revision、assets、publication_events。
- 建立 repository interfaces 和 PostgreSQL 实现。
- 保存逻辑增加 optimistic concurrency；状态机保持现有三态。
- 建立本地临时 PostgreSQL 测试环境和迁移命令。

兼容策略：此阶段现有 Web/Admin 仍用 SQLite/Markdown，PostgreSQL 代码只由测试和迁移脚本调用。

退出标准：

- schema migration 可对空库重复执行。
- Repository 单元/集成测试覆盖事务、版本冲突和状态过滤。
- Web 生产构建行为不变。

### Phase 2：一次性迁移与校验工具（2–3 人日）

任务：

- 扫描当前 SQLite 元数据和 Markdown 正文，写入 PostgreSQL。
- 内容、标签顺序、专栏排序和状态保持不变。
- 使用 Markdown AST 扫描 `./assets/...` 与 `/images/...` 引用，上传现有图片并将数据库正文改写为 `asset://<asset-id>`；远程第三方 URL 保持原样并单独报告。
- 校验每个资产的源文件 hash、对象 hash、正文引用数量和未解析引用；渲染时解析为 CDN URL，备份导出时下载并还原为 `./assets/<safe-name>`。
- 明确旧 `date` 映射为 `editorial_date`；`published_at` 按可追溯的首次发布日期初始化，无法确定时记录迁移规则而不是静默使用迁移时间。
- 生成迁移报告：记录数、slug 集合、内容 SHA-256、资产 hash、失败项。
- 实现 Markdown 备份导出脚本，但不接入发布链路。

命令设计：

```text
pnpm content:migrate:plan       # 只读扫描和报告
pnpm content:migrate:apply      # 显式执行，支持 migration run id
pnpm content:migrate:verify     # 数据集、hash、状态、顺序比对
pnpm content:export             # DB -> 离线 Markdown 备份目录
```

退出标准：

- DATA-001～DATA-006 通过。
- 对同一 run id 重试不会制造重复记录。
- 随机抽样长文、中文 slug、Mermaid、图片文章渲染一致。

### Phase 3：实现 Admin 与 Content API，保持生产 v1 写链路（4–6 人日）

任务：

- 接入 Auth.js GitHub OAuth session，并按不可变 GitHub user ID 执行单用户 allowlist。
- 把现有 API 分为 `/public`、`/admin`、`/internal` 三类。
- Public API 只使用 published repository query，返回稳定 DTO 和 ETag/contentVersion。
- 实现 PostgreSQL 单写 adapter，接收 `expectedVersion`，仅在 staging/集成环境启用。
- 上传改为对象存储；删除本地任意路径读取接口。
- 发布页从 Git 状态改为内容版本和发布投递状态；先保留旧 Git 发布入口但隐藏在 feature flag 后。
- 输出 OpenAPI/类型契约，Web client 由契约生成或共享 DTO。
- 保留已鉴权的 Admin Markdown 预览，复用 `@cblog/core/markdown`；不向公开 Web 暴露 draft API。

Feature flags：

```text
ADMIN_STORAGE=filesystem|postgres
WEB_CONTENT_SOURCE=filesystem|api
PUBLIC_CONTENT_API_ENABLED=true|false
GIT_PUBLISH_ENABLED=true|false
```

本阶段只交付代码和 staging 验证。生产 `ADMIN_STORAGE` 保持 `filesystem`，现有 GitHub Pages 发布链路不变；禁止用双写把生产变更镜像到 PostgreSQL。PostgreSQL 生产单写只在 Phase 7 最终迁移后开启。

退出标准：

- API/AUTH/SEC P0 用例通过。
- 匿名用户看不到 Admin 页面、草稿、归档和修订。
- staging PostgreSQL 保存失败时没有 revision/outbox 半提交。
- 生产仍由 v1 文件链路发布，不存在发布真空期。

### Phase 4：Web API adapter 的影子静态构建（2–4 人日）

这是降低迁移风险的影子验证阶段：先验证 API 数据源能生成等价产物，再替换部署模型。影子产物不接管生产流量，生产仍由 v1 GitHub Pages 构建发布。

任务：

- 在现有 filesystem adapter 旁新增 typed Content API adapter；页面通过统一接口访问，由构建期 `WEB_CONTENT_SOURCE` 选择实现。
- 将所有页面和 `generateMetadata` 改为 async。
- 影子构建从公开 API 拉取数据，暂时仍保留 `output: "export"`；输出到独立 artifact，不覆盖生产 GitHub Pages。
- 为影子 workflow 注入 `CONTENT_API_BASE_URL`，验证 CI 网络、超时和失败保留策略。
- 对比新旧数据源构建产物的 URL、title、H1、站内链接、sitemap 与正文 hash。
- 避免页面读取全部正文：拆分 summary/detail/sidebar DTO。

退出标准：

- MIG/API/WEB 静态等价用例通过。
- `WEB_CONTENT_SOURCE=api` 的影子构建路由产物与运行时 trace 不加载 `better-sqlite3`，也不读取 `content/**/*.md`。
- API 故障会让构建失败，旧 Pages 版本保持可用。

回滚：停止影子 workflow/adapter，不影响仍使用文件数据源的生产站点；PostgreSQL 保留，不做反向覆盖。

### Phase 5：Web 双 profile 与 ISR（4–6 人日）

本阶段改为交付两种 Web profile，而不是永久删除 GitHub Pages 能力。

任务：

- 让 `WEB_RENDER_MODE=static-export|runtime-isr` 决定 Next 输出；静态模式产出完整 `out/`，Runtime 模式使用 `next build && next start`。
- 为 Runtime profile 的 Content API fetch 标注缓存 tag 和 `next.revalidate`；Static profile 不声明 ISR 语义。
- 动态文章/专栏路由不导出环境变量驱动的 route segment config：Runtime 使用默认 `dynamicParams=true`，Static 依赖完整 `generateStaticParams`。
- 统一 posts 与 collections 的 route param 编解码策略，删除仅为 export 目录名存在的 dev/prod hack。
- 在统一 Content API adapter 中只为 Runtime fetch 配置 `next.revalidate = 86400`，避免 Static Export 引入不支持的 route segment ISR 配置。
- 新增 `/api/revalidate`：验签、schema 校验、重放保护、领域事件映射。
- 新增 GitHub Pages workflow 的 `repository_dispatch` 入口、并发合并/取消策略和签名部署 callback。
- 增加 `WEB_RENDER_MODE` 与 `PUBLICATION_DRIVER` 组合校验，禁止 static + ISR webhook 等无效配置。
- 集中实现 `planRevalidation(event)`，返回白名单 tags/paths；页面和 Admin 不自行散落拼装失效范围。
- 配置平台共享 ISR 缓存；若自托管多副本则在本阶段完成共享 Cache Handler。
- 验证 404、sitemap、canonical、basePath 和旧链接。

退出标准：

- WEB/STATIC P0 全部通过；Runtime profile 的 ISR-001～ISR-016 全部通过。
- 新文章不重新部署即可在首次访问时生成。
- Static profile 的新文章在一次完整、原子部署后上线；失败时旧 Pages artifact 保持可用。
- 下线文章的缓存能被清理并返回 404。
- 任意 webhook payload 不能失效白名单外路径。

### Phase 6：Outbox 与发布闭环（4–6 人日）

任务：

- 在 publish/update/unpublish 事务中写 publication_events。
- 实现 SKIP LOCKED 或等效安全 claim，防止多个 worker 重复并发处理同一行。
- 定义 publication driver 接口，实现 GitHub repository dispatch、通用 build hook 和 HMAC ISR webhook；统一指数退避、幂等、failed 状态和手动重试。
- Static driver 对短时间连续事件做部署批次合并；dispatch 后进入 `awaiting_deploy`，通过 callback/状态查询确认后才进入 `delivered`。
- Admin 发布页显示保存、同步、上线状态；可选预热并验证目标页面。
- 增加结构化日志、指标和告警。

退出标准：

- REL/OBS P0 用例通过。
- Web 暂时离线后恢复，pending 事件无需人工改库即可完成。
- 重复事件不会造成错误或无限重建。

### Phase 7：生产就绪、切流准备与观察期后再退役（2–3 人日 + 观察期）

本章仓库内交付生产就绪基线与本地/staging 演练；**不切真实流量、不改生产默认 flag、不删除 filesystem / Git 发布 / SQLite / `simple-git`**。真实切流按 [07-cutover-runbook](./07-cutover-runbook.md) 在维护窗口单独执行。旧链路在观察至少一个完整发布周期后再开独立变更退役。

步骤：

1. 冻结内容写入，执行最终迁移和 hash 校验（生产冻结迁移使用 `MIGRATION_ASSET_STORE=s3`）。
2. 部署只读 Content API；再次运行 Web 影子构建并与线上快照比较。
3. 同时验证 static-export artifact 和 Runtime ISR 预发布；生产选择其一，但保留另一条可回退构建能力。
4. 在同一维护窗口开启 PostgreSQL Admin 单写、对应 publication driver，并切换域名/流量；不保留同步双写窗口。
5. 验证首页、文章、专栏、sitemap、404、资源和一次真实发布。
6. 观察至少一个完整发布周期，确认事件、缓存和备份。
7. 观察期通过后再开独立变更：固定生产 `WEB_CONTENT_SOURCE=api`，关闭 Git 发布入口，移除 filesystem adapter 以及生产对 SQLite、frontmatter 回写和 `simple-git` 的依赖。本章不得提前删除这些路径。
8. 保留迁移前仓库 tag、数据库备份和回滚 runbook。

退出标准：

- CUT/SEO/E2E P0 用例通过。
- 连续发布、修改、下线至少各一次成功。
- 备份恢复演练完成。

## 5. 路由改造清单

| 当前区域 | 改造 |
|---|---|
| `apps/web/next.config.js` | 按 `WEB_RENDER_MODE` 选择静态导出或 Runtime；统一 basePath/image 配置 |
| `apps/web/lib/posts.ts` | 改成 async Content API adapter；删除 fs/SQLite 依赖 |
| `apps/web/lib/collections.ts` | 同上 |
| `apps/web/app/page.tsx` | 使用 summary/site DTO 和 `post-index` tag |
| `apps/web/app/posts/[slug]/page.tsx` | build-time params + runtime dynamicParams + `post:<slug>` |
| `apps/web/app/categories/**` | category tag；新分类按需生成 |
| `apps/web/app/[collection]/**` | collection/item tags；未知 slug 404 |
| `apps/web/app/sitemap.ts` | 使用 sitemap DTO；发布事件失效 `/sitemap.xml` |
| `apps/web/app/api/revalidate/route.ts` | 新增 HMAC webhook |
| `apps/admin/app/api/**` | 路由分区、认证、PostgreSQL repository、稳定错误码 |
| `apps/admin/lib/git.ts` | 观察期后删除生产发布职责 |
| `packages/core/src/db/**` | 新增 PostgreSQL schema/migration，最终退役 SQLite runtime |
| `.github/workflows/deploy.yml` | Phase 4 增加影子 API 构建；作为 `static-export` profile 的正式发布流水线保留 |
| 根 `package.json` / content scripts | 退役生产 `content:check` 和本地 DB 构建前置；保留独立 migration/export/verify 命令 |
| `scripts/parity-snapshot.mjs` | 改为 API/Runtime 构建快照工具，稳定观察期后再决定是否退役 |

## 6. 环境变量

| 变量 | 使用方 | 敏感 | 用途 |
|---|---|:---:|---|
| `CONTENT_API_BASE_URL` | Web | 否 | Content API 地址 |
| `CONTENT_API_READ_TOKEN` | Web/CI | 是 | 可选；仅能读取 published DTO 的构建 token |
| `WEB_CONTENT_SOURCE` | Web build | 否 | 迁移期选择 filesystem/api；观察期后再固定为 api 并删除分支 |
| `WEB_RENDER_MODE` | Web/CI | 否 | `static-export` 或 `runtime-isr` |
| `WEB_RUNTIME_REPLICAS` | Web | 否 | runtime-isr 必须显式 `1`；多副本前需共享 Cache Handler |
| `DATABASE_URL` | Admin/worker | 是 | PostgreSQL 连接 |
| `REVALIDATION_WEBHOOK_URL` | worker | 否 | Web webhook 地址 |
| `AUTH_GITHUB_ID/AUTH_GITHUB_SECRET` | Admin | 是 | GitHub OAuth App |
| `AUTH_SECRET` | Admin | 是 | Auth.js session 签名/加密密钥 |
| `AUTH_TRUST_HOST` | Admin | 否 | 自托管时显式信任反向代理 Host header |
| `ADMIN_ALLOWED_GITHUB_ID` | Admin | 否 | 唯一允许登录的不可变 GitHub user ID |
| `OBJECT_STORAGE_*` | Admin | 是 | bucket、endpoint、access key |
| `SITE_URL` | Web | 否 | canonical/sitemap |
| `BASE_PATH` | Web | 否 | 是否保留 `/cBlog` |
| `REVALIDATION_ACTIVE_KEY_ID/REVALIDATION_ACTIVE_SECRET` | Web/worker | 是 | 当前 HMAC 签名密钥 |
| `REVALIDATION_PREVIOUS_KEY_ID/REVALIDATION_PREVIOUS_SECRET` | Web | 是 | 轮换窗口内只用于验签的上一密钥 |
| `PUBLICATION_DRIVER` | Worker | 否 | GitHub dispatch、通用 build hook 或 ISR webhook |
| `GITHUB_REPOSITORY` | Worker | 否 | Static/GitHub 模式的 `owner/repository` |
| `GITHUB_DISPATCH_EVENT` | Worker | 否 | Static/GitHub 模式下 Actions 监听的事件名 |
| `GITHUB_DISPATCH_TOKEN` | Worker | 是 | Static/GitHub 模式的最小权限 GitHub App/fine-grained token |
| `GENERIC_BUILD_HOOK_URL` | Worker | 是 | Generic Static 模式只接受 POST JSON 的构建入口；URL 可能包含不可公开标识 |
| `GENERIC_BUILD_HOOK_BEARER_TOKEN` | Worker | 是 | 可选 Bearer token；不拼入 query/log |
| `DEPLOY_CALLBACK_URL` | Worker/CI | 否 | Static 模式下 CI 回报部署结果的 Admin internal API 完整 URL |
| `DEPLOY_CALLBACK_SECRET` | Worker/CI | 是 | Static 模式的部署结果 callback 签名密钥 |

CI 应在启动时校验必填变量，禁止缺失后静默使用 localhost、仓库 DB 或默认 secret。

## 7. 数据迁移与回滚

### 7.1 迁移校验

迁移报告必须包括：

- posts/categories/tags/collections/items 数量；
- published/draft/archived 各状态数量；
- slug 集合差异；
- 每篇 Markdown 正文 SHA-256；
- 标签顺序、专栏顺序；
- 图片引用和对象 hash；
- 旧、新 sitemap URL 集合。

任何 P0 差异都阻止切换。

### 7.2 回滚层级

| 时点 | 回滚方式 |
|---|---|
| Phase 1–3 | 现有站点不变；停用新服务 |
| Phase 4 | 停止影子构建；生产 v1 未切换，无数据回退 |
| Phase 5 域名切换前 | 不切流量，修复 Runtime Web |
| 域名切换后、Admin 单写前 | 流量切回 GitHub Pages |
| Phase 7 Admin 单写后 | 回滚应用但保留 PostgreSQL；如必须回旧系统，先执行受控 DB→Markdown 导出并人工确认，禁止自动反向双写 |

数据库迁移默认只做向后兼容的新增列/表。破坏性删列放到稳定观察期后单独执行。

## 8. 估算与依赖

| Phase | 估算 | 外部依赖 |
|---|---:|---|
| 0 决策/安全 | 1–2 人日 | 平台、GitHub OAuth 决策 |
| 1 PostgreSQL/domain | 3–5 人日 | 数据库环境 |
| 2 迁移工具 | 2–3 人日 | 对象存储 |
| 3 Admin/API | 4–6 人日 | GitHub OAuth 配置 |
| 4 Web API adapter | 2–4 人日 | Content API 可用 |
| 5 Web profiles/ISR | 4–6 人日 | 静态托管、ISR 部署与共享缓存 |
| 6 Outbox/发布 | 4–6 人日 | 三种 driver、部署批次与 callback |
| 7 切换 | 2–3 人日 | 域名、DNS、备份 |
| 合计 | 22–35 人日 | 不含平台审批等待和观察期 |

单人串行实施建议按 4–6 周安排，并为生产观察与修复预留 20% 缓冲。

## 9. Definition of Done

- 所有 P0 自动化用例通过，P1 无未解释失败。
- Web 构建和 ISR 不读取仓库 SQLite/Markdown。
- Admin 线上写操作有认证、审计、版本冲突保护。
- 已发布内容变更能按事件刷新；草稿保存不影响公开缓存。
- Outbox 可重试、可观测、可手动恢复。
- Runtime profile 下新文章、分类和专栏不需要全量重新部署；Static profile 下由 Outbox 自动触发完整部署，无需手工提交内容文件。
- URL、canonical、sitemap 和 404 语义与迁移前一致。
- 数据库和对象存储备份完成一次恢复演练。
- Git/Markdown 仅保留备份用途，文档中不再称其为线上真源。
