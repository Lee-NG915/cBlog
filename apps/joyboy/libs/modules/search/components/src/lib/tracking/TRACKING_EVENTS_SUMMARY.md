# Search 模块事件上报需求总结

## 需要上报的事件清单

### 1. 产品筛选事件 (Product Filter Event)

#### 事件标识

- **Event Type**: `product_filter`
- **GTM Event**: `trackEvent`
- **Category**: `Product Listings`

#### 触发条件

- 用户点击任何筛选选项时
- 仅当筛选条件**增加**时触发 (不包括移除筛选)
- 范围筛选器在值发生变化时触发

#### 数据格式

```typescript
interface ProductFilterEvent {
  filterKey: string; // 筛选器的 attribute 名称
  label: string; // 用户友好的显示标签
}
```

#### 筛选器映射表

| 筛选器 Attribute       | Filter Key             | Action Label              | 说明                      |
| ---------------------- | ---------------------- | ------------------------- | ------------------------- |
| `category`             | `category`             | `Category Filter`         | 分类筛选                  |
| `tags`                 | `tags`                 | `Featured Filter`         | 特色标签 (新品/促销/清仓) |
| `lead_time`            | `lead_time`            | `Leaves Warehouse Filter` | 发货时间                  |
| `material_filter`      | `material_filter`      | `Material`                | 材质筛选                  |
| `color`                | `color`                | `Color Filter`            | 颜色筛选                  |
| `price`                | `price`                | `Price Filter`            | 价格范围                  |
| `length`               | `length`               | `Length Filter`           | 长度范围                  |
| `bed_frame_size`       | `bed_frame_size`       | `Bed Frame Size Filter`   | 床架尺寸                  |
| `overall_sit_rating`   | `overall_sit_rating`   | `Seat Comfort Filter`     | 座椅舒适度                |
| `seat_depth_rating`    | `seat_depth_rating`    | `Seat Depth Filter`       | 座椅深度                  |
| `seat_height_rating`   | `seat_height_rating`   | `Seat Height Filter`      | 座椅高度                  |
| `seat_softness_rating` | `seat_softness_rating` | `Seat Softness Filter`    | 座椅软硬度                |
| `quickship`            | `quickship`            | `Quickship Filter`        | 快速发货                  |
| `fabric_feature`       | `fabric_feature`       | `Fabric Feature Filter`   | 面料特性                  |
| `fabric_type`          | `fabric_type`          | `Fabric Type Filter`      | 面料类型                  |

#### 特殊处理规则

1. **范围筛选器标签格式**:

   - 价格/长度/床架尺寸: `"{min}-{max}"`
   - 评分类型: `"{levelName}-{levelName}"` (使用预定义的级别名称)

2. **评分级别映射**:
   ```typescript
   const ratingLevels = {
     overall_sit_rating: ['Very relaxed', 'Relaxed', 'Medium', 'Upright', 'Very upright'],
     seat_depth_rating: ['Very shallow', 'Shallow', 'Medium', 'Deep', 'Very deep'],
     seat_height_rating: ['Very low', 'Low', 'Medium', 'High', 'Very high'],
     seat_softness_rating: ['Very soft', 'Soft', 'Medium', 'Firm', 'Very firm'],
   };
   ```

### 2. 产品排序事件 (Product Sort Event)

#### 事件标识

- **Event Type**: `product_sort`
- **GTM Event**: `trackEvent`
- **Category**: `Product Listings`
- **Action**: `Sort Filter`

#### 触发条件

- 用户更改排序选项时
- 排序值与之前不同时才触发

#### 数据格式

```typescript
interface ProductSortEvent {
  label: string; // 排序选项的显示标签
}
```

#### 排序选项映射

根据 `sort-options.config.ts` 中的配置:

- `Recommendation` (默认)
- `Fast Dispatch`
- `Price: Low to High`
- `Price: High to Low`

### 3. 产品展示事件 (Product Impression Event)

#### 事件标识

- **Event Type**: `product_impression`
- **GTM Event**: `productImpression`
- **Enhanced Ecommerce**: 是

#### 触发条件

- 产品在视窗中可见 (阈值: 25%)
- 每 500ms 批量上报一次
- 使用 Intersection Observer API

#### 数据格式

```typescript
interface ProductImpressionEvent {
  ecommerce: {
    currencyCode: string; // 'USD', 'SGD' 等
    impressions: Array<{
      id: string; // SKU
      name: string; // 产品名称
      price: number; // 原价 (去除货币符号)
      dimension1: string; // 主分类名称
      category: string; // 子分类名称
      brand: string; // 品牌
      list: string; // 页面标识
    }>;
  };
}
```

#### 产品数据提取规则

- **SKU**: `hit._source.variants[0].sku`
- **名称**: `hit._source.variants[0].name`
- **价格**: 使用 `getOriginalAmount()` 去除货币符号
- **分类**: 从 `taxons` 提取面包屑导航
- **品牌**: 从 `taxons` 中查找品牌信息
- **列表名**: 基于当前页面路径生成

### 4. Dynamic Yield 筛选事件 (DY Filter Event)

#### 事件标识

- **DY Event**: `Filter Items`
- **DY Type**: `filter-items-v1`

#### 触发条件

- 仅对特定筛选器触发
- 与 Product Filter Event 同时触发

#### 支持的筛选器

| Attribute         | DY Filter Type | 说明     |
| ----------------- | -------------- | -------- |
| `material_filter` | `material`     | 材质     |
| `tags`            | `featured`     | 特色标签 |
| `lead_time`       | `deliver`      | 发货时间 |
| `color`           | `color`        | 颜色     |

#### 数据格式

```typescript
interface DyFilterEvent {
  name: 'Filter Items';
  properties: {
    dyType: 'filter-items-v1';
    filterType: string; // DY 筛选器类型
    filterStringValue: string; // 筛选值的字符串表示
  };
}
```

#### 特殊处理

- 发货时间 (`deliver`): 需要从 `accessor.options.options` 中查找 `title` 字段
- 其他筛选器: 使用 `accessor.translations[value]` 或原值

## InstantSearch 集成要点

### 1. 状态监听

使用 InstantSearch Middleware 的 `onStateChange` 事件:

```typescript
const middleware: Middleware = {
  onStateChange({ uiState }) {
    // 比较新旧状态，识别变化的筛选器
    detectFilterChanges(uiState);
  },
};
```

### 2. 状态比较逻辑

- 维护 `previousUiState` 来对比状态变化
- 检测数组长度增加 (refinementList)
- 检测对象属性变化 (range, numericMenu)
- 检测排序变化 (sortBy)

### 3. Impression 追踪

- 在 `CustomHit` 组件中添加 `data-hit-index` 属性
- 使用 `useImpressionTracking` Hook 设置 Intersection Observer
- 批量收集可见产品，定时上报

### 4. 数据转换

- 实现 `transformFilterLabel()` 函数处理各种筛选器的标签转换
- 实现 `formatRangeLabel()` 处理范围筛选器
- 实现 `getBreadcrumbNames()` 提取分类信息

## 技术架构

```
SearchView
├── TrackingMiddleware (监听状态变化)
│   ├── FilterTracker (筛选事件)
│   ├── SortTracker (排序事件)
│   └── DyTracker (DY 事件)
├── CustomHits
│   └── CustomHit (添加追踪属性)
├── ImpressionTracker (Intersection Observer)
└── EventDispatcher (统一事件分发)
    ├── GTM Integration
    ├── DY Integration
    └── Custom Callbacks
```

## 性能考虑

1. **防抖处理**: 筛选事件使用防抖避免频繁触发
2. **批量上报**: Impression 事件 500ms 批量上报一次
3. **内存管理**: 及时清理 Observer 和定时器
4. **事件去重**: 避免重复事件上报

## 测试要点

1. **筛选事件**: 验证各种筛选器的事件触发和数据格式
2. **排序事件**: 验证排序变化时的事件触发
3. **展示事件**: 验证 Intersection Observer 的正确性
4. **DY 事件**: 验证特定筛选器的 DY 事件
5. **批量处理**: 验证定时器和批量上报机制
6. **清理逻辑**: 验证组件卸载时的资源清理
