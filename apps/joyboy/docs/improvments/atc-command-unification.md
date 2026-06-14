# ATC Command 统一优化计划

> 文件路径：`libs/modules/product/services/src/product.helper.ts`
> 创建日期：2026-04-15
> 状态：P2 已完成（2026-04-15）

---

## 背景

`product.helper.ts` 中存在三个加车入口，历史上各自独立演化，导致功能覆盖不一致、行为有差异，已出现如下 bug：

- `addToCartCommandByParams`：未登录首次加车时，创建订单成功但加车失败，再次加车会重复创建订单（订单未同步到 Redux state）
- `addToCartCommand`：无订单时直接报错，未尝试创建订单，直接调用方（`web-add-to-cart.tsx`）存在同样的订单重复创建风险

---

## Feature 矩阵（当前对齐状态）

| Feature                             | `addToCartCommand` | `webAddToCartCommand`                    | `addToCartCommandByParams`                              |
| ----------------------------------- | ------------------ | ---------------------------------------- | ------------------------------------------------------- |
| 无订单时自动创建                    | ✅                 | ✅                                       | ✅                                                      |
| 创建订单后同步 state                | ✅                 | ✅                                       | ✅                                                      |
| 城市信息校验 & 更新订单             | ❌                 | ✅（路由前执行，覆盖 bundle/非 bundle）  | ✅（直接调用时执行；经 webAddToCartCommand 调用时跳过） |
| Bundle 商品支持                     | ✅                 | 委托给 addToCartCommand                  | ❌                                                      |
| Mulberry warranty 支持              | ✅                 | 委托给 addToCartCommand                  | ❌                                                      |
| Variant 来源                        | Redux state        | 参数 or Redux                            | 参数（必传）                                            |
| `suppressDefaultErrorModal`         | ❌                 | ❌                                       | ✅                                                      |
| `suppressTracking`                  | ❌                 | ❌                                       | ✅                                                      |
| `skipCityCheck`                     | ❌                 | 不适用（调用方）                         | ✅（webAddToCartCommand 传入 true 避免重复校验）        |
| `source` 追踪参数                   | ❌                 | ✅                                       | ✅                                                      |
| `isSwatch` / `swatchRelatedProduct` | ❌                 | ✅（接收，但 listener 层未读取，待清理） | ❌                                                      |

### 对齐后调用流程

```
直接调用 addToCartCommandByParams（Room Designer 等）
  └─ 创建订单（若无） + setOrder
  └─ 城市校验 + updateWebOrder（skipCityCheck=false，默认）
  └─ addToOrder.initiate

webAddToCartCommand（Web PDP 标准路径）
  └─ 创建订单（若无） + setOrder
  └─ 城市校验 + updateWebOrder
  └─ 路由：
      ├─ 有 variant → addToCartCommandByParams（skipCityCheck=true）
      │    └─ 跳过城市校验（上层已处理）
      │    └─ addToOrder.initiate
      └─ 无 variant → addToCartCommand（bundle/mulberry 路径）
           └─ 创建订单（若无） + setOrder
           └─ addToOrder.initiate
```

> 注意：所有 listener 监听的是 `addToOrder.matchFulfilled`（RTK Query 层），不依赖高层 command 的 fulfilled 事件，合并/重构高层 command 对 tracking 无影响。

---

## 已完成优化

### [DONE] P2 — addToCartCommandByParams 补全城市信息校验

- 在 `addToCartCommandByParams` 中加入城市信息校验逻辑（`getCityInfo` + `updateWebOrder`）
- 新增 `skipCityCheck?: boolean` 参数，`webAddToCartCommand` 调用时传 `true` 避免双重校验
- `setOrder` 后重新调用 `getState()` 读取最新订单状态，确保比对数据正确

---

## 下一步优化计划

### P1 — 提取"创建订单 + 同步 state"为共享逻辑

**现状**：相同的"创建订单 → 检查 error → 同步 state"逻辑在三个 command 中各写了一份。

**方案**：提取为内部 helper 函数（非导出），放在同文件：

```ts
// 提取示例
async function ensureOrderExists(dispatch, getState): Promise<string | null> {
  const rootState = getState() as RootState;
  let currentOrderNumber = selectCurrentOrderNumber(rootState);
  if (!currentOrderNumber) {
    const result = await dispatch(createWebOrderForCurrentUser());
    if ('error' in result || !result.payload?.number) return null;
    if (result.payload) dispatch(setOrder(result.payload));
    currentOrderNumber = result.payload.number;
  }
  return currentOrderNumber;
}
```

**收益**：消除三处重复代码，后续如有订单创建逻辑变更只需改一处。
**风险**：低。纯内部重构，不影响调用方接口。

---

### P2 — addToCartCommand 补充 suppressTracking / suppressDefaultErrorModal 支持

**现状**：`addToCartCommand` 不支持这两个参数，由 `webAddToCartCommand` 间接透传给 `addToCartCommandByParams`，但 `addToCartCommand`（bundle/mulberry 路径）无法享受此能力。

**方案**：为 `addToCartCommand` 增加可选参数，并透传给 `addToOrder.initiate`，与 `addToCartCommandByParams` 对齐。

**风险**：低。现有调用方不传参数，默认行为不变。

---

### P3（长期）— 评估 webAddToCartCommand 瘦身 / 合并

**背景**：listener 层全部监听 `addToOrder.matchFulfilled`（RTK Query），不依赖高层 command 的 fulfilled，合并对 tracking 无影响（已验证）。

**当前阻碍**：

- `webAddToCartCommand` 的 `isSwatch`/`swatchRelatedProduct` 参数接收后未流向任何 listener，属于死代码；清理后 webAddToCartCommand 仅剩路由职责
- 无 variant 时走 `addToCartCommand`（bundle/mulberry），该路径 `addToCartCommandByParams` 不支持，需额外处理

**可行方案**（P1 完成后评估）：

1. `addToCartCommandByParams` 中 `variant_id` 改为可选，无时从 Redux state 读取并走 bundle/mulberry 逻辑
2. `webAddToCartCommand` 降为纯透传包装（保留参数签名兼容性），或直接废弃

**重新评估触发条件**：P1 完成、`isSwatch`/`swatchRelatedProduct` dead code 清理后。

---

## 调用方现状

| 文件                               | 调用的 command             | 场景                                      |
| ---------------------------------- | -------------------------- | ----------------------------------------- |
| `web-add-to-cart.tsx`              | `addToCartCommand`         | Web PDP 加车按钮                          |
| `atc-button.tsx`                   | `addToCartCommand`         | POS / 线下门店加车（含 offline tracking） |
| `webAddToCartCommand` 内部         | `addToCartCommand`         | 无 variant 参数时的降级路径               |
| `webAddToCartCommand` 内部         | `addToCartCommandByParams` | 有 variant 参数时的标准路径               |
| Room Designer（HullaIntegrate 等） | `addToCartCommandByParams` | 第三方集成精确传参                        |
