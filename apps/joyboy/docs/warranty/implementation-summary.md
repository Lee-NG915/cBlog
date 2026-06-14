# 新保险服务首期接入实现说明

## 1. 本次实现覆盖了什么

本次实现只覆盖了新保险服务的**首期前端接入能力**，重点是：

1. 新保险服务基础配置接入
2. 保险供应商硬编码选择能力
3. Prosuro / Guardsman widget 脚本加载与初始化
4. PDP 商品保险可投保性查询
5. PDP 自定义保险选项展示
6. Add to Cart 继续携带有效 warranty offer 参数

本次**没有**实现：

- Guardsman 的 Cart modal 打开能力
- Checkout 最终校验
- 下单后 policy 注册
- 订单侧保险状态同步

## 2. 本次修改了什么

### 2.1 配置层

新增了 Guardsman 相关环境变量定义：

- `NEXT_PUBLIC_GUARDSMAN_PUBLIC_KEY`
- `NEXT_PUBLIC_GUARDSMAN_WIDGET_SDK`

涉及文件：

- `libs/config/src/ec-env.ts`
- `apps/web/etc/templates/env.ejs`
- `apps/pos/etc/templates/env.ejs`

同时在 `libs/config/src/warranty-provider.ts` 中新增了保险 provider 基础能力：

- 当前市场使用哪个 provider
- 当前 provider 的运行时配置
- Guardsman widget 初始化
- Guardsman product API 调用

### 2.2 供应商选择逻辑

当前按你的要求，采用**硬编码 provider 选择**：

- `CA -> guardsman`
- `US -> mulberry`
- 其他市场 -> `null`

实现位置：

- `libs/config/src/warranty-provider.ts`

说明：

这不是多供应商并存设计，而是“每个市场同一时间只有一个有效 provider”的实现方式。

### 2.3 共享能力层

在 `sharedFeatureService` 中补充了 warranty 能力判断：

- `getWarrantyProvider()`
- `getWarrantyRuntimeConfig()`
- `isGuardsmanEnabled()`
- `isWarrantyEnabled()`
- `supportsPdpWarranty()`
- `supportsCartWarrantyModal()`

实现位置：

- `libs/shared/services/src/lib/features/feature-service.ts`

说明：

这里保留了原有 Mulberry feature flag 判断，同时对 Guardsman 做了运行时配置判断。

### 2.4 Script Loading 层

新增了通用的 `WarrantyProviderManager`，负责：

- 如果当前 provider 是 `mulberry`，复用原有 `MulberryManager`
- 如果当前 provider 是 `guardsman`，加载 Prosuro widget script 并初始化 `ProsuroWidget`

实现位置：

- `libs/shared/components/src/lib/warranty-provider-manager/warranty-provider-manager.tsx`

接入点：

- Guardsman PDP 组件内部
- 后续如需要 Guardsman 全局场景，再单独挂到对应入口

### 2.5 PDP 数据链路

我修改了 `product.listener.ts` 的 warranty 数据获取逻辑，使其按当前 provider 分流：

- `mulberry`：继续走原有 `window.mulberry.core.getWarrantyOffer`
- `guardsman`：改走 `ProsuroWidget.product(...)`

并将 Guardsman 的返回结果标准化成当前项目已有的 `WarrantyOffer[]` 结构，以复用：

- `selectedOfferId`
- `selectCurrentWarrantyOffer`
- Add to Cart 中现有的 `warranty_offer_id` 读取逻辑

实现位置：

- `libs/modules/product/services/src/product.listener.ts`
- `libs/modules/product/domain/src/entity/warranty.entity.ts`

### 2.6 PDP 组件层

为了避免影响旧的 Mulberry 组件逻辑，我把 Guardsman 逻辑拆到了**新的组件文件**中，没有继续在 Mulberry 专用组件里混入 Guardsman 分支：

- 保留旧组件：
  - `libs/modules/product/components/src/lib/product-mulberry/product-mulberry.tsx`
  - `libs/modules/product/components/src/lib/product-mulberry/product-mulberry-picker.tsx`
  - `libs/modules/product/components/src/lib/product-options/warranty-info.tsx`
- 新增 Guardsman 组件：
  - `libs/modules/product/components/src/lib/product-guardsman/product-guardsman.tsx`
  - `libs/modules/product/components/src/lib/product-guardsman/product-guardsman-picker.tsx`
  - `libs/modules/product/components/src/lib/product-options/warranty-guardsman-info.tsx`
- 新增 WEB 入口分流组件：
  - `libs/modules/product/components/src/lib/product-guardsman/product-warranty.tsx`

具体行为：

- `mulberry` 下继续走原来的 Mulberry 组件与原逻辑
- `guardsman` 下只走新 Guardsman 组件
- WEB 在组件入口按 provider 分流
- POS 直接在页面入口按 provider 分流，不增加 Mulberry 中间包装层

涉及文件：

- `apps/web/app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx`
- `apps/pos/app/[locale]/products/[slug]/page.tsx`
- `apps/pos/app/[locale]/discover/[slug]/page.tsx`

## 3. 为什么这么做

### 3.1 为什么 provider helper 放在 `libs/config`

原本按架构设计，provider resolver 更适合放在 `shared/services`。

但实际实现时，`modules-product-services -> shared-services` 会触发当前仓库的 Nx 循环依赖检查，因为 `shared-services` 项目本身已经通过其他链路反向依赖了 `product-services`。

因此这次我把最基础、最底层的 provider helper 下沉到了 `libs/config`：

- 不改变整体设计方向
- 但能满足当前项目真实依赖边界
- 避免为了接保险去拆已有 shared-services 依赖网

换句话说：

**设计上这是共享运行时能力；实现上为了适配当前仓库边界，先放到了 config 基础层。**

### 3.2 为什么复用现有 `warranty_offer_id` 选中链路

当前项目中，PDP -> ATC 的 warranty 链路已经大量依赖：

- `selectedOfferId`
- `selectCurrentWarrantyOffer`
- `currentWarrantyOffer?.warranty_offer_id`

如果这次直接引入一整套全新 selected plan state，会同时影响：

- product domain
- product add-to-cart
- cart services
- order helper

这会把首期范围明显放大。

所以本次实现选择了：

- 保留现有 selected state 结构
- 把 Guardsman 的 `offerId` 标准化映射到 `warranty_offer_id`
- 保留 Mulberry 现有组件与 Add to Cart 主链路不变

这样可以让 Add to Cart 继续使用现有参数通路，只替换 PDP 的 plan 数据来源。

### 3.3 为什么要新建 Guardsman 组件，而不是直接改 Mulberry 组件

因为本次接入的前提之一是：

**不能影响旧保险服务逻辑。**

如果直接在以下旧组件中继续混入 Guardsman 条件分支：

- `ProductMulberry`
- `ProductMulberryPicker`
- `WarrantyInfo`

会带来两个风险：

1. 旧市场逻辑变得难以回归验证
2. Mulberry 专用 UI 与 Guardsman UI 未来继续耦合

所以这次改成：

- 旧 Mulberry 文件恢复原逻辑
- Guardsman 逻辑全部进入新文件
- 只在页面入口或关键服务逻辑做 provider 分流

这样更容易确认“旧逻辑没被改坏”，也更符合你要求的隔离方式。

### 3.5 为什么又收回了一部分中间层

在接入初版里，我一度为 POS 做了额外的 provider wrapper 和 Mulberry ready 中间层。

实际回归时，`US POS` 出现了：

- PDP warranty 一直处于 loading
- 页面没有再发起 Mulberry 的 `get_personalized_warranty`

这说明问题不是 Mulberry API 本身，而是旧 POS 链路的页面入口和触发时序被我改坏了。

因此后续调整改成了更严格的隔离方式：

- POS 的 `mulberry` 直接回到旧 `WarrantyInfo`
- POS 的 `guardsman` 直接走新 `WarrantyGuardsmanInfo`
- 不再让旧 Mulberry 链路经过额外包装层
- `product.listener.ts` 里只对 Guardsman 增加必要分支，不改变旧 Mulberry 的主行为

这也是当前版本最重要的实现原则：**旧逻辑原样保留，新逻辑只加在分支上。**

### 3.4 为什么没有实现 Guardsman Cart modal

你给的开发文档目前只覆盖了：

- Script loading
- Widget init
- Product API

没有给出 Cart modal 对应的打开 API、回调事件、选中 plan 返回结构。

在这种情况下，如果硬写 Cart modal 接口，风险很高，容易接错。

因此本次实现策略是：

- 先把 provider 选择、script loading、widget init、PDP product API 打通
- Cart 侧先只铺 provider 基础能力
- 等你给出 Cart modal 文档后，再接 Cart 场景

## 4. 当前行为变化

### 4.1 CA 市场

当前硬编码下：

- PDP warranty 将走 `guardsman`
- PDP 会通过 `ProsuroWidget.product(...)` 获取可用 plans
- PDP 自定义选择器会展示 Guardsman 返回的 plan
- Add to Cart 仍会携带标准化后的 `warranty_offer_id`

### 4.2 US 市场

当前硬编码下：

- 继续使用 `mulberry`
- 原有 PDP warranty 逻辑保留
- POS 页面已经恢复成旧组件直连，不再经过新增 wrapper

## 5. 已知副作用 / 限制

### 5.1 Cart 的 Guardsman add-warranty 按钮当前不会启用

当前 `supportsCartWarrantyModal()` 对 `guardsman` 返回 `false`。

原因：

- 现阶段没有 Cart modal API 文档
- 不应伪造实现

实际影响：

- 在 `CA` 走 Guardsman 的情况下，Cart 侧不会沿用旧的 Mulberry modal 入口
- 这属于**刻意保留**的限制，不是遗漏

### 5.2 Guardsman 当前默认使用 sandbox 配置兜底

如果环境变量未配置：

- `publicKey` 会回退到文档里的 sandbox key

影响：

- 本地开发更容易直接联调
- 但正式环境仍建议补齐真实配置，避免依赖默认值

### 5.3 目前 Add to Cart 仍然只走 offerId 主链路

本次没有扩展 cart line item / ATC request 结构去显式携带：

- `planId`
- `providerSku`

原因：

- 当前项目现有 Add to Cart 主链路只认 `warrantyId` / `warranty_offer_id`
- 你提供的这批文档也还没有覆盖前后端 add-to-cart contract 的完整扩展方式

这意味着：

- PDP 选中态里已经拿到了 Guardsman 的 `plan.id` 和 `providerSku`
- 但当前首期实现里，真正传入加车主链路的仍然是 `offerId`

如果后续后端需要更多字段，需要在下一阶段扩展 cart / order contract。

### 5.4 全局 Mulberry 入口已恢复，不再被 Guardsman 替换

我最初把：

- `apps/pos/app/[locale]/layout.tsx`
- `apps/web/app/[deviceTheme]/[region]/[locale]/cart/page.client.tsx`

中的 `MulberryManager` 替换成了通用 manager。

为了避免影响旧保险逻辑，这一改动已经收回：

- 这两个全局入口现在继续保留旧的 `MulberryManager`
- Guardsman 的 script loading 只在新 Guardsman 组件中使用 `WarrantyProviderManager`

这样可以避免全局 script 入口变化对旧 Cart / POS 流程产生连带影响。

## 6. 验证情况

我完成了：

- 相关文件格式化
- 对关键改动文件做 ESLint 检查

说明：

- `product-mulberry-picker.tsx` 的新增 warning 已处理
- `product.listener.ts` 所在项目仍存在该文件原本就有的 Nx 循环依赖告警链，这不是本次新保险改动单独引入的问题
- 因为仓库本身该文件已经处在循环依赖图中，所以没有在这次任务里扩大处理范围

## 7. 后续建议

你下一步如果继续给我文档，建议优先补下面任一部分：

1. Cart modal 打开 API 与选中回调
2. Add to Cart / cart line item 需要携带的完整参数 contract
3. Checkout validate-offer 文档
4. Order policy register 文档

这样我可以继续按当前这套首期基础实现往下接，不需要再重构一次。
