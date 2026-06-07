---
title: 多区域电商时区管理：UTC 存储 + 本地化展示的前端实践
slug: ecommerce-timezone-management
date: 2026-06-04
updatedAt: 2026-06-05
category: technical
tags:
  - Timezone
  - Next.js
  - E-commerce
  - i18n
status: draft
excerpt: 复盘跨境电商时区策略：全链路 UTC 存储、前端 Luxon/Day.js 本地化展示、促销倒计时与夏令时边界，以及 B 端/C 端/服务端的分工。
---

# 前言

多市场电商的时区问题表面是「显示不对」，本质是**存储、传输、展示三层是否一致**。我负责梳理了前端侧的时区管理规范：全链路 UTC 存储，UI 按用户市场时区本地化，促销倒计时和订单时间轴在同一套规则下运行。

---

## 核心原则

1. **存储用 UTC**：数据库与 API 返回 ISO 8601 或毫秒时间戳
2. **展示用市场时区**：新加坡 UTC+8、美东 UTC-5（含 DST）等
3. **计算在服务端**：促销生效/失效判定尽量服务端完成，前端只做展示

```
后端: time.Now().UTC().UnixMilli()  → 1737537365104
前端: DateTime.fromMillis(ts).setZone("Asia/Singapore").toLocal()
```

---

## 夏令时（DST）

部分市场有 DST 切换——时区偏移不是固定整小时。前端必须用 IANA 时区名（`America/New_York`），不要用固定 `UTC-5`，否则每年 3/11 月促销时间会错 1 小时。

---

## 多端分工

| 端 | 存储 | 展示 |
| --- | --- | --- |
| B 端管理系统 | UTC | 按运营人员习惯可选时区 |
| C 端 Web/POS | 不存时间 | 按市场配置渲染 |
| API | UTC | 返回带时区信息的 ISO 字符串 |

---

## 前端场景清单

- **促销倒计时**：目标时刻转 UTC 比较，显示按本地时区格式化
- **订单时间轴**：列表统一格式 `YYYY-MM-DD HH:mm z`
- **预约配送**：日期选择器绑定市场时区，提交前转 UTC
- **SEO/结构化数据**：`datePublished` 用 ISO 8601 带偏移

---

## 与 i18n 的关系

时区不是翻译问题。`locale` 管文案，`region` 管时区/币种——在配置层绑定，例如 `region=sg → Asia/Singapore`。

---

## 关联阅读

- [跨境电商 i18n 方案](/posts/cross-border-i18n-strategy/)（草稿）
- [多市场 Feature Flag](/posts/multi-market-feature-flag/)（草稿）
