# cBlog 部署态 v2 设计

- 状态：Phase 0–6 已实现；Phase 7 仓库内生产就绪（不切真实流量、不删除 filesystem）
- 版本：v0.3（2026-08-17，已根据 Kimi Code K3 Review 和独立部署场景修订）
- 适用分支：`feat/refector`
- 目标：数据库成为唯一内容源，前台与后端独立部署；按托管能力选择静态全站构建或按内容粒度 ISR

## 文档索引

1. [技术方案](./01-technical-design.md)
2. [开发方案](./02-implementation-plan.md)
3. [测试方案与用例](./03-test-plan.md)
4. [Kimi Code K3 Review 与采纳记录](./04-kimi-k3-review.md)
5. [Web 独立部署配置方案](./05-deployment-profiles.md)
6. [内容迁移与 Markdown 备份 Runbook](./06-migration-runbook.md)
7. [Phase 7 生产就绪、切流与回滚 Runbook](./07-cutover-runbook.md)

## 与现有重构文档的关系

`docs/refactor/` 记录的是已经完成的 v1 重构：SQLite 和 Markdown 随仓库提交、Admin 仅本地运行、前台 `output: "export"` 后部署 GitHub Pages。本目录描述的是后续可选的部署态 v2，不回写或改写 v1 的历史结论。

v2 会替换以下 v1 约束：

| v1 | v2 目标态 |
|---|---|
| SQLite 元数据 + Markdown 正文双载体 | PostgreSQL 保存元数据与 Markdown 正文，作为唯一运行时真源 |
| Admin 本地运行且无鉴权 | Admin 部署并强制单用户身份认证 |
| 保存后回写 frontmatter | 保存只写数据库；Markdown 只做异步备份导出 |
| Git push 触发 GitHub Pages 全量构建 | Outbox 按 profile 触发 GitHub Actions 全量构建或 Node Runtime ISR |
| 固定 `output: "export"` | `WEB_RENDER_MODE` 在静态导出和 Runtime ISR 之间显式选择 |

Web 与后端可部署在不同服务器和供应商。正式切换时只需确认 Web profile、域名/basePath、PostgreSQL 和对象存储供应商；内容模型、API 与页面组件不依赖具体云厂商。
