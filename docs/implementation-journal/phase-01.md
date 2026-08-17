# Phase 1：领域模型与 PostgreSQL 仓储

- 状态：已完成
- 日期：2026-08-17
- 分支：`feat/refector`
- 前置提交：`498b6a7`（Phase 0）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md)

## 1. 本章目标

- 将通用内容状态、状态机和领域错误从 SQLite schema 中抽离。
- 新增 PostgreSQL 16 Drizzle schema、迁移配置和异步连接层。
- 新增不依赖文件系统的 Post/CollectionItem repository contract 与 PostgreSQL 实现。
- 用条件更新实现 optimistic concurrency，确保实体更新与 revision 写入处于同一事务。
- published-only 查询在 repository 层固定过滤 draft/archived。
- 保持现有 SQLite/Markdown Web/Admin 路径不变，不提前切换生产数据源。

## 2. 测试数据库约束

- 使用 `infra/docker-compose.postgres.yml` 启动只监听 `127.0.0.1:54329` 的 PostgreSQL 16。
- 测试数据目录使用容器 tmpfs，不挂载或删除宿主机目录。
- 集成测试只接受显式 `TEST_DATABASE_URL`；默认 `pnpm test` 不连接外部数据库。
- 测试清理前校验 host、port 和 database，拒绝对非本地测试地址执行 schema reset。

## 3. Review、修订、测试与提交

### 3.1 实现内容

- 新增 PostgreSQL 16 的 11 张表、7 个 enum、外键、唯一约束、revision owner check、发布查询与 Outbox 索引。
- 新增独立的 `@cblog/core/postgres` 子路径，隔离 `postgres` runtime，避免当前静态 Web bundle 引入服务端连接代码。
- 新增 Post 与 CollectionItem 的异步 repository contract、事务实现、内容 hash、reading time、revision snapshot 和 published-only 查询。
- 使用 `UPDATE ... WHERE id = ? AND version = ?` 实现原子乐观锁；实体、标签和 revision 在同一事务提交。
- 新增 PostgreSQL migration CLI、Drizzle 配置、Docker Compose 测试环境和 opt-in 集成测试。

### 3.2 Kimi Code K3 首轮 Review

K3 对完整未提交 diff 做只读 Review，并独立执行 core typecheck、默认测试、PostgreSQL 集成测试和 Web production build。结论为无 P0/P1、可以提交，同时提出以下改进：

| Finding | 分析与处理 |
|---|---|
| `editorial_date DESC` 在 PostgreSQL 默认 `NULLS FIRST` | 采纳。查询改为 `DESC NULLS LAST`，增加有日期/无日期排序断言 |
| 不同提交顺序的共享 tag upsert 存在理论死锁 | 采纳。tag 行按全局字典序加锁，再按用户原始顺序批量写 `post_tags.position` |
| 发布查询缺少组合索引 | 采纳。增加 posts `(status, editorial_date, created_at)` 与 collection items `(collection_id, status, sort_order)` 索引并重生成初始迁移 |
| 旧版本冲突测试是顺序执行，不是真实并发 | 采纳。新增两个事务以相同 expectedVersion 并发更新的集成测试，断言恰好一成一败 |
| `listPublished` 对 tag 存在 N+1 查询 | 当前数据量和 Phase 1 范围可接受；在 Phase 4 接入公开 API 前改为批量读取 |
| enum 后续加值受 Drizzle 事务迁移限制 | 记录为迁移约束；新增 enum 值时使用经 staging 验证的显式迁移，不盲用自动生成 SQL |
| migration CLI 无生产环境守卫 | Phase 1 仅提供底层能力；Phase 2 在真实导入/迁移命令中加入环境确认和 dry-run |
| integration test 未接入 CI | 当前由本地显式容器门禁执行；在部署 workflow 落地时增加 PostgreSQL service container |
| `create()` 可直接导入 archived 状态 | 保留给 Phase 2 一次性迁移；正常 Admin 写路径仍必须通过 `changeStatus` 状态机 |

### 3.3 修订后 K3 复核

K3 再次只读检查四项修订、生成迁移和并发测试，确认无正确性、类型、事务或迁移问题，最终无 P0/P1。复核补充指出普通 ASC 索引不能完全覆盖 `DESC NULLS LAST` 的排序；博客规模下由数据库过滤后排序可接受，若性能数据证明需要，再使用显式表达式索引。

### 3.4 测试证据

| 验证 | 结果 |
|---|---|
| `pnpm --filter @cblog/core typecheck` | 通过 |
| `pnpm --filter @cblog/admin typecheck` | 通过，证明根导出未污染现有 Admin 类型边界 |
| `pnpm test` | 默认测试 33/33 通过；6 个 PostgreSQL 集成用例按设计 skip，不隐式连接数据库 |
| `TEST_DATABASE_URL=... pnpm test:postgres` | PostgreSQL 16 tmpfs 容器中 6/6 通过；覆盖迁移幂等、版本冲突、真实并发、事务回滚、公开过滤和专栏 revision |
| `npm run build` | 内容漂移检查通过；Next.js 14 production build 成功，生成 81 个静态页面 |
| `git diff --check` | 通过 |

测试容器只监听 `127.0.0.1:54329`，测试结束后已执行 compose down；未创建持久 volume。

对应提交：包含本文件的 Phase 1 章节提交。

## 4. 已知限制与 Phase 2 入口

- `PostgresPostRepository.listPublished()` 当前逐文章读取 tag；Phase 4 API 影子接入前应批量加载，避免 N+1。
- 自动 enum 演进、生产 migration guard、CI PostgreSQL service container 属于后续部署门禁，不在 Phase 1 提前绑定生产环境。
- migration 目录按源码布局解析；后端打包形态在 Phase 3 确定后需要加入产物级迁移测试。
- Phase 2 只实现可重复、可审计、支持 dry-run 的 Markdown/SQLite → PostgreSQL 导入与备份恢复演练，Web/Admin 仍不切换数据源。
