---
title: 电商前端工程知识图谱：从架构到实现的交互地图
slug: joyboy-knowledge-map
date: 2026-06-04
updatedAt: 2026-06-05
category: technical
tags:
  - Knowledge Graph
  - Architecture
  - Index
  - Interactive
status: published
excerpt: 把 76 篇设计文档归纳成可交互的三层知识图谱：分层全景、领域关系、入职阅读路径。点击节点跳转到已整理的工程笔记。
interactive: knowledge-graph
---

# 前言

整理 Confluence 设计文档和本地工程资料时，我发现「文档很多」不是最大的问题，**不知道从哪看起**才是。

这份交互地图把资料按四个层级归纳——**架构 → 模块 → 业务域 → 实现细节**，并标出已迁移到个人笔记的主题。你可以：

- 在**分层全景**里按层级浏览整体结构，点击节点看摘要和关联
- 在**域关系**里理解 architecture、migration、transaction 等方向如何串联
- 在**阅读路径**里按角色（前端基础 / 迁移专项 / 业务链路）走推荐顺序

下方嵌入的是可交互组件（非静态截图）。如果加载较慢，文末附有 Mermaid 静态备份图。

---

## 怎么用这张地图

1. **先点「分层全景」** — 建立整体心智模型，从架构层节点开始浏览
2. **用顶部 Domain 筛选** — 缩小到 payment、observability 等单一方向
3. **下方详情面板** — 有「已有笔记」标签的节点可跳到对应工程札记
4. **入职同学习路径** — 切换到「阅读路径」Tab，按角色选路线

> 完整文档索引在仓库 `docs/confluence-export/INDEX.md`（本地查阅，不公开发布企业链接）。

---

## 静态备份：分层结构

```mermaid
flowchart TB
  subgraph L1["架构层"]
    A2[多市场与环境]
    A3[客户端架构]
  end
  subgraph L2["模块层"]
    M1[大规模迁移]
    M2[CMS 集成]
    M3[平台能力]
    M4[可观测性体系]
    M5[设计系统]
  end
  subgraph L3["业务域"]
    B1[商品与列表]
    B2[交易与结账]
    B3[账户与权限]
    B4[运营内容页]
  end
  subgraph L4["实现细节"]
    I1[ISR + 共享缓存]
    I2[交易链路观测]
    I3[样式体系迁移]
    I4[埋点事件契约]
    I5[HTTP 错误分层]
  end
  A3 --> M1 & M2 & M4 & M5
  A2 --> M3
  A3 --> M5
  M1 --> I1
  M2 --> B4
  M3 --> B1
  M4 --> I2
  M5 --> I3
  B1 --> I1
  B2 --> I2 & I4 & I5
```

---

## 关联阅读

- [工程实践札记索引](/posts/engineering-practice-hub/) — 全方向文字版目录
- [企业级电商前端平台架构重构](/posts/ecommerce-architecture-redesign/) — 地图起点
