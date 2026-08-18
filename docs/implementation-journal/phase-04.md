# Phase 4：Web API adapter 的影子静态构建

- 状态：已完成（影子等价验证通过，生产链路不变）
- 日期：2026-08-17
- 分支：`feat/refector`
- 前置提交：`a1cbaa6`（Phase 3）
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md) §4 Phase 4；门禁 [测试计划](../deployment/03-test-plan.md) §13（WEB-201~205、MIG P0）

## 1. 本章目标

- Web 页面通过统一异步接口访问内容，构建期 `WEB_CONTENT_SOURCE=filesystem|api`（默认 filesystem）选择实现；filesystem 路径行为与 v1 完全一致。
- 新增 typed Content API adapter：从公开 API 拉取 published 内容，DTO 契约复用 `@cblog/core`（Phase 3）。
- 影子构建保留 `output: "export"`，输出独立 artifact，不接管生产流量；生产仍由 v1 GitHub Pages 构建发布。
- 等价验证：URL、title、H1、站内链接、sitemap（含 lastmod）、正文 hash（归一化）、图片引用与 filesystem 产物一致（MIG-201/202）。
- WEB-202：api 模式构建不加载 `better-sqlite3`、不读取 `content/**/*.md`；WEB-203：API 故障构建非零退出。

## 2. 生产不变性声明

本章只交付代码与影子验证：`WEB_CONTENT_SOURCE` 默认 `filesystem`，`deploy.yml` 生产链路不变；影子构建走独立 workflow（`shadow-build.yml`）与独立 artifact，不部署、不覆盖 GitHub Pages；PostgreSQL 不做反向覆盖。

## 3. 关键实现决策

| 决策 | 说明 |
|---|---|
| 排序/语义差异 adapter 端复刻 | 文章 `compareByDateDesc`、专栏文档 `compareNotesByOrder`、分类 uncategorized 特例 + count desc、`badge \|\| name` 兜底——全部在 web adapter 客户端重排，零 admin 业务逻辑改动 |
| **updatedAt 语义修正（迁移存 NULL）** | Phase 2 迁移原把缺失 updatedAt 填为 createdAt/editorialDate（7 篇全部填成导入时刻），adapter 任何 clamp 规则都无法同时兼容 14 篇真实值（含 4 篇 updatedAt<=date 的脏数据）与 7 篇虚构值。拍板：迁移改存 NULL（`source.ts`），审计轨迹由 content_revisions 承担；posts.updated_at 放宽可空（drizzle 0002），repositories create 置 NULL（首次保存才写入），DTO 改 nullable。修正跨越 Phase 2/3 已验证代码，全部回归重跑（见 §4.3） |
| 列表 updatedAt 经 /sitemap join 补齐 | summary DTO 无 updatedAt；listPosts 并行拉取 /posts + /sitemap（同一份 memo），按 slug 补齐排序键与"更新于"展示，无 N+1 |
| 时间格式归一 | PG 序列化（`2026-05-19 09:11:00+00`）→ adapter `toIso()` 归一 ISO 8601，meta 标签/JSON-LD/sitemap 逐字节对齐 filesystem |
| 模块图隔离（WEB-202） | 两道防线：①`lib/content/index.ts` 条件 require，api 模式不求值 filesystem 模块；②`next.config.js` 在 api 模式用 NormalModuleReplacementPlugin 把 `./filesystem` 替换为抛错 stub——bundle 完全不含 filesystem 模块图（webpack 静态分析会跟随条件 require 打包两个分支，仅靠 ① bundle 仍有引用，编译期即需 better-sqlite3 可解析） |
| 正文渲染差异归一 | api 模式正文 `asset://` 已被服务端解析为绝对 URL：不传 assetBase、不做 WebP manifest 替换；parity 正文 hash 剔除 img/og:image/twitter:image/JSON-LD image 后比对，图片引用（含 meta 与 JSON-LD）归一文件名后按序比对 |
| parity 构建噪声归一 | 实测同一代码两次 `next build` 产物即不等：head meta/link 顺序、RSC payload chunk 切分点与 buildId、/_next/static chunk 引用集合均漂移。contentHash 前统一归一：head 子元素排序、剔除 RSC payload（静态导出下是可见 HTML 的冗余数据）、剔除 /_next/static 引用、图片 URL 归一 IMGREF；同代码重复构建 76/76 自检通过 |
| sitemap lastmod 维度 | parity sitemap 对比增加 lastmod（日粒度）：静态路由 lastmod 是构建时刻，取全部条目的众数日构建日为噪声基线，仅历史日期（数据驱动）参与比对；负例（篡改一天）可检出 |
| CI 用 hermetic fixture server | fixture 从 staging 真实公开 API 录制并提交（67 个 JSON）；CI 不起 PG/MinIO/admin；天然支持 WEB-203（杀 server 断言构建失败）与 WEB-204（fixture 只含 published） |
| 影子构建绕开根 build | 根 `build` 的 `content:check` 依赖 SQLite；影子命令直接 `pnpm --filter @cblog/web build`，`sync-content-assets` prebuild 在 api 模式跳过 |
| 构建期 memo | adapter 模块级 Map 缓存端点 Promise，generateMetadata 与 Page 同源读取不重复请求（WEB-205 实测每个详情端点恰好 1 次） |
| fetch 保持默认 force-cache | 静态导出下 `cache:"no-store"` 会把页面打成 dynamic 而无法导出（实测 81 页路由被标记 ƒ、out/ 缺失）。Next Data Cache 跨构建复用响应：CI 干净检出无缓存；本地重跑影子构建/验证 WEB-203 前必须 `rm -rf apps/web/.next/cache/fetch-cache` |

## 4. Review、修订、测试与提交

### 4.1 Kimi Code K3 首轮 Review

K3 对完整未提交 diff 做只读静态审查（测试证据由主实现方提供），结论为**需小修后提交**，无 P1，2 个 P2 + 8 个 P3。全部采纳：

| 优先级 | Finding | 处理 |
|---|---|---|
| P2 | parity sitemap 只比 `<loc>` 不比 `<lastmod>`，/sitemap join 补 updatedAt 这一最冒险逻辑的主要落点无覆盖 | 采纳。sitemap 对比增加 lastmod 日粒度维度（众数构建日归一），负例可检出 |
| P2 | contentHash 整块剔除 RSC payload，首页 InfinitePostList 全量摘要仅存于 payload，残余缺口同 summary 级 updatedAt | 采纳。随上一条一并闭环（lastmod 维度）；payload 剔除的掩盖面记入 §5 |
| P3 | `getPostStats` 的 total/draft 语义与 filesystem 分叉（filesystem total 含 dev 预览 draft） | 采纳。当前页面不消费 total/draft，api.ts 注释标注限制 |
| P3 | Next Data Cache 本地 footgun：换 fixture 后不清 fetch-cache 会得到陈旧产物 | 采纳。写入本节操作手册（§4.3 末）与 workflow 注释 |
| P3 | 本文件 §3 的 updatedAt 行描述的是旧 clamp 方案 | 采纳。§3 已重写为 NULL 方案 |
| P3 | 0002 只放宽约束，不修正既有 staging 数据 | 采纳。操作前提记录：staging 必须 drop schema 重迁移后再录制 fixture（§4.3 末） |
| P3 | coverUrl 为站内相对路径时 adapter 不补 BASE_PATH（staging 无此数据，潜伏） | 记入 §5 已知限制 |
| P3 | collections/categories 顺序依赖 PG tie-break（createdAt）vs sqlite（id），同 sortOrder 同秒创建时不稳定 | 记入 §5（sortOrder 当前唯一，adapter 对 notes 已重排） |
| P3 | fixture server token 比较非常量时间 | 不修。loopback CI 工具 + 测试 token，风险为零，记录 |
| P3 | shadow workflow 无 WEB-204 显式断言 | 采纳。workflow 增加 draft slug grep 断言步骤 |

### 4.2 修订后 K3 复核

K3 复核全部修订项并独立验证（lastmod 众数归一的平局决胜路径、compare 退化路径、WEB-204 清单与 staging 地面真值 7/7 一致），结论为**可提交**。3 个 nits 处理：

1. sitemap.txt 增加 `# buildday` 注释行（compare 跳过，透明化归一基线）——已采纳；§5 补记"lastmod 等于构建日的文章落入噪声桶，跨午夜构建可能假阳性"；
2. WEB-204 slug 清单改为从 `content/posts` 动态派生（消除 draft→published 漂移的维护成本）——已采纳，本地重放通过；
3. WEB-204 增加 `out/**/*.html` 全文 grep——**试做后放弃**：已发布正文存在指向 draft 的站内链接（v1 等价内容的一部分），5/7 draft slug 误报，维持路由+sitemap 断言并在 workflow 注释说明。

### 4.3 测试证据

| 验证 | 结果 |
|---|---|
| **影子等价（MIG-201/202）** | filesystem vs api：**78 URL / 28 sitemap（含 lastmod）/ 指纹 / contentHash 76/76 / images 76/76 全一致**；同代码两次构建 76/76（工具噪声自检）；lastmod 负例（篡改一天）可检出 |
| WEB-201 | api 模式 production build 成功，81 路由全静态（○/●），21 post 详情 + 44 item 详情全部预生成 |
| WEB-202 | api 构建 `.next/server` grep `better_sqlite3\|better-sqlite3\|readPostContent` **零命中**（stub 隔离后 bundle 无 filesystem 模块图）；唯一 `content/posts` 命中为页面静态文案 |
| WEB-203 | 杀 fixture server + 清 fetch cache → `pnpm --filter @cblog/web build` **exit 1** |
| WEB-204 | 7 个 draft slug（ecommerce-knowledge-map 等）路由与 sitemap 均无 |
| WEB-205 | 73 请求：21 post 详情 + 44 item 详情**各恰好 1 次**，0 重复 |
| Phase 3 回归 | 契约矩阵 postgres **25/25**、filesystem **10/10**（updatedAt 修正后重跑）；工作区零污染 |
| Phase 2 回归 | `test:migration` 10/10、`test:postgres` 17/17、迁移重放（run-id contract-20260817-r5）verify `ok: true`（posts.updated_at：8 NULL / 20 非空，与 frontmatter 地面真值一致） |
| 单测/静态检查 | core 默认套件 43/43；core/admin/web typecheck 零错误；admin 单测 19/19；`git diff --check` 通过 |
| 基线重建 | 旧基线（76 页）因内容漂移（2 篇 draft→published）过期，已用当前 filesystem 产物重建 78 页基线（对照实验证明差异 100% 来自内容漂移：旧代码+当前内容 vs 新代码+当前内容 78/78 一致） |

**操作手册（重放注意）**：

1. staging 重迁移：`docker exec infra-postgres-1 psql -U cblog -d cblog -c "drop schema public cascade; drop schema drizzle cascade; create schema public;"` 后重新 `content:migrate:apply/verify`（只 drop public 会让 drizzle 日志误判已应用）；
2. fixture 录制：staging admin 起 `next start -p 3101`（env 同 Phase 3）→ `CONTENT_API_BASE_URL=http://127.0.0.1:3101 CONTENT_API_READ_TOKEN=test-read-token node scripts/record-content-fixtures.mjs`；
3. 本地影子构建/WEB-203 前：`rm -rf apps/web/.next/cache/fetch-cache`（否则 Next Data Cache 复用陈旧响应，WEB-203 假阴性）；
4. staging 库若由未修正的 0002 前迁移建立，其 updated_at 虚构值必须重迁移清除，否则录制的 fixture 会让 parity 假失败。

对应提交：包含本文件的 Phase 4 章节提交。

## 5. 已知限制与 Phase 5 入口

- **RSC payload 不参与 contentHash**：payload 是可见 HTML 的冗余数据，但其 chunk 切分/buildId 不可归一故剔除；summary 级数据（title/slug/date/excerpt/updatedAt）经文章页 meta、sitemap loc/lastmod、列表页可见条目另有覆盖，残余掩盖面（如 payload 独有的 client props 字段）接受。
- **coverUrl 站内相对路径不补 BASE_PATH**：api 侧透传 DTO coverUrl；staging 数据无相对路径封面，若未来出现需在 adapter 补 processImagePath 等价逻辑（parity images 维度归一会掩盖该差异，不可依赖其检出）。
- **stats.total/draft 语义分叉**：api 模式 total=published、draft=0（公开 API 无 draft 数据源）；filesystem total 含 dev 预览 draft。当前页面不消费。
- **collections/categories 同 sortOrder tie-break**：PG（createdAt）vs sqlite（id），当前 sortOrder 唯一无差异。
- **sitemap lastmod 日粒度**：同日内的 updatedAt 变化不可区分；lastmod 恰好等于构建日的文章会落入噪声桶（仅记 loc），跨午夜双构建可能假阳性（概率极低，重跑即消）；静态路由 lastmod（构建时刻）不参与比对属刻意设计。
- **fixture 时效性**：fixture 是 staging 录制快照，内容演进后需重录（操作手册 §4.3）；CI 影子构建对 admin 真实 API 的端到端覆盖依赖本地/周期性深校验。
- **Phase 5 入口**：WEB-206 双 profile（static-export / runtime-isr）构建、ISR 与 SEO/PERF 用例；api adapter 已是 async 接口，runtime profile 可复用同一 client（fetch 缓存策略需按 ISR revalidate 重新设计，不再 force-cache）。
