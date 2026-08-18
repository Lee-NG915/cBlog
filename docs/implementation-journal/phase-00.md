# Phase 0：决策冻结与安全基线

- 状态：已完成
- 日期：2026-08-17
- 分支：`feat/refector`
- 关联计划：[部署态 v2 开发方案](../deployment/02-implementation-plan.md)

## 1. 决策冻结

在没有绑定云厂商的前提下，实施采用以下可移植基线：

| 项目 | Phase 0 决策 |
|---|---|
| Web Runtime | 同一代码支持 `static-export` 与 `runtime-isr`；静态托管触发完整构建，Runtime 才使用按路由 ISR |
| 数据库 | PostgreSQL 16，Drizzle ORM；本地通过 Docker Compose 验证 |
| 对象存储 | S3 兼容接口；本地使用 MinIO，生产供应商由环境变量替换 |
| Admin 登录 | GitHub OAuth 2.0（Auth.js），固定不可变 GitHub user ID allowlist；本地测试使用显式测试身份适配器 |
| 域名/basePath | 代码同时支持空 basePath 与 `/cBlog`；最终域名切换前再冻结实际值 |
| Outbox | 独立 worker 进程，和 Admin 共用代码镜像及 PostgreSQL |
| 前后端部署 | 可不同域、不同服务器和供应商；Web 只通过 published-only API、绝对资产 URL 和 publication driver 连接后端 |
| 生产迁移 | Phase 3/4 只做 staging/影子验证；Phase 7 单次切换，禁止同步双写 |

## 2. 本章范围

- 修复 `/api/assets` 可读取 content 下任意文件的问题。
- 只允许读取文档同级 `assets/` 内的图片，并防止 symlink 逃逸。
- 为文章和专栏编辑器增加站内 Link 离开确认，而不只依赖 `beforeunload`。
- 当前无鉴权 Admin 的 dev server 只绑定 `127.0.0.1`。
- 新增环境变量模板和实施日志骨架。
- 将 GitHub Pages/静态托管与 Node ISR 建模为可配置的双部署 profile，避免后续更换前端托管平台时重写内容层。

## 3. Review、测试与提交

### 3.1 Kimi Code K3 Review

K3 对本章未提交 diff 做了只读 Review，并实际运行了路径测试。结论为暂不可提交，主要 finding：

| 优先级 | Finding | 决策 |
|---|---|---|
| P0 | realpath 与未展开路径直接判等，在 macOS `/var → /private/var` 下误拒合法资产，正向测试失败 | 采纳。改为以 real content root 计算期望真实路径，仍拒绝文档目录、assets 目录和文件 symlink 逃逸 |
| P1 | Auth.js 环境变量缺 `AUTH_SECRET`，自托管还应声明 `AUTH_TRUST_HOST` | 采纳并同步 env 模板和开发方案 |
| P1 | 浏览器前进/后退不受 Link click guard 控制 | 不实现不稳定的 history workaround；在 hook 和本日志明确记录 App Router 限制，Phase 3 E2E 保留风险验证 |
| P2 | 中文错误文案驱动 HTTP status | 采纳。新增 `DocumentAssetError.code` |
| P2 | 同页 hash 锚点也会弹离开确认 | 采纳。pathname + search 相同时直接放行 |
| P2 | 同源 SVG 直接打开存在脚本风险 | 采纳。资产响应增加 sandbox CSP，Phase 3 上传层继续做 SVG 拒绝/净化 |
| P2 | `exists/stat/realpath/read` 存在 TOCTOU | 当前仅本地单用户且 Phase 3 将替换为对象存储，记录风险，不引入复杂 fd API |

### 3.2 独立部署补充 Review

在新增“后端独立部署，Web 可选 GitHub Pages 或 Node Runtime”要求后，再次调用 K3 做最终 diff Review。第二轮无 P0，提出四项 P1，全部采纳：

| K3 finding | 分析与处理 |
|---|---|
| Route segment config 不能用环境变量在 Static/Runtime 间切换 | 采纳。不显式导出 `dynamicParams`；Runtime 使用默认值，Static 使用完整 `generateStaticParams`；TTL 下沉到 Runtime content fetch adapter，并要求双 production build |
| Static dispatch 与部署完成是两个阶段，原 Outbox 状态不足 | 采纳。增加 `awaiting_deploy`、deployment 表和 event 关联；只有 callback/受信状态查询成功才写 delivered |
| Phase 0 要求 AUTH P0，但 Auth.js 在 Phase 3 | 采纳。Phase 0 门禁改为本地安全/交互基线和 loopback 隔离，AUTH P0 明确保留在 Phase 3 |
| HMAC active secret 命名不一致 | 采纳。统一 `REVALIDATION_ACTIVE_SECRET`/`REVALIDATION_PREVIOUS_SECRET` |

第二轮 P2 中，callback URL、generic build hook Bearer 契约、意外资产错误 500、`AUTH_TRUST_HOST` 默认值和测试编号均已修订。Admin 生产暴露风险纳入以下已知限制。

K3 复核后指出 Phase 0 门禁仍误含 Phase 3 的 SEC-005，以及 E2E-206 尚无仓库级 Playwright harness。采纳：SEC-005 归回 Phase 3；Phase 0 保留本次真实浏览器人工证据，自动化在 Phase 3 接入。

### 3.3 已知限制

- Next.js App Router 当前没有稳定的客户端导航取消 API；本章覆盖刷新、关闭和所有 `<Link>` 点击，但不宣称覆盖浏览器历史前进/后退。
- 当前资产预览仍是本地文件 API；Phase 3 对象存储上线后将删除该读取路径。
- Phase 3 鉴权完成前，Admin 只能以开发模式绑定 loopback，禁止运行在公网或可被局域网访问的地址。

### 3.4 测试与提交

| 验证 | 结果 |
|---|---|
| Kimi Code K3 首轮代码 Review | 发现 realpath、Auth.js env、错误类型、hash link、SVG 响应等问题；采纳项修订完成 |
| Kimi Code K3 独立部署补充 Review + 复核 | 双 profile、Outbox 部署状态、Phase 0 门禁和 env 契约已闭环；最终无遗留 P0/P1 |
| `pnpm test` | 5 个测试文件、31/31 通过；其中路径安全 8/8 |
| `pnpm --filter @cblog/core typecheck` | 通过 |
| `pnpm --filter @cblog/admin typecheck` | 通过 |
| `npm run build` | 内容漂移检查通过；Next.js 14 production build 成功，生成 81 个静态页面 |
| `git diff --check` | 通过 |
| Admin loopback | `next dev` 的 Local/Network 均为 `127.0.0.1:3001` |
| E2E-206 人工浏览器验证 | 编辑标题后点击返回出现 confirm；取消后 URL/编辑内容保留；确认后返回 `/posts` |
| 资产路径穿越回归 | 旧式 `../../../../../collections/...md` 请求返回 400 `非法资产路径`，未返回正文 |

对应提交：包含本文件的 Phase 0 章节提交。

## 4. 下一阶段入口

Phase 1 只新增 PostgreSQL/domain/repository 能力，现有 Web/Admin 继续使用 SQLite/Markdown；不得提前切换生产写路径。Phase 1 开始时创建独立日志并先冻结测试数据库策略。
