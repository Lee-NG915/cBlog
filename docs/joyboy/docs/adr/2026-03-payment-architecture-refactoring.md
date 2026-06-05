# ADR-001：支付模块整洁架构重构

- **状态**：已批准 (Approved)
- **日期**：2026-03-02
- **作者**：Abby Wang
- **关联 ADR**：[payment-adr.md](../adr/payment-adr.md)（跨市场多渠道支付架构设计）

---

## 1. 背景（Context）

### 1.1 当前问题

支付模块在迭代过程中逐渐积累了以下结构性问题：

| 问题                 | 表现                                                                                    | 影响                                            |
| -------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **UI 承载业务逻辑**  | `payment-wallets.tsx` 达 505 行，包含订单创建、支付初始化、SDK 调用、错误处理等全部逻辑 | 组件难以测试、难以复用，新增支付商需改动核心 UI |
| **无抽象层**         | Stripe、PayPal、GrabPay 等支付商逻辑平铺在组件或 helper 中                              | 新增支付商需理解并修改现有全部逻辑              |
| **缺少服务端隔离**   | 支付相关 API 通过 RTK Query 在客户端直接发起                                            | 无法在 BFF 层注入 Session/TraceID，安全边界模糊 |
| **无标准化结果格式** | 各支付商返回数据格式不一，错误处理逻辑散落各处                                          | 链路追踪困难，MMTD（平均检测时间）以小时计      |
| **基础设施层缺失**   | `payment/infrastructure` 目录为空，无任何具体适配实现                                   | 所有支付商差异由 UI 组件直接消化                |

### 1.2 业务目标

- 系统当前支持 6+ 种支付商（Stripe、PayPal、2C2P、GrabPay、Affirm、ZipPay），未来随市场扩张还将增加。
- 需要具备**分钟级故障发现能力（MMTD）**。
- 新增支付商的接入成本需控制在**单一文件范围内**，不影响已有支付逻辑。

---

## 2. 决策（Decision）

采用**整洁架构（Clean Architecture）**结合**策略模式（Strategy Pattern）**，将支付模块重构为五层职责分明的结构。

### 2.1 分层结构

```
libs/modules/payment/
├── domain/          # 纯接口层：类型定义、策略接口、市场特性声明
├── infrastructure/  # 适配器层：各支付商的具体实现（server-only）
├── services/        # 服务层：PaymentService 业务编排、工厂、Redux Listener
├── actions/         # 应用层：Server Action（BFF 网关）
└── components/      # 表现层：UI 组件 + Redux Slice（精简业务逻辑）
```

### 2.2 各层职责与关键决策点

#### Layer 1 — Domain（纯接口层）

**职责**：定义所有层共享的类型契约，不包含任何实现逻辑。

**关键类型**：

```typescript
// 基础策略接口：每个支付商必须实现
// capturePayment 是所有支付商的必经步骤，触发时机由支付类型决定
// 注意：createOrder 已从此接口移除（见 §2.2 Layer 5 说明）
interface IPaymentStrategy {
  readonly type: PaymentMethodProviderEnum;
  initiatePaymentIntent(cmd: InitiatePaymentCommand): Promise<InitiatePaymentIntentResult>;
  capturePayment(params: CapturePaymentParams): Promise<CapturePaymentResult>; // 所有支付商必须实现
  removeInitiatedPayment(params?: RemovePaymentParams): Promise<void>;
}

// 能力 Trait：仅部分支付商实现
interface ISubmitInformation {
  submitPaymentInfo(data: unknown): Promise<void>; // Stripe（客户端表单提交）
}
interface IConfirmPayment {
  confirmPayment(): Promise<ActionSchema>; // 返回下一步指令（SDK 类或跳转类）
}

// 指令驱动接力：标准化 UI 与业务的协议
// REDIRECT 类型携带 returnUrl，供 payment 页面在用户回跳时识别并触发 capture
type ActionSchema =
  | { action: 'SDK_CONFIRM'; clientSecret: string; paymentId: string }
  | { action: 'REDIRECT'; redirectUrl: string; paymentId: string; returnUrl: string }
  | { action: 'SDK_POPUP'; sdkToken: string; paymentId: string } // PayPal orderId / Affirm checkoutToken
  | { action: 'SUCCESS'; paymentId: string };
```

**决策理由**：

- **`capturePayment` 是必选步骤**：无论 SDK 类（Stripe）还是跳转类（GrabPay），支付的最终闭环都需要调用后端 confirm API。区别仅在触发时机：SDK 类在 SDK 回调后同步触发，跳转类在用户从第三方页面返回时由 payment 页面检测 URL 参数后触发。
- **`IConfirmPayment` 仍为可选 Trait**：Stripe 需要此步骤返回 `clientSecret` 给客户端调用 SDK；GrabPay 需要返回 `redirectUrl`；PayPal / Affirm 需要返回 `sdkToken` 用于开启 SDK 弹窗；但有些支付商（如直接成功型）可跳过，直接执行 capture。
- `ActionSchema` 中 `REDIRECT` 类型携带 `returnUrl`（由 Component 层构造），用于第三方支付完成后回跳至指定页面。该回调页面（`/[country]/checkout/payment/callback`）**当前预留，暂不实现**；页面加载时读取 URL 参数（`paymentId`、`provider`、`orderId`）并触发 `capturePaymentAction`。
- `ActionSchema` 中 `SDK_POPUP` 类型用于 PayPal / Affirm 等 SDK 弹窗类支付商：后端创建第三方 SDK 所需 token，前端用 `sdkToken` 开启 SDK 弹窗，主页不发生跳转。`sdkToken` 对 PayPal 是 orderId，对 Affirm 是 checkoutToken，各自组件内部解释。
- **`createOrder` 已从 Strategy 移至客户端（见 Layer 5）**：订单创建通过 RTK Query `createTransactionOrder` mutation 在客户端执行，Server Action `initiatePaymentAction` 接收已创建的 `orderId`/`orderNumber` 作为必填参数。

#### Layer 2 — Infrastructure（适配器层）

**职责**：实现各支付商的具体 Strategy，包含 TraceID 埋点，全部标注 `server-only`。

**所有 Strategy 均共享以下行为**：

- 使用统一的 `initiatePaymentIntent` API（`PUT /api/v1/order/payment/initiate`）
- 使用统一的 `capturePayment` API（`PUT /api/v1/order/payment/confirm`）
- 在 API 调用前后记录 `traceId`、`duration`、`errorCode` 结构化日志

> 订单创建（`POST /api/v1/order`）已移至客户端，通过 RTK Query `createTransactionOrder` mutation 执行，不再经过 Strategy。

**注册策略（按市场扩展）**：

| Strategy 类        | 实现的可选 Trait                        | Capture 触发方式                      | 覆盖市场         |
| ------------------ | --------------------------------------- | ------------------------------------- | ---------------- |
| `StripeStrategy`   | `ISubmitInformation`, `IConfirmPayment` | SDK 回调后同步触发                    | 所有市场（默认） |
| `PaypalStrategy`   | `IConfirmPayment`（SDK_POPUP）          | SDK 弹窗回调后同步触发                | AU、US、CA 等    |
| `GrabPayStrategy`  | `IConfirmPayment`（REDIRECT）           | 用户从 GrabPay 页面返回，URL 参数触发 | SG               |
| `TwoCTwoPStrategy` | `IConfirmPayment`（REDIRECT）           | 用户从 2C2P 页面返回，URL 参数触发    | SG               |
| `ZipPayStrategy`   | `IConfirmPayment`（REDIRECT）           | 用户从 Zip 页面返回，URL 参数触发     | AU               |
| `AffirmStrategy`   | `IConfirmPayment`（SDK_POPUP）          | SDK 弹窗回调后同步触发                | US               |

#### Layer 3 — Services（服务层）

**职责**：`PaymentService` 作为业务编排器（Orchestrator），通过 `PaymentStrategyFactory` 获取对应策略并驱动流程。

**核心流程**：

```
Step 1: submitPaymentInfo（可选，仅实现了 ISubmitInformation 的策略执行，如 Stripe；server-side no-op）
Step 2: initiatePaymentIntent（所有支付商必走）→ PUT /api/v1/order/payment/initiate
Step 3: confirmPayment（可选，返回 ActionSchema；若无此 Trait 则直接返回 SUCCESS）
```

> `createOrder` 已从此流程移除。`ProcessPaymentCommand` 现在要求 `orderId` 和 `orderNumber` 为必填参数（调用方——即 Component 层——必须先创建订单）。

**出错时**：在 catch 块中调用 `removeInitiatedPayment` 进行尽力而为（best-effort）回滚。

**决策理由**：将 `confirmPayment` 从 `IPaymentStrategy` 基础接口移出，改为 Trait，原因是 Stripe 需要 SDK 二次确认，而 GrabPay 直接跳转，两者的"确认"方式完全不同，不应强制统一签名。

#### Layer 4 — Actions（应用层 / BFF）

**职责**：作为 Next.js Server Action，隔离浏览器环境，注入 TraceID，对接服务层。

**拆分为两个 Action**（原因：遵循 ADR 的"指令驱动接力"设计，分离"指令获取"和"闭环确认"两个阶段）：

```typescript
// Action 1：触发支付流程（要求订单已由客户端创建），返回下一步指令
// 入参：orderId, orderNumber 为必填（由客户端 createTransactionOrder 提供）
export async function initiatePaymentAction(payload: InitiatePaymentActionParams): Promise<InitiatePaymentActionResult>;

// Action 2：SDK 完成后调用，后端闭环确认
export async function capturePaymentAction(payload: CapturePaymentActionParams): Promise<CapturePaymentActionResult>;
```

**TraceID 注入**：由 Action 层生成（`uuid v4`），注入所有下游调用，作为 X-Correlation-ID 穿透至日志系统。

#### Layer 5 — Components（表现层）

**职责**：UI 渲染 + 根据 `ActionSchema` 指令驱动 SDK，不包含业务编排逻辑。

**`payment-wallets.tsx` 精简后的核心模式（`runPaymentPipeline`）**：

```
用户点击"提交"
  │
  ▼ [Step 1 — Client] createTransactionOrder()（RTK mutation）
  │   如果 orderInfo 不存在：
  │   ├── 读取 checkoutToken（sessionStorage）
  │   ├── 调用 createOrder({}).unwrap()
  │   │   失败 → Redux CheckoutProcessFailedEvent listener 处理（展示对应错误 Modal）
  │   │           isProcessing: false，return { status: 'error' }
  │   └── 成功 → saveNewOrder（写入 React state + sessionStorage）
  │
  ▼ [Step 2 — Client] 清理上次失败残留的 pending payment
  │   如果 lastPaymentIdRef 有值：
  │   └── deleteOrderPayment({ orderId, paymentId })
  │
  ▼ [Step 3 — Server Action] initiatePaymentAction({ orderId, orderNumber, ... })
  │   失败 → handlePaymentError → Modal/Inline 展示
  │
  ▼ [Step 4 — Client] 根据 ActionSchema 执行分支
  │
  │   'SDK_CONFIRM'（Stripe / 2C2P 暂缓）
  │     → stripe.confirmPayment(clientSecret) / 2C2P SDK
  │     → 失败 → handlePaymentError
  │
  │   'REDIRECT'（GrabPay / ZipPay）⏸ 暂缓
  │     → window.location.href = redirectUrl
  │     → return（等待第三方回调，预留 callback 页面，暂不实现）
  │
  │   'SDK_POPUP'（PayPal / Affirm）
  │     → PaypalPaymentElement / AffirmPaymentElement 组件内部触发 SDK 弹窗
  │     → SDK 弹窗回调 → capturePaymentAction
  │     → 失败 → handlePaymentError
  │
  │   'SUCCESS'（无需额外操作的支付商）
  │     → 直接进入 Step 5
  │
  ▼ [Step 5 — Server Action] capturePaymentAction()
  │   失败 → handlePaymentError
  │
  ▼ [Client] window.location.replace('/checkout-success?orderId=xxx')
```

**关键架构决策 — 为何 `createOrder` 移至客户端**：

后端在 `createOrder` 时会执行完整的结算校验（库存、优惠券有效性、价格变动等），失败时返回业务错误码（`10702xxx` 系列）。这些错误需要丰富的 UI 交互（弹 Modal、跳转等），已由 `setupApiErrorListeners` / `CheckoutProcessFailedEvent` Redux middleware 统一处理。

若 `createOrder` 在 Server Action 内部执行，错误码会被 `classifyPaymentError` 吞掉，只能展示 `genericPaymentError`。移至客户端 RTK mutation 后，`transformResponse` 在 `code !== 0` 时 throw，触发 `matchRejected`，由现有 listener 完整处理所有业务码——**零改动复用现有错误处理机制**。

**错误处理方案（保留当前分支策略）**：

- `classifyPaymentError`：将 HTTP 状态码 + Stripe/Provider 错误码映射为语义化分类（`PaymentErrorCategory`）
- `usePaymentErrorHandler`：统一错误入口，通过 i18n key 解析用户友好提示，触发 Modal 或 Inline 展示
- 错误展示：Modal（主要支付错误）/ Inline（轻量验证错误）

---

## 3. 备选方案（Alternatives Considered）

### 方案 A：继续在组件层堆叠逻辑

- **优点**：无需重构，改动量最小
- **缺点**：随支付商增加，`payment-wallets.tsx` 将持续膨胀，技术债务不可控
- **结论**：❌ 拒绝

### 方案 B：仅提取 Service 层，不做 Infrastructure 分层

- **优点**：改动范围小于全量重构
- **缺点**：各支付商的差异仍会渗入 Service 层，无法实现真正的热插拔
- **结论**：❌ 拒绝，Strategy 模式是解决多支付商差异的根本手段

### 方案 C（本决策）：整洁架构 + Strategy Pattern

- **优点**：新增支付商只需一个新 Strategy 文件，核心逻辑零改动；链路可追踪；单元测试友好
- **缺点**：初期重构工作量较大（约 3-4 个 Sprint），需要前后端协同
- **结论**：✅ 采用

---

## 4. 后果（Consequences）

### 4.1 正向影响

| 维度                 | 重构前                       | 重构后                                  |
| -------------------- | ---------------------------- | --------------------------------------- |
| **接入新支付商**     | 修改多个文件，回归测试压力大 | 仅新增一个 Strategy 文件                |
| **MMTD（故障检测）** | 需翻查多层日志，以小时计     | 通过 Adapter 结构化日志，分钟级定位     |
| **可测试性**         | 组件测试需 mock 大量 SDK     | Service/Strategy 纯服务端，易于单元测试 |
| **职责清晰度**       | UI 混杂业务逻辑              | 五层各司其职，边界清晰                  |

### 4.2 风险与缓解

| 风险                    | 缓解措施                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| Stripe 现有流程回归风险 | Phase 4-5 完成后需进行完整的 E2E 测试（测试卡 + 真实环境）          |
| TraceID 未穿透至后端    | 后端需在日志系统接受 `X-Correlation-ID` Header，需提前对齐          |
| 多个 Strategy 版本并存  | 设置明确的截止日期，旧 `StripePaymentAdapter` 在 Phase 4 完成后删除 |

### 4.3 POS 支付

POS 支付逻辑（`addPosPaymentCommand`、`deletePosPaymentCommand`）**不纳入本次重构范围**，保留在 `payment.helper.ts` 中，后续单独评估。

---

## 5. 实施计划（Implementation Phases）

| 阶段        | 核心工作                                                                                   | 产出               | 风险等级 |
| ----------- | ------------------------------------------------------------------------------------------ | ------------------ | -------- |
| **Phase 1** | 修正 Domain 层接口（`IPaymentStrategy` 拆分、新增 `ActionSchema`）                         | 稳定的类型契约     | 🟢 低    |
| **Phase 2** | 完善 Infrastructure 层（Stripe + 其他 Strategy 实现，注入 TraceID）                        | 可运行的适配器     | 🟡 中    |
| **Phase 3** | 修复 PaymentService 流程 BUG，更新 Factory                                                 | 完整的服务层       | 🟡 中    |
| **Phase 4** | 重写 Actions 层（initiate + finalize 两个 Server Action）                                  | 新 BFF 入口        | 🟡 中    |
| **Phase 5** | 精简 `payment-wallets.tsx`（下沉业务逻辑，UI 只做 SDK 接力）                               | 精简的表现层       | 🔴 高    |
| **Phase 6** | 扩展非 Stripe 支付商 Strategy（按市场排期）                                                | 热插拔就绪         | 🟢 低    |
| **Phase 7** | 补全可观测性（Sentry 结构化日志、TraceID 穿透验证）                                        | MMTD 监控就绪      | 🟢 低    |
| **Phase 8** | 支付状态完善（T1 按钮文案、T2 订单倒计时、T4 PayPal/Affirm SDK 弹窗、T5 GrabPay 状态分类） | 完整的支付状态覆盖 | 🟡 中    |

---

## 6. 参考资料

- [payment-adr.md](../adr/payment-adr.md) — 跨市场多渠道支付架构设计（原始 ADR）
- [stripe-payment-technical-solution.md](../stripe-payment-technical-solution.md) — Stripe 前端支付技术方案
- [abby/payment-optimize 分支](https://github.com) — 部分重构实现参考
- Clean Architecture — Robert C. Martin
- Stripe Payment Element 文档 — https://docs.stripe.com/payments/payment-element
