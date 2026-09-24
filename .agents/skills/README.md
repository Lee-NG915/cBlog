# Agent Skills（cBlog）

本目录存放项目级 Agent Skills，供 Codex、Cursor 等兼容 Agent 在特定任务中按需加载。

## 可用 Skills

| Skill | 路径 | 何时使用 |
|-------|------|----------|
| **样式优化** | [style-optimization/SKILL.md](style-optimization/SKILL.md) | 优化 UI/CSS/Tailwind、组件外观、动效、排版；改版时需同步品牌 |
| **技术文档迁移** | [tech-doc-migration/SKILL.md](tech-doc-migration/SKILL.md) | 将企业内部技术文档迁移为个人博客文章，去企业化、去品牌化、突出个人技术能力 |

## 品牌相关文件索引

- `lib/brand.ts` — 品牌配置源
- `docs/brand-core.md` — 品牌文档
- `/brand` — 站内品牌与组件样例页

## 内容运营与验证（项目适配版）

| Skill | 用途 |
|---|---|
| [cblog-content-metrics](cblog-content-metrics/SKILL.md) | 定义与复盘博客和小红书内容指标，核对事件口径与固定观察窗口；用于内容效果分析、测量方案及埋点验收。 |
| [cblog-content-strategy](cblog-content-strategy/SKILL.md) | 为 cBlog 博客与小红书制定定位、内容栏目和选题优先级，整理想法库及待调研方向；用于内容规划，不代替正文写作。 |
| [cblog-editorial](cblog-editorial/SKILL.md) | 撰写或审阅 cBlog 技术商业化文章及小红书笔记，解决内容空泛、证据不足与步骤不可执行的问题；交付正文和具体审稿结论。 |
| [cblog-reader-research](cblog-reader-research/SKILL.md) | 研究 Shopify 独立站运营与开发读者的具体问题，核验文章主张，整理可追溯的资料和调研结论。 |
| [cblog-seo-review](cblog-seo-review/SKILL.md) | 审查 cBlog 博客的可抓取性、元信息、内部链接和内容搜索意图；用于具体页面或站点 SEO 检查，不用于推断小红书推荐机制。 |
| [cblog-social-visuals](cblog-social-visuals/SKILL.md) | 把已通过内容审稿的小红书笔记转为可读的图文卡片，生成配图说明或可编辑图稿并检查实际导出图片。 |
| [cblog-webapp-check](cblog-webapp-check/SKILL.md) | 验证 cBlog 博客及笔记应用的浏览器行为，包括 Markdown 粘贴、阅读预览、保存与重载；优先复用项目 Playwright 测试。 |

共享背景：[content-context.md](content-context.md)。[完整分类和来源报告](../../docs/skill-selection-2026-09-23.md)。
新技能为项目适配版，不是上游整包；下一轮可按名称调用。Notion 状态按使用时读取。审阅通过的本地成果由 cblog-notion-sync 在任务收尾同步；不自动发布，也无后台监听。

品牌索引中的根目录旧路径在当前monorepo下应以 `apps/web/` 为前缀解析，例如 `apps/web/lib/brand.ts`；`docs/brand-core.md` 仍在仓库根目录。

## 成果同步

- [cblog-notion-sync](cblog-notion-sync/SKILL.md)：本地成果审阅通过后同步正文和图片到 Notion；记录映射、冲突、失败与核验状态。
