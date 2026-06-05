# 工程实践资料索引（本地软链）

本目录是工程实践大纲的**本地资料枢纽**。所有文件均为软链，指向 `docs/joyboy/` 下的原始文档、SKILL 与项目规范，不复制内容，方便在 IDE 中一键跳转。

> **GitHub 网页限制**：软链在 GitHub 上只会显示一行目标路径（如 `../../joyboy/docs/xxx.md`），**不会渲染正文**。在线阅读请直接打开 `docs/joyboy/` 下的源文件；博客索引里的资料链接已指向源文件路径。

## 目录结构

| 目录 | 方向 | 说明 |
| --- | --- | --- |
| [01-architecture](./01-architecture/) | 架构与边界治理 | Clean Architecture、模块依赖、事件模式 |
| [02-rendering-performance](./02-rendering-performance/) | 渲染与性能 | ISR、缓存、PLP/PDP、本地开发性能 |
| [03-design-system](./03-design-system/) | 设计系统 | 组件库、样式迁移、格式化规范 |
| [04-transaction-payment](./04-transaction-payment/) | 交易与支付 | Checkout、Stripe、延保、支付 ADR |
| [05-observability](./05-observability/) | 可观测性 | Sentry、交易链路监控、Runbook |
| [06-tracking-data](./06-tracking-data/) | 埋点与数据契约 | Events Book、多渠道 trigger、AI 操作规范 |
| [07-error-handling](./07-error-handling/) | 错误处理 | HTTP 策略、业务错误码、回退购物车 |
| [08-search-product](./08-search-product/) | 搜索与商品 | PLP 排序、Sale Page、三方集成 |
| [09-engineering-ai](./09-engineering-ai/) | 工程规范与 AI 协作 | Agent Skills、PR 规范、本地 HTTPS |
| [10-issue-retrospective](./10-issue-retrospective/) | 问题复盘 | 线上问题修复、边界重构记录 |

## 与博客的关系

- **在线阅读**：见博客文章 [工程实践札记索引](/posts/engineering-practice-hub/)
- **本地深挖**：从本目录软链进入原始资料，再逐步迁移为去企业化的个人笔记
- **内部索引**（不公开，仅本地）：`docs/internal/project-notes-index.md` — 含 Confluence 页面映射与迁移状态
- **迁移规范**：遵循 `.agents/skills/tech-doc-migration/SKILL.md`

## 维护约定

1. 新增原始资料时，在对应子目录补软链，并同步更新博客大纲的状态列。
2. 某主题完成博客迁移后，在大纲中把链接从「资料源」切换为「已发布文章」。
3. 软链使用相对路径，确保 `docs/engineering-notes/` 与 `docs/joyboy/` 同步提交。
