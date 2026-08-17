# cBlog 部署态 v2 测试方案与用例

- 版本：v0.2（2026-08-17）
- 关联文档：[技术方案](./01-technical-design.md) · [开发方案](./02-implementation-plan.md)
- 优先级：P0 阻塞阶段退出/上线；P1 应自动化；P2 手动或长期验证

## 1. 测试目标

验证以下核心承诺：

1. PostgreSQL 是完整、唯一且可恢复的内容源。
2. Web 初次构建生成静态页面，普通访问不直接查询数据库。
3. Admin 发布后只失效受影响的数据与路由，新内容可按需生成。
4. 发布通知丢失、重复、乱序和下游故障不会造成永久不一致。
5. 草稿、归档、修订、管理接口和本地文件不会暴露到公网。
6. URL、SEO、Markdown、Mermaid 和图片行为与迁移前兼容。

## 2. 测试层次与工具

| 层 | 建议工具 | 范围 |
|---|---|---|
| 单元 | Vitest | 状态机、DTO、事件 schema、HMAC、失效计划、重试算法 |
| 数据库集成 | Vitest + 临时 PostgreSQL | migration、repository、transaction、outbox claim |
| API 合约 | Vitest/HTTP client + OpenAPI 校验 | public/admin/internal API |
| Web 集成 | production `next build && next start` | SSG、Data Cache、Full Route Cache、ISR、404 |
| E2E | Playwright | 登录、编辑、发布、前台可见、失败恢复 |
| 安全 | 自动化负例 + 依赖扫描 | 鉴权、越权、路径、签名、draft 泄漏、上传 |
| 迁移对比 | Node snapshot 脚本 | URL、sitemap、正文 hash、元数据、资源 |
| 运维演练 | 脚本 + 手动 runbook | 备份恢复、回滚、worker 堆积、多实例缓存 |

ISR 行为不能以 `next dev` 作为证据。测试必须启动独立的 production build，使用可清理的临时数据库、对象存储 bucket/prefix 和固定测试时钟。

## 3. 测试环境与 fixture

最小 fixture：

- 分类 `technical`、`notes` 和空分类；
- published/draft/archived 文章各一篇；
- 一篇中文 slug、一篇超长 Markdown、一篇含 Mermaid/代码块/相对图片；
- 一个 noindex 专栏及 published/draft 文档；
- 两个内容版本和一次 category move；
- 可注入失败的 Outbox transport；
- 两个 Web 实例用于共享缓存验证。

测试资源必须使用独立 schema 或数据库名、独立对象存储 prefix 和随机 eventId。测试结束只删除明确的 fixture 资源。

建议新增命令：

```text
pnpm test:unit
pnpm test:integration
pnpm test:contract
pnpm test:isr
pnpm test:e2e
pnpm test:migration
pnpm test:security
```

## 4. 数据与迁移用例（DATA/MIG）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| DATA-001 | P0 | 在空 PostgreSQL 执行全部 migration 两次 | 首次成功；第二次无破坏且 schema 一致 |
| DATA-002 | P0 | 迁移全部 posts/items 后比较记录数、slug、状态分布 | 新旧完全一致 |
| DATA-003 | P0 | 比较每篇源 Markdown、revision 的 `sourceContentHash` 审计值与 `content_markdown` | 源 hash 精确保留；除 AST 定位的本地资产 URL 改写为 `asset://` 外，其余正文逐字节一致 |
| DATA-004 | P0 | 比较标签顺序、分类关系、专栏 sortOrder | 关系与顺序完全一致 |
| DATA-005 | P0 | 对同一 migration run id 重试 apply | 无重复实体、revision、asset 或 event |
| DATA-006 | P0 | 人为制造一篇 hash 不一致后 verify | 命令非零退出并准确报告 slug/字段 |
| DATA-007 | P1 | 两客户端以相同 expectedVersion 保存 | 一个成功；另一个 `409 VERSION_CONFLICT`，内容不被覆盖 |
| DATA-008 | P0 | 注入实体更新后、revision/outbox 前的 DB 错误 | 整个事务回滚，无半条 revision/event |
| DATA-009 | P0 | DB 导出 Markdown 后重新解析，并检查导出资产目录 | 元数据和正文一致；`asset://` 被还原为相对路径；资产 hash 一致；导出不修改运行库 |
| DATA-010 | P0 | 比较旧 date、editorial_date、published_at 和页面排序 | editorial_date 保持旧展示语义；published_at 符合已声明迁移规则 |
| MIG-201 | P0 | 新旧数据源分别构建，比较公开 URL 与 sitemap | 零丢失；新增差异必须在 allowlist |
| MIG-202 | P0 | 比较每页 title、canonical、H1、站内链接和正文 hash | 除明确的渲染规范修复外一致 |
| MIG-203 | P0 | 在 Node runtime 分别验证中文 post/collection slug 的构建期预生成与构建后首次访问 | 无双重编码；两套路由、canonical 和站内链接一致 |

## 5. API 合约用例（API）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| API-001 | P0 | 匿名读取 published post | 200，只含公开 DTO 字段和 contentVersion |
| API-002 | P0 | 匿名读取 draft/archived/不存在 slug | 三者均返回不可区分的 404 |
| API-003 | P0 | public list 传入 status=draft 等绕过参数 | 参数被拒绝或忽略，结果仍只有 published |
| API-004 | P0 | published post 的 summary/detail/category/site 数据交叉比对 | slug、标题、版本和关系一致 |
| API-005 | P0 | public API 使用只读 build token | token 只能读取 published DTO；不能调用 admin/internal API |
| API-006 | P0 | 未登录调用任一 admin 写接口 | 401/403，数据库和对象存储零变化 |
| API-007 | P0 | 登录用户提交错误 expectedVersion | 409 稳定错误码，返回当前版本，不覆盖 |
| API-008 | P0 | 保存 draft | 新 revision 产生；无 publication_event |
| API-009 | P0 | 发布、修改 published、下线 | 每次业务事务恰好产生一个正确领域事件 |
| API-010 | P1 | Content API 注入 DB 超时 | 返回 5xx + requestId，不泄露 SQL/凭证/正文 |
| API-011 | P1 | OpenAPI/共享 DTO 与实际响应做 schema 校验 | 无额外敏感字段，兼容性检查通过 |
| API-012 | P0 | 修改 category/collection/tag 元数据 | 产生正确 entityType、version 和 payload，不接受任意 path/tag |

## 6. 静态生成与 ISR 用例（WEB/ISR）

### 6.1 初次构建

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| WEB-201 | P0 | 对 fixture API 执行 production build | 所有已有 published 路由被预生成 |
| WEB-202 | P0 | 检查构建输出/运行日志 | Web 不加载 `better-sqlite3`，不读取 `content/**/*.md` |
| WEB-203 | P0 | 构建时让 Content API 失败 | build 非零退出；上一已部署版本不受影响 |
| WEB-204 | P0 | fixture 中含 draft/archived | 页面、列表、sitemap 均不存在这些内容 |
| WEB-205 | P1 | 同一页面 generateMetadata + Page 获取文章 | 单次渲染使用同一 contentVersion，避免重复远端读取 |
| WEB-206 | P0 | 分别以 `static-export` 和 `runtime-isr` production build | 两种产物均成功，路由集合一致，配置中无数据库凭证 |

### 6.2 Static export 与独立后端

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| STATIC-001 | P0 | GitHub Actions 环境只配置 Content API URL/read token 后 build | 可从独立后端生成全部 published 路由；不需要数据库网络权限 |
| STATIC-002 | P0 | 发布新文章并由 Outbox 发送 repository dispatch | workflow 被触发；完整 artifact 部署后文章可见 |
| STATIC-003 | P0 | 构建期间 Content API 500 | workflow 失败，线上上一 Pages artifact 不变 |
| STATIC-004 | P0 | 连续发布多个内容事件 | 事件可合并为部署批次；最终 artifact 包含所有最高版本内容 |
| STATIC-005 | P0 | dispatch API 返回 204，但部署随后失败 | Admin 显示“已触发/部署失败”，不能误报已上线 |
| STATIC-006 | P0 | 重复发送成功/失败 callback | 幂等更新同一 deployment，不重复完成事件 |
| STATIC-007 | P0 | `BASE_PATH=/cBlog` 构建并部署 | 页面、RSC/JS/CSS、图片、canonical、sitemap 和内部链接均带正确前缀/绝对 URL |
| STATIC-008 | P0 | 将 `static-export` 与 `revalidation-webhook` 组合启动 | 配置校验失败并给出明确错误 |
| STATIC-009 | P1 | 静态访客浏览页面并监控请求 | 正常浏览不请求 Content API，不依赖 Admin 在线 |

### 6.3 On-demand ISR

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| ISR-001 | P0 | build 后修改 published 正文，投递 update 事件，再访问详情 | 详情最终显示新正文；不执行全量 build |
| ISR-002 | P0 | build 后发布全新 slug，投递事件并首次访问 | 动态路由生成并缓存；第二次访问命中缓存 |
| ISR-003 | P0 | published → draft/archived，投递事件后访问旧 URL | 旧缓存被替换，返回 404；列表和 sitemap 无入口 |
| ISR-004 | P0 | 将文章从 notes 移到 technical | 文章页、首页、旧分类、新分类、分类计数、about 和 sitemap 最终一致 |
| ISR-005 | P0 | 只修改草稿并等待超过正常发布时延 | 公开页面和 cache tag 均不变化 |
| ISR-006 | P0 | 修改专栏文档 | 文档页与专栏落地页更新，普通文章缓存不失效 |
| ISR-007 | P0 | 连续两次投递相同 eventId | 都可安全响应；只记录一次业务处理结果，无错误循环 |
| ISR-008 | P1 | 先投递 version 12 再投递迟到的 version 11 | 页面保持 version 12；旧事件被忽略或只做无害失效 |
| ISR-009 | P0 | ISR 拉取新数据时 API 500 | 保留最后成功页面；恢复后再次生成成功 |
| ISR-010 | P1 | 20 个并发请求首次访问新 slug | 无错误风暴；生成次数和 API 请求数在平台预期范围内 |
| ISR-011 | P0 | 按目标拓扑验证：多副本时两个实例交替访问并执行一次失效；单实例方案检查部署副本数护栏 | 多副本最终内容一致；或单副本配置不能意外扩为不共享缓存的多副本 |
| ISR-012 | P1 | 失效后不访问目标页 | 不发生全站同步重建；首次访问时才生成 |
| ISR-013 | P1 | 预热请求失败但失效成功 | 事件保留可诊断状态；自然访问仍可完成生成 |
| ISR-014 | P0 | 阻断 publication event 投递，更新公开数据并等待页面级 TTL 后访问 | 无 webhook 也能在 TTL 后懒更新；不会同步全站重建 |
| ISR-015 | P0 | 将已下线且缓存为 404 的同一 slug 重新发布 | revalidation 后从 404 恢复为 200，正文为最新版本 |
| ISR-016 | P0 | 修改分类或专栏导航元数据 | 根布局及所有依赖导航的页面按访问懒更新，无长期混合版本 |

测试不能只断言 webhook 返回 200；必须从访客视角读取页面和 sitemap，并验证未关联页面没有发生不必要的同步重建。

## 7. 发布可靠性用例（REL）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| REL-001 | P0 | 发布事务提交后立即终止 Admin 进程 | event 保留 pending；worker 恢复后投递成功 |
| REL-002 | P0 | Web webhook 连续返回 500 三次后恢复 | 指数退避重试，最终 delivered，attempt_count 正确 |
| REL-003 | P0 | worker 在收到 200 后、mark delivered 前崩溃 | 重启后重复投递安全，最终 delivered |
| REL-004 | P1 | 两 worker 同时 claim 同一批事件 | 每个事件同一时刻只被一个 worker 持有 |
| REL-005 | P1 | 达到最大重试次数 | 标记 failed，Admin 显示错误和手动重试入口 |
| REL-006 | P0 | Admin 发布页观察完整状态流 | 保存成功→同步中→已上线；失败时不误报已上线 |
| REL-007 | P1 | 大量连续编辑同一 published post | 可以合并失效或顺序处理；最终页面等于最高版本 |

## 8. 身份与安全用例（AUTH/SEC）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| AUTH-001 | P0 | 未登录访问 Admin 页面/API | 重定向登录或 401/403 |
| AUTH-002 | P0 | GitHub OAuth 登录成功但不可变 user ID 不在 allowlist | 拒绝访问；不能用可改名的 login 绕过 |
| AUTH-003 | P0 | allowlist 用户登录、session 过期后写入 | 过期请求拒绝，无数据变更 |
| AUTH-004 | P1 | 跨站 Origin/缺少 CSRF 保护调用 mutation | 请求拒绝 |
| SEC-001 | P0 | webhook 缺签名、错签名、过期时间戳 | 401/403，不触发任何失效 |
| SEC-002 | P0 | webhook body 篡改但复用原签名 | 验签失败 |
| SEC-003 | P0 | payload 注入 path/tag，如 `/`、`../`、超长 slug | schema/领域映射拒绝，不能任意 purge |
| SEC-004 | P0 | 尝试通过资产接口读取 Markdown、环境文件或绝对路径 | 404/拒绝；响应不含文件内容 |
| SEC-005 | P0 | 上传伪装扩展名、超限文件、主动 SVG | magic-byte/大小/类型校验拒绝或净化 |
| SEC-006 | P0 | 抓取 public API 全部端点 | 不含 draft、archived、revision、actor、legacy path |
| SEC-007 | P1 | 日志检查 | 不记录 cookie、token、签名 secret、数据库 URL 或 Markdown 全文 |
| SEC-008 | P1 | 对 admin mutation 和 webhook 压测超限 | 返回 429/受控失败，不拖垮公开页面 |
| SEC-009 | P0 | 投递未知或不兼容的 schemaVersion | 400 拒绝且不执行失效；日志记录 eventId，不记录 secret |

## 9. 资产与渲染兼容用例（AST/REN）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| AST-001 | P0 | 上传 PNG/JPEG/WebP，保存并发布 | 对象存在、hash/尺寸正确，前台可访问 |
| AST-002 | P0 | 上传失败或 DB 事务失败 | 不产生被内容引用的残缺对象；孤儿可清理 |
| AST-003 | P1 | 两次上传同名不同内容 | object key 不冲突，不覆盖旧资源 |
| AST-004 | P1 | 删除仍被 revision 引用的资产 | 被拒绝或延迟回收，历史恢复不破图 |
| REN-001 | P0 | 对长文比较迁移前后渲染 HTML | Markdown/GFM/代码块/Mermaid 语义一致 |
| REN-002 | P0 | 中文路径和 URL 编码 | 浏览器访问、canonical、内部链接一致 |
| REN-003 | P1 | 对象存储暂时失败 | 页面主体和错误边界可用，已有 CDN 资产继续服务 |

## 10. E2E 用户流程（E2E）

| ID | P | 流程 | 预期 |
|---|:---:|---|---|
| E2E-201 | P0 | 登录→新建→写 Markdown/Mermaid→在 Admin 预览→保存草稿 | Admin 预览与公开渲染管线一致且可恢复草稿；前台不可见 |
| E2E-202 | P0 | 草稿发布→等待同步→打开文章 | 不触发全站部署；文章、首页、分类、sitemap 可见 |
| E2E-203 | P0 | 编辑已发布文章并再次发布 | 前台最终只展示新版本，旧缓存被替换 |
| E2E-204 | P0 | 下线已发布文章 | 原 URL 404，所有公开入口移除 |
| E2E-205 | P1 | Web 暂停→发布→Web 恢复 | Admin 显示待同步/失败；恢复后自动上线 |
| E2E-206 | P0 | 编辑未保存时点击站内链接/关闭标签 | 出现明确离开确认，取消后内容保留 |
| E2E-207 | P1 | 手机宽度完成文章列表、编辑和发布检查 | 无固定侧栏遮挡，关键动作可完成 |

## 11. SEO、性能与缓存用例（SEO/PERF）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| SEO-201 | P0 | 新发布/下线/移动分类后检查 sitemap | URL 和 lastModified 正确，无草稿/归档 |
| SEO-202 | P0 | 抽查 canonical、OG、JSON-LD | 与正式域名/basePath 和最新内容一致 |
| SEO-203 | P1 | noindex 专栏 | robots metadata 和 sitemap 排除规则保持一致；明确 noindex 不是访问控制 |
| PERF-201 | P0 | 缓存热时请求首页/文章并观察 Content API | 普通热请求不调用 Content API |
| PERF-202 | P1 | 比较迁移前后 Lighthouse 和首屏 JS | 不低于既有基线，Admin 依赖不进入 Web bundle |
| PERF-203 | P1 | Runtime profile 发布单篇文章后观察生成日志 | 不同步生成全部文章；相关页面按访问懒生成 |

## 12. 可观测性、备份与回滚用例（OBS/CUT）

| ID | P | 步骤 | 预期 |
|---|:---:|---|---|
| OBS-001 | P0 | 追踪一次成功发布 | Admin、DB event、worker、Web 日志可用同一 eventId 串联 |
| OBS-002 | P0 | 制造 pending 超阈值 | 指标/告警触发，Admin 可见 |
| OBS-003 | P1 | 验签失败与 API 5xx | 指标分类正确且不泄露敏感 body |
| CUT-001 | P0 | 从生产备份恢复到隔离数据库 | 记录数、内容 hash、revision 和 event 一致 |
| CUT-002 | P0 | 恢复对象存储版本并抽查文章 | 资产 hash 和页面引用有效 |
| CUT-003 | P1 | 执行 Markdown 导出并在隔离环境渲染抽样 | 可读、可恢复，不影响线上 DB |
| CUT-004 | P0 | Runtime Web 切换失败，按 runbook 回旧站 | 旧 URL 可访问，无 DNS/canonical 混乱 |
| CUT-005 | P1 | 多次执行回滚/恢复命令的 dry-run | 目标明确、无宽泛删除或覆盖 |

## 13. 阶段质量门禁

| 阶段 | 必须通过 |
|---|---|
| Phase 0 | SEC-004 自动化；E2E-206 真实浏览器人工证据；Admin loopback 绑定 |
| Phase 1 | DATA-001、007、008 |
| Phase 2 | DATA-002～010、MIG-201～203 |
| Phase 3 | API、AUTH、SEC 全部 P0 |
| Phase 4 | WEB-201～205、MIG P0 |
| Phase 5 | WEB-206、STATIC P0、ISR P0、SEO P0、PERF-201 |
| Phase 6 | REL P0、OBS-001/002、E2E-202/203/205 |
| Phase 7 | 全部 P0 + CUT-001/002/004 |

任一 P0 失败阻止该阶段切换。P1 失败必须记录 owner、风险和完成日期；不得用 `next dev`、静态代码审查或 webhook 200 响应替代真实 ISR 验证。

## 14. 发布后冒烟清单

1. 匿名访问首页、分类、文章、专栏、about、sitemap、robots、404。
2. 登录 Admin，保存草稿，确认前台不可见。
3. 发布测试文章，确认状态从同步中变为已上线，且没有新的全站 deployment。
4. 修改正文和分类，确认文章页、旧/新分类、首页和 sitemap 最终一致。
5. 下线测试文章，确认旧 URL 404 且公开 API 不泄漏状态。
6. 检查 Outbox pending/failed、Web revalidation 错误、数据库连接和 API 5xx。
7. 验证对象存储图片、Mermaid、代码块、暗色模式和移动端导航。
8. 保留测试记录并清理明确的测试内容，不执行宽泛删除。
