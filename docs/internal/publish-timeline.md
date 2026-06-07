# 工程札记发布时间线（内部参考）

> **截止日**：2026-06-05（今天）— 所有 `date` / `updatedAt` 不得超过此日期。

按「架构 → 模块 → 方向 → 索引」从大到小排列，`date` 为首发，`updatedAt` 为后续修订。

## 已发布（按首发 date 排序）

| 层级 | 文章 slug | 首发 date | 修订 updatedAt | 说明 |
| --- | --- | --- | --- | --- |
| **架构** | ecommerce-architecture-redesign | 2026-02-18 | 2026-03-02 | 系列起点 |
| **模块** | design-system-cdd-practice | 2026-03-09 | 2026-03-22 | +19 天 |
| **模块** | joyui-to-tailwind-migration-adr | 2026-03-27 | 2026-04-08 | +18 天 |
| **方向** | nextjs-isr-redis-shared-cache | 2026-04-29 | 2026-05-08 | 渲染性能 |
| 博客基建 | nextjs-blog-setup | 2026-05-01 | 2026-05-14 | 独立线 |
| **方向** | transaction-observability-tech-plan | 2026-05-15 | 2026-05-24 | 交易可观测 |
| **方向** | tracking-events-book-contract | 2026-05-26 | 2026-06-02 | 埋点契约 |
| **索引** | engineering-practice-hub | 2026-05-28 | 2026-06-05 | 汇总目录 |
| **方向** | http-error-handling-strategy | 2026-05-30 | 2026-06-04 | HTTP 分层 |
| **方向** | payment-pipeline-architecture | 2026-06-03 | 2026-06-05 | 支付编排 |
| **索引** | joyboy-knowledge-map | 2026-06-04 | 2026-06-05 | 交互知识图谱 |

## 草稿（未发布，`date` 为撰写日期）

| 主题 | slug | 撰写 date | 最近修订 | 层级 |
| --- | --- | --- | --- | --- |
| 大规模迁移计划 | ecommerce-migration-plan | 2026-04-14 | 2026-04-21 | 模块 |
| 多市场 Feature Flag | multi-market-feature-flag | 2026-05-24 | 2026-06-03 | 架构 |
| PLP 重构 | ecommerce-plp-refactor | 2026-05-25 | 2026-06-05 | 方向 |
| Next.js Web 架构 | nextjs-web-app-architecture | 2026-05-27 | 2026-06-04 | 架构 |
| PDP Selector 索引 | pdp-product-selector-indexing | 2026-05-28 | 2026-06-04 | 方向 |
| 跨境电商 i18n | cross-border-i18n-strategy | 2026-05-29 | 2026-06-05 | 方向 |
| Edge Middleware 鉴权 | edge-middleware-auth-design | 2026-06-02 | 2026-06-05 | 方向 |
| 可观测性平台 Harness | observability-platform-harness | 2026-06-03 | 2026-06-05 | 方向 |
| 多时区管理 | ecommerce-timezone-management | 2026-06-04 | 2026-06-05 | 方向 |
| AI 工程化落地 | ai-engineering-harness-practice | 2026-06-05 | 2026-06-05 | 方向 |

## 待发（尚未撰写，无 date）

| 主题 | 建议层级 | 备注 |
| --- | --- | --- |
| API 错误码使用规范 | 方向 | 配套 HTTP 错误文 |
| Checkout 全流程方案 | 方向 | 配套支付文 |
| CMS 集成实现 | 方向 | Headless CMS |
| CloudFront A/B Testing | 方向 | 边缘实验 |

## 间隔规则（后续新发遵守）

- 同层级内：14–21 天
- `updatedAt` 与 `date` 至少间隔 3–7 天
- **硬性约束**：`date` / `updatedAt` ≤ 实际发布当天
- 避免多个 `date` 落在同一周
