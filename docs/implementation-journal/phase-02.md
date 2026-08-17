# Phase 2：一次性迁移、校验与 Markdown 备份

- 状态：已完成
- 日期：2026-08-17
- 分支：`feat/refector`
- 前置提交：`080e3c8`（Phase 1）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md)
- 操作手册：[迁移与备份 Runbook](../deployment/06-migration-runbook.md)

## 1. 本章目标

- 以只读方式扫描当前 SQLite 元数据和 Markdown 正文，生成稳定 source digest 与完整报告。
- 将分类、文章、标签顺序、专栏、文档顺序、状态、正文和资源写入 PostgreSQL。
- 用 Markdown AST 识别本地图片，将正文引用改为 `asset://<uuid>`；远程 URL 原样保留并单独报告。
- 通过 migration run id 保证同一批次可安全重放，不重复实体、revision 或资产。
- verify 精确比较数量、slug、状态、关系、顺序、正文 hash、资产 hash 和日期语义。
- 从 PostgreSQL 导出独立 Markdown 备份，把 `asset://` 还原为 `./assets/` 并验证对象 hash。
- 保持现有 Web/Admin 继续读取 SQLite/Markdown，迁移工具不接入生产发布链路。

## 2. 实现约束

- `plan` 和源数据扫描使用 readonly SQLite connection，禁止创建或改写源库。
- `apply` 必须提供 run id，并要求 `CBLOG_MIGRATION_CONFIRM_TARGET` 与目标 host/port/database 完全一致。
- 本地资产先写 content-addressed object key 并复核 SHA-256；数据库事务失败时最多留下可复用孤儿对象，不留下半条内容/revision。
- `content_migration_runs` 只在整个事务完成时写入；同 run id + 同 digest 返回既有报告并重新校验对象，同 run id + 不同 digest 拒绝。
- 旧 `date` 实际包含完整 ISO timestamp，因此 PostgreSQL `editorial_date` 使用 `timestamptz`，避免截断时分秒和同日排序语义。
- published 内容以旧 `date` 的完整时间初始化 `published_at`；缺失时保持 NULL 并进入报告，不使用迁移执行时间伪造历史。
- Phase 2 的 filesystem asset store 是 S3 接口的本地替身；Phase 3 接入 S3 compatible adapter 后不改变迁移领域逻辑。
- 本地对象目录默认被 Git 忽略；正式操作必须显式使用 worktree 外绝对路径，避免把备份二进制误提交到仓库。

## 3. 当前数据扫描基线

| 数据 | 数量 |
|---|---:|
| categories | 5 |
| posts | 28 |
| tags | 71 |
| collections | 2 |
| collection items | 44 |
| 本地去重资产 | 8 |
| 未解析本地资产 | 0 |
| 保留的远程资源 | 1 个远程封面 |

当前只读 plan 的 source digest 为动态扫描结果，不写死为迁移凭据；正式执行时以同一次 plan/apply 输出为准。

## 4. Review、修订、测试与提交

### 4.1 Kimi Code K3 首轮 Review

K3 对完整未提交 diff 做只读静态审查（按约定测试证据由主实现方提供），结论为**需修订后提交**，2 个 P1 阻塞 + 6 个 P2。全部采纳：

| 优先级 | Finding | 分析与处理 |
|---|---|---|
| P1 | verify 的 contentHash 比对是 snapshot 存值 vs DB 存值（同源写入，循环论证），DB 正文被改而 hash 字段未动时不可检出，DATA-003 代码层承诺未闭环 | 采纳。verify 对 post/collection_item 的 `actual.contentMarkdown` 与 revision 正文分别重算 SHA-256，新增 `contentMarkdownSha256`、`revisionContentSha256` 比对字段 |
| P1 | 「事务失败不留半条内容/revision」核心声明无测试证据 | 采纳。新增事务中途失败注入用例（ghost collection），断言 8 张表全量回滚为零 |
| P2 | linkReference 的 definition 命中本地资产时既不改写也不报告，本地 URL 静默残留破坏 DATA-003 不变量 | 采纳。收集 linkReferenceIds，命中即进 unresolved（fail-closed，阻断 apply）；补 image/link 共用 definition 用例 |
| P2 | `FileSystemMigrationAssetStore.put` 只做词法 inside 检查，symlink 可在 put 时逃逸（防护低于 scan 层与既有 `resolveDocumentAssetPath`） | 采纳。put 增加 realpathSync 复核，拒绝真实路径越界 |
| P2 | 0001 唯一索引对已有数据的 Phase 1 库就地升级会失败，runbook 未覆盖 | 采纳。runbook §1 增补脏库 drop 重建建议 |
| P2 | 测试缺口：slug 冲突分支、只读库写入拒绝、DATA-009 导出不改库、默认端口/assetId 纯函数 | 采纳。全部补齐（见 4.3 用例数变化） |
| P2 | 备份 frontmatter 不含 createdAt/publishedAt，灾备还原不可恢复 | 采纳。manifest files 条目新增 entityType/slug/createdAt/publishedAt 审计字段，runbook §4 说明回填方式 |
| P2 | tags 冲突分支 `onConflictDoUpdate` 触碰既有行，违背「重放无副作用」直觉 | 采纳。改为 `onConflictDoNothing` + 二次 select 兜底 |

### 4.2 修订后 K3 复核

K3 复核所有修订并在本机复跑测试（默认套件、test:migration、test:postgres、core typecheck，结果与主实现方一致），结论为**可提交**，全部 P1/P2 正确闭环，无新引入问题。复核提出 3 个 P3 nits 并已在提交前一并修复：

1. symlink 单测实际被 scan 层提前拒绝，未直接执行 store.put 的 realpath 分支 → 改为手工构造 asset 绕过 scan 直测 put 的纵深防御分支；
2. 回滚用例缺 tags/post_tags 断言 → 补齐（断言 8 张表全零）；
3. assets.ts 中「既不改写」注释与 image/link 共用 definition 的实际行为不符 → 修正注释（共用场景仍改写，但 unresolved 阻断 apply，不会残留）。

### 4.3 测试证据

| 验证 | 结果 |
|---|---|
| `pnpm test`（默认套件，无外部依赖） | 7 文件 43/43 通过，17 个集成用例按设计 skip |
| `TEST_DATABASE_URL=... pnpm test:migration` | 10/10 通过（tmpfs PostgreSQL 16）：plan 只读扫描与 AST 改写、事务中途失败全量回滚、apply/verify/重放幂等、slug 冲突拒绝、digest 冲突拒绝、unresolved 阻断、错误公开 URL 检出、备份还原与审计字段、hash 字段篡改检出、正文篡改重算检出 |
| `TEST_DATABASE_URL=... pnpm test:postgres` | 7/7 通过（Phase 1 回归） |
| `pnpm --filter @cblog/core typecheck` / `@cblog/admin typecheck` | 通过 |
| `NODE_ENV=production pnpm run build` | 内容漂移检查通过；81 个静态页面生成成功（生产 v1 行为不变） |
| `git diff --check` | 通过 |
| 只读源库守卫 | readonly SQLite 写入被拒（集成用例断言 SQLITE_READONLY） |

测试容器仅监听 `127.0.0.1:54329`，数据目录 tmpfs，测试后 down。

对应提交：包含本文件的 Phase 2 章节提交。

## 5. 已知限制与 Phase 3 入口

- Phase 2 的 `FileSystemMigrationAssetStore` 是 S3 接口本地替身；Phase 3 接入 S3 compatible adapter 后迁移领域逻辑不变。
- `MIGRATION_ASSET_PUBLIC_BASE_URL` 当前指向本地占位；正式迁移前必须替换为真实对象存储/CDN 公开前缀并重新执行 plan/apply/verify。
- 备份导出的 createdAt/publishedAt 依赖 manifest 回填，frontmatter 保持既有字段集不变。
- Phase 3 只交付代码与 staging 验证：Auth.js GitHub OAuth、API 三分区、PostgreSQL 写 adapter 均在 feature flag 后，生产 `ADMIN_STORAGE` 保持 `filesystem`，GitHub Pages 发布链路不变。
