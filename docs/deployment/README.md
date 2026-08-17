# cBlog 部署态 v2 设计

- 状态：Reviewed Draft，待实现
- 版本：v0.2（2026-08-17，已根据 Kimi Code K3 Review 修订）
- 适用分支：`feat/refector`
- 目标：数据库成为唯一内容源，前台保持静态优先，并在 Admin 发布后按内容粒度触发 ISR

## 文档索引

1. [技术方案](./01-technical-design.md)
2. [开发方案](./02-implementation-plan.md)
3. [测试方案与用例](./03-test-plan.md)
4. [Kimi Code K3 Review 与采纳记录](./04-kimi-k3-review.md)

## 与现有重构文档的关系

`docs/refactor/` 记录的是已经完成的 v1 重构：SQLite 和 Markdown 随仓库提交、Admin 仅本地运行、前台 `output: "export"` 后部署 GitHub Pages。本目录描述的是后续可选的部署态 v2，不回写或改写 v1 的历史结论。

v2 会替换以下 v1 约束：

| v1 | v2 目标态 |
|---|---|
| SQLite 元数据 + Markdown 正文双载体 | PostgreSQL 保存元数据与 Markdown 正文，作为唯一运行时真源 |
| Admin 本地运行且无鉴权 | Admin 部署并强制单用户身份认证 |
| 保存后回写 frontmatter | 保存只写数据库；Markdown 只做异步备份导出 |
| Git push 触发 GitHub Pages 全量构建 | 发布事务完成后发送事件，前台按标签和路径执行 ISR |
| `output: "export"` | 支持 Next.js Node.js Runtime 的静态优先部署 |

在正式实施前必须确认部署平台、域名/basePath、PostgreSQL 和对象存储供应商；其余接口和业务边界不依赖具体云厂商。
