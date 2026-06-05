# 工程札记发布时间线（内部参考）

按「架构 → 模块 → 方向 → 索引」从大到小排列，`date` 为首发，`updatedAt` 为后续修订。

| 层级 | 文章 slug | 首发 date | 修订 updatedAt | 间隔说明 |
| --- | --- | --- | --- | --- |
| 博客基建 | nextjs-blog-setup | 2026-05-01 | 2026-05-14 | 个人博客搭建，独立线 |
| **架构** | ecommerce-architecture-redesign | 2026-02-18 | 2026-03-02 | 系列起点，总览最先 |
| **模块** | design-system-cdd-practice | 2026-03-09 | 2026-03-22 | +19 天 |
| **模块** | joyui-to-tailwind-migration-adr | 2026-03-27 | 2026-04-08 | +18 天 |
| **模块** | ecommerce-migration-plan | 2026-04-14 | 2026-04-21 | 草稿，+18 天 |
| **方向** | nextjs-isr-redis-shared-cache | 2026-04-29 | 2026-05-08 | 渲染性能，+15 天 |
| **方向** | transaction-observability-tech-plan | 2026-05-15 | 2026-05-24 | 交易可观测，+16 天 |
| **索引** | engineering-practice-hub | 2026-05-28 | 2026-06-05 | 汇总目录放最后 |

## 后续发文建议间隔

- 同层级内：14–21 天
- 跨层级（模块 → 方向）：可缩短到 10–14 天
- 修订 `updatedAt` 与 `date` 至少间隔 3–7 天，模拟真实打磨
- 避免多个 `date` 落在同一周

## P1 候选排期（预估）

| 主题 | 建议 date | 层级 |
| --- | --- | --- |
| 埋点契约 / Events Book | 2026-06-18 | 方向 |
| HTTP 错误处理策略 | 2026-07-03 | 方向 |
| 支付链路编排 | 2026-07-22 | 方向 |
