# 内部资料索引（不公开发布）

> **注意**：本目录仅供本地整理项目笔记时查阅，**不会**出现在博客站点（`content/posts/`）中。
> 包含企业内部 Confluence 链接、原始项目代号、真实路径等敏感信息，请勿迁移到公开发布的文章。

## 用途

| 文件 | 说明 |
| --- | --- |
| [project-notes-index.md](./project-notes-index.md) | 主索引：Confluence 页面 ↔ 本地软链 ↔ 博客迁移状态 |
| [confluence-tree.md](./confluence-tree.md) | Confluence「设计文档汇总」完整子页面树 |
| [publish-timeline.md](./publish-timeline.md) | 发布日期时间线（架构→模块→方向，含后续排期建议） |
| [../confluence-export/INDEX.md](../confluence-export/INDEX.md) | Confluence 全量导出索引（76 篇 + 关联图） |
| [../confluence-export/knowledge-graph.md](../confluence-export/knowledge-graph.md) | 架构分层 / 模块关系 / 入职阅读路径 |

## 与公开内容的关系

```text
Confluence（企业源）
    ↓ MCP 拉取
docs/confluence-export/（Confluence 镜像 + INDEX + 关联图）
    ↓ 对照 / 拷贝
docs/joyboy/（仓库内原始资料 + Agent Skills）
    ↓ 软链
docs/engineering-notes/（分类软链枢纽）
    ↓ 去企业化迁移
content/posts/（公开发布的个人笔记）
    ↓ 导航
engineering-practice-hub（在线索引，不含内部信息）
```

**快速了解 Joyboy 推荐路径**：

1. 看关联图：[knowledge-graph.md](../confluence-export/knowledge-graph.md)
2. 按域浏览：[INDEX.md](../confluence-export/INDEX.md)
3. 深挖实现：INDEX 中的 `local_joyboy_doc` 链到 `docs/joyboy/`
4. 个人笔记版：已迁移主题见 `project-notes-index.md` 的 blog 列

## 查阅约定

1. 整理笔记时，先在 `project-notes-index.md` 查对应主题的三方映射。
2. 通过 `docs/engineering-notes/` 软链阅读本地原始文档。
3. 需要补充上下文时，用 Confluence 链接回看完整方案。
4. 迁移博客时严格执行 `.agents/skills/tech-doc-migration/SKILL.md`。
