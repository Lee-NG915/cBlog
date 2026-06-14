# Tracking Event Model — Demo

> 配套 [`docs/tracking-event-model/README.md`](../../docs/tracking-event-model/README.md) 的可走读演示。以 `add_to_cart` 和 `order_purchased` 两个业务事件为例，展示"业务事件 → listener → trigger → 目的端 payload → 自动化测试"的完整契约。

## 演示路径（建议走读顺序）

| 步骤             | 看什么                                      | 文件                                                                                                                                                                              |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. 业务事件页    | PM/QA/研发对同一事件的共同语义              | [`events/add-to-cart.md`](./events/add-to-cart.md) · [`events/order-purchased.md`](./events/order-purchased.md)                                                                   |
| 2. 业务 action   | 谁负责 dispatch，带什么上下文               | [`src/actions.ts`](./src/actions.ts)                                                                                                                                              |
| 3. Schema 契约   | 业务事件 / trigger payload 的强类型约束     | [`src/schemas.ts`](./src/schemas.ts)                                                                                                                                              |
| 4. Listener 扇出 | 一个业务 action 如何 fan-out 到多个 trigger | [`src/listeners/cart-tracking.listener.ts`](./src/listeners/cart-tracking.listener.ts) · [`src/listeners/order-tracking.listener.ts`](./src/listeners/order-tracking.listener.ts) |
| 5. Trigger 转换  | 业务事件 → 目的端 payload                   | [`src/triggers/`](./src/triggers/)                                                                                                                                                |
| 6. 目的端 mock   | GA / Meta CAPI 最终消费                     | [`src/platforms/`](./src/platforms/)                                                                                                                                              |
| 7. 自动化测试    | 4 层测试矩阵的具体形态                      | [`tests/`](./tests/)                                                                                                                                                              |
| 8. E2E 模板      | 真实流程下的 dataLayer / Meta CAPI 断言模板 | [`e2e/`](./e2e/)                                                                                                                                                                  |

## 范围声明

- **业务事件**：`add_to_cart`、`order_purchased`
- **目的端**：GA（dataLayer push）+ Meta CAPI（HTTPS POST）
- **测试层**：listener 扇出单测、trigger payload 单测，覆盖正常路径与"非触发"边界场景
- **不包含**：真实的 Pinterest/DY/Klaviyo 集成、Playwright E2E（这两类在生产代码中已经有，demo 不重复）

## 怎么跑（可选）

整个 demo 自包含，不在主项目 workspace 内，不会污染 monorepo。

```bash
cd examples/tracking-event-model-demo
pnpm install
pnpm test
```

> 也可以**只读代码**走读——所有逻辑都在 `src/` 与 `tests/`，无外部副作用。

### E2E 模板（按需安装）

`e2e/` 下的 Playwright 脚本是**模板**，没有真实站点跑不起来。需要时再装：

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

详细用法见 [`e2e/README.md`](./e2e/README.md)。

## 演示要点（讲什么）

1. **业务事件页是契约源头**——`events/*.md` 是 PM/QA/Analytics 也能读的产物，研发只是落到代码层。
2. **listener 不重新定义字段语义**——它只做扇出，所有字段含义在业务事件页里说清楚。
3. **trigger 才管平台细节**——金额格式化、字段重命名、`event_id` 生成、hash 都发生在 trigger。
4. **dedupe key 是显式契约**——`order_purchased` 用 `order.id` 在 listener 内存中去重，避免重复 Purchase 上报。
5. **测试断言业务 action 优先**——目的端 payload 变化时只动 trigger 层测试，业务层不受影响。

## 与生产代码的对照

| Demo 文件                                  | 对应生产代码                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `src/listeners/cart-tracking.listener.ts`  | `libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts` |
| `src/listeners/order-tracking.listener.ts` | `libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts`      |
| `src/triggers/ga-*.trigger.ts`             | `libs/modules/tracking/services/src/lib/triggers/checkout.trigger.ts` 等     |
| `src/triggers/meta-*.trigger.ts`           | `libs/modules/tracking/services/src/lib/triggers/fb-capi-events.trigger.ts`  |
