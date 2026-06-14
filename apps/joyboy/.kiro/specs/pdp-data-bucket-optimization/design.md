# Design Document: PDP Data Bucket API 调用优化

## Overview

本设计文档描述了如何优化 PDP 页面中 Storyblok Data Bucket API 的调用逻辑，解决当前存在的重复请求和 404 重试问题。

### 问题分析

当前系统存在以下问题：

1. **重复请求**：PDP 页面中多个 USP 组件（RefinedUspVariantA/B/C）各自独立调用 `getPdpDataBucketServer(slug)`，导致相同 slug 被请求多次
2. **预加载未共享**：`uspPreload` 的预加载结果未能被后续组件复用
3. **404 重试**：虽然代码中没有显式重试逻辑，但 `unstable_cache` 在函数抛出错误时可能触发重试
4. **缓存键不一致**：当前缓存键包含 `params`，可能导致相同 slug 但不同参数的请求无法命中缓存

### 调用链路

```
PDP Page
├── uspPreload({ slug }) ──────────────────┐
│                                          │
├── SbWidgets                              │
│   └── SbWidgetsServer                    │
│       └── StoryblokServerComponent       │
│           ├── RefinedUspVariantAServer ──┼── getPdpDataBucketServer(slug)
│           ├── RefinedUspVariantBServer ──┼── getPdpDataBucketServer(slug)
│           └── RefinedUspVariantCServer ──┴── getPdpDataBucketServer(slug)
```

## Architecture

### 解决方案架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        PDP Page                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ uspPreload   │    │ USP Comp A   │    │ USP Comp B   │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         └───────────────────┼───────────────────┘                │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           React cache (Request-level Dedup)              │    │
│  │                 cachedGetPdpDataBucket                   │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           unstable_cache (Persistent Cache)              │    │
│  │                 getPdpDataBucketServer                   │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Storyblok API (fetch)                       │    │
│  │         api.storyblok.com/v2/cdn/stories/...             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 双层缓存策略

1. **React cache（请求级别）**：在单个请求生命周期内去重，确保同一渲染周期内相同 slug 只调用一次
2. **unstable_cache（持久化缓存）**：跨请求缓存，减少对 Storyblok API 的调用

## Components and Interfaces

### 1. 核心函数重构

#### `getPdpDataBucketServer` 重构

```typescript
// libs/modules/cms/domain/src/lib/api/server-api/pdp-data.ts

import { cache as reactCache } from 'react';
import { unstable_cache } from 'next/cache';

/**
 * 内部函数：实际执行 API 请求
 * 不包含任何缓存逻辑
 */
async function _fetchPdpDataBucket(slug: string): Promise<ISbStoryData<DataBucketStoryblok> | null> {
  const region = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  const path = `${region}/general-configuration/universal-config-new-joyboy/pdp/data-bucket/${slug}`;
  const token = EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN;
  const version = EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test') ? 'draft' : 'published';

  const url = `https://api.storyblok.com/v2/cdn/stories/${path}?token=${token}&version=${version}`;

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // 404 静默处理，不抛出错误
    }
    if (response.status >= 400 && response.status < 500) {
      logger.warn('PDPDataBucket client error', { status: response.status, slug, path });
    } else if (response.status >= 500) {
      logger.error('Failed to fetch PDPDataBucket', { status: response.status, slug, path });
    }
    return null;
  }

  const data = await response.json();
  return data.story;
}

/**
 * 持久化缓存层
 * 使用 unstable_cache 实现跨请求缓存
 */
function _createCachedFetcher(slug: string) {
  const cacheKey = `pdp-data-bucket-${slug}`;

  return unstable_cache(() => _fetchPdpDataBucket(slug), [cacheKey], {
    tags: ['pdp-data-bucket', cacheKey],
    revalidate: 600, // 10分钟缓存
  });
}

/**
 * 请求级别去重层
 * 使用 React cache 确保同一请求周期内只调用一次
 */
const _cachedGetPdpDataBucket = reactCache(async (slug: string): Promise<ISbStoryData<DataBucketStoryblok> | null> => {
  const cachedFetcher = _createCachedFetcher(slug);
  return cachedFetcher();
});

/**
 * 公开 API
 * 服务端获取 PDP 数据桶内容（带双层缓存）
 */
export async function getPdpDataBucketServer(
  slug: string,
  _params?: Partial<ISbStoryParams>, // 保留参数签名以保持向后兼容，但不使用
  _cacheOptions?: { tags?: string[]; revalidate?: number } // 保留参数签名
): Promise<ISbStoryData<DataBucketStoryblok> | null> {
  return _cachedGetPdpDataBucket(slug);
}
```

### 2. 预加载函数优化

```typescript
// libs/modules/cms/services/src/preload/pdp/usp-preload.ts

import { getPdpDataBucketServer } from '@castlery/modules-cms-domain/server';

interface UspPreloadProps {
  slug: string;
}

/**
 * 预加载 PDP Data Bucket
 * 使用与组件相同的缓存机制，确保预加载结果可被复用
 */
export const uspPreload = ({ slug }: UspPreloadProps) => {
  // 使用 void 触发预加载，不等待结果
  void getPdpDataBucketServer(slug);
};
```

## Data Models

### 缓存数据结构

```typescript
// 缓存键格式
type CacheKey = `pdp-data-bucket-${string}`;

// 缓存值类型
type CacheValue = ISbStoryData<DataBucketStoryblok> | null;

// 缓存配置
interface CacheConfig {
  tags: string[];
  revalidate: number; // 秒
}
```

### 缓存标签策略

| 标签                     | 用途                                        |
| ------------------------ | ------------------------------------------- |
| `pdp-data-bucket`        | 全局标签，用于批量失效所有 data-bucket 缓存 |
| `pdp-data-bucket-{slug}` | 特定 slug 标签，用于精确失效单个缓存        |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: 请求去重

_For any_ PDP 页面渲染周期，_for any_ 相同的 slug，无论有多少个组件调用 `getPdpDataBucketServer(slug)`，实际发送到 Storyblok API 的请求数量应该为 1。

**Validates: Requirements 1.1, 1.2, 4.1, 5.1, 5.2, 5.3**

### Property 2: 404 响应不重试

_For any_ 返回 404 的 slug，调用 `getPdpDataBucketServer(slug)` 应该：

- 返回 `null`
- 只发送一次 API 请求（不重试）
- 不记录 error 级别日志

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: 缓存键一致性

_For any_ slug，无论传入什么可选参数（params, cacheOptions），`getPdpDataBucketServer` 应该使用相同的缓存键，返回相同的缓存结果。

**Validates: Requirements 3.1, 3.2**

### Property 4: 错误不缓存

_For any_ 导致 5xx 错误的请求，错误结果不应被缓存，后续请求应该重新发送 API 请求。

**Validates: Requirements 4.3**

### Property 5: 日志级别正确性

_For any_ HTTP 响应状态码：

- 404: 不记录日志
- 4xx (非 404): 记录 warn 级别
- 5xx: 记录 error 级别

**Validates: Requirements 2.3, 6.3**

## Error Handling

### 错误类型和处理策略

| 错误类型   | HTTP 状态码  | 处理策略  | 日志级别 | 缓存行为  |
| ---------- | ------------ | --------- | -------- | --------- |
| 资源不存在 | 404          | 返回 null | 无       | 缓存 null |
| 客户端错误 | 4xx (非 404) | 返回 null | warn     | 不缓存    |
| 服务器错误 | 5xx          | 返回 null | error    | 不缓存    |
| 网络错误   | N/A          | 返回 null | error    | 不缓存    |

### 错误处理代码示例

```typescript
if (!response.ok) {
  if (response.status === 404) {
    // 404 是正常业务场景，静默处理
    return null;
  }

  if (response.status >= 400 && response.status < 500) {
    logger.warn('PDPDataBucket client error', { status: response.status, slug });
    throw new Error(`Client error: ${response.status}`); // 抛出错误，不缓存
  }

  if (response.status >= 500) {
    logger.error('Failed to fetch PDPDataBucket', { status: response.status, slug });
    throw new Error(`Server error: ${response.status}`); // 抛出错误，不缓存
  }
}
```

## Testing Strategy

### 单元测试

1. **请求去重测试**

   - Mock fetch，验证多次调用只触发一次实际请求
   - 验证预加载和组件调用共享结果

2. **404 处理测试**

   - Mock 404 响应，验证返回 null
   - 验证不触发重试
   - 验证不记录 error 日志

3. **缓存键测试**
   - 验证相同 slug 不同参数使用相同缓存键

### 属性测试

使用 `fast-check` 进行属性测试：

```typescript
import fc from 'fast-check';

// Property 1: 请求去重
test('should deduplicate requests for same slug', async () => {
  await fc.assert(
    fc.asyncProperty(fc.string(), async (slug) => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      // 并发调用多次
      await Promise.all([getPdpDataBucketServer(slug), getPdpDataBucketServer(slug), getPdpDataBucketServer(slug)]);

      // 验证只调用一次
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    }),
    { numRuns: 100 }
  );
});
```

### 集成测试

1. 在开发环境验证 PDP 页面加载时的 API 调用数量
2. 使用 Datadog 监控生产环境的请求去重效果
