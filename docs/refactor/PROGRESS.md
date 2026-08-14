# 重构实施进度

对照 [PRD §7 里程碑](./01-prd.md)。设计与实现出现偏差时同步修订 PRD/技术设计文档，本文件只记录进度与验证结果。

| 阶段 | 状态 | 完成时间 | 验证结果 |
|------|------|----------|----------|
| 基线 | ✅ | 2026-08-14 | 76 页面快照存于 `docs/refactor/parity/baseline`（含 sitemap 26 项、每页指纹）；修复存量 MobileNav 空值类型错误后构建通过 |
| Phase 0 仓库清理 | ✅ | 2026-08-14 | apps/{joyboy,onepiece,backend} → docs/projects/（gitignore）；`git ls-files apps/` 为空（MIG-005） |
| Phase 1 Monorepo 骨架 | ✅ | 2026-08-14 | web 迁入 apps/web；repoPath() 统一路径解析；CI artifact 路径更新；**等价校验通过**（URL 76/76、sitemap 26/26、页面指纹全一致，MIG-001） |
| Phase 2 core + 数据库 | ✅ | 2026-08-14 | 28 篇导入（19 published/9 draft），重复导入幂等（28 未变）；driftCheck 无漂移；web 元数据切 DB 后**等价校验通过**（76 页指纹一致）；core 单测 15/15 通过 |
| Phase 3 专栏通用化 | ✅ | 2026-08-14 | 44 个专栏文档（rightCapital 28 + addx-ai 16）迁入 content/collections/ 并补 frontmatter；slug 与基线 44/44 全对上；通用路由 `/[collection]/[slug]` 上线，旧路由/加载器删除；**等价校验通过**（76 页、sitemap、指纹一致）；单测 19/19 |
| Phase 4 管理端 MVP | ⬜ | | |
| Phase 5 查看器与性能 | ⬜ | | |

## 备注与偏差记录

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
