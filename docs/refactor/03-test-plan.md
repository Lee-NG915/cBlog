# cBlog 重构测试计划

- 版本：v1.0（2026-08-14）
- 关联文档：[PRD](./01-prd.md) · [技术设计](./02-technical-design.md)
- 用例 ID 规则：`<模块>-<序号>`；优先级 P0 = 必须自动化且合并前通过，P1 = 自动化优先，P2 = 手动执行即可

## 1. 测试策略

项目当前无任何测试设施，随重构分阶段引入，保持务实（单作者项目，不追求覆盖率指标，只守关键路径）：

| 层 | 工具 | 覆盖对象 | 引入阶段 |
|----|------|----------|----------|
| 单元测试 | Vitest | core：frontmatter 序列化、slug/路径校验、仓储逻辑（内存 SQLite） | Phase 2 |
| 集成测试 | Vitest + 临时目录 fixture | admin API handler：文件 + 数据库 + frontmatter 三方一致性 | Phase 4 |
| E2E | Playwright | 管理端关键用户流（S1–S3）、前台冒烟 | Phase 4/5 |
| 构建校验脚本 | Node 脚本（CI 步骤） | 产物 URL 清单等价、漂移检测、包体基线 | Phase 1 起 |
| 手动清单 | 本文档 §5 | 真实 git 发布、触屏交互、GitHub Pages 线上冒烟 | 每阶段收尾 |

**迁移等价性是本次重构的测试核心**：Phase 1/2/3 各自完成后，构建产物与迁移前基线对比（方法见 MIG-001）。

## 2. 环境与测试数据

- 单元/集成：`:memory:` SQLite + 临时目录内生成最小 content fixture（含中文 slug 标题、draft/published/archived 各态、带 Mermaid 与图片引用的文章、两个专栏）。
- E2E：独立的 fixture 仓库副本（`git init` 的临时仓库），避免污染真实内容；git push 用本地 bare 仓库作远端模拟。
- 基线快照：重构动工前在 main 构建一次，保存 `out/` 文件清单 + sitemap.xml + bundle 体积，作为全程对比基准。

## 3. 测试用例

### 3.1 迁移等价性（MIG）— 贯穿 Phase 1/2/3

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| MIG-001 | P0 | FR-1.3, NFR-1 | 基线与当前分支各执行生产构建；归一化对比 `out/` 全量 HTML 文件路径清单与 sitemap.xml | 路径集合完全一致，无丢失无多余（新增功能页除外，需显式声明） |
| MIG-002 | P0 | FR-8.3, FR-5.3 | Phase 3 后抽查专栏全部旧 URL（/rightCapital/、/rightCapital/01/…、/addx-ai/…） | 逐一可访问，正文与迁移前一致 |
| MIG-003 | P0 | FR-2.2 | 对现有全部 md 执行 `content:import`，对比数据库记录数与文件数、逐字段抽查 5 篇 | 记录数相等；title/date/status/tags/分类与 frontmatter 一致 |
| MIG-004 | P1 | FR-2.2 | 连续执行两次 `content:import` | 第二次零变更（幂等），无重复记录 |
| MIG-005 | P1 | FR-1.2 | Phase 0 后检查 `git ls-files apps/`、工作区状态 | 无跟踪文件残留；docs/projects/ 被 ignore |
| MIG-006 | P0 | NFR-5 | 在干净 CI 环境（仅 checkout + pnpm install）执行构建 | 成功，无需额外 secret/服务 |

### 3.2 core 包（CORE）— Phase 2

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| CORE-001 | P0 | FR-2.3 | frontmatter round-trip：解析→序列化→再解析 | 语义不变；字段顺序恒为约定顺序；重复序列化输出字节级稳定 |
| CORE-002 | P0 | NFR-4 | 以 `../x`、`a/../../b`、绝对路径、含 `%2e` 的 slug 调用写 API | 全部拒绝并报错，content/ 外无任何文件产生 |
| CORE-003 | P0 | FR-3.2 | createPost 合法输入 | 目录 + index.md 脚手架 + 数据库记录三者生成，状态 draft |
| CORE-004 | P0 | FR-2.3 | savePost 修改标题与标签 | md frontmatter 与数据库同步更新；正文无损 |
| CORE-005 | P1 | §5 保存事务 | 模拟数据库写入抛错 | 文件回滚为保存前内容，无分叉 |
| CORE-006 | P1 | FR-2.5 | 手改某文件 frontmatter 后执行 driftCheck | 返回该文件差异；构建仅告警不失败 |
| CORE-007 | P1 | FR-4.2, FR-5.1 | 删除含文章的分类 / 含文档的专栏 | 被仓储层拒绝 |
| CORE-008 | P1 | §7.2 | 以保留字（posts/about/categories…）创建专栏 | 拒绝 |
| CORE-009 | P2 | FR-3.6 | deletePost | 文件出现在 content/.trash/，记录删除 |
| CORE-010 | P1 | FR-8.1 | listPosts 三种状态过滤组合 | production 集合 = published；dev 集合含 draft；任何集合不含 archived |

### 3.3 管理端（ADM）— Phase 4

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| ADM-001 | P0 | S1, FR-3.2/3.3 | E2E：新建文章→编辑器输入含 Mermaid 的正文→Cmd+S | 保存成功；md 文件、数据库、列表页三处一致 |
| ADM-002 | P0 | FR-3.3 | 编辑器右侧预览与前台渲染同一篇文章 | HTML 结构一致（同渲染管道），Mermaid 图出现 |
| ADM-003 | P0 | FR-3.5 | draft→published→archived→draft 全链路流转 | 每步数据库与 frontmatter 同步，界面即时反映 |
| ADM-004 | P0 | FR-6.1 | 编辑器粘贴 PNG | 文件落在该文章 assets/；光标处插入 `./assets/…` 引用；预览显示 |
| ADM-005 | P1 | FR-6.1 | 粘贴同名图片两次 | 第二个自动加 hash 后缀，互不覆盖 |
| ADM-006 | P0 | FR-4 | 新建分类→在该分类下新建文章 | 目录自动创建；新建表单分类下拉含新分类 |
| ADM-007 | P1 | FR-5.2 | 专栏内拖拽排序后刷新 | 顺序持久化（数据库 sortOrder 更新） |
| ADM-008 | P1 | FR-3.3 | 编辑未保存时关闭/跳转 | 出现离开确认 |
| ADM-009 | P1 | FR-3.1 | 列表组合筛选（状态+分类+关键词） | 结果正确，含草稿与归档 |
| ADM-010 | P2 | FR-3.4 | 修改文章所属分类 | 数据库与 frontmatter 更新；文件不移动；URL 不变 |

### 3.4 发布流程（PUB）— Phase 4

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| PUB-001 | P0 | FR-7.1 | 改动一篇文章后打开发布页（本地 bare 仓库作远端） | 变更清单仅含 content/ 与 data/blog.db 相关文件 |
| PUB-002 | P0 | FR-7.2 | 执行一键发布 | 远端收到 commit；提交内容仅白名单路径；message 含文章标题 |
| PUB-003 | P0 | FR-7.3 | 同时手改 apps/web 某代码文件再发布 | 代码变更不被提交，页面明确提示"白名单外变更请在 IDE 处理" |
| PUB-004 | P1 | FR-7.3 | 远端领先本地（模拟冲突）时发布 | 中止并给出手动处理指引；无 force push |
| PUB-005 | P2 | FR-7.2 | 真实仓库发布一篇测试文章（手动） | Actions 触发，Pages 上线可见；测试后删除 |

### 3.5 前台（WEB）— Phase 2/3

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| WEB-001 | P0 | PRD §4 | 各状态文章在生产构建产物中的存在性 | published 有页面且进 sitemap；draft/archived 无页面、不进 sitemap、列表无入口 |
| WEB-002 | P1 | PRD §4 | `next dev` 访问草稿与归档 URL | 草稿可见带标识；归档 404 |
| WEB-003 | P0 | FR-4.3, FR-8.1 | 数据库新增分类+文章后构建 | /categories/<新slug>/ 生成；导航与分类页自动含新分类 |
| WEB-004 | P0 | FR-8.2 | 数据库新增专栏+文档后构建 | /<新专栏>/ 与文档页生成；既有静态路由（/about 等）不受影响 |
| WEB-005 | P0 | FR-6.3, NFR-1 | 含随文档图片 + 旧式 /images 引用的文章，分别以空 basePath 和 `/cBlog` basePath 构建 | 两种引用在两种 basePath 下 src 均正确、文件存在于产物 |
| WEB-006 | P1 | FR-10.2 | 检查产物中随文档位图 | 存在压缩/WebP 版本，引用已重写，原图兜底可访问 |
| WEB-007 | P2 | FR-8.4 | 对比 sitemap 与实际页面集合 | 一致 |

### 3.6 Mermaid 查看器（MMD）— Phase 5

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| MMD-001 | P0 | FR-9.1 | 点击图例打开查看器，滚轮缩放 | 以光标为锚点缩放，范围钳制 0.25x–8x |
| MMD-002 | P0 | FR-9.1 | 按住拖拽 | 图随指针平移，松开停止 |
| MMD-003 | P0 | FR-9.2 | 工具栏 +/−/重置/适配宽度；ESC 与遮罩关闭 | 各按钮行为正确；两种方式均可关闭 |
| MMD-004 | P1 | FR-9.3 | 打开超宽大图 | 默认适配窗口宽度并居中 |
| MMD-005 | P1 | FR-9.1 | 触屏：单指拖动、双指捏合、双击（手动，真机/模拟器） | 平移、缩放、放大均正常，无页面滚动穿透 |
| MMD-006 | P0 | FR-10.1 | 长文含 5+ 图例，打开页面不滚动 | 仅视口内图例渲染；滚动到位后其余依次渲染 |
| MMD-007 | P1 | FR-9.3 | 语法错误的 mermaid 代码块 | 显示错误兜底提示，页面其余部分正常 |
| MMD-008 | P2 | FR-9.1 | 8x 缩放下连续拖拽（性能观察） | 无明显掉帧（transform 合成层生效） |

### 3.7 性能与包体（PERF）— Phase 5

| ID | P | 关联 | 步骤 | 预期 |
|----|---|------|------|------|
| PERF-001 | P0 | NFR-2, NFR-3 | bundle analyzer 对比基线 | 文章页 first-load JS ≤ 基线；产物无 CodeMirror/simple-git 等 admin 依赖 |
| PERF-002 | P1 | NFR-2 | Lighthouse 移动端跑首页与最长文章页，对比基线 | Performance 分数不低于基线 |
| PERF-003 | P2 | FR-10.3 | 首页加载时网络面板观察 | KnowledgeGraphExplorer 等按需加载 |

## 4. 验收映射（FR → 用例）

| 需求 | 覆盖用例 |
|------|----------|
| FR-1 | MIG-001/005/006 |
| FR-2 | MIG-003/004, CORE-001/004/005/006 |
| FR-3 | ADM-001/002/003/008/009/010, CORE-003/009/010 |
| FR-4 | ADM-006, CORE-007, WEB-003 |
| FR-5 | ADM-007, MIG-002, WEB-004, CORE-007/008 |
| FR-6 | ADM-004/005, WEB-005/006 |
| FR-7 | PUB-001~005 |
| FR-8 | WEB-001~004/007, MIG-001/002 |
| FR-9 | MMD-001~005/007/008 |
| FR-10 | MMD-006, WEB-006, PERF-001~003 |

## 5. 发布前手动回归清单（每阶段收尾执行）

1. `pnpm build` 干净通过，driftCheck 无告警。
2. 本地 `pnpm preview` 抽查：首页、一篇长文（含 Mermaid/图片/代码块）、每个分类页、每个专栏落地页与一篇文档、about、404、暗色模式切换。
3. sitemap.xml 与上一版本 diff，确认变更均为预期。
4. 真实发布一次（PUB-005），Pages 线上抽查同第 2 条 + 图片路径（basePath）正确。
5. 移动端（真机）抽查：导航、文章页、Mermaid 查看器触控。

## 6. 缺陷与阻塞标准

- P0 用例失败：阻塞当前 Phase 合并。
- P1 失败：可合并但须建 issue 并在下一 Phase 前修复。
- P2 失败：记录 backlog。
