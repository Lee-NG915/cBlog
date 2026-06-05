# PRD: PDP Data Bucket API 调用优化

## 文档信息

| 项目     | 内容       |
| -------- | ---------- |
| 文档版本 | 1.0        |
| 创建日期 | 2025-12-23 |
| 状态     | Draft      |
| 负责人   | TBD        |

---

## 1. 背景与问题

### 1.1 问题描述

在生产环境的日志监控中发现，PDP（产品详情页）页面加载时会突然产生大量对 Storyblok API 的 `/pdp/data-bucket/` 接口调用。具体问题包括：

1. **瞬间大量请求**：某个时刻会突然出现大量相同 slug 的 data-bucket 请求
2. **404 重复调用**：对于不存在的 data-bucket（返回 404），会重复调用 3 次
3. **资源浪费**：不必要的 API 调用增加了 Storyblok API 的负载和成本

### 1.2 问题根因分析

通过代码分析，发现问题根源如下：

#### 1.2.1 重复请求来源

PDP 页面的 `SbWidgets` 组件会加载 `pdp-widgets` 配置，其中包含多个 USP 组件：

```
PDP Page
├── uspPreload({ slug })                    ← 预加载调用
│
└── SbWidgets (pdp-widgets)
    └── SbWidgetsServer
        ├── RefinedUspVariantAServer ──────── getPdpDataBucketServer(slug)
        ├── RefinedUspVariantBServer ──────── getPdpDataBucketServer(slug)
        └── RefinedUspVariantCServer ──────── getPdpDataBucketServer(slug)
```

每个 USP 组件独立调用 `getPdpDataBucketServer(slug)`，导致相同 slug 被请求多次。

#### 1.2.2 404 重试问题

当前 `getPdpDataBucketServer` 使用 `unstable_cache` 包装，当缓存函数内部抛出错误时，Next.js 可能会触发重试机制。虽然代码中 404 返回 null 而不抛出错误，但缓存键的不一致可能导致多次请求。

#### 1.2.3 缓存键问题

当前缓存键包含 `params` 参数：

```typescript
const cacheKey = `pdp-data-bucket-${slug}${params ? `-${JSON.stringify(params)}` : ''}`;
```

如果不同组件传入不同的 `params`，会生成不同的缓存键，导致缓存未命中。

---

## 2. 目标与范围

### 2.1 项目目标

1. **减少 API 调用**：确保同一 PDP 页面渲染周期内，相同 slug 的 data-bucket 只请求一次
2. **消除 404 重试**：404 响应不触发重试，静默处理
3. **优化缓存策略**：统一缓存键，确保缓存命中率
4. **保持向后兼容**：不改变现有 API 签名和行为

### 2.2 成功指标

| 指标                                         | 当前值 | 目标值 |
| -------------------------------------------- | ------ | ------ |
| 单次 PDP 页面加载的 data-bucket API 调用次数 | 3-4 次 | 1 次   |
| 404 slug 的重复调用次数                      | 3 次   | 1 次   |
| 缓存命中率                                   | 未知   | > 90%  |

### 2.3 范围

**包含：**

- `getPdpDataBucketServer` 函数重构
- 请求去重机制实现
- 404 响应处理优化
- 缓存键统一

**不包含：**

- 其他 Storyblok API 调用优化
- USP 组件业务逻辑修改
- Storyblok CMS 配置变更

---

## 3. 解决方案

### 3.1 技术方案概述

采用 **双层缓存策略**：

```
┌─────────────────────────────────────────────────────────────┐
│                     请求入口                                 │
│  uspPreload / RefinedUspVariantA/B/C                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Layer 1: React cache                            │
│              (请求级别去重)                                   │
│                                                              │
│  - 同一渲染周期内相同 slug 只调用一次                          │
│  - 使用 React 的 cache() 函数                                │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Layer 2: unstable_cache                         │
│              (持久化缓存)                                     │
│                                                              │
│  - 跨请求缓存，10 分钟有效期                                  │
│  - 使用 slug 作为唯一缓存键                                   │
│  - 404 响应也会被缓存                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Storyblok API                                   │
│              api.storyblok.com                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心代码变更

#### 3.2.1 重构后的函数结构

```typescript
// 1. 纯粹的 API 调用函数（无缓存）
async function _fetchPdpDataBucket(slug: string): Promise<Result | null>

// 2. 持久化缓存层
function _createCachedFetcher(slug: string): () => Promise<Result | null>

// 3. 请求级别去重层
const _cachedGetPdpDataBucket = reactCache(async (slug: string) => {...})

// 4. 公开 API（保持向后兼容）
export async function getPdpDataBucketServer(slug: string, params?, options?): Promise<Result | null>
```

#### 3.2.2 缓存键策略

| 缓存层         | 缓存键格式                | 说明                      |
| -------------- | ------------------------- | ------------------------- |
| React cache    | `slug`                    | 函数参数作为隐式键        |
| unstable_cache | `pdp-data-bucket-${slug}` | 只使用 slug，忽略其他参数 |

#### 3.2.3 错误处理策略

| HTTP 状态码  | 处理方式  | 日志级别 | 缓存行为  |
| ------------ | --------- | -------- | --------- |
| 200          | 返回数据  | 无       | 缓存      |
| 404          | 返回 null | 无       | 缓存 null |
| 4xx (非 404) | 返回 null | warn     | 不缓存    |
| 5xx          | 返回 null | error    | 不缓存    |

---

## 4. 用户故事与验收标准

### 4.1 用户故事

| ID   | 角色         | 需求                              | 价值                    |
| ---- | ------------ | --------------------------------- | ----------------------- |
| US-1 | 系统运维人员 | PDP 页面的 data-bucket 请求被去重 | 减少 API 调用，降低成本 |
| US-2 | 系统运维人员 | 404 响应不触发重试                | 减少无效请求            |
| US-3 | 开发人员     | 缓存键生成逻辑保持一致            | 提高缓存命中率          |
| US-4 | 系统运维人员 | 控制并发请求数量                  | 保护 Storyblok API      |
| US-5 | 开发人员     | 预加载与组件共享缓存              | 优化页面加载性能        |

### 4.2 验收标准

#### AC-1: 请求去重

- [ ] 多个 USP 组件请求相同 slug 时，只发送一次 API 请求
- [ ] 预加载和组件渲染共享同一请求结果
- [ ] 使用 React cache 实现请求级别去重

#### AC-2: 404 处理

- [ ] 404 响应立即返回 null，不重试
- [ ] 404 响应被缓存，后续请求直接返回 null
- [ ] 404 不记录 error 级别日志

#### AC-3: 缓存一致性

- [ ] 相同 slug 使用相同缓存键
- [ ] 不同参数不影响缓存键
- [ ] 使用统一的缓存标签 `pdp-data-bucket`

#### AC-4: 并发控制

- [ ] 并发请求相同 slug 时只发送一个实际请求
- [ ] 请求失败不缓存，允许重试

#### AC-5: 预加载

- [ ] uspPreload 使用与组件相同的缓存机制
- [ ] 预加载结果可被后续组件复用

---

## 5. 实现计划

### 5.1 任务分解

| 阶段 | 任务                                 | 预估工时 | 优先级 |
| ---- | ------------------------------------ | -------- | ------ |
| 1    | 重构 getPdpDataBucketServer 核心函数 | 4h       | P0     |
| 2    | 优化错误处理逻辑                     | 2h       | P0     |
| 3    | 验证预加载和 USP 组件                | 1h       | P1     |
| 4    | 编写单元测试和属性测试               | 3h       | P1     |
| 5    | 集成测试和验证                       | 2h       | P1     |

### 5.2 里程碑

| 里程碑           | 完成标准                    | 目标日期 |
| ---------------- | --------------------------- | -------- |
| M1: 核心功能完成 | 请求去重和 404 处理优化完成 | TBD      |
| M2: 测试完成     | 所有测试通过                | TBD      |
| M3: 上线         | 生产环境验证通过            | TBD      |

---

## 6. 风险与缓解

| 风险                       | 影响                 | 概率 | 缓解措施                              |
| -------------------------- | -------------------- | ---- | ------------------------------------- |
| React cache 行为与预期不符 | 去重失效             | 低   | 充分测试，准备回滚方案                |
| unstable_cache API 变更    | 需要重新适配         | 中   | 关注 Next.js 更新，使用稳定的缓存模式 |
| 缓存 null 导致业务问题     | 产品配置更新后不生效 | 低   | 设置合理的缓存过期时间（10 分钟）     |

---

## 7. 监控与验证

### 7.1 监控指标

1. **API 调用次数**：通过 Datadog 监控 `api.storyblok.com` 的请求数量
2. **404 响应比例**：监控 404 响应的数量和比例
3. **缓存命中率**：通过日志分析缓存命中情况

### 7.2 验证方法

1. **开发环境**：使用 Network 面板验证请求数量
2. **测试环境**：运行自动化测试验证功能正确性
3. **生产环境**：对比上线前后的 API 调用量

---

## 8. 附录

### 8.1 相关文件

| 文件路径                                                                      | 说明         |
| ----------------------------------------------------------------------------- | ------------ |
| `libs/modules/cms/domain/src/lib/api/server-api/pdp-data.ts`                  | 核心函数实现 |
| `libs/modules/cms/services/src/preload/pdp/usp-preload.ts`                    | 预加载函数   |
| `libs/modules/cms/components/src/lib/usp/refined/*/`                          | USP 组件     |
| `apps/web/app/[deviceTheme]/[region]/[locale]/(pdp)/products/[slug]/page.tsx` | PDP 页面     |

### 8.2 参考资料

- [Next.js unstable_cache 文档](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
- [React cache 文档](https://react.dev/reference/react/cache)
- [Storyblok API 文档](https://www.storyblok.com/docs/api/content-delivery)
