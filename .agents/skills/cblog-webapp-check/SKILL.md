---
name: cblog-webapp-check
description: 验证 cBlog 博客及笔记应用的浏览器行为，包括 Markdown 粘贴、阅读预览、保存与重载；优先复用项目 Playwright 测试。
---

# cBlog 网页行为验证
先查看 package.json、目标应用和现有测试，明确验证的是 apps/web、apps/admin 还是 apps/knowledge。

## 项目入口
- pnpm dev:web：博客开发。
- pnpm knowledge:dev 与 pnpm knowledge:ui：以 docs/knowledge-platform/04-local-runbook.md 的当前启动方式为准。
- pnpm knowledge:e2e：使用 apps/knowledge/playwright.config.ts，当前基准地址为127.0.0.1:8787。运行前确认服务与测试数据要求。
这些是调查入口，不是每次都要全部执行的命令。

## 验证方法
先复现用户动作并观察渲染DOM，再决定操作与断言。复用现有 TypeScript Playwright，不为使用上游示例额外安装 Python 浏览器栈。
等待目标元素、请求结果或应用就绪状态；不要把 networkidle 当成所有页面必然可达的唯一就绪条件。
Markdown问题分开验证：粘贴后的源文本、阅读预览中的标题/表格/链接、保存结果、刷新后内容。编辑态显示井号本身不必然是缺陷。
用隔离测试笔记，避免覆盖用户已有文章。修改范围需要时验证桌面/移动显示、控制台错误和持久化；纯技能文档修改不触发全站测试。

## 结果
记录目标页面、操作、预期、实际、截图/日志及检查结果。未运行写未运行；构建通过不能替代浏览器行为通过。无法启动时给出具体阻塞及已完成的检查。

## 来源与适配
本技能为 cBlog 项目适配版，不是上游原版安装。来源版本、分类及取舍见 [筛选报告](../../../docs/skill-selection-2026-09-23.md)。

## 成果同步收尾
本任务产出本地审阅通过的调研、梳理或交付文档及配套图片时，按 [cblog-notion-sync](../cblog-notion-sync/SKILL.md) 同步到 Notion并核验；未通过的草稿保持待审，不作为已通过成果同步。
