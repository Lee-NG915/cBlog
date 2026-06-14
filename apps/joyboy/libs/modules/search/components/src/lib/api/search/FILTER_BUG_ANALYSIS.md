# 🐛 搜索过滤逻辑 Bug 分析报告

## 问题概述

当同时应用 `facetFilters`（材质过滤）和 `numericFilters`（价格过滤）时，搜索结果不完整：

- **预期**：应该返回 2 个 SPU
- **实际**：只返回 1 个 SPU，且该 SPU 的 variants 数量不正确

## 测试用例

```bash
# 测试请求
curl 'http://localhost:7780/sg/api/search' -H 'Content-Type: application/json' \
  --data-raw '[{
    "indexName":"web_product",
    "params":{
      "facetFilters":[["material_filter:Performance Fabric"]],
      "numericFilters":["price>=4976","price<=5624"],
      "hitsPerPage":24,
      "page":0,
      "query":"",
      "ruleContexts":["{\"queryString\":\"\",\"baseFilters\":[],\"categoryPermalink\":\"sofas\",\"currentZipcode\":\"90001\"}"]
    }
  }]'
```

### 过滤条件

- **材质过滤** (facetFilters): `material_filter:Performance Fabric`
- **价格过滤** (numericFilters): `price>=4976` AND `price<=5624`
- **分类过滤** (baseFilters): `categoryPermalink:sofas`

## 数据事实

### 应该返回的 SPU（通过客户端验证）

1. **SPU #5491** (Dawson Pit-Sectional Sofa)

   - 符合条件的 variants: 9 个
   - Variant IDs: 34287, 34288, 34289, 34290, 34291, 34292, 34293, 34294, 34295
   - 价格: $5484

2. **SPU #5040** (Dawson L-Shape Sectional Sofa)
   - 符合条件的 variants: 9 个
   - Variant IDs: 33739, 33764, 34276, 34277, 34278, 34279, 34280, 34281, 34282
   - 价格: $5025 - $5165

### 实际返回的结果

- **nbHits**: 1 (❌ 应该是 2)
- **返回的 SPU**: 只有 SPU #5040
- **该 SPU 的 variants**: 只有 2 个 [33739, 34764] (❌ 应该是 9 个)

## 🔍 根本原因分析

### Inner_hits 结构分析（SPU #5040）

```json
{
  "inner_hits": {
    // facetFilters 产生的 inner_hits（材质过滤）
    "variants.properties.material_filter_r0_f0": {
      "hits": {
        "hits": [
          /* 9 个 variants */
        ]
      }
    },

    // facetFilters 产生的重复 inner_hits
    "variants.properties.material_filter_r0_f1": {
      "hits": {
        "hits": [
          /* 9 个 variants */
        ]
      }
    },

    // ❌ numericFilters 产生的 inner_hits（价格过滤）
    "variants": {
      "hits": {
        "total": { "value": 12, "relation": "eq" },
        "hits": [
          /* 只返回了 3 个 variants！*/
        ]
        // 实际返回：[33739, 33764, 34272]
        // 应该返回：[33739, 33764, 34276, 34277, 34278, 34279, 34280, 34281, 34282] (9个)
      }
    }
  }
}
```

### 核心问题

**问题 1: Inner_hits size 限制**

- `variants` inner_hits 的 `total.value = 12`，说明有 12 个 variants 符合价格条件
- 但实际只返回了 3 个 hits
- **原因**: inner_hits 默认 size 可能太小

**问题 2: 交集逻辑的错误行为**

```typescript
// 在 variants-filter.utils.ts 的 extractVariantsFromInnerHits 函数中
// 当存在多个 variant 相关的 inner_hits 时，会计算交集

variantRelatedKeys = [
  'variants.properties.material_filter_r0_f0', // 9 个 variants
  'variants.properties.material_filter_r0_f1', // 9 个 variants (重复)
  'variants', // 只有 3 个 variants ❌
];

// 交集结果：只有 2 个 variants [33739, 33764]
// 因为只有这 2 个同时出现在所有 3 个 inner_hits 中
```

**问题 3: SPU #5491 完全丢失**

- SPU #5491 也有 9 个符合条件的 variants
- 但完全没有出现在搜索结果中
- 可能的原因：
  1. Elasticsearch 查询层面就没返回这个 SPU
  2. 或者在某个过滤阶段被错误地过滤掉了

## 🎯 问题定位

### 位置 1: `utils.ts` - Inner_hits size 配置

```typescript:libs/modules/search/components/src/lib/api/search/utils.ts
// 第 42 行
setNestedValue(nestedFilter, 'bool.should.0.nested.inner_hits.size', 100);
```

**问题**: 这个设置只应用到 facetFilters 产生的 nested filters，但 numericFilters 产生的 nested query 可能没有设置 inner_hits size。

### 位置 2: `variants-filter.utils.ts` - 交集逻辑

```typescript:libs/modules/search/components/src/lib/api/search/variants-filter.utils.ts
// extractVariantsFromInnerHits 函数
const variantRelatedKeys = Object.keys(innerHits).filter(
  (key) => key === 'variants' || key.startsWith('variants.')
);

// 如果有多个 inner_hits，会计算交集
// 这在 inner_hits 数据不完整时会导致错误的过滤
```

**问题**:

1. 交集逻辑假设所有 inner_hits 都返回了完整数据
2. 但如果某个 inner_hits 因为 size 限制只返回部分数据，交集就会错误

### 位置 3: Elasticsearch 查询生成

可能在生成 numericFilters 的 Elasticsearch query 时，没有正确配置 inner_hits。

## 🔧 解决方案思路

### 方案 1: 统一设置 inner_hits size（推荐）

确保所有产生 inner_hits 的查询都设置足够大的 size：

```typescript
// 需要找到 numericFilters 转换为 nested query 的地方
// 确保设置 inner_hits.size = 100
{
  nested: {
    path: 'variants',
    query: { /* price range query */ },
    inner_hits: {
      name: 'variants',
      size: 100  // ← 确保设置这个
    }
  }
}
```

### 方案 2: 优化交集逻辑

修改 `extractVariantsFromInnerHits` 函数：

1. 检测 inner_hits 是否完整（通过比较 total 和 hits.length）
2. 如果某个 inner_hits 不完整，记录警告
3. 考虑使用并集而非交集，或者只使用可信的完整数据源

### 方案 3: 重新设计过滤策略

不依赖 inner_hits 的交集，而是：

1. 使用单一的综合查询获取所有符合条件的 variants
2. 或者在客户端进行二次过滤

## 📋 检查清单

- [ ] 检查 SearchKit API 如何处理 numericFilters
- [ ] 找到 numericFilters 转换为 Elasticsearch nested query 的代码
- [ ] 确保所有 nested query 都配置了 `inner_hits.size = 100`
- [ ] 验证修复后 SPU #5491 能否正确返回
- [ ] 验证修复后 SPU #5040 返回完整的 9 个 variants
- [ ] 添加日志以便未来调试类似问题

## 相关文件

1. `libs/modules/search/components/src/lib/api/search/route.ts` - 主路由逻辑
2. `libs/modules/search/components/src/lib/api/search/utils.ts` - Inner_hits 配置
3. `libs/modules/search/components/src/lib/api/search/variants-filter.utils.ts` - 交集过滤逻辑
4. `@searchkit/api` - SearchKit 库（可能需要查看其 numericFilters 处理逻辑）

## 测试验证命令

```bash
# 1. 只用材质过滤（应该返回 76 个 SPU）
curl 'http://localhost:7780/sg/api/search' -H 'Content-Type: application/json' \
  --data-raw '[{"indexName":"web_product","params":{"facetFilters":[["material_filter:Performance Fabric"]],"hitsPerPage":100,"page":0}}]' \
  | jq '.results[0].nbHits'

# 2. 材质 + 价格过滤（应该返回 2 个 SPU，每个都有完整的 variants）
curl 'http://localhost:7780/sg/api/search' -H 'Content-Type: application/json' \
  --data-raw '[{"indexName":"web_product","params":{"facetFilters":[["material_filter:Performance Fabric"]],"numericFilters":["price>=4976","price<=5624"],"hitsPerPage":24,"page":0}}]' \
  | jq '.results[0] | {nbHits, spus: [.hits[] | {id, name, variant_count: (.variants | length)}]}'
```

---

**创建时间**: 2025-10-10
**严重程度**: 🔴 High - 导致搜索结果不准确，影响用户体验
**影响范围**: 所有同时使用 facetFilters 和 numericFilters 的搜索场景
