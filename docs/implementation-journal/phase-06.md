# Phase 6：Outbox 与发布闭环

- 状态：已完成（REL/OBS/E2E 门禁通过，待提交）
- 日期：2026-08-18
- 分支：`feat/refector`
- 前置提交：`925bad6`（Phase 5）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md) §4 Phase 6；[技术设计](../deployment/01-technical-design.md) §6.4/§7.3；门禁 [测试计划](../deployment/03-test-plan.md) §13（REL P0、OBS-001/002、E2E-202/203/205）

## 1. 本章目标

- publish/update/unpublish/delete 事务内写 publication_events（业务与事件同事务，draft 不产生事件）。
- 独立 Outbox worker：SKIP LOCKED 安全 claim、指数退避、failed 终态与手动重试；三 publication driver（revalidation-webhook / github-dispatch / generic-build-hook）。
- Static driver 短时间连续事件合并部署批次；dispatch 后 awaiting_deploy，签名 callback 确认才 delivered（不误报已上线）。
- Admin 发布页（postgres 模式）：保存→同步中→已上线/失败状态流、failed 手动重试、积压告警；filesystem 模式 v1 Git 发布不变。
- 结构化日志与指标：同一 eventId 贯穿 DB/worker/webhook/web 日志（OBS-001）；pending 积压告警（OBS-002）。

## 2. 生产不变性声明

本章交付后生产仍是 v1 链路：`ADMIN_STORAGE=filesystem`、`GIT_PUBLISH_ENABLED=true`、GitHub Pages push main 发布不变；Outbox 写路径仅在 `ADMIN_STORAGE=postgres` 的 staging 生效（事件写入在 core repositories 但生产 DB 无写流量）；worker 为手动启停的独立进程，不随 admin 启动。

## 3. 关键实现决策

| 决策 | 说明 |
|---|---|
| 事件写入在 core repositories 同事务 | §6.4 规则：draft 保存无事件；draft→published=publish；published 内容/元数据修改=update；published→draft/archived=unpublish/archive；删除 published=delete；payload 与 Phase 5 planRevalidation 输入同构，webhook driver 直接转发 |
| 独立 worker 进程 | `apps/admin/scripts/outbox-worker.mjs`（生产可改 cron/独立部署）；staging 手动启停天然满足 REL-001 杀进程恢复验证 |
| claim 安全三件套 | `FOR UPDATE SKIP LOCKED` 互斥（REL-004）+ delivering 状态 + 60s claim 超时回收（REL-003 崩溃重投安全，webhook 端幂等兜底） |
| 退避与终态 | 5s/30s/2m/10m/30m 指数退避；max 8 次转 failed；Admin 手动重试复位 pending（REL-005） |
| Static 合批 | 从最老 pending 事件起等待 debounce 窗口，一次 claim 当前批次；externalId、queued deployment 与事件关联先落库再 dispatch；running deployment 不再接收迟到事件，避免旧 artifact 误报新版本上线 |
| Static 崩溃与未知结果 | queued 超 claim lease 转 timed_out 并重排事件；running 超 deploy timeout 重排。网络超时属于结果未知，保留 queued 等迟到 callback，超租后再重投；明确 HTTP 拒绝才立即走退避 |
| callback 联动同事务 | `SELECT ... FOR UPDATE` 串行化冲突 callback，first-terminal-wins；只联动 `event.deployment_id` 仍指向当前批次的 awaiting 事件，迟到旧 callback 零副作用 |
| eventId = 事件 uuid | 贯穿 worker 日志（outbox_deliver 行）、webhook X-CBlog-Event-Id、web 端 revalidate_requests_total 日志（OBS-001） |
| 发布页按模式分叉 | filesystem 保持 v1 Git 发布 UI 不动；postgres 模式为发布动态页（状态流/手动重试/积压告警），5s 轮询 |
| 下游超时与租约 | webhook/dispatch/build-hook 默认 15s 超时，预热 5s 且不阻塞 delivered；worker 启动强制 request timeout 小于 claim lease |

## 4. Review、修订、测试与提交

### 4.1 独立只读 Review

本章对完整未提交 diff 运行两路独立只读审查：一路聚焦 Outbox 状态机、并发与 callback；一路按技术方案/测试门禁核对实现和 harness。审查要求 finding 必须带实际文件行号和可证明调用路径。首轮结论为需修订，主要 finding 全部采纳：

| 优先级 | Finding | 处理 |
|---|---|---|
| P1 | static dispatch 后才落 externalId/事件关联，崩溃可留下永久 queued/awaiting | externalId、deployment、关联和 awaiting 先事务落库；queued 超租巡检恢复 |
| P1 | running deployment 继续合入迟到事件，旧 artifact callback 会误报新事件上线 | 改为 static debounce 后一次 claim；running 永不再合批，并新增 PG 集成用例 |
| P1 | 迟到旧 callback 可完成事件当前新 deployment | callback 更新增加 `deployment_id = 当前批次` 条件 |
| P1 | callback first-terminal-wins 非原子，并发冲突可翻转终态 | deployment 行 `FOR UPDATE` 串行化；终态不再回退或翻转 |
| P1/P2 | 三个 driver 无超时，lease 与请求时长不协调 | 全部请求加超时；启动校验 timeout < lease；预热改为非阻塞 best-effort |
| P2 | 失败 deployment 重试置 queued 后不会重新 dispatch | 旧 deployment 保留 failed 审计，事件清 deployment_id，worker 创建新批次 |
| P2 | 网络 timeout 被当作确定失败，迟到成功 callback 会被忽略 | static 网络错误保持 queued 等 callback/巡检；仅明确 HTTP 拒绝立即退避 |
| P2 | OBS-001/002 与 REL-003 harness 存在假阳性 | Admin 事务写事件时输出 eventId；pending age 成为真实 tick 指标；REL-003 改为退出码 86 的真实 200→落库前崩溃 |
| P2 | harness 会清理/投递共享 staging 的非 fixture 数据 | 启动前要求 outbox/deployment 空库，非空 fail-fast；清理只按测试 slug 关联行 |

修订后由原状态机审查代理复核剩余三项（并发 callback、timeout/lease、static timeout 未知结果），结论为 **No findings**。

### 4.2 验证 harness 自修订

1. Web production build 的 `generateStaticParams` 依赖 Content API，harness 改为先构建并启动 Admin，再构建 runtime Web；
2. fault webhook 增加不消耗故障次数的 `/__health`，JSON 以 UTF-8 文本原样转发，避免 Node/Undici detached ArrayBuffer；
3. fixture 起始/结尾清理改为定向事件、deployment 和文章，日志每轮清空；
4. E2E-202 按访客视角检查文章、首页、分类、sitemap；ISR/SWR 使用有界最终一致轮询，sitemap 上限 60s；
5. REL-003 使用 `WORKER_CRASH_AFTER_RESPONSE=1` 在 webhook 2xx 后、mark delivered 前真实退出，重启后验证幂等重投；
6. OBS-001 在 publications GET 前即验证 Admin 事件写日志，连同 DB、worker、Web 四段同 eventId；OBS-002 要求 pending≥6 且 oldest pending age > 0。

### 4.3 测试证据

| 验证 | 结果 |
|---|---|
| `scripts/phase6-e2e.mjs` production staging 全链 | **19/19 通过**：E2E-202/203/205、REL-001/002/003/005/006/007、OBS-001/002、STATIC-004/005/006；REL-002 为 500×3 后 attempt=4 delivered；REL-003 真实 crash=86、attempt=2 delivered |
| Core PostgreSQL 集成 | **32/32**：其中 Phase 6 publication_events 事务写入 **15/15**；既有 Phase 1/3 回归通过 |
| Admin Outbox PostgreSQL 集成 | **8/8**：SKIP LOCKED、租约回收、退避、failed/retry、static 合批、running 不误合批、queued 崩溃恢复 |
| 快速单测 | Core **43/43**；Admin **32/32**；Web **34/34** |
| 类型与构建 | Core/Admin/Web typecheck 零错误；Admin 与 runtime-isr Web production build 成功 |
| 数据恢复 | 每次破坏性 PG 集成测试后恢复 migration run `phase6-20260818`：28 posts / 5 categories / 71 tags / 2 collections / 44 items / 8 assets / 72 revisions；verify `ok: true` |
| 质量检查 | `git diff --check` 通过；编辑文件 IDE lint 零错误 |

生产不变性复核：默认 `ADMIN_STORAGE=filesystem`、`GIT_PUBLISH_ENABLED=true` 与 v1 Git 发布 UI/路径未改变；PostgreSQL Outbox 与 worker 仅显式 staging 配置启用。

对应提交：待用户确认后创建 Phase 6 章节提交。

## 5. 已知限制与 Phase 7 入口

- **Static 多 worker 不作为本章部署形态**：REL-004 已验证事件 claim 互斥；两个 static worker仍可能各 claim 不同事件并创建不同部署批次。符合本章“只验证 SKIP LOCKED、不部署多副本”的范围，若 Phase 7 选择多副本 worker，需增加数据库 batch leader/全局互斥。
- **真实外部平台未联调**：GitHub dispatch 用本地 mock 验证，generic-build-hook 仅完成驱动实现和 HTTP 契约；首次真实 token/repository/build callback 在 Phase 7 预发布完成。
- **Runtime Web 仍为单副本护栏**：共享 Cache Handler/Redis 延续 Phase 5 限制。
- **Admin requestId 未与 eventId 同字段绑定**：本章实现 eventId 在 Admin 事务写日志、DB、worker、Web 四段可检索；如进入集中 tracing，在 Phase 7 将 API requestId 作为独立关联字段/日志字段补齐。
- **ISR 最终一致延迟**：staging 中 sitemap 偶尔超过 15s 才再生，harness 采用 60s 有界轮询；事件 delivered 表示失效 webhook 已成功，不承诺所有受影响页面已同步预热完成。
- Phase 7 入口保持不变：生产 profile/PG 单写切换、旧 v1 Git 写链路退役、真实平台发布演练、备份恢复与切流 runbook。
