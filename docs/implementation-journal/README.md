# cBlog 部署态 v2 实施日志

本目录按 `docs/deployment/02-implementation-plan.md` 记录逐阶段实施过程，目标是让每一章都可以独立复盘和验证。

每章固定包含：

1. 目标和范围；
2. 代码与数据变更；
3. Kimi Code K3 只读 Review 原始结论摘要；
4. 主实现者对 finding 的采纳/拒绝分析；
5. 修订内容；
6. 自动化、构建和 E2E 证据；
7. 已知限制与下一阶段入口；
8. 对应 Git commit。

## 章节

| 章节 | 状态 | 文档 |
|---|---|---|
| Phase 0 决策与安全基线 | 已完成 | [phase-00](./phase-00.md) |
| Phase 1 PostgreSQL/domain | 已完成 | [phase-01](./phase-01.md) |
| Phase 2 迁移与备份 | 已完成 | [phase-02](./phase-02.md) |
| Phase 3 Admin/API/对象存储 | 已完成 | [phase-03](./phase-03.md) |
| Phase 4 Web API 影子构建 | 待开始 | 待创建 |
| Phase 5 Web profiles/ISR | 待开始 | 待创建 |
| Phase 6 Outbox 发布闭环 | 待开始 | 待创建 |
| Phase 7 迁移、退役与交付 | 待开始 | 待创建 |
