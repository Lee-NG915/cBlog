---
issue_status: pending
date: 2026-05-26
scope: test-us merge pre-commit lint failures
markets: US
source_branch: merge/master-into-orp-merged-dev-2026-05-21
target_branch: test-us
---

> **备注**：循环引用（Circular dependency）问题在其他分支已修复，待合并。本文档仅记录现状，便于追踪剩余非循环依赖类问题及合并阻塞情况。

# test-us pre-commit lint failures — 概览

将 `merge/master-into-orp-merged-dev-2026-05-21` 合并到 `test-us` 时，冲突手动解决后 `git commit` 触发 husky pre-commit hook，被 lint-staged 的 `eslint --fix` 拦截。

总计 **~59 个 ESLint 错误**，分布在 **~43 个文件**，全部来自 incoming 分支自带代码，不是冲突解决产生的。

## 4 类错误（按数量）

| 错误类别                                                      | 数量 | 规则                                            |
| ------------------------------------------------------------- | ---: | ----------------------------------------------- |
| Circular dependency（循环依赖）— **已在其他分支修复，待合并** |   44 | `@nx/enforce-module-boundaries`                 |
| Static imports of lazy-loaded libraries                       |    8 | `@nx/enforce-module-boundaries`                 |
| Module boundary tag 不允许的依赖                              |    6 | `@nx/enforce-module-boundaries`                 |
| Layout 缺少 `<SentryContextProvider>`                         |    1 | `observability/layout-requires-sentry-provider` |

## 1. Circular dependencies — 已在其他分支修复，待合并

23 个唯一环路，主要在 `shared-redux-services` ↔ `shared-services` ↔ 各 modules 之间：

```
modules-cart-domain        → shared-redux-services → shared-services → modules-tracking-services → modules-cart-domain
modules-checkout-domain    → shared-redux-services → shared-services → shared-redux-store → modules-checkout-domain
modules-composite-components ↔ modules-order-components
modules-composite-components ↔ modules-product-components
modules-composite-services ↔ modules-cart-services
modules-order-domain       → shared-redux-services → shared-services → modules-order-domain
modules-product-domain     → shared-redux-services → shared-services → modules-product-domain
modules-product-domain     → modules-retails-domain → shared-redux-services → shared-services → modules-product-domain
modules-product-services   → modules-order-domain   → shared-redux-services → shared-services → modules-product-services
modules-product-services   → modules-product-domain → shared-redux-services → shared-services → modules-product-services
modules-product-services   → modules-user-domain    → shared-redux-services → shared-services → modules-product-services
modules-product-services   → shared-redux-store     → modules-promotion-domain → shared-services → modules-product-services
modules-promotion-domain   → shared-redux-services → shared-services → modules-promotion-domain
modules-promotion-domain   → shared-services → modules-promotion-domain
modules-tracking-domain    → shared-redux-services → shared-services → modules-tracking-services → modules-tracking-domain
modules-tracking-services  → modules-product-domain → shared-redux-services → shared-services → modules-tracking-services
modules-tracking-services  → modules-tracking-domain → shared-redux-services → shared-services → modules-tracking-services
modules-tracking-services  → shared-redux-store → modules-promotion-domain → shared-services → modules-tracking-services
modules-user-domain        → shared-redux-services → shared-services → modules-tracking-services → modules-user-domain
shared-redux-services ↔ shared-services (经 modules-payment-domain)
shared-services → modules-order-domain → shared-redux-services → shared-services
shared-services → modules-payment-domain → shared-redux-services → shared-services
```

## 2. Static imports of lazy-loaded libraries（8 处，全部在 POS composite 文件）

```
libs/modules/composite/components/src/lib/address/pos-add-address/pos-add-address.tsx
libs/modules/composite/components/src/lib/address/pos-add-address/pos-add-address_v2.tsx
libs/modules/composite/components/src/lib/checkout-address-list/checkout-address-list.tsx
libs/modules/composite/components/src/lib/pos-checkout-section/pos-checkout-section.tsx
libs/modules/composite/components/src/lib/pos-checkout-shipping-method/pos-checkout-shipping-method.tsx
libs/modules/composite/components/src/lib/push-to-online-button/push-to-online-button.tsx
```

## 3. Module boundary tag 违规（6 处）

```
libs/modules/cart/components/src/lib/pos-checkout-button/pos-checkout-buttonV2.tsx
  → type:components 依赖了不允许的 tag

libs/modules/checkout/components/src/lib/shipments/pos-shipment-item/pos-shipment-item.tsx
  → type:components 依赖了不允许的 tag

libs/modules/composite/components/src/lib/address/pos-select-address/pos-select-address.tsx
  → type:composite-components 依赖了不允许的 tag

libs/modules/composite/services/src/composite.listener.ts
  → scope:composite 依赖了 scope:tracking（来自 cart.listener.ts）

libs/shared/redux/store/src/rootReducer.ts
  → 经依赖图被多个文件触及
```

## 4. Layout 缺少 SentryContextProvider（1 处）

```
apps/web/app/[deviceTheme]/[region]/[locale]/(checkout)/checkout/account/layout.tsx
  → observability/layout-requires-sentry-provider
```

⚠️ 注意：`AGENTS.md § Observability Hard Rules` 明确 _"Checkout / Payment / Cart: integration blocked — 这些模块尚未迁移到 joyboy，不要在 checkout/payment/cart 代码加 Sentry instrumentation"_。所以这条错误按规则不应该硬性 enforce 在 checkout layout 上 —— 可能是 lint 规则没把 checkout 路径排除。

## 关键判断

- 所有错误都 **不在合并冲突的 7 个文件**里。`git checkout --theirs` 后这些文件本身是干净的。
- 错误是 **incoming 分支（master + orp-dev merge）固有的** —— master/orp-dev 本身能 commit，说明合到 master 时 pre-commit hook 被绕过过（merge auto-commit 不经过 lint-staged）。
- `test-ca` 合并能直接通过是因为 **fast-forward / 自动 merge commit 不触发 lint-staged**（lint-staged 只在 staged file commit 时跑）。test-us 因为有冲突手动 `git commit` 才触发了 hook。

## 冲突文件清单（已用 `--theirs` 解决）

```
apps/web/app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx
libs/fortress/src/Icons/index.ts
libs/modules/product/components/src/lib/product-config/components/product-configurable-options/product-options-values.tsx
libs/modules/product/components/src/lib/product-details/components/product-property-paris.tsx
libs/modules/product/components/src/lib/product-info/components/product-info-item.tsx
libs/modules/product/components/src/lib/product-info/product-info.client.tsx
libs/modules/product/services/src/product.helper.ts
```

## 后续待办

- [ ] 合入循环依赖修复分支后，重跑 `pnpm lint:observability` 与 `eslint --fix` 验证
- [ ] Static lazy import 8 处：确认是否为 POS 端预期模式，需要单独修复
- [ ] Module boundary tag 6 处：确认依赖方向，调整 tag 或拆分
- [ ] checkout/account/layout.tsx 的 SentryContextProvider 规则：与 AGENTS.md "checkout integration blocked" 规则冲突，需要要么调整 lint 规则忽略 checkout 路径，要么补 Provider
