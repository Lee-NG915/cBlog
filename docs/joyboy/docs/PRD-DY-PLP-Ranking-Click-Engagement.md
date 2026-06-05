# PRD: DY PLP Ranking Click Engagement 上报

## 背景

在 Joyboy 重构过程中，我们将 DY PLP Ranking 从客户端迁移到了服务端实现。但在迁移后发现 DY 看板中没有相关的 click 事件数据，导致无法追踪 PLP Ranking campaign 的效果。

### 问题根因

对比 Onepiece 原有实现，发现 Joyboy 缺失了两个关键环节：

1. **服务端 DY Ranking 没有附加追踪 ID**：DY API 返回的 `decisionId`、`variationId`、`slotId` 没有被附加到产品数据上
2. **客户端点击事件没有上报 DY Engagement**：产品点击时没有调用 DY Collect API 上报 SLOT_CLICK/CLICK 事件

## 解决方案

### 数据流设计

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              服务端 (SSR)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PLP 页面请求                                                             │
│         ↓                                                                   │
│  2. applyDyRanking() 调用 DY API                                            │
│         ↓                                                                   │
│  3. DY 返回: { decisionId, variationId, slots: [{ sku, slotId }] }          │
│         ↓                                                                   │
│  4. 将追踪 ID 附加到每个产品: hit._source.dyTracking = { ... }               │
│         ↓                                                                   │
│  5. 返回带有 dyTracking 的产品列表给客户端                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                              客户端 (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  6. 用户点击产品卡片                                                         │
│         ↓                                                                   │
│  7. TrackingMiddleware 触发 EVENT_PLP_PRODUCT_CLICK                         │
│         ↓                                                                   │
│  8. trackPLPProductClickEvent 检查 product.dyTracking                       │
│         ↓                                                                   │
│  9. dispatch(trackDYApiRecommendationsEngagementEvent({ slotId }))          │
│         ↓                                                                   │
│  10. reportDyApiRecommendationsEngagement RTK Query endpoint                │
│         ↓                                                                   │
│  11. reportRecommendationsEngagement() 调用 DY Collect API                  │
│         ↓                                                                   │
│  12. 上报 SLOT_CLICK 到 DY                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### DY API 类型区分

| API 类型          | 端点                                                           | 用途              | 事件类型                               |
| ----------------- | -------------------------------------------------------------- | ----------------- | -------------------------------------- |
| DY Events API     | `window.DY.API('event', {...})`                                | 业务事件追踪      | Add to Cart, Purchase, Filter Items 等 |
| DY Engagement API | `https://direct-collect.dy-api.com/v2/collect/user/engagement` | Campaign 效果追踪 | SLOT_CLICK, CLICK, IMP 等              |

## 技术实现

### 1. 服务端：附加 DY 追踪 ID

**文件**: `libs/modules/search/components/src/lib/api/search/dy-ranking.utils.ts`

```typescript
// 新增类型定义
export interface DyTrackingMetadata {
  decisionId: string;
  variationId: string;
  slotId: string;
}

// applyDyRanking() 函数修改
export async function applyDyRanking(hits, dyRanking) {
  // ... 调用 DY API 获取排序结果 ...

  const decisionId = choices?.[0]?.decisionId || '';
  const variationId = choices?.[0]?.variations?.[0]?.id || '';
  const slots = choices?.[0]?.variations?.[0]?.payload?.data?.slots || [];

  // 创建 SKU -> slotId 映射
  const skuToSlotIdMap = new Map();
  slots.forEach((slot) => {
    if (slot.sku && slot.slotId) {
      skuToSlotIdMap.set(slot.sku, slot.slotId);
    }
  });

  // 将追踪 ID 附加到每个产品
  rankedSkus.forEach((sku) => {
    const hit = skuToHitMap.get(sku);
    if (hit) {
      const enhancedHit = {
        ...hit,
        _source: {
          ...hit._source,
          dyTracking: {
            decisionId,
            variationId,
            slotId: skuToSlotIdMap.get(sku) || '',
          },
        },
      };
      reorderedHits.push(enhancedHit);
    }
  });

  return reorderedHits;
}
```

### 2. 客户端：DY Engagement 上报

**文件**: `libs/modules/tracking/services/src/lib/triggers/plp-events-trigger.ts`

```typescript
import {
  reportDyApiCustomCodeCampaignEngagement,
  reportDyApiRecommendationsEngagement,
} from '@castlery/modules-dy-domain';

export const trackDYApiRecommendationsEngagementEvent = createAsyncThunk(
  'tracking/trackDYApiRecommendationsEngagementEvent',
  async (payload: { slotId: string }, { dispatch, fulfillWithValue }) => {
    console.log('trackDYApiRecommendationsEngagementEvent', payload);
    if (!payload.slotId) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      await dispatch(reportDyApiRecommendationsEngagement.initiate({ slotId: payload.slotId }));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackDYApiRecommendationsEngagementEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
```

**文件**: `libs/modules/tracking/services/src/lib/triggers/plp-events-trigger.ts`

```typescript
import { trackDYApiRecommendationsEngagementEvent } from "@castlery/module-tracking-service"

export function trackPLPProductClickEvent = createAsyncThunk(
  'tracking/trackPLPProductClickEvent',
  async (payload: { product: any; variant: any; page: string }, { dispatch, fulfillWithValue }) => {
    // track ga product click event
    // ......

    // track dy engagement event
    if (product.dyTracking?.slotId) {
      await dispatch(trackDYApiRecommendationsEngagementEvent({ slotId: product.dyTracking.slotId }));
    }

  })

```

### 3. RTK Query Endpoint + Redux AsyncThunk 封装

**文件 1**: `libs/modules/dy/domain/src/lib/api/campaigns.client.api.ts`

```typescript
// RTK Query endpoint for DY engagement reporting
export const dyRecommendationsApi = dyApi.injectEndpoints({
  endpoints: (builder) => {
    //......
    reportDyApiRecommendationsEngagement: builder.mutation<any, { slotId: string }>({
      query: ({ slotId }: { slotId: string }) => ({
        url: `collect/user/engagement`,
        method: 'POST',
        headers: getDyApiHeader(),
        body: getDyApiRecommendationsCampaignEngagementPayload({ slotId }),
      }),
    }),
  }})

export const { reportDyApiRecommendationsEngagement } = dyRecommendationsApi.endpoints;
```

**文件 2**: `libs/modules/tracking/services/src/lib/triggers/dy-events.trigger.ts`

```typescript
export const trackDYApiRecommendationsEngagementEvent = createAsyncThunk(
  'tracking/trackDYApiRecommendationsEngagementEvent',
  async (payload: { slotId: string }, { dispatch, fulfillWithValue }) => {
    if (!payload.slotId) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      await dispatch(reportDyApiRecommendationsEngagement.initiate({ slotId: payload.slotId }));
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (error) {
      logger.error('trackDYApiRecommendationsEngagementEvent failed', { error });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
```

**架构说明**：

使用 2 层架构实现 DY Engagement 上报：

1. **RTK Query 层** (`dy-collect.api.ts`)：使用 RTK Query mutation endpoint，便于缓存管理和状态追踪
2. **Redux Thunk 层** (`dy-events.trigger.ts`)：提供统一的追踪事件接口，集成到现有的事件系统

### 4. PLP 点击事件集成

**文件**: `libs/modules/tracking/services/src/lib/triggers/plp-events-trigger.ts`

```typescript
/**
 * @description track product click event for PLP page
 * @note GA event : productClick
 * @note DY event : SLOT_CLICK (engagement reporting via trackDYApiRecommendationsEngagementEvent)
 * @scenario 1. Triggered when a user clicks on a product item in product listing page (PLP)
 */
export const trackPLPProductClickEvent = createAsyncThunk(
  'tracking/trackPLPProductClickEvent',
  async (payload: { product: any; variant: any; page: string }, { dispatch, fulfillWithValue }) => {
    if (!payload.product || !payload.variant) {
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
    try {
      const { product, variant } = payload;
      const brand = findBrand(product.taxons);
      const [pageName, subPageName] = getBreadcrumbNames(product.taxons);

      // 1. GA tracking
      const params = {
        event: EVENTS_NAMES_MAP.GA_CUSTOM_PRODUCT_CLICK,
        ecommerce: {
          currencyCode: INTL_CURRENCY,
          click: {
            actionField: { list: payload.page ?? '' },
            products: [
              {
                name: variant.name,
                id: variant.sku,
                price: getOriginalAmount(variant.price),
                dimension1: pageName,
                category: subPageName,
                brand,
              },
            ],
          },
        },
      };
      gaTrack(params);

      // 2. DY engagement reporting (SLOT_CLICK)
      // Report click engagement to DY if the product has DY tracking metadata
      // This is essential for DY to track the effectiveness of PLP Ranking campaigns
      if (product.dyTracking?.slotId) {
        await dispatch(trackDYApiRecommendationsEngagementEvent({ slotId: product.dyTracking.slotId }));
      }

      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_SUCCESS);
    } catch (e) {
      logger.error('trackPLPProductClickEvent failed', { error: e });
      return fulfillWithValue(TRACKING_MSGS_MAP.TRACKING_ERROR);
    }
  }
);
```

**关键点**：

1. **条件触发**：仅当 `product.dyTracking.slotId` 存在时才上报 DY engagement
2. **参数传递**：只传递 `slotId`，不传递整个 `dyTracking` 对象
3. **非阻塞**：使用 `await` 但不影响页面跳转，即使上报失败也不会阻止用户操作
4. **双重追踪**：同时进行 GA 和 DY 的追踪，互不影响

## 文件变更清单

| 文件路径                                                                | 变更类型 | 说明                                                                |
| ----------------------------------------------------------------------- | -------- | ------------------------------------------------------------------- | --- |
| `libs/modules/search/components/src/lib/api/search/dy-ranking.utils.ts` | 修改     | 添加 `DyTrackingMetadata` 类型，修改 `applyDyRanking()` 附加追踪 ID |     |
| `libs/modules/dy/domain/src/lib/api/campaigns.client.api.ts`            | 新增     | RTK Query API endpoint for DY engagement reporting                  |
| `libs/modules/tracking/services/src/lib/triggers/dy-events.trigger.ts`  | 修改     | 添加 `trackDYApiRecommendationsEngagementEvent` AsyncThunk          |
| `libs/modules/tracking/services/src/lib/triggers/plp-events-trigger.ts` | 修改     | 在 `trackPLPProductClickEvent` 中调用 DY engagement 上报 (第 93 行) |
| `libs/modules/tracking/services/src/lib/events-map.ts`                  | 修改     | 导出 `EVENT_DY_API_RECOMMENDATIONS_ENGAGEMENT`                      |
| `libs/modules/tracking/services/src/index.ts`                           | 修改     | 导出 dy-engagement 相关函数和类型                                   |

## 实现要点与最佳实践

### 1. 非阻塞设计

DY Engagement 上报不应该阻塞用户交互：

- 使用 `async/await` 但不等待结果
- 上报失败不影响页面跳转
- 所有错误都被捕获并记录日志

### 2. 条件上报

只有当产品有 DY 追踪信息时才上报：

```typescript
if (product.dyTracking?.slotId) {
  await dispatch(trackDYApiRecommendationsEngagementEvent({ slotId: product.dyTracking.slotId }));
}
```

这样避免了对非 DY Ranking 产品的无效请求。

### 4. 环境变量配置

确保在环境变量中配置了 DY API Key：

```bash
NEXT_PUBLIC_DY_CLIENT_API_KEY=your_dy_api_key
```

### 5. 日志级别

- `debug`：正常的上报成功/跳过场景
- `warn`：API 请求失败但不影响业务
- `error`：代码执行异常或关键错误

### 6. 性能考虑

- DY Engagement 上报是异步的，不会阻塞渲染
- 使用 RTK Query 自动处理请求去重和缓存
- fetch 请求设置 `credentials: 'omit'` 避免不必要的 cookie 传递

## 测试验证

### 验证步骤

1. 打开 PLP 页面（如 `/sg/categories/sofas`）
2. 打开浏览器 DevTools → Network 面板
3. 点击任意产品卡片
4. 检查是否有请求发送到 `https://direct-collect.dy-api.com/v2/collect/user/engagement`
5. 检查请求 payload 中是否包含 `SLOT_CLICK` 或 `CLICK` 类型

### 预期结果

```json
// 请求 URL
POST https://direct-collect.dy-api.com/v2/collect/user/engagement

// 请求 Headers
{
  "Content-Type": "application/json",
  "DY-API-Key": "your-dy-api-key"
}

// 请求 Body (SLOT_CLICK - PLP Ranking)
{
  "user": {
    "dyid": "f8e7d6c5-b4a3-2019-8765-4321fedcba09",
    "dyid_server": "a1b2c3d4e5f6"
  },
  "session": {
    "dy": "s1t2u3v4w5x6"
  },
  "engagements": [
    {
      "type": "SLOT_CLICK",
      "slotId": "slot_123456789"
    }
  ]
}

// 请求 Body (CLICK - 备用方案)
{
  "user": {
    "dyid": "f8e7d6c5-b4a3-2019-8765-4321fedcba09",
    "dyid_server": "a1b2c3d4e5f6"
  },
  "session": {
    "dy": "s1t2u3v4w5x6"
  },
  "engagements": [
    {
      "type": "CLICK",
      "decisionId": "decision_987654321",
      "variations": [123456]
    }
  ]
}
```

**数据来源说明**：

- `dyid`, `dyid_server`, `dy session`：从客户端 cookies 获取（通过 `makePersistenceHandles()`）
- `slotId`：从产品数据的 `product.dyTracking.slotId` 获取（服务端 DY Ranking API 返回）
- `decisionId`, `variations`：从产品数据的 `product.dyTracking` 获取（备用方案）

### DY 看板验证

1. 登录 DY 后台
2. 进入 PLP Ranking campaign 的报告页面
3. 确认 Click 数据开始有记录

## 故障排查

### 问题 1: 没有看到 DY Engagement 请求

**可能原因**：

1. 产品没有 `dyTracking` 数据 → 检查服务端 `applyDyRanking()` 是否正确附加数据
2. `slotId` 为空 → 检查 DY API 响应是否包含 `slotId`
3. DY cookies 不存在 → 检查用户是否禁用了 cookies 或 DY 脚本加载失败

**排查步骤**：

```javascript
// 在浏览器控制台查看产品数据
console.log(product.dyTracking); // 应该输出 { decisionId, variationId, slotId }

// 查看 DY cookies
document.cookie.split(';').filter((c) => c.includes('_dy'));
```

### 问题 2: DY Engagement 请求返回 4xx 错误

**可能原因**：

1. `DY-API-Key` 缺失或错误 → 检查环境变量 `NEXT_PUBLIC_DY_CLIENT_API_KEY`
2. 请求 payload 格式错误 → 检查 `buildEngagementPayload()` 输出
3. DY cookies 格式不正确 → 确认 cookies 值是字符串类型

**排查步骤**：

```bash
# 检查环境变量
echo $NEXT_PUBLIC_DY_CLIENT_API_KEY

# 查看详细错误日志
# 在浏览器控制台搜索 "dy_engagement"
```

### 问题 3: DY 看板仍然没有 Click 数据

**可能原因**：

1. DY 数据延迟 → 等待 10-30 分钟后再检查
2. Campaign 未正确配置 → 确认 DY campaign 已发布且 targeting 规则正确
3. 使用了错误的 DY 账号 → 确认 API Key 对应的 DY 账号

**排查步骤**：

1. 在 DY 后台查看 Real-time Events 面板
2. 手动触发几次点击，观察是否有实时数据
3. 联系 DY 技术支持确认数据接收情况

### 问题 4: 开发环境无法测试

**可能原因**：

1. 本地环境 DY 脚本未加载 → 使用生产环境 cookies 测试
2. localhost 域名限制 → 使用代理或配置 hosts

**解决方案**：

```bash
# 使用 ngrok 或 similar tool 暴露本地服务
ngrok http 3000

# 或者在 /etc/hosts 配置本地域名
127.0.0.1 local.castlery.com
```

## 参考文档

- [DY Engagement Tracking](https://dy.dev/docs/engagement)
- [DY Track Engagement API Reference](https://dy.dev/reference/track-engagement)
- [Joyboy Tracking Module README](../libs/modules/tracking/services/src/lib/README.md)

## 附录：Onepiece 原有实现对比

### Onepiece 数据流

```
EnhancedSearchkitManager.rankingByDy()
    ↓
getRankingParams() → 调用 DY API
    ↓
附加到 hit._source: { decisionId, variationId, slotId }
    ↓
Product.clickProduct() 取出追踪 ID
    ↓
dispatch(EVENT_PRODUCT_CLICK)
    ↓
gtmEventsMap.productClick()
    ↓
reportRecommendationsEngagement() 或 reportClickEngagement()
```

### Joyboy 新实现

```
SSR route.ts → applyDyRanking()
    ↓
附加到 hit._source.dyTracking: { decisionId, variationId, slotId }
    ↓
客户端渲染 PLP 页面
    ↓
用户点击产品 → dispatch(EVENT_PLP_PRODUCT_CLICK)
    ↓
trackPLPProductClickEvent()
    ├─> gaTrack() - GA 追踪
    └─> if (product.dyTracking?.slotId)
        └─> dispatch(trackDYApiRecommendationsEngagementEvent({ slotId }))
            └─> reportDyApiRecommendationsEngagement.initiate({ slotId })
                └─> reportRecommendationsEngagement({ slotId })
                    └─> fetch(DY Collect API)
```

**主要区别**：

1. **DY Ranking 从客户端迁移到服务端**：

   - Onepiece: 客户端调用 DY API
   - Joyboy: SSR 时调用 DY API，提升性能和 SEO

2. **追踪 ID 存储结构**：

   - Onepiece: 直接存储在 `_source` 根级别
   - Joyboy: 封装在 `dyTracking` 对象中，更清晰的数据结构

3. **上报架构升级**：

   - Onepiece: 直接调用工具函数
   - Joyboy: 使用三层架构（Util → RTK Query → AsyncThunk），便于状态管理和错误追踪

4. **错误处理增强**：
   - 添加了完善的参数校验、日志记录和错误处理
   - 使用 `@castlery/observability` 统一日志管理
