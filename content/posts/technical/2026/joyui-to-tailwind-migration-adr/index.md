---
title: ADR：从 Joy UI 迁移至 Tailwind CSS 的架构决策记录
slug: joyui-to-tailwind-migration-adr
date: 2026-05-19
category: technical
tags:
  - ADR
  - Tailwind CSS
  - Design System
  - React Server Components
  - Joy UI
status: draft
excerpt: 记录从 MUI Joy UI 迁移至 Tailwind CSS 的完整架构决策过程，核心驱动力是 React Server Components (RSC) 架构下的运行时样式冲突与 Bundle 优化诉求。
---

# ADR：从 Joy UI 迁移至 Tailwind CSS 的架构决策记录

## 一、元信息与决策背景

### 1.1 提案基本信息

- 提议时间与目标完成时间
- 决策参与者与角色
- 文档状态流转（Proposed → Accepted / Rejected）

### 1.2 决策驱动力

- 新架构对 RSC 的强依赖
- 现有样式方案的技术债

## 二、现状问题深度分析

### 2.1 React Server Components 架构冲突

- Joy UI 强制的 `'use client'` 边界
- 运行时 theme 上下文对 RSC 选择性水合的破坏
- 静态样式仍需客户端 Bundle 的浪费

### 2.2 数据流与性能问题

- 服务端数据获取与客户端样式计算的时序冲突
- 首屏 JavaScript 体积膨胀

## 三、技术选型对比

### 3.1 候选方案评估

- 保留 Joy UI + 妥协方案
- Tailwind CSS + 原子化样式
- 其他 CSS-in-JS 替代方案（如 Panda CSS）

### 3.2 评估维度

- RSC 兼容性
- 运行时开销
- 构建产物体积
- 开发者体验（DX）
- 设计 Token 迁移成本

## 四、迁移方案设计

### 4.1 渐进式替换策略

- 按页面/组件分批迁移
- 共存期的样式隔离机制

### 4.2 设计 Token 体系重建

- Tailwind 配置扩展与自定义主题
- 与企业级电商组件库的 Token 对齐

## 五、风险与缓解措施

### 5.1 主要风险

- 视觉回归风险
- 开发团队学习成本
- 第三方组件依赖兼容

### 5.2 缓解方案

- 视觉回归测试覆盖
- 内部培训与文档建设

## 六、决策结论与后续行动

- 最终决策与理由
- 关键里程碑与责任人
- 复盘与回顾机制
