---
title: 电商产品学习1——学会构建用户画像
slug: building-user-profile
date: 2026-04-27
category: learning
tags:
  - GA4
  - 产品分析
  - 增长策略
  - 用户画像
status: published
excerpt: 了解用户画像，学习构建基础用户画像的方法，结合实际业务和数据进行实践
coverCard: /images/covers/study/date-analyse-cover.png
---

# 学会构建用户画像

## 1. 什么是用户画像

最近在了解用户画像时，发现公司内把“近期是否购买、访问频次、加购次数”等这类动态行为当成核心用户画像。

这些行为会变，比如一个用户今天是为购买用户，明天就变成购买用户；今天活跃明天也许就沉默。

如果只按照这样的行为进行划分，产品策略很可能会变为“向活跃的人群进行推送，向为购买人群进行发券”，看似数据化其实没有找到高净值用户人群。

我更主张使用相对稳定的静态唯独建立用户画像，比如：- 用户的城市、年龄、性别、家庭状态 - 用户的消费场景 - 用户在漏斗模型中处于的生命周期 - 用户偏好的类型、款式

好画像要满足几个必要条件：

1. 覆盖足够多的用户，不能只服务极小众人群
2. 用户群比较稳定
3. 不同画像用户群之前需求差异比较明显
4. 方便产品、运营推出策略

> 分析一个用户群体时，不要问“用户做了什么”，要先问“用户是谁，为什么会做这件事”

## 2. 结合用户画像训练自己的产品思维

1. 公司的目标是什么？

   我们作为一个面向海外的自营电商公司，产品的目标不是为了提升网站某个页面的点击率，而是提升客单价、订单转化和复购这些跟公司营收直接挂钩的指标

2. 哪些用户不是公司的目标用户？

   我们公司的家具主打设计感、生活感，所以不热爱生活的、对生活没有追求的人不是公司的目标用户，同时因为单品价格高，低收入人群不是公司的目标用户。

3. 哪些特征可以稳定区分用户？
   - 所在市场
   - 设备类型
   - 用户喜好
   - 使用场景
   - 处于的生命周期

## 3. 结合GA4实际数据进行分析

| 指标         |    数值 |
| ------------ | ------: |
| Revenue      |  16.12M |
| Transactions |   7,995 |
| Users        |   2.84M |
| Sessions     |   4.20M |
| Add to carts | 189,686 |
| Checkouts    |  40,766 |
| Purchases    |   7,995 |

整体漏斗模型：

Sessions 4.20M
-> Add to cart 189K
-> Checkout 40.8K
-> Purchase 8.0K

这说明我们公司当前最值得分析的不是“有没有用户”，而是：

哪些用户有真实家具购买意图？
他们在哪一步犹豫？
他们需要什么信息才能继续？

用文章逻辑映射到家具电商用户画像

先做 5 个可运营画像。

| 画像            | 稳定特征                                   | 典型行为                 | 产品问题                               |
| --------------- | ------------------------------------------ | ------------------------ | -------------------------------------- |
| 灵感浏览型      | Mobile、Paid Social、Organic Social        | 看很多商品，少加购       | 如何让用户保存灵感、形成 shortlist     |
| 高意图搜索型    | Google Search、Organic Search、Paid Search | 看 PDP、比较类目、加购   | 如何提高 PDP 信息完整度和信任          |
| 价格/配送确认型 | 已加购、进入 checkout                      | 卡在 shipping/payment 前 | 如何提前展示配送费、到货时间、退换政策 |
| 大件决策型      | Sofa、Bed、Dining Set                      | 浏览多、购买慢           | 如何帮助尺寸、风格、材质、空间匹配决策 |
| 老客/召回型     | Email、Direct、Abandoned cart              | RPS 高、购买率高         | 如何做补购、搭配购、弃购召回           |

这才是“可运营画像”：每一类都能对应产品动作。

## 4. 从 GA 数据看最值得做的方向

1. Mobile 是灵感入口，不一定是最终成交入口  
   GA 数据里 mobile sessions 很高，但 revenue/session 明显低于 desktop。产品上不要只盯 mobile checkout，而要强化：

- 收藏
- 最近浏览
- 对比
- 分享给家人
- 保存房间方案
- 跨设备继续购买

2. Paid Social 不该只用 purchase 评价  
   Paid Social 流量很大，但购买效率低。它更可能承担种草和需求唤醒。应该看：

- view_item
- item list click
- add_to_cart
- save / wishlist
- 后续 direct / email 回访购买

3. Sofa / Bed / Dining 是核心画像入口  
   高收入类目包括 Chaise Sectional Sofas、Bed Frames、Dining Table Sets。大件家具的问题不是“用户不知道买”，而是“用户不敢买”。产品要解决：

- 尺寸是否合适
- 材质是否可信
- 配送是否确定
- 搭配是否好看
- 退换是否安心
- 评价是否真实

4. Direct / Email / Affiliates 是高价值人群  
   这些渠道 revenue/session 高，说明它们更接近购买决策后段。应该重点做：

- abandoned cart flow
- price drop reminder
- back in stock reminder
- delivery date reminder
- bundle recommendation
- recently viewed continuation

## 5. 真正要学到的思维

产品新手容易陷入“看哪个指标跌了就优化哪个指标”。本篇文章提醒你：指标只是现象，画像才是抓手。

对我们来说，要从：

```text
为什么 checkout 转化低？
```

升级成：

```text
是哪类用户，在什么购买场景下，因为缺少什么决策信息，所以没有继续 checkout？
```

这就是从数据分析走向产品判断。
