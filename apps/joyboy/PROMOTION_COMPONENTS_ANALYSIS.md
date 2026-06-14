# Promotion Components 模块依赖分析报告

## 分析范围

`libs/modules/promotion/components/`

## DDD 规范要求

- ✅ **允许**：`promotion-components` → 其他 modules 的 `domain` / `services` 层
- ✅ **允许**：`promotion-components` → `shared-components`
- ❌ **禁止**：`promotion-components` → 其他 modules 的 `components` 层

## 检查结果

### ✅ 符合规范的导入

#### 1. 导入其他 modules 的 `domain` 层

以下文件导入了其他 modules 的 `domain` 层，**符合规范**：

- `lib/pos-coupon-choose-gift-modal/pos-choose-coupon-gift-modal.tsx`

  - `@castlery/modules-order-domain` (`selectOrder`)
  - `@castlery/modules-promotion-domain` (`selectFreeGiftBreakdown`, `getGiftsByOrderNumberSilent`)

- `lib/pos-campaign/pos-campaign-progress-bar.tsx`

  - `@castlery/modules-order-domain` (`selectOrder`)
  - `@castlery/modules-promotion-domain` (`selectFreeGiftBreakdown`)

- `lib/campaign-free-gift/components/collapsible-content.tsx`

  - `@castlery/modules-order-domain` (`selectOrder`)
  - `@castlery/modules-promotion-domain` (`getGiftsByOrderNumberV2`)

- `lib/pos-chooseFreeGift-delivery-modal/pos-chooseFreeGift-delivery-modal.tsx`

  - `@castlery/modules-order-domain` (`selectOrder`, `selectOrderLoading`)
  - `@castlery/modules-retails-domain` (`selectedRetailId`, `useGetStockLocationsByRetailIdQuery`)
  - `@castlery/modules-promotion-domain` (`addGiftsByOrderNumberV2`, `getGiftsByOrderNumberSilent`)

- `lib/campaign-free-gift/campaign-choose-free-gift.tsx`

  - `@castlery/modules-promotion-domain`
  - `@castlery/modules-order-domain` (`selectOrder`)

- `lib/campaign-free-gift/components/gift.tsx`
  - `@castlery/modules-order-domain` (`selectOrder`)

#### 2. 导入其他 modules 的 `services` 层

- `hook/use-price-break-campaign.ts`
  - `@castlery/modules-cms-services` (`isOutdated`)
  - `@castlery/modules-dy-domain` (`dyRecommendationsApi`, `CampaignsRequestOptions`)

#### 3. 导入 `shared-components`

以下文件导入了 `shared-components`，**符合规范**：

- `lib/campaign-free-gift/components/gift.tsx`

  - `FortressImage`, `CustomLink` from `@castlery/shared-components`

- `lib/campaign-free-gift/components/collapsible-content.tsx`
  - `ScrollWrapper` from `@castlery/shared-components`

#### 4. 自引用（同一模块内）

- `lib/pos-campaign/pos-campaign-progress-bar.tsx`
  - `usePriceBreakCampaign`, `ChooseFreeGift` from `@castlery/modules-promotion-components`
  - **说明**：这是同一模块内的导入，完全符合规范

### ❌ 违规导入检查

**检查结果：未发现违规导入**

经过全面检查，`promotion-components` 模块中**没有**导入其他 modules 的 `components` 层。

## 总结

### ✅ 合规性评估

`promotion-components` 模块**完全符合 DDD 规范**，所有导入都是允许的：

1. ✅ 只导入了其他 modules 的 `domain` 和 `services` 层
2. ✅ 导入了 `shared-components`（这是允许的）
3. ✅ 没有导入其他 modules 的 `components` 层
4. ✅ 模块内部的自引用是正常的

### 📊 依赖统计

| 依赖类型                        | 数量     | 状态        |
| ------------------------------- | -------- | ----------- |
| 其他 modules 的 `domain` 层     | 6 个文件 | ✅ 符合规范 |
| 其他 modules 的 `services` 层   | 1 个文件 | ✅ 符合规范 |
| `shared-components`             | 2 个文件 | ✅ 符合规范 |
| 其他 modules 的 `components` 层 | 0 个文件 | ✅ 无违规   |

### 🎯 结论

**`promotion-components` 模块没有违规操作，所有依赖都符合 DDD 规范。**
