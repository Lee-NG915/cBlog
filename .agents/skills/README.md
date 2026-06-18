# Agent Skills（cBlog）

本目录存放项目级 Agent Skills，供 Cursor 在特定任务中加载。

## 可用 Skills

### 项目内部

| Skill | 路径 | 何时使用 |
|-------|------|----------|
| **样式优化** | [style-optimization/SKILL.md](style-optimization/SKILL.md) | 优化 UI/CSS/Tailwind、组件外观、动效、排版；改版时需同步品牌 |
| **技术文档迁移** | [tech-doc-migration/SKILL.md](tech-doc-migration/SKILL.md) | 将企业内部技术文档迁移为个人博客文章，去企业化、去品牌化、突出个人技术能力 |

### [khazix-skills](https://github.com/KKKKhazix/khazix-skills)（社区）

来源：`KKKKhazix/khazix-skills`，版本锁定见项目根目录 `skills-lock.json`。

| Skill | 路径 | 何时使用 |
|-------|------|----------|
| **aihot** | [aihot/SKILL.md](aihot/SKILL.md) | 查询 AI HOT 日报与 AI 圈动态（「今天 AI 圈有什么」「最近 OpenAI 发布」等） |
| **storage-analyzer** | [storage-analyzer/SKILL.md](storage-analyzer/SKILL.md) | 扫描磁盘占用、生成清理报告（「帮我看看存储」「C 盘满了」等） |
| **neat-freak** | [neat-freak/SKILL.md](neat-freak/SKILL.md) | 任务结束后同步文档、CLAUDE.md/AGENTS.md 与 Agent 记忆（`/neat`、`整理一下`） |
| **hv-analysis** | [hv-analysis/SKILL.md](hv-analysis/SKILL.md) | 横纵分析法生成产品/公司/概念深度研究报告（PDF） |
| **khazix-writer** | [khazix-writer/SKILL.md](khazix-writer/SKILL.md) | 按卡兹克公众号风格写长文 |

更新社区 skill：`npx skills update`

## 品牌相关文件索引

- `lib/brand.ts` — 品牌配置源
- `docs/brand-core.md` — 品牌文档
- `/brand` — 站内品牌与组件样例页
