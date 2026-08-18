# 内容迁移与 Markdown 备份 Runbook

本手册用于 Phase 2 staging/隔离验证，并在 Phase 7 内容冻结后复用。Phase 2 不切换生产 Web/Admin 数据源，也不启用双写。

## 1. 环境和安全边界

1. 先对目标 PostgreSQL 创建独立数据库或隔离 schema，禁止直接使用未经备份的生产库。若目标是已运行过 Phase 1 迁移且含数据的临时库，建议 drop 后重建：`0001` 迁移新增的唯一索引（assets.sha256、posts/collection_items 的 legacy_source_path）在脏数据上就地升级会直接失败。
2. `DATABASE_URL` 指向目标库。
3. `CBLOG_MIGRATION_CONFIRM_TARGET` 必须严格填写为 `hostname:port/database`。例如本地测试库为 `127.0.0.1:54329/cblog`。
4. `MIGRATION_ASSET_STORE=filesystem|s3`：本地/staging 可用 filesystem；Phase 7 冻结迁移必须用 `s3`。filesystem 模式的 `MIGRATION_ASSET_DIR` 使用 Git worktree 外绝对路径。
5. `MIGRATION_ASSET_PUBLIC_BASE_URL` 是资产公开绝对 URL 前缀，不得填 Web 仓库相对路径。
6. 迁移时源 `data/blog.db` 和 `content/` 只读；命令不会回写 frontmatter。
7. Phase 1 的 `editorial_date` 升级显式按 UTC 转换；生产数据库和 worker 仍统一配置 UTC，避免后续审计时间歧义。

## 2. 执行顺序

```bash
pnpm content:migrate:plan

DATABASE_URL=postgresql://... \
CBLOG_MIGRATION_CONFIRM_TARGET=host:port/database \
MIGRATION_ASSET_DIR=/absolute/path/to/migration-assets \
MIGRATION_ASSET_PUBLIC_BASE_URL=https://assets.example.com \
MIGRATION_ASSET_STORE=s3 \
OBJECT_STORAGE_REGION=... \
OBJECT_STORAGE_BUCKET=... \
OBJECT_STORAGE_ACCESS_KEY=... \
OBJECT_STORAGE_SECRET_KEY=... \
OBJECT_STORAGE_PUBLIC_BASE_URL=https://assets.example.com \
pnpm content:migrate:apply -- --run-id cutover-YYYYMMDD-HHMM

DATABASE_URL=postgresql://... \
MIGRATION_ASSET_PUBLIC_BASE_URL=https://assets.example.com \
pnpm content:migrate:verify
```

S3 compatible 自托管平台再配置 `OBJECT_STORAGE_ENDPOINT` 和 `OBJECT_STORAGE_FORCE_PATH_STYLE=true`。迁移器会先校验源 hash，使用内容 hash object key 幂等上传，再从 S3 回读并校验 SHA-256；`MIGRATION_ASSET_PUBLIC_BASE_URL` 必须与 `OBJECT_STORAGE_PUBLIC_BASE_URL` 一致。

门禁：plan 中 `unresolvedAssets` 必须为空；apply 和 verify 的 source digest 必须来自相同配置；verify 必须返回 `ok: true`；全部对象回读 hash 必须通过。任何差异都禁止进入切流。

## 3. 幂等与失败恢复

- 网络或进程在数据库提交前失败：以同一 run id 重试。对象 key 由内容 hash 决定，可安全覆盖/复核；数据库事务不会留下半条 revision。
- 提交完成但终端未收到结果：仍以同一 run id 重试。命令返回保存的报告，并重新检查/补齐本地对象。
- 同一 run id 对应的源内容或资产配置变化：命令拒绝复用。重新执行 plan，人工确认差异后使用新 run id。
- verify 报告 hash/字段差异：不要手工改目标库掩盖问题；修复映射或源数据后，在隔离库重新迁移。

## 4. Markdown 离线备份

输出目录必须为空，防止覆盖已有备份：

```bash
DATABASE_URL=postgresql://... \
MIGRATION_ASSET_DIR=/absolute/path/to/migration-assets \
MIGRATION_ASSET_STORE=filesystem \
pnpm content:export -- --output /absolute/path/to/empty-backup-directory
```

生产冻结后若资产只在对象存储，改用 `MIGRATION_ASSET_STORE=s3`，并保证
`MIGRATION_ASSET_PUBLIC_BASE_URL` 与 `OBJECT_STORAGE_PUBLIC_BASE_URL` 一致。

导出结果包括：

- `posts/` 与 `collections/` Markdown；
- 每篇文档同级 `assets/`，文件名带 hash 前缀；
- `backup-manifest.json`，记录文档 hash、对象 hash、分类与专栏定义和数量。

导出不会修改运行数据库。恢复演练必须在隔离目录重新解析 Markdown、核对 manifest hash；它是灾备与人工回滚输入，不得重新成为线上同步写源。

注意：`createdAt` 与 `publishedAt` 审计字段不写入 frontmatter（保持与既有内容格式一致），由 `backup-manifest.json` 的 files 条目承载；灾备重建数据库时需从 manifest 回填这两个字段。

## 5. Phase 7 切换前附加门禁

- 内容写入冻结后执行原生备份：
  `DATABASE_URL=... CBLOG_BACKUP_CONFIRM_TARGET=host:port/database pnpm db:backup -- --output /absolute/path/cutover.dump`。
- 在预先创建的空隔离数据库执行：
  `RESTORE_DATABASE_URL=... CBLOG_RESTORE_CONFIRM_TARGET=host:port/database pnpm db:restore:drill -- --backup /absolute/path/cutover.dump`。
  restore drill 会验证 dump SHA-256，并比较 posts/items/assets/revisions/publication_events 的计数与内容摘要；目标非空或与源相同会直接拒绝。
- 本机未安装 PostgreSQL client 时，本地演练可显式设置
  `POSTGRES_TOOL_DOCKER_CONTAINER=<postgres-container>`、`POSTGRES_TOOL_HOST=127.0.0.1`、
  `POSTGRES_TOOL_PORT=5432`，让脚本在该容器内调用 `pg_dump/pg_restore/psql`；
  生产备份应使用平台提供且与服务端主版本兼容的 PostgreSQL client。
- 使用 `MIGRATION_ASSET_STORE=s3` 将全部资产直接写入生产对象存储并校验 SHA-256。
- 执行新旧公开 URL、sitemap、canonical、H1、正文 hash 的影子构建对比。
- 保留迁移前 Git tag、数据库备份、对象版本和本次 migration run report。
