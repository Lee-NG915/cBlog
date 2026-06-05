# Guardsman 保险校验设计

## 背景

当前新保险接入分为两个阶段：

- PDP / Cart 负责获取可用保险、展示保险方案、把用户选择的保险写入购物车。
- Checkout / Place Order 负责在下单前校验已选保险是否仍然有效。

本设计只描述前端在 WEB / POS 中应该触发哪些校验和刷新动作，不替代后端 `validate-offer`、`register-policy` 的实现。

## 当前已实现

### PDP

- 通过 Guardsman product discovery 获取当前商品可用保险。
- PDP 展示使用 Guardsman 原始 plan 字段：`id`、`text`、`price`、`term`、`providerSku`、`offerId`。
- Add to Cart 时，Order V2 cart API 按当前 provider 组装保险字段：
  - `mulberry`：继续传旧字段 `warrantyId`。
  - `guardsman`：传新字段 `warranty: { vendor, offerId }`。

### Cart

- 进入 cart page 时调用 Prosuro `cart(cartLines)`。
- Cart line 更新后，页面会基于 Redux 最新 cartRoot 重新调用 `cart(cartLines)`。
- 点击 `Add extended warranty` 前，会再调用一次 `cart(cartLines)`，再用刷新后的 `productId` 和 `price` 调用 `open(productId, price)`。
- 添加保险成功后，会重新调用 `cart(cartLines)`。
- 删除保险成功后，会重新调用 `cart(cartLines)`。

## 后续需要实现的校验

### Cart 页面进入校验

触发时机：

- 用户进入 Cart 页面。
- 用户打开 Cart Drawer。
- Cart 商品数量变化、商品删除、商品恢复、zipcode 更新、优惠变化后。
- 用户删除保险后。

目标：

- 调用 `cart(cartLines)`，刷新每个 line item 的 eligibility 和 plans。
- 如果 line item 已有保险，仍由购物车返回的 `warrantyItem` 决定是否展示已选保险，不用 Prosuro plans 决定。
- 如果当前 provider 已切到 Guardsman，但购物车中仍存在旧 Mulberry warranty，后续应接入后端清理接口或 checkout init 校验结果，再提示用户重新选择。

### Checkout Init 校验

触发时机：

- 用户在 Cart 点击 Checkout。

目标：

- 在 `initCheckout` 前校验购物车中已选保险的 vendor 是否与当前 provider 一致。
- 如果当前 provider 是 Guardsman，但 cart 中存在 Mulberry warranty，应阻止进入 checkout，触发旧保险清理和提示。
- 如果当前 provider 是 Mulberry，则保持旧逻辑，不执行 Guardsman 校验。

当前状态：

- 尚未实现 vendor 不一致拦截。
- 当前代码只保证 Cart 页会按 Guardsman 文档重新调用 `cart()`。

### Place Order 校验

触发时机：

- 用户在 Payment 点击 Place Order。

目标：

- 对所有已选 Guardsman warranty 调用 `validate-offer`。
- 如果 offer 无变化，继续使用 checkout 缓存的保险信息下单。
- 如果 offer 不可用，提示用户并移除失效保险。
- 如果 offer 价格变化，提示用户接受变化后继续下单。
- 如果 `validate-offer` 接口失败，按 PRD 降级为使用 checkout 缓存的保险信息继续下单。

当前状态：

- 尚未实现 `validate-offer`。
- 需要后续补充 Guardsman REST API 文档和后端接口契约后再接入。

## 实现原则

- 旧 Order V1 链路只处理 Mulberry，不接入 Guardsman。
- Order V2 cart API 才做 provider-aware 入参组装。
- `mulberry` provider 下只发旧字段：`warrantyId` / `warrantyOfferId`。
- `guardsman` provider 下只发新字段：`warranty: { vendor, offerId }`。
- Cart 的 Prosuro `cart()` 只用于 eligibility / plans 刷新，不直接改写购物车数据。
- 购物车中已选保险的展示和删除仍以后端 cart response 的 `warrantyItem` 为准。
