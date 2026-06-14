# 内容处理器工具函数

这个工具文件包含了用于处理 Storyblok 页面内容的函数，特别是处理包含 `items` 的组件（如 Hero 组件）。

## 功能概述

这些工具函数可以帮助你：

1. **处理产品列表组件** - 提取产品 ID
2. **处理 Shop The Look 组件** - 提取变体 ID
3. **处理 FAQ 组件** - 生成结构化数据
4. **处理 DY Campaign 组件** - 异步获取活动数据
5. **处理包含 items 的组件** - 递归处理嵌套组件
6. **专门处理 Hero 组件** - 独立处理 Hero 组件中的 items

## 主要函数

### `processItems(items, cookieContext, dyCampaignsData)`

处理一组组件项目，提取产品 ID、变体 ID 等信息。

**参数：**

- `items: any[]` - 要处理的组件数组
- `cookieContext: { cookies: any }` - Cookie 上下文
- `dyCampaignsData: Record<string, any>` - DY 活动数据对象

**返回：**

```typescript
interface ProcessItemsResult {
  productIds: Set<string>;
  shopTheLookItemIds: Set<string>;
  dyCampaignPromises: Promise<void>[];
  hasFaqSchema: boolean;
  jsonLd: WithContext<FAQPage>;
}
```

### `processComponentWithItems(item, cookieContext, dyCampaignsData)`

处理包含 `items` 属性的单个组件（如 Hero 组件）。

**参数：**

- `item: any` - 要处理的组件
- `cookieContext: { cookies: any }` - Cookie 上下文
- `dyCampaignsData: Record<string, any>` - DY 活动数据对象

**返回：**

- `ProcessItemsResult | null` - 处理结果，如果组件没有 items 则返回 null

### `processHeroComponent(content, cookieContext, dyCampaignsData)`

专门处理页面内容中的 Hero 组件，提取其中的 items 进行处理。

**参数：**

- `content: any` - 页面内容对象
- `cookieContext: { cookies: any }` - Cookie 上下文
- `dyCampaignsData: Record<string, any>` - DY 活动数据对象

**返回：**

- `ProcessItemsResult` - 处理结果

**特点：**

- 只处理 `component === 'hero'` 的组件
- 可以处理多个 Hero 组件
- 如果页面中没有 Hero 组件，返回空结果

### `processPageContent(content, cookieContext, dyCampaignsData)`

处理整个页面内容，包括所有组件和嵌套的 items。

**参数：**

- `content: any` - 页面内容对象
- `cookieContext: { cookies: any }` - Cookie 上下文
- `dyCampaignsData: Record<string, any>` - DY 活动数据对象

**返回：**

- `ProcessItemsResult` - 处理结果

## 使用示例

### 基本用法

```typescript
import { processPageContent, processHeroComponent } from './utils/content-processor';

// 处理整个页面内容
const contentResult = processPageContent(story.content, cookieContext, dyCampaignsData);

// 单独处理 Hero 组件
const heroResult = processHeroComponent(story.content, cookieContext, dyCampaignsData);

// 合并结果
const allProductIds = new Set([...contentResult.productIds, ...heroResult.productIds]);
const allShopTheLookItemIds = new Set([...contentResult.shopTheLookItemIds, ...heroResult.shopTheLookItemIds]);
const allDyCampaignPromises = [...contentResult.dyCampaignPromises, ...heroResult.dyCampaignPromises];
```

### 处理特定组件

```typescript
import { processItems } from './utils/content-processor';

// 处理 Hero 组件中的 items
const heroItems = [
  {
    component: 'detailed-product-listing',
    product_id: 'product-1',
  },
  {
    component: 'Shop The Look Item',
    hotspots: [{ variant_id: 'variant-1' }],
  },
];

const result = processItems(heroItems, cookieContext, dyCampaignsData);
console.log('产品 ID:', [...result.productIds]);
console.log('变体 ID:', [...result.shopTheLookItemIds]);
```

## 支持的组件类型

### 产品相关组件

- `detailed-product-listing` - 详细产品列表
- `simple-product-listing` - 简单产品列表
- `detailed-listing` - 详细列表（包含产品）
- `simple-listing` - 简单列表（包含产品）

### Shop The Look 组件

- `Shop The Look Item` / `shop_the_look_item` - Shop The Look 项目
- `Shop The Look List` / `shop_the_look_list` - Shop The Look 列表

### 其他组件

- `accordion` - 手风琴组件（生成 FAQ schema）
- `full-width-banner` - 全宽横幅（DY Campaign）
- `hero` - Hero 组件（包含 items）

## 注意事项

1. **类型安全**：函数使用 `any` 类型来处理 Storyblok 的动态内容，在生产环境中应该添加适当的类型检查。

2. **异步处理**：DY Campaign 组件会创建异步请求，这些请求会被收集到 `dyCampaignPromises` 数组中，需要等待它们完成。

3. **FAQ Schema**：如果有多个组件包含 FAQ schema，会使用最后一个组件的 schema。

4. **性能考虑**：对于大型页面，建议使用 `processHeroComponent` 单独处理 Hero 组件，以避免重复处理。

## 测试

运行测试来验证功能：

```bash
npm test utils/content-processor.test.ts
```

测试覆盖了所有主要函数和边界情况。
