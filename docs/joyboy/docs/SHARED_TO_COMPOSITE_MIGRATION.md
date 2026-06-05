# Shared Components 迁移到 Composite Components 文档

## 概述

根据 DDD 规范，`shared-components` 可以引用其他 modules 的 `services` 层和 `domain` 层，但**不能引用其他 modules 的 `components` 层**。因此，所有依赖其他 modules 的 `components` 层的组件都需要迁移到 `composite-components`。

## 迁移规则

- ✅ **允许**：`shared-components` → 其他 modules 的 `services` / `domain`
- ❌ **禁止**：`shared-components` → 其他 modules 的 `components`

## 已迁移的组件

### 1. `fortress-video`

- **原路径**：`libs/shared/components/src/lib/fortress-video/fortress-video.tsx`
- **新路径**：`libs/modules/composite/components/src/lib/fortress-video/fortress-video.tsx`
- **迁移原因**：依赖 `@castlery/modules-tracking-components` (`useTrackingTags`)
- **导出路径**：`@castlery/modules-composite-components`

### 2. `shipping-location-modal`

- **原路径**：`libs/shared/components/src/lib/shipping-location-modal/shipping-location-modal.tsx`
- **新路径**：`libs/modules/composite/components/src/lib/shipping-location-modal/shipping-location-modal.tsx`
- **迁移原因**：依赖 `@castlery/modules-composite-components` (`LocationSearch`)
- **导出路径**：`@castlery/modules-composite-components`

### 3. `pinch-zoom`

- **原路径**：`libs/shared/components/src/lib/pinch-zoom/pinch-zoom.tsx`
- **新路径**：`libs/modules/composite/components/src/lib/pinch-zoom/pinch-zoom.tsx`
- **迁移原因**：依赖 `@castlery/modules-composite-components` (`FortressVideo`)
- **导出路径**：`@castlery/modules-composite-components`

### 4. `pinch-zoom-viewer`

- **原路径**：`libs/shared/components/src/lib/pinch-zoom/pinch-zoom-viewer.tsx`
- **新路径**：`libs/modules/composite/components/src/lib/pinch-zoom/pinch-zoom-viewer.tsx`
- **迁移原因**：依赖 `@castlery/modules-tracking-components` (`useTrackingTags`)
- **导出路径**：`@castlery/modules-composite-components`

### 5. `location-search`

- **原路径**：`libs/shared/components/src/lib/location-search/location-search.tsx`
- **新路径**：`libs/modules/composite/components/src/lib/location-search/location-search.tsx`
- **迁移原因**：存在循环依赖问题（`user-components` ↔ `composite-components`）
- **导出路径**：`@castlery/modules-composite-components`

## 更新的引用文件

### `fortress-video` 的引用更新

- `libs/modules/product/components/src/lib/product-info/components/product-hullabala.tsx`
- `libs/modules/product/components/src/lib/refined/refined-product-gallery/components/media-item.tsx`
- `libs/modules/product/components/src/lib/product-social-ugc/components/social-ugc-modal.tsx`
- `libs/modules/product/components/src/lib/product-social-ugc/components/social-ugc-drawer.tsx`
- `libs/modules/product/components/src/lib/product-info/components/product-ai-property.tsx`
- `libs/modules/cms/components/src/lib/usp/media.tsx`
- `libs/modules/composite/components/src/lib/pinch-zoom/pinch-zoom-viewer.tsx`

### `shipping-location-modal` 的引用更新

- `libs/modules/search/components/src/lib/instantsearch/quickship-toggle-refinement.tsx`
- `libs/modules/product/components/src/lib/product-shipping/product-shipping.tsx`
- `libs/modules/product/components/src/lib/product-shipping/components/product-usp/product-usp.tsx`

### `pinch-zoom` 的引用更新

- `libs/shared/components/src/lib/fortress-carousel/fortress-carousel.tsx`
- `libs/modules/product/components/src/lib/web-product-option/web-product-option.tsx`
- `libs/modules/cms/components/src/lib/product-info/content.tsx`

## 导出文件更新

### `libs/shared/components/src/index.ts`

已注释以下导出：

```typescript
// fortress-video moved to composite-components (depends on tracking-components)
// export * from './lib/fortress-video/fortress-video';

// pinch-zoom moved to composite-components (depends on fortress-video)
// export * from './lib/pinch-zoom/pinch-zoom';

// pinch-zoom-viewer moved to composite-components
// export * from './lib/pinch-zoom/pinch-zoom-viewer';

// location-search and shipping-location-modal moved to composite-components
// export * from './lib/location-search/location-search';

// shipping-location-modal moved to composite-components (depends on composite-components)
// export * from './lib/shipping-location-modal/shipping-location-modal';
```

### `libs/modules/composite/components/src/index.ts`

已添加以下导出：

```typescript
// components that depend on other components (must stay in composite)
export * from './lib/pinch-zoom/pinch-zoom-viewer';
export * from './lib/pinch-zoom/pinch-zoom';
export * from './lib/shipping-location-modal/shipping-location-modal';
export * from './lib/fortress-video/fortress-video';

// location-search (has circular dependency, kept in composite)
export * from './lib/location-search/location-search';
```

## 迁移验证清单

- ✅ `fortress-video` - 已迁移并验证
- ✅ `shipping-location-modal` - 已迁移并验证
- ✅ `pinch-zoom` - 已迁移并验证
- ✅ `pinch-zoom-viewer` - 已迁移并验证
- ✅ `location-search` - 已迁移并验证

所有组件都已成功迁移到 `composite-components`，并在 `composite-components/src/index.ts` 中正确导出。

## 使用指南

### 导入方式变更

**迁移前**：

```typescript
import { FortressVideo } from '@castlery/shared-components';
import { ShippingLocationModal } from '@castlery/shared-components';
import { PinchZoom } from '@castlery/shared-components';
```

**迁移后**：

```typescript
import { FortressVideo, ShippingLocationModal, PinchZoom } from '@castlery/modules-composite-components';
```

## 注意事项

1. **循环依赖**：`location-search` 因循环依赖问题保留在 `composite-components` 中
2. **依赖链**：`pinch-zoom` → `fortress-video` → `tracking-components`，因此都需要在 `composite-components` 中
3. **向后兼容**：所有引用这些组件的文件都已更新，确保不会出现运行时错误

## 后续优化建议

1. 考虑将 `location-search` 的循环依赖问题解决后，可以评估是否移回 `shared-components`
2. 定期检查 `shared-components` 中是否有新的组件违反了依赖规则
3. 在代码审查时，注意检查 `shared-components` 的导入，确保不引入其他 modules 的 `components` 层
