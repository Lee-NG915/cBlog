# Promotion Module - 需求说明

> 文档状态: 草稿
> 创建日期: 2026-03-25
> 负责人: Abby Wang

---

## 1. Promotion 类型

| 类型          | 子类型         | 当前状态                      |
| ------------- | -------------- | ----------------------------- |
| Coupons       | -              | 已实现，需重构                |
| Gifts         | Campaign Gifts | 已实现（显示 + 加车），需重构 |
| Gifts         | Coupon Gifts   | 已实现（显示 + 加车），需重构 |
| Free Shipping | -              | 已实现，需重构                |

---

## 2. 数据来源

### 2.1 Coupons

- 数据路径：`cartRoot.summary.couponList` 或 `checkoutRoot.summary.couponList`

### 2.2 Gifts

#### Campaign Gifts

- 数据路径：`cartRoot.giftPools[0].gifts`
- 字段说明：每个 gift 包含 `variantId`，需通过 `variantId[]` 调接口获取完整商品信息，用于 GiftsGallery 展示
- 触发时机：用户点击「选择 free gift」按钮时，才发起接口请求
- 缓存策略（软缓存）：
  - 若 `variantIds` 未变化，不重新请求
  - 以下情况重置缓存：页面刷新 / gift 加车成功

#### Coupon Gifts

- 触发条件：用户选中 gift 类型 coupon 时，（`coupon.voucherType === 'Free Gift'`）
- 数据来源：满足条件时，通过 coupon code 单独调接口获取 gifts 列表
- 缓存策略（软缓存）：
  - 以 `couponCode` 为 key 缓存 gifts 数据
  - 不随弹窗打开/关闭重新请求
  - 以下情况重置缓存：页面刷新 / gift 加车成功
- 交互：用户选中 gift 类型 coupon 时，打开包含 GiftsGallery 的弹窗供用户选择

### 2.3 Free Shipping

- 数据路径：`cartRoot.shippingFee.[xxxxx]`（暂时预留，待补充）

---

## 3. 重构目标

1. 梳理并统一数据流，开发相关逻辑
2. 数据层与 UI 组件层解耦——数据处理逻辑不放在 UI 组件内
3. UI 组件本次不开发，只设计数据层方案

---

## 4. 开发思路

### 4.1 整体分层

参考现有项目结构，各层职责如下：

```
domain/
  ├── api/       → 原始接口调用（axios/fetch 封装）
  ├── entity/    → 类型定义（Coupon、Gift、GiftPool 等）
  ├── slice/     → Redux state 定义
  ├── event/     → 领域事件定义
  ├── helper/    → 纯逻辑工具函数
  └── adapter/   → 数据格式转换

services/
  ├── *.helper   → 跨模块数据组合逻辑
  └── *.listener → 监听事件，触发副作用（如缓存失效）

components/
  ├── hook/      → React hooks（消费 domain/services 数据，供 UI 使用）
  └── lib/       → UI 组件（本次暂不开发）
```

### 4.2 数据流设计

```
cartRoot / checkoutRoot
        │
        ▼
  [components/hook 层]
  ┌─────────────────────────────────────────────┐
  │  use-promotion-data.ts                       │
  │  ├── coupons        ← summary.couponList     │
  │  ├── campaignGifts  ← giftPools[0].gifts     │
  │  └── freeShipping   ← shippingFee.xxxxx      │
  └─────────────────────────────────────────────┘
        │
        ▼
  [按需派生 hooks]
  ├── use-campaign-gifts.ts(variantIds)   ← 懒加载 + 软缓存
  └── use-coupon-gifts.ts(couponCode)     ← 懒加载 + 软缓存（couponCode 为 key）
        │
  [domain/api 层]
  ├── gift.api.ts  ← 通过 variantIds 获取 campaign gifts 详情
  └── gift.api.ts  ← 通过 couponCode 获取 coupon gifts 列表
        │
        ▼
  UI 组件（GiftsGallery / CouponList / FreeShippingBanner 等）消费数据
```

### 4.3 软缓存方案

两处 gifts 数据均需要软缓存，在 `services/gift.helper.ts` 中统一管理：

```ts
// 伪代码结构
type GiftsCacheKey = string; // variantIds.join(',') 或 couponCode

const giftsDetailCache = new Map<GiftsCacheKey, GiftDetail[]>();

function getGiftsDetail(key: GiftsCacheKey, fetcher: () => Promise<GiftDetail[]>) {
  // 1. 命中缓存 → 直接返回
  // 2. 未命中 → 调 fetcher，结果写入缓存
  // 3. 暴露 invalidate(key) 供 listener 调用
}
```

缓存失效触发点（由 `services/promotion.listener.ts` 监听事件后调用 invalidate）：

- `gift add-to-cart success` 事件 → invalidate 对应 key
- 页面刷新 → 内存缓存自动清空（无需额外处理）

### 4.4 Campaign Gifts vs Coupon Gifts 对比

| 维度     | Campaign Gifts             | Coupon Gifts                       |
| -------- | -------------------------- | ---------------------------------- |
| 触发条件 | 用户点击「选择 free gift」 | coupon.voucherType === 'Free Gift' |
| 缓存 key | `variantIds.join(',')`     | `couponCode`                       |
| 缓存失效 | gift 加车成功 / 页面刷新   | gift 加车成功 / 页面刷新           |
| 入口 UI  | 内嵌在 cart 页             | 弹窗（GiftsGallery Modal）         |

### 4.5 文件规划

#### domain 层

```
domain/src/
├── api/
│   └── gift.api.ts              # gifts 详情接口（campaign variantIds 查询 + coupon code 查询）
├── entity/
│   ├── gift.entity.ts           # 补充 GiftPool、GiftDetail 类型（已有文件扩展）
│   └── coupon.entity.ts         # 补充 voucherType 枚举（已有文件扩展）
├── helper/
│   └── promotion.helper.ts      # 纯函数：isCouponGift、isCampaignGift 等判断
└── event/
    └── gift-added-to-cart.event.ts  # gift 加车成功事件（供 listener 监听）
```

#### services 层

```
services/src/
├── gift.helper.ts               # 软缓存管理：getGiftsDetail、invalidateGiftsCache（已有文件扩展）
└── promotion.listener.ts        # 监听 gift-added-to-cart 事件 → 触发缓存失效（已有文件扩展）
```

#### components 层（hooks，UI 本次暂不开发）

```
components/src/hook/
├── use-promotion-data.ts        # 聚合 hook：从 cartRoot/checkoutRoot 提取 promotion 数据
├── use-campaign-gifts.ts        # campaign gifts hook：懒加载 + 软缓存
└── use-coupon-gifts.ts          # coupon gifts hook：懒加载 + 软缓存（couponCode 为 key）
```

---

## 5. 待确认事项

- [ ] `cartRoot.shippingFee` 的具体字段结构（free shipping 数据路径）
- [ ] `gift.api.ts` 中获取 gifts 详情的接口地址及入参格式
- [ ] campaign gifts 与 coupon gifts 是否复用同一个 GiftsGallery 组件，或各自独立
- [ ] gift 加车成功事件的命名及触发方式（与现有 event 体系对齐）

---

## 6. 参考资料

- ClickUp: TODO
- 设计稿: TODO
- API 文档: TODO
