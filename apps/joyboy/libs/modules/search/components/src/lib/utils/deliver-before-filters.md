# Query Deliver Before 功能实现 (优化版)

## 概述

此功能将 Storyblok 中的 `query_deliver_before` 数据转换为 Elasticsearch 中的 `lead_time` 过滤器，实现类似 `queryString` 的过滤效果。

**优化点**: 简化数据传递，只传递必要的 `deadline` 字符串，因为数组中最多只有一个元素。

## 实现架构

### 1. 数据流 (优化后)

```
ProductListingPage
  ↓ (提取第一个 deadline 字符串)
SearchViewServerWrapper
  ↓ (queryDeliverBeforeDeadline in ruleContexts)
route.ts
  ↓ (convertDeadlineToLeadTimeFilter)
Elasticsearch numericFilters (lead_time<=N)
```

### 2. 核心文件

#### `deliver-before-filters.ts` (简化后)

- `convertDeadlineToLeadTimeFilter()`: 转换单个 deadline 为数值过滤器 (`lead_time<=N`)

#### `route.ts` 更新

- 解析 `ruleContexts.queryDeliverBeforeDeadline`
- 调用转换函数生成 `numericFilters`
- 合并到最终的过滤器中

#### `search-view-server-wrapper.tsx` 更新

- 接收 `queryDeliverBeforeDeadline` 参数 (单个字符串)
- 传递到 `ruleContexts` 中

#### `product-listing-page.tsx` 更新

- 从 Storyblok 数据中提取第一个 `deadline` 字符串
- 传递给 `SearchViewServerWrapper`

## 使用示例

### Storyblok 数据格式

```json
{
  "query_deliver_before": [
    {
      "deadline": "2025-09-30 00:00",
      "filter_presentation": "Deliver Before October",
      "_uid": "fbb0e8aa-9d6e-4f11-88c1-bb68aa48dcbe",
      "component": "Deliver Before"
    }
  ]
}
```

### 数据提取 (优化后)

```typescript
// 只提取 deadline 字符串
const deadline = queryDeliverBefore[0]?.deadline; // "2025-09-30 00:00"
```

### 转换结果

- **数值过滤器**: `lead_time<=6` (如果 deadline 是 6 天后)

## 优化特性

1. **简化数据传递**: 只传递必要的 `deadline` 字符串
2. **减少复杂性**: 移除未使用的 facet 转换函数
3. **类型简化**: 使用 `string | null` 而不是复杂的对象数组
4. **性能优化**: 减少数据序列化/反序列化的开销
5. **更清晰的逻辑**: 单一职责，专注于数值过滤器转换

## 配置

无需额外配置，功能会自动激活当 `deadline` 存在时。

## 测试

运行测试:

```bash
npm test deliver-before-filters
```

## 调试

查看日志以了解转换过程:

- `deliver_before_processing` context 用于转换日志
- `search_filter_processing` context 用于整体过滤器处理日志
