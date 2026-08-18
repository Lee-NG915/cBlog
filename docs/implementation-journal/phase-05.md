# Phase 5：Web 双 profile 与 ISR

- 状态：已完成（双 profile 与 ISR 验证通过，生产默认 static-export 不变）
- 日期：2026-08-18
- 分支：`feat/refector`
- 前置提交：`a8487be`（Phase 4）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md) §4 Phase 5；[技术设计](../deployment/01-technical-design.md) §6/§7.3/§8；[profiles](../deployment/05-deployment-profiles.md) §3；门禁 [测试计划](../deployment/03-test-plan.md) §13（WEB-206、STATIC P0、ISR P0、SEO P0、PERF-201）

## 1. 本章目标

- `WEB_RENDER_MODE=static-export|runtime-isr` 决定 Next 输出：static 产出完整 `out/`（生产现状不变）；runtime 用 `next build && next start`，fetch 带 cache tags 与 `next.revalidate=86400` 兜底 TTL。
- `/api/revalidate` webhook：HMAC 验签、schema 校验、重放保护、领域事件经集中式 `planRevalidation(event)` 映射白名单 tags/paths，不接受任意 path/tag。
- Static 发布链接收端：deploy.yml 增加 `repository_dispatch` 入口与签名部署 callback；admin `/api/v1/internal/deployments/callback` 验签幂等接收；脚本化 dispatch 触发器验证链路。
- `WEB_RENDER_MODE × PUBLICATION_DRIVER` 组合校验，无效组合立即失败。
- 统一 route param 编解码：中文 slug 的 dev 编码 hack 收窄到 `export + dev` 才生效。

## 2. 生产不变性声明

本章交付后生产默认值不变：`WEB_RENDER_MODE=static-export`、`WEB_CONTENT_SOURCE=filesystem`、`PUBLICATION_DRIVER=github-dispatch`，GitHub Pages 发布链路保持 v1 语义（push main 触发）；`repository_dispatch` 只是新增触发入口，不改变既有发布行为。runtime-isr 仅在显式配置的 staging/验证环境启用。

## 3. 关键实现决策

| 决策 | 说明 |
|---|---|
| 实证前提钉死边界 | 实施前对 Next 14.2.33 源码实证：export + POST-only route handler 构建成功静默跳过（不得加 `force-dynamic`）；export 下 fetch 传 `next:{revalidate,tags}` 无害；并发首访内置去重；runtime 下完整 generateStaticParams 全量 SSG + dynamicParams 默认 true |
| runtime-isr 绕过模块级 memo | `next start` 长驻进程中 Phase 4 的 requestMemo 是永不过期的进程级缓存，会短路 revalidateTag/TTL；runtime 依赖 Next Data Cache + React 请求记忆化（generateMetadata/Page 去重天然满足），static-export 一次性构建进程保留 memo |
| tags 集中由 adapter 打标 | fetch 无条件携带 `next:{revalidate:86400,tags}`（export 下忽略）；tags 映射按技术设计 §8.1：`post:<slug>`/`post-index`/`sitemap`/`categories`/`collections`/`collection:<slug>`/`collection-item:<c>:<s>` |
| planRevalidation 集中失效范围 | 页面与 Admin 不拼装失效目标；webhook 只接受领域事件，白名单映射按 §8.3 表；slug 保守校验防路径注入 |
| 中文 slug hack 收窄不删除 | 其存在条件 = export + dev + 非 ASCII slug（base-server.js 的检查只在 export 分支）；runtime-isr 下统一返回原始值 |
| runtime-isr 不继承 BASE_PATH | 自托管根路径；static-export 维持 `BASE_PATH=/cBlog`（GitHub Pages 子路径） |
| 门禁偏差（STATIC-002/004/005/006 部分） | Outbox 自动触发 dispatch、事件合并批次、deployment 状态机属 Phase 6；本章交付接收端 + `scripts/dispatch-content-published.mjs` 脚本化触发验证链路（同 API-009 先例，§13 门禁行回写） |
| 单副本护栏 | ISR-011 按单实例验证；共享 Cache Handler/多副本在引入前以文档化副本数约束代替 |

## 4. Review、修订、测试与提交

### 4.1 Kimi Code K3 首轮 Review

K3 对完整未提交 diff 做只读静态审查（按防幻觉约束：每个 finding 必须给文件:行号证据与验证方式，测试证据由主实现方提供），结论为**需修订后提交**，1 个 P2 + 3 个 P3。全部采纳：

| 优先级 | Finding | 处理 |
|---|---|---|
| P2 | post 事件缺 `categories` tag：分类计数在发布/下线/移动后最长 24h 旧值（违反 §8.3 与 ISR-004）——plan 的 moved 分支追加的 `category:<slug>` 标实际是空操作 | 采纳。post 事件 tags 无条件加 `categories`（事件 schema 无 operation 区分）；isr-check 补 ISR-004 断言（分类页"共 N 篇手记" + 分类索引徽标计数）钉住 |
| P3 | `category:<slug>` tag 无对应打标点（adapter 无按分类的数据端点），头注释"逐字一致"不实 | 采纳。plan 与注释删除该 tag，分类页失效经 paths + `post-index` 覆盖 |
| P3 | callback 幂等比较不含 detail | 不修。完全重放时 detail 必相同，实际不可触发，记录 |
| P3 | 并发双写同 batchId 撞唯一索引 → 500，靠调用方重试收敛 | 采纳。insert 捕 23505 返回 200 idempotent |

### 4.2 集成验证发现的自修订

staging 实测（isr-check 首轮 15/19、次轮 18/21）发现并已修复：

1. `plan.ts` 的 SLUG_RE 只允许小写，存量 camelCase 专栏 slug（`rightCapital`）的 collection/collection_item 事件被 400 拒绝——放宽大小写（安全目标是拒 `/`、`..`、空白）；
2. Next 14 对刚失效条目按 SWR 处理（首访 stale、次访 fresh，`.next/server` meta 标签实证）——harness 断言统一改 getFresh 双请求；ISR-014 的 TTL 场景同理；
3. ISR-009 语义钉死：被 revalidateTag 失效的条目无 stale 可服务（渲染抛错 → 500，恢复即再生）；只有"TTL 过期未失效"的条目走 SWR 保留旧页——harness 改为先预热再断 API 的真实 SWR 场景；
4. PERF-201 在 TTL=5s 的 harness 里须先预热吸收重取、窗口内复访断言零请求；
5. SSR 文本表达式间的 `<!-- -->` 注释节点导致"共 6 篇手记"字面断言失败——改正则；
6. ISR-010 并发详情请求 1~2 次属平台预期（Batcher 去重口径），断言从 ==1 放宽为 ≤2。

### 4.3 测试证据

| 验证 | 结果 |
|---|---|
| `scripts/isr-check.mjs`（runtime-isr 全链） | **22/22 通过**：ISR-001/002/003a-c/004/005/006/007/009/010/014/015 + 验签负例×5 + PERF-201（热请求零 API 调用） |
| WEB-206 | static-export 与 runtime-isr 双 production build 均成功；Route 表 13 条路由与枚举路径逐行一致；配置无 DB 凭证 |
| STATIC-001 | 仅配 `CONTENT_API_BASE_URL`（+可选 token）即可从 fixture API 构建全部 published 路由（Phase 4 链路重跑确认） |
| STATIC-007 | `BASE_PATH=/cBlog` 构建：canonical/内部链接/`/_next` 资产/sitemap loc 全部带前缀（5/5 断言） |
| STATIC-008 | `static-export + revalidation-webhook` 与 `runtime-isr + github-dispatch` 启动即 throw（明确文案）；非法 WEB_RENDER_MODE throw |
| callback 端到端（staging admin） | 无签名/错签名/超时间窗 → 401；正确签名 → 200 插入；同 batch 重放 → 200 idempotent 不重复插入；变更 status → 原位更新；contract-check postgres 25/25 回归 |
| SEO-201 | sitemap 无 draft（fixture 结构性保证 + WEB-204 断言链）；下线后 sitemap 无入口（ISR-003c） |
| SEO-202 | canonical/OG/JSON-LD 与域名+basePath 一致（STATIC-007 断言 + parity images/contentHash 覆盖） |
| 全量回归 | static-export parity **76/76**（78 URL/28 sitemap/指纹/contentHash/images）；web 单测 34/34；admin 单测 21/21；core 43/43；三包 typecheck 零错误；`git diff --check` 通过 |

staging 环境：fixture server（FIXTURE_DIR 可变副本）+ `next start`（runtime-isr，`CONTENT_API_REVALIDATE_TTL=5` 加速 TTL 断言）；admin staging 链路与 Phase 3/4 相同。

对应提交：包含本文件的 Phase 5 章节提交。

## 5. 已知限制与 Phase 6 入口

- **revalidateTag 后 API 故障期返回 500**（Next 14 渲染抛错无 stale 兜底），恢复即再生、缓存不投毒；86400 TTL/SWR 路径才是"保留最后成功页面"的承载（ISR-009 按此验证）。如需强保障可在 Phase 6 worker 侧重试事件而非依赖访客触发再生。
- **事件 schema 无 operation 字段**：post 事件一律失效 `categories`（计数可能变化），无需 operation 区分；parse 丢弃发送方的 operation 字段，Phase 6 Outbox 写事件时如需区分 publish/update/unpublish 应在 payload 层扩展并同步本章 plan。
- **设计文档 §8.1/§8.3 的 `category:<slug>` 标已废弃**：adapter 无按分类的数据端点（分类页经 post-index 派生），该标无打标点属空操作，本章 plan 未实现；Phase 6 Outbox worker 对齐事件→失效映射时以 `plan.ts` 实际分支为准，不要按技术设计的旧 tag 表实现。
- **幂等记录为进程内 Map（24h TTL）**：单实例前提（ISR-011 按单实例验证）；多副本部署前必须升级共享存储（与共享 Cache Handler 同期）。
- **ISR-005 断言偏弱**：draft 修改不产生公开事件的保证在 Phase 6 Outbox 写入侧（保存草稿只创建 revision），本章只验证"无事件时页面不变"。
- **deploy.yml 的 dispatch/callback 链路未经真实 GitHub 触发**（无真实 token/repo）：本地以 `send-deploy-callback.mjs` 端到端验证了签名接收端；首次真实 dispatch 验证随 Phase 6 Outbox worker 联调。
- **Phase 6 入口**：Outbox worker（publication_events 写入、事件合并批次、指数退避重试、REL-001~007）、自动 dispatch/revalidation 投递取代脚本触发器、webhook 后 best-effort 页面预热、多副本共享 Cache Handler 评估。
