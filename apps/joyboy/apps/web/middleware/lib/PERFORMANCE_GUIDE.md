# Next.js Middleware Performance Guide

## 🚀 高性能 API Client 设计

### 核心优化策略

#### 1. 同机器部署优化

- **600ms 超时**：针对同机器部署的优化超时设置
- **智能兜底**：超时或错误时自动使用预配置的兜底数据
- **Next.js 缓存**：使用 `force-cache` 策略最大化缓存效果

#### 2. 按地区区分的兜底数据

```typescript
// 不同地区有不同的 UUID 和配置
const REGION_FALLBACK_DATA: Record<
  Region,
  {
    categories: CategoryData[];
    sales: SaleData[];
  }
> = {
  sg: {
    sales: [{ url: '/sale', uuid: 'sg-core-sale-uuid', type: 'sale' }],
  },
  my: {
    sales: [{ url: '/sale', uuid: 'my-core-sale-uuid', type: 'sale' }],
  },
};
```

#### 3. URL 格式统一

- **API 返回格式**：所有 URL 都以 `/` 开头
- **与 originalPathname 一致**：减少 URL 转换和检查
- **简化匹配逻辑**：直接字符串比较，无需额外处理

### API 使用示例

#### 基础调用

```typescript
// 自动按地区获取兜底数据
const categoriesResponse = await fetchCategories(baseUrl, region);
const salesResponse = await fetchSales(baseUrl, region);
```

#### 性能监控

```typescript
const metrics = getApiPerformanceMetrics();
console.log(`API调用: ${metrics.apiCallCount}, 兜底率: ${metrics.fallbackRate}%`);
```

### 性能特征

#### 响应时间

- **缓存命中**: < 50ms
- **API 调用**: 100-300ms
- **超时兜底**: 600ms
- **内存使用**: < 1MB（兜底数据）

#### 兜底策略

- **自动触发**：API 超时或错误时
- **地区特定**：每个地区都有专门的兜底数据
- **业务友好**：基于真实 API 响应配置的核心数据

### 地区支持

#### 支持的地区

- **sg**: 新加坡
- **my**: 马来西亚
- **au**: 澳大利亚

#### 兜底数据配置

每个地区包含：

- **18+ 核心分类**：sofas, tables, chairs, beds, storage 等
- **9+ 重要销售页面**：核心销售、分类销售、季节性销售

### 业务集成

#### Category Middleware

```typescript
// 精确匹配 + 前缀匹配
const matchedCategory = categories.find((category) => {
  if (category.url === originalPathname) return true;
  if (originalPathname.startsWith(category.url + '/')) return true;
  return false;
});
```

#### Sale Middleware

```typescript
// 仅精确匹配
const matchedSale = sales.find((sale) => sale.url === originalPathname);

// 根据类型构建重写路径
const rewritePath =
  matchedSale.type === 'visual-sale' ? `/sales/visual-sale/${matchedSale.uuid}` : `/sales/${matchedSale.uuid}`;
```

### 监控和调试

#### 性能指标

- `apiCallCount`: API 调用总数
- `fallbackUsageCount`: 兜底使用次数
- `averageApiTime`: 平均 API 响应时间
- `fallbackRate`: 兜底使用率百分比

#### 日志输出

```
[CategoryMiddleware] Rewriting /sofas → /categories/sofas-sg
[SaleMiddleware] Rewriting /sale → /sales/sg-core-sale-uuid (sale)
API call to /api/sg/categories failed, using fallback data: AbortError
```

### 最佳实践

1. **URL 格式**：确保 API 返回的 URL 都以 `/` 开头
2. **地区配置**：为每个地区配置专门的兜底数据
3. **超时设置**：600ms 适合同机器部署，可根据实际情况调整
4. **缓存策略**：充分利用 Next.js 的 `force-cache`
5. **错误处理**：始终有兜底数据，确保业务连续性

### 故障恢复

#### 自动兜底

- API 超时 → 使用地区特定兜底数据
- API 错误 → 自动降级到兜底数据
- 网络问题 → 无缝切换到预配置数据

#### 业务连续性

- **零停机**：兜底数据确保核心功能始终可用
- **渐进恢复**：API 恢复后自动使用最新数据
- **监控友好**：详细的性能指标和错误日志
