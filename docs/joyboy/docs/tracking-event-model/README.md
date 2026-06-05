# 追踪事件手册

> 目标：让追踪事件在 PM、研发、QA、数据分析的协作中都能被理解、评审与测试。
>
> 📦 **可走读样例**：[`examples/tracking-event-model-demo/`](../../examples/tracking-event-model-demo/) — 以 `add_to_cart` 与 `order_purchased` 为例，覆盖事件页、listener、trigger、目的端、单测与 E2E 模板。

当前追踪链路大致是：

```text
组件 / 领域服务
  -> dispatch 业务动作事件
  -> tracking listener 订阅该业务动作
  -> listener 组装各渠道的 trigger payload
  -> dispatch tracking trigger
  -> trigger 校验并转换 payload
  -> 平台 util 发送到 GA / Meta CAPI / Pinterest CAPI / DY / Klaviyo
```

这是一个好的方向：组件保留业务上下文，listener 负责集中编排，channel trigger 负责平台特定的 payload。目前缺失的是一层稳定的事件契约——非研发能读懂，研发与测试能强约束。

## 为什么需要 Events Book

产品工作中的追踪问题，往往不是因为漏了一句 `dispatch`，而是因为不同的人对同一个事件名有不同的理解：

- PM 想要 "started checkout"，研发却在 checkout 初始化成功前就触发了；
- QA 验证的是肉眼可见的页面跳转，但实际事件是基于 Redux domain action 触发的；
- 研发新增了一个 channel 字段，但金额、SKU、件数、客户状态的语义没有文档化；
- 某条事件针对 Meta 或 Klaviyo 改了，但下游报表、人群包、自动化测试没人去校对。

Events Book 是产品语言与代码实现之间的契约层。每一个重要业务事件都应该有一个事件页，说明：

- 它代表什么用户或系统行为；
- 何时触发，何时绝不能触发；
- 由哪个 action / listener / trigger 负责实现；
- 哪些字段是必填、选填、敏感或被转换的；
- 同一个业务事件如何映射到各个目的平台；
- 自动化测试如何证明该契约被遵守。

## 事件契约的分层

| 层级            | 受众                    | 契约内容                                     | 当前项目示例                                                                      |
| --------------- | ----------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| 业务事件        | PM、QA、Analytics、研发 | 事件含义、触发时机、非目标、验收标准         | `webInitiatedCheckoutEvent`、`webPaymentCapturedEvent`、`purchasedSucceededEvent` |
| Listener 编排   | 研发、QA 自动化         | 源 action、状态选择器、去重、扇出列表        | `setupTrackingListeners`、`setupCartTrackingListeners`                            |
| Trigger payload | 研发                    | trigger 接受的 TypeScript 输入 schema        | `CheckoutTriggerPayloadSchema`、`FacebookPurchaseTriggerPayloadSchema`            |
| 目的端 payload  | 研发、Analytics         | 最终的平台事件名与转换后的字段               | `GACheckoutEventPayloadSchema`、Meta `customData`、Klaviyo `Items`                |
| 测试契约        | QA、研发                | given/when/then 检查点与 mock/intercept 位置 | listener 单测、trigger 单测、Playwright 的 dataLayer/network 校验                 |

## 推荐的事件页结构

单个事件的细节使用 [event-model.template.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/tracking-event-model/event-model.template.md)。对于一个领域流程（domain flow），建议建一个领域页，结构如下：

1. 流程概览：按用户旅程顺序列出业务动作。
2. 事件清单：一行一个业务事件，而不是一行一个平台事件。
3. 事件详情：含义、触发时机、源 action、去重、schema、边界场景。
4. 目的端映射：GA、Meta CAPI、Pinterest CAPI、DY、Klaviyo。
5. 自动化测试方案：单元、集成、E2E 检查点。
6. 待定决策：需要 PM / Analytics 拍板的字段或时机。

## 命名规则

手册中优先使用业务名，而不是平台名。

| 推荐                 | 避免                     | 原因                               |
| -------------------- | ------------------------ | ---------------------------------- |
| `cart_item_added`    | `ga_add_to_cart`         | 一个业务事件可以映射到多个目的端。 |
| `checkout_initiated` | `fb_initiate_checkout`   | Meta 的命名应该留在目的端映射里。  |
| `payment_info_added` | `pinterest_custom_event` | 目的端实现细节解释不了产品行为。   |
| `order_purchased`    | `transaction`            | 产品语言对 PM 与 QA 更友好。       |

当现有代码已经使用平台导向的导出常量（如 `EVENT_GA_CHECKOUT`）时，保留代码层的实现名，但在文档中单独记录对应的业务事件。

## 单一信源（Source of Truth）规则

1. 当组件知道用户意图或交互来源时，优先由组件 dispatch 业务事件。
2. 当组件可以提供业务上下文时，listener 不应该从 URL 去猜。
3. listener 负责扇出编排，不重新定义字段语义。
4. trigger 负责校验、转换、记录日志，并发送给一个平台或一组紧密相关的渠道族。
5. 一个业务动作应有一个主要的源 action。如果同一个事件可能从 UI、endpoint、服务端三处发出，需文档化去重 key 与归属。
6. 金额字段必须说明币种、税基、折扣口径，以及是字符串还是数字。
7. 商品数组必须说明是否包含 swatch、赠品、缺货、零价商品。
8. PII 字段必须说明来源、是否做了 hash/标准化、consent 要求与目的端。

## 自动化测试策略

手册要支持自动化测试——让每一个事件契约都可执行地被验证。

| 测试层        | 证明什么                                         | 推荐实现                                                                                                 |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Schema 测试   | 必填字段、枚举值、金额/商品形状                  | 在 `entity/*.schema.ts` 附近逐步增加运行时校验器，或先用辅助构造器对类型化 fixture 进行测试。            |
| Listener 单测 | 一个业务 action 是否扇出到预期的 trigger action  | 在 `setupTrackingListeners` / `setupCartTrackingListeners` 周围 mock `dispatch`、`getState`、selectors。 |
| Trigger 单测  | trigger 是否校验输入并发送了正确的目的端 payload | mock `gaTrack`、`fbConversionTrack`、`pinterestConversionTrack`、`trackDy`、`trackKlaviyo`。             |
| E2E 冒烟      | 真实用户流程是否触发了预期的公开事件             | 使用 Playwright 在 checkout / cart 流程中捕获 `window.dataLayer`、SDK 调用或 conversion API 网络请求。   |
| 回归测试      | 现有事件形状没有被意外改动                       | 对稳定 fixture 的归一化目的端 payload 做 snapshot，变更时与 Analytics 一起评审。                         |

从风险最高的链路开始：加购、initiate checkout、payment info、purchase，以及 swatch 相关的 purchase / 加购。

## 事件变更的完成定义（DoD）

- 业务事件页已新建或更新。
- 触发时机与不触发的边界都写明。
- 必填 / 选填字段有示例与归属人。
- 每个受影响的目的平台映射都同步更新。
- QA 清单包含自动化验证点。
- 关键事件覆盖 listener 扇出与 trigger payload 转换的测试。
- 待定的 Analytics 决策记录在事件页里，而不是藏在代码注释里。

## 针对本代码库的设计观点

1. 保留当前 `组件/领域事件 -> listener -> trigger` 的模式。它在"局部业务上下文"与"集中追踪行为"之间取得了较好的平衡。
2. 按业务流程组织事件页，而不是按平台。现有的空 channel 文件（`facebook-capi.md`、`pinterest-capi.md`、`dy.md`、`klaviyo.md`）后续可以转为目的端参考页。
3. trigger payload 的 TypeScript 类型是研发契约，但不要把它当作完整事件契约——PM 与 QA 同样需要触发时机、示例与非目标。
4. 针对 checkout，需要明确 `webInitiatedCheckoutEvent` 到底是 "checkout 意图" 还是 "checkout start 成功"。当前代码是在 `initCheckoutCommand()` 成功之前 dispatch 的，所以事件手册要么把它文档化为意图，要么建议新增/迁移一个 success 事件。
5. 只有在去重或跨平台关联是有意为之时，才在多个目的端共用同一个事件 ID。需要文档化为什么共用 `eventId`，以及哪些目的端会消费它。
6. 让事件测试优先断言业务 action，其次再校验渠道 payload。这样当某个目的端集成变化时，测试更稳定。

## 当前参考

| 范畴                    | 参考                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 通用 listener 模式      | [redux-listener-event-design-pattern.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/redux-listener-event-design-pattern.md)                   |
| 事件模板                | [event-model.template.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/tracking-event-model/event-model.template.md)                            |
| Checkout 示例手册       | [checkout.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/tracking-event-model/checkout.md)                                                    |
| Tracking listeners      | [tracking.listener.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts)           |
| Cart tracking listeners | [cart-tracking.listener.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts) |
| Checkout GA trigger     | [checkout.trigger.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/triggers/checkout.trigger.ts)              |
| Tracking schemas        | [entity](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/entity)                                                 |

---

# Tracking Events Book

> Goal: make tracking events understandable, reviewable, and testable across PM, engineering, QA, and analytics work.
>
> 📦 **Walkthrough demo**: [`examples/tracking-event-model-demo/`](../../examples/tracking-event-model-demo/) — `add_to_cart` and `order_purchased` covering event pages, listener, trigger, destinations, unit tests, and E2E templates.

The current tracking flow is mostly:

```text
Component / domain service
  -> dispatch business action event
  -> tracking listener subscribes to the business action
  -> listener builds channel trigger payloads
  -> dispatch tracking trigger
  -> trigger validates and transforms payload
  -> platform util sends to GA / Meta CAPI / Pinterest CAPI / DY / Klaviyo
```

This is a good direction because components keep the business context, listeners centralize orchestration, and channel triggers own platform-specific payloads. The missing layer is a stable event contract that non-engineers can read and engineers/tests can enforce.

## Why Events Book

Tracking problems in product work are usually not caused by a missing `dispatch`. They come from different people meaning different things by the same event name:

- PM asks for "started checkout", but engineering fires it before checkout initialization succeeds.
- QA verifies a visible page transition, but the actual event is keyed by a Redux domain action.
- Developers add a channel field, but the meaning of money, SKU, item count, or customer status is not documented.
- A destination event is changed for Meta or Klaviyo, but nobody checks downstream reports, audiences, or automated tests.

Events Book is the contract layer between product language and implementation. Every important business event should have one event page that explains:

- what user or system behavior it represents;
- when it fires and when it must not fire;
- which action/listener/trigger owns the implementation;
- which fields are required, optional, sensitive, or transformed;
- how each destination maps from the same business event;
- how automated tests can prove the contract.

## Event Contract Layers

| Layer                  | Audience               | Contract                                              | Current project examples                                                          |
| ---------------------- | ---------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| Business event         | PM, QA, analytics, dev | Event meaning, timing, non-goals, acceptance criteria | `webInitiatedCheckoutEvent`, `webPaymentCapturedEvent`, `purchasedSucceededEvent` |
| Listener orchestration | Dev, QA automation     | Source action, state selectors, dedupe, fan-out list  | `setupTrackingListeners`, `setupCartTrackingListeners`                            |
| Trigger payload        | Dev                    | TypeScript input schema accepted by a trigger         | `CheckoutTriggerPayloadSchema`, `FacebookPurchaseTriggerPayloadSchema`            |
| Destination payload    | Dev, analytics         | Final platform event name and transformed fields      | `GACheckoutEventPayloadSchema`, Meta `customData`, Klaviyo `Items`                |
| Test contract          | QA, dev                | Given/when/then checks and mock/intercept points      | listener unit tests, trigger unit tests, Playwright dataLayer/network checks      |

## Recommended Event Page Structure

Use [event-model.template.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/tracking-event-model/event-model.template.md) for single-event details. For a domain flow, create one domain page with this structure:

1. Flow overview: business actions in user journey order.
2. Event inventory: one row per business event, not one row per platform event.
3. Event detail: meaning, trigger timing, source action, dedupe, schemas, edge cases.
4. Destination mapping: GA, Meta CAPI, Pinterest CAPI, DY, Klaviyo.
5. Automated testing plan: unit, integration, and E2E checks.
6. Open decisions: fields or timing that need PM/analytics sign-off.

## Naming Rules

Prefer business names over platform names in the book.

| Use                  | Avoid                    | Reason                                                              |
| -------------------- | ------------------------ | ------------------------------------------------------------------- |
| `cart_item_added`    | `ga_add_to_cart`         | One business event can map to many destinations.                    |
| `checkout_initiated` | `fb_initiate_checkout`   | Meta naming should stay in destination mapping.                     |
| `payment_info_added` | `pinterest_custom_event` | Destination implementation details do not explain product behavior. |
| `order_purchased`    | `transaction`            | Product language is easier for PM and QA to reason about.           |

When current code already uses platform-oriented exported constants such as `EVENT_GA_CHECKOUT`, keep the implementation name, but document the business event separately.

## Source-of-Truth Rules

1. Component-dispatched business events are preferred when the component knows the user intent or interaction source.
2. Listener should not guess business context from URL when the component can provide it.
3. Listener should orchestrate fan-out, not redefine field meanings.
4. Trigger should validate, transform, log, and send to one platform or one closely related channel family.
5. One business action should have one primary source action. If the same event can be emitted from UI, endpoint, and server, document the dedupe key and owner.
6. Money fields must always state currency, tax basis, discount basis, and whether the value is a string or number.
7. Product arrays must state whether swatch, gift, unavailable, or zero-price items are included.
8. PII fields must state source, hashing/normalization, consent requirement, and destination.

## Automation Strategy

The book should support automated tests by making every event contract executable enough to verify.

| Test level          | What it proves                                                    | Recommended implementation                                                                                          |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Schema tests        | Required fields, allowed enum values, money/item shape            | Add runtime validators near `entity/*.schema.ts` over time, or test helper builders against typed fixtures first.   |
| Listener unit tests | A business action fans out to the expected trigger actions        | Mock `dispatch`, `getState`, and selectors around `setupTrackingListeners` / `setupCartTrackingListeners`.          |
| Trigger unit tests  | Trigger validates input and sends the correct destination payload | Mock `gaTrack`, `fbConversionTrack`, `pinterestConversionTrack`, `trackDy`, `trackKlaviyo`.                         |
| E2E smoke tests     | Real user flow emits expected public events                       | Use Playwright to capture `window.dataLayer`, SDK calls, or conversion API network requests in checkout/cart flows. |
| Regression tests    | Existing event shape does not drift accidentally                  | Snapshot normalized destination payloads from stable fixtures, reviewed with analytics when changed.                |

Start with the highest-risk flows: add to cart, initiate checkout, payment info, purchase, and swatch-specific purchase/add-to-cart.

## Definition of Done for Event Changes

- Business event page is created or updated.
- Trigger timing and non-trigger cases are explicit.
- Required/optional fields have examples and source owners.
- Destination mapping rows are updated for every impacted platform.
- QA checklist includes automated verification points.
- Tests cover listener fan-out and trigger payload transformation for critical events.
- Open analytics decisions are tracked in the event page instead of hidden in code comments.

## Design Opinions for This Codebase

1. Keep the current `component/domain event -> listener -> trigger` pattern. It gives the best balance between local business context and centralized tracking behavior.
2. Add event pages by business flow, not by platform. Existing empty channel files such as `facebook-capi.md`, `pinterest-capi.md`, `dy.md`, and `klaviyo.md` can become destination reference pages later.
3. Treat TypeScript trigger payload types as developer contracts, but do not treat them as the whole event contract. PM and QA need trigger timing, examples, and non-goals too.
4. For checkout specifically, decide whether `webInitiatedCheckoutEvent` means "checkout intent" or "checkout start succeeded". Current code dispatches it before `initCheckoutCommand()` succeeds, so the event book should either document that as intent or recommend moving/adding a success event.
5. Use shared event IDs across destinations only when dedupe or cross-platform correlation is intentional. Document why a shared `eventId` exists and which destinations consume it.
6. Make event tests assert business actions first, channel payloads second. This keeps tests stable when a destination integration changes.

## Current References

| Area                     | Reference                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| General listener pattern | [redux-listener-event-design-pattern.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/redux-listener-event-design-pattern.md)                   |
| Event template           | [event-model.template.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/tracking-event-model/event-model.template.md)                            |
| Checkout sample book     | [checkout.md](/Users/abbywang/.codex/worktrees/85ad/joyboy/docs/tracking-event-model/checkout.md)                                                    |
| Tracking listeners       | [tracking.listener.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/listeners/tracking.listener.ts)           |
| Cart tracking listeners  | [cart-tracking.listener.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/listeners/cart-tracking.listener.ts) |
| Checkout GA trigger      | [checkout.trigger.ts](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/triggers/checkout.trigger.ts)              |
| Tracking schemas         | [entity](/Users/abbywang/.codex/worktrees/85ad/joyboy/libs/modules/tracking/services/src/lib/entity)                                                 |
