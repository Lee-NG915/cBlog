# Phase 7：仓库内生产就绪（不切流、不删 filesystem）

- 状态：已完成（本地 CUT 演练与双 profile 预发布通过，待提交）
- 日期：2026-08-18
- 分支：`feat/refector`
- 前置提交：`54fc8d7`（Phase 6）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md) §4 Phase 7；[切流 runbook](../deployment/07-cutover-runbook.md)；门禁 [测试计划](../deployment/03-test-plan.md) §13（全部 P0 + CUT-001/002/004）

## 1. 本章目标

- 仓库内生产就绪：S3 迁移资产回读校验、PostgreSQL 备份/恢复演练、runtime 单副本护栏、双 profile 预发布构建、切流/回滚 runbook。
- 本地 CUT-001/002/003/005 可重复演练；CUT-004 无真实流量，只记录维护窗口人工回切步骤。
- 预选生产 profile：`static-export` + `github-dispatch`，公开 URL 仍为 `https://lee-ng915.github.io/cBlog`。

## 2. 生产不变性声明

本章**不切真实流量、不改生产默认 flag、不删除 v1 filesystem**。交付后生产仍是：

- `ADMIN_STORAGE=filesystem`
- `WEB_CONTENT_SOURCE=filesystem`
- `GIT_PUBLISH_ENABLED=true`
- GitHub Pages `push main` 构建仍可读仓库 SQLite/Markdown

Admin filesystem ContentService、`apps/admin/lib/git.ts`、Web filesystem adapter、SQLite 与 `simple-git` 全部保留。观察至少一个完整发布周期后再开独立变更退役。

## 3. 关键实现决策

| 决策 | 说明 |
|---|---|
| filesystem 本章不删 | 用户确认；`02-implementation-plan` Phase 7 第 7 步改为观察期后独立变更 |
| S3 迁移 store | `MIGRATION_ASSET_STORE=s3` 时 put 后回读 SHA-256；object key 拒绝 `..`；自定义 endpoint 默认 path-style；缺省仍 filesystem |
| 备份确认 | `CBLOG_BACKUP_CONFIRM_TARGET` / `CBLOG_RESTORE_CONFIRM_TARGET` 必须精确 `host:port/database`；拒绝覆盖已有 dump、同源恢复、非空库 |
| docker 工具 | 本机无 pg client 时用 `POSTGRES_TOOL_DOCKER_CONTAINER` 在容器内调 pg_dump/psql；`PGHOST/PGPORT` 与 URL 端口解耦 |
| DROP 门禁 | `recreateEmptyDatabase` 必须带源 URL；拒绝同源、`postgres` 维护库、docker 模式下同名库，防止误删 staging `cblog` |
| runtime 单副本 | `validateRuntimeTopology`：runtime-isr 必须显式 `WEB_RUNTIME_REPLICAS=1`，拒绝多副本 |
| SITE_URL | 未配置时默认 `https://lee-ng915.github.io/cBlog` |
| 预发布 workflow | `production-readiness.yml` 仅 `workflow_dispatch`，matrix 双 profile 从 staging Content API 构建，static artifact 不部署 |
| deploy.yml | `WEB_CONTENT_SOURCE` 缺省仍 `filesystem`；`api` 时才强制 Content API；callback 仅 `repository_dispatch` |
| CUT-004 | 无真实流量；runbook §5 为维护窗口人工项 |

## 4. Review、修订、测试与提交

### 4.1 独立只读 Review

对完整未提交 diff 运行两路独立只读审查：一路聚焦备份/S3/拓扑/生产默认；一路按 CUT 门禁与「不得删除 filesystem」核对。首轮结论为需修订。

| 优先级 | Finding | 处理 |
|---|---|---|
| P1 | `cutover:drill` 在 restore 门禁前 `DROP DATABASE WITH (FORCE)`，误配 `RESTORE_DATABASE_URL` 会删源库 | 采纳。`assertSafeRestoreTarget` + `recreateEmptyDatabase(restore, source)`；docker 模式下同名库亦拒；finally 同样走门禁 |
| P2 | 双 profile 连续构建不隔离 `.next`/`out`，可能混用 cache 与静态产物 | 采纳。每次 `buildWeb` 前删除 `.next` 和 `out` |

复核（原安全审查）：**No findings**。

### 4.2 测试证据

| 验证 | 结果 |
|---|---|
| `pnpm test:cutover` | **7/7** 通过（确认值、覆盖拒绝、同源拒绝、DROP 源库/维护库/docker 同名库） |
| `pnpm cutover:drill` | CUT-001/002/003/004/005 通过：`cblog` → `cblog_restore` posts=28 revisions=72；8 资产 filesystem+MinIO hash；export posts=28 items=44 assets=8 |
| `pnpm profile:build` | WEB-206：fixture API 上 static-export 与 runtime-isr 页面路由 11 条一致；缺副本/多副本护栏生效；构建日志与产物无 `postgresql://` 等凭证 |
| filesystem 生产构建 | `WEB_CONTENT_SOURCE=filesystem` static-export **82/82** 页面生成成功（v1 路径未破坏） |
| 快速单测 | Core **50/50**；Admin **32/32**；Web **40/40** |
| 类型 | Core/Admin/Web typecheck 零错误；`git diff --check` 通过 |

CUT-002 本地口径：既有迁移对象 SHA-256 + MinIO 探针/抽样回读。不是生产对象版本恢复，也未抽查线上页面引用。CUT-004 未切流量。

生产不变性复核：`.env.example` 与 `deploy.yml` 缺省仍 filesystem；Git 发布入口与 filesystem adapter 未删除。

对应提交：待用户确认后创建 Phase 7 章节提交（默认不 push）。

## 5. 已知限制与后续入口

- **未切真实流量**：生产仍走 v1 GitHub Pages；`ADMIN_STORAGE` / `WEB_CONTENT_SOURCE` 生产默认不变。
- **未删除 filesystem**：观察期后单独退役 Admin/Web filesystem、Git publish、SQLite runtime 与 `simple-git`。
- **真实 GitHub dispatch / generic-build-hook 未用生产 token 联调**：预发布 workflow 需配置 `STAGING_CONTENT_API_*` 后手动跑。
- **Static worker 与 runtime Web 仍单副本**：多副本前需 batch leader / 共享 Cache Handler。
- **CUT-004** 只能在维护窗口对真实流量演练；本章只固化 runbook。
- 真实切流入口：按 [07-cutover-runbook](../deployment/07-cutover-runbook.md) 冻结写入 → 最终 S3 迁移 → 备份/恢复 → 影子构建 → 同一窗口切换 flag。
