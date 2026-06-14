# Sort Options 配置优化迁移指南

## 问题分析

原有的 `sort-options.config.ts` 存在以下问题：

1. **过度抽象** - 通过字符串替换动态生成配置，增加了复杂性
2. **运行时计算** - 每次调用都需要进行字符串操作和过滤
3. **类型安全性差** - 大量字符串操作，缺乏编译期检查
4. **维护困难** - 逻辑分散，添加新场景需要修改多处

## 新方案优势

新的 `sort-options.config.ts` 采用了**显式配置**的方式：

### 1. 第一性原理设计

- **场景驱动** - 按实际使用场景（渠道+地区）直接定义配置
- **零运行时计算** - 预定义所有配置，避免动态生成
- **类型安全** - 强类型约束，编译期检查

### 2. 清晰的配置结构

```typescript
// 旧方式：复杂的字符串替换和运行时标记
const options = ALL_SORT_OPTIONS.map((option) => ({
  ...option,
  value: indexName !== 'web_product' ? option.value.replace('web_product', indexName) : option.value,
})).filter((option) => {
  const baseValue = option.value.replace(indexName, 'web_product');
  return !disabledOptions.includes(baseValue);
});

// 新方式：直接配置，第一个即默认
const SORT_CONFIG = {
  scenarios: {
    WEB: {
      US: {
        options: [
          RECOMMENDATION, // 第一个即默认
          PRICE_LOW_HIGH,
          PRICE_HIGH_LOW,
        ],
      },
      default: {
        options: [
          RECOMMENDATION, // 第一个即默认
          FAST_DISPATCH,
          PRICE_LOW_HIGH,
          PRICE_HIGH_LOW,
        ],
      },
    },
  },
};
```

### 3. 简化的默认逻辑

```typescript
// 旧方式：需要isDefault标记
interface SortOption {
  label: string;
  value: string;
  isDefault?: boolean; // 额外的复杂性
}

// 新方式：数组第一个即默认
interface SortOption {
  label: string;
  value: string;
  // 不需要额外标记，第一个元素天然是默认的
}

// 获取默认选项
const defaultOption = options[0]; // 简单明了
```

### 4. 简化的 API

```typescript
// 旧方式
const options = getSortOptions('pos_product');

// 新方式 - 自动推导环境
const options = getSortOptions(); // 根据环境变量自动选择
// 或者显式指定
const options = getSortOptions('POS', 'US');
```

## 迁移步骤

### 1. 更新导入

```typescript
// 旧方式
import { getSortOptions, type SortByItem } from '../config/sort-options.config';

// 新方式 (相同文件名，但接口已优化)
import { getSortOptions, type SortOption } from '../config/sort-options.config';
```

### 2. 更新类型定义

```typescript
// 旧类型
sortOptions: SortByItem[]

// 新类型
sortOptions: SortOption[]
```

### 3. 简化调用

```typescript
// 旧方式 - 需要传递indexName
const effectiveSortOptions = sortOptions || getSortOptions(indexName);

// 新方式 - 自动推导
const effectiveSortOptions = sortOptions || getSortOptions();
```

### 4. 移除手动配置

```typescript
// 旧方式 - POS页面需要手动配置
<SearchView
  sortOptions={[
    { label: 'Recommendation', value: 'pos_product' },
    { label: 'Price: Low to High', value: 'pos_product_price_asc' },
    { label: 'Price: High to Low', value: 'pos_product_price_desc' },
  ]}
/>

// 新方式 - 自动推导，无需手动配置
<SearchView />
```

## 兼容性

新配置完全兼容原有的接口：

- `SortByItem` 类型别名指向 `SortOption`
- API 签名保持一致
- 所有原有功能都支持

## 配置扩展

添加新的地区配置非常简单：

```typescript
const SORT_CONFIG = {
  scenarios: {
    WEB: {
      // 新增地区配置
      CA: {
        options: [
          // 加拿大特殊的排序选项
        ],
      },
      default: {
        /* 默认配置 */
      },
    },
  },
};
```

## 性能优化

- **零运行时开销** - 配置在编译期确定
- **更好的 Tree Shaking** - 未使用的配置会被优化掉
- **类型推导** - TypeScript 可以更好地推导类型
