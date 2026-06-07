# Frontend Confluence 迁移总结（内部）

> 根节点：[Frontend](https://castlery.atlassian.net/wiki/spaces/EC/pages/2404220943)（`2404220943`）  
> 扫描日期：2026-06-05  
> 策略：高价值技术方案 → 去企业化博客草稿；运营/CI 文档 → 仅本地镜像或跳过

---

## Frontend 子树结构（depth-1）

| 子树 | Page ID | 处理策略 |
| --- | --- | --- |
| 企业级前端基本架构 | `2534768670` | ⏭ 跳过 — 含品牌/仓库/测试账号，求职价值低 |
| EC-FE-Doc 文档汇总 | `3018227714` | 📂 待二次扫描 — 分类索引，非技术正文 |
| GitOps | `2533261325` | ⏭ 跳过 — CI/CD 操作手册 |
| Onepiece | `2337275935` | 📂 部分 — Legacy 性能文档可作补充，未批量迁移 |
| POS | `2578023035` | ⏭ 跳过 — 非 Web 主线 |
| Joyboy | `2705817935` | ✅ 部分导出 — Observability 总览已拉取 |
| 设计文档汇总 | `2583822375` | ✅ 已导出 76 篇 → `docs/confluence-export/` |

---

## 已发布博客（10 篇，迁移完成）

| 博客 slug | Confluence 来源 | 迁移原因 |
| --- | --- | --- |
| `ecommerce-architecture-redesign` | Joyboy 架构实现 `2748481722` | 展示 Senior 级 Monorepo + Clean Architecture 治理能力 |
| `design-system-cdd-practice` | Fortress CDD `3310452890` | **完全主导**项目，组件库 + 视觉回归是差异化亮点 |
| `joyui-to-tailwind-migration-adr` | ADR `3022716976` | ADR 写作能力 + RSC 时代样式体系决策 |
| `nextjs-isr-redis-shared-cache` | ISR+Redis `2890760193` | 性能/架构交叉，面试高频 |
| `transaction-observability-tech-plan` | Transaction Obs `3936616449` | 业务链路可观测性端到端设计 |
| `payment-pipeline-architecture` | Checkout 相关本地笔记 | 支付编排 + Server Action，交易域 ownership |
| `tracking-events-book-contract` | Events Book 本地笔记 | 数据契约思维，体现跨职能协作 |
| `http-error-handling-strategy` | 错误处理本地笔记 | 基础设施层设计，RTK Query 实战 |
| `ecommerce-migration-plan` | 迁移计划 `2735243270` | 大规模迁移节奏管控（草稿） |
| `joyboy-knowledge-map` | 76 篇归纳 | 知识体系可视化，求职作品集索引 |

---

## 本次新增博客草稿（8 篇）

| 博客 slug | Confluence 来源 | 迁移原因 |
| --- | --- | --- |
| `ecommerce-plp-refactor` | PLP 重构 `3347021873` | 电商核心列表页 + 搜索选型，补齐商品域空白 |
| `nextjs-web-app-architecture` | Joyboy web `2745466899` | App Router + RSC 完整架构，Senior 必答题 |
| `cross-border-i18n-strategy` | i18n `2748842031` + 实践 `2757329139` | 跨境电商必问，合并两篇为体系文 |
| `edge-middleware-auth-design` | Account/Login `3599499266` | Auth + Edge Middleware，安全与体验兼顾 |
| `observability-platform-harness` | Observability 总览 `3971416153` | 平台级可观测性 + ESLint 门禁，与交易文互补 |
| `multi-market-feature-flag` | 多市场特性 `3042443302` | DDD + Feature Flag，展示架构抽象能力 |
| `pdp-product-selector-indexing` | PDP Selector `3732668429` | 复杂变体 + CMS 建模 + O(1) 索引，体现 PDP 深度 |
| `ecommerce-timezone-management` | 时区 `3100180738` + 指南 `3059318840` | 多区域运营实战，细节体现工程成熟度 |

---

## 已导出但未发博客（下一轮 P3）

| Confluence | ID | 建议原因 | 优先级 |
| --- | --- | --- | --- |
| Checkout 技术方案 | `2748448779` | 与支付文互补，端到端交易 | 高 |
| CMS 集成实现 | `2776039625` | Headless CMS 集成经验 | 中 |
| CloudFront A/B Testing | `3022716930` | 边缘实验能力 | 中 |
| Sale Page PRD | `3489300950` | 运营页模板化 | 中 |
| 多国家 ENV 合并 | `2790260837` | 多市场配置治理 | 中 |
| API 错误码规范 | 本地 joyboy 笔记 | 与 HTTP 错误文配套 | 高 |
| Onepiece LCP 优化 | `2414084097` | 性能专题补充 | 低 |

---

## 明确跳过（不迁移为博客）

| 类别 | 示例 | 原因 |
| --- | --- | --- |
| GitOps/CI/CD | Release flow, How to rollback, Joyboy CI | 内部运维，无求职展示价值 |
| 企业信息 | 企业级前端基本架构、域名恢复方案 | 品牌/事故响应，违反去企业化 |
| 模板/草稿 | 设计文档模板、CookieYes Draft | 无技术内容 |
| Whiteboard | i18n locales 白板 | 不可导出正文 |
| POS 专用 | UMS 角色配置等 | 偏离 Web 主线 |
| Legacy 操作 | How to create PR, env 获取 | 入职手册，非架构能力 |

---

## 求职能力矩阵覆盖

| 能力域 | 已发布 | 本次草稿 | 缺口 |
| --- | --- | --- | --- |
| 架构/Monorepo | ✅ | ✅ web 架构 | — |
| 设计系统 | ✅ | — | Token 体系可补 |
| 渲染/性能 | ✅ ISR | ✅ PLP/PDP | LCP 专题 |
| 交易/支付 | ✅ | — | Checkout 全文 |
| 可观测性 | ✅ 交易 | ✅ 平台 | — |
| 多市场 | — | ✅ i18n/时区/Flag | ENV 合并 |
| 搜索/商品 | — | ✅ PLP/PDP | — |
| Auth | — | ✅ Middleware | — |
| 埋点/数据 | ✅ | — | — |
| 错误处理 | ✅ | — | API 错误码 |

---

## 文件位置速查

```
docs/confluence-export/pages/     # Confluence 镜像（含新增 Observability 总览）
content/posts/technical/2026/     # 博客文章（draft / published）
docs/internal/                    # 本总结 + 发布时间线 + 项目索引
```
