---
title: 复杂 PDP 商品选择器：CMS 建模与服务端倒排索引
slug: pdp-product-selector-indexing
date: 2026-05-28
updatedAt: 2026-06-04
category: technical
tags:
  - PDP
  - CMS
  - Next.js
  - Performance
status: draft
excerpt: 复盘家具电商复杂变体 PDP：Layout → Configuration → Attribute 三级联动，用 Headless CMS 建模 + 服务端预计算倒排索引实现 O(1) slug 查找与 SEO 友好。
---

# 前言

家具电商的 PDP 不是「选一个颜色」那么简单——同一系列可能有 L 型/一字型布局、带脚凳/不带脚凳配置、多种材质 SKU。我参与了 Product Selector Phase 1 的方案设计与实现：**用 CMS 严格建模 + 服务端预计算索引**，在复杂变体场景下保持较短 TTFB，同时让爬虫能遍历全部有效 SKU URL。

---

## 数据模型（四级嵌套）

```
ProductSpuGroup（系列）
 └── ProductLayout（布局形态，如 L-Shape）
      └── ProductCategoryGroup（配置，如 Sofa + Ottoman）
           └── ProductSpu（叶子 SKU，含 slug / 材质标签 / 图）
```

CMS 约束层级深度，避免运营配置出「不可达组合」。每个叶子 SKU 有独立 slug，支持 SEO 落地页。

---

## 核心机制：服务端预计算索引

摒弃客户端实时遍历全量变体树的做法。构建时（或 CMS Webhook 触发时）生成：

1. **slug → 节点路径** 哈希表（O(1) 查找）
2. **属性组合 → 可用 slug 列表** 倒排索引（联动筛选）

页面请求只做索引查表 + RSC 渲染，不在热路径上 DFS 整棵树。

---

## 三级联动 UX

| 层级 | 用户看到 | 技术行为 |
| --- | --- | --- |
| Layout | 布局形态 | 切换后重置下级选项 |
| Configuration | 具体配置 | 过滤不可用材质 |
| Attribute | 材质/颜色 | 映射到叶子 slug，更新 URL |

URL 与选中态同步：`/sofa/dawson-l-shape/grey-fabric` — 可分享、可收录。

---

## 与 ISR 的配合

索引产物可缓存进 Redis（与 [ISR 方案](/posts/nextjs-isr-redis-shared-cache/) 同一套基础设施）。CMS 发布 Webhook → 重建索引 → 精准失效相关 PDP 页面，避免全站刷新。

---

## 关联阅读

- [PLP 重构方案](/posts/ecommerce-plp-refactor/)（草稿）
- [ISR + Redis 共享缓存](/posts/nextjs-isr-redis-shared-cache/)
