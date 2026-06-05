# Redux Listener 事件设计模式

> 适用场景：多交互入口 → 同一 API → 追踪事件大体相同但需区分来源 → 副作用不完全一致

---

## 1. 场景特征（以 Add to Cart 为例）

| 维度                 | 描述                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **交互入口多**       | PDP、推荐位、收藏夹、搜索结果、快速加车弹窗……都能触发加车                                   |
| **最终 API 一样**    | 所有入口最终都调用同一个 `addToCart` mutation                                               |
| **追踪事件大体相同** | 都需要发 `add_to_cart` 埋点，但 `source` 字段不同（`pdp` / `recommendation` / `wishlist`…） |
| **副作用不完全一样** | PDP 加车后可能跳转购物车页；推荐位加车后只刷新 badge；收藏夹加车后还要把该商品从收藏中移除  |

这种场景的核心矛盾是：

- 如果只监听 `addToCart.matchFulfilled`，listener 无法区分来源，也无法差异化处理副作用
- 如果在每个组件里各自写副作用逻辑，就失去了「统一入口」的价值

---

## 2. 推荐方案：Domain Event 作为协调枢纽

### 核心思路

```
组件（知道上下文）
  → 调用 API
  → API 成功后 dispatch Domain Event（携带完整上下文）
    → Listener A：统一处理追踪（读 event payload，发埋点）
    → Listener B：处理通用副作用（刷新购物车 badge）
    → 组件自身 or 特定 Listener：处理场景专属副作用
```

**组件负责提供上下文，Listener 负责响应，职责明确，互不侵入。**

---

## 3. 实现结构

### Step 1：定义 Domain Event（携带完整追踪上下文）

```ts
// libs/modules/cart/domain/src/event/added-to-cart.event.ts
import { createAction } from '@reduxjs/toolkit';

export type AddToCartSource = 'pdp' | 'recommendation' | 'wishlist' | 'search' | 'quick-add';

export const addedToCartEvent = createAction<{
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  source: AddToCartSource; // 交互来源，由组件提供
  campaignId?: string; // 推荐位专属，可选
}>('cart/itemAdded');
```

### Step 2：组件调用 API 成功后显式 dispatch event

```ts
// 商品详情页（PDP）
const handleAddToCart = async () => {
  const result = await addToCartMutation({ productId, quantity }).unwrap();
  dispatch(
    addedToCartEvent({
      productId,
      productName: product.name,
      price: product.price,
      quantity,
      source: 'pdp', // PDP 知道自己是 pdp
    })
  );
};

// 推荐位组件
const handleAddToCart = async () => {
  const result = await addToCartMutation({ productId, quantity: 1 }).unwrap();
  dispatch(
    addedToCartEvent({
      productId,
      productName: product.name,
      price: product.price,
      quantity: 1,
      source: 'recommendation', // 推荐位知道自己是 recommendation
      campaignId: campaign.id,
    })
  );
};
```

### Step 3：Listener 按职责拆分

#### 3a. 追踪 Listener（统一入口，全场景覆盖）

```ts
// 响应所有来源的加车事件，source 字段由 event payload 提供，无需 listener 判断
startListening({
  matcher: addedToCartEvent.match,
  effect: (action) => {
    const { productId, productName, price, quantity, source, campaignId } = action.payload;
    trackingService.send('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
      interaction_source: source,
      campaign_id: campaignId,
    });
  },
});
```

#### 3b. 通用副作用 Listener（所有场景共享）

```ts
// 所有加车成功后都需要刷新购物车 badge
startListening({
  matcher: addedToCartEvent.match,
  effect: async (action, { dispatch }) => {
    await dispatch(getCartSummary.initiate(undefined, { forceRefetch: true }));
  },
});
```

#### 3c. 场景专属副作用：由组件自身处理

```ts
// 收藏夹加车后需要移除收藏，这个逻辑是收藏夹场景独有的
// 不放进 listener，直接在组件回调中处理
const handleAddToCart = async () => {
  await addToCartMutation({ productId, quantity: 1 }).unwrap();
  dispatch(addedToCartEvent({ ..., source: 'wishlist' }));
  // 场景专属副作用：从收藏夹中移除
  await removeFromWishlist(productId);
};
```

> **判断依据**：副作用是否「对其他场景也有意义」。
>
> - 刷新 badge → 所有场景都需要 → 放 Listener
> - 移除收藏 → 只有 wishlist 场景需要 → 留在组件

---

## 4. 方案对比

| 方案                                     | 追踪统一入口 | 副作用差异化    | 组件侵入度                | 适用条件                                 |
| ---------------------------------------- | ------------ | --------------- | ------------------------- | ---------------------------------------- |
| 直接监听 `addToCart.matchFulfilled`      | ✅           | ❌ 无法区分来源 | 低                        | 追踪无需区分来源，副作用完全一致         |
| 组件内各自处理                           | ❌ 分散      | ✅              | 高                        | 场景少、逻辑简单                         |
| **Domain Event + Listener 分层**（推荐） | ✅           | ✅              | 低（只需 dispatch event） | 多入口、需区分来源、副作用有共有也有独有 |

---

## 5. 决策树

```
同一 API 被多个场景调用
│
├── 追踪 / 副作用对所有场景完全一致？
│   └── 是 → 直接监听 endpoint.matchFulfilled，简单直接
│
└── 需要区分来源，或副作用存在差异？
    └── 是 → 定义 Domain Event（createAction），组件 dispatch
              ├── 共有副作用 → Listener 统一处理
              └── 场景专属副作用 → 组件自身处理（不进 listener）
```

---

## 6. 关键原则

**1. 组件负责提供上下文，Listener 负责响应**
组件是唯一知道「当前交互来自哪里」的地方，不要让 Listener 去猜（读 URL、读 state 推断来源），应该让组件主动说明。

**2. Listener 不做场景判断**
如果一个 Listener 的 effect 里出现了 `if (source === 'pdp') { ... } else if ...`，说明职责没有分离好，应该拆分为独立 Listener 或交还给组件处理。

**3. Domain Event 是契约**
`addedToCartEvent` 的 payload 类型就是业务契约——组件承诺提供这些字段，Listener 依赖这些字段。修改 payload 类型时 TypeScript 会在所有 dispatch 处报错，重构安全。

**4. 避免在 Listener 里读 URL / pathname**
Listener 应该通过 Redux state 或 event payload 获取上下文，而不是通过 `window.location`。URL 感知会让 Listener 与路由耦合，路由变化就需要同步修改 Listener。

---

## 7. 与本项目现有模式的对照

| 现有用法                                                                           | 适用性评估                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `shippingMethodUpdatedEvent = updateCheckoutShippingMethod.matchFulfilled`         | ✅ 合理：该 endpoint 只在一个场景调用，意图明确                                                                                                |
| `checkoutUpdatedEvent = isAnyOf(多个 endpoint.matchFulfilled)`                     | ✅ 合理：这些 endpoint 触发后都需要同一个副作用（刷新 checkout）                                                                               |
| `isAnyOf(createCustomerAddressV2.matchFulfilled, ...)` → refetch checkout 地址列表 | ❌ 有问题：该 endpoint 被 checkout shipping 和 payment billing 两个场景复用，listener 无法区分意图，已改为 `checkoutShippingAddressSavedEvent` |
