# Next.js 错误处理流程说明

> **面向开发者的操作指南。** 本文档解释概念和流程。  
> Confluence 原始页面：[SOP: Next.js 错误处理流程](https://castlery.atlassian.net/wiki/spaces/EC/pages/3914236033)  
> 完整架构决策与硬规则（AI Agent 权威来源）：
> [`docs/ai-specs/observability/sentry-practices.md`](../ai-specs/observability/sentry-practices.md) ·
> [`docs/ai-specs/observability/logger.md`](../ai-specs/observability/logger.md)  
> 两者若有冲突，以 ai-specs 为准。

本文档说明 Next.js 应用中不同类型错误的处理流程，以及如何为它们添加标签。

## 错误类型和处理流程

### 1. 服务端渲染错误（SSR/RSC）

**场景**：在服务端渲染 React 组件时发生的错误

**流程**：

```
服务端错误发生（如数据获取失败）
  ↓
Next.js 捕获错误并生成 error digest
  ↓
将错误和 digest 传递给客户端的 error.tsx
  ↓
error.tsx 在客户端渲染（'use client'）
  ↓
useEffect 执行，调用 Sentry.captureException
  ↓
错误上报到 Sentry（✅ 带有 page_type 标签）
```

**标签来源**：

- `page_type`: 由 `error.tsx` 手动设置（如 `PAGE_TYPES.PLP`）
- `error_boundary`: 'page'
- `digest`: Next.js 生成的错误摘要

**示例**：

```typescript
// apps/web/app/[deviceTheme]/[region]/[locale]/(PLP)/error.tsx
export default function PLPError({ error, reset }) {
  return (
    <PageErrorBoundary
      error={error}
      reset={reset}
      pageType={PAGE_TYPES.PLP} // ✅ 设置 page_type 标签
    />
  );
}
```

**beforeSend 处理**：

```typescript
// domain 已由 SentryContextProvider 或 setGlobalSentryContext 显式设置
// beforeSend 可读取 page_type 标签做额外逻辑
const pageType = event.tags?.page_type; // 'plp'
if (pageType === 'plp') {
  // event.tags.domain 已经是 'product'，无需在 beforeSend 中推断
}
```

### 2. 客户端错误

**场景**：在浏览器中执行 JavaScript 时发生的错误

**流程**：

```
客户端错误发生（如点击事件处理器错误）
  ↓
error.tsx 捕获错误
  ↓
useEffect 执行
  ↓
Sentry.captureException（✅ 带有 page_type 标签）
```

**标签来源**：

- `page_type`: 由 `error.tsx` 手动设置
- `error_boundary`: 'page'

### 3. API 路由错误

**场景**：在 API 路由处理器中发生的错误

**流程**：

```
API 路由错误发生
  ↓
需要手动捕获并上报
  ↓
Sentry.captureException（❌ 没有 page_type 标签）
```

**标签来源**：

- ❌ 没有 `page_type`（因为不是页面错误）
- ✅ 有堆栈跟踪（可以推断模块）
- ✅ 有错误消息（可以推断类型）

**示例**：

```typescript
// apps/web/app/api/products/route.ts
import { captureProductError } from '@castlery/observability/server';

export async function GET(request: Request) {
  try {
    const products = await fetchProducts();
    return Response.json(products);
  } catch (error) {
    captureProductError(error, { extra: { api_route: '/api/products', method: 'GET' } });
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
```

**beforeSend 处理**：

```typescript
// domain 已由 captureProductError / captureStructuredError 显式设置
// beforeSend 执行 classifyErrorBucket 自动推断 error_bucket
```

### 4. Server Actions 错误

**场景**：在 Server Actions 中发生的错误

**流程**：

```
Server Action 错误发生
  ↓
withServerActionInstrumentation 捕获
  ↓
captureStructuredError 上报（❌ 没有 page_type 标签）
```

**标签来源**：

- ❌ 没有 `page_type`（因为不是页面错误）
- ✅ 有 `action_name` 标签（由 wrapper 设置）
- ✅ 有堆栈跟踪（可以推断模块）

**示例**：

```typescript
// libs/shared/utils/src/lib/auth/auth.actions.ts
export const loginAction = withServerActionInstrumentation(
  async (email: string, password: string) => {
    return await loginHandler(email, password);
  },
  {
    actionName: 'loginAction',
    sensitiveFields: ['password'],
  }
);
```

**beforeSend 处理**：

```typescript
// domain 已由 withServerActionInstrumentation 的 sentryContext.domain 显式设置
// priority 由 enrichContext 根据 domain 自动推断
```

### 5. 全局错误（根布局错误）

**场景**：根布局渲染错误

**流程**：

```
根布局错误发生
  ↓
global-error.tsx 捕获
  ↓
Sentry.captureException（✅ 特殊标签）
```

**标签来源**：

- `error_boundary`: 'global'
- `level`: 'fatal'
- ❌ 没有 `page_type`

## 标签推断策略

### 优先级 1: domain 标签（最可靠）

**适用于**：所有通过 `captureStructuredError` 上报的错误

```typescript
// domain 由开发者显式传入，不依赖推断
const domain = event.tags?.domain; // 'product'
```

**优点**：

- ✅ 非常可靠（显式设置）
- ✅ 不依赖 URL 或堆栈跟踪
- ✅ 适用于所有错误类型（页面、API、Server Actions）

### 优先级 2: page_type 标签（页面错误补充）

**适用于**：通过 `error.tsx` 边界捕获的页面渲染错误（当未能显式设置 domain 时）

```typescript
// SentryContextProvider 会根据 pageType 自动推断 domain 作为兜底
<SentryContextProvider pageType={PAGE_TYPES.PLP} domain={BUSINESS_DOMAIN.PRODUCT}>
```

**优点**：

- ✅ 适用于页面渲染错误
- ✅ `SentryContextProvider` 会自动从 pageType 推断 domain

**缺点**：

- ❌ 只适用于页面错误，API 和 Server Actions 无此标签

### 优先级 3: Sentry Ownership Rules 路径匹配（兜底）

**适用于**：domain 未设置时，通过代码路径匹配所有权

```
# 在 Sentry Dashboard 的 Issue Owners 中配置
path:libs/modules/product/* charlie.li@castlery.com
```

**优点**：

- ✅ 不依赖代码端标签
- ✅ 覆盖未设置 domain 的历史错误

**缺点**：

- ❌ 依赖堆栈跟踪中包含源文件路径
- ❌ 生产环境可能被压缩混淆

## 标签覆盖率

| 错误类型       | domain（显式）                                      | page_type | 路径匹配 | domain 准确度 |
| -------------- | --------------------------------------------------- | --------- | -------- | ------------- |
| SSR/RSC 错误   | ✅（SentryContextProvider）                         | ✅        | ✅       | ✅✅✅ 高     |
| 客户端错误     | ✅（captureStructuredError）                        | ✅        | ✅       | ✅✅✅ 高     |
| API 路由错误   | ✅（captureXxxError）                               | ❌        | ✅       | ✅✅✅ 高     |
| Server Actions | ✅（withServerActionInstrumentation sentryContext） | ❌        | ✅       | ✅✅✅ 高     |
| 全局错误       | ❌                                                  | ❌        | ✅       | ✅ 低（兜底） |

## 最佳实践

### 1. 为每个 Route Group 创建 error.tsx

```typescript
// apps/web/app/[deviceTheme]/[region]/[locale]/(PLP)/error.tsx
export default function PLPError({ error, reset }) {
  return (
    <PageErrorBoundary
      error={error}
      reset={reset}
      pageType={PAGE_TYPES.PLP} // ✅ 手动指定
    />
  );
}
```

### 2. 使用 Server Action Wrapper

```typescript
export const loginAction = withServerActionInstrumentation(
  async (email, password) => {
    // 业务逻辑
  },
  {
    actionName: 'loginAction', // ✅ 设置 action 名称
    sensitiveFields: ['password'],
  }
);
```

### 3. 在 API 路由中使用 domain 快捷函数

```typescript
import { captureStructuredError, BUSINESS_DOMAIN } from '@castlery/observability/server';

export async function GET(request: Request) {
  try {
    // 业务逻辑
  } catch (error) {
    captureStructuredError(error, {
      domain: BUSINESS_DOMAIN.PRODUCT, // ✅ 设置业务域
      extra: { api_route: '/api/products' },
    });
    throw error;
  }
}
```

### 4. 服务端组件错误处理

```typescript
// 在服务端组件中，让错误自然抛出，由 Next.js 错误边界处理
export async function ProductReduxServer(props: ProductReduxServerProps) {
  const { promise, slug } = props;
  try {
    const productData = await promise;
    if (productData?.slug !== slug) {
      permanentRedirect(`/products/${productData?.slug}`, RedirectType.replace);
    }
    return <ProductReduxClient productData={productData} />;
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // 调用 notFound() 会触发错误边界，最终在客户端上报
    notFound();
  }
}
```

### 5. 使用 captureStructuredError 或 domain 快捷函数

```typescript
import { captureProductError, BUSINESS_DOMAIN } from '@castlery/observability/server';

try {
  // 业务逻辑
} catch (error) {
  captureProductError(error, {
    extra: { feature: 'product-listing' }, // ✅ 添加业务上下文
  });
  // priority 和 severity 根据 domain 自动推断，无需手动设置
}
```

## 总结

- ✅ **所有错误**：通过 `captureStructuredError` / domain 快捷函数显式设置 `domain`，`priority` 自动推断
- ✅ **页面错误**（SSR/RSC/客户端）：`SentryContextProvider` 提供 `domain` 和 `page_type` 兜底
- ✅ **Server Actions**：`withServerActionInstrumentation` 的 `sentryContext.domain` 设置业务域
- ✅ **所有错误**：`beforeSend` 自动执行 `classifyErrorBucket`，添加 `error_bucket` 标签
- ✅ **Sentry Dashboard**：使用 Ownership Rules 根据 `domain` 标签自动分配给负责人
