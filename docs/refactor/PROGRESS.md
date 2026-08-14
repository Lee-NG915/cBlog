# 重构实施进度

对照 [PRD §7 里程碑](./01-prd.md)。设计与实现出现偏差时同步修订 PRD/技术设计文档，本文件只记录进度与验证结果。

| 阶段 | 状态 | 完成时间 | 验证结果 |
|------|------|----------|----------|
| 基线 | ✅ | 2026-08-14 | 76 页面快照存于 `docs/refactor/parity/baseline`（含 sitemap 26 项、每页指纹）；修复存量 MobileNav 空值类型错误后构建通过 |
| Phase 0 仓库清理 | ✅ | 2026-08-14 | apps/{joyboy,onepiece,backend} → docs/projects/（gitignore）；`git ls-files apps/` 为空（MIG-005） |
| Phase 1 Monorepo 骨架 | ✅ | 2026-08-14 | web 迁入 apps/web；repoPath() 统一路径解析；CI artifact 路径更新；**等价校验通过**（URL 76/76、sitemap 26/26、页面指纹全一致，MIG-001） |
| Phase 2 core + 数据库 | ✅ | 2026-08-14 | 28 篇导入（19 published/9 draft），重复导入幂等（28 未变）；driftCheck 无漂移；web 元数据切 DB 后**等价校验通过**（76 页指纹一致）；core 单测 15/15 通过 |
| Phase 3 专栏通用化 | ✅ | 2026-08-14 | 44 个专栏文档（rightCapital 28 + addx-ai 16）迁入 content/collections/ 并补 frontmatter；slug 与基线 44/44 全对上；通用路由 `/[collection]/[slug]` 上线，旧路由/加载器删除；**等价校验通过**（76 页、sitemap、指纹一致）；单测 19/19 |
| Phase 4 管理端 MVP | ✅ | 2026-08-14 | 全功能上线（仪表盘/文章列表筛选/新建/CodeMirror 编辑器+实时预览含 Mermaid/元数据/状态流转/图片粘贴上传/分类 CRUD/专栏 CRUD+拖拽排序/一键发布）；API 级 E2E 自测通过：建文→回写→贴图→状态双写→白名单分类→软删除回收站，测试数据已清理；core 单测 28/28；admin typecheck 零错误；浏览器目检仪表盘/列表/编辑器正常，预览 Mermaid 渲染成功 |
| Phase 5 查看器与性能 | ✅ | 2026-08-14 | MermaidViewer 全屏查看器（滚轮锚点缩放/拖拽/捏合/双击/工具栏/ESC）+ 图例视口懒渲染；随文档图片 sharp+WebP 管道 + manifest 引用替换；知识图谱懒加载；**等价校验通过**；文章页 first-load 106→103 kB（见 [perf-report](./perf-report.md)）；单测 28/28 |
| 收尾交付 | ✅ | 2026-08-14 | README 重写为 monorepo 版；最终全量构建 + 等价校验通过（76 页与基线一致）；测试计划补执行记录；遗留项见下 |

## 遗留项（backlog）

- Playwright E2E 基建（当前以 API 级 E2E + 浏览器目检覆盖）
- 真实浏览器手测 Mermaid 查看器交互（MMD-001~006，实现已过代码审查与 DOM 级功能验证）
- 首次真实发布验证（PUB-005，作者首次使用管理端发布时完成）
- 图片 srcset 多尺寸、slug 修改支持、封面图走优化管道（PRD 非目标/backlog）

## 备注与偏差记录

- Phase 4/5 实现补充（已同步技术文档）：
  - 管理端编辑器预览的相对图片经只读接口 `/api/assets?doc=&name=` 提供（严格限制 content/ 内）；
  - `markdownToHtml` 增加 assetBase 参数：web 构建把 `./` 相对引用重写为 `/content/<文档目录>/...`，配合 prebuild 资产镜像脚本 + WebP manifest 替换（原图保留兜底）；
  - updatedAt 不在保存时自动更新，作为可编辑元数据字段由作者掌控；
  - 包体分析不引入 @next/bundle-analyzer 依赖，以 next build 的 first-load JS 表格作基线对比。

- 基线阶段：现有代码存在 TS 编译错误（MobileNav pathname 可空），属存量问题，已随基线提交修复。
- Phase 1：`generate-covers.js` 随 public/ 迁入 apps/web/scripts/（内容工具，非构建链路）；confluence 相关脚本留在根 scripts/ 不动。
- Phase 2 与技术设计的偏差（已回写技术文档）：
  - `posts.updated_at` 允许 NULL（存量 21/29 文件才有 updatedAt，展示字段非必填）；
  - `post_tags` 增加 `position` 列保持标签原始顺序；
  - 存量 `coverCard` 字段解析时归一为 `coverImage`，回写统一写 `coverImage`；
  - web 因 pnpm 依赖隔离需将 `better-sqlite3` 声明为直接依赖（externals 解析要求）。
- Phase 3 与技术设计的偏差（已回写技术文档）：
  - collections 表新增 `label`（列表页小标签）、`badge`（详情页徽标）、`noindex`（robots 与 sitemap 排除，存量专栏=1 保持等价）三列；
  - 专栏文档详情页侧栏编号统一为补零格式（原 rightCapital 未补零、addx-ai 补零，按 FR-5.4 统一模板取补零）；
  - 专栏文档 excerpt/readingTime 沿用原"从正文派生"算法（与文章的公式不同，分别保留以保证展示等价）。
