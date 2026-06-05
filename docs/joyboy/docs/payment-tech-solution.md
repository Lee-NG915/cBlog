# 支付模块技术方案说明

- **作者**：Abby Wang
- **更新日期**：2026-03-20
- **文档定位**：Payment 模块技术方案说明

---

## 2. 当前要解决的核心问题

Payment 模块的设计对象不是单一支付方式，而是一个多支付商、多市场、强业务约束的交易子系统。当前架构主要面向以下三类问题：

1. **多支付商差异大**
   Stripe、PayPal、GrabPay、2C2P、ZipPay、Affirm 的交互模型并不一致，既有 SDK 确认型，也有整页跳转型，还有弹窗回调型。
2. **结算链路风险高**
   支付链路同时承载订单创建、库存校验、支付初始化、支付确认、异常回滚，任何一步出错都会直接影响转化和订单成功率。
3. **前端页面天然容易失控**
   如果把支付差异、订单状态、SDK 调用和错误处理都堆在一个页面组件中，新增支付商会持续抬高修改风险和回归成本。

因此，Payment 模块的架构目标是建立可扩展、可观测、可维护的支付技术底座，而不是围绕某一支付商做局部实现。

---

## 3. 架构设计说明

### 3.1 实际目录分层

当前 Payment 模块采用基于**整洁架构（Clean Architecture）**思想的五层分层结构：

```text
libs/modules/payment/
├── domain/          # 类型契约、策略接口、ActionSchema、Provider 定义
├── infrastructure/  # 各支付商 Strategy 实现、支付工厂
├── services/        # PaymentService 编排、服务层逻辑
├── actions/         # Next.js Server Action，作为 BFF 入口
└── components/      # PaymentWallets、Stripe/PayPal/Affirm 等 UI 与交互层
```

- `**PaymentStrategyFactory` 已落在 `infrastructure` 层\*\*
- `services` 只依赖 `IPaymentStrategyFactory` 接口
- `actions` 作为组合根，负责实例化 `PaymentService(new PaymentStrategyFactory())`

该结构满足典型的整洁架构依赖规则：**高层策略依赖抽象，低层模块提供实现，依赖方向始终指向稳定抽象。**

### 3.2 分层职责

| 层级             | 当前职责                                                                        | 当前落地点                            |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------- |
| `domain`         | 定义 `IPaymentStrategy`、`ActionSchema`、`CapturePaymentParams`、ProviderConfig | `libs/modules/payment/domain`         |
| `infrastructure` | 实现 Stripe / PayPal / GrabPay / 2C2P / ZipPay / Affirm Strategy                | `libs/modules/payment/infrastructure` |
| `services`       | 编排 initiate / confirm / capture / rollback 主流程                             | `payment.service.server.ts`           |
| `actions`        | 注入 `traceId`、承接客户端调用、隔离浏览器环境                                  | `payment.action.ts`                   |
| `components`     | 渲染支付 UI、驱动 SDK、管理页面状态、调用 Server Action                         | `payment-wallets.tsx` 及相关 hooks    |

### 3.3 架构思想与设计模式

当前 Payment 模块并不是简单的目录拆分，而是组合使用了几类明确的架构思想和设计模式。

#### 1. 整洁架构（Clean Architecture）

整洁架构强调两件事：

- 业务规则应尽量稳定，不直接依赖具体框架与外部实现
- 依赖方向应从外向内收敛到抽象与核心业务

在 Payment 模块中，对应关系如下：

- `domain` 定义策略接口、类型契约和动作协议，是稳定抽象层
- `services` 负责支付业务编排，是核心应用服务层
- `infrastructure` 承载第三方支付商适配，是外部实现层
- `actions` 作为应用入口，负责把 Web 层请求接入服务层
- `components` 处理 UI 交互和 SDK 执行，属于最外层表现层

其核心价值在于：支付商变化、SDK 变化、页面实现变化，不应直接侵入业务编排核心。

#### 2. 策略模式（Strategy Pattern）

支付模块天然适合策略模式。不同支付商虽然都属于“支付能力”，但在以下方面存在显著差异：

- 初始化入参不同
- 支付确认动作不同
- 返回结果结构不同
- 回调与跳转行为不同

当前设计将这些差异封装为独立 Strategy：

- `StripeStrategy`
- `PaypalStrategy`
- `GrabPayStrategy`
- `TwoCTwoPStrategy`
- `ZipPayStrategy`
- `AffirmStrategy`

服务层不直接写 `if provider === xxx` 分支，而是通过工厂获取具体策略，再按统一接口驱动。这样做的直接收益是：**支付商扩展以新增实现为主，而不是修改主流程为主。**

#### 3. 依赖倒置原则（Dependency Inversion Principle）

依赖倒置的核心不是“多写接口”，而是让高层模块依赖抽象、低层模块实现抽象。

在当前代码中：

- `PaymentService` 依赖的是 `IPaymentStrategyFactory`
- `PaymentStrategyFactory` 的具体实现位于 `infrastructure`
- `actions` 负责完成抽象与实现的装配

这意味着：

- `services` 不需要知道具体是 Stripe 还是 PayPal
- `services` 不需要感知 factory 的具体构造细节
- provider 扩展不会反向污染服务层

这种结构也是 Payment 模块能够保持编排层稳定的关键。

#### 4. 组合根（Composition Root）

组合根的职责是集中完成依赖装配，避免依赖创建逻辑散落在业务代码中。

当前模块中，`actions` 层承担了组合根职责：

- 创建 `PaymentStrategyFactory`
- 创建 `PaymentService`
- 注入 `traceId`
- 作为组件层和服务层之间的统一入口

这样做之后，组件层不直接创建服务对象，服务层也不直接创建具体 provider，实现了职责边界上的收敛。

#### 5. BFF（Backend for Frontend）模式

`initiatePaymentAction` 与 `capturePaymentAction` 本质上构成了支付场景下的轻量 BFF：

- 对浏览器暴露稳定、收敛后的调用入口
- 对内部屏蔽复杂的 provider 差异
- 统一注入 traceId、幂等键和服务端错误兜底

这种设计尤其适合支付场景，因为支付流程通常既需要浏览器侧交互，又需要服务端侧安全编排。

### 3.4 核心设计原则

当前架构围绕三项稳定抽象构建：

1. **统一能力抽象**
   所有支付商都实现 `initiatePaymentIntent`、`capturePayment`、`removeInitiatedPayment`。
2. **差异能力 Trait 化**
   `ISubmitInformation` 用于表达 Stripe 这类需要客户端预提交的支付方式；
   `IConfirmPayment` 用于表达初始化后还需要额外“下一步动作”的支付方式。
3. **客户端与服务端通过 `ActionSchema` 通信**
   服务端不直接控制浏览器，而是返回“下一步指令”，由前端执行。

### 3.5 采用该架构的工程收益

Payment 模块采用该架构的核心原因在于：支付场景同时具备高风险、高差异和高扩展特征。架构设计目标不是抽象本身，而是在**扩展性、稳定性、可定位性和交付效率**之间取得稳定平衡。

该设计的主要工程收益如下：

#### 1. 将“变化”隔离在最小范围内

支付模块里最容易变化的是支付商接入方式、初始化参数、确认动作和回调处理。当前通过 `Strategy + Factory` 的方式，把这些变化集中在 `infrastructure` 层处理，避免支付商差异扩散到页面组件、服务编排乃至其他业务模块。

这样带来的直接收益是：

- 新增支付商时，主要新增或调整 Strategy，而不是修改主链路
- 老支付商的稳定路径不会因为新增支付商而被大面积波及
- 支付差异被局部封装，更适合做增量迭代

#### 2. 将“稳定主流程”沉淀为可复用骨架

尽管各支付商差异很大，但支付主流程本身高度一致：

- 创建订单
- 发起支付
- 获取下一步动作
- 执行 SDK / 跳转 / 弹窗
- 回到服务端做 capture

当前 `actions -> services -> strategy` 的设计，本质上就是把这条稳定主流程固化下来，让变化点只出现在局部节点，而不是把整条链路拆散在多个组件分支里。

其直接结果是：

- 核心链路可复用
- 代码行为更容易预测
- 后续做监控、测试、排障时有统一入口

#### 3. 前后端边界更清晰，安全性更可控

支付模块中，浏览器适合做的是：

- 用户交互
- SDK 调用
- 页面状态展示

而服务端更适合做的是：

- 支付初始化
- traceId 注入
- provider 编排
- 敏感调用收口

通过 `Server Action` 作为 BFF 入口后，前端不再直接承载支付编排逻辑，页面复杂度、安全控制、日志追踪与服务端能力扩展均可在更清晰的边界内演进。

#### 4. 让多支付商场景具备统一沟通语言

如果没有 `ActionSchema`，团队在讨论支付问题时很容易陷入“Stripe 是这样、PayPal 是那样、GrabPay 又不一样”的碎片化表达。

现在通过统一动作协议，可以把支付问题统一表达为：

- `SDK_CONFIRM`
- `REDIRECT`
- `SDK_POPUP`
- `SUCCESS`

这不仅是代码层面的抽象，也是跨角色协作中的统一语言，有助于产品、前端、后端、测试围绕同一链路模型完成对齐。

#### 5. 更适合线上运营和故障定位

支付问题最大的成本往往不是开发，而是线上故障排查。过去如果逻辑散落在页面、helper、回调里，出现“支付失败”时很难快速判断失败发生在哪一段。

当前架构把责任分层后，排查路径会更清晰：

- 是订单创建失败
- 还是 initiate 失败
- 还是 SDK 执行失败
- 还是 capture 失败
- 还是 rollback 失败

再叠加 `traceId` 和 Strategy 层日志打点，整体链路具备较好的可观测性和定位能力。

#### 6. 对长期演进更友好

支付模块不是一次性交付模块，而是会随着市场扩张、支付商合作、风控策略和结算规则持续演化的模块。当前架构的价值在于，它不是只解决“现在 Stripe 能跑”，而是在为后续能力预留演进空间，例如：

- 增加新 provider
- 调整 capture 时机
- 接入回调页
- 扩展失败重试和补偿机制
- 增加更细粒度的埋点和监控

从工程视角看，该设计实质上是将 Payment 从页面级实现提升为可持续演进的业务基础设施。

### 3.6 架构设计带来的综合收益

综合来看，这样的架构设计对团队的价值并不只是“代码更好看”，而是实实在在提升了以下能力：

- **对业务**：降低支付链路出错时的用户流失风险，支撑多市场支付扩展
- **对研发**：降低新增支付商和修改既有流程的心智负担
- **对测试**：主流程更稳定，差异路径更集中，测试范围更容易划定
- **对运维**：链路更可观测，问题更容易定位
- **对架构治理**：模块边界更清晰，不容易再次回到“大组件承载全部逻辑”的状态

因此，这套架构的意义并不局限于代码组织优化，而是在 Payment 模块内建立了一套更适合长期运营和持续扩展的技术底座。

---

## 4. ActionSchema：当前架构的关键中台协议

当前 `domain` 中定义的 `ActionSchema` 如下：

```ts
type ActionSchema =
  | { action: 'SDK_CONFIRM'; clientSecret: string; paymentId: string }
  | { action: 'REDIRECT'; redirectUrl: string; paymentId: string; returnUrl: string }
  | { action: 'SDK_POPUP'; paymentId: string; sdkToken: string }
  | { action: 'SUCCESS'; paymentId: string };
```

`ActionSchema` 的职责是定义服务端与组件层之间的统一动作协议，其价值主要体现在：

- 服务层不感知前端具体交互形态
- 组件层不感知各支付商服务端实现细节
- 新支付商接入时，只要能映射到既有动作类型，主流程可保持稳定

从架构角色上看，`ActionSchema` 是 Payment 模块内部的动作编排协议。

---

## 5. 当前实际支付主流程

### 5.1 页面加载阶段

`apps/web/.../checkout/payment/page.client.tsx` 当前已承担支付页前置数据准备：

1. 从 `searchParams` 或 session persistence 中恢复有效 `orderId`
2. 若存在历史 order，则读取 order detail
3. 若不存在有效 order，则先补拉 checkout info
4. 在必要时执行 `preInventoryReserve`
5. 拉取 payment method configs
6. 最终渲染 `PaymentMainContent`

因此，支付页在架构上并非单纯的提交页面，而是具备**订单恢复能力**和**前置状态校验能力**的结算入口。

### 5.2 提交流程

当前 `PaymentWallets` + `usePaymentExecution` 已将支付提交流程稳定拆成以下步骤：

```text
Step 1  客户端校验
        Stripe 先执行 elements.submit()

Step 2  创建订单
        createTransactionOrder()

Step 3  清理上次失败残留的 pending payment
        deleteOrderPayment()

Step 4  发起支付
        initiatePaymentAction()
        -> PaymentService.processPayment()
        -> Strategy.initiatePaymentIntent()
        -> Strategy.confirmPayment()
        -> 返回 ActionSchema

Step 5  客户端根据 ActionSchema 执行下一步
        SDK_CONFIRM / REDIRECT / SDK_POPUP / SUCCESS

Step 6  闭环确认
        captureWithRetry()
        -> capturePaymentAction()
        -> Strategy.capturePayment()

Step 7  成功跳转
        /checkout-success?orderId=xxx
```

### 5.3 为什么 `createOrder` 仍然保留在客户端

`createTransactionOrder()` 仍在客户端通过 RTK mutation 发起，其设计依据是复用 checkout 侧既有错误处理链路：

- 订单创建阶段会返回大量业务错误码
- 这些错误码已被 checkout 侧 listener / modal 体系消费
- 如果强行把 `createOrder` 收进 Server Action，会把业务错误压缩成通用 payment error，损失现有用户提示能力

因此，当前边界划分为：

- **订单创建错误继续走 checkout 域既有 listener / modal 机制**
- **支付初始化与支付确认进入 Server Action + Strategy 体系**

本质上，这是以错误语义完整性为前提的边界划分，而不是将所有步骤机械收口到服务端。

---

## 6. 当前支付商接入矩阵

### 6.1 已落地的 Strategy 注册

当前 `PaymentStrategyFactory` 已注册：

- Stripe Online
- Stripe Afterpay
- Stripe Affirm
- Stripe Apple Pay
- Stripe Google Pay
- Stripe Link Pay
- PayPal Online
- GrabPay
- 2C2P
- ZipPay
- Affirm

### 6.2 当前动作模型

| 支付商      | 当前 Strategy 返回动作                                      | 当前页面侧处理方式                              | 状态判断 |
| ----------- | ----------------------------------------------------------- | ----------------------------------------------- | -------- |
| Stripe 系列 | `SDK_CONFIRM`                                               | 已接入 `StripePaymentElement` + confirm handler | 已贯通   |
| GrabPay     | `REDIRECT`                                                  | 已支持跳转；回调页仍待完整闭环                  | 部分贯通 |
| 2C2P        | `SDK_CONFIRM`                                               | 页面已预留 confirm handler，SDK 接线仍待补足    | 部分贯通 |
| ZipPay      | `REDIRECT`                                                  | Strategy 已就绪，页面主流程可承接               | 部分贯通 |
| PayPal      | 页面侧按 `SDK_POPUP` 设计，Strategy 侧当前仍返回 `REDIRECT` | 存在待对齐差异                                  | 待对齐   |
| Affirm      | 页面侧按 `SDK_POPUP` 设计，Strategy 侧当前仍返回 `REDIRECT` | 存在待对齐差异                                  | 待对齐   |

### 6.3 当前架构约束与待对齐项

当前实现中，部分支付商在组件层交互模型与基础设施层协议定义上仍存在待对齐项，主要包括：

- `components` 层已经为 PayPal / Affirm 实现了 SDK 弹窗式接入入口
- `prepareSdkPayment()` 明确要求服务端返回 `SDK_POPUP`
- 但 `PaypalStrategy` / `AffirmStrategy` 当前仍返回 `REDIRECT`

因此，**PayPal / Affirm 在组件层与 Strategy 层之间仍存在协议统一工作**，该部分属于当前架构继续收敛的重点。

---

## 7. 状态管理与异常恢复能力

当前 Payment 页面已经具备较完整的状态恢复与异常恢复能力：

### 7.1 订单恢复

- 从 `searchParams.orderId` 恢复
- 从 session persistence 恢复
- 通过 `transactionSymbol` 校验 checkout token 与 orderId 是否匹配

这保证了刷新、返回、重进支付页时不会无条件重复创建订单。

### 7.2 Pending Payment 清理

在重新发起支付前，会优先删除上次失败残留的 pending payment，避免：

- 重复 payment 记录污染订单
- 页面刷新后出现状态混乱
- 用户二次支付时串联到旧支付上下文

### 7.3 支付倒计时

当前已经基于 `paymentExpiredAt` 实现支付倒计时，并在过期时统一收敛到 `orderExpired` 弹窗逻辑。

该实现直接以订单实际保留时间为准，而不是由前端自行推导固定时长，更符合真实业务状态。

### 7.4 Capture 重试

`captureWithRetry()` 让支付闭环确认具备有限重试能力，降低了由于网络抖动、瞬时后端异常造成的“支付已完成但前端感知失败”问题。

---

## 8. AI 辅助架构设计

在本次 Payment 模块文档更新与架构复盘过程中，AI 主要承担架构辅助分析角色。

### 8.1 AI 辅助做了什么

1. **代码级架构回溯**
   通过通读 `domain / infrastructure / services / actions / components` 五层实现，反向还原当前真实架构。
2. **边界一致性校验**
   检查类型契约、服务编排、页面执行路径是否一致，识别“设计意图”和“代码现状”的偏差。
3. **支付商流程归类**
   将不同支付商统一归纳为 `SDK_CONFIRM / REDIRECT / SDK_POPUP / SUCCESS` 四类动作模型，帮助团队保持认知统一。
4. **风险点识别**
   明确识别出 PayPal / Affirm 当前存在“页面按 SDK_POPUP，Strategy 按 REDIRECT”的协议不一致问题。

### 8.2 AI 在本项目中的使用定位

在当前 Payment 模块中，AI 作为：

- **架构设计助手**
- **文档与代码一致性审阅助手**
- **方案评审加速器**

AI 的职责是提升分析与评审效率，而不是替代研发做最终架构决策。

最终架构仍然必须以以下事实为准：

- 仓库内真实代码实现
- 支付商官方集成约束
- 业务容错、合规和转化要求

### 8.3 AI 输出对团队的直接帮助

- 降低“文档落后于代码”的概率
- 更快发现层间职责漂移
- 在多支付商场景下，用统一语言描述差异与共性
- 在技术评审中更容易沉淀可复用的架构模板

---

## 9. 使用 AI 对当前架构合理性的评估

基于当前代码实现，AI 对该架构的评估结论为：**主干设计合理，分层边界清晰，协议一致性仍需继续收敛。**

### 9.1 设计合理的部分

#### 1. 分层边界是清晰的

- `domain` 负责契约
- `infrastructure` 负责 provider 适配
- `services` 负责业务编排
- `actions` 负责服务端入口与 traceId 注入
- `components` 只负责状态与交互

这是一个具备可维护性与可演进性的支付架构基础形态。

#### 2. `ActionSchema` 抽象是成立的

对多支付商系统而言，最难统一的并非 API 参数，而是“初始化后客户端的下一步动作”。当前通过 `ActionSchema` 统一该问题，能够显著降低 UI 对 provider 分支的侵入。

#### 3. 把 `createOrder` 留在客户端是合理的

该设计不是妥协性保留，而是基于现有错误语义体系做出的合理边界划分。

#### 4. 订单恢复与残留清理逻辑具备较强工程价值

很多支付方案仅覆盖 happy path，但在刷新、回退、失败重试场景下会出现状态错乱。当前实现已将这些场景纳入主流程治理范围，说明方案具备较好的工程完整性。

### 9.2 当前仍需收敛的点

#### 1. PayPal / Affirm 协议尚未完全统一

组件层期望 `SDK_POPUP`，Strategy 仍返回 `REDIRECT`，这会导致设计描述与代码行为存在张力。

#### 2. Redirect 类支付方式的回调闭环仍需补齐

GrabPay / ZipPay 等流程的跳转能力已经具备，但完整 callback route、回跳参数解析、capture 触发路径还需要继续完成。

#### 3. 2C2P 页面层 SDK 接线尚未完全接上

Service 与 Strategy 已经为 2C2P 定义了统一入口，但组件层确认处理还处在预留阶段。

### 9.3 评估结论

从当前实现状态看，Payment 模块可归纳为：

- **主骨架已完成**
- **Stripe 主路径已可作为模板路径**
- **多支付商统一模型已建立**
- **部分 provider 仍在向统一协议收敛**

该结论说明当前设计已经具备持续扩展能力，下一阶段重点应放在协议一致性与长尾闭环补齐上。

---

## 10. 使用 AI 对方案与行业实践的同步性评估

从当前代码结构和主流程看，该方案与行业主流实践总体保持同步，主要体现在以下三个方面。

### 10.1 以服务端作为支付编排与安全边界

当前 `actions -> services -> infrastructure` 的设计，本质上是在 Next.js 应用中建立一个轻量 BFF 层，用于：

- 注入 `traceId`
- 承接敏感支付初始化逻辑
- 隔离客户端与后端支付接口
- 统一 provider 适配层

这与行业中“前端负责交互，服务端负责支付编排与安全控制”的主流模式一致。

### 10.2 Stripe 采用客户端确认模型，符合官方约束

当前 Stripe 主流程是：

- 客户端 `elements.submit()`
- 服务端初始化 payment intent
- 客户端 `stripe.confirmPayment(clientSecret)`
- 服务端 capture

这与 Stripe Payment Element 官方推荐的浏览器端确认模式一致，尤其符合 3DS / SCA 场景要求。

### 10.3 PayPal 采用 SDK callback 模型，方向是正确的

当前组件层的 `PayPalButtons(createOrder / onApprove)` 设计，与 PayPal JS SDK 主流接入模式保持一致，说明：

- 页面层的交互建模方向是正确的
- 当前需要继续对齐的是服务端 Strategy 返回的动作协议，而不是推翻页面集成方式

### 10.4 行业同步性结论

从架构范式看，当前方案与行业同步；  
当前 Payment 架构在设计方向上与行业主流实践保持一致，且已在 Stripe 主路径中完成较高程度落地；多支付商的全面一致化仍在持续推进。

---

## 11. 该设计对业务的直接价值

### 11.1 对收入与转化

- 支付页刷新恢复、残留 payment 清理、capture 重试，能减少用户在支付末端的流失
- Express Checkout、Stripe 主路径标准化，有利于提升快捷支付体验
- 倒计时与订单状态显式管理，降低用户对“订单是否还有效”的不确定感

### 11.2 对市场扩展

- 新市场接入新支付商时，不必重写 payment 页主流程
- 大部分新增成本被压缩到 Strategy 和少量组件适配内
- 更适合支撑多国家、多 provider 的渐进式扩张

### 11.3 对稳定性与可运维性

- `traceId` 注入让链路排查具备统一入口
- Strategy 内统一打点，便于区分是 initiate 失败、capture 失败还是 rollback 失败
- 错误不再集中堆在一个大组件中，更容易分段定位

### 11.4 对研发效率与治理

- 设计讨论可以围绕统一动作模型进行，减少 payment 商家级别的沟通噪音
- 新人理解成本下降，不需要从一个超大组件逆向推导整条链路
- 文档、代码、架构视图可以逐步统一，降低后续维护成本

---

## 12. 结论

Payment 模块当前已形成分层清晰、职责明确、可持续扩展的架构形态。

从当前实现看，该设计已经具备以下核心特征：

- 架构边界更清晰
- 多支付商模型更统一
- 支付页状态恢复能力更强
- 服务端编排与客户端交互职责划分更合理

---

## 14. 参考依据

- 代码事实来源：当前仓库 `payment` 模块实现
- Stripe Payment Element 官方文档：[https://docs.stripe.com/payments/payment-element](https://docs.stripe.com/payments/payment-element)
- PayPal JavaScript SDK / Buttons 官方文档：[https://developer.paypal.com/sdk/js/reference/](https://developer.paypal.com/sdk/js/reference/)
- Next.js Server Actions 官方文档：[https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
