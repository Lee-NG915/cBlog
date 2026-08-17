# Kimi Code K3 Review 与采纳记录

- Review 日期：2026-08-17
- Review 工具：本地 Kimi Code CLI 0.29.1
- 模型：`kimi-code/k3`
- 范围：`docs/deployment/` 初稿、当前 `feat/refector` 的 Web/Admin/core 代码与 GitHub Pages workflow
- 操作边界：Kimi 只读仓库并输出 Review，没有修改文件

## 1. Review 结论

K3 给出的总体结论是“需修订后实施”：数据库单一真源、构建期 API 拉取、Outbox + HMAC 触发 ISR 的方向正确，但初稿在迁移阶段切换点、事件覆盖、资产迁移和若干兼容行为上不完整。

## 2. 处理结果

| K3 finding | 分析 | 处理 |
|---|---|---|
| 24h fetch revalidate 无法兜底 Full Route Cache | “完全无法兜底”的判断过于绝对。[Next.js 14 官方文档](https://nextjs.org/docs/14/app/building-your-application/data-fetching/fetching-caching-and-revalidating)说明，静态路由中 fetch 的最低 revalidation 频率会影响整个路由，Data Cache revalidation 也会使 Full Route Cache 重渲染。不过初稿确实容易让实施者混用 TTL。 | 部分采纳：统一改为 route segment `revalidate = 86400`，fetch 只声明 cache tag，并新增无事件自愈用例。 |
| Phase 3 开 PG 单写、Phase 4 仍用 GitHub Pages，存在发布真空期和错误回滚 | 成立。原计划把“代码交付”和“生产启用”混在一起。 | 完全采纳：Phase 3/4 仅 staging/影子验证，生产 v1 保持不变；Phase 7 最终迁移后一次性切 PG 单写 + Runtime Web + Outbox。 |
| category/collection 没有完整事件契约 | 成立，当前 Footer/文章侧栏让分类导航变更影响全站。 | 完全采纳：扩充 entityType/payload；导航变化允许 root layout 懒失效；补 API/ISR 测试。 |
| `./assets/...` 迁到对象存储缺少正文改写与导出还原规则 | 成立，单纯上传文件不足以保持渲染和备份可移植性。 | 完全采纳：数据库正文使用 `asset://<id>`，AST 迁移，渲染解析为 CDN URL，导出恢复相对路径并校验 hash。 |
| 中文 slug 的 export 编码 hack 在 Node runtime 下需重新验证 | 成立，当前 post 与 collection 的规则不一致。 | 完全采纳：Phase 5 统一参数策略；构建期和 runtime 首访测试升为 P0。 |
| v2 丢失公开 Web 草稿预览 | 成立，但公开 draft URL 会扩大线上安全面。 | 采纳并收窄范围：v2 首期只保留已鉴权 Admin 预览，完整 Web Draft Mode 作为后续需求。 |
| workflow、content:check、parity 工具退役未列入 | 成立。 | 完全采纳：加入文件改造清单和阶段任务。 |
| date 与 published_at 语义未定义 | 成立。 | 完全采纳：拆分 editorial_date 与审计 published_at，并补迁移用例。 |
| HMAC 轮换、schemaVersion、404 后重新发布测试不足 | 成立。 | 完全采纳：加入 key ID 双密钥轮换、时钟要求和 P0 负例/恢复用例。 |
| ETag、双实例、预热略显过度 | ETag 对当前 no-store Content API 收益有限；双实例只在选择多副本部署时必要；预热可选。 | 删除 ETag 必测项；双实例测试按部署形态执行；预热保持 best-effort。 |

## 3. 修订后判断

v0.2 已消除生产发布真空期，补齐全局实体事件、资源可移植性和关键缓存恢复测试。方案可以进入 Phase 0 决策冻结，但仍不能直接开始生产迁移；技术方案 §15 的平台、数据库、对象存储、OIDC、域名/basePath 和 worker 选择仍是实现前置条件。
