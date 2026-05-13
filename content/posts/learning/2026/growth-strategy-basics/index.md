---
title: 增长策略基础
slug: growth-strategy-basics
date: 2026-05-11
category: learning
tags:
  - GA4
  - 产品分析
  - 增长策略
status: published
excerpt: 基于 GA4 业务数据拆解收入增长目标，把收入目标转化为关键行为、用户特征和产品动作假设。
---

# 增长策略基础

**公司目标 G：提升可持续购买收入**
参考你给的文章框架，不直接从“收入”下手，而是拆成关键行为 E，再看哪些用户特征 X 会显著影响这些行为。

来源：[我在产品分析中怎么做数据分析](https://www.woshipm.com/share/6031746.html)

本次真实数据口径：GA4 Global property，`2026-04-01` 至 `2026-04-30`。

**1. 目标拆解**

X 的核心收入公式可以先写成：

```text
Revenue = Sessions
        × 商品兴趣率
        × 加购率
        × 结账启动率
        × 支付完成率
        × AOV
```

GA4 对应行为链路：

| 业务问题                   | GA4 行为                                     |
| -------------------------- | -------------------------------------------- |
| 用户有没有明确家居购买兴趣 | `view_item`                                  |
| 用户是否形成候选清单       | `add_to_cart`                                |
| 用户是否进入购买决策       | `begin_checkout` / `checkouts`               |
| 用户是否愿意提交配送/支付  | `add_shipping_info` / `add_payment_info`     |
| 用户是否完成商业结果       | `purchase` / `transactions` / `totalRevenue` |

**2. 4 月整体情况**

4 月 Global：

| 指标                  |      数值 |
| --------------------- | --------: |
| Revenue               |  `16.12M` |
| Transactions          |   `7,995` |
| Total users           |   `2.84M` |
| Sessions              |   `4.20M` |
| Revenue / session     |    `3.84` |
| Session purchase rate |   `0.19%` |
| Add to carts          | `189,686` |
| Checkouts             |  `40,766` |
| Ecommerce purchases   |   `7,995` |

关键结论：X 当前不是“没有流量”，而是流量到购买意图的转化效率偏低。`add_to_cart -> checkout` 约 `21.5%`，`checkout -> purchase` 约 `19.6%`，说明从加购到真正下单仍有明显损耗。

**3. 特征 X：哪些用户更有价值**

按渠道看，收入集中但效率差异很大：

| 渠道           | 收入占比 | Revenue/session | Session purchase rate |
| -------------- | -------: | --------------: | --------------------: |
| Direct         |    35.0% |           14.48 |                 0.74% |
| Cross-network  |    23.3% |            3.99 |                 0.19% |
| Organic Search |     6.9% |            4.84 |                 0.26% |
| Affiliates     |     6.4% |           13.28 |                 0.59% |
| Paid Search    |     6.1% |            6.88 |                 0.38% |
| Email          |     5.4% |           15.15 |                 0.77% |
| Paid Social    |     5.2% |            0.53 |                 0.02% |

产品含义：

- `Direct / Email / Affiliates` 是高意图人群，适合做复购、弃购召回、价格/库存提醒、个性化推荐。
- `Paid Social` 流量很大，但购买效率很低，更像上游种草，不应该只用 last-click revenue 评价。
- `Paid Search` 和 `Organic Search` 是中高意图入口，适合优化 landing page、类目页、PDP 信息完整度。

**4. 设备特征**

| 设备    | 收入占比 | Sessions | Revenue/session | Session purchase rate |
| ------- | -------: | -------: | --------------: | --------------------: |
| Desktop |    55.0% |     778K |           11.39 |                 0.52% |
| Mobile  |    43.4% |    3.28M |            2.14 |                 0.12% |

Mobile 承担大部分流量，但 desktop 的单 session 价值约是 mobile 的 `5.3x`。这很像高客单家具购买路径：用户在 mobile 浏览灵感，最后在 desktop 或更稳定场景完成决策。

产品机会不是简单“提升 mobile checkout”，而是：

- mobile 先服务“收藏、对比、测量、风格筛选、加入 shortlist”
- desktop / email / retargeting 承接“决策、配送、支付”
- 打通跨设备继续购买，比如保存空间方案、最近浏览、cart reminder

**5. 商品特征**

收入最高类目：

| 类目                          | Item revenue | Items viewed | Items purchased |
| ----------------------------- | -----------: | -----------: | --------------: |
| Chaise Sectional Sofas        |        3.75M |         516K |           1,292 |
| Bed Frames                    |        2.58M |         684K |           1,439 |
| Rectangular Dining Table Sets |        1.31M |         222K |             614 |
| Sofa Sets                     |        1.22M |         507K |             340 |
| Extendable Dining Table Sets  |        1.00M |         169K |             373 |
| Dining Chairs                 |        0.62M |         114K |           2,039 |

产品判断：

- Sofa / Bed / Dining 是 X 的核心收入类目。
- `Dining Chairs` 单价低但购买量高，适合做 bundle、cross-sell、room set 搭配。
- `Chaise Sectional Sofas` 收入最高，但 purchase-to-view 低，说明它是强兴趣高犹豫品类，应该重点优化尺寸、面料、配送周期、空间适配和真实用户图。
- `L-Shape Sectional Sofas` 加购率高但购买率低，值得单独排查：价格、库存、配送、颜色/尺寸选择、checkout 后成本暴露。

**6. 映射成产品分析假设**

优先级我会这样排：

| 假设                                | 数据依据                                           | 产品动作                                              |
| ----------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Mobile 是灵感入口，不是最终购买入口 | Mobile sessions 3.28M，但 revenue/session 仅 2.14  | 强化收藏、对比、最近浏览、跨设备召回                  |
| 高意图渠道应该吃更多转化预算        | Email / Direct / Affiliates RPS 高                 | 弃购、降价、库存、配送时效 reminder                   |
| Paid Social 需要按上游行为评价      | Paid Social sessions 1.59M，但 purchase rate 0.02% | 用 view_item、save、add_to_cart 分层，不只看 purchase |
| 大件家具 PDP 信息不足会阻塞购买     | Sofa/Bed 高浏览高收入但转化链路长                  | 尺寸可视化、空间搭配、材质对比、交付成本前置          |
| Bundle 能提升 AOV 和决策效率        | Dining Chairs 购买量高                             | 餐桌椅套装、客厅套装、卧室套装推荐                    |

**下一步建议**

下一轮分析不要只看 Global，应该建一个 X 专用分析模型：

```text
目标：提升收入
行为：view_item -> add_to_cart -> begin_checkout -> purchase
特征：市场 × 渠道 × 设备 × 类目 × 新老用户 × 价格带
输出：每个特征组合的机会值 = 流量规模 × 转化差距 × AOV
```

这会比单纯看报表更接近产品决策：我们不是问“哪里收入高”，而是问“哪个用户群的哪个行为最值得被产品改变”。
