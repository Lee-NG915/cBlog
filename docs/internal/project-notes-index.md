# 项目笔记主索引（内部 · 不公开）

按工程实践方向组织，每条记录包含：**Confluence 源**、**本地软链**、**博客状态**、**我的角色**、**整理备注**。

> Confluence 根目录：[设计文档汇总](https://castlery.atlassian.net/wiki/spaces/EC/pages/2583822375)

---

## 整理优先级

| 批次 | 主题 | 状态 |
| --- | --- | --- |
| P0 | ISR 缓存、交易可观测性、Joy UI 迁移 ADR | ✅ 本次完成 |
| P1 | 埋点契约、支付链路、HTTP 错误处理 | 📂 下一轮 |
| P2 | PLP 重构、多市场 Feature Flag、i18n | 📂 排队中 |
| P3 | Account 重构、Sale Page、时区管理 | 📂 长尾 |

---

## 01 · 架构与边界治理

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| 整体架构重构 | [2748481722](https://castlery.atlassian.net/wiki/spaces/EC/pages/2748481722) | [architecture-review.md](../engineering-notes/01-architecture/architecture-review.md) | ✅ [ecommerce-architecture-redesign](/posts/ecommerce-architecture-redesign/) | 主导方案设计与落地 |
| 客户端架构设计（草稿） | [2617049089](https://castlery.atlassian.net/wiki/spaces/EC/pages/2617049089) | — | 📂 | 参与者 |
| Shared → Composite 迁移 | — | [shared-to-composite-migration.md](../engineering-notes/01-architecture/shared-to-composite-migration.md) | 📂 | 推进模块边界调整 |
| Redux Listener 事件模式 | — | [redux-listener-event-pattern.md](../engineering-notes/01-architecture/redux-listener-event-pattern.md) | 📂 | 设计并落地 |
| 项目规范 AGENTS.md | — | [project-agents-spec.md](../engineering-notes/01-architecture/project-agents-spec.md) | 📂 | 维护规范 |
| O2O 设计（第2期） | [2577695569](https://castlery.atlassian.net/wiki/spaces/EC/pages/2577695569) | — | 📂 | 参与者 |
| 大规模迁移计划 | [2735243270](https://castlery.atlassian.net/wiki/spaces/EC/pages/2735243270) | — | 📝 [ecommerce-migration-plan](/posts/ecommerce-migration-plan/) | 制定迁移节奏 |
| 多市场 Feature Flag | [3042443302](https://castlery.atlassian.net/wiki/spaces/EC/pages/3042443302) | — | 📂 | 方案撰写 |
| 多区域特性标记 | [3020095502](https://castlery.atlassian.net/wiki/spaces/EC/pages/3020095502) | — | 📂 | 参与者 |

---

## 02 · 渲染与性能

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| **ISR + Redis 共享缓存** | [2890760193](https://castlery.atlassian.net/wiki/spaces/EC/pages/2890760193) | — | ✅ [nextjs-isr-redis-shared-cache](/posts/nextjs-isr-redis-shared-cache/) | 方案设计与实现 |
| onepiece server side cache | [2811822193](https://castlery.atlassian.net/wiki/spaces/EC/pages/2811822193) | — | 📂 | 参考 legacy 方案 |
| PLA 页面迁移 | [2953707577](https://castlery.atlassian.net/wiki/spaces/EC/pages/2953707577) | — | 📂 | 参与者 |
| PLA v1 技术方案 | [2747203889](https://castlery.atlassian.net/wiki/spaces/EC/pages/2747203889) | — | 📂 | 参与者 |
| PLP 技术方案 | — | [plp-tech-solution.md](../engineering-notes/02-rendering-performance/plp-tech-solution.md) | 📂 | 核心撰写 |
| PLP 重构 | [3347021873](https://castlery.atlassian.net/wiki/spaces/EC/pages/3347021873) | — | 📂 | 推进 |
| PLP 优先于 CLP | — | [plp-priority-over-clp.md](../engineering-notes/02-rendering-performance/plp-priority-over-clp.md) | 📂 | 决策参与者 |
| PDP 数据分桶 | — | [pdp-data-bucket-optimization.md](../engineering-notes/02-rendering-performance/pdp-data-bucket-optimization.md) | 📂 | 方案设计 |
| PDP Selector Phase 1 | [3732668429](https://castlery.atlassian.net/wiki/spaces/EC/pages/3732668429) | — | 📂 | 参与者 |
| 搜索结果缓存 | — | [search-result-cache.md](../engineering-notes/02-rendering-performance/search-result-cache.md) | 📂 | 实现 |
| 本地开发性能 | — | [local-dev-performance-plan.md](../engineering-notes/02-rendering-performance/local-dev-performance-plan.md) | 📂 | 推进 |
| CloudFront A/B Testing | [3022716930](https://castlery.atlassian.net/wiki/spaces/EC/pages/3022716930) | — | 📂 | 方案评估 |

---

## 03 · 设计系统

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| Fortress 2.0 CDD | [3310452890](https://castlery.atlassian.net/wiki/spaces/EC/pages/3310452890) | — | ✅ [design-system-cdd-practice](/posts/design-system-cdd-practice/) | **完全主导** |
| Joy UI → Tailwind ADR | [3022716976](https://castlery.atlassian.net/wiki/spaces/EC/pages/3022716976) | — | ✅ [joyui-to-tailwind-migration-adr](/posts/joyui-to-tailwind-migration-adr/) | 提议并撰写 ADR |
| fortress 2.0 tailwind 集成 | [3034185933](https://castlery.atlassian.net/wiki/spaces/EC/pages/3034185933) | — | 📂 | 推进 |
| Color system token | [3410035108](https://castlery.atlassian.net/wiki/spaces/EC/pages/3410035108) | — | 📂 | 设计 |
| Joy UI variant 取色规则 | [3412459527](https://castlery.atlassian.net/wiki/spaces/EC/pages/3412459527) | — | 📂 | 整理 |
| 代码格式化指南 | — | [code-formatting-guide.md](../engineering-notes/03-design-system/code-formatting-guide.md) | 📂 | 维护 |

---

## 04 · 交易与支付

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| Checkout 技术方案 | [2748448779](https://castlery.atlassian.net/wiki/spaces/EC/pages/2748448779) | — | 📂 | 核心开发 |
| 支付技术总方案 | — | [payment-tech-solution.md](../engineering-notes/04-transaction-payment/payment-tech-solution.md) | 📂 | 设计与实现 |
| 支付架构重构 ADR | — | [payment-architecture-adr.md](../engineering-notes/04-transaction-payment/payment-architecture-adr.md) | 📂 | 主导 ADR |
| Stripe Payment Element | — | [stripe-payment-element.md](../engineering-notes/04-transaction-payment/stripe-payment-element.md) | 📂 | 实现 |
| Stripe Express Checkout | — | [stripe-express-checkout.md](../engineering-notes/04-transaction-payment/stripe-express-checkout.md) | 📂 | 实现 |
| SPL 分期支付 | — | [web-checkout-spl-payment.md](../engineering-notes/04-transaction-payment/web-checkout-spl-payment.md) | 📂 | 方案设计 |
| 延保 Warranty | — | [warranty-architecture.md](../engineering-notes/04-transaction-payment/warranty-architecture.md) | 📂 | 架构设计 |

---

## 05 · 可观测性

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| **Transaction Observability** | [3936616449](https://castlery.atlassian.net/wiki/spaces/EC/pages/3936616449) | [transaction-observability-readme.md](../engineering-notes/05-observability/transaction-observability-readme.md) | ✅ [transaction-observability-tech-plan](/posts/transaction-observability-tech-plan/) | 方案撰写与主链路接入 |
| Sentry & Datadog 集成 | [2808676413](https://castlery.atlassian.net/wiki/spaces/EC/pages/2808676413) | [sentry-issue-routing.md](../engineering-notes/05-observability/sentry-issue-routing.md) | 📂 部分覆盖 | 平台集成 |
| 错误处理流程 | — | [error-handling-flow.md](../engineering-notes/05-observability/error-handling-flow.md) | 📂 | 设计 |
| Redirect callback 设计 | — | [redirect-provider-callback.md](../engineering-notes/05-observability/redirect-provider-callback.md) | 📂 含于可观测性文 | 实现 |
| Runbook | — | [transaction-observability-runbook.md](../engineering-notes/05-observability/transaction-observability-runbook.md) | 📂 | 撰写 |
| Observability Skill | — | [observability-skill.md](../engineering-notes/05-observability/observability-skill.md) | 📂 | 维护 |
| Log Management | [2950070275](https://castlery.atlassian.net/wiki/spaces/EC/pages/2950070275) | — | 📂 | 参与者 |

> **平台演进备注**：Confluence 版基于 Datadog；本地 `tech-summary-report.md` 已迁移到 Grafana + Loki + Tempo 体系。博客以 Grafana 方案为准，Confluence 作历史参考。

---

## 06 · 埋点与数据契约

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| 追踪事件模型 | — | [tracking-event-model-readme.md](../engineering-notes/06-tracking-data/tracking-event-model-readme.md) | 📂 P1 | 推动 Events Book |
| 事件页模板 | — | [event-model-template.md](../engineering-notes/06-tracking-data/event-model-template.md) | 📂 | 设计 |
| Checkout 埋点 | — | [tracking-checkout.md](../engineering-notes/06-tracking-data/tracking-checkout.md) | 📂 | 实现 |
| 交易类埋点 | — | [tracking-transaction.md](../engineering-notes/06-tracking-data/tracking-transaction.md) | 📂 | 实现 |
| 多渠道映射 | — | `06-tracking-data/tracking-*.md` | 📂 | 维护 |
| 埋点变更规范 Skill | — | [tracking-event-ops-skill.md](../engineering-notes/06-tracking-data/tracking-event-ops-skill.md) | 📂 | 编写 |
| Dynamic Yield | [2791309383](https://castlery.atlassian.net/wiki/spaces/EC/pages/2791309383) | [tracking-dy.md](../engineering-notes/06-tracking-data/tracking-dy.md) | 📂 | 集成 |
| UTT 迁移 | — | [utt-impact-migration.md](../engineering-notes/06-tracking-data/utt-impact-migration.md) | 📂 | 推进 |

---

## 07 · 错误处理

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| HTTP 错误处理策略 | — | [http-error-handling-strategy.md](../engineering-notes/07-error-handling/http-error-handling-strategy.md) | 📂 P1 | 方案设计 |
| API 错误码使用 | — | [api-error-code-usage.md](../engineering-notes/07-error-handling/api-error-code-usage.md) | 📂 | 整理规范 |
| 回退购物车错误 | — | [back-to-cart-errors.md](../engineering-notes/07-error-handling/back-to-cart-errors.md) | 📂 | 实现 |

---

## 08 · 搜索与商品展示

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| PLP 排序点击反馈 | — | [plp-ranking-click-engagement.md](../engineering-notes/08-search-product/plp-ranking-click-engagement.md) | 📂 | 方案 |
| Sale Page PRD | [3489300950](https://castlery.atlassian.net/wiki/spaces/EC/pages/3489300950) | [salepage-prd.md](../engineering-notes/08-search-product/salepage-prd.md) | 📂 | 参与者 |
| 三方服务集成总览 | — | [third-party-integrations.md](../engineering-notes/08-search-product/third-party-integrations.md) | 📂 | 整理 |
| Other Pages | [2869854222](https://castlery.atlassian.net/wiki/spaces/EC/pages/2869854222) | — | 📂 | 迁移清单 |
| Blog Page | [3228074357](https://castlery.atlassian.net/wiki/spaces/EC/pages/3228074357) | — | 📂 | 参与者 |

---

## 09 · 工程规范与 AI 协作

| 主题 | Confluence | 本地软链 | 博客 | 我的角色 |
| --- | --- | --- | --- | --- |
| CMS 开发流程 | [3213590588](https://castlery.atlassian.net/wiki/spaces/EC/pages/3213590588) | — | 📂 | 维护 |
| CMS 集成实现 | [2776039625](https://castlery.atlassian.net/wiki/spaces/EC/pages/2776039625) | — | 📂 | 实现 |
| Storyblok 开发指南 | [2775711896](https://castlery.atlassian.net/wiki/spaces/EC/pages/2775711896) | — | 📂 | 撰写 |
| i18n 方案 | [2748842031](https://castlery.atlassian.net/wiki/spaces/EC/pages/2748842031) | — | 📂 | 参与者 |
| 多国家 ENV 合并 | [2790260837](https://castlery.atlassian.net/wiki/spaces/EC/pages/2790260837) | — | 📂 | 方案设计 |
| 时区管理 | [3100180738](https://castlery.atlassian.net/wiki/spaces/EC/pages/3100180738) | — | 📂 | 实现 |
| Agent Skills 体系 | — | [skills-readme.md](../engineering-notes/09-engineering-ai/skills-readme.md) | 📂 | 搭建 |
| 本地 HTTPS | — | [local-https-setup.md](../engineering-notes/09-engineering-ai/local-https-setup.md) | 📂 | 配置 |
| 隐私合规 | [3088515313](https://castlery.atlassian.net/wiki/spaces/EC/pages/3088515313) | [privacy-kit-guide.md](../engineering-notes/09-engineering-ai/privacy-kit-guide.md) | 📂 | 参与者 |

---

## 10 · 问题复盘

| 主题 | 本地软链 | 博客 | 备注 |
| --- | --- | --- | --- |
| 购物车埋点边界重构 | [cart-tracking-listener-refactor.md](../engineering-notes/10-issue-retrospective/cart-tracking-listener-refactor.md) | 📂 | listener 越界读 store |
| 价格展示 RSC 报错 | [price-display-render-error.md](../engineering-notes/10-issue-retrospective/price-display-render-error.md) | 📂 | Server Function 渲染 |
| 错误码清理 | [ec-error-codes-cleanup.md](../engineering-notes/10-issue-retrospective/ec-error-codes-cleanup.md) | 📂 | 历史遗留 |
| Web 1WF 修复 | [web-1wf-fix-report.md](../engineering-notes/10-issue-retrospective/web-1wf-fix-report.md) | 📂 | 线上故障 |

---

## 快速检索

按 Confluence Page ID 反查：

```
2583822375  → 设计文档汇总（根）
2890760193  → ISR + Redis（→ nextjs-isr-redis-shared-cache）
3022716976  → Joy UI ADR（→ joyui-to-tailwind-migration-adr）
3936616449  → Transaction Observability（→ transaction-observability-tech-plan）
3310452890  → Fortress CDD（→ design-system-cdd-practice）
2748481722  → Joyboy 架构（→ ecommerce-architecture-redesign）
2735243270  → 迁移计划（→ ecommerce-migration-plan 草稿）
```
