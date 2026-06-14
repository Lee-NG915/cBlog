# 新保险服务接入架构设计

## 1. 背景

当前项目已经存在 warranty 业务位点，但整体实现与 `Mulberry` 强绑定，主要表现为：

- 运行时环境变量与脚本加载是 Mulberry 专用
- PDP warranty 数据获取是 Mulberry 专用
- Cart add/remove warranty 入口是 Mulberry 专用
- Add to Cart 时仅携带 `warrantyOfferId`

本次新保险服务接入，当前优先目标不是完整订单生命周期迁移，而是先完成以下首期能力：

1. 完成新保险服务的基础配置
2. 对外暴露 PDP 与 Cart 两个场景的统一调用方法
3. 对外暴露 PDP 商品保险可用性校验方法
4. 支持 PDP：
   - 判断当前商品是否存在可用保险服务
   - 在存在可用保险时展示自定义选择组件
   - Add to Cart 时携带有效保险参数
5. 支持 Cart：
   - 对可投保商品显示 add warranty 入口
   - 点击后打开保险服务商提供的弹窗

## 2. 最新业务前提

- `CA`：随着 ORDER 重构上线，会同步切到新保险服务
- `US`：当前仍不确定，可能使用新保险，也可能继续使用旧保险
- 每个有保险的市场，在同一时间只会启用一家保险服务商
- 当前切换方式不是同一市场动态多供应商编排，而是通过某个开关硬编码选择 `Mulberry` 或 `Guardsman`
- 因此前端需要支持“按市场解析当前唯一激活的 provider”，而不是“同一市场同时支持多个 provider”

## 3. 目标

- 在 `WEB` 与 `POS` 间共用同一套保险基础能力
- 避免继续沿用当前“页面组件直接感知供应商 SDK 细节”的模式
- 保持与当前 monorepo 分层一致：
  - 配置放在 `libs/config`
  - 跨应用运行时解析放在 `libs/shared/services`
  - PDP 状态与编排放在 `libs/modules/product`
  - Cart 行为放在 `libs/modules/cart`
- 为后续按市场切换供应商保留空间，避免重写页面级逻辑

## 4. 非目标

本文件暂不定义以下内容：

- Checkout 最终下单前校验流程
- 支付后正式保险单注册流程
- Order / Order Detail 中的最终数据落库设计
- 旧保险数据迁移与清理策略
- 新保险服务 API 字段的最终映射细节

这些内容在首期架构评审通过后，再配合开发文档补充。

## 5. 现状约束

### 5.1 当前模块归属

- `libs/config`
  - 定义 Mulberry 运行时环境变量，例如 `NEXT_PUBLIC_MULBERRY_PUBLIC_TOKEN`、`NEXT_PUBLIC_MULBERRY_SDK`
- `libs/shared/services`
  - 提供 `sharedFeatureService` 这类运行时 feature gating
- `libs/shared/components`
  - 提供 `MulberryManager`，负责脚本加载与 SDK 初始化
- `libs/shared/utils`
  - 提供 Mulberry 相关 helper，例如 payload 格式化、modal 初始化
- `libs/modules/product/domain`
  - 存储 PDP 的 warranty list、selected offer 等状态
- `libs/modules/product/services`
  - 在 product/variant 变化时拉取 PDP warranty 数据
- `libs/modules/product/components`
  - 渲染 PDP warranty UI
- `libs/modules/cart/domain`
  - 暴露 add/remove warranty API
- `libs/modules/cart/components`
  - 渲染 Cart/POS warranty 交互入口

### 5.2 当前模式的问题

- 供应商相关代码散落在 config、utils、shared component、product component、cart component
- `Mulberry` 同时承担了“供应商名称”和“业务能力开关”的语义
- warranty 共享状态不是 vendor-neutral 的
- 页面组件知道过多供应商 SDK 细节
- 当前 Add to Cart 结构只暴露一个 warranty key，缺少后续扩展 richer payload 的稳定承接点
- 当前“使用哪家供应商”的切换能力没有独立抽象，后续从 Mulberry 切到 Guardsman 时容易把切换逻辑散落在多个页面和组件里

## 6. 目标架构

### 6.1 分层设计

新保险接入建议拆成四层。

### A 层：运行时配置层

模块：

- `libs/config`

职责：

- 定义新保险服务所需环境变量
- 暴露原始运行时配置
- 保持 `WEB` 与 `POS` 的模板注入入口一致

典型内容：

- public key
- widget / sdk url
- environment id
- 可选默认 vendor 标识

这一层不承担业务分流逻辑。

### B 层：保险运行时解析层

模块：

- `libs/shared/services`

职责：

- 解析当前市场下唯一激活的保险供应商
- 解析当前市场 / 渠道是否支持保险能力
- 提供 vendor-neutral 的能力判断方法
- 向上层暴露整理后的运行时配置

建议能力示例：

- `isWarrantyEnabled()`
- `getWarrantyProvider()`
- `getWarrantyRuntimeConfig()`
- `supportsPdpWarranty()`
- `supportsCartWarrantyModal()`

这一层最适合承接“CA 固定新保险、US 待定，通过开关硬编码切换”这类业务规则。

### C 层：业务编排层

模块：

- `libs/modules/product/domain`
- `libs/modules/product/services`
- `libs/modules/cart/domain`

职责：

- 维护标准化后的 warranty state
- 提供 PDP 商品可投保性查询、plan 加载、选中态维护
- 提供 Cart add/remove warranty 操作
- 在 UI 与 API 之间提供 vendor-neutral 的业务数据结构

这一层负责业务意义，不直接暴露原始 SDK 细节。

### D 层：UI 适配层

模块：

- `libs/modules/product/components`
- `libs/modules/cart/components`
- 如有需要，`libs/shared/components` 可承接 provider 的 script/bootstrap 壳层

职责：

- 渲染 `WEB` / `POS` UI
- 调用共享的 domain/service 方法
- 保持应用层展示差异，不污染共享业务编排

## 7. 推荐模块落点

### 7.1 `libs/config`

应放置：

- 新保险服务环境变量定义
- `apps/web` 与 `apps/pos` 的 env 模板注入

不应放置：

- 商品保险可用性判断
- 页面级分流逻辑
- SDK 初始化逻辑

### 7.2 `libs/shared/services`

应放置：

- `warranty-feature.service.ts` 或等价的 vendor-neutral resolver
- market / channel / provider 解析逻辑
- 运行时配置读取与整理 helper

原因：

- 这是跨应用共享层
- 当前 `sharedFeatureService` 已经承担类似职责
- 这里最适合集中处理 CA / US 的 provider 选择开关

### 7.3 `libs/modules/product/domain`

应放置：

- PDP 使用的标准化 warranty entity
- 当前选中 plan 状态
- loading / availability / error 状态

原因：

- 当前项目已经把 PDP warranty 视为 product state 的一部分
- `WEB` 与 `POS` PDP 都依赖 product state，即使最终 UI 不同

### 7.4 `libs/modules/product/services`

应放置：

- provider-neutral 的 PDP 加载命令
- provider-neutral 的商品保险可用性校验方法
- 供应商返回结果到 product-domain state 的标准化逻辑
- Add to Cart 所需 warranty 入参准备逻辑

原因：

- 当前 PDP warranty 获取本来就在 product services / listener 中编排
- 如果把这层挪走，会和现有项目结构冲突

### 7.5 `libs/modules/product/components`

应放置：

- WEB PDP warranty selector
- POS PDP warranty selector
- 如两端样式接近，可抽共用展示子组件

原因：

- 两端 UI 可能不同
- UI 差异不应导致 domain/service 复制一份

### 7.6 `libs/modules/cart/domain`

应放置：

- vendor-neutral 的 cart warranty API
- add/remove/update action contract

原因：

- Cart warranty 的写操作天然属于 cart line item
- 当前项目里 warranty mutation 也已经在这里

### 7.7 `libs/modules/cart/components`

应放置：

- Cart add-warranty CTA
- Cart remove-warranty CTA
- modal 打开入口
- POS cart 的 warranty CTA 外壳

原因：

- Cart 交互应留在 cart 模块内部
- UI 可以分端差异化，但底层能力共用

### 7.8 `libs/shared/utils`

建议仅保留：

- 纯格式化 helper
- 纯数据转换 helper

不建议继续承载：

- 供应商生命周期管理
- 主业务编排
- 核心入口能力

这次新保险接入不应继续沿用当前“`shared/utils` 成为供应商主入口”的模式。

## 8. WEB / POS 共享与分端原则

### 8.1 两端共享的部分

以下能力应在 `WEB` 与 `POS` 共用：

- 运行时配置读取
- 当前供应商解析
- 商品保险可投保性查询
- plan 标准化
- 当前选中保险 plan 数据结构
- Add to Cart 的 warranty payload 组装
- Cart modal 调用包装层
- Cart add/remove warranty 业务 API

### 8.2 两端可以分开的部分

以下内容允许分端实现：

- PDP 选择器视觉布局
- Cart 按钮样式与文案表现
- 页面插入位置
- 如有需要的端侧 tracking 包装

原则：

**同一业务能力，共享能力层；不同展示形式，分开展示层。**

## 9. 职责模型建议

### 9.1 引入 vendor-neutral contract

后续接入时，不应继续让页面组件直接传递原始 vendor response。

建议引入以下中立概念：

- `WarrantyProvider`
- `WarrantyRuntimeConfig`
- `WarrantyAvailabilityResult`
- `WarrantyPlan`
- `SelectedWarrantyPlan`
- `CartWarrantyActionPayload`

这些 contract 建议主要落在 `product/domain` 与 `cart/domain`，运行时/provider 解析 helper 放在 `shared/services`。

### 9.2 引入 provider adapter 边界

即便运行时同一市场只会启用一个 provider，也建议先建立 provider adapter 边界。

这个边界应隐藏：

- sdk / widget bootstrap
- PDP 商品可投保性请求
- Cart modal 打开调用
- vendor response 标准化

对上只暴露：

- `loadProductPlans(...)`
- `openCartPlanModal(...)`
- `normalizeSelectedPlan(...)`
- `validateProductEligibility(...)`

该边界可以放在 shared services 下的 warranty 子目录，或者等价的共享层，但职责上应保持为跨端复用。

## 10. 场景设计

### 10.1 场景 A：PDP 自定义保险选择器

流程：

1. 页面加载商品与变体
2. product service 通过 shared warranty resolver 判断当前 provider
3. 若当前市场/渠道支持 warranty，则调用 provider adapter
4. adapter 返回标准化后的可投保结果与 plan 列表
5. product domain 存储标准化后的 plans 与 selected state
6. WEB / POS PDP 组件基于标准化 state 渲染自定义选择器
7. Add to Cart 时从标准化 selected plan 中读取有效参数并组装请求

职责归属：

- provider 解析：`shared/services`
- 数据加载与标准化：`modules/product/services`
- 状态维护：`modules/product/domain`
- 选择器 UI：`modules/product/components`
- ATC payload：`modules/product/services` + `modules/cart/services`

### 10.2 场景 B：Cart add-warranty modal

流程：

1. Cart 渲染 line item
2. cart component 判断该商品在当前 provider 下是否支持 add warranty
3. 用户点击 CTA 后，cart component 调用共享 provider modal wrapper
4. provider modal 返回标准化后的 selected plan
5. cart domain mutation 将 warranty 信息写回 cart

职责归属：

- provider 解析：`shared/services`
- modal wrapper：共享 provider adapter 层
- cart 写操作：`modules/cart/domain`
- 按钮 UI：`modules/cart/components`

## 11. 为什么这套架构能同时支持 WEB 和 POS

这套设计对 `WEB` 与 `POS` 都成立，原因是：

- 所有 provider 与 market 决策都在 UI 之前完成
- PDP state 天然就是 product domain 的共享能力
- Cart mutation contract 天然就是 cart domain 的共享能力
- 最终只把展示壳层留给应用端分开处理

结果是：

- `WEB` 与 `POS` 共用同一套 provider 解析与标准化 warranty state
- `WEB` 与 `POS` 可以保留不同的选择器与按钮表现
- 后续 US 若从旧供应商切到新供应商，更多是开关与解析逻辑变化，而不是页面重写

## 12. 首期实施边界

首期实现建议仅覆盖：

1. 新保险运行时配置
2. 共享 warranty provider resolver
3. PDP 可投保性判断
4. PDP 自定义选择器的数据通路
5. Add to Cart 携带有效 warranty 参数
6. Cart modal 调用入口抽象

首期不建议扩展到：

- checkout 最终校验
- 支付后 policy 创建
- order history / order detail 展示
- 旧保险清理自动化

## 13. 文件方向建议

这一节是方向性建议，不是最终文件名约束。

### 共享配置 / 运行时解析

- `libs/config/src/ec-env.ts`
- `apps/web/etc/templates/env.ejs`
- `apps/pos/etc/templates/env.ejs`
- `libs/shared/services/src/lib/features/feature-service.ts`
- 或新增 `libs/shared/services/src/lib/warranty/*`

### PDP

- `libs/modules/product/domain/src/entity/*`
- `libs/modules/product/domain/src/slice/*`
- `libs/modules/product/services/src/*`
- `libs/modules/product/components/src/lib/*`

### Cart

- `libs/modules/cart/domain/src/lib/api/*`
- `libs/modules/cart/domain/src/lib/entity/*`
- `libs/modules/cart/components/src/lib/*`

## 14. Review 重点

建议 review 时重点确认以下决策：

1. provider 解析是否放在 `libs/shared/services`
2. PDP warranty state 是否继续归属 `modules/product`
3. Cart modal 入口是否保留在 `modules/cart/components`，但底层 provider 逻辑抽离
4. `WEB / POS` 的“共享能力层 + 分开展示层”是否符合预期
5. 首期范围是否收敛得足够明确

## 15. 最终建议

结合当前 Joyboy 的架构边界，新保险服务首期接入建议采用以下模式：

- `libs/config` 作为运行时配置源
- `libs/shared/services` 作为保险 provider resolver 与能力开关层
- `libs/modules/product` 作为 PDP 场景编排中心
- `libs/modules/cart` 作为 Cart 场景交互与 mutation 中心
- 端差异只留在组件展示层

这是当前项目里改动最小、同时扩展性最好的方案，因为它：

- 贴合现有 monorepo 分层
- 能同时服务 `WEB` 与 `POS`
- 能降低供应商耦合
- 能为未来 US/CA 不同 vendor 策略保留空间
