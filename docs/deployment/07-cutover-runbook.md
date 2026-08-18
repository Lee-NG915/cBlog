# Phase 7 生产就绪、切流与回滚 Runbook

- 状态：仓库内生产就绪基线；真实切流待平台配置和维护窗口确认
- 首次 URL 策略：保留 `https://lee-ng915.github.io/cBlog`
- Web profile：`static-export` 与 `runtime-isr` 均保持可部署，真实切流前二选一
- 旧链路：切流观察至少一个完整发布周期后再单独退役 filesystem / Git 发布 / SQLite；本章禁止同步双写，也禁止提前删除 v1 路径

## 1. 安全边界

1. 本章脚本不得对未确认目标执行破坏性操作。备份要求
   `CBLOG_BACKUP_CONFIRM_TARGET=host:port/database`；恢复演练要求不同的空数据库和
   `CBLOG_RESTORE_CONFIRM_TARGET`。
2. 真实切流前冻结内容写入。冻结后只允许最终 migration、备份、校验和部署配置变更。
3. `ADMIN_STORAGE=filesystem` 与 `ADMIN_STORAGE=postgres` 不得同时接收写流量。
4. PostgreSQL dump、对象存储版本、migration report 和切流前 Git tag 必须在不同故障域保存。
5. 当前 static worker 与 runtime Web 均按单副本部署；多副本前需实现 batch leader / 共享 Cache Handler。

## 2. 仓库与平台准备

### 2.1 GitHub Pages static-export

仓库变量：

```text
WEB_CONTENT_SOURCE=api
CONTENT_API_BASE_URL=https://<admin-host>
SITE_URL=https://lee-ng915.github.io/cBlog
DEPLOY_CALLBACK_URL=https://<admin-host>/api/v1/internal/deployments/callback
```

仓库 secrets：

```text
CONTENT_API_READ_TOKEN=<published-only token>
DEPLOY_CALLBACK_SECRET=<callback HMAC secret>
```

Admin/worker：

```text
PUBLICATION_DRIVER=github-dispatch
GITHUB_REPOSITORY=<owner>/<repo>
GITHUB_DISPATCH_TOKEN=<fine-grained token or GitHub App token>
```

`.github/workflows/deploy.yml` 在 `WEB_CONTENT_SOURCE=api` 时强制要求 Content API URL；
`repository_dispatch` 强制要求 callback 配置。普通代码 push 仍可构建，但不会伪造 Outbox callback。

### 2.2 runtime-isr

Web：

```text
WEB_RENDER_MODE=runtime-isr
WEB_CONTENT_SOURCE=api
CONTENT_API_BASE_URL=https://<admin-host>
CONTENT_API_READ_TOKEN=<published-only token>
SITE_URL=https://lee-ng915.github.io/cBlog
BASE_PATH=
PUBLICATION_DRIVER=revalidation-webhook
REVALIDATION_ACTIVE_KEY_ID=<key id>
REVALIDATION_ACTIVE_SECRET=<secret>
```

Worker 使用同一 revalidation key，并将 `REVALIDATION_WEBHOOK_URL` 指向 Runtime Web。
首次保留现有 Pages URL 时，runtime 平台需要在切流层保持 `/cBlog` 对外路径；当前 Next runtime
内部 basePath 为空，反向代理/域名方案必须在真实切流前验证。

### 2.3 双 profile 预发布

GitHub 仓库配置 `STAGING_CONTENT_API_BASE_URL`、可选
`STAGING_CONTENT_API_READ_TOKEN` 和 `STAGING_SITE_URL` 后，手动运行
`Production Readiness (Live Content API)`。static-export 与 runtime-isr 两个 matrix job
必须同时构建成功；static artifact 仅用于审查，不部署生产。

## 3. 最终迁移与 CUT-001/002

1. 创建生产 PostgreSQL 与 S3 bucket，启用自动备份、对象版本控制和生命周期策略。
2. 执行 schema migration。
3. 冻结内容写入，运行 `content:migrate:plan`，确认 unresolved assets 为 0。
4. 使用 `MIGRATION_ASSET_STORE=s3` 执行最终 apply；迁移器会逐对象上传并回读 hash。
5. 执行 `content:migrate:verify`，必须 `ok: true`。
6. 运行 `pnpm db:backup`；将 dump 与 manifest 复制到隔离存储。
7. 在空隔离数据库运行 `pnpm db:restore:drill`；计数和 digest 必须完全相等。
8. 从对象存储版本中恢复一个测试 prefix/bucket，抽查全部或抽样对象 SHA-256（CUT-002）。
9. 执行 `pnpm content:export`，保存 Markdown 备份和 `backup-manifest.json`。

本地/staging 可用一条命令复跑上述门禁（不切流量）：

```bash
POSTGRES_TOOL_DOCKER_CONTAINER=infra-postgres-1 \
POSTGRES_TOOL_HOST=127.0.0.1 \
POSTGRES_TOOL_PORT=5432 \
DATABASE_URL=postgresql://cblog:cblog@127.0.0.1:54329/cblog \
MIGRATION_ASSET_DIR=/tmp/cblog-migration-assets \
pnpm cutover:drill
```

双 profile 预发布构建（fixture Content API，不访问生产）：

```bash
pnpm profile:build
```

## 4. 维护窗口切流

1. 部署 Admin，但先不接收写流量；验证 OAuth、Public API、对象上传和只读查询。
2. 部署所选 Web profile，并从 live Content API 完成影子构建和 parity。
3. 启动单实例 Outbox worker。
4. 在同一窗口原子切换：

```text
ADMIN_STORAGE=postgres
PUBLIC_CONTENT_API_ENABLED=true
GIT_PUBLISH_ENABLED=false
WEB_CONTENT_SOURCE=api
PUBLICATION_DRIVER=<所选 profile 对应 driver>
```

5. 验证公开首页、文章、分类、专栏、sitemap、robots、404、canonical、OG 和资产。
6. 在 Admin 执行一次新建草稿→发布、编辑再发布、下线；确认事件最终 delivered。
7. 解除内容冻结，记录切流时间、应用版本、migration run id、备份 manifest 和负责人。

## 5. 回滚触发条件与 CUT-004

立即回滚流量但保留 PostgreSQL 的条件：

- Public API 或 Admin 写接口持续 5xx；
- 页面/SEO 出现 P0 差异；
- Outbox 无法恢复且 pending 持续增长；
- 对象存储资产大面积不可访问；
- OAuth/allowlist 阻止唯一管理员登录。

### PG 单写开启前

流量切回最后成功 Pages artifact；Admin 恢复维护态。此时 v1 数据未发生分叉。

### PG 单写开启后

1. Web 可切回最后成功 Pages artifact，但 Admin 写流量仍保持冻结。
2. 回滚应用版本时继续使用 PostgreSQL，不自动恢复 filesystem 写入。
3. 如业务必须回 v1，先执行 `content:export`，由人工审查导出 diff、资产和 manifest，
   再在独立分支受控恢复；禁止数据库→Markdown 自动双写。
4. CUT-004 演练必须记录回切时间、DNS/CDN 缓存、canonical/sitemap 抽查和恢复时间。

## 6. 观察期与旧链路退役

观察至少一个完整发布周期，并至少完成发布、修改、下线各一次。期间检查：

- Outbox pending/failed、最老 pending age 与 callback；
- Content API 5xx、构建失败与 ISR 再生失败；
- PostgreSQL 自动备份和对象版本；
- sitemap/canonical、图片和公开 URL；
- Markdown 离线备份。

观察期通过后再开独立变更删除：

- Admin filesystem ContentService、Git publish API/UI 与 `simple-git`；
- Web filesystem adapter、SQLite/Markdown runtime 依赖和构建 `content:check`；
- 生产 `WEB_CONTENT_SOURCE` / `ADMIN_STORAGE` 分支。

迁移/导出工具所需的 SQLite 只读能力可在灾备策略确认前保留，不得重新成为运行时写源。
