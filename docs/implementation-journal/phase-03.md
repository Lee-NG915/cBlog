# Phase 3：Admin 鉴权、Content API 三分区与 PostgreSQL 写路径（staging）

- 状态：已完成（staging 验证通过，生产 flag 默认值不变）
- 日期：2026-08-17
- 分支：`feat/refector`
- 前置提交：`757926d`（Phase 2）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md) §4 Phase 3

## 1. 本章目标

- Auth.js（next-auth v5）GitHub OAuth 单用户登录，allowlist 校验不可变 GitHub user ID；本地/CI 契约测试使用显式测试身份 provider（`AUTH_TEST_MODE=1`，禁止真实部署启用）。
- API 三分区：`/api/v1/public/**`（published-only 只读，flag 门控 + 可选只读 token）、`/api/v1/admin/**`（会话 + Origin + 限流三重守卫）、`/api/v1/internal/**`（Phase 6 部署 callback 预留，中间件已覆盖）。
- 存储缝合层 `ContentService`：filesystem（v1 生产行为不变）与 postgres（乐观并发 expectedVersion、对象存储上传、级联删除）双实现，按 `ADMIN_STORAGE` 选择。
- 公开 DTO 契约入 core（`@cblog/core` 纯类型导出），Web Phase 4 直接复用；公开查询层 SQL 硬编码 `status='published'`。
- 上传走 S3 兼容对象存储：magic bytes 判型（拒绝 SVG）、大小上限、内容寻址 object key、sha256 去重。
- 发布页在非 filesystem 模式或 `GIT_PUBLISH_ENABLED=false` 时显式停用（`GIT_PUBLISH_DISABLED`），为 Phase 6 Outbox 链路让位。

## 2. 生产不变性声明

本章只交付代码与 staging 验证：生产 `ADMIN_STORAGE=filesystem`、`PUBLIC_CONTENT_API_ENABLED=false`、`GIT_PUBLISH_ENABLED=true`，v1 文件链路与 GitHub Pages 发布不变；PostgreSQL 写路径仅在显式配置的 staging 环境启用，无双写。

## 3. 关键实现决策

| 决策 | 说明 |
|---|---|
| 中间件全站默认拒绝 | 仅 `/api/auth/**`、`/login`、`/api/v1/public/**` 匿名可达；API 未登录 401，页面 302 /login（AUTH-001） |
| allowlist 双重校验 | signIn callback 拒绝非 allowlist ID；requireAdminSession 再校验 session.githubId，防陈旧 token（AUTH-002/003） |
| 写守卫三件套 | requireMutationContext = 会话 + Origin/Host 比对（AUTH-004）+ 内存令牌桶限流（SEC-008 最小实现） |
| 公开 404 不可区分 | draft/archived/不存在同构 404 envelope（API-002）；flag 关闭时整个分区 404 |
| 只读 token | `CONTENT_API_READ_TOKEN` 设置时要求 Bearer，常量时间比较（API-005） |
| expectedVersion 强制 | postgres 模式 save/status 缺 expectedVersion 直接 400；409 返回 `VERSION_CONFLICT` 稳定错误码（API-007） |
| 封面双源保护 | 提交值与暴露值比对后才改写 coverAssetId/coverExternalUrl，上传返回的对象 URL 自动回链 asset |
| PG 删除语义 | staging 采用级联硬删（revision/标签联动）；Phase 6 引入 delete 发布事件后再收敛为对外语义 |
| updatedAt 语义分叉 | postgres 模式 updatedAt 为审计字段不可 UI 覆写（v1 frontmatter 的手工 updatedAt 语义仅保留在 filesystem 模式） |
| drizzle 子查询修正 | drizzle 在关联子查询中剥离列限定符导致自比较恒 false；四处计数子查询改为显式限定表名的原生 SQL，并由集成测试钉住 |

## 4. Review、修订、测试与提交

### 4.1 Kimi Code K3 首轮 Review

K3 对完整未提交 diff 做只读静态审查（测试证据由主实现方提供），结论为**需修订后提交**，2 个 P1 + 3 个 P2 + 6 个 P3。P1/P2 全部采纳：

| 优先级 | Finding | 分析与处理 |
|---|---|---|
| P1 | filesystem 模式上传丢失 v1 扩展名白名单（`.html`/`.js` 可落盘并随 Git 发布，存储型 XSS 通道），违反本章生产不变性声明 | 采纳。`filesystem.ts` 恢复 v1 白名单（`.png/.jpg/.jpeg/.gif/.webp/.svg/.avif`，含 svg 与 v1 完全一致） |
| P1 | `handleV1` 兜底分支 400 + 原样外抛 `error.message`，PG 驱动错误（约束名/主机信息）可泄入响应，违反 API-010 | 采纳。Error 基类实例（本库业务校验错误均为字面量 message）保持 400 原样返回；其余子类/驱动错误统一 500 固定文案 `INTERNAL_ERROR` |
| P2 | 专栏详情页行内状态切换未携带 expectedVersion，postgres 模式必 400 | 采纳。`CollectionItem` 补 `version` 字段，提交时携带，成功后重新加载刷新版本 |
| P2 | GET 读路径仅依赖 middleware 的 JWT 校验，allowlist 轮换后陈旧 token 仍可读 draft 内容，与"requireAdminSession 再校验"声明不符 | 采纳。middleware 统一加 allowlist 复核（覆盖页面 + 全部 GET/写 API 一道防线；写路径另有 requireAdminSession 二次校验），配置缺失 fail-closed |
| P2 | `AUTH_TEST_MODE` 无代码级生产防呆（GitHub user ID 是公开信息，误带入部署即可秒级登录） | 采纳。auth.ts 启动期硬防呆：`AUTH_TEST_MODE=1` 与 `AUTH_GITHUB_ID/SECRET` 共存直接拒绝启动（真实部署必然配置 GitHub 凭据；契约矩阵不设，不受影响） |
| P3 | `lib/api-server.ts` 旧 `handleApi` 封装残留无调用方 | 采纳，删除 |
| P3 | `assertAdminEnvConsistency` 注释称"请求路径调用"实际从未被调用 | 采纳，接入 `contentService()` 工厂首请求触发 |
| P3 | read token 校验失败在限流扣减前返回，Bearer 爆破不受 429 约束 | 采纳，限流调整为先于 token 校验扣减 |
| P3 | 公开分区 404/401/429 错误响应未带 no-store | 采纳，`errorResponse` 统一 `Cache-Control: private, no-store` |
| P3 | api-guards（Origin 比对/常量时间比较/限流）安全关键逻辑无单测 | 采纳，新增 `api-guards.test.ts` 9 例 |
| P3 | public-reader 全表加载内存过滤、`asset://UUID` 大写 lookup miss | 不采纳（当前规模可接受），记入 §5 演进项 |

### 4.2 集成验证发现的自修订

staging 实测发现 1 个生产构建才暴露的缺陷，已修复并由契约矩阵钉住：

- `handleV1` 用 `error.constructor.name` 识别领域错误，Next.js 生产构建压缩类名后匹配失败，版本冲突返回 500 而非 409（API-007 首轮契约 24/25 唯一失败项）。改为读取实例 `error.name`（`VersionConflictError`/`ContentNotFoundError` 均显式赋值，不受压缩影响），单测同步模拟显式 name 语义。修复后契约矩阵 25/25。

### 4.3 修订后 K3 复核

K3 复核全部修订项（白名单恢复、错误分类、middleware allowlist 复核、auth 防呆、expectedVersion 补传、P3 落实），结论为**可提交**，确认无重定向循环、不影响正常 GitHub 登录路径。复核提出 4 个 nits，3 个已在提交前修复并补单测：

1. `InvalidContentStatusTransitionError`（非法状态流转）原落入 500 → handleV1 按 name 映射 400 `INVALID_STATUS_TRANSITION`；
2. 畸形 JSON body 的 `SyntaxError` 原落入 500 → handleV1 显式映射 400 `BAD_REQUEST`；
3. 登录页 `callbackUrl` 未限同源构成 open redirect gadget → 仅放行 `/` 开头且非 `//` 的值；
4. middleware 302 的 callbackUrl 丢 query 为既有行为，不阻塞，留作后续体验优化。

### 4.4 测试证据

| 验证 | 结果 |
|---|---|
| `pnpm --filter @cblog/admin test`（单测） | 3 文件 19/19 通过（env 4 + object-storage 4 + api-guards 11） |
| `pnpm --filter @cblog/admin typecheck` | 零错误 |
| `pnpm --filter @cblog/admin build`（生产构建） | 通过，Middleware 77.9 kB |
| `pnpm test`（core 默认套件） | 7 文件 43/43 通过，27 个集成用例按设计 skip |
| `TEST_DATABASE_URL=... pnpm test:postgres` | 2 文件 17/17 通过（Phase 1 回归 7 + Phase 3 public-reader/admin-repos 10，tmpfs PostgreSQL 16） |
| `content:migrate:apply --run-id contract-20260817-r3` + `verify` | verify `ok: true`（28 posts / 5 分类 / 2 专栏 / 44 文档 / 8 资产 / 72 revisions，零 unresolved） |
| `contract-check.mjs --mode postgres --read-token … --with-upload` | **25/25 通过**：AUTH-001~004、SEC-004b/005/006、API-001/002/003/005/007/008、乐观锁版本递增、draft/publish/unpublish 公开侧可见性流转、上传返回对象存储 URL |
| 上传对象回读 | MinIO `http://127.0.0.1:19000/cblog/assets/<sha256>.png` 返回 200 image/png |
| `contract-check.mjs --mode filesystem`（v1 默认 flag） | **10/10 通过**：鉴权负例 + FS 列表 28 篇 + Git 发布状态可读 + public flag 关闭 404；`content/`、`data/` 工作区零污染 |
| `NODE_ENV=production pnpm run build`（web v1 链路回归） | 通过，静态页面正常生成 |
| `git diff --check` | 通过 |

staging 环境：PostgreSQL 16（`infra/docker-compose.postgres.yml`，127.0.0.1:54329，tmpfs）+ MinIO（临时 `docker run`，127.0.0.1:19000，bucket `cblog` 匿名只读下载）；admin 以 production build + `next start -p 3101` 运行，`AUTH_TEST_MODE=1` 仅用于契约测试身份。

操作记录（复现时注意）：`test:postgres` 会 drop `public`+`drizzle` schema 并留有测试夹具，之后重建迁移数据须先 `drop schema public cascade; drop schema drizzle cascade;`（只 drop public 会让 drizzle 迁移日志误判已应用，apply 报 `content_migration_runs does not exist`），再重新 apply/verify。

对应提交：包含本文件的 Phase 3 章节提交。

## 5. 已知限制与 Phase 4 入口

- **API-009/API-012 事件语义归 Phase 6**：本章按设计不写 `publication_events`（Outbox 属 Phase 6），03-test-plan §13 Phase 3 门禁已同步修订注明；PG 删除语义的级联硬删同样待 Phase 6 引入 delete 发布事件后收敛。
- **AUTH_TEST_MODE 残余风险**：硬防呆只覆盖"与 GitHub 凭据共存"路径；若真实部署既无 GitHub 凭据又误设 `AUTH_TEST_MODE=1` 仍可被测试身份登录。staging/CI 以外的 profile 落地时（05-deployment-profiles）应在部署模板层彻底隔离该变量。
- **MinIO 未文档化**：staging MinIO 为手工 `docker run`（127.0.0.1:19000，默认凭据），bucket `cblog` 需 `mc mb` + 匿名 download；`.env.example` 的 `OBJECT_STORAGE_ENDPOINT` 示例端口（9000）与本机实际映射（19000）不一致，正式 staging 编排（docker-compose 或部署模板）时统一。
- **迁移资产字节未入对象存储**：DB 中资产 `public_url` 已指向 MinIO 前缀，但字节仍在 `MIGRATION_ASSET_DIR` 本地目录（Phase 2 filesystem store 替身）；契约矩阵 `--with-upload` 只验证新上传链路，存量资产的字节搬迁随正式迁移执行。
- **public-reader 演进项**：assets/post_tags 全表加载内存过滤、`asset://` 引用大小写敏感，当前内容规模可接受，内容量增长后再优化。
- **Phase 4 入口**：公开 DTO 契约已在 `@cblog/core`（`src/api/`）就绪，Web 侧按 `WEB_CONTENT_SOURCE` flag 接入 API adapter 做影子静态构建；`/api/v1/internal/**` 分区中间件已覆盖，handler 留待 Phase 6 部署 callback。
