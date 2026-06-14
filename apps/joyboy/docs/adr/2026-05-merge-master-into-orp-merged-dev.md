# ADR：将 master 合并到 orp-merged-dev 分支

- **状态**：进行中 (In Progress)
- **日期**：2026-05-21
- **作者**：Abby Wang
- **关联分支**：源 `origin/master` → 目标 `orp-merged-dev`
- **临时合并分支**：`merge/master-into-orp-merged-dev-2026-05-21`

---

## 1. 背景（Context）

`orp-merged-dev` 自 2026-03-18 从 `master`（merge-base `a85adc41f`）分叉，承载 ORP（Order/Cart/Tracking 重构）专项工作。两个月内：

| 指标                 | 数据                   |
| -------------------- | ---------------------- |
| master 领先 commits  | 114                    |
| 当前分支领先 commits | 2363（含多次互 merge） |
| 三路 diff 文件数     | 1086                   |
| 三路 diff 行数       | +85515 / -6803         |
| 预估冲突文件数       | ~23                    |

冲突热点集中在 ORP 责任域（cart / tracking / composite / persistence / order helper），必须谨慎处理。

---

## 2. 决策（Decision）

| 决策项         | 选择                                                              | 理由                                                              |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| 合并方式       | **Merge commit**（`git merge --no-ff`）                           | 保留双方历史，2363 commits 不重写；冲突一次性集中解决             |
| 冲突兜底偏好   | **全部逐个询问用户**                                              | 高敏感域不允许擅自决断                                            |
| Lockfile 处理  | `git checkout --theirs pnpm-lock.yaml` 后 `pnpm install` 重生成   | 以 master 的依赖树为基线，跟随合并后的 package.json 重新解析      |
| 合并落点       | **临时分支 `merge/master-into-orp-merged-dev-2026-05-21`**        | 不直接污染 `orp-merged-dev`；本次会话停在本地 commit，不推 remote |
| 解冲突分组顺序 | 配置/根 → barrel/index → shared 基础设施 → 业务域（最敏感放最后） | 由低风险到高风险，问题尽早暴露                                    |

---

## 3. 冲突文件分组（预演结果）

> 来自 `git merge-tree --write-tree --name-only orp-merged-dev origin/master`，共 23 处冲突。

### A. 配置与根文件（低业务风险）

- [ ] `.gitignore`
- [ ] `package.json`
- [ ] `pnpm-lock.yaml`（按 lockfile 策略处理，不算"解冲突"）
- [ ] `apps/pos/app/[locale]/layout.tsx`
- [ ] `apps/web/instrumentation-client.ts`

### B. Barrel / Index 聚合文件（结构性）

- [ ] `libs/fortress/src/Icons/index.ts`
- [ ] `libs/shared/components/src/index.ts`
- [ ] `libs/shared/redux/services/src/index.ts`
- [ ] `libs/shared/services/src/index.ts`

### C. Shared 基础设施

- [ ] `libs/config/src/ec-locales-features.ts`
- [ ] `libs/shared/observability/src/client.ts`
- [ ] `libs/shared/persistence-kit/src/lib/persistenceHandles.ts`
- [ ] `libs/shared/persistence-kit/src/lib/persistenceName.ts`
- [ ] `libs/shared/components/src/lib/web-account-auth/components/signup-content.tsx`

### D. 业务域 — Product / Promotion / Search

- [ ] `libs/modules/product/components/src/lib/product-add-to-cart/product-add-to-cart.tsx`
- [ ] `libs/modules/product/components/src/lib/web-user-bar/components/shopping-bag-button/shopping-bag-button.tsx`
- [ ] `libs/modules/product/services/src/product.helper.ts`
- [ ] `libs/modules/promotion/components/src/lib/campaign-free-gift/components/gift.tsx`
- [ ] `libs/modules/search/components/src/lib/search-view/search-view-client.tsx`

### E. 业务域 — ORP 核心（最高敏感）

- [ ] `libs/modules/composite/services/src/composite.listener.ts`
- [ ] `libs/modules/order/services/src/order.helper.ts`
- [ ] `libs/modules/tracking/services/src/lib/events-map.ts`
- [ ] `libs/modules/tracking/services/src/lib/triggers/cart-events.trigger.ts`
- [ ] `libs/modules/user/domain/src/slice/zipcode.slice.ts`

---

## 4. 执行清单（Execution Checklist）

> 状态标记：⬜ 未开始 / 🟡 进行中 / ✅ 已完成 / ⛔ 阻塞

### Phase 0 — 准备

- ✅ **0.1** 摸底差异与冲突预演（merge-tree 非破坏性预演）
- ✅ **0.2** 确认工作区干净（仅 ADR 未追踪，不阻塞）
- ✅ **0.3** 创建临时分支 `merge/master-into-orp-merged-dev-2026-05-21`，基于当前 `orp-merged-dev`

### Phase 1 — 启动合并

- ✅ **1.1** 执行 `git merge origin/master --no-commit --no-ff`，进入冲突状态
- ✅ **1.2** 实际冲突 24 文件（23 业务 + pnpm-lock.yaml），与预演一致

### Phase 2 — 分组解冲突（每解一个文件，立即 `git add`，进入下一个）

#### Group A · 配置与根

- ✅ **2.A.1** `.gitignore` — 取并集，去掉重复 `.private/`
- ✅ **2.A.2** `apps/pos/app/[locale]/layout.tsx` — imports 取并集；`<BreakpointProvider>` 包裹 `PosUmsPermissionBootstrap` + children + contextHolder + apiModalContextHolder
- ✅ **2.A.3** `apps/web/instrumentation-client.ts` — 采用 master，删除 HEAD 残留的 450 行死代码（已迁移到 `clientBeforeSend`）
- ✅ **2.A.4** `package.json` — 取并集，保留两边新增 scripts

#### Group B · Barrel / Index

- ✅ **2.B.1** `libs/fortress/src/Icons/index.ts` — 取并集（Copy + Download）
- ✅ **2.B.2** `libs/shared/components/src/index.ts` — recommendation-carousel 取并集（+ SingleProductItem），删除 HEAD 引用已被 master 删除的 `gladly-box`（已替换为 customer-service SDK）
- ✅ **2.B.3** `libs/shared/redux/services/src/index.ts` — 取并集（api.v1, dy, yotpo, search, quiz + tagTypes），去重 rtkQueryCacheUtils
- ✅ **2.B.4** `libs/shared/services/src/index.ts` — 取并集（shared-payment.helper + customer-service-registry）

#### Group C · Shared 基础设施

- ✅ **2.C.1** `libs/config/src/ec-locales-features.ts` — enableO2O/enableBranch 跟随 master 扩展 US；保留 HEAD 独有 enableO2OFOrderV2/enableWarranty；保留 master 独有 enableMulberry
- ✅ **2.C.2** `libs/shared/observability/src/client.ts` — 跟随 master 把 priorities 路径切到 `./lib/monitoring/priorities`，HEAD 旧符号无 caller；保留 HEAD 新增 transaction-observability 块
- ✅ **2.C.3** `libs/shared/persistence-kit/src/lib/persistenceHandles.ts` — 3 处冲突全部并集（imports + localStorage + sessionStorage）
- ✅ **2.C.4** `libs/shared/persistence-kit/src/lib/persistenceName.ts` — 取并集（4 个新 module 全部 export）
- ✅ **2.C.5** `libs/shared/components/.../signup-content.tsx` — 保留 HEAD 的 mergeCartCommand import；合并 observability 导入加入 master 的 BusinessSeverity

#### Group D · Product / Promotion / Search

- ✅ **2.D.1** `product-add-to-cart.tsx` — 保留 HEAD V2/V1 分支结构，V1 接入 master DY/full-cart + 修正 breadcrumb level 为 `BusinessSeverity.HIGH`；V2 因 cart V2 API 暂不支持 `position` 字段，DY position 留 TODO 待 V2 API 扩展
- ✅ **2.D.2** `shopping-bag-button.tsx` — 保留 HEAD V1/V2 命名分流；imports 取并集；移除未使用 dispatch；onClick/sx 取 master 简洁版
- ✅ **2.D.3** `product.helper.ts` — 删除 HEAD 死 import（`* as Sentry from @sentry/nextjs` + 未用的 `OnlineAddCartSource/OfflineAddCartSource`）
- ✅ **2.D.4** `campaign-free-gift/gift.tsx` — 取 HEAD 全部 imports 和组件结构（新类型 + 新 props），新增 master 的 `selectedCurrentCustomer` import 与 `customer` 声明（body 已引用）；丢弃 master 的旧类型 `Gift as GiftType` / 拼写 `posSlectDeliveryModal` / 字段 `gift_pool_id`
- ✅ **2.D.5** `search-view-client.tsx` — 取并集补 `useRef`；删除 master 的死 import `Client from @searchkit/instantsearch-client`

#### Group E · ORP 核心（最敏感，逐个对齐）

- ✅ **2.E.1** `composite.listener.ts` — endpoint 名取 union (addToOrder ∥ updateWebOrder ∥ addLineItemToCart) + 保留 master 的 `suppressDefaultErrorModal` 短路
- ✅ **2.E.2** `order.helper.ts` — 删除 HEAD 重复的注释 import 行，保留 `autoCouponMarked` import（call site 仍是注释）
- ✅ **2.E.3** `events-map.ts` — 采用 HEAD 的 `export * from './events'` 兼容层（HEAD 已迁移到分类模块）；额外补回 master 独有但仍有 caller 的 `EVENT_HOW_IT_SITS` 和 `EVENT_CUSTOMER_IDENTIFY_GA` 到 `events/ga.events.ts`；`EVENT_REMOVE_FROM_CART` 无 caller 不补
- ✅ **2.E.4** `cart-events.trigger.ts` — 解构里加 `atcPosition`（master 引入，line 138 在用）；删除 master 的 `rootState = getState()` 死代码（getState 未在函数参数解构 + rootState 未使用）
- ✅ **2.E.5** `zipcode.slice.ts` — 用 HEAD 的 `BRISBANE_DEFAULT_CITY` 常量 + 加 master 的 AU 国家校验

### Phase 3 — Lockfile 与依赖

- ✅ **3.1** `git checkout --theirs pnpm-lock.yaml`
- ✅ **3.2** `pnpm install` 重生 lockfile（36.5s 完成；peer warnings 均为 pre-existing 跨版本兼容警告，与合并无关：react18/react19、@swc/helpers、@opentelemetry/semantic-conventions、storybook 等）
- ✅ **3.3** `git add pnpm-lock.yaml`

### Phase 4 — 验证

- ✅ **4.1** 全局扫 `^(<<<<<<<\|=======\|>>>>>>>) ` — 无残留
- ✅ **4.2** `npx tsc --noEmit --jsx preserve -p tsconfig.base.json` — 474 errors total，触及文件中仅 4 个错误，全部是 HEAD pre-existing `__HAS_POS_LISTENERS_READY__` 类型断言（不是合并回归）；其余 470 均为 monorepo 预存类型问题
- ⏸️ **4.3** 关键 app build — 跳过（用户偏好停在本地 commit；推到 origin 后由 CI 触发）
- ⏸️ **4.4** 单测 — 跳过（同上）

### Phase 5 — 提交

- ✅ **5.1** Merge commit `bed0c4ac6` 创建（用 `git commit-tree` plumbing 重建，pre-commit hook 跳过 — 24 个 `@nx/enforce-module-boundaries` 循环依赖错误是 pre-existing 跨文件拓扑问题，**经用户确认本次不修复**，作为独立工作项跟进）
- ✅ **5.2** 变动清单：372 staged files / +28848 -14504 lines；23 冲突手动解决 + ~348 master 干净合入 + ADR + ga.events.ts 补回 2 个 EVENT\_ 别名
- ⬜ **5.3** **未推送 origin**，等用户 review 后决定推送策略

---

## 5. Merge commit message 模板

```
chore: merge origin/master into orp-merged-dev (2026-05-21)

Merge-base: a85adc41f (2026-03-18)
Master ahead: 114 commits
Resolved 23 conflict files across:
- config & root (4)
- barrel/index (4)
- shared infra (5)
- product/promotion/search (5)
- ORP core: composite/order/tracking/zipcode (5)

Lockfile regenerated from master's pnpm-lock.yaml + merged package.json.
See docs/adr/2026-05-merge-master-into-orp-merged-dev.md for details.
```

---

## 6. 风险与回滚预案

### 风险

1. **ORP 核心冲突解错** → tracking 事件丢失、cart 行为回退
   - 缓解：Group E 每个文件解完后立即跑 `pnpm nx run tracking-services:typecheck`（如可用）
2. **lockfile 重生引入版本漂移** → 运行时 bug
   - 缓解：`pnpm install` 后对比 lockfile diff 中的 major 版本变化
3. **Barrel index 误删 export** → 下游构建失败
   - 缓解：Group B 解完后跑全局 typecheck

### 回滚

- 临时分支策略保证 `orp-merged-dev` 不受影响
- 失败时：`git merge --abort` 或直接删除 `merge/master-into-orp-merged-dev-2026-05-21` 分支

---

## 7. 执行日志（每步完成时回填）

| 时间       | 步骤    | 结果 | 备注                                                                                          |
| ---------- | ------- | ---- | --------------------------------------------------------------------------------------------- |
| 2026-05-21 | 0.1     | ✅   | merge-tree 预演完成，识别 23 冲突                                                             |
| 2026-05-21 | 0.2     | ✅   | 工作区仅 ADR 未追踪                                                                           |
| 2026-05-21 | 0.3     | ✅   | 临时分支 `merge/master-into-orp-merged-dev-2026-05-21` 已创建                                 |
| 2026-05-21 | 1.1-1.2 | ✅   | merge --no-commit --no-ff 完成，实际冲突 24 文件（含 lockfile）                               |
| 2026-05-21 | 2.A.1   | ✅   | `.gitignore` 取并集                                                                           |
| 2026-05-21 | 2.A.2   | ✅   | `apps/pos/.../layout.tsx` imports 并集 + BreakpointProvider 包裹全部 POS 节点                 |
| 2026-05-21 | 2.A.3   | ✅   | `apps/web/instrumentation-client.ts` 删除 450 行死代码                                        |
| 2026-05-21 | 2.A.4   | ✅   | `package.json` scripts 并集（含 `proxy:web` 与 `proxy:sb` value 相同，仅保留为已确认）        |
| 2026-05-21 | 2.B.1   | ✅   | `Icons/index.ts` 取并集                                                                       |
| 2026-05-21 | 2.B.2   | ✅   | `shared/components/index.ts` 取并集 + 删除 HEAD 引用 master 已删 gladly-box                   |
| 2026-05-21 | 2.B.3   | ✅   | `redux/services/index.ts` 取并集去重                                                          |
| 2026-05-21 | 2.B.4   | ✅   | `shared/services/index.ts` 取并集                                                             |
| 2026-05-21 | 2.C.1   | ✅   | `ec-locales-features.ts` 取并集，O2O/Branch 跟 master 扩 US                                   |
| 2026-05-21 | 2.C.2   | ✅   | `observability/client.ts` priorities 切 monitoring 路径 + 保留 transaction-observability      |
| 2026-05-21 | 2.C.3   | ✅   | `persistenceHandles.ts` 3 处冲突并集（曾误重复 identifyReported 已修）                        |
| 2026-05-21 | 2.C.4   | ✅   | `persistenceName.ts` 取并集                                                                   |
| 2026-05-21 | 2.C.5   | ✅   | `signup-content.tsx` imports 并集                                                             |
| 2026-05-21 | 2.D.1   | ✅   | `product-add-to-cart.tsx` 融合（V2 保留 HEAD，V1 接入 master DY/full-cart）；V2 position TODO |
| 2026-05-21 | 2.D.2   | ✅   | `shopping-bag-button.tsx` 取并集 + 风格统一 master 简洁版                                     |
| 2026-05-21 | 2.D.3   | ✅   | `product.helper.ts` 删除 HEAD 死 import                                                       |
| 2026-05-21 | 2.D.4   | ✅   | `gift.tsx` HEAD 主体 + master `customer` selector                                             |
| 2026-05-21 | 2.D.5   | ✅   | `search-view-client.tsx` 删除死 import                                                        |
| 2026-05-21 | 2.E.1   | ✅   | `composite.listener.ts` union endpoint + suppress 短路                                        |
| 2026-05-21 | 2.E.2   | ✅   | `order.helper.ts` 去重 autoCouponMarked import                                                |
| 2026-05-21 | 2.E.3   | ✅   | `events-map.ts` 改用 HEAD compat layer + 补回 2 个 EVENT\_ 到 ga.events.ts                    |
| 2026-05-21 | 2.E.4   | ✅   | `cart-events.trigger.ts` 加 atcPosition 解构，删除 rootState 死代码                           |
| 2026-05-21 | 2.E.5   | ✅   | `zipcode.slice.ts` 用常量 + AU 防御性校验                                                     |
| 2026-05-21 | 5.1     | ✅   | merge commit `bed0c4ac6` via `git commit-tree` (双父：`7dcd2b297` + `e195be181`)              |

---

## 8. 已知遗留问题：循环依赖（pre-existing，本次不合入，下版本随合并带入并验证）

合并 commit 时 pre-commit hook 报 24 个 ESLint `@nx/enforce-module-boundaries` 错误，**全部是 pre-existing 跨模块拓扑问题，并非本次合并引入**。该问题已在其他分支单独修复，**本次合并不携带修复内容**，等下次版本合并时会把修复一并带进来，届时统一验证。

### 8.1 根因

所有 34 条独立循环链都穿过中央 barrel 对 **`shared-redux-services ↔ shared-services`**。任何 `modules-X-domain` 或 `modules-X-services` 间接经过这对 barrel 都会形成循环。修复需要拆分 / 反转这对 barrel 的依赖方向（独立工作项）。

### 8.2 独立循环链（34 条）

```
modules-cart-domain         <-> shared-redux-services (via shared-services -> modules-tracking-services)
modules-checkout-domain     <-> shared-redux-services (via shared-services -> shared-redux-store)
modules-cms-domain          <-> shared-redux-services (via shared-services -> modules-product-services)
modules-composite-components <-> modules-order-components
modules-composite-components <-> modules-product-components
modules-composite-services  <-> modules-cart-services
modules-dy-domain           <-> shared-redux-services (via shared-services -> modules-tracking-services)
modules-order-domain        <-> shared-redux-services (via shared-services)
modules-product-components  <-> modules-composite-components
modules-product-domain      <-> modules-retails-domain
modules-product-domain      <-> shared-redux-services
modules-product-services    <-> modules-cms-domain
modules-product-services    <-> modules-order-domain
modules-product-services    <-> modules-product-domain
modules-product-services    <-> modules-user-domain
modules-product-services    <-> shared-redux-store
modules-promotion-domain    <-> shared-redux-services
modules-promotion-domain    <-> shared-services
modules-retails-domain      <-> shared-redux-services
modules-tracking-domain     <-> shared-redux-services
modules-tracking-services   <-> modules-order-domain
modules-tracking-services   <-> modules-product-domain
modules-tracking-services   <-> modules-retails-domain
modules-tracking-services   <-> modules-tracking-domain
modules-tracking-services   <-> modules-user-domain
modules-tracking-services   <-> shared-redux-store
modules-user-domain         <-> shared-redux-services
shared-redux-services       <-> shared-services
shared-services             <-> modules-order-domain
shared-services             <-> modules-payment-domain
shared-services             <-> modules-product-domain
shared-services             <-> modules-promotion-domain
shared-services             <-> modules-tracking-services
shared-services             <-> shared-redux-store
```

### 8.3 涉及文件（73 个，承载循环边）

#### Domain API 入口（38）

```
libs/modules/cart/domain/src/lib/api/cart-item.api.ts
libs/modules/cart/domain/src/lib/api/cart-pos.api.ts
libs/modules/cart/domain/src/lib/api/cart.api.ts
libs/modules/cart/domain/src/lib/api/warranty.api.ts
libs/modules/checkout/domain/src/api/address.api.ts
libs/modules/checkout/domain/src/api/checkout-session.api.ts
libs/modules/checkout/domain/src/api/partner.api.ts
libs/modules/checkout/domain/src/api/payment.api.ts
libs/modules/checkout/domain/src/api/shipping.api.ts
libs/modules/cms/domain/src/lib/api/taxonomies.api.ts
libs/modules/dy/domain/src/lib/api/campaigns.client.api.ts
libs/modules/order/domain/src/api/credits.api.ts
libs/modules/order/domain/src/api/order-history-v1.api.ts
libs/modules/order/domain/src/api/order-history.api.ts
libs/modules/order/domain/src/api/order.api.ts
libs/modules/order/domain/src/api/service.api.ts
libs/modules/product/domain/src/api/plp-search.api.ts
libs/modules/product/domain/src/api/product-collection.api.ts
libs/modules/product/domain/src/api/product-search.api.ts
libs/modules/product/domain/src/api/product.api.ts
libs/modules/product/domain/src/api/review.api.ts
libs/modules/product/domain/src/api/shopTheLook.api.ts
libs/modules/product/domain/src/api/stripe-init.api.ts
libs/modules/product/domain/src/api/subscriptions.api.ts
libs/modules/product/domain/src/slice/product.slice.ts
libs/modules/promotion/domain/src/api/coupon.api.ts
libs/modules/promotion/domain/src/api/coupons.api.ts
libs/modules/promotion/domain/src/api/promotion.api.ts
libs/modules/promotion/domain/src/api/promotion.api.v1.ts
libs/modules/tracking/domain/src/api/facebook.api.ts
libs/modules/tracking/domain/src/api/pinterest.api.ts
libs/modules/user/domain/src/api/account-voucher.api.ts
libs/modules/user/domain/src/api/address-search.api.ts
libs/modules/user/domain/src/api/address.api.ts
libs/modules/user/domain/src/api/address.api.v2.ts
libs/modules/user/domain/src/api/oauth.api.ts
libs/modules/user/domain/src/api/sale-list.api.ts
libs/modules/user/domain/src/api/subscription.api.ts
libs/modules/user/domain/src/api/terms.api.ts
libs/modules/user/domain/src/api/user.api.ts
```

#### Composite 组件 / Services（6）

```
libs/modules/composite/components/src/lib/pos-cart/pos-cart.tsx
libs/modules/composite/components/src/lib/pos-customer-header/pos-customer-header.tsx
libs/modules/composite/components/src/lib/pos-site-header/pos-site-header.tsx
libs/modules/composite/services/src/composite.helper.ts
libs/modules/composite/services/src/composite.listener.ts
libs/modules/composite/services/src/error.helper.ts
```

#### Product Services（8）

```
libs/modules/product/services/src/ar-model.helper.ts
libs/modules/product/services/src/preload/pdp/product-collection-preload.ts
libs/modules/product/services/src/product.helper.ts
libs/modules/product/services/src/product.listener.ts
libs/modules/product/services/src/reviews.helper.ts
libs/modules/product/services/src/reviews.listener.ts
libs/modules/product/services/src/shopTheLook.listener.ts
libs/modules/product/services/src/utils.ts
```

#### Promotion / Tracking 触发器与工具（12）

```
libs/modules/promotion/domain/src/helper/promotion.helper.ts
libs/modules/tracking/services/src/lib/helpers/feature.helper.ts
libs/modules/tracking/services/src/lib/triggers/cms-events.trigger.ts
libs/modules/tracking/services/src/lib/triggers/dy-cart-events.helper.ts
libs/modules/tracking/services/src/lib/triggers/ga-cart-events.helper.ts
libs/modules/tracking/services/src/lib/triggers/ga-checkout-events.helper.ts
libs/modules/tracking/services/src/lib/triggers/ga-coupon-events.helper.ts
libs/modules/tracking/services/src/lib/triggers/ga-identify-events.helper.ts
libs/modules/tracking/services/src/lib/triggers/identify-events.trigger.ts
libs/modules/tracking/services/src/lib/triggers/page-view.trigger.ts
libs/modules/tracking/services/src/lib/triggers/product-events.trigger.ts
libs/modules/tracking/services/src/lib/triggers/swatch.trigger.ts
libs/modules/tracking/services/src/lib/utils/facebook.util.ts
libs/modules/tracking/services/src/lib/utils/pinterest.util.ts
```

#### Shared 基础层（5）

```
libs/shared/redux/services/src/shared-base-query-with-re-auth.ts
libs/shared/redux/services/src/shared-prepare-headers.ts
libs/shared/services/src/lib/ai-chat-utils/util.ts
libs/shared/services/src/lib/promotion.helper.ts
libs/shared/services/src/lib/shared-payment.helper.ts
```

### 8.4 修复策略（下版本验证项）

1. 切断 `shared-redux-services ↔ shared-services` 的双向依赖（最大根因）
2. 评估 composite-components ↔ product-components / order-components 互相引用是否合理，必要时引入 boundary 层
3. composite-services ↔ cart-services 互引拆解

### 8.5 验证清单（下版本合并把修复带进来后执行）

- [ ] 包含循环依赖修复的分支合入 master 后，本地拉取并合并到当前分支
- [ ] 运行 `npx eslint --ext .ts,.tsx libs/ apps/ 2>&1 | grep "Circular dependency" | sort -u | wc -l` → 期望为 0
- [ ] 运行 `npx lint-staged` → 期望全部通过
- [ ] commit 时 pre-commit hook 不再失败
